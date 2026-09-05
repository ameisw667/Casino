-- Migration 061: Composite index + keyset-read RPC for /api/user/history cursor pagination

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_history_cursor
  ON public.wallet_transactions (user_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_user_history_page(
  p_user_id TEXT,
  p_cursor_created_at TIMESTAMPTZ,
  p_cursor_id UUID,
  p_limit INT
)
RETURNS TABLE(
  id UUID,
  game TEXT,
  type TEXT,
  amount NUMERIC,
  balance_after NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT wt.id, wt.game, wt.type, wt.amount, wt.balance_after, wt.created_at
  FROM public.wallet_transactions wt
  WHERE wt.user_id = p_user_id
    AND (
      p_cursor_created_at IS NULL
      OR (wt.created_at, wt.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY wt.created_at DESC, wt.id DESC
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_user_history_page(TEXT, TIMESTAMPTZ, UUID, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_history_page(TEXT, TIMESTAMPTZ, UUID, INT) TO service_role;