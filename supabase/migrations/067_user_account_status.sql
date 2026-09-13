-- 06_3 L2 (Multi-Account-Abuse-Prevention, worldmap plan 06_3): admin-initiated fraud
-- enforcement — an admin can freeze a confirmed multi-account abuser's account.
--
-- Deliberately a column on `users`, NOT an extension of `user_wellbeing_limits` (063):
-- that table is for player-initiated self-protection (self-exclusion chosen by the user
-- themselves). Freezing is a different purpose (admin fraud enforcement) and must not be
-- mixed into the same table — documented in plan 06_3 Abschnitt 0.
--
-- Enforcement is code-side (checkWellbeingGuard reads this column and blocks the four
-- money routes); RLS stays untouched — service_role bypasses RLS by role, and anon/
-- authenticated never need to read another user's account_status.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_account_status_check;
-- NOT VALID/VALIDATE split: the brief ACCESS EXCLUSIVE lock of ADD CONSTRAINT does no
-- table scan; VALIDATE only needs SHARE UPDATE EXCLUSIVE — no lockout of concurrent
-- writers (same pattern as 065's risk_events status swap).
ALTER TABLE public.users ADD CONSTRAINT users_account_status_check
  CHECK (account_status IN ('active', 'frozen')) NOT VALID;
ALTER TABLE public.users VALIDATE CONSTRAINT users_account_status_check;

COMMENT ON COLUMN public.users.account_status IS
  '06_3 L2: admin-initiated fraud enforcement. active = normal play, frozen = blocked from all money routes (checkWellbeingGuard). Never written automatically — always an explicit admin action via PATCH /api/admin/users/[id]/status.';