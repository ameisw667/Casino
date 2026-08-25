-- Regression fixture: isolated snapshot of public.get_or_create_user_seed(p_user_id)
-- exactly as originally created in supabase/migrations/016_full_server_authority_expansion.sql,
-- before supabase/migrations/022_lock_down_legacy_seed_rpc.sql (fix F-06,
-- docs/status-reports/06_1_SECURITY_REMEDIATION_F01_F06.md) added the REVOKE/GRANT pair.
-- Real historical bug: this function is SECURITY DEFINER, sets a fixed search_path (SEC-DB-001
-- satisfied), performs no wallet/transaction write (SEC-DB-002's financial-write trigger does not
-- apply), and accepts a caller-supplied p_user_id used to read and overwrite that user's
-- provably-fair seed row -- but the migration issues no REVOKE, so Postgres' implicit default
-- EXECUTE grant to PUBLIC stands. Any anon/authenticated caller could bootstrap or overwrite
-- another user's seed by passing an arbitrary p_user_id.
CREATE OR REPLACE FUNCTION public.get_or_create_user_seed(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_seed seeds%ROWTYPE;
    v_server_seed TEXT;
    v_server_seed_hash TEXT;
BEGIN
    SELECT * INTO v_seed FROM seeds WHERE user_id = p_user_id AND is_active = TRUE LIMIT 1;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'clientSeed', v_seed.client_seed,
            'serverSeedHash', v_seed.server_seed_hash,
            'nonce', v_seed.nonce
        );
    END IF;

    v_server_seed := encode(gen_random_bytes(32), 'hex');
    v_server_seed_hash := encode(digest(v_server_seed, 'sha256'), 'hex');

    INSERT INTO seeds (user_id, server_seed, server_seed_hash, client_seed, nonce, is_active)
    VALUES (p_user_id, v_server_seed, v_server_seed_hash, 'vibe-coder-default', 0, TRUE)
    ON CONFLICT (user_id) DO UPDATE SET
        server_seed = EXCLUDED.server_seed,
        server_seed_hash = EXCLUDED.server_seed_hash,
        is_active = TRUE
    RETURNING * INTO v_seed;

    RETURN jsonb_build_object(
        'clientSeed', v_seed.client_seed,
        'serverSeedHash', v_seed.server_seed_hash,
        'nonce', v_seed.nonce
    );
END;
$$;
