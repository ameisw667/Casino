import { after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { CasinoCore } from '@/lib/casino/casino-core';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { WalletService, isFirstBetSignal } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { notifyBigWinIfEligible } from '@/lib/casino/telegram-notifier';
import { recordBetNetworkFingerprintBestEffort } from '@/lib/casino/network-fingerprint';
import { recordBetPlacedBestEffort } from '@/lib/security/bet-velocity-guard';
import { checkWellbeingGuard, wellbeingApiError } from '@/lib/casino/responsible-gambling';
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
import { durationMsForCrashPoint } from '@/lib/casino/crash-round';

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

// C1 (TO-04): tolerance for |Σ bets[].amount − amount|, covering only float
// noise — the legit client sums the exact same stakes it sends.
const ROULETTE_STAKE_TOLERANCE = 0.005;

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
    // Registers even on early-return paths (401/429/400) so their auth-resolve span
    // still gets exported. Guarded: `after()` throws when called outside a real Next.js
    // request scope (e.g. route handlers invoked directly in unit tests), and losing a
    // trace flush must never be allowed to break the response itself.
    after(() => flushBetPathTracer());
  } catch {
    // Not in a request scope (test harness) — nothing to flush to.
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
      enforceRateLimit(getClientIdentifier(request, userId), 'casino-bet', 30, 10),
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

    // 06_2 L1/L3: server-authoritative wellbeing guard (self-exclusion + daily loss
    // limit) — a blocked user cannot play regardless of the client. DB failure fails
    // closed (503), never silently allowed. Sits AFTER the rate limit (security review:
    // the remote limiter must shed load before any DB query runs on the money path).
    const wellbeing = await checkWellbeingGuard(userId);
    const wellbeingError = wellbeingApiError(wellbeing);
    if (wellbeingError) {
      return apiErrorResponse(
        wellbeingError.code,
        wellbeingError.message,
        wellbeingError.httpStatus,
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
      const seed = await WalletService.consumeActiveSeed({
        userId,
        requestId: params.requestId,
      });
      const crash = await CasinoCore.startCrashRound(
        params.clientSeed,
        seed.serverSeed,
        seed.serverSeedHash,
        seed.nonce,
        gameConfig,
      );
      let round;
      try {
        round = await WalletService.startRound({
          userId,
          requestId: params.requestId,
          game: 'CRASH',
          amount: params.amount,
          state: {
            crashPoint: crash.crashPoint,
            serverSeed: crash.seed,
            serverSeedHash: crash.hash,
            nonce: crash.nonce,
            clientSeed: params.clientSeed,
            startedAtMs: Date.now(),
          },
        });
      } catch (err) {
        if (err instanceof Error && err.message === 'ACTIVE_CRASH_ROUND_EXISTS') {
          const reconciled = await WalletService.autoReconcileStaleCrashRound(userId);
          if (reconciled) {
            round = await WalletService.startRound({
              userId,
              requestId: params.requestId,
              game: 'CRASH',
              amount: params.amount,
              state: {
                crashPoint: crash.crashPoint,
                serverSeed: crash.seed,
                serverSeedHash: crash.hash,
                nonce: crash.nonce,
                clientSeed: params.clientSeed,
                startedAtMs: Date.now(),
              },
            });
          } else {
            return apiErrorResponse(
              APP_ERROR_CODES.CONFLICT,
              'Eine Crash-Runde ist bereits aktiv.',
              409,
              { requestId: params.requestId },
            );
          }
        } else {
          throw err;
        }
      }
      const isFirstBet = await isFirstBetSignal(userId, round.replayed);
      // 06_1 L5 realtime bet-velocity hint — deferred so it never adds latency to the
      // wager response; skipped for replays (no money moved, no DB bet row) and guarded
      // because after() throws outside a real request scope (test harness).
      if (!round.replayed) {
        try {
          after(() => recordBetPlacedBestEffort(userId));
        } catch {
          // Hint is observability-only — losing it must never affect the wager response.
        }
      }
      const targetMultiplier = crash.crashPoint;
      return apiSuccessResponse({
        roundId: round.roundId,
        hash: crash.hash,
        nonce: crash.nonce,
        wallet: walletOnly({ ...round, result: undefined }),
        replayed: round.replayed,
        isFirstBet,
        targetMultiplier,
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
      const crashPoint = z.coerce.number().positive().parse(round.state.crashPoint);
      // Never return the raw serverSeed here: it is the user's shared,
      // still-active chain seed (reused across Dice/Roulette/Slots/Crash
      // until the next rotation), not a per-round throwaway anymore. Only
      // the hash + nonce are safe to disclose; the raw seed is revealed
      // exclusively via rotate_user_seed()'s seed_history mechanism.
      const serverSeedHash = z.string().min(1).parse(round.state.serverSeedHash);
      const crashNonce = z.coerce.number().int().nonnegative().parse(round.state.nonce);
      const requestedMultiplier = params.cashoutMultiplier ?? crashPoint;
      if (
        params.action === 'CASHOUT_CRASH' &&
        round.state &&
        typeof round.state.startedAtMs === 'number'
      ) {
        const expectedDurationMs = durationMsForCrashPoint(requestedMultiplier);
        const elapsedMs = Date.now() - round.state.startedAtMs;
        // 1500ms network latency window, prevents premature API cashout claims
        if (elapsedMs < expectedDurationMs - 1500) {
          return apiErrorResponse(
            APP_ERROR_CODES.VALIDATION_FAILED,
            'Cashout ungültig: Flugzeit noch nicht erreicht.',
            400,
            { requestId: params.requestId },
          );
        }
      }
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
        game: 'CRASH',
        payout: result.payout,
        multiplier: result.multiplier,
        win: result.win,
        replayed: settlement.replayed,
      });
      return apiSuccessResponse({
        ...(settlement.result as object),
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

    // Narrowed to plain locals (not `params.amount`/`params.gameType`) so the
    // `!== undefined` checks above still hold inside the withBetPathSpan closures below —
    // TS does not carry property-access narrowing across a function boundary.
    const amount = params.amount;
    const gameType = params.gameType;

    // C1 (TO-04 fund matrix): settlement debits `amount`, but the roulette
    // payout is derived from the individual bets[] stakes — leaving the two
    // uncoupled would let a request pay out on stake it never wagered
    // (zero-trust mandate 1: the server controls the bet).
    if (gameType === 'ROULETTE') {
      const bets = params.bets;
      if (!bets || bets.length === 0) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Roulette erfordert mindestens eine Einzelwette.',
          400,
          { requestId: params.requestId },
        );
      }
      const totalStake = Math.round(bets.reduce((sum, bet) => sum + bet.amount, 0) * 100) / 100;
      if (totalStake <= 0 || Math.abs(totalStake - amount) > ROULETTE_STAKE_TOLERANCE) {
        return apiErrorResponse(
          APP_ERROR_CODES.VALIDATION_FAILED,
          'Die Summe der Einzelwetten muss dem Einsatz entsprechen.',
          400,
          { requestId: params.requestId },
        );
      }
      if (bets.some((bet) => bet.amount > gameConfig.limits.maxBetHardcap)) {
        return apiErrorResponse(
          APP_ERROR_CODES.BET_LIMIT_EXCEEDED,
          'Eine Einzelwette überschreitet das erlaubte Limit.',
          400,
          { requestId: params.requestId },
        );
      }
    }

    const seed = await withBetPathSpan('seed-consume', () =>
      WalletService.consumeActiveSeed({ userId, requestId: params.requestId }),
    );
    const { generated, jackpotRoll } = await withBetPathSpan('place-bet-rng', async () => {
      const generatedResult = await CasinoCore.placeBet(
        {
          gameType,
          amount,
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
      const jackpotRollResult = await ProvablyFairEngine.getJackpotRoll(
        seed.serverSeed,
        params.clientSeed,
        seed.nonce,
      );
      return { generated: generatedResult, jackpotRoll: jackpotRollResult };
    });
    const result = {
      ...generated,
      game: gameType,
      amount,
      multiplier: amount > 0 ? generated.payout / amount : 0,
      jackpotRoll,
    };
    const settlement = await withBetPathSpan('settle-bet-rpc', () =>
      WalletService.settleBet({
        userId,
        requestId: params.requestId,
        resultId: generated.id,
        game: gameType,
        amount,
        payout: generated.payout,
        xpGain: CasinoCore.calculateXpGain(amount, 1, gameConfig),
        result,
        serverSeedHash: generated.serverSeedHash,
        nonce: generated.nonce,
      }),
    );
    await notifyBigWinIfEligible({
      userId,
      requestId: params.requestId,
      game: gameType,
      payout: result.payout,
      multiplier: result.multiplier,
      win: result.win,
      replayed: settlement.replayed,
    });
    // 06_1 L5 realtime bet-velocity hint — deferred so it never adds latency to the
    // settlement response; skipped for replays (no money moved, no DB bet row) and guarded
    // because after() throws outside a real request scope (test harness).
    if (!settlement.replayed) {
      try {
        after(() => recordBetPlacedBestEffort(userId));
      } catch {
        // Hint is observability-only — losing it must never affect the settlement response.
      }
    }
    const isFirstBet = await isFirstBetSignal(userId, settlement.replayed);

    return withBetPathSpan('response-serialize', async () =>
      apiSuccessResponse({
        ...(settlement.result as object),
        wallet: walletOnly(settlement),
        replayed: settlement.replayed,
        isFirstBet,
      }),
    );
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
