import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { BlackjackEngine, type BlackjackGameState, type Card } from '@/lib/games/blackjack';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { WalletService, isFirstBetSignal } from '@/lib/casino/wallet';
import { CasinoCore } from '@/lib/casino/casino-core';
import { CasinoLogger } from '@/lib/casino/logger';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import { notifyBigWinIfEligible } from '@/lib/casino/telegram-notifier';
import { recordBetNetworkFingerprintBestEffort } from '@/lib/casino/network-fingerprint';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { APP_ERROR_CODES, apiErrorResponse, zodErrorResponse } from '@/lib/security/form-errors';

const dealSchema = z.object({
  action: z.literal('DEAL'),
  requestId: z.string().uuid(),
  amount: z.number().finite().positive(),
  clientSeed: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
});

const actionSchema = z.object({
  action: z.enum(['HIT', 'STAND', 'DOUBLE', 'SPLIT']),
  requestId: z.string().uuid(),
  roundId: z.string().uuid(),
  version: z.number().int().positive(),
});

const requestSchema = z.discriminatedUnion('action', [dealSchema, actionSchema]);

export function publicState(state: BlackjackGameState): BlackjackGameState {
  const hiddenDealerCards = state.dealerHand.cards.map((card, index) =>
    index === 1 && card.faceDown
      ? ({ suit: 'spades', value: 'A', numericValue: 0, faceDown: true } satisfies Card)
      : card,
  );
  // Round state carries provably-fair seed material server-side between
  // actions (serverSeed is the shared, still-active chain seed reused
  // across Dice/Roulette/Slots/Crash/Blackjack until rotation — never a
  // per-round throwaway; see seed-chain-security-surface.test.ts). Strip it
  // here, the one choke point every HIT/STAND/DOUBLE/SPLIT/DEAL and
  // active-round response already passes through, instead of relying on
  // each caller to remember to sanitize first — every action route below
  // used to call this directly without doing so.
  const {
    serverSeed: _serverSeed,
    clientSeed: _clientSeed,
    ...withoutSeeds
  } = state as unknown as Record<string, unknown>;
  return {
    ...(withoutSeeds as unknown as BlackjackGameState),
    deck: [],
    dealerHand: { ...state.dealerHand, cards: hiddenDealerCards },
  };
}

