-- Regression fixture: isolated snapshot of the original public.redeem_promo_code(p_user_id, p_code)
-- from supabase/migrations/021_promo_codes.sql, before migration 023_promo_redemption_ledger.sql
-- (fix F-02, docs/status-reports/06_1_SECURITY_REMEDIATION_F01_F06.md) added p_request_id and the
-- UNIQUE(user_id, code) / UNIQUE(user_id, request_id) redemption ledger. Real historical bug: this
-- version row-locks the promo code and the user (FOR UPDATE) but has no per-user uniqueness or
-- request-id replay guard, so the same user could be credited more than once for the same code
-- (e.g. via a client retry after a timed-out response), up to the code's global max_uses.
CREATE OR REPLACE FUNCTION public.redeem_promo_code(
    p_user_id TEXT,
    p_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_promo     promo_codes%ROWTYPE;
    v_user      users%ROWTYPE;
    v_new_bal   NUMERIC(12, 2);
    v_tx_id     UUID;
    v_code_norm TEXT;
BEGIN
    IF p_user_id IS NULL OR btrim(p_user_id) = '' THEN
        RAISE EXCEPTION 'Invalid user';
    END IF;
    IF p_code IS NULL OR btrim(p_code) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_INVALID');
    END IF;

    v_code_norm := upper(btrim(p_code));

    SELECT * INTO v_promo FROM promo_codes WHERE code = v_code_norm FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_NOT_FOUND');
    END IF;
    IF NOT v_promo.active THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_INACTIVE');
    END IF;
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_EXPIRED');
    END IF;
    IF v_promo.used_count >= v_promo.max_uses THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_EXHAUSTED');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_new_bal := round((v_user.balance + v_promo.amount)::numeric, 2);

    UPDATE promo_codes SET used_count = used_count + 1 WHERE code = v_code_norm;
    UPDATE users SET balance = v_new_bal, updated_at = now() WHERE id = p_user_id;

    INSERT INTO wallet_transactions (user_id, game, type, amount, balance_after, metadata)
    VALUES (
        p_user_id, 'bonus', 'bonus', v_promo.amount, v_new_bal,
        jsonb_build_object('source', 'promo_code', 'code', v_code_norm)
    )
    RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'ok', TRUE,
        'amount', v_promo.amount,
        'balance', v_new_bal,
        'xp', v_user.xp,
        'level', v_user.level,
        'rank', v_user.rank,
        'transactionId', v_tx_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code TO service_role;
