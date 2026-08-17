import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { type WalletSnapshot, walletSnapshotSchema } from './wallet-contract';
import { CasinoLogger } from './logger';

const ZERO_TRANSACTION_ID = '00000000-0000-0000-0000-000000000000';

const rpcWalletSchema = z.object({
  balance: z.coerce.number().finite().nonnegative(),
  xp: z.coerce.number().int().nonnegative(),
  level: z.coerce.number().int().min(1),
  rank: z.string().min(1),
  transactionId: z.string().uuid(),
  result: z.unknown().optional(),
  replayed: z.boolean(),
});

const roundStartSchema = rpcWalletSchema.extend({
  roundId: z.string().uuid(),
  state: z.unknown(),
  version: z.coerce.number().int().positive(),
});
const blackjackActionSchema = rpcWalletSchema.extend({
  state: z.unknown(),
  version: z.coerce.number().int().positive(),
  settled: z.boolean(),
});

export type WalletSettlement = WalletSnapshot & {
  result: unknown;
  replayed: boolean;
};

export type GameRoundStart = WalletSnapshot & {
  roundId: string;
  state: unknown;
  version: number;
  replayed: boolean;
};

function walletFromRpc(data: unknown): WalletSettlement {
  const parsed = rpcWalletSchema.parse(data);
  return {
    balance: parsed.balance,
    xp: parsed.xp,
    level: parsed.level,
    rank: parsed.rank,
    transactionId: parsed.transactionId,
    result: parsed.result,
    replayed: parsed.replayed,
  };
}

/**
 * Additive analytics signal only (2.9, docs/archive/05_2.9_PostHog_Analytics.md §3.4) — shared by
 * bet/route.ts and blackjack/route.ts so the replayed-gate + lookup logic exists in one place.
 * Never affects settlement response fields otherwise, never a network call to a third party.
 */
export async function isFirstBetSignal(userId: string, replayed: boolean): Promise<boolean> {
  if (replayed) return false;
  return WalletService.isFirstEverBet(userId);
}

