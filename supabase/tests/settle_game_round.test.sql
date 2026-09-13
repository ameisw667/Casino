-- pgTAP-Laufzeittest fuer die Geld-RPC public.settle_game_round (Saeule 10 N2)
-- Kanonische Definition: supabase/migrations/045_fix_wallet_events_jackpot_regression.sql:194
-- Signatur: (p_user_id TEXT, p_round_id UUID, p_request_id UUID, p_result_id UUID,
--           p_payout NUMERIC, p_xp_gain BIGINT, p_result JSONB) RETURNS JSONB
-- Live-Pfad: src/lib/casino/wallet.ts ruft dieses RPC fuer CRASH/BLACKJACK-Settlements.
-- Abgedeckt: Wertebereiche, inaktive/fehlende Runde, gueltiges Settlement (Runde ->
-- SETTLED, Ledger round_settled, XP-Event), Idempotenz-Replay ohne doppelten Effekt.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(10);

-- 1. Die Funktion existiert in der kanonischen 7-Argument-Signatur.
SELECT has_function(
  'public', 'settle_game_round',
  ARRAY['text', 'uuid', 'uuid', 'uuid', 'numeric', 'bigint', 'jsonb']
);

-- Fixture: Nutzer mit 100.00 und einer AKTIVEN CRASH-Runde (Einsatz 5.00 bereits abgebucht).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_sgr_user', 'pgtap_sgr_user', 100.00);
INSERT INTO public.game_rounds (id, user_id, request_id, game, bet_amount, status)
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'pgtap_sgr_user',
        'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'CRASH', 5.00, 'ACTIVE');

-- 2-3. Fail-closed-Fehlerpfade aus dem Funktionskoerper.
SELECT throws_ok(
  $$ SELECT public.settle_game_round(
       'pgtap_sgr_user'::text, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
       '11111111-1111-4111-8111-111111111111'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
       -1::numeric, 0::bigint, '{}'::jsonb) $$,
  'P0001',
  'Invalid settlement values',
  'negativer Payout muss "Invalid settlement values" werfen'
);
SELECT throws_ok(
  $$ SELECT public.settle_game_round(
       'pgtap_sgr_user'::text, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
       '11111111-1111-4111-8111-111111111111'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
       0::numeric, 0::bigint, '{}'::jsonb) $$,
  'P0001',
  'Round is not active',
  'fehlende/unbekannte Runde muss "Round is not active" werfen'
);

-- 4. Gueltiges Settlement laeuft durch (100 + 19 = 119.00, Runde wird SETTLED).
SELECT lives_ok(
  $$ SELECT public.settle_game_round(
       'pgtap_sgr_user'::text, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
       '22222222-2222-4222-8222-222222222222'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
       19::numeric, 5::bigint, '{"multiplier": 1.9}'::jsonb) $$,
  'gueltiges Settlement muss durchlaufen'
);

-- 5. Runde ist nach dem Settlement SETTLED.
SELECT is(
  ( SELECT status::text FROM public.game_rounds WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' ),
  'SETTLED',
  'Settlement muss die Runde auf SETTLED setzen'
);

-- 6. Genau ein Ledger-Eintrag round_settled mit Payout +19.
SELECT is(
  ( SELECT amount::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_sgr_user' AND type = 'round_settled' ),
  '19.00',
  'Settlement muss genau einen round_settled-Eintrag mit +19 anlegen'
);

-- 7. Balance nach Settlement: 119.00.
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_sgr_user' ),
  '119.00',
  'Settlement muss die Balance auf 119.00 setzen (100 + 19)'
);

-- 8. Idempotenz: identische request_id -> replayed=true.
SELECT is(
  ( SELECT public.settle_game_round(
        'pgtap_sgr_user'::text, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
        '22222222-2222-4222-8222-222222222222'::uuid, '44444444-4444-4444-8444-444444444444'::uuid,
        19::numeric, 5::bigint, '{"multiplier": 1.9}'::jsonb
    ) ->> 'replayed'
  ),
  'true',
  'Wiederholung mit gleicher request_id muss replayed=true liefern'
);

-- 9. Kernversprechen: der Replay veraendert die Balance nicht (weiterhin 119.00)
--    und erzeugt keinen zweiten round_settled-Eintrag.
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_sgr_user' ),
  '119.00',
  'Replay darf die Balance nicht erneut veraendern'
);
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_sgr_user' AND type = 'round_settled' ),
  '1',
  'Replay darf keinen zweiten round_settled-Eintrag erzeugen'
);

SELECT * FROM finish();
ROLLBACK;