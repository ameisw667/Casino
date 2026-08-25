import { NextResponse } from 'next/server';
import { searchGuilds, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/security/request-security';

const PUBLIC_CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' };

export async function GET(request: Request) {
  try {
    const rate = await enforceRateLimit(getClientIdentifier(request), 'guild-search', 30, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;

    const guilds = await searchGuilds(q);
    return NextResponse.json({ guilds }, { headers: { ...PUBLIC_CACHE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    CasinoLogger.error('API/GuildSearch', 'Failed to search guilds', error);
    return NextResponse.json({ error: 'Guild search unavailable' }, { status: 503 });
  }
}
