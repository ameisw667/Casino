import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
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

export async function GET(request: Request) {
  try {
    const rate = await enforceRateLimit(
      getClientIdentifier(request, 'anon'),
      'leaderboard-read',
      10,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) {
      // Fallback: direct query if RPC doesn't exist
      const [txResult, roundsResult] = await Promise.all([
        supabase
          .from('wallet_transactions')
          .select(
            `
            user_id,
            amount,
            metadata,
            users!inner(username, level, rank)
          `,
          )
          .limit(5000),
        supabase
          .from('game_rounds')
          .select(
            `
            user_id,
            bet_amount,
            payout,
            users!inner(username, level, rank)
          `,
          )
          .eq('status', 'SETTLED')
          .limit(5000),
      ]);

      if (txResult.error) {
        console.error('Leaderboard query failed:', txResult.error);
        return apiErrorResponse('LEADERBOARD_UNAVAILABLE', 'Leaderboard unavailable', 503);
      }
      if (roundsResult.error) {
        console.error('Leaderboard game_rounds query failed:', roundsResult.error);
      }

      // Aggregate client-side
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

      for (const row of txResult.data ?? []) {
        const userId = row.user_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = row.users as any;
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

      // Process game_rounds for CRASH & BLACKJACK
      for (const row of roundsResult.data ?? []) {
        const userId = row.user_id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = row.users as any;
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
          username: r.username.substring(0, 20), // privacy: truncate
        }));

      const parsed = LeaderboardResponseSchema.parse({
        rows,
        generated_at: new Date().toISOString(),
      });

      return apiSuccessResponse(parsed, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          ...rateLimitHeaders(rate),
        },
      });
    }

    // RPC path
    const rows = ((data as LeaderboardRow[]) ?? []).slice(0, 50).map((r: LeaderboardRow) => ({
      username: String(r.username ?? '').substring(0, 20),
      level: Number(r.level ?? 1),
      rank: String(r.rank ?? 'BRONZE'),
      total_wagered: Number(r.total_wagered ?? 0),
      biggest_win: Number(r.biggest_win ?? 0),
    }));

    const parsed = LeaderboardResponseSchema.parse({
      rows,
      generated_at: new Date().toISOString(),
    });

    return apiSuccessResponse(parsed, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (err) {
    console.error('Leaderboard route error:', err);
    return apiErrorResponse('LEADERBOARD_UNAVAILABLE', 'Leaderboard unavailable', 503);
  }
}

interface LeaderboardRow {
  username: string;
  level: number;
  rank: string;
  total_wagered: number;
  biggest_win: number;
}
