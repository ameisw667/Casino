import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { markAllNotificationsRead } from '@/lib/casino/notifications';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveNotificationRouteUser } from '@/lib/security/notification-route-auth';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure)
    return apiErrorResponse(
      'PERMISSION_DENIED',
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  try {
    const userId = await resolveNotificationRouteUser();
    if (!userId)
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401, undefined, {
        headers: PRIVATE_HEADERS,
      });
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'notifications-write',
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
    return apiSuccessResponse(
      { markedRead: await markAllNotificationsRead(userId) },
      { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
    );
  } catch (error) {
    CasinoLogger.error('API/Notifications', 'Failed to mark notifications as read', error);
    return apiErrorResponse(
      'NOTIFICATION_UPDATE_FAILED',
      'Notification update unavailable',
      503,
      undefined,
      { headers: PRIVATE_HEADERS },
    );
  }
}
