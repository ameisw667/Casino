import { NextResponse } from 'next/server';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET() {
  try {
    const stats = await WalletService.getCommunityStats();
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Community', 'Failed to fetch community stats', error);
    return NextResponse.json(
      { communityWagered: 0, communityGoal: 25000.0, communityGoalReached: false },
      { status: 200 },
    );
  }
}
