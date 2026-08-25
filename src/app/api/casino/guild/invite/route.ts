import { NextResponse } from 'next/server';
import { createInvite, createInviteInputSchema, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveGuildRouteUser } from '@/lib/security/guild-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders, validateMutationOrigin } from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const userId = await resolveGuildRouteUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'guild-invite-create', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const parsed = createInviteInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid invite parameters' },
        { status: 400, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const invite = await createInvite(userId, parsed.data);
    return NextResponse.json({ invite }, { status: 201, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildInvite', 'Failed to create invite', error);
    return NextResponse.json({ error: 'Guild invite unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
