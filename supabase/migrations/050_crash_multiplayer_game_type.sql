-- Migration 050: CRASH_MULTIPLAYER game type (worldmap/05_v2_multiplayer_crash.md, L4)
-- Erlaubt 'CRASH_MULTIPLAYER' als eigenstaendigen game-Typ in game_rounds
-- und redefiniert start_game_round (3. Redefinition: 007 -> 037 -> hier),
-- damit der Race-Guard auf Basis des exakten Spieltyps (p_game) fuer 'CRASH'
-- und 'CRASH_MULTIPLAYER' greift.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.game_rounds'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%game%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.game_rounds DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.game_rounds
  ADD CONSTRAINT game_rounds_game_check
  CHECK (game IN ('CRASH', 'BLACKJACK', 'CRASH_MULTIPLAYER'));

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
  IF p_game NOT IN ('CRASH', 'BLACKJACK', 'CRASH_MULTIPLAYER') OR p_amount <= 0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid round values';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  SELECT * INTO v_round FROM game_rounds
    WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN
    SELECT * INTO v_existing FROM wallet_transactions WHERE user_id = p_user_id AND request_id = p_request_id;
    RETURN (v_existing.metadata -> 'response') || jsonb_build_object('replayed', true);
  END IF;

  -- Multiplayer-Crash & Solo-Crash Race-Guard (worldmap/05_v2_multiplayer_crash.md §5):
  -- Generalisiert von p_game = 'CRASH' auf 'CRASH' und 'CRASH_MULTIPLAYER',
  -- matched auf den angefragten Typ (game = p_game), sodass Solo- und Multiplayer-Runden
  -- unabhaengig voneinander parallel aktiv sein koennen, aber niemals zwei gleichzeitige
  -- aktive Runden desselben Typs.
  IF p_game IN ('CRASH', 'CRASH_MULTIPLAYER') AND EXISTS (
    SELECT 1 FROM game_rounds
    WHERE user_id = p_user_id AND game = p_game AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Active % round already exists', lower(p_game);
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

REVOKE ALL ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION start_game_round(TEXT, UUID, TEXT, NUMERIC, JSONB) TO service_role;
