import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  type ConsumedSeed,
  type GameRoundStart,
  type PromoRedemption,
  type PromoReversal,
  type RotatedSeed,
  type SeedHistoryEntry,
  type UserSeedChain,
  type UserStats,
  type WalletServiceContract,
  type WalletSettlement,
  type WalletSnapshot,
  walletSnapshotSchema,
} from './wallet-contract';
import { WalletGamification } from './wallet-gamification';
import { WalletPromo } from './wallet-promo';
import { WalletSeeds } from './wallet-seeds';
import { CasinoLogger } from './logger';
import { ProvablyFairEngine } from './provably-fair';
import { toJsonValue } from './json-value';
import { withConnectionRetry } from './db-retry';
import { WalletSocial } from './wallet-social';
import type { DailyRaceSnapshot } from './daily-race';

const ZERO_TRANSACTION_ID = '00000000-0000-0000-0000-000000000000';

// Vertragsquelle für die Geld-RPC-Rückgaben (Säule 6 L5): settle_game_bet / start_game_round /
// advance_blackjack_round haben alle `RETURNS jsonb` — der generierte Typ ist daher nur `Json`
// (Typegen kann die innere jsonb-Struktur nicht introspektieren). Die Zod-Schemas unten sind die
// engere, verbindliche Wahrheit; `data` ist seit der Database-Bindung nicht-any (`Json`) und wird
// hier strukturell verengt, fail-closed bei jeder Abweichung.
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
  // ── Domänen-Map (03a-R01, 2026-09-14; Split ausgeführt in 03c-W3 am 2026-09-18) ──
  // Echt implementiert — Geld-Kern, 12 Verfahren: Wallet & Settlement (getWallet, settleBet,
  // startRound, getActiveRound, settleRound, advanceBlackjackRound) · Crash-Reconciliation &
  // Multiplayer (autoReconcileStaleCrashRound, computeRoundJackpotRoll, getGameActiveRound,
  // linkCrashRound, getCrashRoundParticipants) · Analytics (isFirstEverBet).
  // Nur noch Fassade — 14 Delegationen, die Körper liegen in den Domänen-Modulen:
  // Provably-Fair Seeds → wallet-seeds.ts · Promo-Codes → wallet-promo.ts ·
  // Gamification → wallet-gamification.ts · Social & Chat → wallet-social.ts.
  // Diese Klasse bleibt der eine Einstiegspunkt für alle Importeure; geschnitten wurde an
  // Domänen-Grenzen und nicht an den Abschnittsmarkern, weil die Marker die Domänen nicht
  // abdeckten (Beleg: 03c-W3 §2). Details je Domäne stehen am jeweiligen Delegations-Stub.
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
    // L6 (Säule 8): einmaliger Retry bei transienten Verbindungsfehlern — dieselbe
    // requestId macht den zweiten Aufruf zum Idempotenz-Replay, kein Doppel-Buchungsrisiko.
    const { data, error } = await withConnectionRetry(() =>
      supabase.rpc('settle_game_bet', {
        p_user_id: params.userId,
        p_request_id: params.requestId,
        p_result_id: params.resultId,
        p_game: params.game,
        p_amount: params.amount,
        p_payout: params.payout,
        p_xp_gain: params.xpGain,
        p_result: toJsonValue(params.result),
        // undefined → supabase-js lässt das Feld weg → SQL-DEFAULT NULL greift.
        p_server_seed_hash: params.serverSeedHash,
        p_nonce: params.nonce,
      }),
    );
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      throw new Error('Atomic bet settlement failed');
    }
    return walletFromRpc(data);
  }

  // ── Abschnitt: Provably-Fair Seeds → wallet-seeds.ts (03c-W3 L3) ──
  static async consumeActiveSeed(params: {
    userId: string;
    requestId: string;
  }): Promise<ConsumedSeed> {
    return WalletSeeds.consumeActiveSeed(params);
  }

  static async startRound(params: {
    userId: string;
    requestId: string;
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER';
    amount: number;
    state: Record<string, unknown>;
  }): Promise<GameRoundStart> {
    const supabase = createAdminClient();
    const { data, error } = await withConnectionRetry(() =>
      supabase.rpc('start_game_round', {
        p_user_id: params.userId,
        p_request_id: params.requestId,
        p_game: params.game,
        p_amount: params.amount,
        p_state: toJsonValue(params.state),
      }),
    );
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      if (
        error.message.includes('Active crash') ||
        error.message.includes('Active crash_multiplayer')
      ) {
        throw new Error('ACTIVE_CRASH_ROUND_EXISTS');
      }
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
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER',
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

  // ── Abschnitt: Crash-Reconciliation & Crash-Multiplayer ──
  static async autoReconcileStaleCrashRound(userId: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { data: round } = await supabase
      .from('game_rounds')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('game', 'CRASH')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!round) return false;

    const ageMs = Date.now() - Date.parse(round.created_at);
    // Solo crash flight ceiling is < 30s. Any active round older than 30s is abandoned.
    if (ageMs > 30_000) {
      try {
        const resultId = crypto.randomUUID();
        const { error: settleError } = await supabase.rpc('settle_game_round', {
          p_user_id: userId,
          p_round_id: round.id,
          p_request_id: crypto.randomUUID(),
          p_result_id: resultId,
          p_payout: 0,
          p_xp_gain: 0,
          p_result: {
            id: resultId,
            game: 'CRASH',
            win: false,
            payout: 0,
            multiplier: 0,
            crashPoint: 1.0,
          },
        });
        // supabase-js wirft bei RPC-Fehlern nicht — ein racing Settlement (z. B. concurrent
        // RESOLVE_CRASH) kommt hier als error an. Fail-closed: als Misserfolg melden statt
        // einen falschen "Auto-reconciled"-Erfolg zu loggen.
        if (settleError) {
          CasinoLogger.warn(
            'WalletService',
            `Auto-reconcile settlement for crash round ${round.id} failed`,
            settleError,
          );
          return false;
        }
        CasinoLogger.info(
          'WalletService',
          `Auto-reconciled stale crash round ${round.id} for user ${userId}`,
        );
        return true;
      } catch (err) {
        CasinoLogger.error('WalletService', 'Failed to auto-reconcile stale crash round', err);
        return false;
      }
    }
    return false;
  }
  /**
   * Progressive-jackpot trigger roll for a persisted CRASH/BLACKJACK round
   * (worldmap/01_LiveProgressiveJackpot.md, L3). Reads the round's raw
   * serverSeed server-side only, here in the wallet service boundary rather
   * than in the route handler — the Crash cashout/resolve route is a
   * verified security surface (seed-chain-security-surface.test.ts) that
   * must never itself read the shared, still-active serverSeed back out of
   * round state. Returns undefined (no trigger possible) for a round dealt
   * before clientSeed was persisted in round state.
   */
  static async computeRoundJackpotRoll(
    state: Record<string, unknown>,
    nonce: number,
  ): Promise<number | undefined> {
    const serverSeed = z.string().min(1).safeParse(state.serverSeed);
    const clientSeed = z.string().min(1).safeParse(state.clientSeed);
    if (!serverSeed.success || !clientSeed.success) return undefined;
    return ProvablyFairEngine.getJackpotRoll(serverSeed.data, clientSeed.data, nonce);
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
    const { data, error } = await withConnectionRetry(() =>
      supabase.rpc('settle_game_round', {
        p_user_id: params.userId,
        p_round_id: params.roundId,
        p_request_id: params.requestId,
        p_result_id: params.resultId,
        p_payout: params.payout,
        p_xp_gain: params.xpGain,
        p_result: toJsonValue(params.result),
      }),
    );
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
      p_new_state: toJsonValue(params.state),
      p_additional_bet: params.additionalBet,
      p_settled: params.settled,
      p_payout: params.payout,
      p_xp_gain: params.xpGain,
      p_result: toJsonValue(params.result),
    });
    if (error) {
      if (error.message.includes('Insufficient')) throw new Error('Insufficient balance');
      if (error.message.includes('Stale')) throw new Error('Stale blackjack action');
      throw new Error('Blackjack action failed');
    }
    return blackjackActionSchema.parse(data);
  }

  // ── Abschnitt: Promo-Codes → wallet-promo.ts (03c-W3 L5) ──
  static async redeemPromoCode(params: {
    userId: string;
    code: string;
    requestId: string;
  }): Promise<PromoRedemption> {
    return WalletPromo.redeemPromoCode(params);
  }

  static async reversePromoCode(params: {
    actorId: string;
    userId: string;
    code: string;
    requestId: string;
    reason: string;
  }): Promise<PromoReversal> {
    return WalletPromo.reversePromoCode(params);
  }

  // ── Abschnitt: Gamification & Community → wallet-gamification.ts (03c-W3 L4) ──
  static async getUserStats(userId: string): Promise<UserStats> {
    return WalletGamification.getUserStats(userId);
  }

  static async syncAchievement(params: {
    userId: string;
    achievementId: string;
    progress: number;
    unlocked: boolean;
  }): Promise<void> {
    return WalletGamification.syncAchievement(params);
  }

  // ── Abschnitt: Provably-Fair Seeds — Verwaltung & Historie → wallet-seeds.ts (03c-W3 L3) ──
  static async getUserSeeds(userId: string): Promise<UserSeedChain> {
    return WalletSeeds.getUserSeeds(userId);
  }

  static async rotateUserSeed(params: {
    userId: string;
    clientSeed: string;
  }): Promise<RotatedSeed> {
    return WalletSeeds.rotateUserSeed(params);
  }

  static async getSeedHistory(userId: string): Promise<SeedHistoryEntry[]> {
    return WalletSeeds.getSeedHistory(userId);
  }

  // ── Abschnitt: Social & Chat → wallet-social.ts (03c-W3 L2) ──
  static async getChatMessages(limit = 50) {
    return WalletSocial.getChatMessages(limit);
  }

  static async postChatMessage(params: { userId: string; message: string }) {
    return WalletSocial.postChatMessage(params);
  }

  static async getCommunityStats() {
    return WalletSocial.getCommunityStats();
  }

  // Jackpot-Pool + Daily-Race-Standings → wallet-gamification.ts (03c-W3 L4)
  static async getJackpotPool(): Promise<{ currentAmount: number; lastWonAt: string | null }> {
    return WalletGamification.getJackpotPool();
  }

  static async getDailyRaceStandings(): Promise<DailyRaceSnapshot> {
    return WalletGamification.getDailyRaceStandings();
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

  static async getGameActiveRound(params: {
    userId: string;
    game: 'CRASH' | 'BLACKJACK' | 'CRASH_MULTIPLAYER';
  }) {
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

  static async emitBigWinNotifyEvent(params: {
    userId: string;
    requestId: string;
    game: string;
    payout: number;
    multiplier: number;
  }): Promise<void> {
    return WalletGamification.emitBigWinNotifyEvent(params);
  }

  /**
   * Links a just-started CRASH game_rounds row to its shared crash_rounds
   * room (worldmap/05_multiplayercrash.md, Option C). Pure reference write —
   * no balance/XP mutation, so a direct update outside the advisory-lock RPC
   * chain is safe (mirrors how start_game_round itself has no financial
   * side effect from this column). Best-effort: a failure here only means
   * the live player list won't show this bet, never a settlement risk.
   */
  static async linkCrashRound(roundId: string, crashRoundId: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('game_rounds')
      .update({ crash_round_id: crashRoundId })
      .eq('id', roundId);
    if (error) {
      CasinoLogger.warn('WalletService', 'Failed to link crash round', error);
    }
  }

  /**
   * Distinct users who have an ACTIVE or SETTLED bet tied to this shared
   * crash round, for the live player list (FR3). Read-only, service-role
   * only (game_rounds has no client grants) — never exposes raw user_id to
   * the browser; callers must derive a display label themselves.
   */
  static async getCrashRoundParticipants(crashRoundId: string): Promise<
    Array<{
      userId: string;
      betAmount: number;
      status: 'ACTIVE' | 'SETTLED';
      state: Record<string, unknown>;
    }>
  > {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('game_rounds')
      .select('user_id, bet_amount, status, state, created_at')
      .eq('crash_round_id', crashRoundId)
      .in('game', ['CRASH', 'CRASH_MULTIPLAYER'])
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      userId: String(row.user_id),
      betAmount: Number(row.bet_amount),
      status: row.status === 'SETTLED' ? 'SETTLED' : 'ACTIVE',
      state: z.record(z.string(), z.unknown()).parse(row.state ?? {}),
    }));
  }
}

// 03c-W3 L1 Contract-Guard: TypeScript prüft `implements` nur auf der Instanz-Seite, nicht auf
// `static` — diese Zuweisung ist der Ersatz. Sie erzwingt per `npm run typecheck`, dass die
// Fassade weiterhin alle 26 Verfahren der 7 Domänen-Verträge anbietet; ein verlorenes Verfahren
// oder eine gedriftete Signatur wird damit zum Build-Fehler statt zum Laufzeitfehler im Endpunkt.
export const walletServiceContract: WalletServiceContract = WalletService;
