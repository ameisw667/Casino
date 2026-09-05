-- pgTAP-Laufzeittest fuer die Geld-RPC public.settle_game_bet
-- Kanonische Definition: supabase/migrations/045_fix_wallet_events_jackpot_regression.sql:99
-- Signatur: (p_user_id TEXT, p_request_id UUID, p_result_id UUID, p_game TEXT,
--            p_amount NUMERIC, p_payout NUMERIC, p_xp_gain BIGINT, p_result JSONB,
--            p_server_seed_hash TEXT DEFAULT NULL, p_nonce INTEGER DEFAULT NULL) RETURNS JSONB
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.
-- Wichtig: Alle 10 Argumente werden explizit uebergeben. Die aeltere 8-Argument-Definition
-- (Migration 014/019, ohne seed-Parameter) existiert weiter als Overload; ein 8-arg-Aufruf
-- waere wegen der DEFAULT-Parameter des 10-arg-Overloads mehrdeutig (SQLSTATE 42725).

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(7);

-- 1. Die Funktion existiert (in der 10-Argument-Signatur mit seed-Parametern).
SELECT has_function(
  'public',
  'settle_game_bet',
  ARRAY['text', 'uuid', 'uuid', 'text', 'numeric', 'numeric', 'bigint', 'jsonb', 'text', 'integer']
);

-- 2. Ungueltige Identitaet (NULL user_id) wird mit P0001 abgewiesen.
SELECT throws_ok(
  $$ SELECT public.settle_game_bet(
       NULL::text, '11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid,
       'DICE'::text, 10::numeric, 0::numeric, 0::bigint, '{}'::jsonb, NULL::text, NULL::integer) $$,
  'P0001',
  'Invalid settlement identity',
  'NULL user_id muss "Invalid settlement identity" werfen'
);

-- 3. Ungueltige Werte (unbekanntes Spiel) werden abgewiesen.
SELECT throws_ok(
  $$ SELECT public.settle_game_bet(
       'pgtap_user_insufficient'::text, '11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid,
       'POKER'::text, 10::numeric, 0::numeric, 0::bigint, '{}'::jsonb, NULL::text, NULL::integer) $$,
  'P0001',
  'Invalid settlement values',
  'Spiel POKER muss "Invalid settlement values" werfen'
);

-- 4. Unzureichendes Guthaben wird abgewiesen.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_user_insufficient', 'pgtap_user_insufficient', 0.00);

SELECT throws_ok(
  $$ SELECT public.settle_game_bet(
       'pgtap_user_insufficient'::text, '11111111-1111-4111-8111-111111111111'::uuid, '22222222-2222-4222-8222-222222222222'::uuid,
       'DICE'::text, 10::numeric, 0::numeric, 0::bigint, '{}'::jsonb, NULL::text, NULL::integer) $$,
  'P0001',
  'Insufficient balance',
  'Settlement ueber Saldo hinaus muss "Insufficient balance" werfen'
);

-- 5. Valides Settlement laeuft durch (100 - 10 + 19 = 109.00).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_user_ok', 'pgtap_user_ok', 100.00);

SELECT lives_ok(
  $$ SELECT public.settle_game_bet(
       'pgtap_user_ok'::text, '33333333-3333-4333-8333-333333333333'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
       'DICE'::text, 10::numeric, 19::numeric, 5::bigint, '{"roll": 42}'::jsonb, NULL::text, NULL::integer) $$,
  'Valides Settlement muss durchlaufen'
);

-- 6. Idempotenz: identisches (user_id, request_id) zweimal -> Replay-Flag, kein doppelter Effekt.
SELECT is(
  ( SELECT public.settle_game_bet(
        'pgtap_user_ok'::text, '33333333-3333-4333-8333-333333333333'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
        'DICE'::text, 10::numeric, 19::numeric, 5::bigint, '{"roll": 42}'::jsonb, NULL::text, NULL::integer
    ) ->> 'replayed'
  ),
  'true',
  'Zweiter Aufruf mit gleicher request_id muss replayed=true liefern'
);

-- 7. Kernversprechen: der Replay veraendert den Kontostand nicht (weiterhin 109.00).
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_user_ok' ),
  '109.00',
  'Replay darf den Kontostand nicht erneut veraendern'
);

SELECT * FROM finish();
ROLLBACK;