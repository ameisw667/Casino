import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { getTelegramLinkStatus } from '@/lib/casino/telegram-link';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    let userId = authUser?.id;
    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }
    if (!userId) {
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401, undefined, {
        headers: PRIVATE_NO_STORE_HEADERS,
      });
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'telegram-status',
      30,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        {
          headers: { ...PRIVATE_NO_STORE_HEADERS, ...rateLimitHeaders(rate) },
        },
      );
    }

    const status = await getTelegramLinkStatus(userId);
    return apiSuccessResponse(status, {
      headers: { ...PRIVATE_NO_STORE_HEADERS, ...rateLimitHeaders(rate) },
    });
  } catch (error) {
    CasinoLogger.error('API/Telegram/Status', 'Failed to read telegram link status', error);
    return apiErrorResponse(
      'TELEGRAM_STATUS_FAILED',
      'Failed to read telegram link status',
      500,
      undefined,
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
