-- L2 (worldmap/01_LiveProgressiveJackpot.md): atomare Jackpot-Contribution.
-- Erweitert die drei bestehenden Settlement-RPCs (aktuellster Stand aus
-- 010_dynamic_xp_divisor.sql) um einen Contribution-Aufruf, kein neues
-- Lock-Muster -- die Contribution laeuft unter dem bereits gehaltenen
-- Advisory-Lock der jeweiligen Funktion (pg_advisory_xact_lock).
--
-- jackpot_pool_contribute() ist bewusst nicht an service_role granted:
-- einziger Aufrufpfad sind die drei SECURITY DEFINER-Settlement-RPCs
-- selbst (Funktions-zu-Funktions-Aufruf prueft die Rechte des Definers,
-- nicht die des urspruenglichen Callers) -- die API-Schicht kann diese
-- Funktion nie direkt erreichen.

CREATE OR REPLACE FUNCTION jackpot_pool_contribute(p_bet_amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_bet_amount IS NULL OR p_bet_amount <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.jackpot_pool
  SET current_amount = round((current_amount + p_bet_amount * contribution_rate)::numeric, 2),
      updated_at = now()
  WHERE id = 1;
END;
$$;

REVOKE ALL ON FUNCTION jackpot_pool_contribute(NUMERIC) FROM PUBLIC, anon, authenticated;

-- Wichtiger Befund bei der Umsetzung (2026-08-18): settle_game_bet existiert
-- als ZWEI Overloads. Die 8-Parameter-Version unten ist toter Code -- der
-- einzige Call-Site (WalletService.settleBet, wallet.ts:113) sendet immer
-- auch p_server_seed_hash/p_nonce und trifft damit ausschliesslich die
-- 10-Parameter-Version aus 019_seed_chain.sql weiter unten. Die 8-Parameter-
-- Version bleibt hier unveraendert (kein Contribution-Aufruf) -- sie beim
-- Jackpot-Umbau nebenbei "reparieren" waere Scope-Creep. Separater Hinweis
-- an Jan als spawn_task, kein Teil dieser Initiative.
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

-- Tatsaechlich aktive 10-Parameter-Version (Basis: 019_seed_chain.sql, der
-- zuletzt aktive Body). Bewusst inkl. deren hartkodiertem /100-Divisor statt
-- casino_xp_level_divisor() -- dieser Unterschied zwischen den Overloads
-- existierte bereits vor dieser Migration und wird hier nicht mitkorrigiert.
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

  PERFORM jackpot_pool_contribute(p_amount);

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
  UPDATE game_rounds SET status = 'SETTLED', state = state || jsonb_build_object('result', p_result),
    version = version + 1, updated_at = now() WHERE id = p_round_id;

  PERFORM jackpot_pool_contribute(v_round.bet_amount);

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
    VALUES (p_user_id, lower(v_round.game), 'round_settled', p_payout, v_balance,
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
  v_transaction_id UUID; v_response JSONB;
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
    PERFORM jackpot_pool_contribute(v_round.bet_amount + p_additional_bet);
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
    'result', p_result, 'replayed', false
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;
