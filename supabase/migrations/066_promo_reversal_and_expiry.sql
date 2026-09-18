-- 06_10 (Promo-/Bonus-Code-Abuse-Prevention): L0 Reversal-RPC + L1 proaktiver Expiry-Job.
--
-- L0 — reverse_promo_code: zieht einen nachträglich als betrügerisch erkannten Promo-Bonus
-- über den Service-Layer zurück (WalletService.reversePromoCode, Admin-Route
-- POST /api/admin/promo-codes/[code]/reverse). Immer mensch-getriggert — nie automatisiert.
-- Audit-Vertrag analog admin_update_user (028): actor_id, request_id und reason sind Pflicht,
-- request_id macht den Vorgang idempotent (Netzwerk-Retry erhält dieselbe Antwort).
--
-- Q1-Entscheidung (abweichend zur Empfehlung (a) implementiert, dokumentiert im
-- Ausführungsprotokoll): users.balance trägt CHECK (balance >= 0) aus 001_users.sql — eine
-- Rückbuchung ins Negative würde diese globale Invariante für ALLE Geld-Pfade schwächen und
-- ist entgegen der Plan-Angabe keine additive Migration. Die Rückbuchung wird daher auf 0
-- begrenzt; der ungedeckte Fehlbetrag wird trotzdem ehrlich berichtet
-- (metadata.uncappedShortfall + Risk-Event-Evidence) statt verschwiegen.
--
-- used_count wird bewusst NICHT dekrementiert: der Redemption-Eintrag bleibt Historie,
-- ein erschöpfter Code-Platz wird durch die Rückbuchung nicht wieder freigegeben (sonst
-- könnte derselbe Missbrauchs-Account erneut einlösen).
--
-- L1 — deactivate_expired_promo_codes: proaktive tägliche Deaktivierung abgelaufener Codes
-- (rein aufräumend; die reaktive RPC-Prüfung aus 023 bleibt als zusätzliche Absicherung).

CREATE OR REPLACE FUNCTION public.reverse_promo_code(
    p_actor_id TEXT,
    p_user_id TEXT,
    p_code TEXT,
    p_request_id UUID,
    p_reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_redemption public.promo_code_redemptions%ROWTYPE;
    v_user public.users%ROWTYPE;
    v_existing public.wallet_transactions%ROWTYPE;
    v_reversal_amount NUMERIC(20, 2);
    v_shortfall NUMERIC(20, 2);
    v_new_balance NUMERIC(20, 2);
    v_transaction_id UUID;
    v_code_norm TEXT;
BEGIN
    IF p_actor_id IS NULL OR length(btrim(p_actor_id)) = 0
       OR p_user_id IS NULL OR length(btrim(p_user_id)) = 0
       OR p_request_id IS NULL
       OR p_reason IS NULL OR length(btrim(p_reason)) = 0 THEN
        RAISE EXCEPTION 'Admin audit context is required';
    END IF;

    v_code_norm := upper(btrim(p_code));
    IF v_code_norm = '' THEN
        RETURN jsonb_build_object('ok', false, 'code', 'REVERSAL_NOT_FOUND');
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

    -- Idempotenz: derselbe request_id-Retry erhält dieselbe Antwort ohne zweite Mutation.
    SELECT * INTO v_existing
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND AND v_existing.type = 'promo_reversal' THEN
        RETURN jsonb_build_object(
            'ok', true,
            'amount', abs(v_existing.amount),
            'shortfall', COALESCE((v_existing.metadata ->> 'uncappedShortfall')::numeric, 0),
            'balance', (SELECT balance FROM public.users WHERE id = p_user_id),
            'transactionId', v_existing.id,
            'replayed', true
        );
    END IF;
    IF FOUND THEN
        RAISE EXCEPTION 'Request ID already belongs to another wallet mutation';
    END IF;

    SELECT * INTO v_redemption
    FROM public.promo_code_redemptions
    WHERE user_id = p_user_id AND code = v_code_norm;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'code', 'REVERSAL_NOT_FOUND');
    END IF;

    -- Doppel-Rückbuchung abweisen (anderer request_id, bereits reversierter Code).
    IF EXISTS (
        SELECT 1 FROM public.wallet_transactions
        WHERE user_id = p_user_id
          AND type = 'promo_reversal'
          AND metadata ->> 'reversesTransactionId' = v_redemption.transaction_id::text
    ) THEN
        RETURN jsonb_build_object('ok', false, 'code', 'REVERSAL_ALREADY_DONE');
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_reversal_amount := least(v_redemption.amount, v_user.balance);
    v_shortfall := round((v_redemption.amount - v_reversal_amount)::numeric, 2);
    v_new_balance := round((v_user.balance - v_reversal_amount)::numeric, 2);

    UPDATE public.users
    SET balance = v_new_balance, updated_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.wallet_transactions
        (user_id, actor_id, game, type, request_id, before_balance, reason,
         amount, balance_after, metadata)
    VALUES (
        p_user_id, p_actor_id, 'bonus', 'promo_reversal', p_request_id, v_user.balance, p_reason,
        -v_reversal_amount, v_new_balance,
        jsonb_build_object(
            'source', 'promo_code_reversal',
            'code', v_code_norm,
            'reversesTransactionId', v_redemption.transaction_id,
            'redemptionAmount', v_redemption.amount,
            'uncappedShortfall', v_shortfall
        )
    )
    RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
        'ok', true,
        'amount', v_reversal_amount,
        'shortfall', v_shortfall,
        'balance', v_new_balance,
        'xp', v_user.xp,
        'level', v_user.level,
        'rank', v_user.rank,
        'transactionId', v_transaction_id,
        'replayed', false
    );
