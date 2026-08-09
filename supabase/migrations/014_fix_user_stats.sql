-- ============================================================
-- Migration 014: Fix User Lifetime Stats
-- ============================================================
-- Root causes fixed:
-- 1. get_user_stats: win detection was `amount < balance_after` (always true
--    because balance_after >> amount delta) -> 100% win rate. Fixed to `amount > 0`.
-- 2. get_user_stats: totalWagered used SUM(amount) which is the net P&L delta,
--    not the original stake. Fixed to use metadata.betAmount when available,
--    ABS(amount) for old loss records (amount = -bet when payout = 0).
-- 3. get_user_stats: totalProfit used SUM(0 - amount) (sign-flipped). Fixed to
--    SUM(amount) which IS the correct net player profit.
-- 4. settle_game_bet: metadata only stored game result, not betAmount/payout.
--    Now stores both so future records have accurate per-bet data.
-- 5. game_rounds: added payout column so CRASH/BLACKJACK settlements record
--    their payout for direct aggregation in get_user_stats.
-- 6. settle_game_round / advance_blackjack_round: updated to write payout into
--    game_rounds.payout at settlement time.
-- ============================================================

-- 1. Add payout column to game_rounds
ALTER TABLE public.game_rounds ADD COLUMN IF NOT EXISTS payout NUMERIC(20, 2) NOT NULL DEFAULT 0;

-- 2. Fix settle_game_bet: store betAmount + payout in metadata
CREATE OR REPLACE FUNCTION public.settle_game_bet(
  p_user_id    TEXT,
  p_request_id UUID,
  p_result_id  UUID,
  p_game       TEXT,
  p_amount     NUMERIC,
  p_payout     NUMERIC,
  p_xp_gain    BIGINT,
  p_result     JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user           users%ROWTYPE;
  v_existing       wallet_transactions%ROWTYPE;
  v_balance        NUMERIC(20, 2);
  v_xp             BIGINT;
  v_level          INTEGER;
  v_rank           TEXT;
  v_transaction_id UUID;
  v_response       JSONB;
BEGIN
  IF p_user_id IS NULL OR p_user_id = '' OR p_request_id IS NULL OR p_result_id IS NULL THEN
    RAISE EXCEPTION 'Invalid settlement identity';
  END IF;
  IF p_game NOT IN ('DICE', 'ROULETTE', 'SLOTS') OR p_amount <= 0 OR p_payout < 0
     OR p_xp_gain < 0 OR p_xp_gain > 10000 THEN
    RAISE EXCEPTION 'Invalid settlement values';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_existing
  FROM public.wallet_transactions
  WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  INSERT INTO public.users (id, username)
  VALUES (p_user_id, left(p_user_id, 64))
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  v_balance := round((v_user.balance - p_amount + p_payout)::numeric, 2);
  v_xp      := v_user.xp + p_xp_gain;
  v_level   := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank    := public.casino_rank_for_level(v_level);

  UPDATE public.users
  SET balance = v_balance, xp = v_xp, level = v_level, rank = v_rank, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES
    (p_user_id, lower(p_game), 'bet_settled', p_payout - p_amount, v_balance,
     p_request_id, p_result_id, '{}'::jsonb)
  RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'balance',       v_balance,
    'xp',            v_xp,
    'level',         v_level,
    'rank',          v_rank,
    'transactionId', v_transaction_id,
    'result',        p_result,
    'replayed',      false,
    'betAmount',     p_amount,
    'payout',        p_payout
  );
  UPDATE public.wallet_transactions
  SET metadata = jsonb_build_object('response', v_response)
  WHERE id = v_transaction_id;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB)
  TO service_role;

