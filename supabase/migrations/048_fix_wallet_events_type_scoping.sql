-- Corrective fix for migration 047 (4.3 Event-Bus big-win-notify consumer). Security review
-- (2026-08-22, see worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md) found a CRITICAL cross-contamination
-- bug: migration 036's wallet_events_notify trigger, apply_xp_gain(), and
-- retry_stale_wallet_events() all predate the event_type CHECK broadening in 047 and have no
-- event_type filter — they assumed the table only ever held 'xp_gain' rows. After 047, a
-- big_win_notify INSERT fires BOTH the old (unconditional) and new (WHEN event_type=...) triggers;
-- whichever pg_net delivery lands first "wins", and if it's the xp_gain path, apply_xp_gain finds
-- the row, sees processed_at IS NULL, and unconditionally marks it processed (xp_gain is hardcoded
-- 0 for big_win_notify rows, so no XP corruption — but the real big-win consumer then sees
-- alreadyProcessed=true and never dispatches to Trigger.dev). The 2-minute cron backstop has the
-- same gap, so a lost notification is never retried either. Scopes all three 036 objects to
-- event_type='xp_gain' — CREATE OR REPLACE with identical signatures, no behavior change for
-- existing xp_gain rows, closes the gap for big_win_notify (and any future event type).

DROP TRIGGER IF EXISTS wallet_events_notify ON wallet_events;
CREATE TRIGGER wallet_events_notify
  AFTER INSERT ON wallet_events
  FOR EACH ROW WHEN (NEW.event_type = 'xp_gain')
  EXECUTE FUNCTION public.notify_wallet_event();

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

  SELECT * INTO v_event FROM wallet_events
    WHERE id = p_event_id AND event_type = 'xp_gain' FOR UPDATE;
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
    WHERE event_type = 'xp_gain'
      AND processed_at IS NULL
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
    WHERE event_type = 'xp_gain' AND processed_at IS NULL AND attempts >= 5;

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
