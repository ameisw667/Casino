import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET() {
  try {
    const pool = await WalletService.getJackpotPool();
    return NextResponse.json(pool, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Jackpot', 'Failed to fetch jackpot pool', error);
    return NextResponse.json({ currentAmount: 0, lastWonAt: null }, { status: 200 });
  }
}
