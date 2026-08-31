import { createClient } from '@/utils/supabase/server';
import { createAnalyticsDistinctId } from '@/lib/analytics/identity-hmac';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';

const HMAC_VERSION = 1;

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
      return apiErrorResponse('AUTHENTICATION_REQUIRED', 'Bitte melde dich an.', 401);
    }

    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'analytics-identity',
      10,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'SERVICE_UNAVAILABLE' : 'RATE_LIMITED',
        rate.unavailable
          ? 'Der Dienst ist vorübergehend nicht verfügbar.'
          : 'Zu viele Anfragen. Bitte versuche es später erneut.',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const distinctId = createAnalyticsDistinctId(userId);
    if (!distinctId) {
      // Secret missing/misconfigured — fail closed, never fall back to the raw user id.
      return apiErrorResponse(
        'SERVICE_UNAVAILABLE',
        'Analytics-Identität derzeit nicht verfügbar.',
        503,
      );
    }

    return apiSuccessResponse(
      { distinctId, version: HMAC_VERSION },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Analytics/Identity', 'Identity lookup failed closed', error);
    return apiErrorResponse(
      'SERVICE_UNAVAILABLE',
      'Analytics-Identität derzeit nicht verfügbar.',
      503,
    );
  }
}
