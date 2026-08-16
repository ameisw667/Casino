-- P2.8 Anti-Fraud: bet-behavior signals on top of the existing P1.2 risk_events store (029).
-- Adds two new signal types, three read-only aggregation RPCs, and a minimal, purge-bounded
-- network-fingerprint table for multi-account correlation (risk_events.evidence intentionally
-- never carries raw IPs — record_risk_event() strips any IP-like key, see risk-signals.ts).
-- Apply with a privileged migration role. Browser roles never receive execute access.

-- 1) Extend risk_events.signal_type without locking out the live record_risk_event() RPC.
-- NOT VALID takes a brief ACCESS EXCLUSIVE with no table scan; VALIDATE only needs
-- SHARE UPDATE EXCLUSIVE, so concurrent record_risk_event() calls from redeem-code are not blocked.
ALTER TABLE public.risk_events DROP CONSTRAINT IF EXISTS risk_events_signal_type_check;
ALTER TABLE public.risk_events ADD CONSTRAINT risk_events_signal_type_check
  CHECK (
    signal_type IN (
      'voucher_velocity',
      'multi_account_indicator',
      'idempotency_conflict',
      'rate_limit_hit',
      'balance_correction',
      'bet_velocity',
      'win_rate_anomaly'
    )
  ) NOT VALID;
ALTER TABLE public.risk_events VALIDATE CONSTRAINT risk_events_signal_type_check;

-- record_risk_event() re-validates signal_type independently inside the function body —
-- the table CHECK alone is not sufficient, both must agree or new signal types are rejected.
CREATE OR REPLACE FUNCTION public.record_risk_event(
  p_subject_user_id TEXT,
  p_signal_type TEXT,
  p_severity TEXT,
  p_fingerprint TEXT,
  p_window_start TIMESTAMPTZ,
  p_evidence JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event public.risk_events%ROWTYPE;
  v_evidence JSONB;
BEGIN
  IF p_subject_user_id IS NULL OR length(trim(p_subject_user_id)) = 0
    OR p_signal_type NOT IN (
      'voucher_velocity', 'multi_account_indicator', 'idempotency_conflict',
      'rate_limit_hit', 'balance_correction', 'bet_velocity', 'win_rate_anomaly'
    )
    OR p_severity NOT IN ('low', 'medium', 'high')
    OR p_fingerprint IS NULL OR length(trim(p_fingerprint)) = 0
    OR p_window_start IS NULL
    OR jsonb_typeof(COALESCE(p_evidence, '{}'::jsonb)) <> 'object'
  THEN
    RAISE EXCEPTION 'Invalid risk event';
  END IF;

  -- Evidence is an allowlist-by-redaction boundary. Direct IP/device values,
  -- credentials and seed material never enter the review table.
  v_evidence := jsonb_strip_nulls(
    COALESCE(p_evidence, '{}'::jsonb)
      - ARRAY[
        'secret', 'token', 'cookie', 'password', 'server_seed', 'serverSeed',
        'ip', 'device', 'email', 'authorization', 'credential'
      ]::TEXT[]
  );

  INSERT INTO public.risk_events
    (subject_user_id, signal_type, severity, fingerprint, window_start, evidence)
  VALUES
    (p_subject_user_id, p_signal_type, p_severity, p_fingerprint, p_window_start, v_evidence)
  ON CONFLICT (subject_user_id, fingerprint) DO UPDATE
    SET occurrences = public.risk_events.occurrences + 1,
        last_seen_at = now(),
        severity = CASE
          WHEN EXCLUDED.severity = 'high' OR public.risk_events.severity = 'high' THEN 'high'
          WHEN EXCLUDED.severity = 'medium' OR public.risk_events.severity = 'medium' THEN 'medium'
          ELSE 'low'
        END,
        evidence = public.risk_events.evidence || EXCLUDED.evidence
  RETURNING * INTO v_event;

  RETURN jsonb_build_object(
    'id', v_event.id,
    'status', v_event.status,
    'occurrences', v_event.occurrences,
    'replayed', v_event.occurrences > 1
  );
END;
$$;

-- CREATE OR REPLACE with an unchanged signature preserves existing grants, but both are
-- re-issued below for explicitness (idempotent, matches the original 029 grant statements).
REVOKE ALL ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  TO service_role;

-- 2) Minimal, hashed, purge-bounded network-fingerprint store for multi-account correlation.
-- One row per (user, ip_hash, day) via upsert — not one row per bet, to keep this from becoming
-- the highest-write-volume table in the schema. ip_hash is HMAC-SHA256(ip, FRAUD_FINGERPRINT_SECRET),
-- never the raw IP — pseudonymized, not anonymized (see 05_2.8_Anti_Fraud.md N2 for the caveat).
CREATE TABLE IF NOT EXISTS public.bet_network_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  seen_date DATE NOT NULL DEFAULT current_date,
  hit_count INTEGER NOT NULL DEFAULT 1 CHECK (hit_count > 0),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ip_hash, seen_date)
);

