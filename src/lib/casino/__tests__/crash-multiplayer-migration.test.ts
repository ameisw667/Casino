import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const migrationPath = resolve(root, 'supabase/migrations/050_crash_multiplayer_game_type.sql');

describe('multiplayer crash game type migration (worldmap/05_v2_multiplayer_crash.md, L4)', () => {
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, 'utf8') : '';

  it('exists', () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it('updates game_rounds_game_check constraint to include CRASH_MULTIPLAYER', () => {
    expect(migration).toContain('game IN (\'CRASH\', \'BLACKJACK\', \'CRASH_MULTIPLAYER\')');
  });

  it('redefines start_game_round with CRASH_MULTIPLAYER support and generalized race guard', () => {
    expect(migration).toContain("p_game NOT IN ('CRASH', 'BLACKJACK', 'CRASH_MULTIPLAYER')");
    expect(migration).toContain("IF p_game IN ('CRASH', 'CRASH_MULTIPLAYER') AND EXISTS");
    expect(migration).toContain("game = p_game AND status = 'ACTIVE'");
  });

  it('restricts start_game_round to service_role', () => {
    expect(migration).toContain(
      'REVOKE ALL ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon, authenticated;',
    );
    expect(migration).toContain(
      'GRANT EXECUTE ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) TO service_role;',
    );
  });
});
