import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  resolve(__dirname, '../../../../supabase/migrations/060_pg_cron_retry_failure_handling.sql'),
  'utf8',
);

describe('pg_cron retry and failure-handling migration (worldmap/07_background_jobs_scheduling.md, #3)', () => {
  it('persists a least-privilege lifecycle for each daily job run', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.background_job_runs');
    expect(sql).toContain(
      "CHECK (job_name IN ('guide_telemetry_purge', 'bet_fingerprint_purge', 'daily_race_settlement'))",
    );
    expect(sql).toContain("CHECK (status IN ('retry_scheduled', 'succeeded', 'dead_letter'))");
    expect(sql).toContain('UNIQUE (job_name, run_key)');
    expect(sql).toContain('ALTER TABLE public.background_job_runs ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain(
      'REVOKE ALL ON TABLE public.background_job_runs FROM PUBLIC, anon, authenticated',
    );
  });

  it('uses a non-blocking advisory lock and a bounded, increasing retry schedule', () => {
    expect(sql).toContain('pg_try_advisory_xact_lock');
    expect(sql).toContain("WHEN 1 THEN interval '5 minutes'");
    expect(sql).toContain("WHEN 2 THEN interval '15 minutes'");
    expect(sql).toContain('attempt_count < 3');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_failed_background_jobs()');
    expect(sql).toContain("'background-job-retry'");
  });

  it('keeps all three daily handlers behind the durable dispatcher and preserves the prior-day race key', () => {
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.run_guide_telemetry_purge_job()');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.run_bet_fingerprint_purge_job()');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.run_daily_race_settlement_job()');
    expect(sql).toContain(
      "PERFORM public.execute_background_job('guide_telemetry_purge', (now() AT TIME ZONE 'utc')::date)",
    );
    expect(sql).toContain(
      "PERFORM public.execute_background_job('bet_fingerprint_purge', (now() AT TIME ZONE 'utc')::date)",
    );
    expect(sql).toContain(
      "PERFORM public.execute_background_job('daily_race_settlement', ((now() AT TIME ZONE 'utc')::date - 1))",
    );
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.settle_daily_race(p_race_date DATE)');
    expect(sql).toContain('PERFORM public.settle_daily_race(p_run_key);');
  });

  it('enqueues one terminal alert per daily run and deduplicates both outbox dead-letter alerts', () => {
    expect(sql).toContain('alert_enqueued_at IS NULL');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.enqueue_cron_alert');
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS dead_letter_alerted_at TIMESTAMPTZ');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events()');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.retry_stale_big_win_events()');
    expect(sql).toContain('dead_letter_alerted_at IS NULL');
    expect(sql).toContain("WHERE event_type = 'xp_gain'");
    expect(sql).toContain("WHERE event_type = 'big_win_notify'");
  });

  it('counts big-win delivery attempts before pg_net dispatch, so an unavailable callback also reaches a terminal state', () => {
    const notifyBody = sql.slice(
      sql.indexOf('CREATE OR REPLACE FUNCTION public.notify_big_win_event()'),
      sql.indexOf('CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events()'),
    );
    expect(notifyBody).toContain('SET dispatch_attempts = dispatch_attempts + 1');
    expect(sql).toContain('AND dispatch_attempts < 5');
    expect(sql).toContain('(attempts >= 5 OR dispatch_attempts >= 5)');
  });

  it('does not broaden execution rights for the new privileged functions', () => {
    for (const signature of [
      'public.enqueue_cron_alert(TEXT, TEXT)',
      'public.execute_background_job(TEXT, DATE)',
      'public.retry_failed_background_jobs()',
    ]) {
      expect(sql).toContain(`REVOKE ALL ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated`);
      expect(sql).toContain(`GRANT EXECUTE ON FUNCTION ${signature} TO service_role`);
    }
  });
  it('protects retry timing, run-key binding, and every big-win delivery boundary', () => {
    const finalBigWinRetry = sql.slice(
      sql.lastIndexOf('CREATE OR REPLACE FUNCTION public.retry_stale_big_win_events()'),
    );
    expect(sql).toContain('public.background_job_runs.next_attempt_at <= now()');
    expect(sql).toContain('PERFORM public.settle_daily_race(p_run_key);');
    expect(finalBigWinRetry).toContain('FOR UPDATE SKIP LOCKED');
    expect(finalBigWinRetry).not.toContain('IF v_secret IS NOT NULL THEN\n    FOR v_row');
  });
});
