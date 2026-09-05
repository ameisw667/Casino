-- 06 Bot-/Automatisierungserkennung (worldmap/06_1_bot_automation_detection_plan.md L0):
-- extends risk_events with the new bot-signal types used by the login-guard preflight (L1),
-- the chat/guide daily cost cap (L2) and the signup honeypot/timing trap (L3).
-- Purely additive, same NOT VALID/VALIDATE pattern as 030/040 so record_risk_event() is
-- never locked out by concurrent callers. No new table, no automatic enforcement.

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
      'ml_anomaly_score',
      'bot_signal_honeypot',
      'bot_signal_timing',
      'bot_signal_login_flood',
      'cost_cap_reached'
    )
  ) NOT VALID;
ALTER TABLE public.risk_events VALIDATE CONSTRAINT risk_events_signal_type_check;

-- record_risk_event() re-validates signal_type independently of the table CHECK — both must
-- agree or the new signal type is silently rejected (same rationale as 030/040's comment).
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
      'ml_anomaly_score', 'bot_signal_honeypot', 'bot_signal_timing',
      'bot_signal_login_flood', 'cost_cap_reached'
    )
    OR p_severity NOT IN ('low', 'medium', 'high')
    OR p_fingerprint IS NULL OR length(trim(p_fingerprint)) = 0
    OR p_window_start IS NULL
    OR jsonb_typeof(COALESCE(p_evidence, '{}'::jsonb)) <> 'object'
  THEN
    RAISE EXCEPTION 'Invalid risk event';
  END IF;

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
-- re-issued below for explicitness (idempotent, matches the 030/040 grant statements).
REVOKE ALL ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  TO service_role;