\set ON_ERROR_STOP on

\if :{?phase1_target_confirmed}
\else
  \echo 'P1.3 aborted: phase1_target_confirmed is missing'
  \quit 3
\endif
\if :phase1_target_confirmed
\else
  \echo 'P1.3 aborted: target confirmation is not true'
  \quit 3
\endif

BEGIN;

CREATE TEMP TABLE phase1_assertions (name TEXT PRIMARY KEY, passed BOOLEAN NOT NULL);
INSERT INTO phase1_assertions (name, passed)
VALUES
  ('append_only_trigger', EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'wallet_transactions_append_only_guard'
      AND tgrelid = 'public.wallet_transactions'::regclass
  )),
  ('wallet_invariant_events', to_regclass('public.wallet_invariant_events') IS NOT NULL),
  ('risk_events', to_regclass('public.risk_events') IS NOT NULL),
  ('risk_events_rls', EXISTS (
    SELECT 1 FROM pg_class
    WHERE oid = 'public.risk_events'::regclass AND relrowsecurity
  )),
  ('anon_cannot_update_ledger', NOT has_table_privilege(
    'anon', 'public.wallet_transactions', 'UPDATE'
  )),
  ('authenticated_cannot_update_ledger', NOT has_table_privilege(
    'authenticated', 'public.wallet_transactions', 'UPDATE'
  )),
  ('anon_cannot_execute_admin_rpc', NOT has_function_privilege(
    'anon', 'public.admin_update_user(text,text,uuid,text,numeric,numeric,integer,text)', 'EXECUTE'
  )),
  ('authenticated_cannot_execute_admin_rpc', NOT has_function_privilege(
    'authenticated', 'public.admin_update_user(text,text,uuid,text,numeric,numeric,integer,text)', 'EXECUTE'
  )),
  ('service_role_can_execute_admin_rpc', has_function_privilege(
    'service_role', 'public.admin_update_user(text,text,uuid,text,numeric,numeric,integer,text)', 'EXECUTE'
  )),
  ('anon_cannot_execute_risk_rpc', NOT has_function_privilege(
    'anon', 'public.record_risk_event(text,text,text,text,timestamptz,jsonb)', 'EXECUTE'
  )),
  ('authenticated_cannot_execute_risk_rpc', NOT has_function_privilege(
    'authenticated', 'public.record_risk_event(text,text,text,text,timestamptz,jsonb)', 'EXECUTE'
  ));

DO $$
DECLARE
  v_failed TEXT;
BEGIN
  SELECT string_agg(name, ', ' ORDER BY name) INTO v_failed
  FROM phase1_assertions
  WHERE NOT passed;
  IF v_failed IS NOT NULL THEN
    RAISE EXCEPTION 'P1.3 contract assertions failed: %', v_failed;
  END IF;
END $$;

CREATE TEMP TABLE phase1_context (
  user_id TEXT NOT NULL,
  request_id UUID NOT NULL,
  event_fingerprint TEXT NOT NULL
);
INSERT INTO phase1_context
VALUES ('phase1-sql-probe-user', gen_random_uuid(), 'phase1-sql-probe-fingerprint');

INSERT INTO public.users (id, username, balance, xp, level, rank)
SELECT user_id, user_id, 10000, 0, 1, 'BRONZE' FROM phase1_context;
INSERT INTO public.wallet_ledger_baselines (user_id, opening_balance, source)
SELECT user_id, 10000, 'p1.3-sql-probe' FROM phase1_context;

DO $$
DECLARE
  v_context phase1_context%ROWTYPE;
  v_first JSONB;
  v_second JSONB;
  v_count INTEGER;
  v_event JSONB;
  v_occurrences INTEGER;
  v_token TEXT;
BEGIN
  SELECT * INTO v_context FROM phase1_context;
  v_first := public.admin_update_user(
    'phase1-sql-actor', v_context.user_id, v_context.request_id,
    'P1.3 SQL idempotency probe', 10001, NULL, NULL, NULL
  );
  v_second := public.admin_update_user(
    'phase1-sql-actor', v_context.user_id, v_context.request_id,
    'P1.3 SQL idempotency probe', 10001, NULL, NULL, NULL
  );
  SELECT count(*) INTO v_count
  FROM public.wallet_transactions
  WHERE user_id = v_context.user_id AND request_id = v_context.request_id;
  IF v_first->>'replayed' <> 'false' OR v_second->>'replayed' <> 'true' OR v_count <> 1 THEN
    RAISE EXCEPTION 'P1.3 admin idempotency assertion failed';
  END IF;

  BEGIN
    UPDATE public.wallet_transactions
    SET amount = amount + 1
    WHERE user_id = v_context.user_id AND request_id = v_context.request_id;
    RAISE EXCEPTION 'P1.3 append-only trigger did not block update';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'P1.3 append-only trigger did not block update' THEN RAISE; END IF;
  END;

  v_event := public.record_risk_event(
    v_context.user_id, 'rate_limit_hit', 'medium', v_context.event_fingerprint,
    now(), jsonb_build_object('scope', 'p1.3', 'token', 'must-not-persist')
  );
  PERFORM public.record_risk_event(
    v_context.user_id, 'rate_limit_hit', 'medium', v_context.event_fingerprint,
    now(), jsonb_build_object('scope', 'p1.3')
  );
  SELECT occurrences, evidence->>'token' INTO v_occurrences, v_token
  FROM public.risk_events
  WHERE subject_user_id = v_context.user_id AND fingerprint = v_context.event_fingerprint;
  IF v_event IS NULL OR v_occurrences <> 2 OR v_token IS NOT NULL THEN
    RAISE EXCEPTION 'P1.3 risk-event assertion failed';
  END IF;
END $$;

ROLLBACK;
