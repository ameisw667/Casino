import { NextResponse } from 'next/server';
import { updateMemberRole, removeMember, updateMemberRoleInputSchema, GuildServiceError } from '@/lib/casino/guild-service';
import { CasinoLogger } from '@/lib/casino/logger';
import { resolveGuildRouteUser } from '@/lib/security/guild-route-auth';
import { enforceRateLimit, getClientIdentifier, rateLimitHeaders, validateMutationOrigin } from '@/lib/security/request-security';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const actorUserId = await resolveGuildRouteUser();
    if (!actorUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const { userId: targetUserId } = await params;
    if (!targetUserId || targetUserId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, actorUserId), 'guild-member-role', 10, 60);
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

    const parsed = updateMemberRoleInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid role parameters' },
        { status: 400, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const result = await updateMemberRole(actorUserId, targetUserId, parsed.data.role);
    return NextResponse.json(result, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildMemberRole', 'Failed to update member role', error);
    return NextResponse.json({ error: 'Member role update unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const actorUserId = await resolveGuildRouteUser();
    if (!actorUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
    }

    const { userId: targetUserId } = await params;
    if (!targetUserId || targetUserId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400, headers: PRIVATE_HEADERS });
    }

    const rate = await enforceRateLimit(getClientIdentifier(request, actorUserId), 'guild-member-remove', 10, 60);
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } },
      );
    }

    const result = await removeMember(actorUserId, targetUserId);
    return NextResponse.json(result, { headers: { ...PRIVATE_HEADERS, ...rateLimitHeaders(rate) } });
  } catch (error) {
    if (error instanceof GuildServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    }
    CasinoLogger.error('API/GuildMemberRemove', 'Failed to remove member', error);
    return NextResponse.json({ error: 'Member removal unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