-- 3. Fix settle_game_round: write payout into game_rounds at settlement
CREATE OR REPLACE FUNCTION public.settle_game_round(
  p_user_id    TEXT,
  p_round_id   UUID,
  p_request_id UUID,
  p_result_id  UUID,
  p_payout     NUMERIC,
  p_xp_gain    BIGINT,
  p_result     JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user           users%ROWTYPE;
  v_round          game_rounds%ROWTYPE;
  v_existing       wallet_transactions%ROWTYPE;
  v_balance        NUMERIC(20, 2);
  v_xp             BIGINT;
  v_level          INTEGER;
  v_rank           TEXT;
  v_transaction_id UUID;
  v_response       JSONB;
BEGIN
  IF p_request_id IS NULL OR p_result_id IS NULL OR p_payout < 0
     OR p_xp_gain < 0 OR p_xp_gain > 10000 THEN
    RAISE EXCEPTION 'Invalid settlement values';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_existing FROM public.wallet_transactions
  WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  SELECT * INTO v_round FROM public.game_rounds
  WHERE id = p_round_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_round.status <> 'ACTIVE' THEN RAISE EXCEPTION 'Round is not active'; END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;

  v_balance := round((v_user.balance + p_payout)::numeric, 2);
  v_xp      := v_user.xp + p_xp_gain;
  v_level   := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank    := public.casino_rank_for_level(v_level);

  UPDATE public.users
  SET balance = v_balance, xp = v_xp, level = v_level, rank = v_rank, updated_at = now()
  WHERE id = p_user_id;

  UPDATE public.game_rounds
  SET status     = 'SETTLED',
      payout     = p_payout,
      state      = state || jsonb_build_object('result', p_result),
      version    = version + 1,
      updated_at = now()
  WHERE id = p_round_id;

  INSERT INTO public.wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES
    (p_user_id, lower(v_round.game), 'round_settled', p_payout, v_balance,
     p_request_id, p_result_id, '{}'::jsonb)
  RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'balance',       v_balance,
    'xp',            v_xp,
    'level',         v_level,
    'rank',          v_rank,
    'transactionId', v_transaction_id,
    'result',        p_result,
    'replayed',      false
  );
  UPDATE public.wallet_transactions
  SET metadata = jsonb_build_object('response', v_response)
  WHERE id = v_transaction_id;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_game_round(TEXT, UUID, UUID, UUID, NUMERIC, BIGINT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_game_round(TEXT, UUID, UUID, UUID, NUMERIC, BIGINT, JSONB)
  TO service_role;

-- 4. Fix advance_blackjack_round: persist payout into game_rounds on settle
CREATE OR REPLACE FUNCTION public.advance_blackjack_round(
  p_user_id          TEXT,
  p_round_id         UUID,
  p_request_id       UUID,
  p_result_id        UUID,
  p_expected_version INTEGER,
  p_new_state        JSONB,
  p_additional_bet   NUMERIC,
  p_settled          BOOLEAN,
  p_payout           NUMERIC,
  p_xp_gain          BIGINT,
  p_result           JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user           users%ROWTYPE;
  v_round          game_rounds%ROWTYPE;
  v_existing       wallet_transactions%ROWTYPE;
  v_balance        NUMERIC(20, 2);
  v_xp             BIGINT;
  v_level          INTEGER;
  v_rank           TEXT;
  v_transaction_id UUID;
  v_response       JSONB;
BEGIN
  IF p_request_id IS NULL OR p_result_id IS NULL OR p_expected_version < 1
     OR p_additional_bet < 0 OR p_payout < 0 OR p_xp_gain < 0 OR p_xp_gain > 10000 THEN
    RAISE EXCEPTION 'Invalid blackjack action';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_existing FROM public.wallet_transactions
  WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  SELECT * INTO v_round FROM public.game_rounds
  WHERE id = p_round_id AND user_id = p_user_id AND game = 'BLACKJACK' FOR UPDATE;
  IF NOT FOUND OR v_round.status <> 'ACTIVE' OR v_round.version <> p_expected_version THEN
    RAISE EXCEPTION 'Stale or inactive blackjack round';
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_additional_bet THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  v_balance := round((v_user.balance
    - p_additional_bet
    + CASE WHEN p_settled THEN p_payout ELSE 0 END)::numeric, 2);
  v_xp    := v_user.xp + CASE WHEN p_settled THEN p_xp_gain ELSE 0 END;
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank  := public.casino_rank_for_level(v_level);

  UPDATE public.users
  SET balance = v_balance, xp = v_xp, level = v_level, rank = v_rank, updated_at = now()
  WHERE id = p_user_id;

  UPDATE public.game_rounds
  SET bet_amount = bet_amount + p_additional_bet,
      state      = p_new_state,
      status     = CASE WHEN p_settled THEN 'SETTLED' ELSE 'ACTIVE' END,
      payout     = CASE WHEN p_settled THEN p_payout ELSE payout END,
      version    = version + 1,
      updated_at = now()
  WHERE id = p_round_id;

  INSERT INTO public.wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES (
    p_user_id,
    'blackjack',
    CASE WHEN p_settled THEN 'round_settled' ELSE 'round_action' END,
    CASE WHEN p_settled THEN p_payout - p_additional_bet ELSE -p_additional_bet END,
    v_balance,
    p_request_id,
    p_result_id,
    '{}'::jsonb
  ) RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'balance',       v_balance,
    'xp',            v_xp,
    'level',         v_level,
    'rank',          v_rank,
    'transactionId', v_transaction_id,
    'state',         p_new_state,
    'version',       p_expected_version + 1,
    'settled',       p_settled,
    'result',        p_result,
    'replayed',      false
  );
  UPDATE public.wallet_transactions
  SET metadata = jsonb_build_object('response', v_response)
  WHERE id = v_transaction_id;

  RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.advance_blackjack_round(TEXT, UUID, UUID, UUID, INTEGER, JSONB, NUMERIC, BOOLEAN, NUMERIC, BIGINT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_blackjack_round(TEXT, UUID, UUID, UUID, INTEGER, JSONB, NUMERIC, BOOLEAN, NUMERIC, BIGINT, JSONB)
  TO service_role;

-- 5. Fix get_user_stats: correct win detection, wagered amounts, and profit
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
BEGIN
  SELECT
    COALESCE(SUM(bets),    0),
    COALESCE(SUM(wins),    0),
    COALESCE(SUM(wagered), 0),
    COALESCE(SUM(payout),  0),
    COALESCE(SUM(profit),  0)
  INTO v_total_bets, v_total_wins, v_total_wagered, v_total_payout, v_total_profit
  FROM (

    -- DICE / ROULETTE / SLOTS
    -- One bet_settled row per bet. amount = payout - bet (net delta).
    SELECT
      COUNT(*)                                            AS bets,
      -- Win = net positive outcome (payout exceeded stake)
      COUNT(*) FILTER (WHERE amount > 0)                 AS wins,
      -- Wagered: use metadata.betAmount (available after this migration);
      -- for old loss records fall back to ABS(amount) since amount = -bet when payout = 0.
      -- Old win records without metadata contribute 0 (bet unrecoverable historically).
      SUM(
        COALESCE(
          NULLIF((metadata -> 'response' ->> 'betAmount')::numeric, 0),
          CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END
        )
      )                                                   AS wagered,
      -- Payout: use metadata.payout when present; for old wins approximate as net amount.
      SUM(
        COALESCE(
          (metadata -> 'response' ->> 'payout')::numeric,
          CASE WHEN amount > 0 THEN amount ELSE 0 END
        )
      )                                                   AS payout,
      -- Net profit: SUM of net deltas; mathematically exact regardless of record age.
      SUM(amount)                                         AS profit
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND type = 'bet_settled'

    UNION ALL

    -- CRASH / BLACKJACK from game_rounds
    -- game_rounds.bet_amount = total staked per round (exact, always present).
    -- game_rounds.payout = payout at settlement (written by settle_game_round /
    --   advance_blackjack_round starting from this migration; 0 for historical losses).
    SELECT
      COUNT(*)                                            AS bets,
      COUNT(*) FILTER (WHERE payout > 0)                 AS wins,
      SUM(bet_amount)                                     AS wagered,
      SUM(payout)                                         AS payout,
      SUM(payout - bet_amount)                            AS profit
    FROM public.game_rounds
    WHERE user_id = p_user_id AND status = 'SETTLED'

  ) combined;

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
    'achievements', v_achievements
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_stats(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats(TEXT) TO service_role;
