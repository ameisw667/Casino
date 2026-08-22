-- Corrective migration for a regression introduced by 036_wallet_events_outbox.sql.
--
-- 036 rewrote settle_game_bet/settle_game_round/advance_blackjack_round using bodies based on
-- the ORIGINAL 007_server_authority.sql versions, unaware that 034_progressive_jackpot_trigger.sql
-- had since replaced settle_game_round and advance_blackjack_round in place (same parameter
-- signature) with jackpot-pool integration (contribution + payout via jackpot_pool_settle(),
-- and stripping the "jackpotRoll" field from the client-visible response / persisted
-- game_rounds.state — a HIGH security finding fixed in 034, reintroduced by 036).
--
-- settle_game_bet was NOT affected the same way: 034 gave it two new optional parameters
-- (p_server_seed_hash, p_nonce), which Postgres treats as a distinct overload rather than a
-- replacement. The app (WalletService.settleBet()) always passes those two keys, so it always
-- resolved to the 10-arg jackpot-aware version — 036's edit landed on the unreachable 8-arg
-- overload instead, which is inert (dead code), not a regression. It is reverted here to its
-- original 007 body purely for hygiene, so two divergently-behaving overloads of the same name
-- don't sit in the schema.
--
-- This migration restores the exact jackpot logic from 034 in settle_game_round and
-- advance_blackjack_round, restores the 10-arg settle_game_bet to its 034 form, and layers the
-- wallet_events outbox emission (dropping the inline xp/level/rank write) on top of all three —
-- combining both correctly instead of one silently discarding the other.

-- 8-arg settle_game_bet: revert to its pristine 007 form (dead overload, app never calls it;
-- reverted only so it no longer carries 036's incorrect, inert wallet_events edit).
CREATE OR REPLACE FUNCTION settle_game_bet(
  p_user_id TEXT,
  p_request_id UUID,
  p_result_id UUID,
  p_game TEXT,
  p_amount NUMERIC,
  p_payout NUMERIC,
  p_xp_gain BIGINT,
  p_result JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user users%ROWTYPE;
  v_existing wallet_transactions%ROWTYPE;
  v_balance NUMERIC(20, 2);
  v_xp BIGINT;
  v_level INTEGER;
  v_rank TEXT;
  v_transaction_id UUID;
  v_response JSONB;
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
  FROM wallet_transactions
  WHERE user_id = p_user_id AND request_id = p_request_id;

  IF FOUND THEN RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true); END IF;

  INSERT INTO users (id, username)
  VALUES (p_user_id, left(p_user_id, 64))
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  v_balance := round((v_user.balance - p_amount + p_payout)::numeric, 2);
  v_xp := v_user.xp + p_xp_gain;
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / casino_xp_level_divisor()))::integer + 1);
  v_rank := casino_rank_for_level(v_level);

  UPDATE users SET balance = v_balance, xp = v_xp, level = v_level,
    rank = v_rank, updated_at = now() WHERE id = p_user_id;

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES
    (p_user_id, lower(p_game), 'bet_settled', p_payout - p_amount, v_balance,
     p_request_id, p_result_id, '{}'::jsonb)
  RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_xp, 'level', v_level, 'rank', v_rank,
    'transactionId', v_transaction_id, 'result', p_result, 'replayed', false
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;

