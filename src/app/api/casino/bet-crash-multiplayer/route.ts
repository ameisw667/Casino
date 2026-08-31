import { after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { CasinoCore } from '@/lib/casino/casino-core';
import { WalletService, isFirstBetSignal } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { notifyBigWinIfEligible } from '@/lib/casino/telegram-notifier';
import { recordBetNetworkFingerprintBestEffort } from '@/lib/casino/network-fingerprint';
import {
  isWithinCrashCashoutFairWindow,
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
  resolveDevFallbackUserId,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { withBetPathSpan, flushBetPathTracer } from '@/lib/otel/tracer';
import { APP_ERROR_CODES, apiErrorResponse, zodErrorResponse } from '@/lib/security/form-errors';
import { apiSuccessResponse } from '@/lib/api/response';

const requestSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.number().finite().positive().optional(),
  clientSeed: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  action: z.enum([
    'START_CRASH_MULTIPLAYER',
    'CASHOUT_CRASH_MULTIPLAYER',
    'RESOLVE_CRASH_MULTIPLAYER',
  ]),
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
  // Arrival is stamped before any await so server processing time (auth, rate
  // limit, config load, RPC) never counts as client lateness in the C3
  // fair-window check below.
  const requestArrivalMs = Date.now();
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
    after(() => flushBetPathTracer());
  } catch {
    // Not in a request scope (test harness)
  }

  try {
    const userId = await withBetPathSpan('auth-resolve', async () => {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const cookieHeader = request.headers.get('cookie') || '';
      const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

      return authUser?.id ?? resolveDevFallbackUserId(request, isExplicitSignedOut) ?? undefined;
    });
    if (!userId) {
      return apiErrorResponse(APP_ERROR_CODES.AUTHENTICATION_REQUIRED, 'Bitte melde dich an.', 401);
    }

    const rate = await withBetPathSpan('rate-limit', () =>
      enforceRateLimit(getClientIdentifier(request, userId), 'casino-bet-crash-mp', 30, 10),
    );
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

    after(() => recordBetNetworkFingerprintBestEffort(userId, request));

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, 400);
    }
    const params = parsed.data;
    requestId = params.requestId;
    const gameConfig = await loadGameConfig();

    if (params.action === 'START_CRASH_MULTIPLAYER') {
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
      const existingActive = await WalletService.getGameActiveRound({
        userId,
        game: 'CRASH_MULTIPLAYER',
      });

      if (existingActive.hasActiveRound && existingActive.requestId !== params.requestId) {
        return apiErrorResponse(
          APP_ERROR_CODES.CONFLICT,
          'Du hast bereits eine aktive Crash-Runde.',
          409,
          { requestId: params.requestId },
        );
      }

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
          game: 'CRASH_MULTIPLAYER',
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
      return apiSuccessResponse({
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

    if (
      params.action === 'CASHOUT_CRASH_MULTIPLAYER' ||
      params.action === 'RESOLVE_CRASH_MULTIPLAYER'
    ) {
      if (
        !params.roundId ||
        (params.action === 'CASHOUT_CRASH_MULTIPLAYER' && !params.cashoutMultiplier)
      ) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Runde und Multiplikator sind erforderlich.',
          400,
          { requestId: params.requestId },
        );
      }
      const round = await WalletService.getActiveRound(userId, params.roundId, 'CRASH_MULTIPLAYER');
      const serverSeedHash = z.string().min(1).parse(round.state.serverSeedHash);
      const crashNonce = z.coerce.number().int().nonnegative().parse(round.state.nonce);
      const crashRoundId = z.string().uuid().parse(round.state.crashRoundId);

      const sharedRound = await getCrashRoundById(crashRoundId);
      const crashPoint = z.coerce.number().positive().parse(sharedRound.crashPoint);
      const requestedMultiplier = params.cashoutMultiplier ?? crashPoint;
      // C3 (TO-04 fund matrix): the payout is authorized against the server
      // round clock — the client claim alone (requestedMultiplier <= crashPoint)
      // is insufficient, see isWithinCrashCashoutFairWindow for the three gates.
      const isClaimInFairWindow = isWithinCrashCashoutFairWindow({
        nowMs: requestArrivalMs,
        bettingEndsAtMs: new Date(sharedRound.bettingEndsAt).getTime(),
        crashedAtMs: sharedRound.crashedAt ? Date.parse(sharedRound.crashedAt) : null,
        requestedMultiplier,
      });
      const won =
        params.action === 'CASHOUT_CRASH_MULTIPLAYER' &&
        requestedMultiplier <= crashPoint &&
        isClaimInFairWindow;
      const payout = won ? Math.round(round.betAmount * requestedMultiplier * 100) / 100 : 0;
      const resultId = crypto.randomUUID();
      const jackpotRoll = await WalletService.computeRoundJackpotRoll(round.state, crashNonce);
      const result = {
        id: resultId,
        game: 'CRASH_MULTIPLAYER',
        win: won,
        payout,
        multiplier: won ? requestedMultiplier : 0,
        crashPoint,
        serverSeedHash,
        nonce: crashNonce,
        jackpotRoll,
      };
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
        requestId: params.requestId,
        game: 'CRASH_MULTIPLAYER',
        payout: result.payout,
        multiplier: result.multiplier,
        win: result.win,
        replayed: settlement.replayed,
      });
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
      return apiSuccessResponse({
        ...(settlement.result as object),
        crashPoint: revealCrashPoint ? crashPoint : null,
        wallet: walletOnly(settlement),
        replayed: settlement.replayed,
      });
    }

    return apiErrorResponse(APP_ERROR_CODES.VALIDATION_FAILED, 'Ungültige Aktion.', 400, {
      requestId: params.requestId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    CasinoLogger.error(
      'API/Casino/BetCrashMultiplayer',
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
