import { afterEach, describe, expect, it } from 'vitest';
import {
  enforceRateLimit,
  getClientIdentifier,
  resetLocalRateLimitsForTests,
  validateMutationOrigin,
} from '../request-security';

afterEach(() => resetLocalRateLimitsForTests());

describe('request security', () => {
  it('uses authenticated user identity before proxy IP', () => {
    const request = new Request('http://casino.test/api', { headers: { 'x-forwarded-for': '203.0.113.5' } });
    expect(getClientIdentifier(request, 'user_123')).toBe('user:user_123');
    expect(getClientIdentifier(request)).toBe('ip:203.0.113.5');
  });

  it('compares parsed origin and host exactly', () => {
    expect(validateMutationOrigin(new Request('http://casino.test/api', {
      method: 'POST', headers: { origin: 'http://casino.test', host: 'casino.test' },
    }))).toBeNull();
    expect(validateMutationOrigin(new Request('http://casino.test/api', {
      method: 'POST', headers: { origin: 'http://casino.test.evil.example', host: 'casino.test' },
    }))?.status).toBe(403);
  });

  it('enforces the development in-memory fallback', async () => {
    const previous = process.env.NODE_ENV;
    Object.assign(process.env, { NODE_ENV: 'test' });
    expect((await enforceRateLimit('user:test', 'bet', 1, 10)).success).toBe(true);
    expect((await enforceRateLimit('user:test', 'bet', 1, 10)).success).toBe(false);
    Object.assign(process.env, { NODE_ENV: previous });
  });
});
