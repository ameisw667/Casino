-- 4.3 Event-Bus: zweiter Outbox-Consumer (Big-Win-Notify), Option 1 aus dem Options-Gate.
-- Erweitert die wallet_events-Outbox aus Migration 036 additiv um einen zweiten, eigenständigen
-- Consumer-Typ. Die xp_gain-Objekte aus 036/045 (Tabelle, apply_xp_gain, notify_wallet_event,
-- retry_stale_wallet_events, settle_game_bet/settle_game_round/advance_blackjack_round) bleiben
-- byte-identisch unangetastet. Details: worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md.
-- Nummerierungshinweis: als 038 begonnen, kollidierte mit der bereits vorhandenen
-- 038_fix_crash_round_pgcrypto_schema.sql (R7-Kollisionsrisiko, 05_ZUKUNFTSPLANUNG.md
-- Risiko-Register) — auf die tatsächlich höchste freie Nummer (047) korrigiert.

ALTER TABLE wallet_events ADD COLUMN IF NOT EXISTS event_payload JSONB;

ALTER TABLE wallet_events DROP CONSTRAINT IF EXISTS wallet_events_event_type_check;
ALTER TABLE wallet_events ADD CONSTRAINT wallet_events_event_type_check
  CHECK (event_type IN ('xp_gain', 'big_win_notify'));

-- Emits a big_win_notify event. Called from the Node app layer (WalletService.emitBigWinNotifyEvent,
-- via notifyBigWinIfEligible) right after a settlement RPC returns — not from inside the
-- settlement RPCs themselves, so settle_game_bet/settle_game_round/advance_blackjack_round stay
-- untouched. Idempotent over the same (user_id, request_id) the settlement already used.
CREATE OR REPLACE FUNCTION public.emit_big_win_notify_event(
  p_user_id TEXT,
  p_request_id UUID,
  p_game TEXT,
  p_payout NUMERIC,
  p_multiplier NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  IF p_user_id IS NULL OR p_user_id = '' OR p_request_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_identity');
  END IF;

  INSERT INTO wallet_events (user_id, request_id, event_type, xp_gain, event_payload)
    VALUES (
      p_user_id, p_request_id, 'big_win_notify', 0,
      jsonb_build_object('game', p_game, 'payout', p_payout, 'multiplier', p_multiplier)
    )
    ON CONFLICT (user_id, request_id, event_type) DO NOTHING
    RETURNING id INTO v_event_id;

  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object('success', true, 'alreadyExists', true);
  END IF;

  RETURN jsonb_build_object('success', true, 'alreadyExists', false, 'eventId', v_event_id);
END;
$$;

REVOKE ALL ON FUNCTION public.emit_big_win_notify_event(TEXT, UUID, TEXT, NUMERIC, NUMERIC)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emit_big_win_notify_event(TEXT, UUID, TEXT, NUMERIC, NUMERIC)
  TO service_role;

-- Claims a big_win_notify event for delivery: increments attempts and hands back the payload,
-- but deliberately does NOT set processed_at. Unlike apply_xp_gain (4.1), this consumer's real
-- effect (a Trigger.dev dispatch) happens outside Postgres in the calling Node route — marking
-- processed_at here, before that dispatch is known to have succeeded, would let a Trigger.dev
-- failure silently drop the notification with no retry. The caller (POST
-- /api/internal/big-win-events) only marks the event done via ack_big_win_notify_event after the
-- dispatch itself succeeds.
CREATE OR REPLACE FUNCTION public.claim_big_win_notify_event(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_event wallet_events%ROWTYPE;
BEGIN
  IF p_event_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_event_id');
  END IF;

  SELECT * INTO v_event FROM wallet_events
    WHERE id = p_event_id AND event_type = 'big_win_notify' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'unknown_event');
  END IF;
  IF v_event.processed_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'alreadyProcessed', true);
  END IF;

  UPDATE wallet_events SET attempts = attempts + 1 WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'success', true, 'alreadyProcessed', false,
    'userId', v_event.user_id, 'payload', v_event.event_payload
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_big_win_notify_event(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_big_win_notify_event(UUID) TO service_role;

-- Marks a big_win_notify event as durably delivered. Called only after the Trigger.dev dispatch
-- in the Node route has succeeded (see claim_big_win_notify_event comment above).
CREATE OR REPLACE FUNCTION public.ack_big_win_notify_event(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE wallet_events SET processed_at = now()
    WHERE id = p_event_id AND event_type = 'big_win_notify' AND processed_at IS NULL;
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.ack_big_win_notify_event(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ack_big_win_notify_event(UUID) TO service_role;

-- Push side: fires once per inserted big_win_notify event, queued asynchronously by pg_net
-- (never blocks the caller's transaction). Deliberately a separate trigger/function from
-- notify_wallet_event() (4.1) so a bug or outage in this consumer can never affect xp_gain
-- delivery — the isolation guarantee 4.3 exists to prove.
CREATE OR REPLACE FUNCTION public.notify_big_win_event()
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
    WHERE name = 'big_win_event_secret'
    LIMIT 1;

    IF v_secret IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://casino-xi-six.vercel.app/api/internal/big-win-events',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-big-win-event-secret', v_secret
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

REVOKE ALL ON FUNCTION public.notify_big_win_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS wallet_events_notify_big_win ON wallet_events;
CREATE TRIGGER wallet_events_notify_big_win
  AFTER INSERT ON wallet_events
  FOR EACH ROW WHEN (NEW.event_type = 'big_win_notify')
  EXECUTE FUNCTION public.notify_big_win_event();

-- Backstop: retries delivery for big_win_notify events the push path never got acknowledged for
-- (secret missing, endpoint down, pg_net failure, or a Trigger.dev dispatch failure that left
-- processed_at NULL). Re-POSTs the SAME route rather than calling a claim/ack function directly
-- like retry_stale_wallet_events() does for xp_gain — that consumer's effect is a pure DB write
-- reachable from SQL, this consumer's effect (Trigger.dev dispatch) only exists in the Node route.
CREATE OR REPLACE FUNCTION public.retry_stale_big_win_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
  v_row RECORD;
  v_secret TEXT;
  v_alert_secret TEXT;
  v_stuck_count INTEGER;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets WHERE name = 'big_win_event_secret' LIMIT 1;

  IF v_secret IS NOT NULL THEN
    FOR v_row IN
      SELECT id FROM wallet_events
      WHERE event_type = 'big_win_notify'
        AND processed_at IS NULL
        AND created_at < now() - interval '2 minutes'
        AND attempts < 5
      ORDER BY created_at
      LIMIT 200
    LOOP
      BEGIN
        PERFORM net.http_post(
          url := 'https://casino-xi-six.vercel.app/api/internal/big-win-events',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-big-win-event-secret', v_secret
          ),
          body := jsonb_build_object('eventId', v_row.id)
        );
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;
  END IF;

  SELECT count(*) INTO v_stuck_count FROM wallet_events
    WHERE event_type = 'big_win_notify' AND processed_at IS NULL AND attempts >= 5;

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
            'job', 'big_win_events_retry',
            'error', v_stuck_count || ' big_win_notify events stuck at max attempts'
          )
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.retry_stale_big_win_events() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.retry_stale_big_win_events() TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('big-win-events-retry');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'big-win-events-retry',
  '*/2 * * * *',
  $$SELECT public.retry_stale_big_win_events();$$
);
