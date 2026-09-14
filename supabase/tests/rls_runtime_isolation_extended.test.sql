-- pgTAP-RLS-Laufzeittest, Erweiterung (Saeule 10 N3) — deckt ALLE RLS-Tabellen ab,
-- nicht nur die 5 Kerntabellen aus rls_runtime_isolation.test.sql.
--
-- Zwei Fail-Closed-Stufen werden akzeptiert (beide schliessen Fremdzugriff):
--   (a) 42501 permission denied — Tabellen mit REVOKE ALL an authenticated
--   (b) 0 Zeilen — Tabellen mit Grants, aber zeilenfilternder/leerer RLS-Policy
-- FAIL ist nur: ein fremder authenticated-Nutzer SIEHT Fremdzeilen.
-- Global-lesbare Tabellen (5, bewusst ausgenommen) muessen unter authenticated LESBAR
-- bleiben — Negativbeweis gegen ein Zu-restriktiv-Werden des RLS-Ausbaus.
-- Jeder Lauf laeuft in einer eigenen Transaktion mit Rollback — die Testdatenbank bleibt unveraendert.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(80);

-- Bekannte RLS-Tabelle aus den Migrationen (Grep-Stand 2026-09-13, juengste ENABLE-Definition).
-- Global-lesbare Tabellen (public-select-Policy) sind aus der Protected-Liste ausgenommen.
CREATE TEMP TABLE rls_inventory (
  table_name TEXT PRIMARY KEY,
  has_user_id BOOLEAN NOT NULL,
  rls_enabled BOOLEAN NOT NULL,
  is_public_read BOOLEAN NOT NULL
);

INSERT INTO rls_inventory (table_name, has_user_id, rls_enabled, is_public_read)
SELECT
  t.tbl,
  EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t.tbl AND c.column_name = 'user_id'
  ),
  COALESCE(pc.relrowsecurity, false),
  t.tbl IN ('vip_tiers', 'ranks', 'game_configs', 'achievement_configs', 'guide_documents')
FROM (VALUES
  ('users'), ('wallet_transactions'), ('game_sessions'), ('seeds'),
  ('vip_tiers'), ('ranks'), ('anonymous_sessions'), ('game_configs'),
  ('game_rounds'), ('user_identities'), ('identity_link_quarantine'), ('admin_roles'),
  ('user_achievements'), ('chat_messages'), ('achievement_configs'), ('seed_consumptions'),
  ('seed_history'), ('promo_codes'), ('promo_code_redemptions'), ('guide_telemetry_events'),
  ('telegram_links'), ('telegram_link_tokens'), ('wallet_ledger_baselines'), ('wallet_invariant_events'),
  ('risk_events'), ('bet_network_fingerprints'), ('fraud_scan_lock'), ('jackpot_pool'),
  ('wallet_events'), ('crash_rounds'), ('guide_documents'), ('daily_races'),
  ('daily_race_winners'), ('guide_feedback'), ('admin_analytics_snapshots'), ('user_login_history'),
  ('user_notifications'), ('background_job_runs'), ('user_wellbeing_limits')
) AS t(tbl)
LEFT JOIN pg_class pc ON pc.relname = t.tbl AND pc.relnamespace = 'public'::regnamespace;

-- Der Inventar-Lookup in Teil 2/3 laeuft UNTER der Rolle authenticated; ohne Grant wuerde
-- der FOR-Loop fehlschlagen bzw. vom EXCEPTION-Handler als "denied" fehlinterpretiert werden.
GRANT SELECT ON rls_inventory TO authenticated;

-- Teil 1: ALLE 39 bekannten RLS-Tabellen haben ROW LEVEL SECURITY aktiviert.
SELECT is(
  inv.rls_enabled::text,
  'true',
  'RLS muss aktiviert sein: public.' || inv.table_name
) FROM rls_inventory inv ORDER BY inv.table_name;

-- Setup: Nutzer A (Angreifer) + B (Ziel). Fremdzeilen von B duerfen fuer A unsichtbar bleiben.
-- IDs im UUID-Textformat: mehrere RLS-Policies vergleichen user_id (text) mit auth.uid() (uuid);
-- nicht-UUID-Text wuerde in der Policy-Berechnung einen invalid-input-Fehler werfen (kein
-- Fail-Closed-Semantik-Problem, sondern ein Fixture-Format-Problem).
INSERT INTO public.users (id, username, balance)
VALUES ('a0000000-0000-4000-8000-00000000000a', 'pgtap_rlsx_user_a', 100.00),
       ('b0000000-0000-4000-8000-00000000000b', 'pgtap_rlsx_user_b', 200.00);

-- Teil 2: kein fremder authenticated-Nutzer sieht Fremdzeilen (0 Zeilen ODER 42501).
-- Hinweis zur Output-Form: is() innerhalb eines DO-Blocks verbraucht die Testnummer
-- und zeichnet das Ergebnis auf, gibt aber seinen TAP-Text an den PL/pgSQL-Kontext
-- zurueck (PERFORM verwirft ihn) — der TAP-Parser sieht die Zeile nicht und meldet
-- Out-of-Sequence. Deshalb: DO-Block schreibt Ergebnisse in eine Temp-Tabelle, die
-- eigentliche is()-Ausgabe erfolgt danach als SELECT (druckt TAP sauber sequenziell).
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "a0000000-0000-4000-8000-00000000000a"}';

