import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationPath = resolve(root, 'supabase/migrations/021_require_pgcrypto_for_seed_chain.sql');

describe('seed chain pgcrypto prerequisite', () => {
  it('installs pgcrypto and recreates both seed functions with schema-qualified crypto calls', () => {
    expect(existsSync(migrationPath)).toBe(true);

    const migration = readFileSync(migrationPath, 'utf8');
    expect(migration).toContain('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;');

    const consumeFunction = migration.slice(
      migration.indexOf('FUNCTION public.consume_active_seed'),
    );
    expect(consumeFunction).toContain('extensions.gen_random_bytes(32)');
    expect(consumeFunction).toContain("extensions.digest(v_server_seed, 'sha256')");

    const rotateFunction = migration.slice(migration.indexOf('FUNCTION public.rotate_user_seed'));
    expect(rotateFunction).toContain('extensions.gen_random_bytes(32)');
    expect(rotateFunction).toContain("extensions.digest(v_new_server_seed, 'sha256')");
  });
});
