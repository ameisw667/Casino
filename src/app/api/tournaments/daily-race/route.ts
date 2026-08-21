import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { secondsUntilNextUtcMidnight } from '@/lib/casino/daily-race';

export async function GET() {
  try {
    const snapshot = await WalletService.getDailyRaceStandings();
    return NextResponse.json(snapshot, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/DailyRace', 'Failed to fetch daily race standings', error);
    return NextResponse.json(
      { standings: [], secondsUntilResetUtc: secondsUntilNextUtcMidnight() },
      { status: 200 },
    );
  }
}
