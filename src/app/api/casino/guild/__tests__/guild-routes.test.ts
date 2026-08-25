import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveUser: vi.fn(),
  validateOrigin: vi.fn(() => null),
  enforceRateLimit: vi.fn(async () => ({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 })),
  createGuild: vi.fn(),
  searchGuilds: vi.fn(),
  getGuildById: vi.fn(),
  getUserGuild: vi.fn(),
  createInvite: vi.fn(),
  getUserPendingInvites: vi.fn(),
  respondToInvite: vi.fn(),
  revokeInvite: vi.fn(),
  updateMemberRole: vi.fn(),
  removeMember: vi.fn(),
  disbandGuild: vi.fn(),
  loggerError: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@/lib/security/guild-route-auth', () => ({
  resolveGuildRouteUser: mocks.resolveUser,
}));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'test-client'),
  rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '10' })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.loggerError },
}));
vi.mock('@/lib/casino/guild-service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/casino/guild-service')>();
  return {
    ...actual,
    createGuild: mocks.createGuild,
    searchGuilds: mocks.searchGuilds,
    getGuildById: mocks.getGuildById,
    getUserGuild: mocks.getUserGuild,
    createInvite: mocks.createInvite,
    getUserPendingInvites: mocks.getUserPendingInvites,
    respondToInvite: mocks.respondToInvite,
    revokeInvite: mocks.revokeInvite,
    updateMemberRole: mocks.updateMemberRole,
    removeMember: mocks.removeMember,
    disbandGuild: mocks.disbandGuild,
  };
});

