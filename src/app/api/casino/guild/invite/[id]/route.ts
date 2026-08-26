import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revokeInvite, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveGuildRouteUser } from '@/lib/security/guild-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders, validateMutationOrigin } from '@/lib/security/request-security';

const inviteIdSchema = z.string().uuid();
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

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
    if (!inviteIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid invite ID' }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, userId), 'guild-invite-revoke', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const result = await revokeInvite(userId, id);
    return NextResponse.json(result, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildInviteRevoke', 'Failed to revoke invite', error);
    return NextResponse.json({ error: 'Invite revoke unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
