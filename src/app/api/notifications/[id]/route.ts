import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { markNotificationRead } from '@/lib/casino/notifications';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveNotificationRouteUser } from '@/lib/security/notification-route-auth';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const notificationIdSchema = z.string().uuid();
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;
  try {
    const userId = await resolveNotificationRouteUser();
    if (!userId)
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401, undefined, {
        headers: PRIVATE_HEADERS,
      });
    const { id } = await params;
    if (!notificationIdSchema.safeParse(id).success) {
      return apiErrorResponse(
        'INVALID_NOTIFICATION_ID',
        'Invalid notification id',
        400,
        undefined,
        { headers: PRIVATE_HEADERS },
      );
    }
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
    const notification = await markNotificationRead(userId, id);
    if (!notification) {
      return apiErrorResponse('NOTIFICATION_NOT_FOUND', 'Notification not found', 404, undefined, {
        headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) },
      });
    }
    return apiSuccessResponse(
      { notification },
      { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
    );
  } catch (error) {
    CasinoLogger.error('API/Notifications', 'Failed to mark notification as read', error);
    return apiErrorResponse(
      'NOTIFICATION_UPDATE_FAILED',
      'Notification update unavailable',
      503,
      undefined,
      { headers: PRIVATE_HEADERS },
    );
  }
}
