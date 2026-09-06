import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RiskEventInput } from '@/lib/casino/risk-signals';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  recordRiskEventBestEffort: vi.fn<(input: RiskEventInput) => Promise<boolean>>(async () => true),
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(function redisStub() {
    return { incr: mocks.incr, expire: mocks.expire };
  }),
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));

import {
  BET_VELOCITY_WINDOW_SECONDS,
  BET_VELOCITY_THRESHOLD,
  recordBetPlacedBestEffort,
  resetLocalBetVelocityForTests,
} from '@/lib/security/bet-velocity-guard';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';

describe('recordBetPlacedBestEffort', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
    mocks.incr.mockResolvedValue(1);
    mocks.expire.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetLocalBetVelocityForTests();
  });

  it('increments a per-user counter with the same 10-minute window as the batch scan', async () => {
    await recordBetPlacedBestEffort('user-1');
    expect(mocks.incr).toHaveBeenCalledWith('casino:bet-velocity:user-1');
    expect(mocks.expire).toHaveBeenCalledWith(
      'casino:bet-velocity:user-1',
      BET_VELOCITY_WINDOW_SECONDS,
      'NX',
    );
  });

  it('does not record a signal below the batch-scan threshold', async () => {
    mocks.incr.mockResolvedValue(BET_VELOCITY_THRESHOLD - 1);
    await recordBetPlacedBestEffort('user-1');
    expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('records bet_velocity immediately at the threshold crossing (realtime, not batch)', async () => {
    mocks.incr.mockResolvedValue(BET_VELOCITY_THRESHOLD);
    await recordBetPlacedBestEffort('user-1');
    expect(recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    const firstCall = mocks.recordRiskEventBestEffort.mock.calls[0];
    const input = firstCall?.[0];
    expect(input?.subjectUserId).toBe('user-1');
    expect(input?.signalType).toBe('bet_velocity');
    expect(input?.severity).toBe('low');
    expect(input?.evidence).toEqual({
      source: 'realtime',
      windowMinutes: 10,
      threshold: BET_VELOCITY_THRESHOLD,
    });
  });

  it('keeps the fingerprint dedup-stable (UTC-day windowStart, no volatile bet count)', async () => {
    mocks.incr.mockResolvedValue(BET_VELOCITY_THRESHOLD);
    await recordBetPlacedBestEffort('user-1');
    await recordBetPlacedBestEffort('user-1');
    const calls = mocks.recordRiskEventBestEffort.mock.calls;
    expect(calls[0]?.[0]?.windowStart).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(JSON.stringify(calls[0]?.[0]?.evidence)).toBe(JSON.stringify(calls[1]?.[0]?.evidence));
  });

  it('keeps counters isolated per user', async () => {
    mocks.incr.mockResolvedValue(BET_VELOCITY_THRESHOLD);
    await recordBetPlacedBestEffort('user-1');
    await recordBetPlacedBestEffort('user-2');
    expect(mocks.incr).toHaveBeenNthCalledWith(1, 'casino:bet-velocity:user-1');
    expect(mocks.incr).toHaveBeenNthCalledWith(2, 'casino:bet-velocity:user-2');
  });

  it('fails open when the counter backend is unavailable (never touches the bet path)', async () => {
    mocks.incr.mockRejectedValue(new Error('redis down'));
    await expect(recordBetPlacedBestEffort('user-1')).resolves.toBeUndefined();
    expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('does not drop the threshold signal when only the TTL expire fails', async () => {
    mocks.incr.mockResolvedValue(BET_VELOCITY_THRESHOLD);
    mocks.expire.mockRejectedValue(new Error('expire rejected'));
    await expect(recordBetPlacedBestEffort('user-1')).resolves.toBeUndefined();
    expect(recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
  });

  it('fails open in production when Upstash is unconfigured (detection, not enforcement)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await expect(recordBetPlacedBestEffort('user-1')).resolves.toBeUndefined();
    expect(mocks.incr).not.toHaveBeenCalled();
    expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  describe('local dev counter (no Upstash configured)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it('records the signal at the threshold crossing', async () => {
      for (let i = 0; i < BET_VELOCITY_THRESHOLD - 1; i += 1) {
        await recordBetPlacedBestEffort('user-1');
      }
      expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
      await recordBetPlacedBestEffort('user-1');
      expect(mocks.recordRiskEventBestEffort.mock.calls[0]?.[0]?.signalType).toBe('bet_velocity');
    });
  });
});
