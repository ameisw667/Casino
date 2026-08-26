import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getGuildById, disbandGuild, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveGuildRouteUser } from '@/lib/security/guild-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders, validateMutationOrigin } from '@/lib/security/request-security';

const guildIdSchema = z.string().uuid();
const PUBLIC_CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' };
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!guildIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid guild ID' }, { status: 400 });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request), 'guild-get', 30, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const guildData = await getGuildById(id);
    return NextResponse.json(guildData, { headers: { ...PUBLIC_CACHE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    CasinoLogger.error('API/GuildGet', 'Failed to load guild', error);
    return NextResponse.json({ error: 'Guild details unavailable' }, { status: 503 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const userId = await resolveGuildRouteUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const { id } = await params;
    if (!guildIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid guild ID' }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'guild-disband', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const result = await disbandGuild(userId, id);
    return NextResponse.json(result, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildDisband', 'Failed to disband guild', error);
    return NextResponse.json({ error: 'Guild disband unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
