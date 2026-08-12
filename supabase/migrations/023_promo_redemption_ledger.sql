-- F-02 / B-02: requires the promo catalog from 021_promo_codes.sql to be
-- applied first. One atomic promo redemption per user/code and per user/request.
-- The response is retained on the ledger so a network retry receives the same
-- snapshot without a second wallet mutation.

CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL REFERENCES public.promo_codes(code) ON DELETE RESTRICT,
    request_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0 AND amount <= 10000),
    transaction_id UUID NOT NULL REFERENCES public.wallet_transactions(id) ON DELETE RESTRICT,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, code),
    UNIQUE (user_id, request_id)
);

ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.promo_code_redemptions FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.redeem_promo_code(TEXT, TEXT);

CREATE FUNCTION public.redeem_promo_code(
    p_user_id TEXT,
    p_code TEXT,
    p_request_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_promo promo_codes%ROWTYPE;
    v_user users%ROWTYPE;
    v_existing promo_code_redemptions%ROWTYPE;
    v_new_balance NUMERIC(12, 2);
    v_transaction_id UUID;
    v_code_norm TEXT;
    v_response JSONB;
BEGIN
    IF p_user_id IS NULL OR btrim(p_user_id) = '' OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Invalid promo redemption identity';
    END IF;
    IF p_code IS NULL OR btrim(p_code) = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_INVALID');
    END IF;

    v_code_norm := upper(btrim(p_code));
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    SELECT * INTO v_existing
    FROM public.promo_code_redemptions
    WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND THEN
        IF v_existing.code <> v_code_norm THEN
            RETURN jsonb_build_object('ok', false, 'code', 'PROMO_REQUEST_CONFLICT');
        END IF;
        RETURN v_existing.response || jsonb_build_object('replayed', true);
    END IF;

    SELECT * INTO v_existing
    FROM public.promo_code_redemptions
    WHERE user_id = p_user_id AND code = v_code_norm;
    IF FOUND THEN
        RETURN jsonb_build_object('ok', false, 'code', 'PROMO_ALREADY_REDEEMED');
    END IF;

    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE code = v_code_norm
    FOR UPDATE;
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

    SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_new_balance := round((v_user.balance + v_promo.amount)::numeric, 2);
    UPDATE public.promo_codes
    SET used_count = used_count + 1
    WHERE code = v_code_norm;
    UPDATE public.users
    SET balance = v_new_balance, updated_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, metadata)
    VALUES (
        p_user_id,
        'bonus',
        'bonus',
        v_promo.amount,
        v_new_balance,
        jsonb_build_object('source', 'promo_code', 'code', v_code_norm, 'requestId', p_request_id)
    )
    RETURNING id INTO v_transaction_id;

    v_response := jsonb_build_object(
        'ok', true,
        'amount', v_promo.amount,
        'balance', v_new_balance,
        'xp', v_user.xp,
        'level', v_user.level,
        'rank', v_user.rank,
        'transactionId', v_transaction_id,
        'replayed', false
    );

    INSERT INTO public.promo_code_redemptions (
        user_id, code, request_id, amount, transaction_id, response
    ) VALUES (
        p_user_id, v_code_norm, p_request_id, v_promo.amount, v_transaction_id, v_response
    );

    RETURN v_response;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(TEXT, TEXT, UUID) TO service_role;
