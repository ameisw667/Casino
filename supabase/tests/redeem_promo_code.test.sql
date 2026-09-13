-- pgTAP-Laufzeittest fuer die Promo-Geld-RPC public.redeem_promo_code (Saeule 10 N2)
-- Kanonische Definition: supabase/migrations/058_reconcile_remote_schema_drift.sql:809
-- Signatur: (p_user_id text, p_code text, p_request_id uuid) RETURNS jsonb
-- Bisher nur als Fixture in promo_reversal_rpc.test.sql genutzt — hier dediziert.
-- Abgedeckt: Identitaets-Pflicht, Fehlercodes (NOT_FOUND/INACTIVE/ALREADY_REDEEMED/
-- REQUEST_CONFLICT), gueltige Einloesung mit Ledger + used_count, Idempotenz-Replay.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(13);

-- 1. Die Funktion existiert in der kanonischen 3-Argument-Signatur.
SELECT has_function('public', 'redeem_promo_code', ARRAY['text', 'text', 'uuid']);

INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_redeem_user', 'pgtap_redeem_user', 100.00);
INSERT INTO public.promo_codes (code, amount, max_uses, active)
VALUES ('REDEEMOK', 50.00, 10, true),
       ('REDEEMOFF', 50.00, 10, false);
UPDATE public.promo_codes SET active = false WHERE code = 'REDEEMOFF';

-- 2. Ungueltige Identitaet (NULL user_id) wird mit P0001 abgewiesen.
SELECT throws_ok(
  $$ SELECT public.redeem_promo_code(
       NULL::text, 'REDEEMOK', '11111111-1111-4111-8111-111111111111'::uuid) $$,
  'P0001',
  'Invalid promo redemption identity',
  'NULL user_id muss "Invalid promo redemption identity" werfen'
);

-- 3-5. Fehlercodes ohne Exception: NOT_FOUND, INACTIVE, REQUEST_CONFLICT.
SELECT is(
  ( SELECT public.redeem_promo_code(
        'pgtap_redeem_user', 'NOEXIST', '11111111-1111-4111-8111-111111111111'::uuid
    ) ->> 'code'
  ),
  'PROMO_NOT_FOUND',
  'unbekannter Code muss PROMO_NOT_FOUND liefern'
);
SELECT is(
  ( SELECT public.redeem_promo_code(
        'pgtap_redeem_user', 'REDEEMOFF', '11111111-1111-4111-8111-111111111111'::uuid
    ) ->> 'code'
  ),
  'PROMO_INACTIVE',
  'inaktiver Code muss PROMO_INACTIVE liefern'
);

-- Fixture fuer REQUEST_CONFLICT: request_id gehoert einer Einloesung eines ANDEREN Codes.
SELECT lives_ok(
  $$ SELECT public.redeem_promo_code(
       'pgtap_redeem_user', 'REDEEMOK', '22222222-2222-4222-8222-222222222222'::uuid) $$,
  'gueltige Einloesung von REDEEMOK muss durchlaufen'
);

-- 4. Gueltige Einloesung: Balance 100 -> 150, used_count = 1.
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_redeem_user' ),
  '150.00',
  'Einloesung muss die Balance um den Promo-Betrag erhoehen (100 -> 150)'
);
SELECT is(
  ( SELECT used_count::text FROM public.promo_codes WHERE code = 'REDEEMOK' ),
  '1',
  'Einloesung muss used_count inkrementieren'
);
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_redeem_user' AND type = 'bonus'
      AND metadata ->> 'source' = 'promo_code' ),
  '1',
  'genau ein bonus-Ledger-Eintrag mit promo_code-Quelle'
);

-- 6. Idempotenz-Replay: identische request_id liefert replayed=true.
SELECT is(
  ( SELECT public.redeem_promo_code(
        'pgtap_redeem_user', 'REDEEMOK', '22222222-2222-4222-8222-222222222222'::uuid
    ) ->> 'replayed'
  ),
  'true',
  'Replay mit gleicher request_id muss replayed=true liefern'
);

-- 7. Kernversprechen: der Replay veraendert die Balance nicht (weiterhin 150.00).
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_redeem_user' ),
  '150.00',
  'Replay darf die Balance nicht erneut erhoehen'
);

-- 8. Doppelt-Einloesung mit NEUER request_id wird als ALREADY_REDEEMED abgewiesen.
SELECT is(
  ( SELECT public.redeem_promo_code(
        'pgtap_redeem_user', 'REDEEMOK', '33333333-3333-4333-8333-333333333333'::uuid
    ) ->> 'code'
  ),
  'PROMO_ALREADY_REDEEMED',
  'zweite Einloesung desselben Codes (neue request_id) muss PROMO_ALREADY_REDEEMED liefern'
);

-- 9. dieselbe request_id mit ANDEREM Code ist ein Konflikt, kein Replay.
SELECT is(
  ( SELECT public.redeem_promo_code(
        'pgtap_redeem_user', 'NOEXIST', '22222222-2222-4222-8222-222222222222'::uuid
    ) ->> 'code'
  ),
  'PROMO_REQUEST_CONFLICT',
  'gleiche request_id mit fremdem Code muss PROMO_REQUEST_CONFLICT liefern'
);

-- 10. Kernversprechen: keine der abgewiesenen Varianten hat die Balance veraendert.
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_redeem_user' ),
  '150.00',
  'abgewiesene Einloesungsversuche duerfen die Balance nicht veraendern'
);

SELECT * FROM finish();
ROLLBACK;