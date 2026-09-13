-- pgTAP-Laufzeittest fuer die 06_10-Promo-RPCs:
--   public.reverse_promo_code              (066_promo_reversal_and_expiry.sql, L0)
--   public.deactivate_expired_promo_codes  (066_promo_reversal_and_expiry.sql, L1)
-- Abgedeckt: korrekte Balance-Reduktion, Audit-Vertrag (actor/reason/request_id),
-- Doppel-Rueckbuchung, Idempotenz-Retry, Clamp-auf-0 (CHECK balance >= 0, Fehlbetrag
-- ehrlich in metadata.uncappedShortfall), proaktive Expiry-Deaktivierung.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(22);

-- Fixtures: zwei Nutzer, vier Codes (zwei einloesbar, einer abgelaufen, einer in der Zukunft).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_promo_user', 'pgtap_promo_user', 100.00),
       ('pgtap_promo_user2', 'pgtap_promo_user2', 20.00);

INSERT INTO public.promo_codes (code, amount, max_uses, active)
VALUES ('PROMO01', 100.00, 10, true),
       ('PROMO02', 100.00, 10, true),
       ('EXPIRED1', 50.00, 5, true),
       ('FUTURE1', 50.00, 5, true);

UPDATE public.promo_codes SET expires_at = now() - interval '1 day' WHERE code = 'EXPIRED1';
UPDATE public.promo_codes SET expires_at = now() + interval '1 day' WHERE code = 'FUTURE1';

-- 1-2. Die Funktionen existieren in den erwarteten Signaturen.
SELECT has_function(
  'public', 'reverse_promo_code',
  ARRAY['text', 'text', 'text', 'uuid', 'text']
);
SELECT has_function('public', 'deactivate_expired_promo_codes', ARRAY[]::text[]);

-- 3. Fixture: gueltige Einlösung von PROMO01 (100 -> 200).
SELECT lives_ok(
  $$ SELECT public.redeem_promo_code('pgtap_promo_user', 'PROMO01', '66666666-6666-4666-8666-666666666661') $$,
  'Einlösung von PROMO01 als Reversal-Fixture'
);

-- 4. Rueckbuchung (erster, erfolgreicher Aufruf): Balance 200 -> 100.
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user', 'promo01', '66666666-6666-4666-8666-666666666662', 'Fraud-Test'
   ) ->> 'balance'),
  '100.00',
  'Rueckbuchung reduziert die Balance um den Einloesungsbetrag'
);

-- 5-6. Retry mit derselben request_id ist die Idempotenz-Wiedergabe und meldet Betrag + Fehlbetrag.
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user', 'PROMO01', '66666666-6666-4666-8666-666666666662', 'Fraud-Test'
   ) ->> 'amount'),
  '100.00',
  'Retry mit derselben request_id meldet denselben rueckgebuchten Betrag'
);
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user', 'PROMO01', '66666666-6666-4666-8666-666666666662', 'Fraud-Test'
   ) ->> 'replayed'),
  'true',
  'Retry mit derselben request_id ist als replayed markiert'
);

-- 7. Zweite Rueckbuchung mit NEUER request_id wird abgewiesen.
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user', 'PROMO01', '66666666-6666-4666-8666-666666666663', 'Fraud-Test'
   ) ->> 'code'),
  'REVERSAL_ALREADY_DONE',
  'zweite Rueckbuchung mit neuer request_id wird abgewiesen'
);

-- 8-11. Ledger-Eintrag: append-only Audit-Zeile mit Rueckbuchungsbetrag und Audit-Vertrag.
SELECT is(
  (SELECT count(*)::text FROM public.wallet_transactions
   WHERE user_id = 'pgtap_promo_user' AND type = 'promo_reversal'),
  '1',
  'genau ein promo_reversal-Ledger-Eintrag trotz Wiederholungsversuchen'
);
SELECT is(
  (SELECT amount::text FROM public.wallet_transactions WHERE type = 'promo_reversal'),
  '-100.00',
  'Ledger-Eintrag traegt den negativen Rueckbuchungsbetrag'
);
SELECT is(
  (SELECT reason FROM public.wallet_transactions WHERE type = 'promo_reversal'),
  'Fraud-Test',
  'Ledger-Eintrag persistiert den Audit-Grund'
);
SELECT is(
  (SELECT actor_id FROM public.wallet_transactions WHERE type = 'promo_reversal'),
  'pgtap_admin',
  'Ledger-Eintrag persistiert den Admin-Akteur'
);

