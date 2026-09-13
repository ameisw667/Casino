import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc, from: mocks.from })),
}));
vi.mock('../risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('../logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn() },
}));

import {
  MULTI_ACCOUNT_MIN_CLUSTER,
  MULTI_ACCOUNT_WINDOW_HOURS,
  checkKnownClusterBeforeGrant,
  detectBetVelocityOutliers,
  detectMultiAccountIndicators,
  detectWinRateAnomalies,
  runFraudSignalScan,
} from '../fraud-detection';
import { buildRiskEvent } from '../risk-signals';

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

// 06_3 L5: threshold boundary tests. The SQL-side window boundary (24h filter on
// last_seen_at, plan scenario "10+ accounts over 24h but from two separate 12h windows")
// cannot be reproduced against a mocked RPC — it lives in detect_multi_account_clusters()
// (migration 030), which only counts fingerprints whose last_seen_at is inside
// p_window_hours. The TS contract for that scenario is the argument wiring asserted below.
// Manual (deliberately NOT automated) false-positive scenario "echtes Haushalts-WLAN":
// several real household members sharing one IPv4 produce cluster_size >= 3 with no abuse;
// classification is a human admin decision via the 06_3 L3 `suppressed` action — a unit
// test cannot simulate a real shared network, so there is no assertion for it.
describe('detectMultiAccountIndicators — 06_3 L5 thresholds and boundaries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the shared window/threshold constants to the RPC (SQL window boundary contract)', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    await detectMultiAccountIndicators(WINDOW_START);
    expect(mocks.rpc).toHaveBeenCalledWith('detect_multi_account_clusters', {
      p_window_hours: MULTI_ACCOUNT_WINDOW_HOURS,
      p_min_cluster: MULTI_ACCOUNT_MIN_CLUSTER,
    });
    expect(MULTI_ACCOUNT_WINDOW_HOURS).toBe(24);
    expect(MULTI_ACCOUNT_MIN_CLUSTER).toBe(3);
  });

  it('cluster of exactly 3 sits at the low-severity threshold, 2 is below the RPC floor', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ ip_hash: 'hash1', user_ids: ['u1', 'u2', 'u3'], cluster_size: 3 }],
      error: null,
    });
    const signals = await detectMultiAccountIndicators(WINDOW_START);
    expect(signals).toHaveLength(3);
    expect(signals[0].severity).toBe('low');
  });

  it('band boundaries: 4 low, 5 medium, 9 medium, 10 high', async () => {
    const sizes = [4, 5, 9, 10];
    const expected = ['low', 'medium', 'medium', 'high'];
    for (let i = 0; i < sizes.length; i += 1) {
      mocks.rpc.mockResolvedValue({
        data: [
          {
            ip_hash: 'hash1',
            user_ids: Array.from({ length: sizes[i] }, (_, j) => `u${j}`),
            cluster_size: sizes[i],
          },
        ],
        error: null,
      });
      const signals = await detectMultiAccountIndicators(WINDOW_START);
      expect(signals[0].severity).toBe(expected[i]);
    }
  });
});

// 06_3 L1: pre-grant cluster check — signal, never a block (Q1a).
describe('checkKnownClusterBeforeGrant', () => {
  beforeEach(() => vi.clearAllMocks());

  it('records a high-severity pre-grant signal when the user is in a known cluster', async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          ip_hash: 'hash1',
          user_ids: ['target', 'user_b', 'user_c'],
          cluster_size: 3,
        },
      ],
      error: null,
    });
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);

    const result = await checkKnownClusterBeforeGrant('target');

    expect(result).toEqual({ detected: true, clusterSize: 3 });
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    const signal = mocks.recordRiskEventBestEffort.mock.calls[0][0];
    expect(signal).toMatchObject({
      subjectUserId: 'target',
      signalType: 'multi_account_indicator',
      severity: 'high',
    });
    expect(signal.evidence.pre_grant_cluster_detected).toBe(true);
    expect(signal.evidence.linkedUserIds).toEqual(['user_b', 'user_c']);
  });

  it('records nothing when the user is not part of any cluster', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ ip_hash: 'hash1', user_ids: ['other1', 'other2', 'other3'], cluster_size: 3 }],
      error: null,
    });

    const result = await checkKnownClusterBeforeGrant('uninvolved');

    expect(result).toEqual({ detected: false, clusterSize: null });
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('fails open when the cluster RPC errors (never blocks a grant)', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const result = await checkKnownClusterBeforeGrant('target');

    expect(result).toEqual({ detected: false, clusterSize: null });
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
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

// 06_3 L3: suppressed clusters are skipped by fingerprint; a new cluster composition
// (different fingerprint) is still reported.
describe('runFraudSignalScan — 06_3 L3 suppression skip', () => {
  beforeEach(() => vi.clearAllMocks());

  function mockMultiAccountCluster(userIds: string[]): void {
    mocks.rpc.mockImplementation(async (fn: string) => {
      if (fn === 'detect_multi_account_clusters') {
        return {
          data: [{ ip_hash: 'hash1', user_ids: userIds, cluster_size: userIds.length }],
          error: null,
        };
      }
      return { data: [], error: null };
    });
  }

  function mockSuppressedLookup(fingerprints: string[]): void {
    mocks.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: fingerprints.map((fingerprint) => ({ fingerprint })),
        error: null,
      }),
    });
  }

  it('skips every member of a suppressed cluster but records a fresh fingerprint normally', async () => {
    mockMultiAccountCluster(['user_a', 'user_b', 'user_c']);
    // The scan derives its own UTC-day window — build the expected signals against the
    // same window so the fingerprints match what the scan will compute.
    const now = new Date();
    const scanWindow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ).toISOString();
    const buildSignal = (subjectUserId: string) => {
      const others = ['user_a', 'user_b', 'user_c'].filter((id) => id !== subjectUserId);
      return {
        subjectUserId,
        signalType: 'multi_account_indicator' as const,
        severity: 'low' as const,
        windowStart: scanWindow,
        evidence: { clusterSize: 3, linkedUserIds: others, linkedUserIdsTruncated: false },
      };
    };
    const suppressedFingerprints = ['user_a', 'user_b'].map((id) =>
      buildRiskEvent(buildSignal(id)).fingerprint,
    );
    mockSuppressedLookup(suppressedFingerprints);
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);

    const summary = await runFraudSignalScan();

    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    expect(mocks.recordRiskEventBestEffort.mock.calls[0][0].subjectUserId).toBe('user_c');
    expect(summary.bySignalType.multi_account_indicator).toBe(1);
  });

  it('fails open when the suppression lookup errors (all signals recorded)', async () => {
    mockMultiAccountCluster(['user_a', 'user_b', 'user_c']);
    mocks.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } }),
    });
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);

    const summary = await runFraudSignalScan();

    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(3);
    expect(summary.bySignalType.multi_account_indicator).toBe(3);
  });
});
