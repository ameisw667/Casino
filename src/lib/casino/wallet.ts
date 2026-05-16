import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';

interface WalletResult {
  balance: number;
  xp: number;
  level: number;
}

interface CrashSettlement extends WalletResult {
  win: boolean;
  payout: number;
}

export class WalletService {
  static async getWallet(userId: string): Promise<WalletResult> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('users')
      .select('balance, xp, level')
      .eq('id', userId)
      .single();

    if (error || !data) {
      CasinoLogger.info('WALLET', `User ${userId} not found in DB`);
      return { balance: 1000.00, xp: 0, level: 1 };
    }

    return {
      balance: Number(data.balance),
      xp: Number(data.xp),
      level: Number(data.level),
    };
  }

  static async updateWallet(
    userId: string,
    amount: number,
    payout: number,
    xpGain: number,
    game = 'unknown'
  ): Promise<WalletResult> {
    const supabase = createAdminClient();

    // Atomic debit via stored procedure (raises exception if insufficient balance)
    const { error: debitError } = await supabase
      .rpc('place_bet', { p_user_id: userId, p_amount: amount, p_game: game });

    if (debitError) {
      throw new Error(
        debitError.message.includes('Insufficient') ? 'Insufficient balance' : 'Bet could not be placed'
      );
    }

    // Atomic credit + XP recalculation via stored procedure
    const { data: settleRows, error: settleError } = await supabase
      .rpc('settle_bet', {
        p_user_id: userId,
        p_payout: payout,
        p_xp_gain: xpGain,
        p_game: game,
      });

    if (settleError) throw new Error('Bet settlement failed');

    const row = Array.isArray(settleRows) ? settleRows[0] : null;

    CasinoLogger.info(
      'WALLET',
      `Updated wallet for ${userId}: balance=${row?.balance} (bet=${amount}, payout=${payout})`
    );

    return {
      balance: Number(row?.balance ?? 0),
      xp: Number(row?.xp ?? 0),
      level: Number(row?.level ?? 1),
    };
  }

  // Non-bet credits: purchases, bonuses, daily rewards
  static async addBalance(userId: string, amount: number): Promise<WalletResult> {
    const supabase = createAdminClient();

    const { data: settleRows, error } = await supabase.rpc('settle_bet', {
      p_user_id: userId,
      p_payout: amount,
      p_xp_gain: 0,
      p_game: 'bonus',
    });

    if (error) throw new Error('Balance credit failed');

    const row = Array.isArray(settleRows) ? settleRows[0] : null;
    return {
      balance: Number(row?.balance ?? 1000),
      xp: Number(row?.xp ?? 0),
      level: Number(row?.level ?? 1),
    };
  }

  // --- Crash game: two-phase (start debit / cashout credit) ---

  static async startCrashBet(
    userId: string,
    amount: number,
    crashPoint: number
  ): Promise<WalletResult> {
    const supabase = createAdminClient();

    const { data: newBalance, error } = await supabase.rpc('place_bet', {
      p_user_id: userId,
      p_amount: amount,
      p_game: 'crash',
    });

    if (error) throw new Error('Insufficient balance');

    // Mark this crash bet as pending so settleCrashBet can find it
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      game: 'crash',
      type: 'crash_pending',
      amount: -amount,
      balance_after: Number(newBalance),
      metadata: { crashPoint, status: 'active' },
    });

    return { balance: Number(newBalance), xp: 0, level: 1 };
  }

  static async settleCrashBet(
    userId: string,
    cashoutMultiplier: number
  ): Promise<CrashSettlement> {
    const supabase = createAdminClient();

    // Locate the active pending crash bet
    const { data: pending, error: findError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'crash_pending')
      .eq('metadata->>status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !pending) throw new Error('No active crash bet found');

    const betAmount = Math.abs(Number(pending.amount));
    const crashPoint: number = pending.metadata?.crashPoint ?? 0;

    // Resolve the pending marker
    await supabase
      .from('wallet_transactions')
      .update({ metadata: { ...pending.metadata, status: 'resolved' } })
      .eq('id', pending.id);

    if (cashoutMultiplier > crashPoint) {
      // Cashed out after the crash — no payout, balance already debited
      const wallet = await this.getWallet(userId);
      return { win: false, payout: 0, ...wallet };
    }

    const payout = Math.round(betAmount * cashoutMultiplier * 100) / 100;
    const xpGain = Math.floor(betAmount * 10);

    const { data: settleRows, error: settleError } = await supabase.rpc('settle_bet', {
      p_user_id: userId,
      p_payout: payout,
      p_xp_gain: xpGain,
      p_game: 'crash',
    });

    if (settleError) throw new Error('Crash bet settlement failed');

    const row = Array.isArray(settleRows) ? settleRows[0] : null;
    return {
      win: true,
      payout,
      balance: Number(row?.balance ?? 0),
      xp: Number(row?.xp ?? 0),
      level: Number(row?.level ?? 1),
    };
  }
}
