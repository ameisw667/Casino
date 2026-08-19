-- L3 (worldmap/01_LiveProgressiveJackpot.md): Jackpot-Zufallsgewinn + Reset + Auszahlung.
-- Ersetzt jackpot_pool_contribute() (033) durch jackpot_pool_settle(), die im
-- selben atomaren UPDATE contributed UND -- falls der vom Client mitgelieferte,
-- seed-chain-basierte Roll unter der aktuellen win_probability liegt -- den
-- Pool auszahlt und auf seed_amount zurücksetzt. Der Roll selbst wird
-- serverseitig nie vertraut generiert; er kommt aus TypeScript
-- (ProvablyFairEngine.getJackpotRoll(), HMAC-basiert, gleiche Seed-Kette wie
-- alle anderen Spiele) eingebettet in das bestehende p_result-JSONB-Feld
-- (Feld "jackpotRoll") -- kein neuer RPC-Parameter, keine neue Overload-Gefahr
-- (siehe Fund in 033 zu settle_game_bet). Der Roll-Wert wird sowohl aus dem
-- an den Client zurueckgegebenen Response-JSON als auch aus dem in
-- game_rounds.state persistierten Rundenergebnis entfernt (Security-Review
-- 2026-08-18 fand die zweite Stelle initial ungestrippt -- HIGH-Befund,
-- hier korrigiert, bevor diese Migration den lokalen Stack verlassen hat).

DROP FUNCTION IF EXISTS jackpot_pool_contribute(NUMERIC);

CREATE OR REPLACE FUNCTION jackpot_pool_settle(
  p_user_id TEXT,
  p_bet_amount NUMERIC,
  p_jackpot_roll NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pool public.jackpot_pool%ROWTYPE;
  v_win_amount NUMERIC(14, 2) := 0;
BEGIN
  IF p_bet_amount IS NULL OR p_bet_amount <= 0 THEN
    RETURN 0;
  END IF;

  UPDATE public.jackpot_pool
  SET current_amount = round((current_amount + p_bet_amount * contribution_rate)::numeric, 2),
      updated_at = now()
  WHERE id = 1
  RETURNING * INTO v_pool;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF p_jackpot_roll IS NOT NULL AND p_jackpot_roll >= 0 AND p_jackpot_roll < v_pool.win_probability THEN
    v_win_amount := v_pool.current_amount;
    UPDATE public.jackpot_pool
    SET current_amount = seed_amount,
        last_won_at = now(),
        last_winner_id = p_user_id,
        updated_at = now()
    WHERE id = 1;
  END IF;

  RETURN v_win_amount;
END;
$$;

REVOKE ALL ON FUNCTION jackpot_pool_settle(TEXT, NUMERIC, NUMERIC) FROM PUBLIC, anon, authenticated;

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
  v_xp             BIGINT;
  v_level          INTEGER;
  v_rank           TEXT;
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
  v_xp      := v_user.xp + p_xp_gain;
  v_level   := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank    := public.casino_rank_for_level(v_level);

  UPDATE public.users
  SET balance = v_balance, xp = v_xp, level = v_level, rank = v_rank, updated_at = now()
  WHERE id = p_user_id;

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

  v_response := jsonb_build_object(
    'balance',       v_balance,
    'xp',            v_xp,
    'level',         v_level,
    'rank',          v_rank,
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
  v_xp BIGINT;
  v_level INTEGER;
  v_rank TEXT;
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
  v_xp := v_user.xp + p_xp_gain;
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / casino_xp_level_divisor()))::integer + 1);
  v_rank := casino_rank_for_level(v_level);
  UPDATE users SET balance = v_balance, xp = v_xp, level = v_level,
    rank = v_rank, updated_at = now() WHERE id = p_user_id;
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

  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_xp, 'level', v_level, 'rank', v_rank,
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
  v_balance NUMERIC(20, 2); v_xp BIGINT; v_level INTEGER; v_rank TEXT;
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
  v_xp := v_user.xp + CASE WHEN p_settled THEN p_xp_gain ELSE 0 END;
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / casino_xp_level_divisor()))::integer + 1);
  v_rank := casino_rank_for_level(v_level);
  UPDATE users SET balance = v_balance, xp = v_xp, level = v_level,
    rank = v_rank, updated_at = now() WHERE id = p_user_id;
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

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES (p_user_id, 'blackjack', CASE WHEN p_settled THEN 'round_settled' ELSE 'round_action' END,
    CASE WHEN p_settled THEN p_payout - p_additional_bet ELSE -p_additional_bet END,
    v_balance, p_request_id, p_result_id, '{}'::jsonb) RETURNING id INTO v_transaction_id;
  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_xp, 'level', v_level, 'rank', v_rank,
    'transactionId', v_transaction_id, 'state', p_new_state,
    'version', p_expected_version + 1, 'settled', p_settled,
    'result', (p_result - 'jackpotRoll'), 'replayed', false, 'jackpotWin', v_jackpot_win
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;
