-- Migration 019: Commit-Reveal Seed-Kette (worldmap/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md)
-- 1) Schliesst eine vorbestehende Zugriffslücke: `seeds` hatte nie ein REVOKE für
--    anon/authenticated (anders als game_rounds/user_identities/admin_roles), RLS
--    filtert nur Zeilen, keine Spalten -> server_seed war im Klartext lesbar.
-- 2) Fuehrt eine echte Seed-Kette ein: placeBet()/startCrashRound()/Blackjack-Deal
--    konsumieren ab jetzt den aktiven Seed atomar statt bei jedem Bet einen neuen
--    zu generieren (siehe casino-core.ts vor diesem Rollout).
-- 3) Macht Rotation nicht mehr destruktiv (Reveal + History) und verankert
--    server_seed_hash/nonce dauerhaft auf abgeschlossenen Dice/Roulette/Slots-Bets.

-- 1. Direktzugriffslücke schliessen ---------------------------------------------
REVOKE ALL ON TABLE seeds FROM anon, authenticated;

-- 2. Idempotenz-Ledger fuer Seed-Konsum (server-intern, kein User-Select noetig) --
CREATE TABLE IF NOT EXISTS seed_consumptions (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL,
    server_seed_hash TEXT NOT NULL,
    nonce INTEGER NOT NULL,
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, request_id)
);
ALTER TABLE seed_consumptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE seed_consumptions FROM anon, authenticated;

-- 3. Reveal-History fuer rotierte Seeds -------------------------------------------
CREATE TABLE IF NOT EXISTS seed_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_seed TEXT NOT NULL,
    server_seed_hash TEXT NOT NULL,
    client_seed TEXT NOT NULL,
    nonce_at_rotation INTEGER NOT NULL,
    rotated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE seed_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE seed_history FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_seed_history_user ON seed_history(user_id, rotated_at DESC);

CREATE POLICY "seed_history_select_own" ON seed_history
    FOR SELECT USING ((auth.jwt() ->> 'sub') = user_id);
GRANT SELECT ON TABLE seed_history TO authenticated;

-- 4. Bet-Level-Verankerung fuer Dice/Roulette/Slots (Crash/Blackjack tragen
--    serverSeed/hash/nonce bereits in game_rounds.state, siehe route.ts) ----------
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS server_seed_hash TEXT;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS nonce INTEGER;

