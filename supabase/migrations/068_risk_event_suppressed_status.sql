-- 06_3 L3 (Multi-Account-Abuse-Prevention, worldmap plan 06_3): False-Positive-Allowlist.
-- Adds the `suppressed` status to risk_events so an admin can mark a detected multi-account
-- cluster as "known legitimate" (household, office, CGNAT) — future scan runs skip any
-- fingerprint that has a suppressed entry instead of re-raising the same finding forever.
--
-- Same NOT VALID/VALIDATE CHECK-constraint swap as 030/040/062/065 so concurrent
-- record_risk_event() writers are never locked out. This is the second, separate status
-- migration for risk_events: 065 already added `reopened` and explicitly excluded
-- `suppressed` (executed before 06_3 in the mandated order — documented in 065's header).

ALTER TABLE public.risk_events DROP CONSTRAINT IF EXISTS risk_events_status_check;
ALTER TABLE public.risk_events ADD CONSTRAINT risk_events_status_check
  CHECK (status IN ('open', 'reviewed', 'closed', 'reopened', 'suppressed')) NOT VALID;
ALTER TABLE public.risk_events VALIDATE CONSTRAINT risk_events_status_check;

-- review_risk_event() gains the `suppress` action. Unlike `reopened`, `suppressed` is a
-- deliberate human judgment ("this cluster is legitimate") and is reachable from ANY
-- current status — including reopened, in case a wrongly reopened event turns out to be
-- a known household after all. `reopened` keeps its closed/reviewed-only transition.
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
    OR p_status NOT IN ('reviewed', 'closed', 'reopened', 'suppressed')
    OR p_reason IS NULL OR length(trim(p_reason)) = 0
  THEN
    RAISE EXCEPTION 'Invalid risk review';
  END IF;

  IF p_status = 'reopened' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.risk_events
      WHERE id = p_event_id AND status IN ('closed', 'reviewed')
    ) THEN
      RAISE EXCEPTION 'Invalid risk transition';
    END IF;
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

-- CREATE OR REPLACE with an unchanged signature preserves existing grants, but both are
-- re-issued below for explicitness (idempotent, matches the 030/040/062/065 grant statements).
REVOKE ALL ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  TO service_role;