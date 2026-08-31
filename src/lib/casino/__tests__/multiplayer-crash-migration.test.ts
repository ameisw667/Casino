import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationPath = resolve(root, 'supabase/migrations/037_multiplayer_crash_rounds.sql');

describe('multiplayer crash rounds migration (worldmap/05_multiplayercrash.md)', () => {
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

  it('exists', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('locks crash_rounds down like game_rounds/seeds — no direct client access (§7 defense line 1)', () => {
    expect(migration).toContain('REVOKE ALL ON TABLE crash_rounds FROM anon, authenticated');
  });

  it('generates the round seed server-side via pgcrypto, never accepts one as a parameter', () => {
    const syncStart = migration.indexOf('FUNCTION public.sync_crash_round');
    const syncEnd = migration.indexOf('FUNCTION public.set_crash_round_point');
    const syncFunction = migration.slice(syncStart, syncEnd);
    expect(syncFunction).toContain('gen_random_bytes(32)');
    expect(syncFunction).toContain("digest(v_seed, 'sha256')");
    // The RPC signature must not accept a caller-supplied seed or crash point.
    expect(migration).toMatch(
      /sync_crash_round\(\s*p_betting_window_ms INTEGER,\s*p_post_crash_pause_ms INTEGER,\s*p_crashed_at TIMESTAMPTZ DEFAULT NULL\s*\)/,
    );
  });

  it('serializes round scheduling through the dedicated advisory lock key, disjoint from the per-user lock', () => {
    const syncStart = migration.indexOf('FUNCTION public.sync_crash_round');
    const syncEnd = migration.indexOf('FUNCTION public.set_crash_round_point');
    const syncFunction = migration.slice(syncStart, syncEnd);
    expect(syncFunction).toContain("pg_advisory_xact_lock(hashtext('crash_round_scheduler'))");
    // Per-user lock (Migration 007/019) uses hashtextextended(user_id, 0) — must not collide.
    expect(syncFunction).not.toContain('hashtextextended');
  });

  it('makes set_crash_round_point idempotent via a conditional UPDATE, not a second advisory lock', () => {
    const setPointStart = migration.indexOf('FUNCTION public.set_crash_round_point');
    const setPointEnd = migration.indexOf('-- Redefinition of start_game_round');
    const setPointFunction = migration.slice(
      setPointStart,
      setPointEnd !== -1 ? setPointEnd : undefined,
    );
    expect(setPointFunction).toContain('WHERE id = p_round_id AND crash_point IS NULL');
    expect(setPointFunction).not.toContain('pg_advisory_xact_lock');
  });

  it('restricts both new RPCs to service_role, exactly like the existing round/seed RPCs', () => {
    for (const fn of [
      'sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ)',
      'set_crash_round_point(UUID, NUMERIC)',
    ]) {
      expect(migration).toContain(
        `REVOKE ALL ON FUNCTION public.${fn} FROM PUBLIC, anon, authenticated;`,
      );
      expect(migration).toContain(`GRANT EXECUTE ON FUNCTION public.${fn} TO service_role;`);
    }
  });

  it('links game_rounds to crash_rounds additively — nullable FK, no NOT NULL/backfill', () => {
    expect(migration).toContain(
      'ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS crash_round_id UUID REFERENCES crash_rounds(id);',
    );
  });

  it('constrains crash_point to sane values at the schema level (defense in depth)', () => {
    expect(migration).toContain('CHECK (crash_point IS NULL OR crash_point >= 1)');
  });

  describe('start_game_round CRASH race guard (L6 follow-up: TOCTOU fix, 2026-08-21)', () => {
    const startFnStart = migration.indexOf('CREATE OR REPLACE FUNCTION start_game_round');
    const startFn = migration.slice(startFnStart);
    const lockIndex = startFn.indexOf('pg_advisory_xact_lock(hashtextextended(p_user_id, 0))');
    const guardIndex = startFn.indexOf('Active crash round already exists');
    const insertIndex = startFn.indexOf('INSERT INTO game_rounds');

    it('redefines start_game_round exactly once, in this migration', () => {
      expect(startFnStart).toBeGreaterThan(-1);
    });

    it('places the CRASH-active-round guard AFTER the advisory lock is acquired — the actual race fix, not just a check', () => {
      expect(lockIndex).toBeGreaterThan(-1);
      expect(guardIndex).toBeGreaterThan(-1);
      expect(guardIndex).toBeGreaterThan(lockIndex);
    });

    it('places the guard BEFORE the round is inserted, so it can actually prevent the second round', () => {
      expect(insertIndex).toBeGreaterThan(-1);
      expect(guardIndex).toBeLessThan(insertIndex);
    });

    it('scopes the guard to CRASH only — BLACKJACK concurrent-round semantics are untouched (out of scope)', () => {
      const guardBlock = startFn.slice(
        startFn.indexOf("IF p_game = 'CRASH' AND EXISTS"),
        insertIndex,
      );
      expect(guardBlock).toContain("game = 'CRASH'");
      expect(guardBlock).not.toContain('BLACKJACK');
    });

    it('grants EXECUTE only to service_role, matching every other RPC in this file', () => {
      expect(migration).toContain(
        'REVOKE ALL ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon, authenticated;',
      );
      expect(migration).toContain(
        'GRANT EXECUTE ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) TO service_role;',
      );
    });
  });
});