import { POST as createGuildHandler } from '../route';
import { GET as searchGuildsHandler } from '../search/route';
import { GET as getGuildMeHandler } from '../me/route';
import { GET as getGuildInvitesHandler } from '../invites/route';
import { POST as createInviteHandler } from '../invite/route';
import { POST as respondInviteHandler } from '../invite/[id]/respond/route';
import { DELETE as revokeInviteHandler } from '../invite/[id]/route';
import { PATCH as updateMemberRoleHandler, DELETE as removeMemberHandler } from '../member/[userId]/route';
import { GET as getGuildByIdHandler, DELETE as disbandGuildHandler } from '../[id]/route';
import { GuildConflictError, GuildForbiddenError, GuildNotFoundError } from '@/lib/casino/guild-service';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateOrigin.mockReturnValue(null);
  mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Guild API Routes', () => {
  describe('POST /api/casino/guild', () => {
    it('returns 401 when user is unauthenticated', async () => {
      mocks.resolveUser.mockResolvedValueOnce(null);
      const req = new Request('http://localhost/api/casino/guild', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ name: 'Knights', tag: 'KNT' }),
      });

      const res = await createGuildHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 for invalid body schema', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      const req = new Request('http://localhost/api/casino/guild', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ name: 'A', tag: 'A' }),
      });

      const res = await createGuildHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('returns 409 when service throws GuildConflictError', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      mocks.createGuild.mockRejectedValueOnce(new GuildConflictError('A guild with this name already exists'));
      const req = new Request('http://localhost/api/casino/guild', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ name: 'Existing', tag: 'EXT' }),
      });

      const res = await createGuildHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe('A guild with this name already exists');
    });

    it('returns 201 with created guild', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      const mockGuild = { id: 'g1', name: 'New Guild', tag: 'NGD' };
      mocks.createGuild.mockResolvedValueOnce(mockGuild);

      const req = new Request('http://localhost/api/casino/guild', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ name: 'New Guild', tag: 'NGD' }),
      });

      const res = await createGuildHandler(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual({ guild: mockGuild });
    });
  });

  describe('GET /api/casino/guild/search', () => {
    it('returns public list of guilds', async () => {
      const guilds = [{ id: 'g1', name: 'Guild 1', tag: 'G1', memberCount: 5 }];
      mocks.searchGuilds.mockResolvedValueOnce(guilds);

      const req = new Request('http://localhost/api/casino/guild/search?q=Guild');
      const res = await searchGuildsHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ guilds });
    });
  });

  describe('GET /api/casino/guild/me', () => {
    it('returns 401 for unauthenticated user', async () => {
      mocks.resolveUser.mockResolvedValueOnce(null);
      const req = new Request('http://localhost/api/casino/guild/me');
      const res = await getGuildMeHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns membership for authenticated user', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      const mockMembership = { guild: { id: 'g1', name: 'G1' }, role: 'leader', joinedAt: '2026-08-25', members: [] };
      mocks.getUserGuild.mockResolvedValueOnce(mockMembership);

      const req = new Request('http://localhost/api/casino/guild/me');
      const res = await getGuildMeHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ membership: mockMembership });
    });
  });

  describe('POST /api/casino/guild/invite', () => {
    it('returns 403 when user is not authorized to invite', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      mocks.createInvite.mockRejectedValueOnce(new GuildForbiddenError('Only guild leaders and officers can create invites'));

      const req = new Request('http://localhost/api/casino/guild/invite', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ guildId: '11111111-1111-4111-8111-111111111111', invitedUserId: 'target_1' }),
      });

      const res = await createInviteHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Only guild leaders and officers can create invites');
    });
  });

  describe('POST /api/casino/guild/invite/[id]/respond', () => {
    it('returns 400 for invalid action', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      const req = new Request('http://localhost/api/casino/guild/invite/11111111-1111-4111-8111-111111111111/respond', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ action: 'invalid_action' }),
      });

      const res = await respondInviteHandler(req, {
        params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
      });
      expect(res.status).toBe(400);
    });

    it('responds successfully with accept', async () => {
      mocks.resolveUser.mockResolvedValueOnce('user_1');
      mocks.respondToInvite.mockResolvedValueOnce({ status: 'accepted', guildId: 'g1' });

      const req = new Request('http://localhost/api/casino/guild/invite/11111111-1111-4111-8111-111111111111/respond', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const res = await respondInviteHandler(req, {
        params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ status: 'accepted', guildId: 'g1' });
    });
  });

  describe('PATCH & DELETE /api/casino/guild/member/[userId]', () => {
    it('returns 403 when officer attempts to demote leader', async () => {
      mocks.resolveUser.mockResolvedValueOnce('officer_1');
      mocks.updateMemberRole.mockRejectedValueOnce(new GuildForbiddenError('Cannot demote or modify the guild leader'));

      const req = new Request('http://localhost/api/casino/guild/member/leader_1', {
        method: 'PATCH',
        headers: { origin: 'http://localhost' },
        body: JSON.stringify({ role: 'member' }),
      });

      const res = await updateMemberRoleHandler(req, {
        params: Promise.resolve({ userId: 'leader_1' }),
      });
      expect(res.status).toBe(403);
    });

    it('handles member removal / kick', async () => {
      mocks.resolveUser.mockResolvedValueOnce('leader_1');
      mocks.removeMember.mockResolvedValueOnce({ removed: true });

      const req = new Request('http://localhost/api/casino/guild/member/member_1', {
        method: 'DELETE',
        headers: { origin: 'http://localhost' },
      });

      const res = await removeMemberHandler(req, {
        params: Promise.resolve({ userId: 'member_1' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ removed: true });
    });
  });

  describe('GET & DELETE /api/casino/guild/[id]', () => {
    it('returns 404 when guild does not exist', async () => {
      mocks.getGuildById.mockRejectedValueOnce(new GuildNotFoundError('Guild not found'));

      const req = new Request('http://localhost/api/casino/guild/11111111-1111-4111-8111-111111111111');
      const res = await getGuildByIdHandler(req, {
        params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
      });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Guild not found');
    });

    it('allows leader to disband guild', async () => {
      mocks.resolveUser.mockResolvedValueOnce('leader_1');
      mocks.disbandGuild.mockResolvedValueOnce({ disbanded: true });

      const req = new Request('http://localhost/api/casino/guild/11111111-1111-4111-8111-111111111111', {
        method: 'DELETE',
        headers: { origin: 'http://localhost' },
      });

      const res = await disbandGuildHandler(req, {
        params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ disbanded: true });
    });
  });
});
