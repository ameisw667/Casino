import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const LeaderboardRowSchema = z.object({
  username: z.string(),
  level: z.number().int(),
  rank: z.string(),
  total_wagered: z.number().finite(),
  biggest_win: z.number().finite(),
});

const LeaderboardResponseSchema = z.object({
  rows: z.array(LeaderboardRowSchema),
  generated_at: z.string(),
});

interface QueryTxRow {
  user_id: string;
  amount: number;
  metadata?: Record<string, unknown>;
  users?: { username: string; level?: number; rank?: string };
}

interface QueryRoundRow {
  user_id: string;
  bet_amount: number;
  payout: number;
  users?: { username: string; level?: number; rank?: string };
}

function aggregateLeaderboard(txRows: QueryTxRow[], roundRows: QueryRoundRow[]) {
  const aggregated = new Map<
    string,
    {
      username: string;
      level: number;
      rank: string;
      total_wagered: number;
      biggest_win: number;
    }
  >();

  for (const row of txRows) {
    const userId = row.user_id;
    const user = row.users;
    if (!user?.username) continue;

    const existing = aggregated.get(userId) ?? {
      username: user.username,
      level: user.level ?? 1,
      rank: user.rank ?? 'BRONZE',
      total_wagered: 0,
      biggest_win: 0,
    };

    const amount = Number(row.amount ?? 0);
    type ResponseMeta = { betAmount?: unknown; result?: { amount?: unknown } };
    const response = (row.metadata as { response?: ResponseMeta } | null)?.response;
    const betAmountStake = Number(response?.betAmount ?? NaN);
    const resultStake = Number(response?.result?.amount ?? NaN);
    const stake =
      Number.isFinite(betAmountStake) && betAmountStake > 0
        ? betAmountStake
        : Number.isFinite(resultStake) && resultStake > 0
          ? resultStake
          : amount < 0
            ? Math.abs(amount)
            : 0;
    existing.total_wagered += stake;

    if (amount > 0) {
      existing.biggest_win = Math.max(existing.biggest_win, amount);
    }

    aggregated.set(userId, existing);
  }

  for (const row of roundRows) {
    const userId = row.user_id;
    const user = row.users;
    if (!user?.username) continue;

    const existing = aggregated.get(userId) ?? {
      username: user.username,
      level: user.level ?? 1,
      rank: user.rank ?? 'BRONZE',
      total_wagered: 0,
      biggest_win: 0,
    };

    const betAmount = Number(row.bet_amount ?? 0);
    const payout = Number(row.payout ?? 0);
    const win = Math.max(payout - betAmount, 0);

    if (Number.isFinite(betAmount) && betAmount > 0) {
      existing.total_wagered += betAmount;
    }
    if (Number.isFinite(win) && win > 0) {
      existing.biggest_win = Math.max(existing.biggest_win, win);
    }

    aggregated.set(userId, existing);
  }

  const rows = Array.from(aggregated.values())
    .sort((a, b) => b.total_wagered - a.total_wagered)
    .slice(0, 50)
    .map((r) => ({
      ...r,
      username: r.username.substring(0, 20),
    }));

  return LeaderboardResponseSchema.parse({
    rows,
    generated_at: new Date().toISOString(),
  });
}

describe('Leaderboard Aggregation Logic', () => {
  it('correctly aggregates DICE/SLOTS/ROULETTE wagered stakes from metadata and net wins', () => {
    const txRows: QueryTxRow[] = [
      {
        user_id: 'user_1',
        amount: 50,
        metadata: { response: { betAmount: 100 } },
        users: { username: 'lucky.spinner', level: 5, rank: 'BRONZE' },
      },
      {
        user_id: 'user_1',
        amount: -25,
        metadata: { response: { result: { amount: 25 } } },
        users: { username: 'lucky.spinner', level: 5, rank: 'BRONZE' },
      },
    ];

    const result = aggregateLeaderboard(txRows, []);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].username).toBe('lucky.spinner');
    expect(result.rows[0].total_wagered).toBe(125);
    expect(result.rows[0].biggest_win).toBe(50);
  });

  it('correctly aggregates CRASH and BLACKJACK stakes and wins from game_rounds', () => {
    const roundRows: QueryRoundRow[] = [
      {
        user_id: 'user_2',
        bet_amount: 200,
        payout: 500,
        users: { username: 'whale.tony', level: 16, rank: 'SILVER' },
      },
      {
        user_id: 'user_2',
        bet_amount: 150,
        payout: 0,
        users: { username: 'whale.tony', level: 16, rank: 'SILVER' },
      },
    ];

    const result = aggregateLeaderboard([], roundRows);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].username).toBe('whale.tony');
    expect(result.rows[0].total_wagered).toBe(350);
    expect(result.rows[0].biggest_win).toBe(300);
  });

  it('handles empty/null data gracefully returning empty leaderboard rows', () => {
    const result = aggregateLeaderboard([], []);
    expect(result.rows).toHaveLength(0);
  });

  it('combines wagered amounts across all 5 games for a single user', () => {
    const txRows: QueryTxRow[] = [
      {
        user_id: 'user_3',
        amount: -50,
        metadata: { response: { betAmount: 50 } },
        users: { username: 'all.round.player', level: 10, rank: 'SILVER' },
      },
    ];

    const roundRows: QueryRoundRow[] = [
      {
        user_id: 'user_3',
        bet_amount: 100,
        payout: 250,
        users: { username: 'all.round.player', level: 10, rank: 'SILVER' },
      },
    ];

    const result = aggregateLeaderboard(txRows, roundRows);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].username).toBe('all.round.player');
    expect(result.rows[0].total_wagered).toBe(150);
    expect(result.rows[0].biggest_win).toBe(150);
  });
});
