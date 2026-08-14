-- P1.2 abuse/fraud signal storage.

CREATE TABLE IF NOT EXISTS public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (
    signal_type IN (
      'voucher_velocity',
      'multi_account_indicator',
      'idempotency_conflict',
      'rate_limit_hit',
      'balance_correction'
    )
  ),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  fingerprint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(evidence) = 'object'),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  occurrences INTEGER NOT NULL DEFAULT 1 CHECK (occurrences > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_reason TEXT,
  UNIQUE (subject_user_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_risk_events_review_queue
  ON public.risk_events(status, severity, last_seen_at DESC);

ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.risk_events FROM PUBLIC, anon, authenticated;

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
      'rate_limit_hit', 'balance_correction'
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

CREATE OR REPLACE FUNCTION public.review_risk_event(
  p_event_id UUID,
  p_reviewer_id TEXT,
  p_status TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event public.risk_events%ROWTYPE;
BEGIN
  IF p_event_id IS NULL OR p_reviewer_id IS NULL OR length(trim(p_reviewer_id)) = 0
    OR p_status NOT IN ('reviewed', 'closed')
    OR p_reason IS NULL OR length(trim(p_reason)) = 0
  THEN
    RAISE EXCEPTION 'Invalid risk review';
  END IF;

  UPDATE public.risk_events
  SET status = p_status,
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      review_reason = left(trim(p_reason), 500)
  WHERE id = p_event_id
  RETURNING * INTO v_event;
  IF NOT FOUND THEN RAISE EXCEPTION 'Risk event not found'; END IF;

  RETURN jsonb_build_object(
    'id', v_event.id,
    'status', v_event.status,
    'reviewedBy', v_event.reviewed_by,
    'reviewedAt', v_event.reviewed_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_risk_event(TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, JSONB)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  TO service_role;
