import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { CasinoCore } from '@/lib/casino/casino-core';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { WalletService, isFirstBetSignal } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { notifyBigWinIfEligible } from '@/lib/casino/telegram-notifier';
import { recordBetNetworkFingerprintBestEffort } from '@/lib/casino/network-fingerprint';
import {
  ensureCurrentCrashRound,
  getCrashRoundById,
  toPublicRoundState,
  deriveSeatLabel,
} from '@/lib/casino/crash-round';
import { publishCrashRoundState, publishCrashPlayerEvent } from '@/lib/casino/realtime';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { APP_ERROR_CODES, apiErrorResponse, zodErrorResponse } from '@/lib/security/form-errors';

const rouletteBetSchema = z.object({
  type: z.object({
    type: z.enum(['STRAIGHT', 'COLOR', 'EVEN_ODD', 'RANGE', 'DOZEN', 'COLUMN', 'FRENCH']),
    value: z.union([z.number().int(), z.string().min(1).max(32)]),
  }),
  amount: z.number().finite().positive(),
});

const requestSchema = z.object({
  requestId: z.string().uuid(),
  gameType: z.enum(['DICE', 'SLOTS', 'ROULETTE']).optional(),
  amount: z.number().finite().positive().optional(),
  multiplier: z.number().finite().positive().optional(),
  target: z.number().finite().optional(),
  condition: z.enum(['OVER', 'UNDER']).optional(),
  bets: z.array(rouletteBetSchema).max(100).optional(),
  clientSeed: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  action: z.enum(['START_CRASH', 'CASHOUT_CRASH', 'RESOLVE_CRASH']).optional(),
  roundId: z.string().uuid().optional(),
  cashoutMultiplier: z.number().finite().min(1).max(1_000_000).optional(),
});

