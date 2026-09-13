-- 06_9 L3 (Admin Fraud Detection, worldmap plan 06_9): adds the `reopened` status to
-- risk_events so a wrongly closed/reviewed event can be corrected by an explicit admin
-- action. Purely additive, same NOT VALID/VALIDATE pattern as 030/040/062 so the
-- CHECK-constraint swap never locks out concurrent writers.
--
-- Order-of-execution note: this migration intentionally does NOT contain 06_3's planned
-- `suppressed` status. Both plans originally recommended sharing one migration, but the
-- mandated execution order runs 06_9 (#4) before 06_3 (#10); a second, separate
-- CHECK-constraint migration in 06_3 is accepted and documented in both protocols.

ALTER TABLE public.risk_events DROP CONSTRAINT IF EXISTS risk_events_status_check;
ALTER TABLE public.risk_events ADD CONSTRAINT risk_events_status_check
  CHECK (status IN ('open', 'reviewed', 'closed', 'reopened')) NOT VALID;
ALTER TABLE public.risk_events VALIDATE CONSTRAINT risk_events_status_check;

-- review_risk_event() gains the `reopen` action. `reopened` is only reachable FROM
-- 'closed'/'reviewed' (a human decision that needs correcting) — never from 'open',
-- which is already the actionable queue state. The pre-check runs before the UPDATE;
-- race window is acceptable for a single-row, admin-only, service-role-only action.
-- Reopening keeps the original reviewer columns in place; the new review_reason
-- documents who reopened the event and why.
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
    OR p_status NOT IN ('reviewed', 'closed', 'reopened')
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
-- re-issued below for explicitness (idempotent, matches the 030/040/062 grant statements).
REVOKE ALL ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_risk_event(UUID, TEXT, TEXT, TEXT)
  TO service_role;