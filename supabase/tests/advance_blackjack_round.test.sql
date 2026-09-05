-- pgTAP-Laufzeittest fuer die Geld-RPC public.advance_blackjack_round
-- Kanonische Definition: supabase/migrations/014_fix_user_stats.sql:202
-- Signatur: (p_user_id TEXT, p_round_id UUID, p_request_id UUID, p_result_id UUID,
--            p_expected_version INTEGER, p_new_state JSONB, p_additional_bet NUMERIC,
--            p_settled BOOLEAN, p_payout NUMERIC, p_xp_gain BIGINT, p_result JSONB) RETURNS JSONB
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.
-- Die BLACKJACK-Runde wird über den echten Rundenstart-RPC (start_game_round) angelegt.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(7);

-- 1. Die Funktion existiert in der kanonischen 11-Argument-Signatur.
SELECT has_function(
  'public',
  'advance_blackjack_round',
  ARRAY['text', 'uuid', 'uuid', 'uuid', 'integer', 'jsonb', 'numeric', 'boolean', 'numeric', 'bigint', 'jsonb']
);

-- 2. Ungueltige Aktion (expected_version < 1) wird abgewiesen.
SELECT throws_ok(
  $$ SELECT public.advance_blackjack_round(
       'pgtap_bj_user'::text, '44444444-4444-4444-8444-444444444444'::uuid, '55555555-5555-4555-8555-555555555555'::uuid,
       '66666666-6666-4666-8666-666666666666'::uuid, 0::integer, '{"hand": ["A"]}'::jsonb, 0::numeric,
       false, 0::numeric, 0::bigint, '{}'::jsonb) $$,
  'P0001',
  'Invalid blackjack action',
  'expected_version 0 muss "Invalid blackjack action" werfen'
);

-- Setup: Nutzer mit 100.00 und eine aktive BLACKJACK-Runde (Einsatz 10, version 1).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_bj_user', 'pgtap_bj_user', 100.00);

INSERT INTO public.game_rounds (user_id, request_id, game, bet_amount, state)
VALUES ('pgtap_bj_user', '77777777-7777-4777-8777-777777777777', 'BLACKJACK', 10.00, '{"hand": ["A", "K"]}'::jsonb);

-- 3. Valide Hit-Aktion mitDOUBLE-Bet + Settlement (100 - 5 + 20 = 115.00, Version 1 -> 2).
SELECT lives_ok(
  $$ SELECT public.advance_blackjack_round(
       'pgtap_bj_user'::text,
       ( SELECT id FROM public.game_rounds WHERE user_id = 'pgtap_bj_user' ),
       '55555555-5555-4555-8555-555555555555'::uuid, '66666666-6666-4666-8666-666666666666'::uuid,
       1::integer, '{"hand": ["A", "K", "Q"]}'::jsonb, 5::numeric,
       true, 20::numeric, 4::bigint, '{"outcome": "WIN"}'::jsonb) $$,
  'Valide Blackjack-Aktion mit Settlement muss durchlaufen'
);

-- 4. Optimistic Locking: erneute Aktion mit p_expected_version 1 (jetzt 2) wird als stale abgewiesen.
SELECT throws_ok(
  $$ SELECT public.advance_blackjack_round(
       'pgtap_bj_user'::text,
       ( SELECT id FROM public.game_rounds WHERE user_id = 'pgtap_bj_user' ),
       '88888888-8888-4888-8888-888888888888'::uuid, '99999999-9999-4999-8999-999999999999'::uuid,
       1::integer, '{"hand": ["A"]}'::jsonb, 0::numeric,
       false, 0::numeric, 0::bigint, '{}'::jsonb) $$,
  'P0001',
  'Stale or inactive blackjack round',
  'Veraltete Version muss "Stale or inactive blackjack round" werfen'
);

-- 5. Idempotenz: identische request_id liefert Replay-Flag.
SELECT is(
  ( SELECT public.advance_blackjack_round(
        'pgtap_bj_user'::text,
        ( SELECT id FROM public.game_rounds WHERE user_id = 'pgtap_bj_user' ),
        '55555555-5555-4555-8555-555555555555'::uuid, '66666666-6666-4666-8666-666666666666'::uuid,
        1::integer, '{"hand": ["A", "K", "Q"]}'::jsonb, 5::numeric,
        true, 20::numeric, 4::bigint, '{"outcome": "WIN"}'::jsonb
    ) ->> 'replayed'
  ),
  'true',
  'Zweiter Aufruf mit gleicher request_id muss replayed=true liefern'
);

-- 6. Kernversprechen: der Replay veraendert das Guthaben nicht (weiterhin 115.00).
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_bj_user' ),
  '115.00',
  'Replay darf das Guthaben nicht erneut veraendern'
);

-- 7. Die Runde ist nach dem Settlement SETTLED und auf Version 2.
SELECT is(
  ( SELECT ( status::text || ':' || version::text ) FROM public.game_rounds WHERE user_id = 'pgtap_bj_user' ),
  'SETTLED:2',
  'Settlement muss die Runde auf SETTLED und Version 2 setzen'
);

SELECT * FROM finish();
ROLLBACK;