function walletOnly(settlement: Awaited<ReturnType<typeof WalletService.settleBet>>) {
  return {
    balance: settlement.balance,
    xp: settlement.xp,
    level: settlement.level,
    rank: settlement.rank,
    transactionId: settlement.transactionId,
  };
}

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) {
    return apiErrorResponse(
      APP_ERROR_CODES.PERMISSION_DENIED,
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  }

  let requestId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    let userId = authUser?.id;
    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }
    if (!userId) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'casino-bet', 30, 10);
    if (!rate.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000));
      return apiErrorResponse(
        rate.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        { headers: rateLimitHeaders(rate), extra: { retryAfter: retryAfterSeconds } },
      );
    }

    // Fraud-signal observability only (P2.8) — deferred via after() so it never adds latency
    // to or can affect the settlement response below. Fail-open, best-effort.
    after(() => recordBetNetworkFingerprintBestEffort(userId, request));

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
    }
    const params = parsed.data;
    requestId = params.requestId;
    const gameConfig = await loadGameConfig();

    if (params.action === 'START_CRASH') {
      if (!params.amount) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Ein gültiger Einsatz ist erforderlich.',
          400,
          { requestId: params.requestId },
        );
      }
      if (params.amount > gameConfig.limits.betMax)
        return apiErrorResponse(
          APP_ERROR_CODES.BET_LIMIT_EXCEEDED,
          'Der Einsatz überschreitet das erlaubte Limit.',
          400,
          { requestId: params.requestId },
        );
      // Security-review finding (2026-08-21, worldmap/05_multiplayercrash.md
      // L6): a single account holding two simultaneous ACTIVE crash rounds
      // in the same shared room was the precondition that turned the
      // crashPoint-masking gap into a single-account exploit (sacrifice one
      // cashout to read the room's secret, guarantee-win the other). The
      // authoritative guard now lives inside start_game_round's own
      // advisory-locked critical section (migration 037's redefinition) —
      // this is only a fast pre-check for a clean error message; it is a
      // TOCTOU race on its own (two parallel requests can both pass it) and
      // must never be relied on as the actual guarantee.
      const existingActive = await WalletService.getGameActiveRound({ userId, game: 'CRASH' });
      if (existingActive.hasActiveRound && existingActive.requestId !== params.requestId) {
        return apiErrorResponse(
          APP_ERROR_CODES.CONFLICT,
          'Du hast bereits eine aktive Crash-Runde.',
          409,
          { requestId: params.requestId },
        );
      }

      // Private per-user seed chain — kept only for the jackpot-roll and the
      // existing "verify your seed" UI. It no longer determines the CRASH
      // multiplier itself; the shared room's crash_rounds row does that now
      // (worldmap/05_multiplayercrash.md §4.3, Option C).
      const seed = await WalletService.consumeActiveSeed({
        userId,
        requestId: params.requestId,
      });

      const sharedRound = await ensureCurrentCrashRound(gameConfig);
      after(() => publishCrashRoundState(toPublicRoundState(sharedRound)));
      if (sharedRound.status !== 'WAITING') {
        return apiErrorResponse(
          APP_ERROR_CODES.CONFLICT,
          'Die Runde läuft bereits — bitte auf das nächste Wettfenster warten.',
          409,
          { requestId: params.requestId },
        );
      }

      let round;
      try {
        round = await WalletService.startRound({
          userId,
          requestId: params.requestId,
          game: 'CRASH',
          amount: params.amount,
          state: {
            crashRoundId: sharedRound.id,
            serverSeed: seed.serverSeed,
            serverSeedHash: seed.serverSeedHash,
            nonce: seed.nonce,
            clientSeed: params.clientSeed,
          },
        });
      } catch (error) {
        // The TS pre-check above raced and missed a concurrent START_CRASH —
        // start_game_round's own advisory-locked guard (migration 037) is
        // the actual authority here and just caught it.
        if (error instanceof Error && error.message === 'ACTIVE_CRASH_ROUND_EXISTS') {
          return apiErrorResponse(
            APP_ERROR_CODES.CONFLICT,
            'Du hast bereits eine aktive Crash-Runde.',
            409,
            { requestId: params.requestId },
          );
        }
        throw error;
      }
      if (!round.replayed) {
        await WalletService.linkCrashRound(round.roundId, sharedRound.id);
        after(async () => {
          const participants = await WalletService.getCrashRoundParticipants(sharedRound.id);
          await publishCrashPlayerEvent({
            crashRoundId: sharedRound.id,
            seat: deriveSeatLabel(participants, userId),
            betAmount: params.amount as number,
            action: 'BET',
            multiplier: null,
            payout: null,
          });
        });
      }
      const isFirstBet = await isFirstBetSignal(userId, round.replayed);
      return NextResponse.json({
        roundId: round.roundId,
        crashRoundId: sharedRound.id,
        bettingEndsAt: sharedRound.bettingEndsAt,
        hash: seed.serverSeedHash,
        nonce: seed.nonce,
        wallet: walletOnly({ ...round, result: undefined }),
        replayed: round.replayed,
        isFirstBet,
      });
    }

    if (params.action === 'CASHOUT_CRASH' || params.action === 'RESOLVE_CRASH') {
      if (!params.roundId || (params.action === 'CASHOUT_CRASH' && !params.cashoutMultiplier)) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Runde und Multiplikator sind erforderlich.',
          400,
          { requestId: params.requestId },
        );
      }
      const round = await WalletService.getActiveRound(userId, params.roundId, 'CRASH');
      // Never return the raw serverSeed here: it is the user's shared,
      // still-active chain seed (reused across Dice/Roulette/Slots/Crash
      // until the next rotation), not a per-round throwaway anymore. Only
      // the hash + nonce are safe to disclose; the raw seed is revealed
      // exclusively via rotate_user_seed()'s seed_history mechanism.
      const serverSeedHash = z.string().min(1).parse(round.state.serverSeedHash);
      const crashNonce = z.coerce.number().int().nonnegative().parse(round.state.nonce);
      const crashRoundId = z.string().uuid().parse(round.state.crashRoundId);

      // The exact shared round this bet joined — its crash_point was fixed
      // at creation, so a direct (non-advancing) read is correct here even
      // if the room has since moved on to a newer round. Nudging the global
      // scheduler is a separate concern, see below.
      const sharedRound = await getCrashRoundById(crashRoundId);
      const crashPoint = z.coerce.number().positive().parse(sharedRound.crashPoint);
      const requestedMultiplier = params.cashoutMultiplier ?? crashPoint;
      const won = params.action === 'CASHOUT_CRASH' && requestedMultiplier <= crashPoint;
      const payout = won ? Math.round(round.betAmount * requestedMultiplier * 100) / 100 : 0;
      const resultId = crypto.randomUUID();
      const jackpotRoll = await WalletService.computeRoundJackpotRoll(round.state, crashNonce);
      const result = {
        id: resultId,
        game: 'CRASH',
        win: won,
        payout,
        multiplier: won ? requestedMultiplier : 0,
        crashPoint,
        serverSeedHash,
        nonce: crashNonce,
        jackpotRoll,
      };
      // Security-review finding (2026-08-21, worldmap/05_multiplayercrash.md
      // L6): `result` above carries the TRUE crash_point and is correct to
      // persist as-is (own bet history, unaffected by room timing). But
      // echoing it back in THIS response unconditionally — regardless of
      // sharedRound.status — let a client with two simultaneous bets in the
      // same shared round "sacrifice" one cashout to read the room's secret
      // crash_point mid-flight, then guarantee-win the second. FR5 requires
      // the same masking here as toPublicRoundState() applies everywhere
      // else: never reveal it before the room has actually crashed.
      const revealCrashPoint = sharedRound.status === 'CRASHED';
      const settlement = await WalletService.settleRound({
        userId,
        roundId: params.roundId,
        requestId: params.requestId,
        resultId,
        payout,
        xpGain: CasinoCore.calculateXpGain(round.betAmount, 1, gameConfig),
        result,
      });
      await notifyBigWinIfEligible({
        userId,
        game: 'CRASH',
        payout: result.payout,
        multiplier: result.multiplier,
        win: result.win,
        replayed: settlement.replayed,
      });
      // Opportunistically nudge the shared clock forward for every other
      // player in the room — unrelated to this specific settlement, but any
      // request touching Crash is a valid trigger (§4.2, lazy scheduler).
      // Best-effort, never blocks this response.
      after(async () => {
        const latestRound = await ensureCurrentCrashRound(gameConfig);
        await publishCrashRoundState(toPublicRoundState(latestRound));
        if (!settlement.replayed) {
          const participants = await WalletService.getCrashRoundParticipants(crashRoundId);
          await publishCrashPlayerEvent({
            crashRoundId,
            seat: deriveSeatLabel(participants, userId),
            betAmount: round.betAmount,
            action: won ? 'CASHOUT' : 'BUST',
            multiplier: won ? requestedMultiplier : null,
            payout: won ? payout : null,
          });
        }
      });
      return NextResponse.json({
        ...(settlement.result as object),
        crashPoint: revealCrashPoint ? crashPoint : null,
        wallet: walletOnly(settlement),
        replayed: settlement.replayed,
      });
    }

    if (!params.amount || !params.gameType) {
      return apiErrorResponse(
        APP_ERROR_CODES.VALIDATION_FAILED,
        'Spiel und Einsatz sind erforderlich.',
        400,
        { requestId: params.requestId },
      );
    }
    if (params.amount > gameConfig.limits.betMax)
      return apiErrorResponse(
        APP_ERROR_CODES.BET_LIMIT_EXCEEDED,
        'Der Einsatz überschreitet das erlaubte Limit.',
        400,
        { requestId: params.requestId },
      );

    const seed = await WalletService.consumeActiveSeed({ userId, requestId: params.requestId });
    const generated = await CasinoCore.placeBet(
      {
        gameType: params.gameType,
        amount: params.amount,
        multiplier: params.multiplier,
        target: params.target,
        condition: params.condition,
        bets: params.bets,
        clientSeed: params.clientSeed,
        serverSeed: seed.serverSeed,
        serverSeedHash: seed.serverSeedHash,
        nonce: seed.nonce,
      },
      gameConfig,
    );
    const jackpotRoll = await ProvablyFairEngine.getJackpotRoll(
      seed.serverSeed,
      params.clientSeed,
      seed.nonce,
    );
    const result = {
      ...generated,
      game: params.gameType,
      amount: params.amount,
      multiplier: params.amount > 0 ? generated.payout / params.amount : 0,
      jackpotRoll,
    };
    const settlement = await WalletService.settleBet({
      userId,
      requestId: params.requestId,
      resultId: generated.id,
      game: params.gameType,
      amount: params.amount,
      payout: generated.payout,
      xpGain: CasinoCore.calculateXpGain(params.amount, 1, gameConfig),
      result,
      serverSeedHash: generated.serverSeedHash,
      nonce: generated.nonce,
    });
    await notifyBigWinIfEligible({
      userId,
      game: params.gameType,
      payout: result.payout,
      multiplier: result.multiplier,
      win: result.win,
      replayed: settlement.replayed,
    });
    const isFirstBet = await isFirstBetSignal(userId, settlement.replayed);

    return NextResponse.json({
      ...(settlement.result as object),
      wallet: walletOnly(settlement),
      replayed: settlement.replayed,
      isFirstBet,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    CasinoLogger.error(
      'API/Casino/Bet',
      'Server-authoritative settlement failed',
      error,
      requestId,
    );
    const insufficientBalance = message === 'Insufficient balance';
    return apiErrorResponse(
      insufficientBalance ? APP_ERROR_CODES.INSUFFICIENT_BALANCE : APP_ERROR_CODES.INTERNAL_ERROR,
      insufficientBalance
        ? 'Dein Guthaben reicht für diesen Einsatz nicht aus.'
        : 'Die Spielaktion konnte nicht verarbeitet werden.',
      insufficientBalance ? 409 : 500,
      { requestId },
    );
  }
}
