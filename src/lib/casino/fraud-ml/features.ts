// No 'server-only' import and no dependency on '@/utils/supabase/admin' — that file imports
// 'server-only', which throws unconditionally outside a Next.js webpack build (verified: it is
// not a browser-only guard, plain `tsx`/Node hits it too). This module is CLI-only by design
// (see worldmap/09_ML_FRAUD_ANOMALY.md), so the caller constructs and injects the Supabase
// client instead — same convention as scripts/economy-audit.ts.
import type { SupabaseClient } from '@supabase/supabase-js';
// CasinoLogger only imports '@sentry/nextjs' (no 'server-only' sentinel), verified safe to
// import from this CLI-only module (empirically confirmed via `npx tsx` outside the Next.js
// build context — see the console.error-migration in the Logger observability audit).
import { CasinoLogger } from '../logger';

const FEATURE_WINDOW_DAYS = 7;
const MIN_BETS_FOR_FEATURES = 20;

// Feature semantics were corrected in migration 044 (see its header comment): DICE/ROULETTE/
// SLOTS settle as one 'bet_settled' row per bet with a signed NET amount (payout - wager) — the
// original wager is not separately persisted, so "total wagered"/"average bet size" are not
// reconstructable. The feature set below uses only what settle_game_bet() actually stores.
export interface FraudMlFeatureRow {
  userId: string;
  betCount: number;
  netResult: number;
  avgAbsAmount: number;
  amountCv: number;
  winRate: number;
  interBetSecondsCv: number;
  uniqueGames: number;
}

interface FraudMlFeatureRpcRow {
  user_id: string;
  bet_count: number;
  net_result: number;
  avg_abs_amount: number;
  amount_cv: number;
  win_rate: number;
  inter_bet_seconds_cv: number;
  unique_games: number;
}

// Fixed key order for the feature vector fed into the isolation forest — must stay stable
// across runs, since a reordering would silently change which raw values land on which axis.
export const FEATURE_ORDER: ReadonlyArray<keyof Omit<FraudMlFeatureRow, 'userId'>> = [
  'betCount',
  'netResult',
  'avgAbsAmount',
  'amountCv',
  'winRate',
  'interBetSecondsCv',
  'uniqueGames',
];

export function toFeatureVector(row: FraudMlFeatureRow): number[] {
  return FEATURE_ORDER.map((key) => row[key]);
}

// PostgREST serializes NUMERIC columns as strings (precision-safe), not JS numbers, and any
// unexpected NULL/non-finite value must not silently corrupt the isolation forest's tree splits
// (raw Math.min/max/division downstream, no NaN guard of its own) — coerce and fall back to 0,
// same "validate at the boundary" rule this codebase applies elsewhere (e.g. wallet-contract.ts).
function toFiniteNumber(value: unknown): number {
  const coerced = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(coerced) ? coerced : 0;
}

function mapRpcRow(row: FraudMlFeatureRpcRow): FraudMlFeatureRow {
  return {
    userId: row.user_id,
    betCount: toFiniteNumber(row.bet_count),
    netResult: toFiniteNumber(row.net_result),
    avgAbsAmount: toFiniteNumber(row.avg_abs_amount),
    amountCv: toFiniteNumber(row.amount_cv),
    winRate: toFiniteNumber(row.win_rate),
    interBetSecondsCv: toFiniteNumber(row.inter_bet_seconds_cv),
    uniqueGames: toFiniteNumber(row.unique_games),
  };
}

export async function fetchFraudMlFeatures(client: SupabaseClient): Promise<FraudMlFeatureRow[]> {
  const { data, error } = await client.rpc('compute_fraud_ml_features', {
    p_window_days: FEATURE_WINDOW_DAYS,
    p_min_bets: MIN_BETS_FOR_FEATURES,
  });
  if (error) {
    CasinoLogger.error('FraudMl', 'Feature query failed', error);
    return [];
  }

  return ((data ?? []) as FraudMlFeatureRpcRow[]).map(mapRpcRow);
}
