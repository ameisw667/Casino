import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationPath = resolve(
  root,
  'supabase/migrations/049_crash_room_realtime_authorization.sql',
);

/**
 * Live rollout finding (worldmap/05_multiplayercrash.md §18, 2026-08-23): this Supabase project's
 * Realtime Authorization model requires an explicit policy on realtime.messages before any
 * browser client can subscribe to a Broadcast channel — server-side publish via the service_role
 * client bypasses RLS and always worked, masking the gap behind the REST poll fallback (NFR3).
 */
describe('crash-room Realtime Broadcast authorization (049)', () => {
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

  it('exists', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('scopes the policy to exactly the crash-room broadcast topic, not a blanket grant', () => {
    expect(migration).toContain("realtime.topic() = 'crash-room'");
    expect(migration).toContain("realtime.messages.extension = 'broadcast'");
  });

  it('is SELECT-only — the server publishes via service_role, which is RLS-exempt; no client ever needs INSERT', () => {
    expect(migration).toMatch(/FOR SELECT/);
    expect(migration).not.toMatch(/FOR (ALL|INSERT)/);
  });

  it('grants both anon and authenticated — the channel is deliberately public/spectator-facing, never carries a secret', () => {
    expect(migration).toContain('TO anon, authenticated');
  });

  it('is idempotent via DROP POLICY IF EXISTS (CREATE POLICY has no IF NOT EXISTS in Postgres)', () => {
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "crash_room_broadcast_receive" ON realtime.messages;',
    );
  });
});
