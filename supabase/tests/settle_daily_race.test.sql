-- pgTAP-Laufzeittest fuer die Prize-Geld-RPC public.settle_daily_race (Saeule 10 N2)
-- Kanonische Definition: supabase/migrations/060_pg_cron_retry_failure_handling.sql:467
-- (Overload ohne Argument :567 delegiert auf (now()::date - 1))
-- Signatur: (p_race_date DATE) RETURNS JSONB
-- Abgedeckt: Pflicht-Argument, Winner-Settlement (5000.00 Platz 1), winners-Datensatz,
-- Replay als alreadySettled (keine doppelte Auszahlung), leere Race ohne Gewinner.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(10);

-- 1. Die Funktion existiert in beiden kanonischen Signaturen.
SELECT has_function('public', 'settle_daily_race', ARRAY['date']);
SELECT has_function('public', 'settle_daily_race', ARRAY[]::text[]);

-- 2. Pflicht-Argument: NULL-Datum wird abgewiesen.
SELECT throws_ok(
  $$ SELECT public.settle_daily_race(NULL::date) $$,
  'P0001',
  'race date is required',
  'NULL race_date muss "race date is required" werfen'
);

-- Fixture: Nutzer + eine SETTLED game_rounds-Zeile im Race-Fenster (bet_amount 20.00).
-- Window-Logik: game_rounds mit status='SETTLED' und updated_at im Tagesfenster.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_race_user', 'pgtap_race_user', 100.00);
INSERT INTO public.game_rounds (id, user_id, request_id, game, bet_amount, status, updated_at)
VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'pgtap_race_user',
        'ccccccc1-cccc-4ccc-8ccc-cccccccccccc', 'CRASH', 20.00, 'SETTLED',
        '2026-09-10 12:00:00+00');

-- 3-4. Settlement laeuft durch; Platz 1 zahlt 5000.00 aus.
SELECT lives_ok(
  $$ SELECT public.settle_daily_race('2026-09-10'::date) $$,
  'gueltiges Race-Settlement muss durchlaufen'
);
SELECT is(
  ( SELECT balance::text FROM public.users WHERE id = 'pgtap_race_user' ),
  '5100.00',
  'Platz 1 muss 5000.00 Preisgeld erhalten (100 -> 5100)'
);
SELECT is(
  ( SELECT prize::text FROM public.daily_race_winners
    WHERE race_date = '2026-09-10' AND rank = 1 ),
  '5000.00',
  'daily_race_winners muss Platz 1 mit 5000.00 prize verzeichnen'
);

-- 5. Replay: zweiter Aufruf mit gleichem Datum ist alreadySettled (keine doppelte Auszahlung).
SELECT is(
  ( SELECT public.settle_daily_race('2026-09-10'::date) ->> 'alreadySettled' ),
  'true',
  'wiederholtes Settlement mit gleichem Datum muss alreadySettled=true liefern'
);

-- 6. Kernversprechen: kein zusaetzlicher Auszahlungs-Ledger-Eintrag durch den Replay.
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_transactions
    WHERE user_id = 'pgtap_race_user'
      AND metadata ->> 'source' = 'daily_race' ),
  '1',
  'Replay darf keinen zweiten daily_race-Ledger-Eintrag erzeugen'
);

-- 7. Leere Race: Tag ohne Beteiligung liefert keine Gewinner.
SELECT is(
  ( SELECT public.settle_daily_race('2026-09-11'::date) ->> 'winners' ),
  '[]',
  'Race-Tag ohne Beteiligung muss leere winners-Liste liefern'
);

-- 8. Die leere Race ist trotzdem als teilgenommen markiert (0 Teilnehmer, 0 Volumen).
SELECT is(
  ( SELECT participant_count::text FROM public.daily_races WHERE race_date = '2026-09-11' ),
  '0',
  'leere Race muss mit participant_count=0 registriert sein'
);

SELECT * FROM finish();
ROLLBACK;