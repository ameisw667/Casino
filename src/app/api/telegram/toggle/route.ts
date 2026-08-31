import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { setTelegramNotificationsEnabled } from '@/lib/casino/telegram-link';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const toggleSchema = z.object({ enabled: z.boolean() });

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
      'telegram-toggle',
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

    const parsed = toggleSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiErrorResponse('INVALID_REQUEST', 'Invalid request', 400, undefined, {
        headers: rateLimitHeaders(rate),
      });
    }

    const ok = await setTelegramNotificationsEnabled(userId, parsed.data.enabled);
    if (!ok) {
      return apiErrorResponse(
        'UPDATE_PREFERENCE_FAILED',
        'Failed to update notification preference',
        500,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    return apiSuccessResponse(
      { success: true, enabled: parsed.data.enabled },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (error) {
    CasinoLogger.error('API/Telegram/Toggle', 'Failed to update notification preference', error);
    return apiErrorResponse(
      'UPDATE_PREFERENCE_FAILED',
      'Failed to update notification preference',
      500,
    );
  }
}
