import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { unlinkTelegram } from '@/lib/casino/telegram-link';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

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
    if (!userId) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'telegram-unlink',
      10,
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

    const ok = await unlinkTelegram(userId);
    if (!ok) {
      return apiErrorResponse(
        'DISCONNECT_FAILED',
        'Failed to disconnect telegram',
        500,
        undefined,
        {
          headers: rateLimitHeaders(rate),
        },
      );
    }

    return apiSuccessResponse({ success: true }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Telegram/Unlink', 'Failed to disconnect telegram', error);
    return apiErrorResponse('DISCONNECT_FAILED', 'Failed to disconnect telegram', 500);
  }
}
