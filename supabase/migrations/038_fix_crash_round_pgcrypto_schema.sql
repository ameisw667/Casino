-- Migration 038: Fix sync_crash_round's unqualified pgcrypto calls.
--
-- Root cause: 037_multiplayer_crash_rounds.sql called gen_random_bytes()/
-- digest() unqualified inside sync_crash_round, same mistake 019_seed_chain.sql
-- originally made for consume_active_seed/rotate_user_seed — pgcrypto lives in
-- the `extensions` schema (026_require_pgcrypto_for_seed_chain.sql), not
-- `public`, and this function's SET search_path = public, pg_temp never
-- includes it. Caught live via a direct RPC call against the remote DB right
-- after pushing 037 (worldmap/05_multiplayercrash.md L7): "function
-- gen_random_bytes(integer) does not exist" (Postgres error 42883).
--
-- Same fix as 026: schema-qualify both calls. Rest of the function body is
-- byte-for-byte identical to 037's version.

CREATE OR REPLACE FUNCTION public.sync_crash_round(
  p_betting_window_ms INTEGER,
  p_post_crash_pause_ms INTEGER,
  p_crashed_at TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_round crash_rounds%ROWTYPE;
  v_seed TEXT;
  v_hash TEXT;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_betting_window_ms IS NULL OR p_betting_window_ms <= 0
     OR p_post_crash_pause_ms IS NULL OR p_post_crash_pause_ms < 0 THEN
    RAISE EXCEPTION 'Invalid crash round scheduling parameters';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('crash_round_scheduler'));

  SELECT * INTO v_round FROM crash_rounds ORDER BY created_at DESC LIMIT 1 FOR UPDATE;

  IF NOT FOUND THEN
    v_seed := encode(extensions.gen_random_bytes(32), 'hex');
    v_hash := encode(extensions.digest(v_seed, 'sha256'), 'hex');
    INSERT INTO crash_rounds (server_seed, server_seed_hash, betting_ends_at)
      VALUES (v_seed, v_hash, v_now + make_interval(secs => p_betting_window_ms / 1000.0))
      RETURNING * INTO v_round;
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  IF v_round.crash_point IS NULL THEN
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  IF v_round.status = 'WAITING' AND v_round.betting_ends_at <= v_now THEN
    IF p_crashed_at IS NULL THEN
      RETURN to_jsonb(v_round) || jsonb_build_object('needsTransition', 'RUNNING');
    END IF;
    UPDATE crash_rounds
      SET status = 'RUNNING', started_at = v_round.betting_ends_at, crashed_at = p_crashed_at
      WHERE id = v_round.id
      RETURNING * INTO v_round;
    RETURN to_jsonb(v_round);
  END IF;

  IF v_round.status = 'RUNNING' AND v_round.crashed_at <= v_now THEN
    UPDATE crash_rounds SET status = 'CRASHED' WHERE id = v_round.id RETURNING * INTO v_round;
    RETURN to_jsonb(v_round);
  END IF;

  IF v_round.status = 'CRASHED'
     AND v_round.crashed_at + make_interval(secs => p_post_crash_pause_ms / 1000.0) <= v_now THEN
    v_seed := encode(extensions.gen_random_bytes(32), 'hex');
    v_hash := encode(extensions.digest(v_seed, 'sha256'), 'hex');
    INSERT INTO crash_rounds (server_seed, server_seed_hash, betting_ends_at)
      VALUES (v_seed, v_hash, v_now + make_interval(secs => p_betting_window_ms / 1000.0))
      RETURNING * INTO v_round;
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  RETURN to_jsonb(v_round);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) TO service_role;
