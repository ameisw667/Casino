import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import {
  dailyRaceStandingSchema,
  secondsUntilNextUtcMidnight,
  type DailyRaceSnapshot,
} from './daily-race';
import type { GamificationContract, UserStats } from './wallet-contract';

// ── Abschnitt: Gamification & Community (03c-W3 L4, 1:1 aus wallet.ts verschoben) ──
export const WalletGamification: GamificationContract = {
  async getUserStats(userId: string): Promise<UserStats> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId });
    if (error || !data) {
      // Return safe defaults if RPC is not present or fails
      CasinoLogger.error('WalletService', 'getUserStats RPC failed', error ?? 'no data returned');
      return {
        totalBets: 0,
        totalWins: 0,
        totalWagered: 0,
        totalPayout: 0,
        totalProfit: 0,
        winRate: 0,
        achievements: [],
        perGame: [],
      };
    }
    const parsed = data as {
      totalBets: number;
      totalWins: number;
      totalWagered: number;
      totalPayout: number;
      totalProfit: number;
      winRate: number;
      achievements: Array<{ id: string; unlocked: boolean; progress: number }>;
      perGame?: Array<{
        game: string;
        bets: number;
        wins: number;
        wagered: number;
        payout: number;
        profit: number;
        winRate: number;
      }>;
    };
    // perGame is absent until migration 018 is rolled out on the target DB —
    // default to an empty array so callers never destructure undefined.
    return { ...parsed, perGame: parsed.perGame ?? [] };
  },

  async syncAchievement(params: {
    userId: string;
    achievementId: string;
    progress: number;
    unlocked: boolean;
  }): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc('sync_user_achievement', {
      p_user_id: params.userId,
      p_achievement_id: params.achievementId,
      p_progress: params.progress,
      p_unlocked: params.unlocked,
    });
    if (error) {
      CasinoLogger.error('WalletService', 'Failed to sync achievement to server', error);
    }
  },

  /**
   * Progressive jackpot pool read (worldmap/01_LiveProgressiveJackpot.md, L4).
   * Narrow field allowlist enforced server-side by get_jackpot_pool_public() —
   * last_winner_id, contribution_rate, win_probability and seed_amount never
   * leave the database. Falls back to a safe zero, never a fabricated amount.
   */
  async getJackpotPool(): Promise<{ currentAmount: number; lastWonAt: string | null }> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_jackpot_pool_public');
    if (error || !data) {
      return { currentAmount: 0, lastWonAt: null };
    }
    return data as { currentAmount: number; lastWonAt: string | null };
  },

  /**
   * Daily race standings read (worldmap/05_DAILY_TOURNAMENT.md, L4). Live aggregation via
   * get_daily_race_standings() — never a fabricated placeholder. Falls back to an empty
   * standings list on any DB/shape error, never a partial or guessed ranking; the countdown
   * is always computed regardless of DB availability, since it's a pure UTC clock derivation.
   */
  async getDailyRaceStandings(): Promise<DailyRaceSnapshot> {
    const secondsUntilResetUtc = secondsUntilNextUtcMidnight();
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_daily_race_standings');
    if (error || !Array.isArray(data)) {
      return { standings: [], secondsUntilResetUtc };
    }
    const parsed = z.array(dailyRaceStandingSchema).safeParse(data);
    if (!parsed.success) {
      CasinoLogger.warn(
        'WalletService',
        'Invalid daily race standings shape from RPC',
        parsed.error,
      );
      return { standings: [], secondsUntilResetUtc };
    }
    return { standings: parsed.data, secondsUntilResetUtc };
  },

  /**
   * Emits a big_win_notify outbox event (4.3, worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md) — the
   * durable, retried counterpart to directly calling tasks.trigger('big-win-notify', ...). Called
   * from notifyBigWinIfEligible() after its local eligibility check, never from a settlement RPC.
   * Idempotent over (userId, requestId): a retried settlement never double-queues a notification.
   */
  async emitBigWinNotifyEvent(params: {
    userId: string;
    requestId: string;
    game: string;
    payout: number;
    multiplier: number;
  }): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc('emit_big_win_notify_event', {
      p_user_id: params.userId,
      p_request_id: params.requestId,
      p_game: params.game,
      p_payout: params.payout,
      p_multiplier: params.multiplier,
    });
    if (error) throw new Error('Failed to emit big-win notify event');
  },
};
