import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Migration 052_user_login_history.sql', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '052_user_login_history.sql',
  );

  it('exists and is not empty', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
    const content = fs.readFileSync(migrationPath, 'utf8');
    expect(content.length).toBeGreaterThan(50);
  });

  it('contains expected table, check constraints and index', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.user_login_history');
    expect(content).toContain("auth_method IN ('password', 'passkey', 'google', 'otp_magic_link')");
    expect(content).toContain("status IN ('success', 'failed')");
    expect(content).toContain('idx_user_login_history_timeline');
  });

  it('enforces Row Level Security (RLS) on user_login_history', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    expect(content).toContain('ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;');
    expect(content).toContain('CREATE POLICY "user_login_history_select_own"');
    expect(content).toContain('user_id = auth.uid()::text');
  });
});
