import 'server-only';

import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';

// ============================================================================
// Schemas & Types
// ============================================================================

export const guildRoleSchema = z.enum(['leader', 'officer', 'member']);
export type GuildRole = z.infer<typeof guildRoleSchema>;

export const guildInviteStatusSchema = z.enum(['pending', 'accepted', 'declined', 'expired', 'revoked']);
export type GuildInviteStatus = z.infer<typeof guildInviteStatusSchema>;

export const createGuildInputSchema = z.object({
  name: z.string().trim().min(3, 'Name must be between 3 and 30 characters').max(30, 'Name must be between 3 and 30 characters'),
  tag: z.string().trim().min(2, 'Tag must be between 2 and 5 characters').max(5, 'Tag must be between 2 and 5 characters').regex(/^[A-Za-z0-9]+$/, 'Tag must be alphanumeric').transform((v) => v.toUpperCase()),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional().nullable(),
});

export const createInviteInputSchema = z.object({
  guildId: z.string().uuid('Invalid guild ID format'),
  invitedUserId: z.string().trim().min(1, 'Invited user ID is required').max(128),
});

export const respondInviteInputSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

export const updateMemberRoleInputSchema = z.object({
  role: guildRoleSchema,
});

export interface GuildRecord {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuildMemberRecord {
  guildId: string;
  userId: string;
  role: GuildRole;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    avatarUrl: string | null;
    level: number;
    rank: string;
  };
}

export interface GuildInviteRecord {
  id: string;
  guildId: string;
  invitedUserId: string;
  invitedBy: string;
  status: GuildInviteStatus;
  createdAt: string;
  expiresAt: string;
  guild?: {
    id: string;
    name: string;
    tag: string;
    description: string | null;
  };
}

// ============================================================================
// Errors
// ============================================================================

export class GuildServiceError extends Error {
  readonly status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'GuildServiceError';
    this.status = status;
  }
}

export class GuildNotFoundError extends GuildServiceError {
  constructor(message = 'Guild not found') {
    super(message, 404);
    this.name = 'GuildNotFoundError';
  }
}

export class GuildForbiddenError extends GuildServiceError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'GuildForbiddenError';
  }
}

export class GuildConflictError extends GuildServiceError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'GuildConflictError';
  }
}

export class GuildValidationError extends GuildServiceError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'GuildValidationError';
  }
}

// ============================================================================
// Helper mappers
// ============================================================================

