import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { CasinoCore } from '@/lib/casino/casino-core';
import { WalletService } from '@/lib/casino/wallet';

// Logic-Architect: Rate Limiter Setup (Optional Redis fallback)
const ratelimit = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/casino',
    })
  : null;

const BetSchema = z.object({
  gameType: z.enum(['DICE', 'SLOTS', 'ROULETTE', 'CRASH', 'BLACKJACK']).optional(),
  amount: z.number().positive().max(10000).optional(),
  multiplier: z.number().optional(),
  target: z.number().optional(),
  condition: z.enum(['OVER', 'UNDER']).optional(),
  payout: z.number().nonnegative().optional(), // For Blackjack settlement
  win: z.boolean().optional(), // For Blackjack settlement
  clientSeed: z.string().min(1).max(64).regex(/^[a-zA-Z0-9]+$/),
  currentNonce: z.number().int().nonnegative(),
  action: z.string().optional(),
  cashoutMultiplier: z.number().positive().optional()
});

export async function POST(req: Request) {
  try {
    const authData = await auth();
    let userId = authData.userId;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API][Casino][Bet] Auth check:', { 
        userId, 
        hasSession: !!authData.sessionId
      });
    }

    // Logic-Architect: Development fallback with explicit double-guard
    if (!userId && process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true') {
      console.warn('[API][Casino][Bet] Using fallback userId for development');
      userId = 'dev_user_fallback';
    }

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 0. Rate Limiting
    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json({ 
          error: 'Too Many Requests',
          details: 'Rate limit exceeded: 10 bets per 10 seconds' 
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        });
      }
    }

    const body = await req.json();
    
    // 1. Input Validation
    const validation = BetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid Request Data', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    const params = validation.data;

    // Logic-Architect: Enforce server-side betting execution
    if (params.action === 'START_CRASH') {
      if (!params.amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });
      const crashData = await CasinoCore.startCrashRound(params.clientSeed, params.currentNonce);
      const wallet = await WalletService.startCrashBet(userId, params.amount, crashData.crashPoint);
      
      return NextResponse.json({
        ...crashData,
        newBalance: wallet.balance,
        xp: wallet.xp,
        level: wallet.level
      });
    } 
    
    if (params.action === 'CASHOUT_CRASH') {
      if (!params.cashoutMultiplier) return NextResponse.json({ error: 'Multiplier required' }, { status: 400 });
      const settlement = await WalletService.settleCrashBet(userId, params.cashoutMultiplier);
      
      return NextResponse.json({
        id: crypto.randomUUID(),
        win: settlement.win,
        payout: settlement.payout,
        newBalance: settlement.balance,
        xp: settlement.xp,
        level: settlement.level
      });
    }

    // Default betting (Dice, Roulette, etc.)
    if (!params.amount || !params.gameType) return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    
    // Logic-Architect: Place bet and handle result
    const result = await CasinoCore.placeBet(params as {
      gameType: 'DICE' | 'SLOTS' | 'ROULETTE' | 'CRASH' | 'BLACKJACK';
      amount: number;
      multiplier?: number;
      target?: number;
      condition?: 'OVER' | 'UNDER';
      payout?: number;
      win?: boolean;
      clientSeed: string;
      currentNonce: number;
    });

    // Logic-Architect: Atomic wallet update on server
    const xpGain = CasinoCore.calculateXpGain(params.amount);
    const wallet = await WalletService.updateWallet(userId, params.amount, result.payout, xpGain);

    return NextResponse.json({
      ...result,
      newBalance: wallet.balance,
      xp: wallet.xp,
      level: wallet.level
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    
    // Security-Auditor: Stack traces are for dev-eyes only
    if (process.env.NODE_ENV === 'development') {
      console.error('[API][Casino][Bet] Critical Failure:', {
        message: msg,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return new NextResponse(
      process.env.NODE_ENV === 'development' ? msg : 'Internal Server Error', 
      { status: 500 }
    );
  }
}