-- Migration 021: Promo Codes (server-authoritative redemption)
-- Ersetzt den client-derivierten self-credit (ehemals redeem-code Route leitete den
-- Gutscheinbetrag aus dem Code-String via Regex ab -> unlimitierter self-credit ATM).
-- Promo-Codes sind admin-issued, atomar einlösbar, global max_uses begrenzt.

CREATE TABLE IF NOT EXISTS public.promo_codes (
    code        TEXT PRIMARY KEY,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0 AND amount <= 10000),
    max_uses    INTEGER NOT NULL CHECK (max_uses > 0),
    used_count  INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    expires_at  TIMESTAMPTZ,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT promo_codes_used_within_max CHECK (used_count <= max_uses)
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Nur service_role darf promo_codes lesen/schreiben (anon/authenticated: nichts).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'promo_codes'
          AND policyname = 'promo_codes_service_role_all'
    ) THEN
        CREATE POLICY "promo_codes_service_role_all" ON public.promo_codes
            FOR ALL USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(active) WHERE active = TRUE;

-- Atomare Einlösung: validiert Code + atomarer used_count-Inkrement + Balance-Credit + Audit-Insert.
-- Gibt JSONB mit ok=true + snapshot oder ok=false + fehlercode zurück (kein EXCEPTION für valide Fehler).
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

    -- Sperre den Promo-Code-Zeile atomar (FOR UPDATE verhindert Race auf used_count).
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

    -- Sperre + validiere User.
    SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_new_bal := round((v_user.balance + v_promo.amount)::numeric, 2);

    -- Atomar: used_count inkrementieren + Balance gutschreiben + Audit-Trail.
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