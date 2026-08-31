import { apiSuccessResponse } from '@/lib/api/response';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import { secondsUntilNextUtcMidnight } from '@/lib/casino/daily-race';

export async function GET() {
  try {
    const snapshot = await WalletService.getDailyRaceStandings();
    return apiSuccessResponse(snapshot, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/DailyRace', 'Failed to fetch daily race standings', error);
    return apiSuccessResponse(
      { standings: [], secondsUntilResetUtc: secondsUntilNextUtcMidnight() },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
