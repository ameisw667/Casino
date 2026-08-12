-- Security Casino F-01/F-02/F-03/F-06 — L2 verification runbook
-- Run migration 022 and 023 first in an approved non-production Supabase SQL Editor.
-- Every mutation below is contained in ROLLBACK. Do not copy secrets or server seeds.

-- A — F-06: role grants (read-only)
SELECT
  NOT has_function_privilege('anon', 'public.get_or_create_user_seed(text)', 'EXECUTE')
    AS f06_anon_blocked,
  NOT has_function_privilege('authenticated', 'public.get_or_create_user_seed(text)', 'EXECUTE')
    AS f06_authenticated_blocked,
  has_function_privilege('service_role', 'public.get_or_create_user_seed(text)', 'EXECUTE')
    AS f06_service_role_allowed;

-- B — F-02: atomic redemption, exact retry and per-user duplicate protection.
-- Expected: first_ok=true, retry_ok=true, retry_replayed=true,
-- duplicate_rejected=true, one_ledger=true, one_wallet_transaction=true,
-- and used_once=true. The transaction below ends in ROLLBACK.
BEGIN;

CREATE TEMP TABLE f02_context (
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  first_request_id UUID NOT NULL,
  second_request_id UUID NOT NULL
) ON COMMIT DROP;

INSERT INTO f02_context (user_id, code, first_request_id, second_request_id)
VALUES (
  'f02_l2_' || substring(md5(gen_random_uuid()::text), 1, 16),
  upper('F02' || substring(md5(gen_random_uuid()::text), 1, 12)),
  gen_random_uuid(),
  gen_random_uuid()
);

INSERT INTO public.users (id, username, balance)
SELECT user_id, user_id, 0 FROM f02_context;

INSERT INTO public.promo_codes (code, amount, max_uses, active)
SELECT code, 25.00, 1, true FROM f02_context;

CREATE TEMP TABLE f02_results (attempt TEXT PRIMARY KEY, result JSONB NOT NULL) ON COMMIT DROP;

INSERT INTO f02_results (attempt, result)
SELECT 'first', public.redeem_promo_code(user_id, code, first_request_id)
FROM f02_context;

INSERT INTO f02_results (attempt, result)
SELECT 'retry', public.redeem_promo_code(user_id, code, first_request_id)
FROM f02_context;

INSERT INTO f02_results (attempt, result)
SELECT 'duplicate', public.redeem_promo_code(user_id, code, second_request_id)
FROM f02_context;

SELECT
  (SELECT (result ->> 'ok')::boolean FROM f02_results WHERE attempt = 'first') AS first_ok,
  (SELECT (result ->> 'ok')::boolean FROM f02_results WHERE attempt = 'retry') AS retry_ok,
  (SELECT (result ->> 'replayed')::boolean FROM f02_results WHERE attempt = 'retry') AS retry_replayed,
  (SELECT result ->> 'code' = 'PROMO_ALREADY_REDEEMED' FROM f02_results WHERE attempt = 'duplicate') AS duplicate_rejected,
  (SELECT count(*) = 1 FROM public.promo_code_redemptions r JOIN f02_context c ON c.user_id = r.user_id AND c.code = r.code) AS one_ledger,
  (SELECT count(*) = 1 FROM public.wallet_transactions w JOIN f02_context c ON c.user_id = w.user_id WHERE w.metadata ->> 'source' = 'promo_code' AND w.metadata ->> 'code' = c.code) AS one_wallet_transaction,
  (SELECT p.used_count = 1 FROM public.promo_codes p JOIN f02_context c ON c.code = p.code) AS used_once;

ROLLBACK;

-- C — F-01 and F-03 require a deployed browser/session boundary and cannot be
-- established from a database role. With a dedicated non-production account:
-- 1. Set its users.balance to 0 using the approved admin path.
-- 2. Call GET /api/user/balance three times with that account's real session.
-- 3. Confirm every JSON snapshot remains balance: 0 and the DB value remains 0.
-- 4. POST cross-origin requests to /api/casino/seeds, /api/chat and
--    /api/user/stats with the same session; each must return 403 before any
--    observable mutation. Then repeat with the configured origin and valid bodies.
