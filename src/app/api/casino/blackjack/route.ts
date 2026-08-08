import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { BlackjackEngine, type BlackjackGameState, type Card } from '@/lib/games/blackjack';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoCore } from '@/lib/casino/casino-core';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const dealSchema = z.object({
  action: z.literal('DEAL'),
  requestId: z.string().uuid(),
  amount: z.number().finite().positive(),
  clientSeed: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  currentNonce: z.number().int().nonnegative(),
});

const actionSchema = z.object({
  action: z.enum(['HIT', 'STAND', 'DOUBLE', 'SPLIT']),
  requestId: z.string().uuid(),
  roundId: z.string().uuid(),
  version: z.number().int().positive(),
});

const requestSchema = z.discriminatedUnion('action', [dealSchema, actionSchema]);

function publicState(state: BlackjackGameState): BlackjackGameState {
  const hiddenDealerCards = state.dealerHand.cards.map((card, index) => index === 1 && card.faceDown
    ? ({ suit: 'spades', value: 'A', numericValue: 0, faceDown: true } satisfies Card)
    : card);
  return {
    ...state,
    deck: [],
    dealerHand: { ...state.dealerHand, cards: hiddenDealerCards },
  };
}

function walletFrom(value: { balance: number; xp: number; level: number; rank: string; transactionId: string }) {
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
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let userId = authUser?.id;
    if (!userId && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true') {
      userId = 'dev_user_fallback';
    }
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'blackjack-action', 20, 10);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid blackjack action' }, { status: 400 });
    const input = parsed.data;
    const config = await loadGameConfig();

    if (input.action === 'DEAL') {
      if (input.amount > config.limits.betMax) return NextResponse.json({ error: 'Bet exceeds limit' }, { status: 400 });
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      const nonce = input.currentNonce + 1;
      const indices = await ProvablyFairEngine.getBlackjackDeal(seed, input.clientSeed, nonce, 312);
      const dealt = BlackjackEngine.deal(BlackjackEngine.shuffleDeck(BlackjackEngine.createDeck(6), indices));
      const state: BlackjackGameState = { ...dealt, phase: 'PLAYER_TURN' };
      const round = await WalletService.startRound({
        userId,
        requestId: input.requestId,
        game: 'BLACKJACK',
        amount: input.amount,
        state: { ...state, serverSeed: seed, serverSeedHash: hash, nonce },
      });
      return NextResponse.json({
        roundId: round.roundId,
        version: round.version,
        gameState: publicState(state),
        serverSeedHash: hash,
        nonce,
        wallet: walletFrom(round),
        replayed: round.replayed,
      });
    }

    const round = await WalletService.getActiveRound(userId, input.roundId, 'BLACKJACK');
    if (round.version !== input.version) return NextResponse.json({ error: 'Stale blackjack action' }, { status: 409 });
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

    if (next.phase === 'DEALER_TURN') next = BlackjackEngine.settleGame(BlackjackEngine.playDealerHand(next));
    const settled = next.phase === 'SETTLEMENT';
    const totalBet = round.betAmount + additionalBet;
    const payout = settled ? Math.round(next.payoutMultiplier * totalBet * 100) / 100 : 0;
    const resultId = crypto.randomUUID();
    const result = settled ? {
      id: resultId,
      game: 'BLACKJACK',
      win: payout > totalBet,
      payout,
      multiplier: next.payoutMultiplier,
      result: next.result,
      result2: next.result2,
    } : { id: resultId, game: 'BLACKJACK', action: input.action };

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
    const status = message === 'Insufficient balance' || message.startsWith('Stale') ? 409 : 500;
    return NextResponse.json({ error: process.env.NODE_ENV === 'development' ? message : 'Blackjack action failed' }, { status });
  }
}
