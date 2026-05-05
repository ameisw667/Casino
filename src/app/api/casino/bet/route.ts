import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CasinoCore } from '@/lib/casino/casino-core';
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const params = await req.json();
    // Logic-Architect: Enforce server-side betting execution
    let result;
    if (params.action === 'START_CRASH') {
      result = await CasinoCore.startCrashRound(params.clientSeed, params.currentNonce);
    } else {
      result = await CasinoCore.placeBet(params);
    }
    // In a real production app, we would update the database balance here.
    // For this demo, we return the result and the client updates the store.
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[API][Casino][Bet] Error:', error);
    return new NextResponse((error as Error).message || 'Internal Server Error', { status: 500 });
  }
}