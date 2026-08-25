import { NextResponse } from 'next/server';
import { z } from 'zod';
import { markNotificationRead } from '@/lib/casino/notifications';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveNotificationRouteUser } from '@/lib/security/notification-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders, validateMutationOrigin } from '@/lib/security/request-security';

const notificationIdSchema = z.string().uuid();
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;
  try {
    const userId = await resolveNotificationRouteUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    const { id } = await params;
    if (!notificationIdSchema.safeParse(id).success) return NextResponse.json({ error: 'Invalid notification id' }, { status: 400, headers: PRIVATE_HEADERS });
    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'notifications-write', 30, 60);
    if (!rate.success) {
      return NextResponse.json({ error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' }, { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
    }
    const notification = await markNotificationRead(userId, id);
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
    return NextResponse.json({ notification }, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    CasinoLogger.error('API/Notifications', 'Failed to mark notification as read', error);
    return NextResponse.json({ error: 'Notification update unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}