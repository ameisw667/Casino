export interface HistoryRow {
  id: string;
  game: string | null;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

export interface ProfitPoint {
  time: string;
  cumulativeProfit: number;
}

export interface DailyActivity {
  date: string;
  spanMinutes: number;
  betCount: number;
}

export interface PerGameStat {
  game: string;
  bets: number;
  wins: number;
  wagered: number;
  payout: number;
  profit: number;
  winRate: number;
}

const MAX_SESSION_SPAN_MINUTES = 240;

/**
 * `/api/user/history` returns rows newest-first. Every row is a balance-changing
 * event (bet_settled is already net; CRASH/BLACKJACK split a bet across a
 * round_started debit + round_settled/round_action credit that net out the
 * same way) — see worldmap/05_1.7_USER_STATS_ANALYTICS.md Abschnitt 2 F4.
 * Summing `amount` in chronological order reconstructs the true profit curve.
 */
export function buildProfitSeries(rows: HistoryRow[]): ProfitPoint[] {
  const chronological = [...rows].reverse();
  let running = 0;
  return chronological.map((row) => {
    running += row.amount;
    return { time: row.created_at, cumulativeProfit: Math.round(running * 100) / 100 };
  });
}

function localDateKey(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD, stable sort key
}

/**
 * Session length has no real tracking (see F2/F3 in the plan) — this is an
 * explicit approximation: the span between the first and last bet timestamp
 * of a calendar day, capped so an idle tab left open overnight can't render
 * as an 18h "session". Bonus/purchase rows (game === null) are excluded so a
 * voucher redemption doesn't count as gameplay activity.
 */
export function buildDailyActivity(
  rows: HistoryRow[],
  maxSpanMinutes: number = MAX_SESSION_SPAN_MINUTES,
): DailyActivity[] {
  const byDay = new Map<string, { min: number; max: number; count: number }>();
  for (const row of rows) {
    if (row.game === null) continue;
    const key = localDateKey(row.created_at);
    const ts = new Date(row.created_at).getTime();
    if (Number.isNaN(ts)) continue;
    const existing = byDay.get(key);
    if (existing) {
      existing.min = Math.min(existing.min, ts);
      existing.max = Math.max(existing.max, ts);
      existing.count += 1;
    } else {
      byDay.set(key, { min: ts, max: ts, count: 1 });
    }
  }
  return Array.from(byDay.entries())
    .map(([date, { min, max, count }]) => ({
      date,
      spanMinutes: Math.min(maxSpanMinutes, Math.round((max - min) / 60000)),
      betCount: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** perGame arrives pre-sorted by wagered DESC from the RPC (migration 018). */
export function getFavoriteGame(perGame: PerGameStat[]): PerGameStat | null {
  return perGame.length > 0 ? perGame[0] : null;
}
