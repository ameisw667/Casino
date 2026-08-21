-- 4.1 Outbox-Pattern für Wallet-Nebenwirkungen (Option B: pg_net Push-Consumer).
-- Entkoppelt XP-Gain aus dem Settlement-kritischen Pfad. Balance-Logik in settle_game_bet/
-- settle_game_round/advance_blackjack_round bleibt unverändert; nur die XP/Level/Rank-Writes
-- wandern in einen asynchronen Consumer. Details: worldmap/05_OutboxWallet.md.

CREATE TABLE IF NOT EXISTS wallet_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'xp_gain' CHECK (event_type = 'xp_gain'),
  xp_gain BIGINT NOT NULL CHECK (xp_gain >= 0 AND xp_gain <= 10000),
  processed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, request_id, event_type)
);

ALTER TABLE wallet_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE wallet_events FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_wallet_events_unprocessed
  ON wallet_events (created_at) WHERE processed_at IS NULL;

-- Applies a single wallet_events row's XP gain to the user row. Idempotent: returns
-- alreadyProcessed=true as a no-op if the event was already applied. Never raises out of the
-- function on failure — a nested BEGIN/EXCEPTION records attempts/last_error and returns
-- success=false instead, so the caller's transaction still commits with the failure recorded
-- (a bare RAISE would roll back the attempts/last_error write along with everything else).
CREATE OR REPLACE FUNCTION apply_xp_gain(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event wallet_events%ROWTYPE;
  v_user users%ROWTYPE;
  v_xp BIGINT;
  v_level INTEGER;
  v_rank TEXT;
BEGIN
  IF p_event_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_event_id');
  END IF;

  SELECT * INTO v_event FROM wallet_events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'unknown_event');
  END IF;
  IF v_event.processed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'alreadyProcessed', true);
  END IF;

  BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(v_event.user_id, 0));
    SELECT * INTO v_user FROM users WHERE id = v_event.user_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'unknown_user';
    END IF;

    v_xp := v_user.xp + v_event.xp_gain;
    v_level := LEAST(100, floor(sqrt(v_xp::numeric / casino_xp_level_divisor()))::integer + 1);
    v_rank := casino_rank_for_level(v_level);

    UPDATE users SET xp = v_xp, level = v_level, rank = v_rank, updated_at = now()
      WHERE id = v_event.user_id;
    UPDATE wallet_events SET processed_at = now(), attempts = attempts + 1
      WHERE id = p_event_id;
  EXCEPTION WHEN OTHERS THEN
    UPDATE wallet_events SET attempts = attempts + 1, last_error = left(SQLERRM, 500)
      WHERE id = p_event_id;
    RETURN jsonb_build_object('success', false, 'error', left(SQLERRM, 500));
  END;

  RETURN jsonb_build_object(
    'success', true, 'alreadyProcessed', false,
    'xp', v_xp, 'level', v_level, 'rank', v_rank
  );
END;
$$;

