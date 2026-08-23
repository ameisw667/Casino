import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/047_event_bus_big_win_consumer.sql'),
  'utf8',
);

describe('event-bus big-win-notify consumer migration (worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md)', () => {
  it('extends wallet_events additively without touching the 4.1 xp_gain shape', () => {
    expect(sql).toContain('ALTER TABLE wallet_events ADD COLUMN IF NOT EXISTS event_payload JSONB');
    expect(sql).toContain("CHECK (event_type IN ('xp_gain', 'big_win_notify'))");
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION apply_xp_gain');
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION public.notify_wallet_event');
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events');
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION settle_game_bet');
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION settle_game_round');
    expect(sql).not.toContain('CREATE OR REPLACE FUNCTION advance_blackjack_round');
  });

  it('defines an idempotent emit RPC restricted to service_role', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.emit_big_win_notify_event');
    expect(sql).toContain('ON CONFLICT (user_id, request_id, event_type) DO NOTHING');
    expect(sql).toContain(
      'REVOKE ALL ON FUNCTION public.emit_big_win_notify_event(TEXT, UUID, TEXT, NUMERIC, NUMERIC)\n  FROM PUBLIC, anon, authenticated',
    );
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.emit_big_win_notify_event(TEXT, UUID, TEXT, NUMERIC, NUMERIC)\n  TO service_role',
    );
  });

  it('splits claim (no processed_at write) from ack (processed_at write) so a failed dispatch is retried, not lost', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.claim_big_win_notify_event');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.ack_big_win_notify_event');
    const claimBody = sql.slice(
      sql.indexOf('CREATE OR REPLACE FUNCTION public.claim_big_win_notify_event'),
      sql.indexOf('REVOKE ALL ON FUNCTION public.claim_big_win_notify_event'),
    );
    expect(claimBody).not.toContain('processed_at = now()');
    expect(claimBody).toContain('attempts = attempts + 1');
    const ackBody = sql.slice(
      sql.indexOf('CREATE OR REPLACE FUNCTION public.ack_big_win_notify_event'),
      sql.indexOf('REVOKE ALL ON FUNCTION public.ack_big_win_notify_event'),
    );
    expect(ackBody).toContain('processed_at = now()');
  });

  it('pushes new big_win_notify events via a dedicated, swallowed-exception pg_net trigger', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.notify_big_win_event');
    expect(sql).toContain('net.http_post');
    expect(sql).toContain("name = 'big_win_event_secret'");
    expect(sql).toContain("WHEN (NEW.event_type = 'big_win_notify')");
    expect(sql).toContain('EXCEPTION WHEN OTHERS THEN');
  });

  it('schedules an independent pg_cron backstop that re-POSTs the route and alerts on dead letters', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_stale_big_win_events');
    expect(sql).toContain("cron.schedule(\n  'big-win-events-retry'");
    expect(sql).toContain("name = 'cron_alert_secret'");
    expect(sql).toContain('attempts >= 5');
  });
});
