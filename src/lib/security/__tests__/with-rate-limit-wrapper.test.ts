import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withRateLimit } from '@/lib/security/request-security';
import { apiErrorResponse } from '@/lib/api/response';
import { APP_ERROR_CODES } from '@/lib/security/form-errors';
import { resetLocalRateLimitsForTests } from '@/lib/security/request-security';

// 06_6 L4 (E6): the wrapper's reject shapes must stay byte-identical to the manual
// boilerplate the ~44 instrumented routes use (apiErrorResponse + rateLimitHeaders).
// Equivalence is asserted against apiErrorResponse built by hand — if the wrapper ever
// drifts from the manual pattern, routes migrating to it would silently change their
// error contract.

beforeEach(() => {
  resetLocalRateLimitsForTests();
});

afterEach(() => {
  resetLocalRateLimitsForTests();
  vi.unstubAllEnvs();
});

function request(ip: string): Request {
  return new Request('https://casino.test/api/test', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('withRateLimit success path', () => {
  it('passes the decision and the resolve data through to the handler', async () => {
    const handler = vi.fn(async (_request, context) => {
      return new Response(JSON.stringify({ saw: context.data.token, left: context.decision.remaining }), {
        headers: { 'content-type': 'application/json' },
      });
    });
    const wrapped = withRateLimit<{ token: string }>(handler, {
      scope: 'wrapper-success',
      limit: 5,
      windowSeconds: 60,
      resolve: async () => ({ identifier: 'user:wrapper-u1', data: { token: 'abc' } }),
    });

    const response = await wrapped(request('203.0.113.1'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ saw: 'abc', left: 4 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('buckets by IP via getClientIdentifier when no resolve hook is given', async () => {
    const wrapped = withRateLimit(
      async () => new Response('ok'),
      { scope: 'wrapper-default', limit: 1, windowSeconds: 60 },
    );

    expect((await wrapped(request('203.0.113.2'))).status).toBe(200);
    expect((await wrapped(request('203.0.113.3'))).status).toBe(200);
    const secondFromSameIp = await wrapped(request('203.0.113.2'));
    expect(secondFromSameIp.status).toBe(429);
  });
});

describe('withRateLimit reject shapes (equivalence with manual boilerplate)', () => {
  it('429 body and headers match apiErrorResponse(APP_ERROR_CODES.RATE_LIMITED, ...) exactly', async () => {
    const wrapped = withRateLimit(
      async () => new Response('ok'),
      { scope: 'wrapper-429', limit: 1, windowSeconds: 60 },
    );
    await wrapped(request('203.0.113.4'));
    const rejected = await wrapped(request('203.0.113.4'));

    const manual = apiErrorResponse(
      APP_ERROR_CODES.RATE_LIMITED,
      'Too many requests. Please try again shortly.',
      429,
    );

    expect(rejected.status).toBe(429);
    expect(await rejected.json()).toEqual(await manual.json());
    expect(rejected.headers.get('X-RateLimit-Limit')).toBe('1');
    expect(rejected.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(rejected.headers.get('Retry-After')).toBeTruthy();
  });

  it('503 fail-closed body matches apiErrorResponse(APP_ERROR_CODES.SERVICE_UNAVAILABLE, ...) exactly', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'http://127.0.0.1:9');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'unreachable');
    const wrapped = withRateLimit(
      async () => new Response('ok'),
      { scope: 'wrapper-503', limit: 5, windowSeconds: 60 },
    );

    const rejected = await wrapped(request('203.0.113.5'));

    const manual = apiErrorResponse(
      APP_ERROR_CODES.SERVICE_UNAVAILABLE,
      'Rate limit service temporarily unavailable.',
      503,
    );
    expect(rejected.status).toBe(503);
    expect(await rejected.json()).toEqual(await manual.json());
  });
});

describe('withRateLimit resolve hook (early response path)', () => {
  it('returns the earlyResponse as-is and never invokes the handler', async () => {
    const handler = vi.fn(async () => new Response('ok'));
    const early = new Response('unauthorized', { status: 401 });
    const wrapped = withRateLimit(handler, {
      scope: 'wrapper-early',
      limit: 5,
      windowSeconds: 60,
      resolve: async () => ({ earlyResponse: early }),
    });

    const response = await wrapped(request('203.0.113.6'));

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('unauthorized');
    expect(handler).not.toHaveBeenCalled();
  });
});