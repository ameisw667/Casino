import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = resolve(process.cwd(), 'supabase/migrations/053_guild_core.sql');

describe('053_guild_core migration', () => {
  it('creates guilds, guild_members, and guild_invites tables with correct constraints and triggers', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const sql = readFileSync(migrationPath, 'utf8');

    // 1. guilds table
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.guilds');
    expect(sql).toContain('CHECK (char_length(name) BETWEEN 3 AND 30)');
    expect(sql).toContain('CHECK (tag = upper(tag) AND char_length(tag) BETWEEN 2 AND 5)');
    expect(sql).toContain('CHECK (char_length(description) <= 500)');
    expect(sql).toContain('REFERENCES public.users(id)');
    expect(sql).toContain('member_count INTEGER NOT NULL DEFAULT 1');

    // 2. guild_members table
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.guild_members');
    expect(sql).toContain('REFERENCES public.guilds(id) ON DELETE CASCADE');
    expect(sql).toContain('REFERENCES public.users(id) ON DELETE CASCADE UNIQUE');
    expect(sql).toContain("CHECK (role IN ('leader', 'officer', 'member'))");
    expect(sql).toContain('PRIMARY KEY (guild_id, user_id)');

    // 3. Triggers
    expect(sql).toContain('FUNCTION public.enforce_single_guild_leader()');
    expect(sql).toContain('FUNCTION public.update_guild_member_count()');
    expect(sql).toContain('trg_enforce_single_guild_leader');
    expect(sql).toContain('trg_update_guild_member_count');

    // 4. guild_invites table
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.guild_invites');
    expect(sql).toContain("CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked'))");
    expect(sql).toContain('idx_guild_invites_pending_unique');

    // 5. RLS & Permissions
    expect(sql).toContain('ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('GRANT ALL ON TABLE public.guilds TO service_role');
    expect(sql).toContain('GRANT ALL ON TABLE public.guild_members TO service_role');
    expect(sql).toContain('GRANT ALL ON TABLE public.guild_invites TO service_role');
  });
});
