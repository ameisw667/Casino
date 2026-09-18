-- pgTAP-Laufzeittest fuer den Append-Only-Schutz der wallet_transactions (Saeule 10 N2)
-- Trigger-Funktion: public.guard_wallet_transaction_immutable
-- Kanonische Definition: supabase/migrations/058_reconcile_remote_schema_drift.sql:591
-- Bisher nur statisch per Datei-Assertion geprueft (wallet-ledger-invariants.test.ts) —
-- dieser Laufzeittest beweist den Schutz an der echten Tabelle.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(6);

-- Fixture: genau eine Ledger-Zeile.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_immutable_user', 'pgtap_immutable_user', 100.00);
INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, request_id)
VALUES ('pgtap_immutable_user', 'dice', 'bet', -10.00, 90.00,
        '11111111-1111-4111-8111-111111111111');

-- 1. UPDATE des Geldfeldes amount muss abgewiesen werden.
SELECT throws_ok(
  $$ UPDATE public.wallet_transactions SET amount = -99.00
     WHERE user_id = 'pgtap_immutable_user' AND type = 'bet' $$,
  'P0001',
  'wallet_transactions is append-only',
  'UPDATE von amount muss mit append-only-Fehler abgewiesen werden'
);

-- 2. UPDATE von request_id muss abgewiesen werden.
SELECT throws_ok(
  $$ UPDATE public.wallet_transactions
     SET request_id = '22222222-2222-4222-8222-222222222222'
     WHERE user_id = 'pgtap_immutable_user' AND type = 'bet' $$,
  'P0001',
  'wallet_transactions is append-only',
  'UPDATE von request_id muss abgewiesen werden'
);

-- 3. UPDATE ohne response-Metadatum (z. B. leeres metadata) muss abgewiesen werden.
SELECT throws_ok(
  $$ UPDATE public.wallet_transactions SET metadata = '{}'::jsonb
     WHERE user_id = 'pgtap_immutable_user' AND type = 'bet' $$,
  'P0001',
  'wallet_transactions is append-only',
  'Metadata-Update ohne response-Schluessel muss abgewiesen werden'
);

-- 4. DELETE muss abgewiesen werden.
SELECT throws_ok(
  $$ DELETE FROM public.wallet_transactions WHERE user_id = 'pgtap_immutable_user' $$,
  'P0001',
  'wallet_transactions is append-only',
  'DELETE muss mit append-only-Fehler abgewiesen werden'
);

-- 5. Erlaubter Pfad: der Settlement-Metadaten-Write ('{}' -> mit response-Schluessel) laeuft durch.
SELECT lives_ok(
  $$ UPDATE public.wallet_transactions SET metadata = '{"response": {}}'::jsonb
     WHERE user_id = 'pgtap_immutable_user' AND type = 'bet' $$,
  'Settlement-Metadaten-Write (leeres metadata -> response) muss erlaubt bleiben'
);

-- 6. Negativbeweis-Integritaet: Geldfeld ist nach allen Versuchen unveraendert.
SELECT is(
  ( SELECT amount::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_immutable_user' AND type = 'bet' ),
  '-10.00',
  'kein abgewiesener Versuch darf amount veraendert haben'
);

SELECT * FROM finish();
ROLLBACK;