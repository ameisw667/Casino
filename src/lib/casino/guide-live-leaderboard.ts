import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';

const CACHE_TTL_MS = 5 * 60 * 1000;
const FAILURE_BACKOFF_MS = 30 * 1000;
const RPC_TIMEOUT_MS = 1_500;
const MAX_ROWS = 5;
const MAX_USERNAME_LENGTH = 20;

export type GuideLeaderboardRow = {
  username: string;
  level: number;
  rank: string;
  totalWagered: number;
};

export type GuideLeaderboardSnippet = {
  asOf: string;
  rows: GuideLeaderboardRow[];
};

let cachedSnippet: GuideLeaderboardSnippet | null = null;
let cacheTimestamp = 0;
let failedUntil = 0;

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Only username/level/rank/total_wagered ever leave this function — any other
 * field on the RPC row (email, user id, balance, bet history, ...) is dropped
 * even if present, so the guide payload can never carry more than the existing
 * public /api/leaderboard already exposes.
 */
function normalizeRows(data: unknown): GuideLeaderboardRow[] | null {
  if (!Array.isArray(data)) return null;

  const rows: GuideLeaderboardRow[] = [];
  for (const raw of data) {
    if (rows.length >= MAX_ROWS) break;
    if (typeof raw !== 'object' || raw === null) continue;

    const row = raw as Record<string, unknown>;
    const username = typeof row.username === 'string' ? row.username.trim() : '';
    const rank = row.rank;

    if (
      !username ||
      !isFiniteNonNegative(row.level) ||
      typeof rank !== 'string' ||
      !rank ||
      !isFiniteNonNegative(row.total_wagered)
    ) {
      continue;
    }

    rows.push({
      username: username.slice(0, MAX_USERNAME_LENGTH),
      level: row.level,
      rank,
      totalWagered: row.total_wagered,
    });
  }

  return rows.length > 0 ? rows : null;
}

async function fetchSnippet(): Promise<GuideLeaderboardSnippet | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .rpc('get_leaderboard')
      .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS));
    if (error) return null;

    const rows = normalizeRows(data);
    return rows ? { asOf: new Date().toISOString(), rows } : null;
  } catch {
    return null;
  }
}

/**
 * Read-through 5-minute in-memory cache over the existing, already-public
 * get_leaderboard RPC (no new database object). Fails open to the last good
 * snippet (still correctly labelled with its own asOf) on a fresh fetch
 * failure, and to null when there has never been a good snippet — the guide
 * then answers from static facts only, never invents leaderboard numbers.
 * A 30s failure backoff stops a degraded RPC from being hit on every guide
 * request once the 5-minute cache goes stale.
 */
export async function loadGuideLeaderboardSnippet(): Promise<GuideLeaderboardSnippet | null> {
  const now = Date.now();
  if (cachedSnippet && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSnippet;
  }
  if (now < failedUntil) {
    return cachedSnippet;
  }

  const snippet = await fetchSnippet();
  if (snippet) {
    cachedSnippet = snippet;
    cacheTimestamp = now;
    failedUntil = 0;
    return snippet;
  }

  failedUntil = now + FAILURE_BACKOFF_MS;
  return cachedSnippet;
}

export function resetGuideLeaderboardCacheForTests(): void {
  cachedSnippet = null;
  cacheTimestamp = 0;
  failedUntil = 0;
}