END;
$$;

REVOKE ALL ON FUNCTION public.reverse_promo_code(TEXT, TEXT, TEXT, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_promo_code(TEXT, TEXT, TEXT, UUID, TEXT) TO service_role;

-- L1: proaktiver Expiry-Job — gleiche pg_cron/Alert-Aufteilung wie
-- purge_bet_network_fingerprints (030_fraud_signal_detection.sql): reine SQL-Arbeit plus
-- Alert-on-Failure-Wrapper über vault-secret.
CREATE OR REPLACE FUNCTION public.deactivate_expired_promo_codes()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH deactivated AS (
    UPDATE public.promo_codes
    SET active = false
    WHERE active = true AND expires_at IS NOT NULL AND expires_at < now()
    RETURNING 1
  )
  SELECT count(*)::integer FROM deactivated;
$$;

REVOKE ALL ON FUNCTION public.deactivate_expired_promo_codes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_expired_promo_codes() TO service_role;

CREATE OR REPLACE FUNCTION public.run_promo_expiry_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault, pg_temp
AS $$
DECLARE
    v_alert_secret TEXT;
BEGIN
    PERFORM public.deactivate_expired_promo_codes();
EXCEPTION WHEN OTHERS THEN
    SELECT decrypted_secret INTO v_alert_secret
    FROM vault.decrypted_secrets
    WHERE name = 'cron_alert_secret'
    LIMIT 1;

    IF v_alert_secret IS NOT NULL THEN
        PERFORM net.http_post(
            url := 'https://casino-xi-six.vercel.app/api/internal/cron-alert',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-cron-alert-secret', v_alert_secret
            ),
            body := jsonb_build_object(
                'job', 'promo_expiry',
                'error', left(SQLERRM, 500)
            )
        );
    END IF;
    -- Swallowed deliberately, same rationale as 027/030: pg_cron has no retry/backoff,
    -- re-raising would only spam identical failures at the next run.
END;
$$;

REVOKE ALL ON FUNCTION public.run_promo_expiry_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_promo_expiry_job() TO service_role;

-- Idempotent (re)scheduling. Offsets: guide-telemetry 03:17, bet-fingerprint 03:41,
-- tägliche Rennen/andere Jobs im Nacht-Fenster — dieser Job läuft bewusst versetzt um 04:13.
DO $$
BEGIN
    PERFORM cron.unschedule('promo-expiry-daily');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

SELECT cron.schedule(
    'promo-expiry-daily',
    '13 4 * * *',
    $$SELECT public.run_promo_expiry_job();$$
);