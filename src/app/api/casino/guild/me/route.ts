import { NextResponse } from 'next/server';
import { getUserGuild, GuildServiceError } from '@/lib/casino/guild-service';
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

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'guild-me', 30, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const userGuild = await getUserGuild(userId);
    return NextResponse.json(
      { membership: userGuild, currentUserId: userId },
      { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
    );
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildMe', 'Failed to load user guild', error);
    return NextResponse.json({ error: 'Guild details unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
