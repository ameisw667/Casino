import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationPath = resolve(root, 'supabase/migrations/038_fix_crash_round_pgcrypto_schema.sql');

/**
 * Live bug found on first real `npx supabase db push` of migration 037
 * (worldmap/05_multiplayercrash.md, L7, 2026-08-21): sync_crash_round called
 * gen_random_bytes()/digest() unqualified. pgcrypto lives in the `extensions`
 * schema (026_require_pgcrypto_for_seed_chain.sql), not `public`, and
 * `SET search_path = public, pg_temp` never resolves it — Postgres error
 * 42883 "function gen_random_bytes(integer) does not exist", confirmed via a
 * direct RPC call against the remote DB. Same root cause 019_seed_chain.sql
 * originally had for consume_active_seed/rotate_user_seed, fixed forward by
 * 026 rather than editing 019 in place — 038 follows that same convention
 * for 037 rather than rewriting migration history.
 */
describe('sync_crash_round pgcrypto schema fix (038)', () => {
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

  it('exists', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('schema-qualifies both seed-generation calls, matching 026_require_pgcrypto_for_seed_chain.sql', () => {
    expect(migration).toContain('extensions.gen_random_bytes(32)');
    expect(migration).toContain("extensions.digest(v_seed, 'sha256')");
    // The bug: these unqualified forms must not appear anywhere in the fix.
    expect(migration).not.toMatch(/[^.]gen_random_bytes\(32\)/);
    expect(migration).not.toMatch(/[^.]digest\(v_seed, 'sha256'\)/);
  });

  it('redefines sync_crash_round with the same signature as 037 (no accidental API break)', () => {
    expect(migration).toMatch(
      /sync_crash_round\(\s*p_betting_window_ms INTEGER,\s*p_post_crash_pause_ms INTEGER,\s*p_crashed_at TIMESTAMPTZ DEFAULT NULL\s*\)/,
    );
  });

  it('keeps the dedicated scheduler advisory lock, unchanged from 037', () => {
    expect(migration).toContain("pg_advisory_xact_lock(hashtext('crash_round_scheduler'))");
  });

  it('restricts EXECUTE to service_role, matching 037', () => {
    expect(migration).toContain(
      'REVOKE ALL ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'GRANT EXECUTE ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) TO service_role;',
    );
  });
});

describe('regression: 037 itself still has the unqualified bug (historical record, not re-fixed in place)', () => {
  it('037 is left as originally pushed — 038 fixes forward, matching the 019/026 convention', () => {
    const migration037 = readFileSync(
      resolve(root, 'supabase/migrations/037_multiplayer_crash_rounds.sql'),
      'utf8',
    );
    const syncFn = migration037.slice(migration037.indexOf('FUNCTION public.sync_crash_round'));
    // This assertion documents WHY 038 exists — if this ever flips (someone
    // "helpfully" edits 037 in place), 038 becomes a no-op CREATE OR REPLACE
    // that's harmless but pointless; worth knowing either way.
    expect(syncFn.slice(0, syncFn.indexOf('$$;'))).toContain('gen_random_bytes(32)');
  });
});
