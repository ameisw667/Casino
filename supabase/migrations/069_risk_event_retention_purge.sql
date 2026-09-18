-- 06_3 L6 (Multi-Account-Abuse-Prevention, worldmap plan 06_3): retention policy for
-- risk_events themselves. Until now only bet_network_fingerprints had a purge job
-- (030, 30 days); risk_events grew unboundedly. This purge deletes only RESOLVED events
-- (closed or suppressed) whose last occurrence is older than 90 days — 90 instead of 30,
-- because risk events carry audit/evidence value for admin decisions and must outlive a
-- short-lived correlation key. open/reviewed/reopened events are NEVER deleted, regardless
-- of age.
--
-- Same split as 030: pure delete function + plpgsql job wrapper that alerts
-- /api/internal/cron-alert via the vault secret on failure and swallows the exception
-- (pg_cron has no retry/backoff — re-raising would only spam identical failures).

CREATE OR REPLACE FUNCTION public.purge_closed_risk_events()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DELETE FROM public.risk_events
  WHERE status IN ('closed', 'suppressed')
    AND last_seen_at < now() - interval '90 days';
$$;

REVOKE ALL ON FUNCTION public.purge_closed_risk_events() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_closed_risk_events() TO service_role;

CREATE OR REPLACE FUNCTION public.run_risk_event_purge_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.purge_closed_risk_events();
EXCEPTION WHEN OTHERS THEN
    SELECT decrypted_secret INTO v_alert_secret
    FROM vault.decrypted_secrets
    WHERE name = 'cron_alert_secret'
    LIMIT 1;

    IF v_alert_secret IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://casino-xi-six.vercel.app/api/internal/cron-alert',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-cron-alert-secret', v_alert_secret
            ),
            body := jsonb_build_object(
                'job', 'risk_event_purge',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately, same rationale as 027/030: pg_cron has no retry/backoff,
    -- re-raising would only spam identical failures at the next run without changing
    -- the outcome.
END;
$$;

REVOKE ALL ON FUNCTION public.run_risk_event_purge_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_risk_event_purge_job() TO service_role;

-- Idempotent (re)scheduling so this migration can be safely re-applied. Offset from
-- guide-telemetry-purge-daily (03:17) and bet-fingerprint-purge-daily (03:41) so no two
-- purge jobs contend at the same instant.
DO $$
BEGIN
    PERFORM cron.unschedule('risk-event-purge-daily');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'risk-event-purge-daily',
    '53 3 * * *',
    $$SELECT public.run_risk_event_purge_job();$$
);