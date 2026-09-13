-- pgTAP-Laufzeittest fuer die Admin-Geld-RPC public.admin_update_user (Saeule 10 N2)
-- Kanonische Definition: supabase/migrations/058_reconcile_remote_schema_drift.sql:13
-- Signatur: (p_actor_id text, p_target_user_id text, p_request_id uuid, p_reason text,
--           p_balance numeric DEFAULT NULL, p_xp numeric DEFAULT NULL,
--           p_level integer DEFAULT NULL, p_rank text DEFAULT NULL) RETURNS jsonb
-- Abgedeckt: Audit-Kontext-Pflicht, Wertebereiche, unbekanntes Ziel, gueltige Anpassung
-- mit Ledger-Eintrag, Idempotenz-Replay, request_id-Kollision mit fremder Mutation.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(12);

-- 1. Die Funktion existiert in der kanonischen 8-Argument-Signatur.
SELECT has_function(
  'public', 'admin_update_user',
  ARRAY['text', 'text', 'uuid', 'text', 'numeric', 'numeric', 'integer', 'text']
);

INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_admin_target', 'pgtap_admin_target', 100.00);

-- 2-5. Fail-closed-Fehlerpfade aus dem Funktionskoerper.
SELECT throws_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_target', '11111111-1111-4111-8111-111111111111'::uuid, '  ') $$,
  'P0001',
  'Admin audit context is required',
  'leerer Grund muss "Admin audit context is required" werfen'
);
SELECT throws_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_target', '11111111-1111-4111-8111-111111111111'::uuid, 'X',
       -1::numeric) $$,
  'P0001',
  'Invalid balance',
  'negatives Balance-Feld muss "Invalid balance" werfen'
);
SELECT throws_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_target', '11111111-1111-4111-8111-111111111111'::uuid, 'X') $$,
  'P0001',
  'No update fields provided',
  'Aufruf ohne ein einziges Update-Feld muss abgewiesen werden'
);
SELECT throws_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_missing', '11111111-1111-4111-8111-111111111111'::uuid, 'X',
       50::numeric) $$,
  'P0001',
  'Target user not found',
  'unbekanntes Ziel muss "Target user not found" werfen'
);

-- 6. Gueltige Anpassung: Balance 100 -> 150, Ledger-Eintrag admin_adjust mit delta +50.
SELECT lives_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_target', '22222222-2222-4222-8222-222222222222'::uuid,
       'Kompensation', 150::numeric) $$,
  'gueltige Balance-Anpassung muss durchlaufen'
);
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_admin_target' ),
  '150.00',
  'gueltige Anpassung muss die Balance auf 150.00 setzen'
);
SELECT is(
  ( SELECT amount::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_admin_target' AND type = 'admin_adjust' ),
  '50.00',
  'Ledger-Eintrag admin_adjust muss delta +50 tragen'
);

-- 7-8. Idempotenz: identische request_id -> replayed=true, Balance unveraendert.
SELECT is(
  ( SELECT public.admin_update_user(
        'pgtap_admin', 'pgtap_admin_target', '22222222-2222-4222-8222-222222222222'::uuid,
        'Kompensation', 999::numeric
    ) ->> 'replayed'
  ),
  'true',
  'Wiederholung mit gleicher request_id muss replayed=true liefern'
);
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_admin_target' AND type = 'admin_adjust' ),
  '1',
  'Replay darf keinen zweiten admin_adjust-Ledger-Eintrag erzeugen'
);

-- 9. request_id-Kollision: dieselbe request_id gehoert einer fremden (nicht-admin) Mutation.
INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, request_id)
VALUES ('pgtap_admin_target', 'bonus', 'bonus', 10.00, 160.00,
        '33333333-3333-4333-8333-333333333333');
SELECT throws_ok(
  $$ SELECT public.admin_update_user(
       'pgtap_admin', 'pgtap_admin_target', '33333333-3333-4333-8333-333333333333'::uuid, 'Kollision',
       10::numeric) $$,
  'P0001',
  'Request ID already belongs to another wallet mutation',
  'fremde request_id muss mit Kollisionsfehler abgewiesen werden'
);

-- 10. Kernversprechen: die Kollision hat NICHTS veraendert (weiterhin 150.00).
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_admin_target' ),
  '150.00',
  'abgewiesene Kollision darf die Balance nicht veraendern'
);

SELECT * FROM finish();
ROLLBACK;