-- Fix for P27/1.15 Option A (worldmap/09_ML_FRAUD_ANOMALY.md): 040_fraud_ml_anomaly_score.sql's
-- compute_fraud_ml_features() assumed a legacy two-row 'bet'/'win' settlement model (stale
-- comment carried over from 002_wallet.sql). The live server-authority model (007+) never wrote
-- that: DICE/ROULETTE/SLOTS settle as ONE 'bet_settled' row per bet with a signed NET amount
-- (amount = payout - wager, see settle_game_bet() in 007), so 'bet'/'win' rows never existed and
-- the original RPC always returned zero rows. Discovered via a real live run against the actual
-- Supabase project (empty result set investigated instead of assumed benign), not a hypothetical.
--
-- The original wager magnitude is not separately persisted for bet_settled rows, so
-- total_wagered/avg_bet_size/bet_size_cv/rtp as originally defined are not reconstructable from
-- wallet_transactions — this redefines the feature set around what is actually stored: the signed
-- net result. CRASH/BLACKJACK use a different, multi-row model ('round_started'/'round_settled'/
-- 'round_action', see 007) and are deliberately out of scope for this fix — folding them in
-- correctly needs a join against game_rounds and per-round reconstruction, a larger change than
-- this fix warrants. DICE/ROULETTE/SLOTS (this RPC's scope) are the three single-shot games and
-- the most bot-scriptable, so this remains a meaningful v1 anomaly signal.
--
-- Argument signature (INT, INT) is unchanged from 040, but the OUT-parameter column set (the
-- RETURNS TABLE(...) row type) is not — Postgres rejects CREATE OR REPLACE in that case
-- (42P13: "cannot change return type of existing function ... Row type defined by OUT
-- parameters is different", confirmed against the live project). DROP FUNCTION first, then
-- recreate; grants are re-issued after, since DROP also revokes them.

DROP FUNCTION IF EXISTS public.compute_fraud_ml_features(INT, INT);

CREATE OR REPLACE FUNCTION public.compute_fraud_ml_features(
  p_window_days INT DEFAULT 7,
  p_min_bets INT DEFAULT 20
)
RETURNS TABLE(
  user_id TEXT,
  bet_count INT,
  net_result NUMERIC,
  avg_abs_amount NUMERIC,
  amount_cv NUMERIC,
  win_rate NUMERIC,
  inter_bet_seconds_cv NUMERIC,
  unique_games INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH bets AS (
    SELECT
      user_id,
      game,
      amount,
      created_at,
      created_at - lag(created_at) OVER (PARTITION BY user_id ORDER BY created_at) AS gap
    FROM public.wallet_transactions
    -- DICE/ROULETTE/SLOTS only (settle_game_bet()'s single-row model) — see header note.
    WHERE type = 'bet_settled' AND created_at >= now() - (p_window_days || ' days')::interval
  ),
  per_user AS (
    SELECT
      bets.user_id,
      count(*)::INT AS bet_count,
      sum(amount) AS net_result,
      avg(abs(amount)) AS avg_abs_amount,
      stddev_pop(amount) AS amount_stddev,
      count(*) FILTER (WHERE amount > 0)::NUMERIC / count(*) AS win_rate,
      count(DISTINCT game)::INT AS unique_games,
      avg(extract(epoch FROM gap)) FILTER (WHERE gap IS NOT NULL) AS avg_gap_seconds,
      stddev_pop(extract(epoch FROM gap)) FILTER (WHERE gap IS NOT NULL) AS gap_stddev_seconds
    FROM bets
    GROUP BY bets.user_id
    HAVING count(*) >= p_min_bets
  )
  SELECT
    per_user.user_id,
    per_user.bet_count,
    per_user.net_result,
    per_user.avg_abs_amount,
    CASE WHEN per_user.avg_abs_amount > 0
      THEN per_user.amount_stddev / per_user.avg_abs_amount ELSE 0 END AS amount_cv,
    per_user.win_rate,
    CASE WHEN per_user.avg_gap_seconds > 0
      THEN per_user.gap_stddev_seconds / per_user.avg_gap_seconds ELSE 0 END AS inter_bet_seconds_cv,
    per_user.unique_games
  FROM per_user;
$$;

REVOKE ALL ON FUNCTION public.compute_fraud_ml_features(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_fraud_ml_features(INT, INT) TO service_role;
