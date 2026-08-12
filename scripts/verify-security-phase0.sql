-- Phase-0 Security Audit — Supabase SQL Editor
-- Projekt: Casino Royale · Stand: 2026-08-10
--
-- Ausführung: Jeden Block einzeln im Supabase SQL Editor ausführen.
-- Block A und B sind vollständig read-only.
-- Block C schreibt nur innerhalb einer Transaktion und endet zwingend mit ROLLBACK.
-- Niemals die Ausgabe von server_seed kopieren oder speichern.

-- ============================================================================
-- A — Read-only: Migration-019-Objekte, RLS und Grants
-- Erwartung: alle required_* Spalten sind true; anon/authenticated haben kein
-- SELECT auf seeds und keinen EXECUTE-Zugriff auf consume_active_seed.
-- ============================================================================
SELECT
  EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') AS required_pgcrypto_installed,
  to_regclass('public.seed_consumptions') IS NOT NULL AS required_seed_consumptions_exists,
  to_regclass('public.seed_history') IS NOT NULL AS required_seed_history_exists,
  EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'seeds' AND rowsecurity
  ) AS required_seeds_rls_enabled,
  EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'seed_history' AND rowsecurity
  ) AS required_seed_history_rls_enabled,
  NOT has_table_privilege('anon', 'public.seeds', 'SELECT') AS required_anon_cannot_read_seeds,
  NOT has_table_privilege('authenticated', 'public.seeds', 'SELECT') AS required_authenticated_cannot_read_seeds,
  has_table_privilege('authenticated', 'public.seed_history', 'SELECT') AS required_authenticated_can_read_own_history,
  NOT has_function_privilege('anon', 'public.consume_active_seed(text,uuid)', 'EXECUTE') AS required_anon_cannot_consume_seed,
  NOT has_function_privilege('authenticated', 'public.consume_active_seed(text,uuid)', 'EXECUTE') AS required_authenticated_cannot_consume_seed,
  has_function_privilege('service_role', 'public.consume_active_seed(text,uuid)', 'EXECUTE') AS required_service_role_can_consume_seed;

-- ============================================================================
-- B — Read-only: RLS policy + eingesetzter Advisory Lock in der Funktion
-- Erwartung: seed_history_select_own vorhanden; die Funktion enthält
-- pg_advisory_xact_lock und den user-id-basierten Lock-Key.
-- ============================================================================
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('seeds', 'seed_history')
ORDER BY tablename, policyname;

SELECT
  p.proname,
  position('pg_advisory_xact_lock(hashtextextended(p_user_id, 0))' IN p.prosrc) > 0
    AS required_user_lock_present,
  position('seed_consumptions' IN p.prosrc) > 0
    AS required_idempotency_ledger_present
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'consume_active_seed';

-- ============================================================================
-- C — Optional: Service-Role-RPC-Idempotenz, ohne persistente Änderungen
-- Vorbedingung: SQL Editor zeigt oben "Role postgres" oder "service_role".
-- Erwartung: first_replayed = false, second_replayed = true, gleiche Nonce.
-- Der Audit-User, sein Seed und alle Konsum-Ledger-Zeilen werden mit ROLLBACK
-- verworfen. Die Query gibt weder server_seed noch Zugangsdaten aus.
-- ============================================================================
BEGIN;

CREATE TEMP TABLE phase0_audit_context (
  user_id TEXT NOT NULL,
  request_id UUID NOT NULL
) ON COMMIT DROP;

INSERT INTO phase0_audit_context (user_id, request_id)
VALUES ('phase0_audit_ephemeral', gen_random_uuid());

INSERT INTO public.users (id, username, balance)
VALUES ('phase0_audit_ephemeral', 'phase0_audit_ephemeral', 10000.00)
ON CONFLICT (id) DO NOTHING;

WITH first_call AS (
  SELECT public.consume_active_seed(c.user_id, c.request_id) AS result
  FROM phase0_audit_context c
)
SELECT
  (result ->> 'replayed')::boolean AS first_replayed,
  (result ->> 'nonce')::integer AS first_nonce,
  length(result ->> 'serverSeedHash') = 64 AS first_hash_is_sha256_length
FROM first_call;

WITH second_call AS (
  SELECT public.consume_active_seed(c.user_id, c.request_id) AS result
  FROM phase0_audit_context c
)
SELECT
  (result ->> 'replayed')::boolean AS second_replayed,
  (result ->> 'nonce')::integer AS second_nonce,
  length(result ->> 'serverSeedHash') = 64 AS second_hash_is_sha256_length
FROM second_call;

ROLLBACK;

-- ============================================================================
-- D — Optional: Advisory-Lock-Warteprobe in zwei unabhängigen Browser-
-- Seiten/Fenstern mit dem SQL Editor. Wichtig: Nicht zwei `Untitled query`-
-- Reiter innerhalb derselben SQL-Editor-Seite; diese teilen die Ausführung.
-- Diese Probe verändert keine Anwendungstabelle.
-- 1. Block D1 in der ersten Browser-Seite starten, aber nicht auf sein Ergebnis warten.
-- 2. Sofort Block D2 in der zweiten Browser-Seite starten.
-- Erwartung: D2 liefert während D1 `true`. Damit ist die Sperrsemantik des
-- gleichen user-id-basierten Lock-Keys real nachgewiesen. Keine Ergebnisse mit
-- IDs aus der Produktionsnutzung mischen.
-- ============================================================================

