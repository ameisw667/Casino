import { describe, expect, it } from 'vitest';
import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import { scrubSentryEvent } from '../sentry-scrub';

const hint: EventHint = {};

function baseEvent(overrides: Partial<ErrorEvent>): ErrorEvent {
  return {
    type: undefined,
    message: 'Server-authoritative settlement failed',
    level: 'error',
    tags: { module: 'API/Casino/Bet', request_id: '11111111-1111-1111-1111-111111111111' },
    ...overrides,
  };
}

describe('scrubSentryEvent', () => {
  it('removes the entire request.headers and request.cookies objects', () => {
    const event = baseEvent({
      request: {
        url: 'https://casino.example.com/api/casino/bet',
        headers: { authorization: 'Bearer secret-jwt', 'user-agent': 'vitest' },
        cookies: { 'sb-access-token': 'raw-cookie-value' },
      },
    });

    const scrubbed = scrubSentryEvent(event, hint);

    expect(scrubbed.request?.headers).toBeUndefined();
    expect(scrubbed.request?.cookies).toBeUndefined();
    expect(scrubbed.request?.url).toBe('https://casino.example.com/api/casino/bet');
  });

  it('strips user.email and user.ip_address but keeps user.id', () => {
    const event = baseEvent({
      user: {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'jan@example.com',
        ip_address: '1.2.3.4',
      },
    });

    const scrubbed = scrubSentryEvent(event, hint);

    expect(scrubbed.user?.id).toBe('22222222-2222-2222-2222-222222222222');
    expect(scrubbed.user?.email).toBeUndefined();
    expect(scrubbed.user?.ip_address).toBeUndefined();
  });

  it('redacts a raw serverSeed value nested anywhere in extra', () => {
    const event = baseEvent({
      extra: {
        roundState: {
          serverSeed: 'a1b2c3-raw-seed-must-never-leak',
          serverSeedHash: 'sha256:abc123',
        },
      },
    });

    const scrubbed = scrubSentryEvent(event, hint);
    const roundState = scrubbed.extra?.roundState as Record<string, unknown>;

    expect(roundState.serverSeed).toBe('[Redacted]');
    expect(roundState.serverSeedHash).toBe('sha256:abc123');
  });

  it('redacts known secret-shaped keys in contexts regardless of nesting depth', () => {
    const event = baseEvent({
      contexts: {
        env: {
          nested: {
            SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_should_not_leak',
            OPENAI_API_KEY: 'sk-proj-should-not-leak',
            UPSTASH_REDIS_REST_TOKEN: 'token-should-not-leak',
          },
        },
      },
    });

    const scrubbed = scrubSentryEvent(event, hint);
    const nested = (scrubbed.contexts?.env as Record<string, unknown>).nested as Record<
      string,
      unknown
    >;

    expect(nested.SUPABASE_SERVICE_ROLE_KEY).toBe('[Redacted]');
    expect(nested.OPENAI_API_KEY).toBe('[Redacted]');
    expect(nested.UPSTASH_REDIS_REST_TOKEN).toBe('[Redacted]');
  });

  it('redacts sensitive keys inside breadcrumb data', () => {
    const event = baseEvent({
      breadcrumbs: [
        {
          category: 'fetch',
          data: { password: 'should-not-leak', statusCode: 500 },
        },
      ],
    });

    const scrubbed = scrubSentryEvent(event, hint);

    expect(scrubbed.breadcrumbs?.[0].data?.password).toBe('[Redacted]');
    expect(scrubbed.breadcrumbs?.[0].data?.statusCode).toBe(500);
  });

  it('leaves non-sensitive fields (message, tags, level) unchanged', () => {
    const event = baseEvent({});

    const scrubbed = scrubSentryEvent(event, hint);

    expect(scrubbed.message).toBe('Server-authoritative settlement failed');
    expect(scrubbed.level).toBe('error');
    expect(scrubbed.tags).toEqual({
      module: 'API/Casino/Bet',
      request_id: '11111111-1111-1111-1111-111111111111',
    });
  });

  it('does not throw on an event with no request/user/extra/contexts/breadcrumbs', () => {
    const event = baseEvent({});

    expect(() => scrubSentryEvent(event, hint)).not.toThrow();
  });
});