export class WalletService {
  static async getWallet(userId: string): Promise<WalletSnapshot> {
    const supabase = createAdminClient();

    const { error: provisionError } = await supabase
      .from('users')
      .upsert(
        { id: userId, username: userId.slice(0, 64), balance: 10000.0 },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    if (provisionError) throw new Error('Wallet user could not be provisioned');

    const [{ data: user, error: userError }, { data: transaction, error: transactionError }] =
      await Promise.all([
        supabase.from('users').select('balance, xp, level, rank').eq('id', userId).single(),
        supabase
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (userError || !user) throw new Error('Wallet could not be loaded');
    if (transactionError) throw new Error('Wallet transaction history could not be loaded');

    return walletSnapshotSchema.parse({
      balance: Number(user.balance),
      xp: Number(user.xp),
      level: Number(user.level),
      rank: String(user.rank),
      transactionId: transaction?.id ?? ZERO_TRANSACTION_ID,
    });
  }

  static async settleBet(params: {
    userId: string;
    requestId: string;
    resultId: string;
    game: 'DICE' | 'ROULETTE' | 'SLOTS';
    amount: number;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
    serverSeedHash?: string;
    nonce?: number;
  }): Promise<WalletSettlement> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('settle_game_bet', {
      p_user_id: params.userId,
      p_request_id: params.requestId,
      p_result_id: params.resultId,
      p_game: params.game,
      p_amount: params.amount,
      p_payout: params.payout,
      p_xp_gain: params.xpGain,
      p_result: params.result,
      p_server_seed_hash: params.serverSeedHash ?? null,
      p_nonce: params.nonce ?? null,
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      throw new Error('Atomic bet settlement failed');
    }
    return walletFromRpc(data);
  }

  /**
   * Consumes the next nonce from the user's active provably-fair seed chain.
   * Idempotent per (userId, requestId) — a retried request replays the same
   * seed/nonce instead of burning a new one. Must be called before the RNG
   * outcome is computed (casino-core.ts), never after settlement.
   */
  static async consumeActiveSeed(params: {
    userId: string;
    requestId: string;
  }): Promise<{ serverSeed: string; serverSeedHash: string; nonce: number; replayed: boolean }> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('consume_active_seed', {
      p_user_id: params.userId,
      p_request_id: params.requestId,
    });
    if (error || !data) throw new Error('Failed to consume provably fair seed');
    return z
      .object({
        serverSeed: z.string().min(1),
        serverSeedHash: z.string().min(1),
        nonce: z.number().int().nonnegative(),
        replayed: z.boolean(),
      })
      .parse(data);
  }

  static async startRound(params: {
    userId: string;
    requestId: string;
    game: 'CRASH' | 'BLACKJACK';
    amount: number;
    state: Record<string, unknown>;
  }): Promise<GameRoundStart> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('start_game_round', {
      p_user_id: params.userId,
      p_request_id: params.requestId,
      p_game: params.game,
      p_amount: params.amount,
      p_state: params.state,
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      throw new Error('Game round could not be started');
    }
    const parsed = roundStartSchema.parse(data);
    return {
      roundId: parsed.roundId,
      state: parsed.state,
      version: parsed.version,
      replayed: parsed.replayed,
      balance: parsed.balance,
      xp: parsed.xp,
      level: parsed.level,
      rank: parsed.rank,
      transactionId: parsed.transactionId,
    };
  }

  static async getActiveRound(
    userId: string,
    roundId: string,
    game: 'CRASH' | 'BLACKJACK',
  ): Promise<{ betAmount: number; state: Record<string, unknown>; version: number }> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('game_rounds')
      .select('bet_amount, state, version')
      .eq('id', roundId)
      .eq('user_id', userId)
      .eq('game', game)
      .eq('status', 'ACTIVE')
      .single();
    if (error || !data) throw new Error('Active game round not found');
    return {
      betAmount: Number(data.bet_amount),
      state: z.record(z.string(), z.unknown()).parse(data.state),
      version: Number(data.version),
    };
  }
  static async settleRound(params: {
    userId: string;
    roundId: string;
    requestId: string;
    resultId: string;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
  }): Promise<WalletSettlement> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('settle_game_round', {
      p_user_id: params.userId,
      p_round_id: params.roundId,
      p_request_id: params.requestId,
      p_result_id: params.resultId,
      p_payout: params.payout,
      p_xp_gain: params.xpGain,
      p_result: params.result,
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      throw new Error('Game round settlement failed');
    }
    return walletFromRpc(data);
  }
  static async advanceBlackjackRound(params: {
    userId: string;
    roundId: string;
    requestId: string;
    resultId: string;
    expectedVersion: number;
    state: Record<string, unknown>;
    additionalBet: number;
    settled: boolean;
    payout: number;
    xpGain: number;
    result: Record<string, unknown>;
  }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('advance_blackjack_round', {
      p_user_id: params.userId,
      p_round_id: params.roundId,
      p_request_id: params.requestId,
      p_result_id: params.resultId,
      p_expected_version: params.expectedVersion,
      p_new_state: params.state,
      p_additional_bet: params.additionalBet,
      p_settled: params.settled,
      p_payout: params.payout,
      p_xp_gain: params.xpGain,
      p_result: params.result,
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      if (error.message.includes('Stale')) throw new Error('Stale blackjack action');
      throw new Error('Blackjack action failed');
    }
    return blackjackActionSchema.parse(data);
  }

  static async redeemPromoCode(params: {
    userId: string;
    code: string;
    requestId: string;
  }): Promise<
    { ok: true; amount: number; snapshot: WalletSnapshot } | { ok: false; code: string }
  > {
    const supabase = createAdminClient();
    const normCode = params.code.trim().toUpperCase();
    let { data, error } = await supabase.rpc('redeem_promo_code', {
      p_user_id: params.userId,
      p_code: normCode,
      p_request_id: params.requestId,
    });

    // Auto-provision standard welcome promo code if not yet present in database
    if (
      (data as { ok?: boolean; code?: string } | null)?.code === 'PROMO_NOT_FOUND' &&
      normCode === 'VIPPRO'
    ) {
      try {
        await supabase.from('promo_codes').upsert(
          {
            code: 'VIPPRO',
            amount: 500.0,
            max_uses: 10000,
            used_count: 0,
            active: true,
            created_by: 'system_welcome',
          },
          { onConflict: 'code' },
        );

        const retry = await supabase.rpc('redeem_promo_code', {
          p_user_id: params.userId,
          p_code: normCode,
          p_request_id: params.requestId,
        });
        if (retry.data && !retry.error) {
          data = retry.data;
          error = null;
        }
      } catch (upsertErr) {
        CasinoLogger.error(
          'WalletService/redeemPromoCode',
          'Auto-provision VIPPRO failed',
          upsertErr,
        );
      }
    }

    if (error || !data) {
      CasinoLogger.error('WalletService/redeemPromoCode', 'RPC failed', error);
      throw new Error('Redeem RPC failed');
    }
    const result = data as {
      ok: boolean;
      code?: string;
      amount?: number;
      balance?: number;
      xp?: number;
      level?: number;
      rank?: string;
      transactionId?: string;
    };
    if (!result.ok) {
      return { ok: false, code: String(result.code ?? 'PROMO_INVALID') };
    }
    const snapshot = walletSnapshotSchema.parse({
      balance: Number(result.balance),
      xp: Number(result.xp ?? 0),
      level: Number(result.level ?? 1),
      rank: String(result.rank ?? 'BRONZE'),
      transactionId: String(result.transactionId),
    });
    return { ok: true, amount: Number(result.amount), snapshot };
  }

  static async getUserStats(userId: string) {
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
  }

  static async syncAchievement(params: {
    userId: string;
    achievementId: string;
    progress: number;
    unlocked: boolean;
  }) {
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
  }

  static async getUserSeeds(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_or_create_user_seed', {
      p_user_id: userId,
    });
    if (error || !data) {
      CasinoLogger.error('WalletService', 'getUserSeeds RPC failed', error ?? 'no data returned');
      return {
        clientSeed: 'vibe-coder-default',
        serverSeedHash: '',
        nonce: 0,
      };
    }
    return data as { clientSeed: string; serverSeedHash: string; nonce: number };
  }