-- 10-arg settle_game_bet (the actually-called overload, per WalletService.settleBet() always
-- sending p_server_seed_hash/p_nonce): 034's jackpot-aware body, outbox-XP applied on top.
CREATE OR REPLACE FUNCTION public.settle_game_bet(
  p_user_id    TEXT,
  p_request_id UUID,
  p_result_id  UUID,
  p_game       TEXT,
  p_amount     NUMERIC,
  p_payout     NUMERIC,
  p_xp_gain    BIGINT,
  p_result     JSONB,
  p_server_seed_hash TEXT DEFAULT NULL,
  p_nonce      INTEGER DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user           users%ROWTYPE;
  v_existing       wallet_transactions%ROWTYPE;
  v_balance        NUMERIC(20, 2);
  v_transaction_id UUID;
  v_response       JSONB;
  v_jackpot_win    NUMERIC(14, 2);
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

  UPDATE public.users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;

  v_jackpot_win := jackpot_pool_settle(p_user_id, p_amount, (p_result ->> 'jackpotRoll')::numeric);
  IF v_jackpot_win > 0 THEN
    v_balance := round((v_balance + v_jackpot_win)::numeric, 2);
    UPDATE public.users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
    INSERT INTO public.wallet_transactions
      (user_id, game, type, amount, balance_after, metadata)
    VALUES
      (p_user_id, 'jackpot', 'jackpot_win', v_jackpot_win, v_balance, '{}'::jsonb);
  END IF;

  INSERT INTO public.wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata, server_seed_hash, nonce)
  VALUES
    (p_user_id, lower(p_game), 'bet_settled', p_payout - p_amount, v_balance,
     p_request_id, p_result_id, '{}'::jsonb, p_server_seed_hash, p_nonce)
  RETURNING id INTO v_transaction_id;

  IF p_xp_gain > 0 THEN
    INSERT INTO public.wallet_events (user_id, request_id, event_type, xp_gain)
      VALUES (p_user_id, p_request_id, 'xp_gain', p_xp_gain)
      ON CONFLICT (user_id, request_id, event_type) DO NOTHING;
  END IF;

  v_response := jsonb_build_object(
    'balance',       v_balance,
    'xp',            v_user.xp,
    'level',         v_user.level,
    'rank',          v_user.rank,
    'transactionId', v_transaction_id,
    'result',        (p_result - 'jackpotRoll'),
    'replayed',      false,
    'betAmount',     p_amount,
    'payout',        p_payout,
    'jackpotWin',    v_jackpot_win
  );
  UPDATE public.wallet_transactions
  SET metadata = jsonb_build_object('response', v_response)
  WHERE id = v_transaction_id;

  RETURN v_response;
END;
$$;

CREATE OR REPLACE FUNCTION settle_game_round(
  p_user_id TEXT,
  p_round_id UUID,
  p_request_id UUID,
  p_result_id UUID,
  p_payout NUMERIC,
  p_xp_gain BIGINT,
  p_result JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user users%ROWTYPE;
  v_round game_rounds%ROWTYPE;
  v_existing wallet_transactions%ROWTYPE;
  v_balance NUMERIC(20, 2);
  v_transaction_id UUID;
  v_response JSONB;
  v_jackpot_win NUMERIC(14, 2);
BEGIN
  IF p_request_id IS NULL OR p_result_id IS NULL OR p_payout < 0
     OR p_xp_gain < 0 OR p_xp_gain > 10000 THEN RAISE EXCEPTION 'Invalid settlement values'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_existing FROM wallet_transactions
    WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true); END IF;

  SELECT * INTO v_round FROM game_rounds
    WHERE id = p_round_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_round.status <> 'ACTIVE' THEN RAISE EXCEPTION 'Round is not active'; END IF;
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;

  v_balance := round((v_user.balance + p_payout)::numeric, 2);
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET status = 'SETTLED', state = state || jsonb_build_object('result', (p_result - 'jackpotRoll')),
    version = version + 1, updated_at = now() WHERE id = p_round_id;

  v_jackpot_win := jackpot_pool_settle(p_user_id, v_round.bet_amount, (p_result ->> 'jackpotRoll')::numeric);
  IF v_jackpot_win > 0 THEN
    v_balance := round((v_balance + v_jackpot_win)::numeric, 2);
    UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
    INSERT INTO wallet_transactions
      (user_id, game, type, amount, balance_after, metadata)
    VALUES
      (p_user_id, 'jackpot', 'jackpot_win', v_jackpot_win, v_balance, '{}'::jsonb);
  END IF;

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
    VALUES (p_user_id, lower(v_round.game), 'round_settled', p_payout, v_balance,
      p_request_id, p_result_id, '{}'::jsonb)
    RETURNING id INTO v_transaction_id;

  IF p_xp_gain > 0 THEN
    INSERT INTO wallet_events (user_id, request_id, event_type, xp_gain)
      VALUES (p_user_id, p_request_id, 'xp_gain', p_xp_gain)
      ON CONFLICT (user_id, request_id, event_type) DO NOTHING;
  END IF;

  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
    'transactionId', v_transaction_id, 'result', (p_result - 'jackpotRoll'), 'replayed', false,
    'jackpotWin', v_jackpot_win
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;

