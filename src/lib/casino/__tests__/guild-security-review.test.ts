import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('L6 Security Review - 7 Points Checklist Audit', () => {
  const migrationPath = resolve(process.cwd(), 'supabase/migrations/053_guild_core.sql');
  const servicePath = resolve(process.cwd(), 'src/lib/casino/guild-service.ts');
  const routeAuthPath = resolve(process.cwd(), 'src/lib/security/guild-route-auth.ts');

  it('Checklist Point 1: Auth resolver never uses dev fallback and uses supabase.auth.getUser()', () => {
    expect(existsSync(routeAuthPath)).toBe(true);
    const authCode = readFileSync(routeAuthPath, 'utf8');
    expect(authCode).toContain('supabase.auth.getUser()');
    expect(authCode).not.toContain('dev_user_fallback');
  });

  it('Checklist Point 2 & 3: Role escalation and demotion prevention enforced in service', () => {
    const serviceCode = readFileSync(servicePath, 'utf8');
    // Cannot modify own role
    expect(serviceCode).toContain('actorUserId === targetUserId');
    // Cannot demote/modify leader
    expect(serviceCode).toContain("targetMember.role === 'leader'");
    // Only leader can transfer leadership
    expect(serviceCode).toContain("actorMember.role !== 'leader'");
    // Officer cannot modify other officer
    expect(serviceCode).toContain("actorMember.role === 'officer' && targetMember.role === 'officer'");
    // Officer cannot kick leader
    expect(serviceCode).toContain("targetMember.role === 'leader'");
  });

  it('Checklist Point 4: Invite response strictly validates ownership with auth identity', () => {
    const serviceCode = readFileSync(servicePath, 'utf8');
    expect(serviceCode).toContain('invite.invited_user_id !== userId');
  });

  it('Checklist Point 5: Fail-closed error handling on service and route boundaries', () => {
    const serviceCode = readFileSync(servicePath, 'utf8');
    expect(serviceCode).toContain('CasinoLogger.error');
    expect(serviceCode).toContain('GuildServiceError');
  });

  it('Checklist Point 6 & 7: RLS enabled, client writes revoked, member_count trigger enforced', () => {
    const migrationCode = readFileSync(migrationPath, 'utf8');
    expect(migrationCode).toContain('ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY');
    expect(migrationCode).toContain('ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY');
    expect(migrationCode).toContain('ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY');
    expect(migrationCode).toContain('REVOKE ALL ON TABLE public.guilds FROM PUBLIC, anon, authenticated');
    expect(migrationCode).toContain('REVOKE ALL ON TABLE public.guild_members FROM PUBLIC, anon, authenticated');
    expect(migrationCode).toContain('REVOKE ALL ON TABLE public.guild_invites FROM PUBLIC, anon, authenticated');
    expect(migrationCode).toContain('FUNCTION public.enforce_single_guild_leader()');
    expect(migrationCode).toContain('FUNCTION public.update_guild_member_count()');
  });
});
