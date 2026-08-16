import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('../risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('../logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn() },
}));

import {
  detectBetVelocityOutliers,
  detectMultiAccountIndicators,
  detectWinRateAnomalies,
  runFraudSignalScan,
} from '../fraud-detection';

const WINDOW_START = '2026-08-15T00:00:00.000Z';

describe('detectBetVelocityOutliers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps every returned row to a bet_velocity signal with banded evidence', async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        { user_id: 'user_a', bet_count: 47 },
        { user_id: 'user_b', bet_count: 130 },
      ],
      error: null,
    });

    const signals = await detectBetVelocityOutliers(WINDOW_START);

    expect(signals).toHaveLength(2);
    expect(signals[0]).toMatchObject({
      subjectUserId: 'user_a',
      signalType: 'bet_velocity',
      severity: 'low',
      windowStart: WINDOW_START,
    });
    expect(signals[0].evidence.betCountBand).toBe(40);
    expect(signals[1].severity).toBe('high');
  });

  it('returns no signals and does not throw when the RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const signals = await detectBetVelocityOutliers(WINDOW_START);
    expect(signals).toEqual([]);
  });

  it('produces identical evidence across repeated scans of the same window (dedup determinism)', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ user_id: 'user_a', bet_count: 47 }], error: null });
    const first = await detectBetVelocityOutliers(WINDOW_START);
    const second = await detectBetVelocityOutliers(WINDOW_START);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('detectMultiAccountIndicators', () => {
  beforeEach(() => vi.clearAllMocks());

  it('emits one signal per cluster member, excluding self from linkedUserIds', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ ip_hash: 'hash1', user_ids: ['user_a', 'user_b', 'user_c'], cluster_size: 3 }],
      error: null,
    });

    const signals = await detectMultiAccountIndicators(WINDOW_START);

    expect(signals).toHaveLength(3);
    const forUserA = signals.find((s) => s.subjectUserId === 'user_a');
    expect(forUserA?.signalType).toBe('multi_account_indicator');
    expect(forUserA?.evidence.linkedUserIds).toEqual(['user_b', 'user_c']);
    expect(forUserA?.evidence.clusterSize).toBe(3);
  });

  it('classifies severity by cluster size', async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          ip_hash: 'hash1',
          user_ids: Array.from({ length: 10 }, (_, i) => `u${i}`),
          cluster_size: 10,
        },
      ],
      error: null,
    });
    const signals = await detectMultiAccountIndicators(WINDOW_START);
    expect(signals[0].severity).toBe('high');
  });

  it('returns no signals when the RPC errors', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const signals = await detectMultiAccountIndicators(WINDOW_START);
    expect(signals).toEqual([]);
  });
});

describe('detectWinRateAnomalies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('flags a user whose RTP deviates significantly from the cohort', async () => {
    mocks.rpc.mockImplementation(async (fn: string, args: Record<string, unknown>) => {
      if (fn !== 'compute_cohort_win_rates') return { data: [], error: null };
      if (args.p_game !== 'dice') return { data: [], error: null };
      return {
        data: [
          {
            user_id: 'user_outlier',
            user_rtp: 2.5,
            cohort_mean: 1.0,
            cohort_stddev: 0.2,
            bet_count: 87,
          },
        ],
        error: null,
      };
    });

    const signals = await detectWinRateAnomalies(WINDOW_START);

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      subjectUserId: 'user_outlier',
      signalType: 'win_rate_anomaly',
      severity: 'high',
    });
    expect(signals[0].evidence.zScore).toBe(7.5);
  });

  it('ignores rows with zero cohort stddev and rows below the z threshold', async () => {
    mocks.rpc.mockImplementation(async (fn: string, args: Record<string, unknown>) => {
      if (fn !== 'compute_cohort_win_rates' || args.p_game !== 'slots')
        return { data: [], error: null };
      return {
        data: [
          {
            user_id: 'user_zero_stddev',
            user_rtp: 1.0,
            cohort_mean: 1.0,
            cohort_stddev: 0,
            bet_count: 60,
          },
          {
            user_id: 'user_normal',
            user_rtp: 1.02,
            cohort_mean: 1.0,
            cohort_stddev: 0.2,
            bet_count: 60,
          },
        ],
        error: null,
      };
    });

    const signals = await detectWinRateAnomalies(WINDOW_START);
    expect(signals).toEqual([]);
  });
});

describe('runFraudSignalScan', () => {
  beforeEach(() => vi.clearAllMocks());

  it('records every detected signal and summarizes successes and failures', async () => {
    mocks.rpc.mockImplementation(async (fn: string) => {
      if (fn === 'detect_bet_velocity_outliers') {
        return {
          data: [
            { user_id: 'user_a', bet_count: 40 },
            { user_id: 'user_b', bet_count: 41 },
          ],
          error: null,
        };
      }
      return { data: [], error: null };
    });
    mocks.recordRiskEventBestEffort.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const summary = await runFraudSignalScan();

    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(2);
    expect(summary.createdOrUpdated).toBe(1);
    expect(summary.partialFailures).toBe(1);
    expect(summary.bySignalType.bet_velocity).toBe(1);
  });
});
