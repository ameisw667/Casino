-- Migration 026: pgcrypto is a hard prerequisite for the seed chain.
-- (Renumbert von 021 -> 026 am 2026-08-12: Nummer 021 war bereits durch
-- 021_promo_codes.sql belegt, siehe worldmap/05_1.10 ...md Abschnitt 15.)
--
-- Root cause: Migration 019 created functions that call gen_random_bytes()
-- and digest(), but it never installed pgcrypto. PostgreSQL therefore deferred
-- the missing-function error until the first new seed was consumed at runtime.
-- The calls below are schema-qualified so a SECURITY DEFINER function never
-- resolves crypto primitives through a caller-controlled search_path.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

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

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_existing FROM seed_consumptions
        WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND THEN
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
        v_server_seed := encode(extensions.gen_random_bytes(32), 'hex');
        v_hash := encode(extensions.digest(v_server_seed, 'sha256'), 'hex');
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

    v_new_server_seed := encode(extensions.gen_random_bytes(32), 'hex');
    v_new_hash := encode(extensions.digest(v_new_server_seed, 'sha256'), 'hex');

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
