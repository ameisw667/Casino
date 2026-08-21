import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/037_fix_wallet_events_jackpot_regression.sql'),
  'utf8',
);
// Strips SQL line comments so counts below reflect real code, not the header's prose
// explanation (which itself names jackpot_pool_settle()/wallet_events for documentation).
const sqlWithoutComments = sql.replace(/--.*$/gm, '');

// Regression guard: 036_wallet_events_outbox.sql rewrote settle_game_round and
// advance_blackjack_round using pre-034 bodies, silently deleting the progressive-jackpot
// integration (034_progressive_jackpot_trigger.sql) that shares their exact signature. This
// migration restores it. See worldmap/05_OutboxWallet.md and the migration's own header comment.
describe('037 restores jackpot integration alongside the wallet_events outbox', () => {
  const eightArgStart = sql.indexOf('CREATE OR REPLACE FUNCTION settle_game_bet(');
  const tenArgStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.settle_game_bet(');
  const activeFunctionsSql = sql.slice(tenArgStart); // excludes the dead 8-arg overload

  it('calls jackpot_pool_settle in all three real settlement paths (10-arg settle_game_bet, settle_game_round, advance_blackjack_round)', () => {
    const occurrences = sqlWithoutComments.match(/jackpot_pool_settle\(/g) ?? [];
    expect(occurrences.length).toBe(3);
  });

  it('strips jackpotRoll from every client-visible response/state, matching 034s fix', () => {
    const occurrences = sql.match(/\(p_result - 'jackpotRoll'\)/g) ?? [];
    // 10-arg settle_game_bet response, settle_game_round response + its game_rounds.state
    // merge, advance_blackjack_round response = 4, same count as 034 itself asserts.
    expect(occurrences.length).toBe(4);
  });

  it('still emits wallet_events instead of writing xp/level/rank inline, for the three real settlement paths', () => {
    const occurrences = activeFunctionsSql.match(
      /INSERT INTO (?:public\.)?wallet_events \(user_id, request_id, event_type, xp_gain\)/g,
    ) ?? [];
    expect(occurrences.length).toBe(3);
    expect(activeFunctionsSql).not.toMatch(/UPDATE (?:public\.)?users SET balance[^;]*xp = v_xp/s);
  });

  it('reverts the dead 8-arg settle_game_bet overload to its pristine, non-jackpot 007 form', () => {
    expect(eightArgStart).toBeGreaterThanOrEqual(0);
    expect(tenArgStart).toBeGreaterThan(eightArgStart);
    const eightArgBody = sql.slice(eightArgStart, tenArgStart);
    expect(eightArgBody).not.toContain('jackpot_pool_settle');
    expect(eightArgBody).toContain('casino_xp_level_divisor()');
  });
});
