import { apiSuccessResponse } from '@/lib/api/response';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET() {
  try {
    const pool = await WalletService.getJackpotPool();
    return apiSuccessResponse(pool, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/Jackpot', 'Failed to fetch jackpot pool', error);
    return apiSuccessResponse(
      { currentAmount: 0, lastWonAt: null },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
