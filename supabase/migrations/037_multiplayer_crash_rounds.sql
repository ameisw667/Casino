-- Migration 037: Multiplayer-Crash (worldmap/05_multiplayercrash.md, Option C)
-- Geteilter Rundentakt fuer das Crash-Spiel. crash_rounds traegt nur den
-- geteilten Takt + Crash-Point; die tatsaechliche Auszahlung bleibt
-- vollstaendig in der bestehenden Settlement-Kette (settle_game_round aus
-- 007, unveraendert). start_game_round selbst wird unten EINMALIG
-- redefiniert (CREATE OR REPLACE, exakt auf Basis seines bislang einzigen
-- Bodys aus 007 -- seit 007 nie neu definiert, siehe Migrationskopf-Historie
-- der 037-PR) um einen CRASH-spezifischen Race-Guard innerhalb des
-- bestehenden Advisory-Locks zu ergaenzen (L6-Security-Review-Fund
-- 2026-08-21: ein reiner TS-seitiger Pre-Check vor dem Lock ist ein
-- TOCTOU-Race zwischen zwei parallelen START_CRASH-Requests).
--
-- Fairness-Modell (Jan-Entscheidung 2026-08-21): Server-Commit-Reveal, kein
-- Client-Input in den Rundenwert -- Seed wird wie in consume_active_seed/
-- rotate_user_seed (019_seed_chain.sql) per gen_random_bytes/digest in SQL
-- erzeugt, nie in TS. Der Crash-Point selbst wird bewusst NICHT in SQL
-- berechnet (keine zweite Implementierung der Formel aus
-- ProvablyFairEngine.getCrashMultiplier) -- siehe set_crash_round_point.

CREATE TABLE IF NOT EXISTS crash_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'RUNNING', 'CRASHED')),
  server_seed_hash TEXT NOT NULL,
  server_seed TEXT NOT NULL,
  crash_point NUMERIC(10, 2) CHECK (crash_point IS NULL OR crash_point >= 1),
  betting_ends_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  crashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE crash_rounds ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_crash_rounds_status ON crash_rounds(status, created_at DESC);

-- Kein direkter Tabellenzugriff fuer Client-Rollen -- exakt wie game_rounds/seeds.
-- crash_point/server_seed verlassen den Server erst ueber die kuratierte
-- TS-Schicht (crash-round.ts::toPublicRoundState), nie ueber einen direkten Read.
REVOKE ALL ON TABLE crash_rounds FROM anon, authenticated;

