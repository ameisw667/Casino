import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { listNotifications } from '@/lib/casino/notifications';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveNotificationRouteUser } from '@/lib/security/notification-route-auth';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  try {
    const userId = await resolveNotificationRouteUser();
    if (!userId)
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401, undefined, {
        headers: PRIVATE_HEADERS,
      });
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'notifications-read',
      30,
      60,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }
    return apiSuccessResponse(await listNotifications(userId), {
      headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) },
    });
  } catch (error) {
    CasinoLogger.error('API/Notifications', 'Failed to load notifications', error);
    return apiErrorResponse(
      'NOTIFICATIONS_UNAVAILABLE',
      'Notifications unavailable',
      503,
      undefined,
      { headers: PRIVATE_HEADERS },
    );
  }
}