CREATE OR REPLACE FUNCTION advance_blackjack_round(
  p_user_id TEXT, p_round_id UUID, p_request_id UUID, p_result_id UUID,
  p_expected_version INTEGER, p_new_state JSONB, p_additional_bet NUMERIC,
  p_settled BOOLEAN, p_payout NUMERIC, p_xp_gain BIGINT, p_result JSONB
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_user users%ROWTYPE; v_round game_rounds%ROWTYPE; v_existing wallet_transactions%ROWTYPE;
  v_balance NUMERIC(20, 2);
  v_transaction_id UUID; v_response JSONB; v_jackpot_win NUMERIC(14, 2) := 0;
BEGIN
  IF p_request_id IS NULL OR p_result_id IS NULL OR p_expected_version < 1
     OR p_additional_bet < 0 OR p_payout < 0 OR p_xp_gain < 0 OR p_xp_gain > 10000 THEN
    RAISE EXCEPTION 'Invalid blackjack action';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));
  SELECT * INTO v_existing FROM wallet_transactions
    WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true); END IF;
  SELECT * INTO v_round FROM game_rounds
    WHERE id = p_round_id AND user_id = p_user_id AND game = 'BLACKJACK' FOR UPDATE;
  IF NOT FOUND OR v_round.status <> 'ACTIVE' OR v_round.version <> p_expected_version THEN
    RAISE EXCEPTION 'Stale or inactive blackjack round';
  END IF;
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_additional_bet THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  v_balance := round((v_user.balance - p_additional_bet + CASE WHEN p_settled THEN p_payout ELSE 0 END)::numeric, 2);
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET bet_amount = bet_amount + p_additional_bet, state = p_new_state,
    status = CASE WHEN p_settled THEN 'SETTLED' ELSE 'ACTIVE' END,
    version = version + 1, updated_at = now() WHERE id = p_round_id;

  IF p_settled THEN
    v_jackpot_win := jackpot_pool_settle(
      p_user_id, v_round.bet_amount + p_additional_bet, (p_result ->> 'jackpotRoll')::numeric
    );
    IF v_jackpot_win > 0 THEN
      v_balance := round((v_balance + v_jackpot_win)::numeric, 2);
      UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
      INSERT INTO wallet_transactions
        (user_id, game, type, amount, balance_after, metadata)
      VALUES
        (p_user_id, 'jackpot', 'jackpot_win', v_jackpot_win, v_balance, '{}'::jsonb);
    END IF;
  END IF;

  IF p_settled AND p_xp_gain > 0 THEN
    INSERT INTO wallet_events (user_id, request_id, event_type, xp_gain)
      VALUES (p_user_id, p_request_id, 'xp_gain', p_xp_gain)
      ON CONFLICT (user_id, request_id, event_type) DO NOTHING;
  END IF;

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES (p_user_id, 'blackjack', CASE WHEN p_settled THEN 'round_settled' ELSE 'round_action' END,
    CASE WHEN p_settled THEN p_payout - p_additional_bet ELSE -p_additional_bet END,
    v_balance, p_request_id, p_result_id, '{}'::jsonb) RETURNING id INTO v_transaction_id;
  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
    'transactionId', v_transaction_id, 'state', p_new_state,
    'version', p_expected_version + 1, 'settled', p_settled,
    'result', (p_result - 'jackpotRoll'), 'replayed', false, 'jackpotWin', v_jackpot_win
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;
