import { afterEach, describe, expect, it, vi } from 'vitest';

const { captureMessage } = vi.hoisted(() => ({ captureMessage: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ captureMessage }));

import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  resetLocalRateLimitsForTests,
  resolveDevFallbackUserId,
  validateMutationOrigin,
} from '../request-security';

afterEach(() => {
  resetLocalRateLimitsForTests();
  captureMessage.mockReset();
});

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

  it('reports a Sentry event when the rate limiter is unavailable and fails closed', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    try {
      const decision = await enforceRateLimit('user:test', 'casino-bet', 30, 10);
      expect(decision.unavailable).toBe(true);
      expect(captureMessage).toHaveBeenCalledWith(
        'Rate limiter unavailable, failing closed',
        expect.objectContaining({ level: 'error', tags: { scope: 'casino-bet' } }),
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('generates correct rate limit headers on failure', async () => {
    const decision = { success: false, limit: 60, remaining: 0, reset: Date.now() + 5000 };
    const headers = rateLimitHeaders(decision) as Record<string, string>;
    expect(headers['X-RateLimit-Limit']).toBe('60');
    expect(headers['X-RateLimit-Remaining']).toBe('0');
    expect(headers['Retry-After']).toBeDefined();
  });

  describe('resolveDevFallbackUserId (worldmap/05_Observability_und_Lasttest.md, L4)', () => {
    afterEach(() => vi.unstubAllEnvs());

    function req(headers: Record<string, string> = {}) {
      return new Request('http://casino.test/api', { headers });
    }

    it('falls back to dev_user_fallback without a loadtest header', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'true');
      expect(resolveDevFallbackUserId(req(), false)).toBe('dev_user_fallback');
    });

    it('prefixes a valid loadtest header into a distinct synthetic userId', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'true');
      expect(resolveDevFallbackUserId(req({ 'x-loadtest-user-id': 'vu-7' }), false)).toBe(
        'loadtest_vu-7',
      );
    });

    it('never applies outside development, regardless of the header', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'true');
      expect(resolveDevFallbackUserId(req({ 'x-loadtest-user-id': 'vu-7' }), false)).toBeNull();
    });

    it('never applies without ALLOW_DEV_FALLBACK=true, regardless of the header', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'false');
      expect(resolveDevFallbackUserId(req({ 'x-loadtest-user-id': 'vu-7' }), false)).toBeNull();
    });

    it('never applies when the request carries the signed-out cookie', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'true');
      expect(resolveDevFallbackUserId(req({ 'x-loadtest-user-id': 'vu-7' }), true)).toBeNull();
    });

    it('ignores an invalid header value and falls back to dev_user_fallback instead of throwing', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ALLOW_DEV_FALLBACK', 'true');
      expect(
        resolveDevFallbackUserId(
          req({ 'x-loadtest-user-id': '../../etc/passwd; DROP TABLE users' }),
          false,
        ),
      ).toBe('dev_user_fallback');
    });
  });
});
