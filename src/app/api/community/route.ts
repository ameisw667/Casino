import { apiSuccessResponse } from '@/lib/api/response';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET() {
  try {
    const stats = await WalletService.getCommunityStats();
    return apiSuccessResponse(stats, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Community', 'Failed to fetch community stats', error);
    return apiSuccessResponse(
      { communityWagered: 0, communityGoal: 25000.0, communityGoalReached: false },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
