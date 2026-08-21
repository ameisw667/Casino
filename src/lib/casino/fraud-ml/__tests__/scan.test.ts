import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { runFraudMlScan } from '../scan';
import type { FraudMlFeatureRow } from '../features';

function makeRow(overrides: Partial<FraudMlFeatureRow>): {
  user_id: string;
  bet_count: number;
  total_wagered: number;
  avg_bet_size: number;
  bet_size_cv: number;
  rtp: number;
  inter_bet_seconds_cv: number;
  unique_games: number;
} {
  const row: FraudMlFeatureRow = {
    userId: 'user',
    betCount: 40,
    totalWagered: 500,
    avgBetSize: 12.5,
    betSizeCv: 0.2,
    rtp: 0.96,
    interBetSecondsCv: 0.3,
    uniqueGames: 2,
    ...overrides,
  };
  return {
    user_id: row.userId,
    bet_count: row.betCount,
    total_wagered: row.totalWagered,
    avg_bet_size: row.avgBetSize,
    bet_size_cv: row.betSizeCv,
    rtp: row.rtp,
    inter_bet_seconds_cv: row.interBetSecondsCv,
    unique_games: row.uniqueGames,
  };
}

function makeClient(featureRows: unknown[]): {
  client: SupabaseClient;
  recordCalls: { p_subject_user_id: string; p_signal_type: string; p_evidence: unknown }[];
} {
  const recordCalls: { p_subject_user_id: string; p_signal_type: string; p_evidence: unknown }[] =
    [];
  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    if (fn === 'compute_fraud_ml_features') {
      return { data: featureRows, error: null };
    }
    if (fn === 'record_risk_event') {
      recordCalls.push(
        args as { p_subject_user_id: string; p_signal_type: string; p_evidence: unknown },
      );
      return { data: { id: 'evt', status: 'open', occurrences: 1, replayed: false }, error: null };
    }
    throw new Error(`Unexpected RPC: ${fn}`);
  });
  return { client: { rpc } as unknown as SupabaseClient, recordCalls };
}

describe('runFraudMlScan', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-21T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips the scan and records nothing below the minimum user threshold', async () => {
    const { client, recordCalls } = makeClient([makeRow({ userId: 'a' }), makeRow({ userId: 'b' })]);

    const summary = await runFraudMlScan(client);

    expect(summary.usersScored).toBe(0);
    expect(summary.eventsRecorded).toBe(0);
    expect(summary.skippedReason).toContain('Only 2 user(s)');
    expect(recordCalls).toHaveLength(0);
  });

  it('flags a clear multivariate outlier among enough users and records an ml_anomaly_score event', async () => {
    const cluster = Array.from({ length: 8 }, (_, i) =>
      makeRow({ userId: `cluster_${i}`, betCount: 40 + i, avgBetSize: 12 + i * 0.1 }),
    );
    const outlier = makeRow({
      userId: 'outlier',
      betCount: 900,
      totalWagered: 90000,
      avgBetSize: 1200,
      betSizeCv: 4,
      interBetSecondsCv: 0.01,
    });
    const { client, recordCalls } = makeClient([...cluster, outlier]);

    const summary = await runFraudMlScan(client);

    expect(summary.usersScored).toBe(9);
    expect(recordCalls.length).toBeGreaterThan(0);

    const outlierCall = recordCalls.find((call) => call.p_subject_user_id === 'outlier');
    expect(outlierCall).toBeDefined();
    expect(outlierCall!.p_signal_type).toBe('ml_anomaly_score');
    const evidence = outlierCall!.p_evidence as { anomalyScoreBand: number; betCountBand: number };
    expect(evidence.anomalyScoreBand).toBeGreaterThanOrEqual(0.5);
    expect(evidence.betCountBand).toBe(900);
  });

  it('produces identical evidence across repeated same-day scans (dedup determinism)', async () => {
    const cluster = Array.from({ length: 8 }, (_, i) => makeRow({ userId: `cluster_${i}` }));
    const outlier = makeRow({ userId: 'outlier', betCount: 900, avgBetSize: 1200, betSizeCv: 4 });

    const first = makeClient([...cluster, outlier]);
    await runFraudMlScan(first.client);

    const second = makeClient([...cluster, outlier]);
    await runFraudMlScan(second.client);

    expect(JSON.stringify(second.recordCalls)).toBe(JSON.stringify(first.recordCalls));
  });
});