-- D1 — Tab 1
-- BEGIN;
-- SELECT pg_advisory_xact_lock(hashtextextended('phase0_lock_probe', 0));
-- SELECT pg_sleep(60);
-- COMMIT;

-- D2 — Tab 2
-- Dieser Nachweis liefert exakt einen Boolean statt mehrerer Zeitwerte.
-- Erwartung bei laufendem D1: lock_is_held_by_another_session = true.
-- Der transaktionsgebundene Try-Lock wird bei einem unerwarteten Erfolg am
-- Ende dieses Statements automatisch wieder freigegeben.
-- SELECT NOT pg_try_advisory_xact_lock(
--   hashtextextended('phase0_lock_probe', 0)
-- ) AS lock_is_held_by_another_session;

-- ============================================================================
-- E — Optional: functional authenticated-RLS probe for seed_history
-- Vorbedingung: SQL Editor ist als postgres/service_role geöffnet.
-- Erwartung: own_history_rows = 1, other_history_rows = 0.
-- Diese Probe erzeugt nur Testdaten innerhalb der Transaktion und verwirft sie
-- mit ROLLBACK. Sie zeigt weder einen echten noch einen aktiven Server-Seed.
-- Falls SET LOCAL ROLE authenticated abgelehnt wird, Ergebnis dokumentieren;
-- nichts persistieren und nicht mit einem echten Nutzerkonto improvisieren.
-- ============================================================================
-- F — Read-only: P0.2 Rollenmatrix für wirtschaftliche und Seed-Objekte
-- Erwartung: RLS ist für jede Tabelle aktiv. Tabellenrechte allein entscheiden
-- noch nicht über wirksame Mutationen; dafür die zugehörigen pg_policies lesen.
-- Jede `required_*_cannot_execute`-Spalte muss true sein. Insbesondere darf
-- `get_or_create_user_seed` für anon/authenticated nicht ausführbar sein.
-- Die Abfrage gibt ausschließlich Objekt- und Rechte-Metadaten aus.
WITH protected_tables(table_name) AS (
  VALUES
    ('users'),
    ('wallet_transactions'),
    ('game_sessions'),
    ('game_rounds'),
    ('seeds'),
    ('seed_consumptions'),
    ('seed_history')
)
SELECT
  table_name,
  EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = protected_tables.table_name AND rowsecurity
  ) AS required_rls_enabled,
  NOT (
    has_table_privilege('anon', format('public.%I', table_name), 'INSERT') OR
    has_table_privilege('anon', format('public.%I', table_name), 'UPDATE') OR
    has_table_privilege('anon', format('public.%I', table_name), 'DELETE')
  ) AS required_anon_no_direct_mutation,
  NOT (
    has_table_privilege('authenticated', format('public.%I', table_name), 'INSERT') OR
    has_table_privilege('authenticated', format('public.%I', table_name), 'UPDATE') OR
    has_table_privilege('authenticated', format('public.%I', table_name), 'DELETE')
  ) AS required_authenticated_no_direct_mutation
FROM protected_tables
ORDER BY table_name;

SELECT
  p.oid::regprocedure AS function_name,
  NOT has_function_privilege('anon', p.oid, 'EXECUTE') AS required_anon_cannot_execute,
  NOT has_function_privilege('authenticated', p.oid, 'EXECUTE') AS required_authenticated_cannot_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'place_bet',
    'settle_bet',
    'start_game_round',
    'settle_game_round',
    'advance_blackjack_round',
    'get_or_create_user_seed',
    'consume_active_seed',
    'rotate_user_seed',
    'redeem_promo_code'
  )
ORDER BY p.oid::regprocedure::text;

-- E — Optional: functional authenticated-RLS probe for seed_history
-- The functional probe below creates test data only inside its transaction.
BEGIN;

INSERT INTO public.users (id, username, balance)
VALUES ('phase0_authenticated_audit', 'phase0_authenticated_audit', 10000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.seed_history (
  user_id, server_seed, server_seed_hash, client_seed, nonce_at_rotation
) VALUES (
  'phase0_authenticated_audit',
  'audit-only-revealed-seed',
  repeat('a', 64),
  'audit-only-client-seed',
  0
);

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"phase0_authenticated_audit","role":"authenticated"}';

SELECT count(*) AS own_history_rows
FROM public.seed_history
WHERE user_id = 'phase0_authenticated_audit';

SET LOCAL request.jwt.claims = '{"sub":"phase0_authenticated_other","role":"authenticated"}';

SELECT count(*) AS other_history_rows
FROM public.seed_history
WHERE user_id = 'phase0_authenticated_audit';

ROLLBACK;
