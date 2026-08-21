-- P27/1.15 ML-Fraud-Pipeline, Option A (worldmap/09_ML_FRAUD_ANOMALY.md): extends risk_events
-- with an unsupervised anomaly-score signal computed offline by a self-implemented Isolation
-- Forest (src/lib/casino/fraud-ml/), run manually via `npm run fraud-ml-scan` — never from the
-- request path. Purely additive: no new table, no automatic enforcement. Same NOT VALID/
-- VALIDATE pattern as 030 so record_risk_event() is never locked out by concurrent callers.

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
      'win_rate_anomaly',
      'ml_anomaly_score'
    )
  ) NOT VALID;
ALTER TABLE public.risk_events VALIDATE CONSTRAINT risk_events_signal_type_check;

-- record_risk_event() re-validates signal_type independently of the table CHECK — both must
-- agree or the new signal type is silently rejected (same rationale as 030's comment).
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
      'rate_limit_hit', 'balance_correction', 'bet_velocity', 'win_rate_anomaly',
      'ml_anomaly_score'
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

REVOKE ALL ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  TO service_role;

-- Read-only, per-user feature aggregation for the offline Isolation Forest scan. Only aggregates
-- leave the RPC, never a per-transaction row. amount sign convention matches
-- compute_cohort_win_rates (030): bet rows carry a negative delta, win rows a positive one, so
-- abs(amount) recovers the wagered magnitude and sum(amount) on wins is already the payout.
-- inter_bet_seconds_cv uses LAG() over created_at to catch bot-like regular betting cadence — a
-- signal none of the 3 existing rule detectors (030) cover.
CREATE OR REPLACE FUNCTION public.compute_fraud_ml_features(
  p_window_days INT DEFAULT 7,
  p_min_bets INT DEFAULT 20
)
RETURNS TABLE(
  user_id TEXT,
  bet_count INT,
  total_wagered NUMERIC,
  avg_bet_size NUMERIC,
  bet_size_cv NUMERIC,
  rtp NUMERIC,
  inter_bet_seconds_cv NUMERIC,
  unique_games INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH bets AS (
    SELECT
      user_id,
      game,
      abs(amount) AS bet_amount,
      created_at,
      created_at - lag(created_at) OVER (PARTITION BY user_id ORDER BY created_at) AS gap
    FROM public.wallet_transactions
    WHERE type = 'bet' AND created_at >= now() - (p_window_days || ' days')::interval
  ),
  wins AS (
    SELECT user_id, sum(amount) AS total_won
    FROM public.wallet_transactions
    WHERE type = 'win' AND created_at >= now() - (p_window_days || ' days')::interval
    GROUP BY user_id
  ),
  per_user AS (
    SELECT
      bets.user_id,
      count(*)::INT AS bet_count,
      sum(bet_amount) AS total_wagered,
      avg(bet_amount) AS avg_bet_size,
      stddev_pop(bet_amount) AS bet_amount_stddev,
      count(DISTINCT game)::INT AS unique_games,
      avg(extract(epoch FROM gap)) FILTER (WHERE gap IS NOT NULL) AS avg_gap_seconds,
      stddev_pop(extract(epoch FROM gap)) FILTER (WHERE gap IS NOT NULL) AS gap_stddev_seconds
    FROM bets
    GROUP BY bets.user_id
    HAVING count(*) >= p_min_bets
  )
  SELECT
    per_user.user_id,
    per_user.bet_count,
    per_user.total_wagered,
    per_user.avg_bet_size,
    CASE WHEN per_user.avg_bet_size > 0
      THEN per_user.bet_amount_stddev / per_user.avg_bet_size ELSE 0 END AS bet_size_cv,
    CASE WHEN per_user.total_wagered > 0
      THEN COALESCE(wins.total_won, 0) / per_user.total_wagered ELSE 0 END AS rtp,
    CASE WHEN per_user.avg_gap_seconds > 0
      THEN per_user.gap_stddev_seconds / per_user.avg_gap_seconds ELSE 0 END AS inter_bet_seconds_cv,
    per_user.unique_games
  FROM per_user
  LEFT JOIN wins ON wins.user_id = per_user.user_id;
$$;

REVOKE ALL ON FUNCTION public.compute_fraud_ml_features(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_fraud_ml_features(INT, INT) TO service_role;
