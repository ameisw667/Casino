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

export interface VipRecords {
  maxSingleWin: { amount: number; game: string | null; date: string };
  maxMultiplier: { multiplier: number; game: string | null };
  longestWinStreak: number;
  luckIndex: number; // e.g. 102.4%
}

export interface DailyPnlCell {
  date: string;
  dayLabel: string;
  profit: number;
  count: number;
  wagered: number;
}

export function deriveStatsFromRows(rows: HistoryRow[]): {
  totalWagered: number;
  totalProfit: number;
  winRate: number;
  totalBets: number;
  perGame: PerGameStat[];
} {
  let totalWagered = 0;
  let totalProfit = 0;
  let winCount = 0;
  const gameMap = new Map<
    string,
    { bets: number; wins: number; wagered: number; payout: number; profit: number }
  >();

  for (const row of rows) {
    const isBet = row.game !== null;
    const isWin = row.amount > 0;
    const isLoss = row.amount < 0;

    totalProfit += row.amount;
    if (isLoss) {
      totalWagered += Math.abs(row.amount);
    }
    if (isWin) {
      winCount += 1;
    }

    if (isBet && row.game) {
      const gKey = row.game.toLowerCase();
      const existing = gameMap.get(gKey) || { bets: 0, wins: 0, wagered: 0, payout: 0, profit: 0 };
      existing.bets += 1;
      if (isWin) {
        existing.wins += 1;
        existing.payout += row.amount;
      }
      if (isLoss) {
        existing.wagered += Math.abs(row.amount);
      }
      existing.profit += row.amount;
      gameMap.set(gKey, existing);
    }
  }

  const totalBets = rows.length;
  const winRate = totalBets > 0 ? (winCount / totalBets) * 100 : 0;

  const perGame: PerGameStat[] = Array.from(gameMap.entries())
    .map(([game, data]) => ({
      game,
      bets: data.bets,
      wins: data.wins,
      wagered: data.wagered,
      payout: data.payout,
      profit: data.profit,
      winRate: data.bets > 0 ? (data.wins / data.bets) * 100 : 0,
    }))
    .sort((a, b) => b.wagered - a.wagered);

  return {
    totalWagered: Math.round(totalWagered * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    totalBets,
    perGame,
  };
}

export function deriveVipRecords(rows: HistoryRow[]): VipRecords {
  let maxWinAmount = 0;
  let maxWinGame: string | null = null;
  let maxWinDate = '';
  let maxMult = 1.0;
  let maxMultGame: string | null = null;

  let currentStreak = 0;
  let longestStreak = 0;
  let totalWagered = 0;
  let totalPayout = 0;

  // Evaluate chronological order
  const chronological = [...rows].reverse();

  for (const r of chronological) {
    if (r.amount > 0) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      if (r.amount > maxWinAmount) {
        maxWinAmount = r.amount;
        maxWinGame = r.game;
        maxWinDate = r.created_at;
      }
      // Approximate multiplier: (profit / 10) + 1 or ratio
      const mult = r.amount / 10 + 1;
      if (mult > maxMult) {
        maxMult = mult;
        maxMultGame = r.game;
      }
      totalPayout += r.amount;
    } else if (r.amount < 0) {
      currentStreak = 0;
      totalWagered += Math.abs(r.amount);
    }
  }

  // Luck index: Actual payout / (totalWagered * 0.99)
  const expectedPayout = totalWagered * 0.992;
  const luckIndex =
    expectedPayout > 0 ? Math.round((totalPayout / expectedPayout) * 1000) / 10 : 100.0;

  return {
    maxSingleWin: { amount: maxWinAmount, game: maxWinGame, date: maxWinDate },
    maxMultiplier: {
      multiplier: Math.max(1.0, Math.round(maxMult * 100) / 100),
      game: maxMultGame,
    },
    longestWinStreak: longestStreak,
    luckIndex,
  };
}

export function buildDailyPnlHeatmap(rows: HistoryRow[], daysCount: number = 28): DailyPnlCell[] {
  const result: DailyPnlCell[] = [];
  const now = new Date();
  const dayMap = new Map<string, { profit: number; count: number; wagered: number }>();

  for (const r of rows) {
    const key = localDateKey(r.created_at);
    const existing = dayMap.get(key) || { profit: 0, count: 0, wagered: 0 };
    existing.profit += r.amount;
    existing.count += 1;
    if (r.amount < 0) existing.wagered += Math.abs(r.amount);
    dayMap.set(key, existing);
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('en-CA');
    const dayLabel = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    const data = dayMap.get(key) || { profit: 0, count: 0, wagered: 0 };
    result.push({
      date: key,
      dayLabel,
      profit: Math.round(data.profit * 100) / 100,
      count: data.count,
      wagered: Math.round(data.wagered * 100) / 100,
    });
  }

  return result;
}
