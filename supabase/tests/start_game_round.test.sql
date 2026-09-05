-- pgTAP-Laufzeittest fuer die Geld-RPC public.start_game_round
-- Kanonische Definition: supabase/migrations/058_reconcile_remote_schema_drift.sql:1138
-- Signatur: (p_user_id text, p_request_id uuid, p_game text, p_amount numeric, p_state jsonb) RETURNS jsonb
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(7);

-- 1. Die Funktion existiert in der kanonischen 5-Argument-Signatur.
SELECT has_function('public', 'start_game_round', ARRAY['text', 'uuid', 'text', 'numeric', 'jsonb']);

-- 2. Ungueltige Werte (Spiel nicht im CRASH/BLACKJACK/CRASH_MULTIPLAYER-Set) werden abgewiesen.
SELECT throws_ok(
  $$ SELECT public.start_game_round(
       'pgtap_round_user'::text, '11111111-1111-4111-8111-111111111111'::uuid,
       'SLOTS'::text, 5::numeric, '{"seed": "abc"}'::jsonb) $$,
  'P0001',
  'Invalid round values',
  'Spiel SLOTS muss "Invalid round values" werfen'
);

-- 3. Valider CRASH-Rundenstart laeuft durch (100 - 5 = 95.00).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_round_user', 'pgtap_round_user', 100.00);

SELECT lives_ok(
  $$ SELECT public.start_game_round(
       'pgtap_round_user'::text, '22222222-2222-4222-8222-222222222222'::uuid,
       'CRASH'::text, 5::numeric, '{"seed": "abc"}'::jsonb) $$,
  'Valider CRASH-Rundenstart muss durchlaufen'
);

-- 4. Race-Guard: eine zweite aktive CRASH-Runde (andere request_id) wird abgewiesen.
SELECT throws_ok(
  $$ SELECT public.start_game_round(
       'pgtap_round_user'::text, '33333333-3333-4333-8333-333333333333'::uuid,
       'CRASH'::text, 5::numeric, '{"seed": "def"}'::jsonb) $$,
  'P0001',
  'Active crash round already exists',
  'Zweite gleichzeitige CRASH-Runde muss abgewiesen werden'
);

-- 5. Idempotenz: identische request_id liefert Replay statt zweiter Runde.
SELECT is(
  ( SELECT public.start_game_round(
        'pgtap_round_user'::text, '22222222-2222-4222-8222-222222222222'::uuid,
        'CRASH'::text, 5::numeric, '{"seed": "abc"}'::jsonb
    ) ->> 'replayed'
  ),
  'true',
  'Zweiter Aufruf mit gleicher request_id muss replayed=true liefern'
);

-- 6. Kernversprechen: der Replay zieht den Einsatz nicht erneut ab (weiterhin 95.00).
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_round_user' ),
  '95.00',
  'Replay darf den Einsatz nicht erneut abziehen'
);

-- 7. Genau eine game_rounds-Zeile fuer die request_id (kein Duplikat durch Replay).
SELECT is(
  ( SELECT count(*)::text FROM public.game_rounds
    WHERE user_id = 'pgtap_round_user' AND request_id = '22222222-2222-4222-8222-222222222222' ),
  '1',
  'Replay darf keine zweite game_rounds-Zeile erzeugen'
);

SELECT * FROM finish();
ROLLBACK;