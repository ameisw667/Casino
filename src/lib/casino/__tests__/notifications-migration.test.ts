import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = resolve(process.cwd(), 'supabase/migrations/050_user_notifications.sql');

describe('050_user_notifications migration', () => {
  it('creates a private, durable notification inbox with a user-scoped Realtime topic', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.user_notifications');
    expect(migration).toContain("CHECK (kind IN ('big_win', 'achievement', 'system'))");
    expect(migration).toContain('UNIQUE (user_id, source_key)');
    expect(migration).toContain('REFERENCES public.users(id) ON DELETE CASCADE');
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL ON TABLE public.user_notifications FROM PUBLIC, anon, authenticated');
    expect(migration).toContain('GRANT SELECT, INSERT, UPDATE ON TABLE public.user_notifications TO service_role');
    expect(migration).toContain("realtime.topic() = 'user-notifications:' || auth.uid()::text");
    expect(migration).toContain("realtime.messages.extension = 'broadcast'");
  });
});