function walletFrom(value: {
  balance: number;
  xp: number;
  level: number;
  rank: string;
  transactionId: string;
}) {
  return {
    balance: value.balance,
    xp: value.xp,
    level: value.level,
    rank: value.rank,
    transactionId: value.transactionId,
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

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'blackjack-action',
      20,
      10,
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

    // Fraud-signal observability only (P2.8) — deferred via after() so it never adds latency
    // to or can affect the settlement response below. Fail-open, best-effort.
    after(() => recordBetNetworkFingerprintBestEffort(userId, request));

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return zodErrorResponse(parsed.error, 400);
    const input = parsed.data;
    requestId = input.requestId;
    const config = await loadGameConfig();

    if (input.action === 'DEAL') {
      if (input.amount > config.limits.betMax)
        return apiErrorResponse(
          APP_ERROR_CODES.BET_LIMIT_EXCEEDED,
          'Der Einsatz überschreitet das erlaubte Limit.',
          400,
          { requestId: input.requestId },
        );
      const consumed = await WalletService.consumeActiveSeed({
        userId,
        requestId: input.requestId,
      });
      const seed = consumed.serverSeed;
      const hash = consumed.serverSeedHash;
      const nonce = consumed.nonce;
      const indices = await ProvablyFairEngine.getBlackjackDeal(seed, input.clientSeed, nonce, 312);
      const dealt = BlackjackEngine.deal(
        BlackjackEngine.shuffleDeck(BlackjackEngine.createDeck(6), indices),
      );
      const state: BlackjackGameState = { ...dealt, phase: 'PLAYER_TURN' };
      const round = await WalletService.startRound({
        userId,
        requestId: input.requestId,
        game: 'BLACKJACK',
        amount: input.amount,
        state: {
          ...state,
          serverSeed: seed,
          serverSeedHash: hash,
          nonce,
          clientSeed: input.clientSeed,
        },
      });
      const isFirstBet = await isFirstBetSignal(userId, round.replayed);
      return NextResponse.json({
        roundId: round.roundId,
        version: round.version,
        gameState: publicState(state),
        serverSeedHash: hash,
        nonce,
        wallet: walletFrom(round),
        replayed: round.replayed,
        isFirstBet,
      });
    }

    const round = await WalletService.getActiveRound(userId, input.roundId, 'BLACKJACK');
    if (round.version !== input.version)
      return apiErrorResponse(
        APP_ERROR_CODES.STALE_GAME_ACTION,
        'Diese Spielaktion ist nicht mehr aktuell. Bitte versuche es erneut.',
        409,
        { requestId: input.requestId },
      );
    let next = round.state as unknown as BlackjackGameState;
    let additionalBet = 0;

    if (input.action === 'HIT') next = BlackjackEngine.hit(next);
    if (input.action === 'STAND') next = BlackjackEngine.stand(next);
    if (input.action === 'DOUBLE') {
      additionalBet = round.betAmount;
      next = BlackjackEngine.double(next);
    }
    if (input.action === 'SPLIT') {
      additionalBet = round.betAmount;
      next = BlackjackEngine.split(next);
    }

    if (next.phase === 'DEALER_TURN')
      next = BlackjackEngine.settleGame(BlackjackEngine.playDealerHand(next));
    const settled = next.phase === 'SETTLEMENT';
    const totalBet = round.betAmount + additionalBet;
    const payout = settled ? Math.round(next.payoutMultiplier * totalBet * 100) / 100 : 0;
    const resultId = crypto.randomUUID();
    let jackpotRoll: number | undefined;
    if (settled) {
      // Raw serverSeed handling stays inside WalletService (same seed-chain
      // security boundary as the Crash cashout/resolve path) rather than
      // being read directly in the route handler — see
      // WalletService.computeRoundJackpotRoll for the rationale.
      const roundNonce = z.coerce.number().int().nonnegative().safeParse(round.state.nonce);
      if (roundNonce.success) {
        jackpotRoll = await WalletService.computeRoundJackpotRoll(round.state, roundNonce.data);
      }
    }
    const result = settled
      ? {
          id: resultId,
          game: 'BLACKJACK',
          win: payout > totalBet,
          payout,
          multiplier: next.payoutMultiplier,
          result: next.result,
          result2: next.result2,
          jackpotRoll,
        }
      : { id: resultId, game: 'BLACKJACK', action: input.action };

    const advanced = await WalletService.advanceBlackjackRound({
      userId,
      roundId: input.roundId,
      requestId: input.requestId,
      resultId,
      expectedVersion: input.version,
      state: next as unknown as Record<string, unknown>,
      additionalBet,
      settled,
      payout,
      xpGain: settled ? CasinoCore.calculateXpGain(totalBet, 1, config) : 0,
      result,
    });

    if (settled) {
      await notifyBigWinIfEligible({
        userId,
        requestId: input.requestId,
        game: 'BLACKJACK',
        payout,
        multiplier: next.payoutMultiplier,
        win: payout > totalBet,
        replayed: advanced.replayed,
      });
    }

    return NextResponse.json({
      roundId: input.roundId,
      version: advanced.version,
      gameState: publicState(advanced.state as BlackjackGameState),
      wallet: walletFrom(advanced),
      settled: advanced.settled,
      result: advanced.result,
      replayed: advanced.replayed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blackjack action failed';
    const insufficientBalance = message === 'Insufficient balance';
    const staleAction = message.startsWith('Stale');
    CasinoLogger.error('API/Casino/Blackjack', 'Blackjack action failed', error, requestId);
    return apiErrorResponse(
      insufficientBalance
        ? APP_ERROR_CODES.INSUFFICIENT_BALANCE
        : staleAction
          ? APP_ERROR_CODES.STALE_GAME_ACTION
          : APP_ERROR_CODES.INTERNAL_ERROR,
      insufficientBalance
        ? 'Dein Guthaben reicht für diesen Einsatz nicht aus.'
        : staleAction
          ? 'Diese Spielaktion ist nicht mehr aktuell. Bitte versuche es erneut.'
          : 'Die Blackjack-Aktion konnte nicht verarbeitet werden.',
      insufficientBalance || staleAction ? 409 : 500,
      { requestId },
    );
  }
}