function toGuildRecord(row: {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}): GuildRecord {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    description: row.description,
    createdBy: row.created_by,
    memberCount: row.member_count ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Core Service Operations
// ============================================================================

/**
 * Creates a new guild with the given creator as the initial leader.
 * Negativtest: User already in a guild cannot create another (409).
 * Name/Tag duplicate results in 409 conflict.
 */
export async function createGuild(
  creatorUserId: string,
  input: z.input<typeof createGuildInputSchema>,
): Promise<GuildRecord> {
  const parsed = createGuildInputSchema.parse(input);
  const supabase = createAdminClient();

  // 1. Check if user already belongs to any guild
  const { data: existingMembership, error: memberCheckError } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', creatorUserId)
    .maybeSingle();

  if (memberCheckError) {
    CasinoLogger.error('GuildService', 'Error checking existing membership', memberCheckError);
    throw new GuildServiceError('Failed to verify user membership status', 503);
  }

  if (existingMembership) {
    throw new GuildConflictError('User is already a member of a guild');
  }

  // 2. Check if name or tag already exists
  const { data: nameOrTagConflict, error: conflictCheckError } = await supabase
    .from('guilds')
    .select('id, name, tag')
    .or(`name.eq."${parsed.name}",tag.eq."${parsed.tag}"`)
    .maybeSingle();

  if (conflictCheckError) {
    CasinoLogger.error('GuildService', 'Error checking name/tag conflict', conflictCheckError);
    throw new GuildServiceError('Failed to verify guild availability', 503);
  }

  if (nameOrTagConflict) {
    if (nameOrTagConflict.name.toLowerCase() === parsed.name.toLowerCase()) {
      throw new GuildConflictError('A guild with this name already exists');
    }
    throw new GuildConflictError('A guild with this tag already exists');
  }

  // 3. Ensure user exists in public.users (foreign key target)
  try {
    await supabase
      .from('users')
      .upsert(
        { id: creatorUserId, username: creatorUserId.slice(0, 64) },
        { onConflict: 'id', ignoreDuplicates: true },
      );
  } catch {
    // Best-effort
  }

  // 4. Insert guild
  const { data: createdGuild, error: guildInsertError } = await supabase
    .from('guilds')
    .insert({
      name: parsed.name,
      tag: parsed.tag,
      description: parsed.description ?? null,
      created_by: creatorUserId,
      member_count: 1,
    })
    .select('id, name, tag, description, created_by, member_count, created_at, updated_at')
    .single();

  if (guildInsertError) {
    CasinoLogger.error('GuildService', 'Error inserting guild', guildInsertError);
    if (guildInsertError.code === '23505') {
      throw new GuildConflictError('Guild name or tag already taken');
    }
    throw new GuildServiceError('Failed to create guild', 503);
  }

  // 4. Insert leader member
  const { error: memberInsertError } = await supabase
    .from('guild_members')
    .insert({
      guild_id: createdGuild.id,
      user_id: creatorUserId,
      role: 'leader',
    });

  if (memberInsertError) {
    CasinoLogger.error('GuildService', 'Error assigning guild leader, rolling back guild', memberInsertError);
    // Cleanup created guild
    await supabase.from('guilds').delete().eq('id', createdGuild.id);
    throw new GuildServiceError('Failed to initialize guild leadership', 503);
  }

  return toGuildRecord(createdGuild as Parameters<typeof toGuildRecord>[0]);
}

/**
 * Searches guilds by name or tag, ordered by member count and creation date.
 */
export async function searchGuilds(query?: string, limit = 50): Promise<GuildRecord[]> {
  const supabase = createAdminClient();
  let queryBuilder = supabase
    .from('guilds')
    .select('id, name, tag, description, created_by, member_count, created_at, updated_at')
    .order('member_count', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(Math.min(limit, 100));

  if (query && query.trim().length > 0) {
    const trimmed = query.trim();
    queryBuilder = queryBuilder.or(`name.ilike.%${trimmed}%,tag.ilike.%${trimmed}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) {
    CasinoLogger.error('GuildService', 'Error searching guilds', error);
    throw new GuildServiceError('Failed to search guilds', 503);
  }

  return (data ?? []).map((row) => toGuildRecord(row as Parameters<typeof toGuildRecord>[0]));
}

/**
 * Fetches public guild details and its member list.
 */
export async function getGuildById(guildId: string): Promise<{
  guild: GuildRecord;
  members: GuildMemberRecord[];
}> {
  const supabase = createAdminClient();

  const [guildResult, membersResult] = await Promise.all([
    supabase
      .from('guilds')
      .select('id, name, tag, description, created_by, member_count, created_at, updated_at')
      .eq('id', guildId)
      .maybeSingle(),
    supabase
      .from('guild_members')
      .select('guild_id, user_id, role, joined_at, users:user_id(id, username, avatar_url, level, rank)')
      .eq('guild_id', guildId)
      .order('joined_at', { ascending: true }),
  ]);

  if (guildResult.error) {
    CasinoLogger.error('GuildService', 'Error fetching guild', guildResult.error);
    throw new GuildServiceError('Failed to load guild', 503);
  }

  if (!guildResult.data) {
    throw new GuildNotFoundError('Guild not found');
  }

  if (membersResult.error) {
    CasinoLogger.error('GuildService', 'Error fetching guild members', membersResult.error);
    throw new GuildServiceError('Failed to load guild members', 503);
  }

  const members: GuildMemberRecord[] = (membersResult.data ?? []).map((row) => {
    const raw = row as unknown as Record<string, unknown> & { users?: Record<string, unknown> | null };
    return {
      guildId: String(raw.guild_id ?? ''),
      userId: String(raw.user_id ?? ''),
      role: raw.role as GuildMemberRecord['role'],
      joinedAt: String(raw.joined_at ?? ''),
      user: raw.users ? {
        id: String(raw.users.id ?? ''),
        username: String(raw.users.username ?? ''),
        avatarUrl: (raw.users.avatar_url as string | null) ?? null,
        level: Number(raw.users.level ?? 1),
        rank: (raw.users.rank as string) ?? 'BRONZE',
      } : undefined,
    };
  });

  return {
    guild: toGuildRecord(guildResult.data as Parameters<typeof toGuildRecord>[0]),
    members,
  };
}

/**
 * Fetches user's current guild membership, or null if not in any guild.
 */
export async function getUserGuild(userId: string): Promise<{
  guild: GuildRecord;
  role: GuildRole;
  joinedAt: string;
  members: GuildMemberRecord[];
} | null> {
  const supabase = createAdminClient();

  const { data: memberRow, error: memberError } = await supabase
    .from('guild_members')
    .select('guild_id, role, joined_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) {
    CasinoLogger.error('GuildService', 'Error checking user guild', memberError);
    throw new GuildServiceError('Failed to load user guild', 503);
  }

  if (!memberRow) {
    return null;
  }

  const guildData = await getGuildById(memberRow.guild_id);

  return {
    guild: guildData.guild,
    role: memberRow.role as GuildRole,
    joinedAt: memberRow.joined_at,
    members: guildData.members,
  };
}

/**
 * Creates an invite to a guild. Only leader or officer can invite.
 * Negativtests:
 * - Inviter not in guild or is member -> 403
 * - Invited user already in guild -> 409
 * - Duplicate pending invite -> 409
 */
export async function createInvite(
  inviterUserId: string,
  input: z.input<typeof createInviteInputSchema>,
): Promise<GuildInviteRecord> {
  const parsed = createInviteInputSchema.parse(input);
  const supabase = createAdminClient();

  // 1. Verify inviter's role in the guild
  const { data: inviterMember, error: inviterCheckError } = await supabase
    .from('guild_members')
    .select('role')
    .eq('guild_id', parsed.guildId)
    .eq('user_id', inviterUserId)
    .maybeSingle();

  if (inviterCheckError) {
    CasinoLogger.error('GuildService', 'Error checking inviter authorization', inviterCheckError);
    throw new GuildServiceError('Failed to verify invite authorization', 503);
  }

  if (!inviterMember || (inviterMember.role !== 'leader' && inviterMember.role !== 'officer')) {
    throw new GuildForbiddenError('Only guild leaders and officers can create invites');
  }

  // 2. Verify target user exists
  const { data: targetUser, error: targetUserError } = await supabase
    .from('users')
    .select('id')
    .eq('id', parsed.invitedUserId)
    .maybeSingle();

  if (targetUserError) {
    CasinoLogger.error('GuildService', 'Error checking target user existence', targetUserError);
    throw new GuildServiceError('Failed to verify invited user', 503);
  }

  if (!targetUser) {
    throw new GuildNotFoundError('Invited user does not exist');
  }

  // 3. Check if target user is already in any guild
  const { data: existingTargetMembership, error: targetMemberError } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', parsed.invitedUserId)
    .maybeSingle();

  if (targetMemberError) {
    CasinoLogger.error('GuildService', 'Error checking target user membership', targetMemberError);
    throw new GuildServiceError('Failed to verify target membership status', 503);
  }

  if (existingTargetMembership) {
    throw new GuildConflictError('User is already a member of a guild');
  }

  // 4. Lazy-expire any pending invites that have passed expiration
  await supabase
    .from('guild_invites')
    .update({ status: 'expired' })
    .eq('guild_id', parsed.guildId)
    .eq('invited_user_id', parsed.invitedUserId)
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  // 5. Check for existing active pending invite
  const { data: existingInvite, error: existingInviteError } = await supabase
    .from('guild_invites')
    .select('id')
    .eq('guild_id', parsed.guildId)
    .eq('invited_user_id', parsed.invitedUserId)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInviteError) {
    CasinoLogger.error('GuildService', 'Error checking existing invite', existingInviteError);
    throw new GuildServiceError('Failed to check existing invites', 503);
  }

  if (existingInvite) {
    throw new GuildConflictError('An active invitation is already pending for this user');
  }

  // 6. Insert new invite
  const { data: newInvite, error: insertError } = await supabase
    .from('guild_invites')
    .insert({
      guild_id: parsed.guildId,
      invited_user_id: parsed.invitedUserId,
      invited_by: inviterUserId,
      status: 'pending',
    })
    .select('id, guild_id, invited_user_id, invited_by, status, created_at, expires_at')
    .single();

  if (insertError) {
    CasinoLogger.error('GuildService', 'Error inserting invite', insertError);
    if (insertError.code === '23505') {
      throw new GuildConflictError('An active invitation is already pending for this user');
    }
    throw new GuildServiceError('Failed to create invitation', 503);
  }

  return {
    id: newInvite.id,
    guildId: newInvite.guild_id,
    invitedUserId: newInvite.invited_user_id,
    invitedBy: newInvite.invited_by,
    status: newInvite.status as GuildInviteStatus,
    createdAt: newInvite.created_at,
    expiresAt: newInvite.expires_at,
  };
}

/**
 * Returns pending invites for the current user (lazy expires stale ones first).
 */
export async function getUserPendingInvites(userId: string): Promise<GuildInviteRecord[]> {
  const supabase = createAdminClient();

  // 1. Lazy expiry
  await supabase
    .from('guild_invites')
    .update({ status: 'expired' })
    .eq('invited_user_id', userId)
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  // 2. Fetch pending invites with guild info
  const { data, error } = await supabase
    .from('guild_invites')
    .select('id, guild_id, invited_user_id, invited_by, status, created_at, expires_at, guilds:guild_id(id, name, tag, description)')
    .eq('invited_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    CasinoLogger.error('GuildService', 'Error fetching pending invites', error);
    throw new GuildServiceError('Failed to load invitations', 503);
  }

  return (data ?? []).map((row) => {
    const raw = row as unknown as Record<string, unknown> & { guilds?: Record<string, unknown> | null };
    return {
      id: String(raw.id ?? ''),
      guildId: String(raw.guild_id ?? ''),
      invitedUserId: String(raw.invited_user_id ?? ''),
      invitedBy: String(raw.invited_by ?? ''),
      status: raw.status as GuildInviteStatus,
      createdAt: String(raw.created_at ?? ''),
      expiresAt: String(raw.expires_at ?? ''),
      guild: raw.guilds ? {
        id: String(raw.guilds.id ?? ''),
        name: String(raw.guilds.name ?? ''),
        tag: String(raw.guilds.tag ?? ''),
        description: (raw.guilds.description as string | null) ?? null,
      } : undefined,
    };
  });
}

/**
 * Responds to a guild invite (accept or decline).
 * Negativtests:
 * - User trying to accept invite addressed to someone else -> 403
 * - Expired or non-pending invite -> 409
 * - User already in a guild accepting invite -> 409
 */
export async function respondToInvite(
  userId: string,
  inviteId: string,
  action: 'accept' | 'decline',
): Promise<{ status: 'accepted' | 'declined'; guildId: string }> {
  const supabase = createAdminClient();

  // 1. Fetch invite
  const { data: invite, error: fetchError } = await supabase
    .from('guild_invites')
    .select('id, guild_id, invited_user_id, status, expires_at')
    .eq('id', inviteId)
    .maybeSingle();

  if (fetchError) {
    CasinoLogger.error('GuildService', 'Error fetching invite for response', fetchError);
    throw new GuildServiceError('Failed to retrieve invite', 503);
  }

  if (!invite) {
    throw new GuildNotFoundError('Invitation not found');
  }

  // 2. Ownership check
  if (invite.invited_user_id !== userId) {
    throw new GuildForbiddenError('Cannot respond to an invitation intended for another user');
  }

  // 3. Expiry check
  const isExpired = new Date(invite.expires_at).getTime() < Date.now();
  if (isExpired && invite.status === 'pending') {
    await supabase.from('guild_invites').update({ status: 'expired' }).eq('id', inviteId);
    throw new GuildConflictError('Invitation has expired');
  }

  if (invite.status !== 'pending') {
    throw new GuildConflictError(`Invitation is already ${invite.status}`);
  }

  // 4. Handle Decline
  if (action === 'decline') {
    const { error: declineError } = await supabase
      .from('guild_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId)
      .eq('status', 'pending');

    if (declineError) {
      CasinoLogger.error('GuildService', 'Error declining invite', declineError);
      throw new GuildServiceError('Failed to decline invitation', 503);
    }
    return { status: 'declined', guildId: invite.guild_id };
  }

  // 5. Handle Accept
  // Check if user is already in a guild
  const { data: existingMembership, error: membershipError } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (membershipError) {
    CasinoLogger.error('GuildService', 'Error checking membership upon accept', membershipError);
    throw new GuildServiceError('Failed to verify user membership', 503);
  }

  if (existingMembership) {
    throw new GuildConflictError('User is already a member of a guild');
  }

  // Ensure user exists in public.users
  try {
    await supabase
      .from('users')
      .upsert(
        { id: userId, username: userId.slice(0, 64) },
        { onConflict: 'id', ignoreDuplicates: true },
      );
  } catch {
    // Best-effort
  }

  // Add to guild_members
  const { error: joinError } = await supabase
    .from('guild_members')
    .insert({
      guild_id: invite.guild_id,
      user_id: userId,
      role: 'member',
    });

  if (joinError) {
    CasinoLogger.error('GuildService', 'Error joining guild', joinError);
    if (joinError.code === '23505') {
      throw new GuildConflictError('User is already a member of a guild');
    }
    throw new GuildServiceError('Failed to join guild', 503);
  }

  // Mark invite accepted
  await supabase
    .from('guild_invites')
    .update({ status: 'accepted' })
    .eq('id', inviteId);

  return { status: 'accepted', guildId: invite.guild_id };
}

/**
 * Revokes an open invite. Must be leader or officer of the inviting guild.
 */
export async function revokeInvite(
  actorUserId: string,
  inviteId: string,
): Promise<{ success: boolean }> {
  const supabase = createAdminClient();

  const { data: invite, error: fetchError } = await supabase
    .from('guild_invites')
    .select('id, guild_id, status')
    .eq('id', inviteId)
    .maybeSingle();

  if (fetchError) {
    CasinoLogger.error('GuildService', 'Error fetching invite to revoke', fetchError);
    throw new GuildServiceError('Failed to find invitation', 503);
  }

  if (!invite) {
    throw new GuildNotFoundError('Invitation not found');
  }

  // Check authorization
  const { data: actorMember, error: actorError } = await supabase
    .from('guild_members')
    .select('role')
    .eq('guild_id', invite.guild_id)
    .eq('user_id', actorUserId)
    .maybeSingle();

  if (actorError) {
    CasinoLogger.error('GuildService', 'Error checking revoker authorization', actorError);
    throw new GuildServiceError('Failed to verify authorization', 503);
  }

  if (!actorMember || (actorMember.role !== 'leader' && actorMember.role !== 'officer')) {
    throw new GuildForbiddenError('Only guild leaders and officers can revoke invitations');
  }

  const { error: updateError } = await supabase
    .from('guild_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId);

  if (updateError) {
    CasinoLogger.error('GuildService', 'Error revoking invite', updateError);
    throw new GuildServiceError('Failed to revoke invitation', 503);
  }

  return { success: true };
}

/**
 * Changes a guild member's role.
 * Negativtests:
 * - User cannot change own role (nie sich selbst hochstufen) -> 403
 * - Officer cannot demote Leader -> 403
 * - Officer cannot promote to Leader -> 403
 * - Officer cannot demote another Officer -> 403
 * - Non-member actor -> 403
 */
export async function updateMemberRole(
  actorUserId: string,
  targetUserId: string,
  newRole: GuildRole,
): Promise<{ success: boolean; role: GuildRole }> {
  // Self modification rule
  if (actorUserId === targetUserId) {
    throw new GuildForbiddenError('Users cannot modify their own guild role');
  }

  const supabase = createAdminClient();

  // Find actor's guild & role
  const { data: actorMember, error: actorError } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', actorUserId)
    .maybeSingle();

  if (actorError) {
    CasinoLogger.error('GuildService', 'Error checking actor role', actorError);
    throw new GuildServiceError('Failed to verify actor role', 503);
  }

  if (!actorMember || actorMember.role === 'member') {
    throw new GuildForbiddenError('Only leaders and officers can manage member roles');
  }

  // Find target's guild & role
  const { data: targetMember, error: targetError } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (targetError) {
    CasinoLogger.error('GuildService', 'Error checking target role', targetError);
    throw new GuildServiceError('Failed to verify target member', 503);
  }

  if (!targetMember || targetMember.guild_id !== actorMember.guild_id) {
    throw new GuildForbiddenError('Target user is not a member of your guild');
  }

  // Invariant checks
  if (targetMember.role === 'leader') {
    throw new GuildForbiddenError('Cannot demote or modify the guild leader');
  }

  if (newRole === 'leader') {
    // Only current leader can transfer leadership
    if (actorMember.role !== 'leader') {
      throw new GuildForbiddenError('Only the guild leader can transfer leadership');
    }

    // Atomically transfer leadership: actor becomes officer, target becomes leader
    const { error: demoteActorError } = await supabase
      .from('guild_members')
      .update({ role: 'officer' })
      .eq('guild_id', actorMember.guild_id)
      .eq('user_id', actorUserId);

    if (demoteActorError) {
      CasinoLogger.error('GuildService', 'Error demoting previous leader during transfer', demoteActorError);
      throw new GuildServiceError('Failed to transfer leadership', 503);
    }

    const { error: promoteTargetError } = await supabase
      .from('guild_members')
      .update({ role: 'leader' })
      .eq('guild_id', actorMember.guild_id)
      .eq('user_id', targetUserId);

    if (promoteTargetError) {
      CasinoLogger.error('GuildService', 'Error promoting target to leader, rolling back', promoteTargetError);
      // Rollback previous leader
      await supabase.from('guild_members').update({ role: 'leader' }).eq('guild_id', actorMember.guild_id).eq('user_id', actorUserId);
      throw new GuildServiceError('Failed to transfer leadership', 503);
    }

    return { success: true, role: 'leader' };
  }

  // Actor is officer rules
  if (actorMember.role === 'officer') {
    if (targetMember.role === 'officer') {
      throw new GuildForbiddenError('Officers cannot modify other officers');
    }
  }

  // Apply role change
  const { error: updateError } = await supabase
    .from('guild_members')
    .update({ role: newRole })
    .eq('guild_id', actorMember.guild_id)
    .eq('user_id', targetUserId);

  if (updateError) {
    CasinoLogger.error('GuildService', 'Error updating member role', updateError);
    throw new GuildServiceError('Failed to update member role', 503);
  }

  return { success: true, role: newRole };
}

/**
 * Removes a member (leave guild if self, or kick member if actor is leader/officer).
 * Negativtests:
 * - Last leader cannot leave without transferring leadership or disbanding -> 409
 * - Officer cannot kick leader -> 403
 * - Officer cannot kick another officer -> 403
 */
export async function removeMember(
  actorUserId: string,
  targetUserId: string,
): Promise<{ left?: boolean; removed?: boolean; disbanded?: boolean }> {
  const supabase = createAdminClient();

  // Case 1: User leaving guild on their own
  if (actorUserId === targetUserId) {
    const { data: member, error: memberError } = await supabase
      .from('guild_members')
      .select('guild_id, role')
      .eq('user_id', actorUserId)
      .maybeSingle();

    if (memberError) {
      CasinoLogger.error('GuildService', 'Error finding member to leave', memberError);
      throw new GuildServiceError('Failed to verify membership', 503);
    }

    if (!member) {
      throw new GuildNotFoundError('User is not a member of any guild');
    }

    // If member is leader: check member count
    if (member.role === 'leader') {
      const { count, error: countError } = await supabase
        .from('guild_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('guild_id', member.guild_id);

      if (countError) {
        CasinoLogger.error('GuildService', 'Error checking guild member count', countError);
        throw new GuildServiceError('Failed to verify guild size', 503);
      }

      if ((count ?? 1) > 1) {
        throw new GuildConflictError('Guild leader must transfer leadership before leaving');
      }

      // If leader is sole member, disbanding the guild
      await supabase.from('guilds').delete().eq('id', member.guild_id);
      return { disbanded: true, left: true };
    }

    // Normal member or officer leaving
    const { error: deleteError } = await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', member.guild_id)
      .eq('user_id', actorUserId);

    if (deleteError) {
      CasinoLogger.error('GuildService', 'Error leaving guild', deleteError);
      throw new GuildServiceError('Failed to leave guild', 503);
    }

    return { left: true };
  }

  // Case 2: Kicking another member
  const { data: actorMember, error: actorError } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', actorUserId)
    .maybeSingle();

  if (actorError) {
    CasinoLogger.error('GuildService', 'Error verifying kicking actor', actorError);
    throw new GuildServiceError('Failed to verify permissions', 503);
  }

  if (!actorMember || actorMember.role === 'member') {
    throw new GuildForbiddenError('Only leaders and officers can remove members');
  }

  const { data: targetMember, error: targetError } = await supabase
    .from('guild_members')
    .select('guild_id, role')
    .eq('user_id', targetUserId)
    .maybeSingle();

  if (targetError) {
    CasinoLogger.error('GuildService', 'Error verifying target member to kick', targetError);
    throw new GuildServiceError('Failed to verify member', 503);
  }

  if (!targetMember || targetMember.guild_id !== actorMember.guild_id) {
    throw new GuildForbiddenError('Target user is not a member of your guild');
  }

  if (targetMember.role === 'leader') {
    throw new GuildForbiddenError('Cannot remove the guild leader');
  }

  if (actorMember.role === 'officer' && targetMember.role === 'officer') {
    throw new GuildForbiddenError('Officers cannot remove other officers');
  }

  const { error: kickError } = await supabase
    .from('guild_members')
    .delete()
    .eq('guild_id', actorMember.guild_id)
    .eq('user_id', targetUserId);

  if (kickError) {
    CasinoLogger.error('GuildService', 'Error kicking member', kickError);
    throw new GuildServiceError('Failed to remove member', 503);
  }

  return { removed: true };
}

/**
 * Disbands a guild. Only the leader can perform this operation.
 */
export async function disbandGuild(
  actorUserId: string,
  guildId: string,
): Promise<{ disbanded: boolean }> {
  const supabase = createAdminClient();

  const { data: leaderMember, error: checkError } = await supabase
    .from('guild_members')
    .select('role')
    .eq('guild_id', guildId)
    .eq('user_id', actorUserId)
    .maybeSingle();

  if (checkError) {
    CasinoLogger.error('GuildService', 'Error checking leader authorization to disband', checkError);
    throw new GuildServiceError('Failed to verify authorization', 503);
  }

  if (!leaderMember || leaderMember.role !== 'leader') {
    throw new GuildForbiddenError('Only the guild leader can disband the guild');
  }

  const { error: deleteError } = await supabase
    .from('guilds')
    .delete()
    .eq('id', guildId);

  if (deleteError) {
    CasinoLogger.error('GuildService', 'Error deleting guild', deleteError);
    throw new GuildServiceError('Failed to disband guild', 503);
  }

  return { disbanded: true };
}
