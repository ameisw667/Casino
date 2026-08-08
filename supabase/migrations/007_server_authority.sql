-- Server-authoritative, idempotent wallet settlement and stateful game rounds.
-- Apply with a privileged migration role. Browser roles never receive execute access.

ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS request_id UUID;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS result_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallet_transactions_user_request_key'
  ) THEN
    ALTER TABLE wallet_transactions
      ADD CONSTRAINT wallet_transactions_user_request_key UNIQUE (user_id, request_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  game TEXT NOT NULL CHECK (game IN ('CRASH', 'BLACKJACK')),
  bet_amount NUMERIC(20, 2) NOT NULL CHECK (bet_amount > 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SETTLED')),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, request_id)
);

ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_game_rounds_active
  ON game_rounds(user_id, game, status, created_at DESC);

CREATE OR REPLACE FUNCTION casino_rank_for_level(p_level INTEGER)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT name FROM ranks WHERE is_active AND min_level <= p_level ORDER BY min_level DESC LIMIT 1),
    'Bronze'
  );
$$;

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
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
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

CREATE OR REPLACE FUNCTION start_game_round(
  p_user_id TEXT,
  p_request_id UUID,
  p_game TEXT,
  p_amount NUMERIC,
  p_state JSONB
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
BEGIN
  IF p_game NOT IN ('CRASH', 'BLACKJACK') OR p_amount <= 0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid round values';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_round FROM game_rounds
    WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    SELECT * INTO v_existing FROM wallet_transactions WHERE user_id = p_user_id AND request_id = p_request_id;
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  INSERT INTO users (id, username) VALUES (p_user_id, left(p_user_id, 64))
    ON CONFLICT (id) DO NOTHING;
  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF v_user.balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  v_balance := round((v_user.balance - p_amount)::numeric, 2);
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  INSERT INTO game_rounds(user_id, request_id, game, bet_amount, state)
    VALUES (p_user_id, p_request_id, p_game, p_amount, p_state)
    RETURNING * INTO v_round;
  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, metadata)
    VALUES (p_user_id, lower(p_game), 'round_started', -p_amount, v_balance,
      p_request_id, '{}'::jsonb)
    RETURNING id INTO v_transaction_id;

  v_response := jsonb_build_object(
    'roundId', v_round.id, 'state', v_round.state, 'version', v_round.version,
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level,
    'rank', v_user.rank, 'transactionId', v_transaction_id, 'replayed', false
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
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
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank := casino_rank_for_level(v_level);
  UPDATE users SET balance = v_balance, xp = v_xp, level = v_level,
    rank = v_rank, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET status = 'SETTLED', state = state || jsonb_build_object('result', p_result),
    version = version + 1, updated_at = now() WHERE id = p_round_id;
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

REVOKE ALL ON TABLE game_rounds FROM anon, authenticated;
REVOKE ALL ON FUNCTION casino_rank_for_level(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION settle_game_round(TEXT, UUID, UUID, UUID, NUMERIC, BIGINT, JSONB) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION settle_game_round(TEXT, UUID, UUID, UUID, NUMERIC, BIGINT, JSONB) TO service_role;

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
  v_level := LEAST(100, floor(sqrt(v_xp::numeric / 100))::integer + 1);
  v_rank := casino_rank_for_level(v_level);
  UPDATE users SET balance = v_balance, xp = v_xp, level = v_level,
    rank = v_rank, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET bet_amount = bet_amount + p_additional_bet, state = p_new_state,
    status = CASE WHEN p_settled THEN 'SETTLED' ELSE 'ACTIVE' END,
    version = version + 1, updated_at = now() WHERE id = p_round_id;
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

REVOKE ALL ON FUNCTION advance_blackjack_round(TEXT, UUID, UUID, UUID, INTEGER, JSONB, NUMERIC, BOOLEAN, NUMERIC, BIGINT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION advance_blackjack_round(TEXT, UUID, UUID, UUID, INTEGER, JSONB, NUMERIC, BOOLEAN, NUMERIC, BIGINT, JSONB)
  TO service_role;