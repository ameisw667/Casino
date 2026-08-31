import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (!isAdminEmail(user.email)) return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-games-read',
      30,
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

    const config = await loadGameConfig();
    const admin = createAdminClient();

    // Query per-game transaction aggregates from Supabase
    const { data: txs } = await admin
      .from('wallet_transactions')
      .select('game, amount, type')
      .limit(1000);

    const gameAggregates: Record<
      string,
      { bets: number; wins: number; wagered: number; payout: number; maxWin: number }
    > = {
      crash: { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 },
      dice: { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 },
      slots: { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 },
      roulette: { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 },
      blackjack: { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 },
    };

    if (txs) {
      for (const t of txs) {
        const gameKey = (t.game || 'dice').toLowerCase();
        if (!gameAggregates[gameKey]) {
          gameAggregates[gameKey] = { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 };
        }
        const amt = Math.abs(Number(t.amount || 0));
        if (t.type === 'bet' || t.type === 'bet_settled' || Number(t.amount) < 0) {
          gameAggregates[gameKey].bets += 1;
          gameAggregates[gameKey].wagered += amt;
        } else if (t.type === 'win' || t.type === 'payout' || Number(t.amount) > 0) {
          gameAggregates[gameKey].wins += 1;
          gameAggregates[gameKey].payout += amt;
          if (amt > gameAggregates[gameKey].maxWin) {
            gameAggregates[gameKey].maxWin = amt;
          }
        }
      }
    }

    const gameDefs = [
      {
        key: 'crash',
        name: 'Crash',
        defaultRtp: 97.0,
        defaultHouseEdge: config.crash?.houseEdge ? config.crash.houseEdge * 100 : 3.0,
        color: '#ef4444',
      },
      { key: 'dice', name: 'Dice', defaultRtp: 98.5, defaultHouseEdge: 1.5, color: '#3b82f6' },
      { key: 'slots', name: 'Slots', defaultRtp: 96.4, defaultHouseEdge: 3.6, color: '#a855f7' },
      {
        key: 'roulette',
        name: 'Roulette',
        defaultRtp: 97.3,
        defaultHouseEdge: 2.7,
        color: '#D4AF37',
      },
      {
        key: 'blackjack',
        name: 'Blackjack',
        defaultRtp: 99.2,
        defaultHouseEdge: 0.8,
        color: '#10b981',
      },
    ];

    const gameStats = gameDefs.map((def) => {
      const agg = gameAggregates[def.key] || { bets: 0, wins: 0, wagered: 0, payout: 0, maxWin: 0 };
      const computedRtp =
        agg.wagered > 0 ? Number(((agg.payout / agg.wagered) * 100).toFixed(1)) : def.defaultRtp;
      const computedWinRate =
        agg.bets > 0 ? Number(((agg.wins / agg.bets) * 100).toFixed(1)) : 42.0;

      return {
        game: def.name,
        rtp: computedRtp,
        winRate: computedWinRate,
        totalBets: agg.bets,
        totalWagered: Math.round(agg.wagered),
        biggestWin: Math.round(agg.maxWin),
        houseEdge: def.defaultHouseEdge,
        color: def.color,
      };
    });

    return apiSuccessResponse(
      {
        games: gameStats,
        config: {
          betMin: config.limits?.betMin ?? 0.1,
          betMax: config.limits?.betMax ?? 10000,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Games', 'Admin games unexpected failure', error);
    return apiErrorResponse('GAMES_UNAVAILABLE', 'Games data unavailable', 503);
  }
}
