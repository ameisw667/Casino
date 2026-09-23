import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import {
  walletSnapshotSchema,
  type PromoCodeContract,
  type PromoRedemption,
  type PromoReversal,
} from './wallet-contract';

// ── Abschnitt: Promo-Codes (03c-W3 L5, 1:1 aus wallet.ts verschoben) ──
// Geldnah: beide Verfahren schreiben über die RPCs `redeem_promo_code` / `reverse_promo_code`
// (Migration 021 / 066) Guthaben; der Service-Layer mutiert weiterhin kein Guthaben selbst.
export const WalletPromo: PromoCodeContract = {
  async redeemPromoCode(params: {
    userId: string;
    code: string;
    requestId: string;
  }): Promise<PromoRedemption> {
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
  },

  /**
   * 06_10 L0: admin-triggered clawback of a promo bonus later identified as fraudulent.
   * Always human-initiated via the admin promo-codes reverse route — never automatic.
   * Idempotent per requestId (network retry replays the same answer); the SQL side
   * (066_promo_reversal_and_expiry.sql) rejects a second reversal of the same redemption.
   * `shortfall` is the uncollected part when the balance already sits below the redemption
   * amount (users.balance CHECK (balance >= 0) forbids a negative balance — the shortfall
   * is reported honestly in ledger metadata + risk-event evidence instead of hidden).
   */
  async reversePromoCode(params: {
    actorId: string;
    userId: string;
    code: string;
    requestId: string;
    reason: string;
  }): Promise<PromoReversal> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('reverse_promo_code', {
      p_actor_id: params.actorId,
      p_user_id: params.userId,
      p_code: params.code.trim().toUpperCase(),
      p_request_id: params.requestId,
      p_reason: params.reason,
    });
    if (error || !data) {
      CasinoLogger.error('WalletService/reversePromoCode', 'RPC failed', error);
      throw new Error('Promo reversal RPC failed');
    }
    const result = data as {
      ok: boolean;
      code?: string;
      amount?: number;
      shortfall?: number;
      balance?: number;
      xp?: number;
      level?: number;
      rank?: string;
      transactionId?: string;
      replayed?: boolean;
    };
    if (!result.ok) {
      return { ok: false, code: String(result.code ?? 'REVERSAL_NOT_FOUND') };
    }
    const snapshot = walletSnapshotSchema.parse({
      balance: Number(result.balance),
      xp: Number(result.xp ?? 0),
      level: Number(result.level ?? 1),
      rank: String(result.rank ?? 'BRONZE'),
      transactionId: String(result.transactionId),
    });
    return {
      ok: true,
      amount: Number(result.amount),
      shortfall: Number(result.shortfall ?? 0),
      replayed: Boolean(result.replayed),
      snapshot,
    };
  },
};
