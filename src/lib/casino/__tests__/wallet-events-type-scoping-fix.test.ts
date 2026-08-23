import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/048_fix_wallet_events_type_scoping.sql'),
  'utf8',
);

describe('wallet_events type-scoping fix (security-review finding, worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md)', () => {
  it('scopes the 4.1 trigger to xp_gain rows only, so a big_win_notify insert never fires the xp_gain push path', () => {
    expect(sql).toContain('DROP TRIGGER IF EXISTS wallet_events_notify ON wallet_events');
    expect(sql).toMatch(
      /CREATE TRIGGER wallet_events_notify\s+AFTER INSERT ON wallet_events\s+FOR EACH ROW WHEN \(NEW\.event_type = 'xp_gain'\)/,
    );
  });

  it('scopes apply_xp_gain\'s row lookup to xp_gain, so it can never mark a big_win_notify row processed', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION apply_xp_gain');
    expect(sql).toContain("WHERE id = p_event_id AND event_type = 'xp_gain' FOR UPDATE");
  });

  it('scopes the xp_gain cron backstop to xp_gain, so it can never silently absorb a stuck big_win_notify row', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events');
    expect(sql).toContain("WHERE event_type = 'xp_gain'\n      AND processed_at IS NULL");
    expect(sql).toContain(
      "WHERE event_type = 'xp_gain' AND processed_at IS NULL AND attempts >= 5",
    );
  });
});