-- 12. Unbekannter Code wird sauber abgelehnt (keine Exception).
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user', 'NOEXIST1', '66666666-6666-4666-8666-666666666665', 'Fraud-Test'
   ) ->> 'code'),
  'REVERSAL_NOT_FOUND',
  'unbekannter Code gibt REVERSAL_NOT_FOUND zurueck'
);

-- 13. Fehlender Audit-Kontext (leerer Grund) wird abgewiesen.
SELECT throws_ok(
  $$ SELECT public.reverse_promo_code(
       'pgtap_admin', 'pgtap_promo_user', 'PROMO01', '66666666-6666-4666-8666-666666666666', '  ') $$,
  'P0001',
  'Admin audit context is required',
  'leerer Grund muss "Admin audit context is required" werfen'
);

-- 14. Request-ID-Kollision: die request_id gehoert bereits einer anderen Wallet-Mutation.
INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, request_id)
VALUES ('pgtap_promo_user', 'bonus', 'bonus', 10.00, 200.00,
        '77777777-7777-4777-8777-777777777777');
SELECT throws_ok(
  $$ SELECT public.reverse_promo_code(
       'pgtap_admin', 'pgtap_promo_user', 'PROMO01', '77777777-7777-4777-8777-777777777777', 'Kollision') $$,
  'P0001',
  'Request ID already belongs to another wallet mutation',
  'fremde request_id muss mit Kollisionsfehler abgewiesen werden'
);

-- 15-19. Clamp auf 0 (CHECK balance >= 0): bereits verspieltes Guthaben -> nur der gedeckte
-- Teil wird gebucht, der Fehlbetrag geht ehrlich in die Metadaten.
SELECT lives_ok(
  $$ SELECT public.redeem_promo_code('pgtap_promo_user2', 'PROMO02', '66666666-6666-4666-8666-666666666667') $$,
  'Einlösung von PROMO02 als Clamp-Fixture (120 -> verspielt auf 20)'
);
UPDATE public.users SET balance = 20.00 WHERE id = 'pgtap_promo_user2';
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user2', 'PROMO02', '66666666-6666-4666-8666-666666666668', 'Verspielt')
   ->> 'amount'),
  '20.00',
  'Clamp: nur der gedeckte Betrag wird rueckgebucht'
);
SELECT is(
  (SELECT public.reverse_promo_code(
     'pgtap_admin', 'pgtap_promo_user2', 'PROMO02', '66666666-6666-4666-8666-666666666668', 'Verspielt')
   ->> 'shortfall'),
  '80.00',
  'Clamp-Retry meldet denselben Fehlbetrag (Idempotenz)'
);
SELECT is(
  (SELECT balance::text FROM public.users WHERE id = 'pgtap_promo_user2'),
  '0.00',
  'Clamp: Balance endet auf genau 0, nie negativ'
);
SELECT is(
  (SELECT metadata ->> 'uncappedShortfall' FROM public.wallet_transactions
   WHERE user_id = 'pgtap_promo_user2' AND type = 'promo_reversal'),
  '80.00',
  'Fehlbetrag ist im Ledger-Metadatum uncappedShortfall persistiert'
);

-- 20-22. L1 Expiry-Job: abgelaufene aktive Codes werden deaktiviert, zukuenftige unangetastet.
SELECT is(
  (SELECT public.deactivate_expired_promo_codes())::text,
  '1',
  'Expiry-Job deaktiviert genau die abgelaufenen aktiven Codes'
);
SELECT is(
  (SELECT active::text FROM public.promo_codes WHERE code = 'EXPIRED1'),
  'false',
  'abgelaufener Code ist nach dem Job inaktiv'
);
SELECT is(
  (SELECT active::text FROM public.promo_codes WHERE code = 'FUTURE1'),
  'true',
  'zukuenftig ablaufender Code bleibt aktiv'
);

SELECT finish();
ROLLBACK;