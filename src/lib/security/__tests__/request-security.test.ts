import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  resetLocalRateLimitsForTests,
  validateMutationOrigin,
} from '../request-security';

afterEach(() => resetLocalRateLimitsForTests());

describe('request security', () => {
  it('uses authenticated user identity before proxy IP', () => {
    const request = new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '203.0.113.5' },
    });
    expect(getClientIdentifier(request, 'user_123')).toBe('user:user_123');
    expect(getClientIdentifier(request)).toBe('ip:203.0.113.5');
  });

  it('compares parsed origin and host exactly', () => {
    expect(
      validateMutationOrigin(
        new Request('http://casino.test/api', {
          method: 'POST',
          headers: { origin: 'http://casino.test', host: 'casino.test' },
        }),
      ),
    ).toBeNull();
    expect(
      validateMutationOrigin(
        new Request('http://casino.test/api', {
          method: 'POST',
          headers: { origin: 'http://casino.test.evil.example', host: 'casino.test' },
        }),
      )?.status,
    ).toBe(403);
  });

  it('fails closed in production when APP_ORIGINS is not configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APP_ORIGINS', '');

    try {
      expect(
        validateMutationOrigin(
          new Request('https://casino.test/api', {
            method: 'POST',
            headers: { origin: 'https://casino.test' },
          }),
        )?.status,
      ).toBe(403);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('enforces the development in-memory fallback', async () => {
    const previous = process.env.NODE_ENV;
    Object.assign(process.env, { NODE_ENV: 'test' });
    expect((await enforceRateLimit('user:test', 'bet', 1, 10)).success).toBe(true);
    expect((await enforceRateLimit('user:test', 'bet', 1, 10)).success).toBe(false);
    Object.assign(process.env, { NODE_ENV: previous });
  });

  it('generates correct rate limit headers on failure', async () => {
    const decision = { success: false, limit: 60, remaining: 0, reset: Date.now() + 5000 };
    const headers = rateLimitHeaders(decision) as Record<string, string>;
    expect(headers['X-RateLimit-Limit']).toBe('60');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });
});
