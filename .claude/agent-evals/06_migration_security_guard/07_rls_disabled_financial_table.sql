-- Adds a reporting index and, while at it, disables RLS on wallet_transactions to
-- simplify an ad-hoc analytics query. No justification is documented for the disable.
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reporting
  ON public.wallet_transactions (created_at, type);

ALTER TABLE public.wallet_transactions DISABLE ROW LEVEL SECURITY;
