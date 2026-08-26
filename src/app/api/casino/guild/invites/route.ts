import { NextResponse } from 'next/server';
import { getUserPendingInvites, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveGuildRouteUser } from '@/lib/security/guild-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  try {
    const userId = await resolveGuildRouteUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'guild-invites-read', 30, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const invites = await getUserPendingInvites(userId);
    return NextResponse.json({ invites }, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildInvites', 'Failed to load user invites', error);
    return NextResponse.json({ error: 'Guild invites unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