-- 5. Atomarer, idempotenter Seed-Konsum -------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_active_seed(
    p_user_id TEXT,
    p_request_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing seed_consumptions%ROWTYPE;
    v_seed seeds%ROWTYPE;
    v_server_seed TEXT;
    v_hash TEXT;
BEGIN
    IF p_user_id IS NULL OR p_user_id = '' OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Invalid seed consumption request';
    END IF;

    -- Gleicher Lock-Key wie settle_game_bet/start_game_round: serialisiert
    -- Seed-Konsum und Wallet-Mutationen pro User, ohne verschachtelte Sperren
    -- (jede RPC ist eine eigene Transaktion, pg_advisory_xact_lock loest sich
    -- am Transaktionsende automatisch).
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_existing FROM seed_consumptions
        WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND THEN
        -- The seed that was actually consumed may since have been rotated
        -- out of `seeds` (a retry can land after the user rotated in
        -- between) — fall back to seed_history so a replay never returns a
        -- NULL serverSeed for a request that already succeeded once.
        SELECT server_seed INTO v_server_seed FROM seeds
            WHERE user_id = p_user_id AND server_seed_hash = v_existing.server_seed_hash;
        IF v_server_seed IS NULL THEN
            SELECT server_seed INTO v_server_seed FROM seed_history
                WHERE user_id = p_user_id AND server_seed_hash = v_existing.server_seed_hash
                ORDER BY rotated_at DESC LIMIT 1;
        END IF;
        RETURN jsonb_build_object(
            'serverSeed', v_server_seed,
            'serverSeedHash', v_existing.server_seed_hash,
            'nonce', v_existing.nonce,
            'replayed', true
        );
    END IF;

    SELECT * INTO v_seed FROM seeds WHERE user_id = p_user_id AND is_active = TRUE FOR UPDATE;
    IF NOT FOUND THEN
        v_server_seed := encode(gen_random_bytes(32), 'hex');
        v_hash := encode(digest(v_server_seed, 'sha256'), 'hex');
        INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
        VALUES (p_user_id, v_server_seed, v_hash, 'vibe-coder-default', 0, TRUE)
        ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE
        RETURNING * INTO v_seed;
    END IF;

    UPDATE seeds SET nonce = nonce + 1
        WHERE user_id = p_user_id AND is_active = TRUE
        RETURNING * INTO v_seed;

    INSERT INTO seed_consumptions (user_id, request_id, server_seed_hash, nonce)
        VALUES (p_user_id, p_request_id, v_seed.server_seed_hash, v_seed.nonce);

    RETURN jsonb_build_object(
        'serverSeed', v_seed.server_seed,
        'serverSeedHash', v_seed.server_seed_hash,
        'nonce', v_seed.nonce,
        'replayed', false
    );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_active_seed(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_active_seed(TEXT, UUID) TO service_role;

-- 6. Rotation: nicht mehr destruktiv, liefert Reveal + schreibt History -----------
CREATE OR REPLACE FUNCTION public.rotate_user_seed(
    p_user_id TEXT,
    p_client_seed TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old seeds%ROWTYPE;
    v_new_server_seed TEXT;
    v_new_hash TEXT;
BEGIN
    IF p_client_seed IS NULL OR btrim(p_client_seed) = '' THEN
        RAISE EXCEPTION 'Invalid client seed';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_old FROM seeds WHERE user_id = p_user_id AND is_active = TRUE FOR UPDATE;

    v_new_server_seed := encode(gen_random_bytes(32), 'hex');
    v_new_hash := encode(digest(v_new_server_seed, 'sha256'), 'hex');

    IF FOUND THEN
        INSERT INTO seed_history (user_id, server_seed, server_seed_hash, client_seed, nonce_at_rotation)
        VALUES (v_old.user_id, v_old.server_seed, v_old.server_seed_hash, v_old.client_seed, v_old.nonce);
    END IF;

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_new_server_seed, v_new_hash, p_client_seed, 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = v_new_server_seed,
        server_seed_hash = v_new_hash,
        client_seed = p_client_seed,
        nonce = 0,
        is_active = TRUE;

    RETURN jsonb_build_object(
        'clientSeed', p_client_seed,
        'serverSeedHash', v_new_hash,
        'nonce', 0,
        'revealedSeed', v_old.server_seed,
        'revealedSeedHash', v_old.server_seed_hash
    );
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_user_seed(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_user_seed(TEXT, TEXT) TO service_role;

-- 7. settle_game_bet: optionale Seed-Verankerung fuer Dice/Roulette/Slots ---------
-- WICHTIG: settle_game_bet wurde bereits zweimal nach 007 neu definiert
-- (010_dynamic_xp_divisor.sql, zuletzt 014_fix_user_stats.sql). Diese Version
-- baut auf dem tatsaechlich zuletzt aktiven Body aus 014 auf (inkl. dessen
-- betAmount/payout-Response-Feldern und public.-Praefixen) und ergaenzt nur
-- die beiden neuen Seed-Parameter/-Spalten -- ein Body auf Basis von 007
-- haette 014s Stats-Fix beim Anwenden dieser Migration stillschweigend
-- zurueckgerollt.
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

REVOKE ALL ON FUNCTION public.settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_game_bet(TEXT, UUID, UUID, TEXT, NUMERIC, NUMERIC, BIGINT, JSONB, TEXT, INTEGER) TO service_role;
