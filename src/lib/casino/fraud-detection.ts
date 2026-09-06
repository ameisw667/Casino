import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { recordRiskEventBestEffort } from './risk-event-store';
import type { RiskEventInput, RiskSeverity } from './risk-signals';

// All thresholds are first-pass defaults pending calibration against historical bet data
// (matches R11 in worldmap/05_ZUKUNFTSPLANUNG.md's risk register) — not derived from a formal model.
// Exported so the realtime in-request counter (src/lib/security/bet-velocity-guard.ts,
// 06_1 L5) can share the exact same threshold/window instead of a drifting copy.
export const BET_VELOCITY_WINDOW_MINUTES = 10;
export const BET_VELOCITY_MIN_BETS = 30;
const MULTI_ACCOUNT_WINDOW_HOURS = 24;
const MULTI_ACCOUNT_MIN_CLUSTER = 3;
const MULTI_ACCOUNT_CLUSTER_MEDIUM = 5;
const MULTI_ACCOUNT_CLUSTER_HIGH = 10;
const WIN_RATE_WINDOW_HOURS = 24;
const WIN_RATE_MIN_BETS = 50;
const WIN_RATE_Z_LOW = 2;
const WIN_RATE_Z_MEDIUM = 3;
const WIN_RATE_Z_HIGH = 5;
const MAX_EVIDENCE_USER_IDS = 10;
const EVIDENCE_COUNT_BAND_STEP = 10;
const TRACKED_GAMES = ['blackjack', 'crash', 'dice', 'roulette', 'slots'] as const;

interface BetVelocityRow {
  user_id: string;
  bet_count: number;
}

interface MultiAccountRow {
  ip_hash: string;
  user_ids: string[];
  cluster_size: number;
}

interface CohortWinRateRow {
  user_id: string;
  // NULL when a user has zero winning transactions in the window (sum() over no rows) —
  // a real, expected case, not a data error.
  user_rtp: number | null;
  cohort_mean: number;
  cohort_stddev: number;
  bet_count: number;
}

export interface FraudScanSummary {
  createdOrUpdated: number;
  partialFailures: number;
  bySignalType: Record<string, number>;
}

// Fingerprints repeated same-day scans of the same condition into one dedup key so
// recordRiskEventBestEffort() bumps occurrences instead of inserting a new row each run
// (buildRiskEvent hashes the full evidence object, so exact volatile values must not appear).
function floorToUtcDayIso(now: Date): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

function bandCount(count: number, step: number): number {
  return Math.floor(count / step) * step;
}

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

function velocitySeverity(betCount: number): RiskSeverity {
  if (betCount >= BET_VELOCITY_MIN_BETS * 4) return 'high';
  if (betCount >= BET_VELOCITY_MIN_BETS * 2) return 'medium';
  return 'low';
}

function clusterSeverity(clusterSize: number): RiskSeverity {
  if (clusterSize >= MULTI_ACCOUNT_CLUSTER_HIGH) return 'high';
  if (clusterSize >= MULTI_ACCOUNT_CLUSTER_MEDIUM) return 'medium';
  return 'low';
}

function winRateSeverity(absZ: number): RiskSeverity {
  if (absZ >= WIN_RATE_Z_HIGH) return 'high';
  if (absZ >= WIN_RATE_Z_MEDIUM) return 'medium';
  return 'low';
}

export async function detectBetVelocityOutliers(windowStart: string): Promise<RiskEventInput[]> {
  const { data, error } = await createAdminClient().rpc('detect_bet_velocity_outliers', {
    p_window_minutes: BET_VELOCITY_WINDOW_MINUTES,
    p_min_bets: BET_VELOCITY_MIN_BETS,
  });
  if (error) {
    CasinoLogger.error('FraudDetection', 'Bet-velocity query failed', error);
    return [];
  }

  return ((data ?? []) as BetVelocityRow[]).map((row) => ({
    subjectUserId: row.user_id,
    signalType: 'bet_velocity',
    severity: velocitySeverity(row.bet_count),
    windowStart,
    evidence: {
      betCountBand: bandCount(row.bet_count, EVIDENCE_COUNT_BAND_STEP),
      windowMinutes: BET_VELOCITY_WINDOW_MINUTES,
    },
  }));
}

export async function detectMultiAccountIndicators(windowStart: string): Promise<RiskEventInput[]> {
  const { data, error } = await createAdminClient().rpc('detect_multi_account_clusters', {
    p_window_hours: MULTI_ACCOUNT_WINDOW_HOURS,
    p_min_cluster: MULTI_ACCOUNT_MIN_CLUSTER,
  });
  if (error) {
    CasinoLogger.error('FraudDetection', 'Multi-account query failed', error);
    return [];
  }

  return ((data ?? []) as MultiAccountRow[]).flatMap((row) => {
    const severity = clusterSeverity(row.cluster_size);
    return row.user_ids.map((subjectUserId) => {
      const others = row.user_ids.filter((id) => id !== subjectUserId);
      return {
        subjectUserId,
        signalType: 'multi_account_indicator' as const,
        severity,
        windowStart,
        evidence: {
          clusterSize: row.cluster_size,
          linkedUserIds: others.slice(0, MAX_EVIDENCE_USER_IDS),
          linkedUserIdsTruncated: others.length > MAX_EVIDENCE_USER_IDS,
        },
      };
    });
  });
}

export async function detectWinRateAnomalies(windowStart: string): Promise<RiskEventInput[]> {
  const admin = createAdminClient();
  const perGame = await Promise.all(
    TRACKED_GAMES.map(async (game) => {
      const { data, error } = await admin.rpc('compute_cohort_win_rates', {
        p_game: game,
        p_window_hours: WIN_RATE_WINDOW_HOURS,
        p_min_bets: WIN_RATE_MIN_BETS,
      });
      if (error) {
        CasinoLogger.error('FraudDetection', `Win-rate query failed for ${game}`, error);
        return [];
      }

      return ((data ?? []) as CohortWinRateRow[])
        .filter((row) => row.cohort_stddev > 0)
        .map((row) => ({ row, z: ((row.user_rtp ?? 0) - row.cohort_mean) / row.cohort_stddev }))
        .filter(({ z }) => Math.abs(z) >= WIN_RATE_Z_LOW)
        .map(({ row, z }) => ({
          subjectUserId: row.user_id,
          signalType: 'win_rate_anomaly' as const,
          severity: winRateSeverity(Math.abs(z)),
          windowStart,
          evidence: {
            game,
            zScore: roundToHalf(z),
            betCountBand: bandCount(row.bet_count, EVIDENCE_COUNT_BAND_STEP),
          },
        }));
    }),
  );

  return perGame.flat();
}

export async function runFraudSignalScan(): Promise<FraudScanSummary> {
  const windowStart = floorToUtcDayIso(new Date());
  const [velocity, multiAccount, winRate] = await Promise.all([
    detectBetVelocityOutliers(windowStart),
    detectMultiAccountIndicators(windowStart),
    detectWinRateAnomalies(windowStart),
  ]);

  const bySignalType: Record<string, number> = {};
  let createdOrUpdated = 0;
  let partialFailures = 0;

  for (const signal of [...velocity, ...multiAccount, ...winRate]) {
    const success = await recordRiskEventBestEffort(signal);
    if (success) {
      createdOrUpdated += 1;
      bySignalType[signal.signalType] = (bySignalType[signal.signalType] ?? 0) + 1;
    } else {
      partialFailures += 1;
    }
  }

  return { createdOrUpdated, partialFailures, bySignalType };
}
