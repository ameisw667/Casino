import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { type WalletSnapshot, walletSnapshotSchema } from './wallet-contract';

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

    const { error: provisionError } = await supabase.from('users').upsert(
      { id: userId, username: userId.slice(0, 64), balance: 10000.00 },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (provisionError) throw new Error('Wallet user could not be provisioned');

    const [
      { data: user, error: userError },
      { data: transaction, error: transactionError },
    ] = await Promise.all([
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
    game: 'CRASH' | 'BLACKJACK'
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
}