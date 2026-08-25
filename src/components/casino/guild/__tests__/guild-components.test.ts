import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GuildHeader } from '../GuildHeader';
import { GuildMemberList } from '../GuildMemberList';
import { GuildSearchDirectory } from '../GuildSearchDirectory';
import { GuildInvitesInbox } from '../GuildInvitesInbox';

describe('Guild Components Server Rendering', () => {
  const mockGuild = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Vibe Royalty',
    tag: 'ROYAL',
    description: 'A top tier guild',
    createdBy: 'user_1',
    memberCount: 3,
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  };

  const mockMembers = [
    {
      guildId: mockGuild.id,
      userId: 'user_1',
      role: 'leader' as const,
      joinedAt: '2026-08-25T10:00:00.000Z',
      user: {
        id: 'user_1',
        username: 'VibeKing',
        avatarUrl: null,
        level: 42,
        rank: 'DIAMOND',
      },
    },
    {
      guildId: mockGuild.id,
      userId: 'user_2',
      role: 'officer' as const,
      joinedAt: '2026-08-25T11:00:00.000Z',
      user: {
        id: 'user_2',
        username: 'AcePlayer',
        avatarUrl: null,
        level: 20,
        rank: 'GOLD',
      },
    },
  ];

  it('renders GuildHeader correctly without errors', () => {
    const html = renderToString(
      React.createElement(GuildHeader, { guild: mockGuild, userRole: 'leader' }),
    );
    expect(html).toContain('Vibe Royalty');
    expect(html).toContain('ROYAL');
    expect(html).toContain('A top tier guild');
    expect(html).toContain('Mitglieder');
  });

  it('renders GuildMemberList correctly with member roles and levels', () => {
    const html = renderToString(
      React.createElement(GuildMemberList, {
        members: mockMembers,
        currentUserId: 'user_1',
        currentUserRole: 'leader',
      }),
    );
    expect(html).toContain('VibeKing');
    expect(html).toContain('AcePlayer');
    expect(html).toContain('42');
    expect(html).toContain('DIAMOND');
    expect(html).toContain('GOLD');
    expect(html).toContain('leader');
    expect(html).toContain('officer');
  });

  it('renders GuildSearchDirectory correctly', () => {
    const html = renderToString(
      React.createElement(GuildSearchDirectory, {
        guilds: [mockGuild],
        onSearch: () => {},
      }),
    );
    expect(html).toContain('Gilden-Verzeichnis');
    expect(html).toContain('Vibe Royalty');
  });

  it('renders GuildInvitesInbox correctly', () => {
    const mockInvites = [
      {
        id: 'inv_1',
        guildId: mockGuild.id,
        invitedUserId: 'user_3',
        invitedBy: 'user_1',
        status: 'pending' as const,
        createdAt: '2026-08-25T10:00:00.000Z',
        expiresAt: '2026-09-01T10:00:00.000Z',
        guild: {
          id: mockGuild.id,
          name: mockGuild.name,
          tag: mockGuild.tag,
          description: mockGuild.description,
        },
      },
    ];

    const html = renderToString(
      React.createElement(GuildInvitesInbox, {
        invites: mockInvites,
        onRespond: async () => {},
      }),
    );
    expect(html).toContain('Offene Gilden-Einladungen');
    expect(html).toContain('Vibe Royalty');
  });
});
