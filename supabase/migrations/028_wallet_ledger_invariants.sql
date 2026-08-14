-- P1.1 Wallet-ledger invariants.
--
-- Financial facts are append-only. Existing settlement RPCs historically enrich a
-- freshly inserted row with a response payload; the trigger permits only that
-- metadata-only transition while keeping every ledger fact immutable.

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS actor_id TEXT,
  ADD COLUMN IF NOT EXISTS before_balance NUMERIC(20, 2),
  ADD COLUMN IF NOT EXISTS reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'wallet_transactions_admin_audit_contract'
  ) THEN
    ALTER TABLE public.wallet_transactions
      ADD CONSTRAINT wallet_transactions_admin_audit_contract
      CHECK (
        type <> 'admin_adjust'
        OR (
          actor_id IS NOT NULL
          AND length(trim(actor_id)) > 0
          AND before_balance IS NOT NULL
          AND request_id IS NOT NULL
          AND reason IS NOT NULL
          AND length(trim(reason)) > 0
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_actor
  ON public.wallet_transactions(actor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wallet_ledger_baselines (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  opening_balance NUMERIC(20, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'p1.1-migration'
);

-- Establish a deterministic reconciliation baseline without rewriting legacy
-- ledger rows. New discrepancies are still emitted as invariant events below.
INSERT INTO public.wallet_ledger_baselines (user_id, opening_balance)
SELECT
  u.id,
  round((u.balance - COALESCE(SUM(w.amount), 0))::numeric, 2)
FROM public.users AS u
LEFT JOIN public.wallet_transactions AS w ON w.user_id = u.id
GROUP BY u.id, u.balance
ON CONFLICT (user_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.wallet_invariant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  expected_balance NUMERIC(20, 2) NOT NULL,
  observed_balance NUMERIC(20, 2) NOT NULL,
  delta NUMERIC(20, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  occurrences INTEGER NOT NULL DEFAULT 1 CHECK (occurrences > 0),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fingerprint)
);

ALTER TABLE public.wallet_ledger_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_invariant_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.wallet_ledger_baselines FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.wallet_invariant_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_wallet_transaction_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'wallet_transactions is append-only';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id
      OR OLD.user_id IS DISTINCT FROM NEW.user_id
      OR OLD.game IS DISTINCT FROM NEW.game
      OR OLD.type IS DISTINCT FROM NEW.type
      OR OLD.amount IS DISTINCT FROM NEW.amount
      OR OLD.balance_after IS DISTINCT FROM NEW.balance_after
      OR OLD.request_id IS DISTINCT FROM NEW.request_id
      OR OLD.result_id IS DISTINCT FROM NEW.result_id
      OR OLD.actor_id IS DISTINCT FROM NEW.actor_id
      OR OLD.before_balance IS DISTINCT FROM NEW.before_balance
      OR OLD.reason IS DISTINCT FROM NEW.reason
      OR OLD.created_at IS DISTINCT FROM NEW.created_at
      OR COALESCE(OLD.metadata, '{}'::jsonb) <> '{}'::jsonb
      OR NOT (COALESCE(NEW.metadata, '{}'::jsonb) ? 'response')
    THEN
      RAISE EXCEPTION 'wallet_transactions is append-only';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallet_transactions_append_only_guard ON public.wallet_transactions;
CREATE TRIGGER wallet_transactions_append_only_guard
  BEFORE UPDATE OR DELETE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.guard_wallet_transaction_immutable();

REVOKE UPDATE, DELETE ON TABLE public.wallet_transactions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_wallet_transaction_immutable() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.reconcile_wallet_ledger(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_baseline NUMERIC(20, 2);
  v_observed NUMERIC(20, 2);
  v_expected NUMERIC(20, 2);
  v_delta NUMERIC(20, 2);
  v_fingerprint TEXT;
  v_consistent BOOLEAN;
BEGIN
  SELECT opening_balance INTO v_baseline
  FROM public.wallet_ledger_baselines
  WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet ledger baseline not found';
  END IF;

  SELECT balance INTO v_observed
  FROM public.users
  WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet user not found';
  END IF;

  SELECT round((v_baseline + COALESCE(SUM(amount), 0))::numeric, 2)
  INTO v_expected
  FROM public.wallet_transactions
  WHERE user_id = p_user_id;

  v_delta := round((v_observed - v_expected)::numeric, 2);
  v_consistent := v_delta = 0;
  v_fingerprint := md5(
    p_user_id || ':' || v_expected::text || ':' || v_observed::text || ':' || v_delta::text
  );

  IF NOT v_consistent THEN
    INSERT INTO public.wallet_invariant_events
      (user_id, fingerprint, expected_balance, observed_balance, delta)
    VALUES
      (p_user_id, v_fingerprint, v_expected, v_observed, v_delta)
    ON CONFLICT (user_id, fingerprint) DO UPDATE
      SET occurrences = wallet_invariant_events.occurrences + 1,
          last_seen_at = now();
  END IF;

  RETURN jsonb_build_object(
    'userId', p_user_id,
    'expectedBalance', v_expected,
    'observedBalance', v_observed,
    'delta', v_delta,
    'consistent', v_consistent,
    'eventFingerprint', CASE WHEN v_consistent THEN NULL ELSE v_fingerprint END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_wallet_ledger(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_wallet_ledger(TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_actor_id TEXT,
  p_target_user_id TEXT,
  p_request_id UUID,
  p_reason TEXT,
  p_balance NUMERIC DEFAULT NULL,
  p_xp NUMERIC DEFAULT NULL,
  p_level INTEGER DEFAULT NULL,
  p_rank TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_existing public.wallet_transactions%ROWTYPE;
  v_new_balance NUMERIC(20, 2);
  v_new_xp BIGINT;
  v_new_level INTEGER;
  v_new_rank TEXT;
  v_delta NUMERIC(20, 2);
  v_transaction_id UUID;
  v_metadata JSONB;
  v_response JSONB;
BEGIN
  IF p_actor_id IS NULL OR length(trim(p_actor_id)) = 0
    OR p_target_user_id IS NULL OR length(trim(p_target_user_id)) = 0
    OR p_request_id IS NULL OR p_reason IS NULL OR length(trim(p_reason)) = 0
  THEN
    RAISE EXCEPTION 'Admin audit context is required';
  END IF;
  IF p_balance IS NULL AND p_xp IS NULL AND p_level IS NULL AND p_rank IS NULL THEN
    RAISE EXCEPTION 'No update fields provided';
  END IF;
  IF p_balance IS NOT NULL AND p_balance < 0 THEN
    RAISE EXCEPTION 'Invalid balance';
  END IF;
  IF p_xp IS NOT NULL AND p_xp < 0 THEN
    RAISE EXCEPTION 'Invalid xp';
  END IF;
  IF p_level IS NOT NULL AND p_level < 1 THEN
    RAISE EXCEPTION 'Invalid level';
  END IF;
  IF p_rank IS NOT NULL AND length(trim(p_rank)) = 0 THEN
    RAISE EXCEPTION 'Invalid rank';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_target_user_id, 0));

  SELECT * INTO v_existing
  FROM public.wallet_transactions
  WHERE user_id = p_target_user_id AND request_id = p_request_id;
  IF FOUND AND v_existing.type = 'admin_adjust' THEN
    SELECT * INTO v_user FROM public.users WHERE id = p_target_user_id;
    RETURN jsonb_build_object(
      'user', jsonb_build_object(
        'id', v_user.id, 'username', v_user.username, 'email', v_user.email,
        'balance', v_user.balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
        'created_at', v_user.created_at
      ),
      'transactionId', v_existing.id,
      'replayed', true
    );
  END IF;
  IF FOUND THEN
    RAISE EXCEPTION 'Request ID already belongs to another wallet mutation';
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_target_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  v_new_balance := round(COALESCE(p_balance, v_user.balance)::numeric, 2);
  v_new_xp := COALESCE(p_xp::bigint, v_user.xp);
  v_new_level := COALESCE(p_level, v_user.level);
  v_new_rank := COALESCE(p_rank, v_user.rank);
  v_delta := round((v_new_balance - v_user.balance)::numeric, 2);
  v_transaction_id := gen_random_uuid();
  v_metadata := jsonb_build_object(
    'changedFields', jsonb_build_object(
      'balance', CASE WHEN p_balance IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.balance, 'after', v_new_balance) END,
      'xp', CASE WHEN p_xp IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.xp, 'after', v_new_xp) END,
      'level', CASE WHEN p_level IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.level, 'after', v_new_level) END,
      'rank', CASE WHEN p_rank IS NULL THEN NULL ELSE jsonb_build_object('before', v_user.rank, 'after', v_new_rank) END
    )
  );

  UPDATE public.users
  SET balance = v_new_balance,
      xp = v_new_xp,
      level = v_new_level,
      rank = v_new_rank,
      updated_at = now()
  WHERE id = p_target_user_id;

  INSERT INTO public.wallet_transactions
    (id, user_id, actor_id, game, type, amount, before_balance, balance_after,
     request_id, reason, metadata)
  VALUES
    (v_transaction_id, p_target_user_id, p_actor_id, 'admin', 'admin_adjust',
     v_delta, v_user.balance, v_new_balance, p_request_id, trim(p_reason), v_metadata);

  v_response := jsonb_build_object(
    'id', v_user.id, 'username', v_user.username, 'email', v_user.email,
    'balance', v_new_balance, 'xp', v_new_xp, 'level', v_new_level,
    'rank', v_new_rank, 'created_at', v_user.created_at
  );
  RETURN jsonb_build_object(
    'user', v_response,
    'transactionId', v_transaction_id,
    'replayed', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_user(TEXT, TEXT, UUID, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(TEXT, TEXT, UUID, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT)
  TO service_role;
