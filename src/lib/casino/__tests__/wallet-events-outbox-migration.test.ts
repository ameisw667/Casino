import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/036_wallet_events_outbox.sql'),
  'utf8',
);

describe('wallet_events outbox migration (worldmap/05_OutboxWallet.md)', () => {
  it('defines an idempotent event table keyed on (user_id, request_id, event_type)', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS wallet_events');
    expect(sql).toContain('UNIQUE (user_id, request_id, event_type)');
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('REVOKE ALL ON TABLE wallet_events FROM anon, authenticated');
  });

  it('defines an idempotent, non-raising XP-apply RPC restricted to service_role', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION apply_xp_gain');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain("'alreadyProcessed', true");
    expect(sql).toContain('REVOKE ALL ON FUNCTION apply_xp_gain(UUID) FROM PUBLIC, anon, authenticated');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION apply_xp_gain(UUID) TO service_role');
  });

  it('pushes new events via a swallowed-exception pg_net trigger', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.notify_wallet_event');
    expect(sql).toContain('net.http_post');
    expect(sql).toContain("name = 'wallet_event_secret'");
    expect(sql).toContain('AFTER INSERT ON wallet_events');
    expect(sql).toContain('EXCEPTION WHEN OTHERS THEN');
  });

  it('schedules a pg_cron backstop that retries directly and alerts on dead letters', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events');
    expect(sql).toContain("cron.schedule(\n  'wallet-events-retry'");
    expect(sql).toContain("name = 'cron_alert_secret'");
    expect(sql).toContain('attempts >= 5');
  });

  it('drops the inline XP write from all three settlement RPCs and emits an event instead', () => {
    for (const fn of ['settle_game_bet', 'settle_game_round', 'advance_blackjack_round']) {
      expect(sql).toContain(`CREATE OR REPLACE FUNCTION ${fn}`);
    }
    expect(sql).not.toMatch(/UPDATE users SET balance[^;]*xp = v_xp/s);
    expect(sql.match(/INSERT INTO wallet_events \(user_id, request_id, event_type, xp_gain\)/g))
      .toHaveLength(3);
  });
});