  static async rotateUserSeed(params: { userId: string; clientSeed: string }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('rotate_user_seed', {
      p_user_id: params.userId,
      p_client_seed: params.clientSeed,
    });
    if (error || !data) {
      throw new Error('Failed to rotate seed');
    }
    return data as {
      clientSeed: string;
      serverSeedHash: string;
      nonce: number;
      revealedSeed: string | null;
      revealedSeedHash: string | null;
    };
  }

  static async getSeedHistory(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('seed_history')
      .select('server_seed, server_seed_hash, client_seed, nonce_at_rotation, rotated_at')
      .eq('user_id', userId)
      .order('rotated_at', { ascending: false })
      .limit(50);
    if (error) throw new Error('Failed to load seed history');
    return (data ?? []).map((row) => ({
      serverSeed: row.server_seed as string,
      serverSeedHash: row.server_seed_hash as string,
      clientSeed: row.client_seed as string,
      nonceAtRotation: Number(row.nonce_at_rotation),
      rotatedAt: row.rotated_at as string,
    }));
  }

  static async getChatMessages(limit = 50) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_recent_chat_messages', {
      p_limit: limit,
    });
    if (error || !data) {
      return [];
    }
    return data as Array<{
      id: string;
      user: string;
      rank: string;
      message: string;
      time: string;
      isSystem?: boolean;
      isWin?: boolean;
    }>;
  }

  static async postChatMessage(params: { userId: string; message: string }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('post_chat_message', {
      p_user_id: params.userId,
      p_message: params.message,
    });
    if (error || !data) {
      throw new Error('Failed to post chat message');
    }
    return data as {
      id: string;
      user: string;
      rank: string;
      message: string;
      time: string;
      isSystem?: boolean;
      isWin?: boolean;
    };
  }

  static async getCommunityStats() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_community_stats');
    if (error || !data) {
      return {
        communityWagered: 0,
        communityGoal: 25000.0,
        communityGoalReached: false,
      };
    }
    return data as {
      communityWagered: number;
      communityGoal: number;
      communityGoalReached: boolean;
    };
  }

  /**
   * Whether the user has never placed a bet before. Checked after a bet-placement RPC
   * (settleBet/startRound) commits — those insert exactly one wallet_transactions row per
   * call, so <=1 matching row means this was the first. Deliberately NOT checked after
   * settlement-only RPCs (settleRound/advanceBlackjackRound): advanceBlackjackRound inserts one
   * row per action (HIT/STAND/...), so counting rows there would undercount "first game" for any
   * Blackjack round with more than one action. Relies on migration 007's per-user
   * pg_advisory_xact_lock serializing concurrent bet-placement calls for the same user
   * (05_2.9_PostHog_Analytics.md §3.4).
   *
   * Filtered to the two bet-placement `type` values from 007_server_authority.sql
   * ('bet_settled' from settle_game_bet, 'round_started' from start_game_round) — NOT an
   * unfiltered row count. wallet_transactions also holds non-bet rows (promo redemptions:
   * 021_promo_codes.sql 'bonus'; admin adjustments: 028_wallet_ledger_invariants.sql
   * 'admin_adjust') that a user can accumulate before ever placing a bet; counting those would
   * make this permanently return false for anyone who redeemed a code first (code-review finding).
   */
  static async isFirstEverBet(userId: string): Promise<boolean> {
    const supabase = createAdminClient();
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('id')
        .eq('user_id', userId)
        .in('type', ['bet_settled', 'round_started'])
        .limit(2);
      if (error) throw error;
      return (data?.length ?? 0) <= 1;
    } catch (error) {
      CasinoLogger.error(
        'WalletService/isFirstEverBet',
        'Lookup failed, defaulting to false',
        error,
      );
      return false;
    }
  }

  static async getGameActiveRound(params: { userId: string; game: 'CRASH' | 'BLACKJACK' }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_active_game_round', {
      p_user_id: params.userId,
      p_game: params.game,
    });
    if (error || !data) {
      return { hasActiveRound: false };
    }
    return data as {
      hasActiveRound: boolean;
      roundId?: string;
      requestId?: string;
      betAmount?: number;
      state?: Record<string, unknown>;
      version?: number;
    };
  }
}
