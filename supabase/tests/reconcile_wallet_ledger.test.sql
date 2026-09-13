-- pgTAP-Laufzeittest fuer die Geld-RPC public.reconcile_wallet_ledger (Saeule 10 N2)
-- Kanonische Definition: supabase/migrations/058_reconcile_remote_schema_drift.sql:723
-- Signatur: (p_user_id text) RETURNS jsonb
-- Abgedeckt: fehlende Baseline (fail-closed), konsistente Ledger-Rechnung, Drift-Erkennung
-- mit wallet_invariant_events-Eintrag, Inkrement der occurrences bei Wiederholung.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(7);

-- 1. Die Funktion existiert in der kanonischen 1-Argument-Signatur.
SELECT has_function('public', 'reconcile_wallet_ledger', ARRAY['text']);

-- Fixtures: Nutzer mit Balance 100 und genau einer Ledger-Zeile (Betrag -10, Balance danach 90).
-- Konsistenter Baseline-Wert: opening = observed - sum(amounts) = 100 - (-10) = 110.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_recon_user', 'pgtap_recon_user', 100.00);
INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after)
VALUES ('pgtap_recon_user', 'dice', 'bet', -10.00, 90.00);
INSERT INTO public.wallet_ledger_baselines (user_id, opening_balance, source)
VALUES ('pgtap_recon_user', 110.00, 'pgtap');

-- Zweitnutzer mit ABWEICHENDER Baseline (100 statt 110) -> erwartete Drift.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_recon_drift', 'pgtap_recon_drift', 100.00);
INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after)
VALUES ('pgtap_recon_drift', 'dice', 'bet', -10.00, 90.00);
INSERT INTO public.wallet_ledger_baselines (user_id, opening_balance, source)
VALUES ('pgtap_recon_drift', 100.00, 'pgtap');

-- 2. Fehlender Nutzer (keine Baseline) wird fail-closed abgewiesen.
SELECT throws_ok(
  $$ SELECT public.reconcile_wallet_ledger('pgtap_recon_missing') $$,
  'P0001',
  'Wallet ledger baseline not found',
  'fehlende Ledger-Baseline muss "Wallet ledger baseline not found" werfen'
);

-- 3-4. Konsistenter Ledger: lives_ok, delta = 0, consistent = true.
SELECT lives_ok(
  $$ SELECT public.reconcile_wallet_ledger('pgtap_recon_user') $$,
  'konsistenter Ledger muss durchlaufen'
);
SELECT is(
  ( SELECT public.reconcile_wallet_ledger('pgtap_recon_user') ->> 'consistent' ),
  'true',
  'Baseline 110 + Ledger -10 muss Balance 100 exakt reproduzieren (consistent=true)'
);

-- 5-6. Drift: abweichende Baseline fuehrt zu consistent=false und einem invariant event.
SELECT is(
  ( SELECT public.reconcile_wallet_ledger('pgtap_recon_drift') ->> 'delta' ),
  '10.00',
  'Baseline 100 vs. erwartete 90 muss delta=10.00 melden'
);
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_invariant_events
    WHERE user_id = 'pgtap_recon_drift' ),
  '1',
  'Drift muss genau einen wallet_invariant_events-Eintrag erzeugen'
);

-- 7. Wiederholte Reconciliation derselben Drift inkrementiert occurrences (kein zweiter Event).
SELECT is(
  ( SELECT occurrences::text FROM public.wallet_invariant_events
    WHERE user_id = 'pgtap_recon_drift'
      AND fingerprint = (SELECT public.reconcile_wallet_ledger('pgtap_recon_drift') ->> 'eventFingerprint') ),
  '2',
  'zweiter Drift-Aufruf muss occurrences auf 2 inkrementieren (kein zweites Event)'
);

SELECT * FROM finish();
ROLLBACK;