-- Covers detect_multi_account_clusters()'s GROUP BY ip_hash HAVING COUNT(DISTINCT user_id)
-- as an index-only scan (INCLUDE user_id avoids a heap fetch per row).
CREATE INDEX IF NOT EXISTS idx_bnf_ip_hash
  ON public.bet_network_fingerprints(ip_hash, last_seen_at DESC) INCLUDE (user_id);
-- Leading created_at column so the daily purge doesn't seq-scan (mirrors 024's occurred_at index).
CREATE INDEX IF NOT EXISTS idx_bnf_created_at
  ON public.bet_network_fingerprints(first_seen_at DESC);

ALTER TABLE public.bet_network_fingerprints ENABLE ROW LEVEL SECURITY;
-- ENABLE RLS with zero policies is deny-all for anon/authenticated; service_role bypasses RLS
-- by role, not policy, so this is sound defense-in-depth even against a future accidental grant.
REVOKE ALL ON TABLE public.bet_network_fingerprints FROM PUBLIC, anon, authenticated;

-- Writes go through an RPC (same convention as record_risk_event/settle_game_bet), never a raw
-- table insert — the hit_count increment on conflict must be atomic, which a client-side
-- upsert cannot guarantee under concurrent requests from the same user/IP.
CREATE OR REPLACE FUNCTION public.record_bet_network_fingerprint(
  p_user_id TEXT,
  p_ip_hash TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL OR length(trim(p_user_id)) = 0
    OR p_ip_hash IS NULL OR length(trim(p_ip_hash)) = 0
  THEN
    RAISE EXCEPTION 'Invalid network fingerprint';
  END IF;

  INSERT INTO public.bet_network_fingerprints (user_id, ip_hash)
  VALUES (p_user_id, p_ip_hash)
  ON CONFLICT (user_id, ip_hash, seen_date) DO UPDATE
    SET hit_count = public.bet_network_fingerprints.hit_count + 1,
        last_seen_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_bet_network_fingerprint(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_bet_network_fingerprint(TEXT, TEXT) TO service_role;

-- 3) Read-only aggregation RPCs. GROUP BY/HAVING/window-stddev are not expressible through the
-- Supabase JS query builder without pulling the full window client-side, so this stays in SQL;
-- the TS layer (fraud-detection.ts) only applies thresholds/severity and stays unit-testable.

CREATE OR REPLACE FUNCTION public.detect_bet_velocity_outliers(
  p_window_minutes INT DEFAULT 10,
  p_min_bets INT DEFAULT 30
)
RETURNS TABLE(user_id TEXT, bet_count INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT user_id, count(*)::INT AS bet_count
  FROM public.wallet_transactions
  WHERE type = 'bet' AND created_at >= now() - (p_window_minutes || ' minutes')::interval
  GROUP BY user_id
  HAVING count(*) >= p_min_bets;
$$;

CREATE OR REPLACE FUNCTION public.detect_multi_account_clusters(
  p_window_hours INT DEFAULT 24,
  p_min_cluster INT DEFAULT 3
)
RETURNS TABLE(ip_hash TEXT, user_ids TEXT[], cluster_size INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- ORDER BY inside the aggregate matters: array_agg(DISTINCT ...) has no ordering guarantee
  -- otherwise, and an unstable element order would change buildRiskEvent()'s evidence hash
  -- across identical same-day scans, breaking the ON CONFLICT dedup in record_risk_event().
  SELECT ip_hash, array_agg(DISTINCT user_id ORDER BY user_id) AS user_ids, count(DISTINCT user_id)::INT AS cluster_size
  FROM public.bet_network_fingerprints
  WHERE last_seen_at >= now() - (p_window_hours || ' hours')::interval
  GROUP BY ip_hash
  HAVING count(DISTINCT user_id) >= p_min_cluster;
$$;

CREATE OR REPLACE FUNCTION public.compute_cohort_win_rates(
  p_game TEXT,
  p_window_hours INT DEFAULT 24,
  p_min_bets INT DEFAULT 50
)
RETURNS TABLE(user_id TEXT, user_rtp NUMERIC, cohort_mean NUMERIC, cohort_stddev NUMERIC, bet_count INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH per_user AS (
    SELECT
      wallet_transactions.user_id AS user_id,
      sum(amount) FILTER (WHERE type = 'win')::NUMERIC
        / NULLIF(sum(-amount) FILTER (WHERE type = 'bet'), 0) AS rtp,
      count(*) FILTER (WHERE type = 'bet') AS bets
    FROM public.wallet_transactions
    WHERE game = p_game AND created_at >= now() - (p_window_hours || ' hours')::interval
    GROUP BY wallet_transactions.user_id
    HAVING count(*) FILTER (WHERE type = 'bet') >= p_min_bets
  )
  SELECT
    per_user.user_id,
    per_user.rtp AS user_rtp,
    avg(per_user.rtp) OVER () AS cohort_mean,
    stddev_pop(per_user.rtp) OVER () AS cohort_stddev,
    per_user.bets::INT AS bet_count
  FROM per_user;
$$;

REVOKE ALL ON FUNCTION public.detect_bet_velocity_outliers(INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.detect_multi_account_clusters(INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.compute_cohort_win_rates(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.detect_bet_velocity_outliers(INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.detect_multi_account_clusters(INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_cohort_win_rates(TEXT, INT, INT) TO service_role;

-- 4) Scan concurrency guard. A session-level pg_advisory_lock would not survive across the
-- several separate RPC calls a single admin scan makes (Supabase's pooled connections are not
-- guaranteed to be the same physical session between calls) — a conditional UPDATE on a
-- single-row table is atomic per call and does not depend on connection affinity. Staleness
-- fallback (5 min) guards against a crashed scan leaving a permanent lock.
CREATE TABLE IF NOT EXISTS public.fraud_scan_lock (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  locked_at TIMESTAMPTZ,
  locked_by TEXT
);
INSERT INTO public.fraud_scan_lock (id, locked_at, locked_by)
VALUES (true, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.fraud_scan_lock ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.fraud_scan_lock FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.try_acquire_fraud_scan_lock(
  p_locked_by TEXT,
  p_stale_after_minutes INT DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE public.fraud_scan_lock
  SET locked_at = now(), locked_by = p_locked_by
  WHERE id = true
    AND (locked_at IS NULL OR locked_at < now() - (p_stale_after_minutes || ' minutes')::interval);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_fraud_scan_lock()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.fraud_scan_lock SET locked_at = NULL, locked_by = NULL WHERE id = true;
$$;

REVOKE ALL ON FUNCTION public.try_acquire_fraud_scan_lock(TEXT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_fraud_scan_lock() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.try_acquire_fraud_scan_lock(TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_fraud_scan_lock() TO service_role;

-- 5) 30-day purge for bet_network_fingerprints, same split (pure delete + alert-on-failure
-- wrapper) and same pg_cron/pg_net/vault-secret pattern as 027_guide_telemetry_purge_cron.sql.
CREATE OR REPLACE FUNCTION public.purge_bet_network_fingerprints()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  DELETE FROM public.bet_network_fingerprints WHERE first_seen_at < now() - interval '30 days';
$$;

REVOKE ALL ON FUNCTION public.purge_bet_network_fingerprints() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_bet_network_fingerprints() TO service_role;

CREATE OR REPLACE FUNCTION public.run_bet_fingerprint_purge_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.purge_bet_network_fingerprints();
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
                'job', 'bet_fingerprint_purge',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately, same rationale as 027: pg_cron has no retry/backoff, re-raising
    -- would only spam identical failures at the next run without changing the outcome.
END;
$$;

REVOKE ALL ON FUNCTION public.run_bet_fingerprint_purge_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_bet_fingerprint_purge_job() TO service_role;

-- Idempotent (re)scheduling so this migration can be safely re-applied. Offset from
-- guide-telemetry-purge-daily (03:17) to avoid both jobs contending at the same instant.
DO $$
BEGIN
    PERFORM cron.unschedule('bet-fingerprint-purge-daily');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'bet-fingerprint-purge-daily',
    '41 3 * * *',
    $$SELECT public.run_bet_fingerprint_purge_job();$$
);
