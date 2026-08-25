import { NextResponse } from 'next/server';
import { listNotifications } from '@/lib/casino/notifications';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveNotificationRouteUser } from '@/lib/security/notification-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  try {
    const userId = await resolveNotificationRouteUser();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'notifications-read', 30, 60);
    if (!rate.success) {
      return NextResponse.json({ error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' }, { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
    }
    return NextResponse.json(await listNotifications(userId), { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    CasinoLogger.error('API/Notifications', 'Failed to load notifications', error);
    return NextResponse.json({ error: 'Notifications unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}