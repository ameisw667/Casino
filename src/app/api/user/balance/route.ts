import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { WalletService } from '@/lib/casino/wallet';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  resolveDevFallbackUserId,
} from '@/lib/security/request-security';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    let userId = authUser?.id;
    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');
    if (!userId) {
      userId = resolveDevFallbackUserId(request, isExplicitSignedOut) ?? undefined;
    }
    if (!userId) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'wallet-read',
      30,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    return apiSuccessResponse(await WalletService.getWallet(userId), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    CasinoLogger.error('API/User/Balance', 'Server wallet load failed closed', error);
    return apiErrorResponse('WALLET_UNAVAILABLE', 'Wallet unavailable', 503);
  }
}
