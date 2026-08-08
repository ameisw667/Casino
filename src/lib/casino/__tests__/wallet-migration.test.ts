import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(resolve(__dirname, '../../../../supabase/migrations/007_server_authority.sql'), 'utf8');

describe('server-authoritative wallet migration', () => {
  it('defines an idempotent atomic settlement RPC', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION settle_game_bet');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain('UNIQUE (user_id, request_id)');
    expect(sql).toContain('FOR UPDATE');
    expect(sql).toContain("metadata -> 'response'");
  });

  it('stores stateful rounds for crash and blackjack', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS game_rounds');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION start_game_round');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION settle_game_round');
  });

  it('keeps privileged RPCs inaccessible to browser roles', () => {
    expect(sql).toContain('REVOKE ALL ON FUNCTION settle_game_bet');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION settle_game_bet');
  });
});
