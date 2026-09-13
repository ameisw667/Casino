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

  it('uses the last XFF entry so a spoofed first entry cannot mint rate-limit buckets', () => {
    const request = new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '198.51.100.66, 203.0.113.5' },
    });
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

// 06_5 L3/L4/L5: identifier extraction edge cases — IPv6 /64 normalization, header
// fallbacks, and the de-shared no-IP fallback bucket.
describe('identifier extraction edge cases (06_5)', () => {
  function requestWithHeaders(headers: Record<string, string>): Request {
    return new Request('http://casino.test/api', { headers });
  }

  it('normalizes IPv6 addresses of the same /64 block into one bucket', () => {
    expect(getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '2001:db8:85a3:0:8a2e:370:7334' }))).toBe(
      'ip:2001:db8:85a3:0',
    );
    expect(getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '2001:db8:85a3:0:abcd:ef01:2345:6789' }))).toBe(
      'ip:2001:db8:85a3:0',
    );
  });

  it('keeps IPv6 addresses of different /64 blocks in separate buckets', () => {
    expect(getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '2001:db8:85a3:1::1' }))).not.toBe(
      getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '2001:db8:85a3:2::1' })),
    );
  });

  it('rate-limits two addresses of the same IPv6 /64 block together (06_5 L3 verification)', async () => {
    const first = new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '2001:db8:85a3:0::1' },
    });
    const second = new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '2001:db8:85a3:0::2' },
    });
    const idA = getClientIdentifier(first);
    const idB = getClientIdentifier(second);
    expect(idA).toBe(idB);
    for (let i = 0; i < 3; i += 1) {
      await enforceRateLimit(idA, 'ipv6-test', 3, 10);
    }
    expect((await enforceRateLimit(idB, 'ipv6-test', 3, 10)).success).toBe(false);
  });

  it('leaves IPv4 addresses unchanged', () => {
    expect(getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '203.0.113.5' }))).toBe(
      'ip:203.0.113.5',
    );
  });

  it('rate-limits IPv4-mapped IPv6 addresses on the embedded IPv4, not one collapsed bucket', () => {
    expect(
      getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '::ffff:203.0.113.9' })),
    ).toBe('ip:203.0.113.9');
  });

  it('falls back to x-real-ip when x-forwarded-for is empty after trim', () => {
    expect(
      getClientIdentifier(requestWithHeaders({ 'x-forwarded-for': '   ', 'x-real-ip': '198.51.100.7' })),
    ).toBe('ip:198.51.100.7');
  });

  it('uses x-real-ip when only that header is set', () => {
    expect(getClientIdentifier(requestWithHeaders({ 'x-real-ip': '198.51.100.9' }))).toBe(
      'ip:198.51.100.9',
    );
  });

  it('no longer shares one bucket across all header-less requests — different UA means different bucket (06_5 L4 verification)', async () => {
    const first = new Request('http://casino.test/api', {
      headers: { 'user-agent': 'browser-a' },
    });
    const second = new Request('http://casino.test/api', {
      headers: { 'user-agent': 'browser-b' },
    });
    expect(getClientIdentifier(first)).not.toBe(getClientIdentifier(second));
    for (let i = 0; i < 3; i += 1) {
      await enforceRateLimit(getClientIdentifier(first), 'no-ip-test', 3, 10);
    }
    expect((await enforceRateLimit(getClientIdentifier(second), 'no-ip-test', 3, 10)).success).toBe(
      true,
    );
  });
});

// 06_5 L1 verification: anonymous leaderboard callers are IP-bucketed individually —
// no more hardcoded `user:anon` shared bucket for every anonymous visitor.
describe('leaderboard anonymous identifier (06_5 L1)', () => {
  it('gives two anonymous visitors from different IPs independent rate-limit buckets', () => {
    const visitorA = getClientIdentifier(new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '203.0.113.10' },
    }));
    const visitorB = getClientIdentifier(new Request('http://casino.test/api', {
      headers: { 'x-forwarded-for': '203.0.113.11' },
    }));
    expect(visitorA).toBe('ip:203.0.113.10');
    expect(visitorB).toBe('ip:203.0.113.11');
    expect(visitorA).not.toBe(visitorB);
    expect(visitorA).not.toBe('user:anon');
  });
});
