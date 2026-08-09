-- Migration 015: Create get_leaderboard RPC for fast & comprehensive leaderboard stats across all 5 games

-- Ensure payout column exists on game_rounds (in case Migration 014 was not yet executed on remote DB)
ALTER TABLE public.game_rounds ADD COLUMN IF NOT EXISTS payout NUMERIC(20, 2) NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  username TEXT,
  level INTEGER,
  rank TEXT,
  total_wagered NUMERIC,
  biggest_win NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT
    u.username,
    COALESCE(u.level, 1)::INTEGER AS level,
    COALESCE(u.rank, 'BRONZE') AS rank,
    ROUND(COALESCE(SUM(c.wagered), 0), 2) AS total_wagered,
    ROUND(COALESCE(MAX(c.win_amount), 0), 2) AS biggest_win
  FROM (
    -- DICE / ROULETTE / SLOTS (from wallet_transactions)
    SELECT
      user_id,
      COALESCE(
        NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
        NULLIF((metadata -> 'response' -> 'result' ->> 'amount')::numeric, 0),
        CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
      ) AS wagered,
      CASE WHEN amount > 0 THEN amount ELSE 0 END AS win_amount
    FROM public.wallet_transactions
    WHERE type = 'bet_settled'

    UNION ALL

    -- CRASH / BLACKJACK (from game_rounds)
    SELECT
      user_id,
      bet_amount AS wagered,
      GREATEST(payout - bet_amount, 0) AS win_amount
    FROM public.game_rounds
    WHERE status = 'SETTLED'
  ) c
  JOIN public.users u ON u.id = c.user_id
  GROUP BY u.id, u.username, u.level, u.rank
  ORDER BY total_wagered DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO service_role;
