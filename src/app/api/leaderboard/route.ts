import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/security/request-security';
import { z } from 'zod';

const LeaderboardRowSchema = z.object({
  username: z.string(),
  level: z.number().int(),
  rank: z.string(),
  total_wagered: z.number(),
  biggest_win: z.number(),
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
      60
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc('get_leaderboard');

    if (error) {
      // Fallback: direct query if RPC doesn't exist
      const { data: queryData, error: queryError } = await supabase
        .from('wallet_transactions')
        .select(`
          user_id,
          amount,
          users!inner(username, level, rank)
        `)
        .limit(5000);

      if (queryError) {
        console.error('Leaderboard query failed:', queryError);
        return NextResponse.json({ error: 'Leaderboard unavailable' }, { status: 503 });
      }

      // Aggregate client-side
      const aggregated = new Map<string, { username: string; level: number; rank: string; total_wagered: number; biggest_win: number }>();

      for (const row of (queryData ?? [])) {
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
        // amount < 0 = bet/loss (einsatz), amount > 0 = win/gain
        if (amount < 0) {
          existing.total_wagered += Math.abs(amount);
        } else if (amount > 0) {
          existing.biggest_win = Math.max(existing.biggest_win, amount);
        }

        aggregated.set(userId, existing);
      }

      const rows = Array.from(aggregated.values())
        .sort((a, b) => b.total_wagered - a.total_wagered)
        .slice(0, 50)
        .map(r => ({
          ...r,
          username: r.username.substring(0, 20), // privacy: truncate
        }));

      const parsed = LeaderboardResponseSchema.parse({
        rows,
        generated_at: new Date().toISOString(),
      });

      return NextResponse.json(parsed, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          ...rateLimitHeaders(rate),
        },
      });
    }

    // RPC path
    const rows = ((data as LeaderboardRow[]) ?? [])
      .slice(0, 50)
      .map((r: LeaderboardRow) => ({
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

    return NextResponse.json(parsed, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (err) {
    console.error('Leaderboard route error:', err);
    return NextResponse.json({ error: 'Leaderboard unavailable' }, { status: 503 });
  }
}

interface LeaderboardRow {
  username: string;
  level: number;
  rank: string;
  total_wagered: number;
  biggest_win: number;
}