REVOKE ALL ON FUNCTION apply_xp_gain(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION apply_xp_gain(UUID) TO service_role;

-- Push side: fires once per inserted event, queued asynchronously by pg_net (does not block
-- or wait on the HTTP call, so the settlement transaction's commit latency is unaffected).
-- Every failure mode (missing secret, net.http_post error) is swallowed here — a trigger
-- exception would roll back the settlement transaction that inserted this row, which must
-- never happen for a non-monetary side effect. The pg_cron backstop below covers delivery
-- failures instead.
CREATE OR REPLACE FUNCTION public.notify_wallet_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
  v_secret TEXT;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'wallet_event_secret'
    LIMIT 1;

    IF v_secret IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://casino-xi-six.vercel.app/api/internal/wallet-events',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-wallet-event-secret', v_secret
        ),
        body := jsonb_build_object('eventId', NEW.id)
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_wallet_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS wallet_events_notify ON wallet_events;
CREATE TRIGGER wallet_events_notify
  AFTER INSERT ON wallet_events
  FOR EACH ROW EXECUTE FUNCTION public.notify_wallet_event();

-- Backstop: catches events the push path never delivered (secret missing, endpoint down,
-- pg_net failure). Calls apply_xp_gain directly — no HTTP round trip — so it does not share
-- a failure mode with the push path it is backing up. Reuses the existing cron_alert_secret
-- channel (027) for dead-letter alerting once an event has exhausted its retry budget.
CREATE OR REPLACE FUNCTION public.retry_stale_wallet_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
  v_row RECORD;
  v_alert_secret TEXT;
  v_stuck_count INTEGER;
BEGIN
  FOR v_row IN
    SELECT id FROM wallet_events
    WHERE processed_at IS NULL
      AND created_at < now() - interval '2 minutes'
      AND attempts < 5
    ORDER BY created_at
    LIMIT 200
  LOOP
    BEGIN
      PERFORM public.apply_xp_gain(v_row.id);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  SELECT count(*) INTO v_stuck_count FROM wallet_events
    WHERE processed_at IS NULL AND attempts >= 5;

  IF v_stuck_count > 0 THEN
    BEGIN
      SELECT decrypted_secret INTO v_alert_secret
      FROM vault.decrypted_secrets WHERE name = 'cron_alert_secret' LIMIT 1;
      IF v_alert_secret IS NOT NULL THEN
        PERFORM net.http_post(
          url := 'https://casino-xi-six.vercel.app/api/internal/cron-alert',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-alert-secret', v_alert_secret
          ),
          body := jsonb_build_object(
            'job', 'wallet_events_retry',
            'error', v_stuck_count || ' wallet_events stuck at max attempts'
          )
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.retry_stale_wallet_events() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.retry_stale_wallet_events() TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('wallet-events-retry');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'wallet-events-retry',
  '*/2 * * * *',
  $$SELECT public.retry_stale_wallet_events();$$
);

-- Settlement RPCs: drop the inline XP/level/rank write, emit a wallet_event instead. Balance
-- logic is byte-for-byte unchanged. Response now returns the pre-event xp/level/rank (the
-- client polls /api/user/balance afterward for the applied value — see
-- worldmap/05_OutboxWallet.md §0 for why this is an accepted, deliberate change).

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

  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;

  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES
    (p_user_id, lower(p_game), 'bet_settled', p_payout - p_amount, v_balance,
     p_request_id, p_result_id, '{}'::jsonb)
  RETURNING id INTO v_transaction_id;

  IF p_xp_gain > 0 THEN
    INSERT INTO wallet_events (user_id, request_id, event_type, xp_gain)
      VALUES (p_user_id, p_request_id, 'xp_gain', p_xp_gain)
      ON CONFLICT (user_id, request_id, event_type) DO NOTHING;
  END IF;

  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
    'transactionId', v_transaction_id, 'result', p_result, 'replayed', false
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
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET status = 'SETTLED', state = state || jsonb_build_object('result', p_result),
    version = version + 1, updated_at = now() WHERE id = p_round_id;
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
  v_balance NUMERIC(20, 2);
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
  UPDATE users SET balance = v_balance, updated_at = now() WHERE id = p_user_id;
  UPDATE game_rounds SET bet_amount = bet_amount + p_additional_bet, state = p_new_state,
    status = CASE WHEN p_settled THEN 'SETTLED' ELSE 'ACTIVE' END,
    version = version + 1, updated_at = now() WHERE id = p_round_id;
  INSERT INTO wallet_transactions
    (user_id, game, type, amount, balance_after, request_id, result_id, metadata)
  VALUES (p_user_id, 'blackjack', CASE WHEN p_settled THEN 'round_settled' ELSE 'round_action' END,
    CASE WHEN p_settled THEN p_payout - p_additional_bet ELSE -p_additional_bet END,
    v_balance, p_request_id, p_result_id, '{}'::jsonb) RETURNING id INTO v_transaction_id;

  IF p_settled AND p_xp_gain > 0 THEN
    INSERT INTO wallet_events (user_id, request_id, event_type, xp_gain)
      VALUES (p_user_id, p_request_id, 'xp_gain', p_xp_gain)
      ON CONFLICT (user_id, request_id, event_type) DO NOTHING;
  END IF;

  v_response := jsonb_build_object(
    'balance', v_balance, 'xp', v_user.xp, 'level', v_user.level, 'rank', v_user.rank,
    'transactionId', v_transaction_id, 'state', p_new_state,
    'version', p_expected_version + 1, 'settled', p_settled,
    'result', p_result, 'replayed', false
  );
  UPDATE wallet_transactions SET metadata = jsonb_build_object('response', v_response)
    WHERE id = v_transaction_id;
  RETURN v_response;
END;
$$;
