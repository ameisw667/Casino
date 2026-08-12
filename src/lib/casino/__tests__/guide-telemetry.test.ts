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
});