-- Additive Kopplung an die bestehende Pro-User-Rundentabelle -- kein neuer
-- Money-Pfad, nur eine Referenz, welche geteilte Runde ein CRASH-game_rounds-
-- Eintrag begleitet hat. NULL fuer alle anderen Spiele und fuer Crash-Runden
-- vor dieser Migration.
ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS crash_round_id UUID REFERENCES crash_rounds(id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_crash_round
  ON game_rounds(crash_round_id) WHERE crash_round_id IS NOT NULL;

-- Einziger Advisory-Lock-geschuetzter Einstiegspunkt fuer den Rundentakt.
-- Lazy/On-Demand (worldmap/05_multiplayercrash.md §4.2): wird bei jedem
-- Bet-, Cashout- oder Status-Request aufgerufen, kein separater Cron-Prozess.
-- Gibt die volle, ungemaskte Zeile zurueck -- Maskierung fuer Client-Antworten
-- passiert ausschliesslich in der aufrufenden TS-Schicht, nicht hier, weil
-- diese Funktion ohnehin nur fuer service_role ausfuehrbar ist.
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

  -- Kein Datensatz existiert ueberhaupt: allererste WAITING-Runde anlegen.
  IF NOT FOUND THEN
    v_seed := encode(gen_random_bytes(32), 'hex');
    v_hash := encode(digest(v_seed, 'sha256'), 'hex');
    INSERT INTO crash_rounds (server_seed, server_seed_hash, betting_ends_at)
      VALUES (v_seed, v_hash, v_now + make_interval(secs => p_betting_window_ms / 1000.0))
      RETURNING * INTO v_round;
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  -- Runde existiert, aber crash_point fehlt noch (kurze Initialisierungsluecke
  -- zwischen INSERT und dem folgenden set_crash_round_point-Aufruf der
  -- TS-Schicht) -- Aufrufer muss ihn zuerst liefern, bevor irgendein
  -- Phasenuebergang stattfinden darf.
  IF v_round.crash_point IS NULL THEN
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  -- WAITING -> RUNNING: erst wenn das Wettfenster tatsaechlich geschlossen ist.
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

  -- RUNNING -> CRASHED: reiner Zeitstempel-Vergleich, keine Formel hier --
  -- crashed_at wurde beim WAITING->RUNNING-Uebergang von der TS-Schicht
  -- vorausberechnet (duration_ms aus derselben Kurve wie die Client-Animation).
  IF v_round.status = 'RUNNING' AND v_round.crashed_at <= v_now THEN
    UPDATE crash_rounds SET status = 'CRASHED' WHERE id = v_round.id RETURNING * INTO v_round;
    RETURN to_jsonb(v_round);
  END IF;

  -- CRASHED -> naechste WAITING-Runde, sobald die Pause nach dem Crash um ist.
  IF v_round.status = 'CRASHED'
     AND v_round.crashed_at + make_interval(secs => p_post_crash_pause_ms / 1000.0) <= v_now THEN
    v_seed := encode(gen_random_bytes(32), 'hex');
    v_hash := encode(digest(v_seed, 'sha256'), 'hex');
    INSERT INTO crash_rounds (server_seed, server_seed_hash, betting_ends_at)
      VALUES (v_seed, v_hash, v_now + make_interval(secs => p_betting_window_ms / 1000.0))
      RETURNING * INTO v_round;
    RETURN to_jsonb(v_round) || jsonb_build_object('needsCrashPoint', true);
  END IF;

  -- Nichts faellig -- aktuellen Stand unveraendert zurueckgeben.
  RETURN to_jsonb(v_round);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_crash_round(INTEGER, INTEGER, TIMESTAMPTZ) TO service_role;

-- Idempotentes Setzen des Crash-Points nach der TS-seitigen Berechnung
-- (ProvablyFairEngine.getCrashMultiplier, siehe Migrationskopf). Die
-- WHERE-crash_point-IS-NULL-Bedingung macht einen doppelten Aufruf durch
-- zwei konkurrierende Requests sicher -- keine Advisory-Lock noetig, ein
-- bedingtes UPDATE ist in Postgres bereits atomar.
CREATE OR REPLACE FUNCTION public.set_crash_round_point(
  p_round_id UUID,
  p_crash_point NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_round crash_rounds%ROWTYPE;
BEGIN
  IF p_round_id IS NULL OR p_crash_point IS NULL OR p_crash_point < 1 THEN
    RAISE EXCEPTION 'Invalid crash point';
  END IF;

  UPDATE crash_rounds SET crash_point = p_crash_point
    WHERE id = p_round_id AND crash_point IS NULL
    RETURNING * INTO v_round;

  IF NOT FOUND THEN
    SELECT * INTO v_round FROM crash_rounds WHERE id = p_round_id;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crash round not found';
  END IF;

  RETURN to_jsonb(v_round);
END;
$$;

REVOKE ALL ON FUNCTION public.set_crash_round_point(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_crash_round_point(UUID, NUMERIC) TO service_role;

-- Redefinition of start_game_round (originally 007_server_authority.sql,
-- never redefined since) -- adds a single CRASH-only guard clause inside the
-- pre-existing pg_advisory_xact_lock(hashtextextended(p_user_id, 0))
-- critical section, so two concurrent START_CRASH requests for the same
-- user can no longer both succeed (the second serializes behind the lock,
-- then observes the first's already-inserted ACTIVE row and is rejected).
-- Everything else in the body is byte-for-byte identical to 007's version --
-- BLACKJACK is untouched, the idempotent-replay short-circuit still returns
-- first, and the balance/insert/wallet_transactions logic is unchanged.
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

  -- Multiplayer-Crash Race-Guard (worldmap/05_multiplayercrash.md, L6):
  -- läuft bereits im gelockten Abschnitt, also atomar ggü. einem parallelen
  -- zweiten START_CRASH desselben Users -- anders als der TS-seitige
  -- Pre-Check in bet/route.ts, der nur eine schnelle Fehlermeldung liefert,
  -- aber keine Garantie ist.
  IF p_game = 'CRASH' AND EXISTS (
    SELECT 1 FROM game_rounds
    WHERE user_id = p_user_id AND game = 'CRASH' AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Active crash round already exists';
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
