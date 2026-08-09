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

    let currentBalance = Number(user.balance);
    if (currentBalance <= 0) {
      currentBalance = 10000.0;
      await supabase.from('users').update({ balance: 10000.0 }).eq('id', userId);
    }

    return walletSnapshotSchema.parse({
      balance: currentBalance,
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
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      throw new Error('Atomic bet settlement failed');
    }
    return walletFromRpc(data);
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

  static async creditBonus(params: {
    userId: string;
    amount: number;
    code: string;
  }): Promise<WalletSnapshot> {
    const supabase = createAdminClient();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, xp, level, rank')
      .eq('id', params.userId)
      .single();

    if (userError || !user) {
      // Provision fallback user if needed
      await supabase
        .from('users')
        .upsert(
          { id: params.userId, username: params.userId.slice(0, 64), balance: 10000.0 },
          { onConflict: 'id', ignoreDuplicates: true },
        );
    }

    const currentBalance = Number(user?.balance ?? 10000.0);
    const newBalance = Number((currentBalance + params.amount).toFixed(2));

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', params.userId);

    if (updateError) throw new Error('Bonus credit update failed');

    const { data: transaction } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return walletSnapshotSchema.parse({
      balance: newBalance,
      xp: Number(user?.xp ?? 0),
      level: Number(user?.level ?? 1),
      rank: String(user?.rank ?? 'BRONZE'),
      transactionId: transaction?.id ?? ZERO_TRANSACTION_ID,
    });
  }

  static async getUserStats(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId });
    if (error || !data) {
      // Return safe defaults if RPC is not present or fails
      return {
        totalBets: 0,
        totalWins: 0,
        totalWagered: 0,
        totalPayout: 0,
        totalProfit: 0,
        winRate: 0,
        achievements: [],
      };
    }
    return data as {
      totalBets: number;
      totalWins: number;
      totalWagered: number;
      totalPayout: number;
      totalProfit: number;
      winRate: number;
      achievements: Array<{ id: string; unlocked: boolean; progress: number }>;
    };
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
    return data as { clientSeed: string; serverSeedHash: string; nonce: number };
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
