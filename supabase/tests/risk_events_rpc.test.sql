-- pgTAP-Laufzeittest fuer die Admin-Fraud-RPCs (06_9 L5 — F10):
--   public.record_risk_event           (Kanonische Definition: supabase/migrations/062_bot_signal_types.sql:29)
--   public.review_risk_event           (Kanonische Definition: supabase/migrations/065_risk_event_reopened_status.sql)
--   public.try_acquire_fraud_scan_lock (supabase/migrations/030_fraud_signal_detection.sql:251)
-- Abgedeckt: erster/wiederholter Auftreten (occurrences/replayed), Scan-Lock-Erwerb,
-- Staleness-Fallback, Status-Übergänge inkl. des neuen `reopened`-Status
-- (closed/reviewed -> reopened erlaubt, open -> reopened abgewiesen).
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(20);

-- FK-Fixture: risk_events.subject_user_id referenziert public.users(id).
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_risk_user', 'pgtap_risk_user', 100.00);

-- 1-3. Die Funktionen existieren in den erwarteten Signaturen.
SELECT has_function(
  'public', 'record_risk_event',
  ARRAY['text', 'text', 'text', 'text', 'timestamptz', 'jsonb']
);
SELECT has_function(
  'public', 'review_risk_event',
  ARRAY['uuid', 'text', 'text', 'text']
);
SELECT has_function('public', 'try_acquire_fraud_scan_lock', ARRAY['text', 'integer']);

-- 4-7. Erstes Auftreten: occurrences=1; Wiederholung desselben Fingerprints:
-- occurrences=2, replayed=true (Upsert-Inkrement, kein zweites Event).
SELECT is(
  (SELECT public.record_risk_event(
     'pgtap_risk_user', 'rate_limit_hit', 'high', 'pgtap_fp_1', now(), '{"windowKey": "a"}'::jsonb
   ) ->> 'occurrences'),
  '1',
  'erster Auftreten eines Fingerprints zaehlt occurrences=1'
);
SELECT is(
  (SELECT public.record_risk_event(
     'pgtap_risk_user', 'rate_limit_hit', 'high', 'pgtap_fp_1', now(), '{"windowKey": "a"}'::jsonb
   ) ->> 'replayed'),
  'true',
  'wiederholtes Auftreten ist replayed=true'
);
SELECT is(
  (SELECT count(*)::text FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
  '1',
  'Wiederholung erzeugt KEIN zweites Event (Upsert, kein Insert)'
);
SELECT is(
  (SELECT occurrences::text FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
  '2',
  'Wiederholung inkrementiert occurrences auf 2'
);

-- 8. Unbekannter Signaltyp wird mit P0001 abgewiesen.
SELECT throws_ok(
  $$ SELECT public.record_risk_event(
       'pgtap_risk_user', 'nicht_ein_signal', 'high', 'pgtap_fp_x', now(), '{}'::jsonb) $$,
  'P0001',
  'Invalid risk event',
  'unbekannter signal_type muss "Invalid risk event" werfen'
);

-- Fixture fuer Test 12 (offenes Event, damit der abgewiesene reopen-Uebergang greift).
SELECT lives_ok(
  $$ SELECT public.record_risk_event(
       'pgtap_risk_user', 'rate_limit_hit', 'low', 'pgtap_fp_2', now(), '{"windowKey": "b"}'::jsonb) $$,
  'zweites Event (Status open) fuer den abgewiesenen reopen-Versuch'
);

-- 9-11. Status-Übergänge: open -> reviewed -> closed -> reopened.
SELECT is(
  (SELECT public.review_risk_event(
     (SELECT id FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
     'pgtap_reviewer', 'reviewed', 'Erste Pruefung') ->> 'status'),
  'reviewed',
  'open -> reviewed ist ein gueltiger Uebergang'
);
SELECT is(
  (SELECT public.review_risk_event(
     (SELECT id FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
     'pgtap_reviewer', 'closed', 'Fehlalarm bestaetigt') ->> 'status'),
  'closed',
  'reviewed -> closed ist ein gueltiger Uebergang'
);
SELECT is(
  (SELECT public.review_risk_event(
     (SELECT id FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
     'pgtap_reopener', 'reopened', 'Zu Unrecht geschlossen') ->> 'status'),
  'reopened',
  'closed -> reopened ist ein gueltiger Uebergang (06_9 L3)'
);
SELECT is(
  (SELECT status FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
  'reopened',
  'reopened-Status ist in der Tabelle persistiert'
);

-- 12. open -> reopened wird abgewiesen (ungueltiger Uebergang).
SELECT throws_ok(
  $$ SELECT public.review_risk_event(
       (SELECT id FROM public.risk_events WHERE fingerprint = 'pgtap_fp_2'),
       'pgtap_reviewer', 'reopened', 'Darf nicht funktionieren') $$,
  'P0001',
  'Invalid risk transition',
  'open -> reopened muss "Invalid risk transition" werfen'
);

-- 13. Unbekannter Status wird mit "Invalid risk review" abgewiesen.
SELECT throws_ok(
  $$ SELECT public.review_risk_event(
       (SELECT id FROM public.risk_events WHERE fingerprint = 'pgtap_fp_1'),
       'pgtap_reviewer', 'bogus', 'Grund') $$,
  'P0001',
  'Invalid risk review',
  'unbekannter p_status muss "Invalid risk review" werfen'
);

-- 14. Unbekannte Event-ID wirft "Risk event not found".
SELECT throws_ok(
  $$ SELECT public.review_risk_event(
       '11111111-1111-4111-8111-111111111111'::uuid, 'pgtap_reviewer', 'reviewed', 'Grund') $$,
  'P0001',
  'Risk event not found',
  'unbekannte event_id muss "Risk event not found" werfen'
);

-- 15-18. Scan-Lock: Erwerb nach Release, Ablehnung bei frischer Sperre,
-- Staleness-Fallback nach simuliertem Ablauf.
SELECT public.release_fraud_scan_lock();
SELECT is(
  public.try_acquire_fraud_scan_lock('pgtap_admin', 5),
  true,
  'Lock-Erwerb nach Release erfolgreich'
);
SELECT is(
  public.try_acquire_fraud_scan_lock('pgtap_admin_2', 5),
  false,
  'zweiter Erwerb bei frischer Sperre abgelehnt'
);
SELECT lives_ok(
  $$ UPDATE public.fraud_scan_lock SET locked_at = now() - interval '10 minutes' WHERE id = true $$,
  'Lock auf 10 Minuten alteriert (Staleness-Simulation)'
);
SELECT is(
  public.try_acquire_fraud_scan_lock('pgtap_admin_3', 5),
  true,
  'Staleness-Fallback: ueberholte Sperre wird uebernommen'
);

SELECT finish();
ROLLBACK;