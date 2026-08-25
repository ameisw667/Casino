import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const fromMock = vi.fn();
  return {
    from: fromMock,
    error: vi.fn(),
  };
});

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.error },
}));

import {
  createGuild,
  searchGuilds,
  getGuildById,
  getUserGuild,
  createInvite,
  getUserPendingInvites,
  respondToInvite,
  revokeInvite,
  updateMemberRole,
  removeMember,
  disbandGuild,
  GuildConflictError,
  GuildForbiddenError,
  GuildNotFoundError,
} from '../guild-service';

afterEach(() => {
  vi.clearAllMocks();
});

describe('guild-service', () => {
  describe('createGuild', () => {
    it('successfully creates a guild and assigns the creator as leader', async () => {
      // 1. Check existing membership: none
      // 2. Check name/tag conflict: none
      // 3. Insert guild: returns created guild
      // 4. Insert member: succeeds
      const mockGuild = {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Vibe Knights',
        tag: 'VKN',
        description: 'Elite players',
        created_by: 'user_1',
        member_count: 1,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
      };

      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
            insert: async () => ({ error: null }),
          };
        }
        if (table === 'guilds') {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
            insert: () => ({
              select: () => ({
                single: async () => ({ data: mockGuild, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await createGuild('user_1', {
        name: 'Vibe Knights',
        tag: 'vkn',
        description: 'Elite players',
      });

      expect(result).toEqual({
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Vibe Knights',
        tag: 'VKN',
        description: 'Elite players',
        createdBy: 'user_1',
        memberCount: 1,
        createdAt: '2026-08-25T10:00:00.000Z',
        updatedAt: '2026-08-25T10:00:00.000Z',
      });
    });

    it('rejects creation if user is already in a guild (409 Conflict)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { guild_id: 'guild_existing' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        createGuild('user_1', { name: 'New Guild', tag: 'NEW' }),
      ).rejects.toThrow(GuildConflictError);
    });

    it('rejects creation if name or tag is already taken (409 Conflict)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          };
        }
        if (table === 'guilds') {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: async () => ({
                  data: { id: 'other_guild', name: 'Existing Guild', tag: 'EXT' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        createGuild('user_1', { name: 'Existing Guild', tag: 'EXT' }),
      ).rejects.toThrow(GuildConflictError);
    });
  });

  describe('updateMemberRole', () => {
    it('prevents user from modifying their own role (403 Forbidden)', async () => {
      await expect(
        updateMemberRole('user_1', 'user_1', 'officer'),
      ).rejects.toThrow(GuildForbiddenError);
    });

    it('prevents officer from demoting or modifying leader (403 Forbidden)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => {
                  if (val === 'officer_1') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  if (val === 'leader_1') return { data: { guild_id: 'g1', role: 'leader' }, error: null };
                  return { data: null, error: null };
                },
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        updateMemberRole('officer_1', 'leader_1', 'member'),
      ).rejects.toThrow(GuildForbiddenError);
    });

    it('prevents officer from promoting someone to leader (403 Forbidden)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => {
                  if (val === 'officer_1') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  if (val === 'member_1') return { data: { guild_id: 'g1', role: 'member' }, error: null };
                  return { data: null, error: null };
                },
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        updateMemberRole('officer_1', 'member_1', 'leader'),
      ).rejects.toThrow(GuildForbiddenError);
    });

    it('prevents officer from modifying another officer (403 Forbidden)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => {
                  if (val === 'officer_1') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  if (val === 'officer_2') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  return { data: null, error: null };
                },
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        updateMemberRole('officer_1', 'officer_2', 'member'),
      ).rejects.toThrow(GuildForbiddenError);
    });

    it('allows leader to transfer leadership cleanly', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => {
                  if (val === 'leader_1') return { data: { guild_id: 'g1', role: 'leader' }, error: null };
                  if (val === 'member_1') return { data: { guild_id: 'g1', role: 'member' }, error: null };
                  return { data: null, error: null };
                },
              }),
            }),
            update: () => ({
              eq: () => ({
                eq: async () => ({ error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await updateMemberRole('leader_1', 'member_1', 'leader');
      expect(result).toEqual({ success: true, role: 'leader' });
    });
  });

  describe('removeMember', () => {
    it('prevents the sole leader from leaving if other members exist (409 Conflict)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
              if (opts?.count === 'exact') {
                return {
                  eq: async () => ({ count: 3, error: null }),
                };
              }
              return {
                eq: () => ({
                  maybeSingle: async () => ({ data: { guild_id: 'g1', role: 'leader' }, error: null }),
                }),
              };
            },
          };
        }
        return {};
      });

      await expect(removeMember('leader_1', 'leader_1')).rejects.toThrow(GuildConflictError);
    });

    it('disbands guild when sole member leader leaves', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
              if (opts?.count === 'exact') {
                return {
                  eq: async () => ({ count: 1, error: null }),
                };
              }
              return {
                eq: () => ({
                  maybeSingle: async () => ({ data: { guild_id: 'g1', role: 'leader' }, error: null }),
                }),
              };
            },
          };
        }
        if (table === 'guilds') {
          return {
            delete: () => ({
              eq: async () => ({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await removeMember('leader_1', 'leader_1');
      expect(result).toEqual({ disbanded: true, left: true });
    });

    it('prevents officer from kicking leader or another officer (403 Forbidden)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: (_col: string, val: string) => ({
                maybeSingle: async () => {
                  if (val === 'officer_1') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  if (val === 'officer_2') return { data: { guild_id: 'g1', role: 'officer' }, error: null };
                  if (val === 'leader_1') return { data: { guild_id: 'g1', role: 'leader' }, error: null };
                  return { data: null, error: null };
                },
              }),
            }),
          };
        }
        return {};
      });

      await expect(removeMember('officer_1', 'leader_1')).rejects.toThrow(GuildForbiddenError);
      await expect(removeMember('officer_1', 'officer_2')).rejects.toThrow(GuildForbiddenError);
    });
  });

  describe('respondToInvite', () => {
    it('prevents a user from accepting an invite intended for another user (403 Forbidden)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_invites') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 'inv_1',
                    guild_id: 'g1',
                    invited_user_id: 'intended_user',
                    status: 'pending',
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(respondToInvite('imposter_user', 'inv_1', 'accept')).rejects.toThrow(GuildForbiddenError);
    });

    it('rejects expired invitations (409 Conflict)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_invites') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 'inv_1',
                    guild_id: 'g1',
                    invited_user_id: 'user_1',
                    status: 'pending',
                    expires_at: new Date(Date.now() - 10000).toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
            update: () => ({
              eq: async () => ({ error: null }),
            }),
          };
        }
        return {};
      });

      await expect(respondToInvite('user_1', 'inv_1', 'accept')).rejects.toThrow(GuildConflictError);
    });

    it('rejects accept if user is already in a guild (409 Conflict)', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_invites') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 'inv_1',
                    guild_id: 'g1',
                    invited_user_id: 'user_1',
                    status: 'pending',
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { guild_id: 'existing_guild' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(respondToInvite('user_1', 'inv_1', 'accept')).rejects.toThrow(GuildConflictError);
    });

    it('successfully accepts invitation', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_invites') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 'inv_1',
                    guild_id: 'g1',
                    invited_user_id: 'user_1',
                    status: 'pending',
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
            update: () => ({
              eq: async () => ({ error: null }),
            }),
          };
        }
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
            insert: async () => ({ error: null }),
          };
        }
        return {};
      });

      const result = await respondToInvite('user_1', 'inv_1', 'accept');
      expect(result).toEqual({ status: 'accepted', guildId: 'g1' });
    });
  });

  describe('disbandGuild', () => {
    it('allows only the leader to disband the guild', async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === 'guild_members') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { role: 'officer' }, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(disbandGuild('officer_1', 'g1')).rejects.toThrow(GuildForbiddenError);
    });
  });
});
