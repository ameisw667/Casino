import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationDir = resolve(root, 'supabase/migrations');
const migrations = readdirSync(migrationDir)
  .filter((file) => /^\d{3}_.+\.sql$/.test(file))
  .sort();

const requiredMigrations = [
  '049_crash_room_realtime_authorization.sql',
  '050_crash_multiplayer_game_type.sql',
  '051_achievement_visibility.sql',
  '052_user_login_history.sql',
  '053_guild_feature_intentionally_removed.sql',
  '054_guide_persona.sql',
  '055_custom_access_token_hook.sql',
  '056_user_notifications.sql',
  '057_remove_legacy_guild_schema.sql',
  '060_pg_cron_retry_failure_handling.sql',
];

describe('migration history hardening', () => {
  it('uses one filename per migration version and keeps the repaired range contiguous', () => {
    const versions = migrations.map((file) => file.slice(0, 3));
    // Die Obergrenze wird pro neuer Migration bewusst hartkodiert gepflegt (wie bisher):
    // 064_enable_pgtap.sql (T_DATABASE/10 L3) erweitert den erwarteten Kontiguitätsbereich auf 64.
    const expectedVersions = Array.from({ length: 64 }, (_, index) =>
      String(index + 1).padStart(3, '0'),
    );

    expect(versions).toEqual(expectedVersions);
    expect(migrations).toEqual(expect.arrayContaining(requiredMigrations));
  });

  it('records the deliberately removed Guild feature as a no-op historical marker', () => {
    const marker = readFileSync(
      resolve(migrationDir, '053_guild_feature_intentionally_removed.sql'),
      'utf8',
    );

    expect(marker).toContain('Guild feature intentionally removed');
    expect(marker).toContain('No database objects are created by this marker.');
  });

  it('removes the legacy Guild schema explicitly, without CASCADE', () => {
    const migration = readFileSync(
      resolve(migrationDir, '057_remove_legacy_guild_schema.sql'),
      'utf8',
    );

    expect(migration).toContain('DROP TABLE IF EXISTS public.guild_invites;');
    expect(migration).toContain('DROP TABLE IF EXISTS public.guild_members;');
    expect(migration).toContain('DROP TABLE IF EXISTS public.guilds;');
    expect(migration).toContain(
      'DROP FUNCTION IF EXISTS public.enforce_single_guild_leader();',
    );
    expect(migration).toContain(
      'DROP FUNCTION IF EXISTS public.update_guild_member_count();',
    );
    expect(migration).not.toMatch(/CASCADE/i);
  });
  it('targets public.users for the guide persona migration', () => {
    const migration = readFileSync(
      resolve(migrationDir, '054_guide_persona.sql'),
      'utf8',
    );

    expect(migration).toContain('ALTER TABLE public.users');
    expect(migration).not.toMatch(/\bprofiles\b/i);
  });
  it('reconciles remote drift without destructive or Guild SQL', () => {
    const migration = readFileSync(
      resolve(migrationDir, '058_reconcile_remote_schema_drift.sql'),
      'utf8',
    );

    expect(migration).toContain('REVOKE ALL ON TABLE "public"."promo_codes"');
    expect(migration).toContain('CREATE EVENT TRIGGER "ensure_rls"');
    expect(migration).not.toMatch(/DROP\s+/i);
    expect(migration).not.toMatch(/CASCADE/i);
    expect(migration).not.toMatch(/\bguild/i);
  });

  it('hardens the remaining legacy SECURITY DEFINER functions', () => {
    const migration = readFileSync(
      resolve(migrationDir, '059_harden_legacy_definer_search_path.sql'),
      'utf8',
    );

    expect(migration).toContain('ALTER FUNCTION public.place_bet(text, numeric, text)');
    expect(migration).toContain('ALTER FUNCTION public.settle_bet(text, numeric, integer, text)');
    expect(migration).toMatch(/SET search_path TO public, pg_temp/);
    expect(migration).toContain('REVOKE ALL ON FUNCTION public.place_bet(text, numeric, text)');
    expect(migration).toContain('REVOKE ALL ON FUNCTION public.settle_bet(text, numeric, integer, text)');
  });
  it('does not point the local reset configuration at a missing seed file', () => {
    const config = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8');

    expect(config).not.toContain('sql_paths = ["./seed.sql"]');
  });
});
