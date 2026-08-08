import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { CasinoCore } from '@/lib/casino/casino-core';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { loadGameConfig } from '@/lib/casino/game-config-server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

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
  clientSeed: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  currentNonce: z.number().int().nonnegative(),
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
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let userId = authUser?.id;
    if (!userId && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true') {
      userId = 'dev_user_fallback';
    }
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'casino-bet', 10, 10);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid Request Data', details: parsed.error.flatten() }, { status: 400 });
    }
    const params = parsed.data;
    const gameConfig = await loadGameConfig();

    if (params.action === 'START_CRASH') {
      if (!params.amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });
      if (params.amount > gameConfig.limits.betMax) return NextResponse.json({ error: 'Bet exceeds limit' }, { status: 400 });
      const crash = await CasinoCore.startCrashRound(params.clientSeed, params.currentNonce, gameConfig);
      const round = await WalletService.startRound({
        userId,
        requestId: params.requestId,
        game: 'CRASH',
        amount: params.amount,
        state: {
          crashPoint: crash.crashPoint,
          serverSeed: crash.seed,
          serverSeedHash: crash.hash,
          nonce: crash.nonce,
        },
      });
      return NextResponse.json({
        roundId: round.roundId,
        crashPoint: crash.crashPoint,
        hash: crash.hash,
        nonce: crash.nonce,
        wallet: walletOnly({ ...round, result: undefined }),
        replayed: round.replayed,
      });
    }

    if (params.action === 'CASHOUT_CRASH' || params.action === 'RESOLVE_CRASH') {
      if (!params.roundId || (params.action === 'CASHOUT_CRASH' && !params.cashoutMultiplier)) {
        return NextResponse.json({ error: 'Round and multiplier required' }, { status: 400 });
      }
      const round = await WalletService.getActiveRound(userId, params.roundId, 'CRASH');
      const crashPoint = z.coerce.number().positive().parse(round.state.crashPoint);
      const serverSeed = z.string().min(1).parse(round.state.serverSeed);
      const requestedMultiplier = params.cashoutMultiplier ?? crashPoint;
      const won = params.action === 'CASHOUT_CRASH' && requestedMultiplier <= crashPoint;
      const payout = won ? Math.round(round.betAmount * requestedMultiplier * 100) / 100 : 0;
      const resultId = crypto.randomUUID();
      const result = {
        id: resultId,
        game: 'CRASH',
        win: won,
        payout,
        multiplier: won ? requestedMultiplier : 0,
        crashPoint,
        serverSeed,
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
      return NextResponse.json({ ...(settlement.result as object), wallet: walletOnly(settlement), replayed: settlement.replayed });
    }

    if (!params.amount || !params.gameType) {
      return NextResponse.json({ error: 'Game and amount required' }, { status: 400 });
    }
    if (params.amount > gameConfig.limits.betMax) return NextResponse.json({ error: 'Bet exceeds limit' }, { status: 400 });

    const generated = await CasinoCore.placeBet({
      gameType: params.gameType,
      amount: params.amount,
      multiplier: params.multiplier,
      target: params.target,
      condition: params.condition,
      bets: params.bets,
      clientSeed: params.clientSeed,
      currentNonce: params.currentNonce,
    }, gameConfig);
    const result = {
      ...generated,
      game: params.gameType,
      amount: params.amount,
      multiplier: params.amount > 0 ? generated.payout / params.amount : 0,
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
    });

    return NextResponse.json({ ...(settlement.result as object), wallet: walletOnly(settlement), replayed: settlement.replayed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    CasinoLogger.error('API/Casino/Bet', 'Server-authoritative settlement failed', error);
    const status = message === 'Insufficient balance' ? 409 : 500;
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : status === 409 ? message : 'Internal Server Error' },
      { status }
    );
  }
}