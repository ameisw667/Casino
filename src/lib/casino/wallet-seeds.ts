import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { withConnectionRetry } from './db-retry';
import type {
  ConsumedSeed,
  ProvablyFairSeedContract,
  RotatedSeed,
  SeedHistoryEntry,
  UserSeedChain,
} from './wallet-contract';

// ── Abschnitt: Provably-Fair Seeds (03c-W3 L3, 1:1 aus wallet.ts verschoben) ──
export const WalletSeeds: ProvablyFairSeedContract = {
  /**
   * Consumes the next nonce from the user's active provably-fair seed chain.
   * Idempotent per (userId, requestId) — a retried request replays the same
   * seed/nonce instead of burning a new one. Must be called before the RNG
   * outcome is computed (casino-core.ts), never after settlement.
   */
  async consumeActiveSeed(params: { userId: string; requestId: string }): Promise<ConsumedSeed> {
    const supabase = createAdminClient();
    const { data, error } = await withConnectionRetry(() =>
      supabase.rpc('consume_active_seed', {
        p_user_id: params.userId,
        p_request_id: params.requestId,
      }),
    );
    if (error || !data) throw new Error('Failed to consume provably fair seed');
    return z
      .object({
        serverSeed: z.string().min(1),
        serverSeedHash: z.string().min(1),
        nonce: z.number().int().nonnegative(),
        replayed: z.boolean(),
      })
      .parse(data);
  },

  async getUserSeeds(userId: string): Promise<UserSeedChain> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_or_create_user_seed', {
      p_user_id: userId,
    });
    if (error || !data) {
      // Log-Kontext bleibt bewusst 'WalletService': Log-Filter/Alerting greifen darauf zu, der
      // physische Modulschnitt ist kein Grund, den Schlüssel zu ändern (1:1-Move).
      CasinoLogger.error('WalletService', 'getUserSeeds RPC failed', error ?? 'no data returned');
      return {
        clientSeed: 'vibe-coder-default',
        serverSeedHash: '',
        nonce: 0,
      };
    }
    return data as UserSeedChain;
  },

  async rotateUserSeed(params: { userId: string; clientSeed: string }): Promise<RotatedSeed> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('rotate_user_seed', {
      p_user_id: params.userId,
      p_client_seed: params.clientSeed,
    });
    if (error || !data) {
      throw new Error('Failed to rotate seed');
    }
    return data as RotatedSeed;
  },

  async getSeedHistory(userId: string): Promise<SeedHistoryEntry[]> {
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
  },
};
