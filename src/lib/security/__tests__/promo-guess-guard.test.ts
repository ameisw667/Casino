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
  PROMO_GUESS_FAILURE_THRESHOLD,
  PROMO_GUESS_WINDOW_SECONDS,
  recordPromoGuessFailure,
  resetLocalPromoGuessesForTests,
} from '@/lib/security/promo-guess-guard';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';

describe('recordPromoGuessFailure', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token');
    mocks.incr.mockResolvedValue(1);
    mocks.expire.mockResolvedValue(1);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    resetLocalPromoGuessesForTests();
  });

  it('increments a per-code counter with the fixed sliding-off TTL (NX)', async () => {
    await recordPromoGuessFailure('user-1', 'WELCOME8');
    expect(mocks.incr).toHaveBeenCalledWith('casino:promo-guess:WELCOME8');
    expect(mocks.expire).toHaveBeenCalledWith(
      'casino:promo-guess:WELCOME8',
      PROMO_GUESS_WINDOW_SECONDS,
      'NX',
    );
  });

  it('does not record a signal below the threshold', async () => {
    mocks.incr.mockResolvedValue(PROMO_GUESS_FAILURE_THRESHOLD - 1);
    await recordPromoGuessFailure('user-1', 'WELCOME8');
    expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('records voucher_velocity once at the threshold crossing, attributed to the redeeming user', async () => {
    mocks.incr.mockResolvedValue(PROMO_GUESS_FAILURE_THRESHOLD);
    await recordPromoGuessFailure('user-1', 'WELCOME8');
    expect(recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    const firstCall = mocks.recordRiskEventBestEffort.mock.calls[0];
    const input = firstCall?.[0];
    expect(input).toBeDefined();
    expect(input?.subjectUserId).toBe('user-1');
    expect(input?.signalType).toBe('voucher_velocity');
    expect(input?.severity).toBe('medium');
    expect(input?.evidence).toEqual({
      outcome: 'guess_threshold',
      scope: 'wallet-redeem',
      threshold: PROMO_GUESS_FAILURE_THRESHOLD,
      code: 'WELCOME8',
    });
  });

  it('keeps the fingerprint dedup-stable (UTC-day windowStart, no volatile attempt count)', async () => {
    mocks.incr.mockResolvedValue(PROMO_GUESS_FAILURE_THRESHOLD);
    await recordPromoGuessFailure('user-1', 'WELCOME8');
    await recordPromoGuessFailure('user-1', 'WELCOME8');
    const calls = mocks.recordRiskEventBestEffort.mock.calls;
    const call0 = calls[0]?.[0];
    const call1 = calls[1]?.[0];
    expect(call0?.windowStart).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(JSON.stringify(call0?.evidence)).toBe(JSON.stringify(call1?.evidence));
  });

  it('is keyed per code, so guessing different codes counts independently', async () => {
    mocks.incr.mockResolvedValue(PROMO_GUESS_FAILURE_THRESHOLD);
    await recordPromoGuessFailure('user-1', 'CODEAAA1');
    await recordPromoGuessFailure('user-1', 'CODEBBB2');
    expect(mocks.incr).toHaveBeenNthCalledWith(1, 'casino:promo-guess:CODEAAA1');
    expect(mocks.incr).toHaveBeenNthCalledWith(2, 'casino:promo-guess:CODEBBB2');
  });

  it('fails open when the counter backend is unavailable (redemption itself must not be affected)', async () => {
    mocks.incr.mockRejectedValue(new Error('redis down'));
    await expect(recordPromoGuessFailure('user-1', 'WELCOME8')).resolves.toBeUndefined();
    expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('does not drop the threshold signal when only the TTL expire fails', async () => {
    mocks.incr.mockResolvedValue(PROMO_GUESS_FAILURE_THRESHOLD);
    mocks.expire.mockRejectedValue(new Error('expire rejected'));
    await expect(recordPromoGuessFailure('user-1', 'WELCOME8')).resolves.toBeUndefined();
    expect(recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
  });

  it('fails open in production when Upstash is unconfigured (detection, not enforcement)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await expect(recordPromoGuessFailure('user-1', 'WELCOME8')).resolves.toBeUndefined();
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
      for (let i = 0; i < PROMO_GUESS_FAILURE_THRESHOLD - 1; i += 1) {
        await recordPromoGuessFailure('user-1', 'WELCOME8');
      }
      expect(recordRiskEventBestEffort).not.toHaveBeenCalled();
      await recordPromoGuessFailure('user-1', 'WELCOME8');
      expect(mocks.recordRiskEventBestEffort.mock.calls[0]?.[0]?.signalType).toBe(
        'voucher_velocity',
      );
    });
  });
});
