-- 2.7 Royale Guide Observability: daily 90-day retention purge, scheduled via pg_cron.
-- On failure, posts a text-free alert (job name + truncated SQLSTATE error) via pg_net to an
-- internal, secret-protected Next.js route that forwards it to Sentry. No prompt/answer/user
-- content ever passes through this path — guide_telemetry_events itself contains none.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.run_guide_telemetry_purge_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.purge_guide_telemetry_events();
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
                'job', 'guide_telemetry_purge',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately: pg_cron has no retry/backoff, so re-raising would only
    -- spam identical failures at the next run without changing the outcome.
END;
$$;

REVOKE ALL ON FUNCTION public.run_guide_telemetry_purge_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_guide_telemetry_purge_job() TO service_role;

-- Idempotent (re)scheduling so this migration can be safely re-applied.
DO $$
BEGIN
    PERFORM cron.unschedule('guide-telemetry-purge-daily');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'guide-telemetry-purge-daily',
    '17 3 * * *',
    $$SELECT public.run_guide_telemetry_purge_job();$$
);
