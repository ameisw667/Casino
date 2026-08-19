import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  error: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.error },
}));

import {
  createGuideActorHash,
  normalizeGuideUsage,
  recordGuideTelemetry,
} from '../guide-telemetry';

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('guide telemetry', () => {
  it('creates a stable versioned HMAC without retaining the raw actor id', () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '3';

    const actor = createGuideActorHash('player-42');

    expect(actor).toEqual({ hash: expect.stringMatching(/^[a-f0-9]{64}$/), version: 3 });
    expect(actor?.hash).not.toContain('player-42');
    expect(createGuideActorHash('player-42')).toEqual(actor);
  });

  it('requires a secret with at least 32 UTF-8 bytes, not merely 32 characters', () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '😀😀😀😀😀😀😀😀';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';

    expect(createGuideActorHash('player-42')).toEqual({
      hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      version: 1,
    });

    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '😀😀😀😀😀😀😀';
    expect(createGuideActorHash('player-42')).toBeNull();
  });

  it('changes the pseudonymous identity when the HMAC secret changes', () => {
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    const first = createGuideActorHash('player-42');

    process.env.GUIDE_TELEMETRY_HMAC_SECRET = 'fedcba9876543210fedcba9876543210';
    const second = createGuideActorHash('player-42');

    expect(first?.hash).not.toEqual(second?.hash);
  });

  it('rejects incomplete or unsafe provider usage instead of inventing token values', () => {
    expect(normalizeGuideUsage({ input_tokens: 9, output_tokens: 4, total_tokens: 13 })).toEqual({
      inputTokens: 9,
      cachedInputTokens: null,
      outputTokens: 4,
      reasoningTokens: null,
      totalTokens: 13,
    });
    expect(normalizeGuideUsage({ input_tokens: -1, output_tokens: 4, total_tokens: 3 })).toBeNull();
    expect(normalizeGuideUsage({ input_tokens: 9, output_tokens: 4 })).toBeNull();
  });

  it('records only a pseudonymous, text-free success event with a price snapshot', async () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    const upsert = vi.fn(async (_payload?: unknown) => ({ error: null }));
    mocks.from.mockReturnValue({ upsert });

    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'success',
        latencyMs: 120,
        model: 'gpt-5-mini',
        usage: {
          inputTokens: 1_000_000,
          cachedInputTokens: 0,
          outputTokens: 1_000_000,
          reasoningTokens: 0,
          totalTokens: 2_000_000,
        },
      }),
    ).resolves.toBe('recorded');

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        actor_hash_version: 1,
        outcome: 'success',
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
        estimated_cost_microusd: 2_250_000,
        pricing_version: 'gpt-5-mini-2026-08-12',
      }),
      {
        onConflict: 'actor_hash,actor_hash_version,outcome,rate_limit_window_started_at',
        ignoreDuplicates: true,
      },
    );
    expect(JSON.stringify((upsert.mock.calls[0] as unknown[] | undefined)?.[0])).not.toContain(
      'player-42',
    );
  });

  it('records correct telemetry and cost for gpt-4o-mini', async () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    const upsert = vi.fn(async (_payload?: unknown) => ({ error: null }));
    mocks.from.mockReturnValue({ upsert });

    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'success',
        latencyMs: 80,
        model: 'gpt-4o-mini',
        usage: {
          inputTokens: 1_000_000,
          cachedInputTokens: 0,
          outputTokens: 1_000_000,
          reasoningTokens: 0,
          totalTokens: 2_000_000,
        },
      }),
    ).resolves.toBe('recorded');

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        actor_hash_version: 1,
        outcome: 'success',
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
        estimated_cost_microusd: 750_000,
        pricing_version: 'gpt-4o-mini-2026-08-17',
      }),
      {
        onConflict: 'actor_hash,actor_hash_version,outcome,rate_limit_window_started_at',
        ignoreDuplicates: true,
      },
    );
  });

  it('skips safely when telemetry is not configured or its write fails', async () => {
    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'upstream',
        latencyMs: 5,
        model: 'gpt-5-mini',
        usage: null,
      }),
    ).resolves.toBe('skipped');

    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    mocks.from.mockReturnValue({
      upsert: vi.fn(async () => ({ error: new Error('database unavailable') })),
    });

    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'upstream',
        latencyMs: 5,
        model: 'gpt-5-mini',
        usage: null,
      }),
    ).resolves.toBe('skipped');
    expect(mocks.error).toHaveBeenCalledWith('GuideTelemetry', 'Guide telemetry write failed');
  });

  it('records each supported failure outcome without provider usage or cost data', async () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    const upsert = vi.fn(async (_payload?: unknown) => ({ error: null }));
    mocks.from.mockReturnValue({ upsert });

    for (const outcome of ['configuration', 'quota', 'upstream', 'invalid_response'] as const) {
      await expect(
        recordGuideTelemetry({
          actorId: 'player-42',
          outcome,
          latencyMs: 20,
          model: 'gpt-5-mini',
          usage: null,
        }),
      ).resolves.toBe('recorded');
    }

    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'rate_limited',
        latencyMs: 20,
        model: null,
        usage: null,
        rateLimitWindowStartedAt: new Date('2026-08-12T20:31:00.000Z'),
      }),
    ).resolves.toBe('recorded');

    for (const [payload] of upsert.mock.calls) {
      expect(payload).toEqual(
        expect.objectContaining({
          input_tokens: null,
          cached_input_tokens: null,
          output_tokens: null,
          reasoning_tokens: null,
          total_tokens: null,
          estimated_cost_microusd: null,
          pricing_version: null,
        }),
      );
    }
  });

  it('rejects invalid telemetry values and keeps an unknown price snapshot unset', async () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    const upsert = vi.fn(async () => ({ error: null }));
    mocks.from.mockReturnValue({ upsert });

    for (const latencyMs of [-1, Number.NaN, Number.POSITIVE_INFINITY, 120_001]) {
      await expect(
        recordGuideTelemetry({
          actorId: 'player-42',
          outcome: 'success',
          latencyMs,
          model: 'gpt-5-mini',
          usage: null,
        }),
      ).resolves.toBe('skipped');
    }

    await expect(
      recordGuideTelemetry({
        actorId: 'player-42',
        outcome: 'success',
        latencyMs: 20,
        model: 'future-model',
        usage: {
          inputTokens: 3,
          cachedInputTokens: 0,
          outputTokens: 2,
          reasoningTokens: null,
          totalTokens: 5,
        },
      }),
    ).resolves.toBe('recorded');

    expect(upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({ estimated_cost_microusd: null, pricing_version: null }),
      expect.any(Object),
    );
  });

  it('gives a delayed telemetry write at most 250 ms and never delays the guide path indefinitely', async () => {
    vi.useFakeTimers();
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    mocks.from.mockReturnValue({ upsert: vi.fn(() => new Promise(() => undefined)) });

    const pending = recordGuideTelemetry({
      actorId: 'player-42',
      outcome: 'upstream',
      latencyMs: 20,
      model: 'gpt-5-mini',
      usage: null,
    });
    await vi.advanceTimersByTimeAsync(249);
    await expect(Promise.race([pending, Promise.resolve('still-pending')])).resolves.toBe(
      'still-pending',
    );

    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toBe('skipped');
    expect(mocks.error).toHaveBeenCalledWith('GuideTelemetry', 'Guide telemetry write failed');
  });
});