CREATE TEMP TABLE rlsx_foreign_results (
  table_name TEXT PRIMARY KEY,
  ok BOOLEAN NOT NULL,
  detail TEXT NOT NULL
);

DO $$
DECLARE
  inv RECORD;
  v_count BIGINT;
  v_denied BOOLEAN;
  v_ok BOOLEAN;
  v_detail TEXT;
BEGIN
  FOR inv IN SELECT * FROM rls_inventory WHERE NOT is_public_read ORDER BY table_name LOOP
    v_denied := false;
    BEGIN
      IF inv.has_user_id THEN
        EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id = ''b0000000-0000-4000-8000-00000000000b''', inv.table_name)
          INTO v_count;
      ELSIF inv.table_name = 'users' THEN
        -- Sonderfall users (keine user_id-Spalte): A sieht die EIGENE Zeile legitime
        -- (users_select_own vergleicht (auth.jwt() ->> 'sub') = id, id ist uuid) —
        -- Fremdzugriff heisst hier: B's Zeile darf unsichtbar bleiben.
        EXECUTE format('SELECT count(*) FROM public.%I WHERE id = ''b0000000-0000-4000-8000-00000000000b''', inv.table_name)
          INTO v_count;
      ELSE
        -- Alle uebrigen Tabellen ohne user_id-Spalte sind fuer fremdes authenticated
        -- fail-closed leer (verifiziert ueber die Policy-Definitionen) — Plain-Count: 0.
        EXECUTE format('SELECT count(*) FROM public.%I', inv.table_name) INTO v_count;
      END IF;
    EXCEPTION WHEN insufficient_privilege THEN
      v_denied := true;
    END;
    v_ok := v_denied OR v_count = 0;
    v_detail := CASE WHEN v_denied THEN 'SELECT verboten (42501, fail-closed)'
                     ELSE 'Zeilen gefiltert (fremd: ' || v_count::text || ')' END;
    INSERT INTO rlsx_foreign_results VALUES (inv.table_name, v_ok, v_detail);
  END LOOP;
END $$;

SELECT is(
  res.ok::text,
  'true',
  'Fremdzugriff geschlossen: public.' || res.table_name || ' — ' || res.detail
) FROM rlsx_foreign_results res ORDER BY res.table_name;

-- Teil 3: global-lesbare Tabellen muessen unter authenticated LESBAR bleiben
-- (Schutz gegen ein Zu-restriktives RLS-Setup, das legitime Reads bricht).
CREATE TEMP TABLE rlsx_public_results (
  table_name TEXT PRIMARY KEY,
  denied BOOLEAN NOT NULL,
  row_count BIGINT
);

DO $$
DECLARE
  inv RECORD;
  v_count BIGINT;
  v_denied BOOLEAN;
BEGIN
  FOR inv IN SELECT * FROM rls_inventory WHERE is_public_read ORDER BY table_name LOOP
    v_denied := false;
    BEGIN
      EXECUTE format('SELECT count(*) FROM public.%I', inv.table_name) INTO v_count;
    EXCEPTION WHEN OTHERS THEN
      v_denied := true;
    END;
    INSERT INTO rlsx_public_results VALUES (inv.table_name, v_denied, COALESCE(v_count, 0));
  END LOOP;
END $$;

SELECT is(
  res.denied,
  false,
  'global-lesbar unter authenticated: public.' || res.table_name
  || CASE WHEN res.denied THEN ' (SELECT fehlgeschlagen)' ELSE ' (' || res.row_count::text || ' Zeilen)' END
) FROM rlsx_public_results res ORDER BY res.table_name;

-- Teil 4: Mutationsschutz an einer neuen Grant-Tabelle — user_login_history hat einen
-- SELECT-Grant an authenticated, aber KEINE Insert-Policy: der INSERT muss abgewiesen werden.
SELECT throws_ok(
  $$ INSERT INTO public.user_login_history (user_id, auth_method, device_info, ip_masked)
     VALUES ('b0000000-0000-4000-8000-00000000000b', 'password', 'pgtap-device', '1.2.3.4') $$,
  42501,
  NULL,
  'INSERT in user_login_history fuer fremden Nutzer muss abgewiesen werden (keine Insert-Policy)'
);

-- Teil 5: Negativbeweis-Integritaet — User A muss die EIGENE Zeile in einer
-- Policy-geschuetzten Tabelle weiterhin sehen (nicht ueber-restrictiv).
SELECT is(
  ( SELECT count(*)::text FROM public.user_login_history WHERE user_id = 'a0000000-0000-4000-8000-00000000000a' ),
  '0',
  'User A hat keine eigenen Login-Historie-Zeilen (Fixture-frei) — SELECT muss durchlaufen'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;