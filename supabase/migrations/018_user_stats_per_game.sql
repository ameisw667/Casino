-- ============================================================
-- Migration 018: Per-Game Breakdown for User Lifetime Stats
-- ============================================================
-- Extends get_user_stats() with a `perGame` array so the client can show
-- favorite-game / per-game-profit charts without a new table or a new RPC.
-- Reuses the exact combined UNION ALL source from migration 014 (bet_settled
-- wallet_transactions + settled game_rounds), only additionally grouped by
-- game instead of collapsed into scalars. No existing top-level field changes.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_total_bets    BIGINT         := 0;
  v_total_wins    BIGINT         := 0;
  v_total_wagered NUMERIC(20, 2) := 0;
  v_total_payout  NUMERIC(20, 2) := 0;
  v_total_profit  NUMERIC(20, 2) := 0;
  v_achievements  JSONB          := '[]'::jsonb;
  v_per_game      JSONB          := '[]'::jsonb;
BEGIN
  -- combined/grouped are CTEs scoped to this single statement (a CTE cannot be
  -- referenced across separate SELECT INTO statements in PL/pgSQL), so both the
  -- lifetime scalars and the per-game jsonb_agg are produced by one query here.
  WITH combined AS MATERIALIZED (
    -- DICE / ROULETTE / SLOTS: one bet_settled row per bet, amount already net.
    SELECT
      lower(game)                                                        AS game,
      1                                                                   AS bets,
      (amount > 0)::int                                                  AS win,
      COALESCE(
        NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
        CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
      )                                                                   AS wagered,
      COALESCE(
        (metadata -> 'response' ->> 'payout')::numeric,
        CASE WHEN amount > 0 THEN amount ELSE 0 END
      )                                                                   AS payout,
      amount                                                              AS profit
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND type = 'bet_settled'

    UNION ALL

    -- CRASH / BLACKJACK: settled game_rounds carry exact bet_amount/payout.
    SELECT
      lower(game)                                                        AS game,
      1                                                                   AS bets,
      (payout > 0)::int                                                  AS win,
      bet_amount                                                          AS wagered,
      payout                                                              AS payout,
      payout - bet_amount                                                 AS profit
    FROM public.game_rounds
    WHERE user_id = p_user_id AND status = 'SETTLED'
  ),
  grouped AS (
    SELECT
      game,
      SUM(bets)    AS bets,
      SUM(win)     AS wins,
      SUM(wagered) AS wagered,
      SUM(payout)  AS payout,
      SUM(profit)  AS profit
    FROM combined
    WHERE game IS NOT NULL
    GROUP BY game
  )
  SELECT
    COALESCE((SELECT SUM(bets)    FROM combined), 0),
    COALESCE((SELECT SUM(win)     FROM combined), 0),
    COALESCE((SELECT SUM(wagered) FROM combined), 0),
    COALESCE((SELECT SUM(payout)  FROM combined), 0),
    COALESCE((SELECT SUM(profit)  FROM combined), 0),
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'game',    grouped.game,
        'bets',    grouped.bets,
        'wins',    grouped.wins,
        'wagered', grouped.wagered,
        'payout',  grouped.payout,
        'profit',  grouped.profit,
        'winRate', CASE WHEN grouped.bets > 0
                     THEN round((grouped.wins::numeric / grouped.bets::numeric) * 100, 1)
                     ELSE 0
                   END
      ) ORDER BY grouped.wagered DESC)
      FROM grouped
    ), '[]'::jsonb)
  INTO v_total_bets, v_total_wins, v_total_wagered, v_total_payout, v_total_profit, v_per_game;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id',       achievement_id,
    'unlocked', unlocked,
    'progress', progress
  )), '[]'::jsonb)
  INTO v_achievements
  FROM public.user_achievements
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'totalBets',    v_total_bets,
    'totalWins',    v_total_wins,
    'totalWagered', v_total_wagered,
    'totalPayout',  v_total_payout,
    'totalProfit',  v_total_profit,
    'winRate',      CASE
                      WHEN v_total_bets > 0
                      THEN round((v_total_wins::numeric / v_total_bets::numeric) * 100, 1)
                      ELSE 0
                    END,
    'achievements', v_achievements,
    'perGame',      v_per_game
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_stats(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(TEXT) TO service_role;
