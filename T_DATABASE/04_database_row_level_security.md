# 04 — Row-Level-Security: Policy-Design & Abdeckung

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** RLS-Policy-**Design und -Abdeckung** (welche Tabellen haben RLS/Policy/REVOKE, ist das vollständig und korrekt dokumentiert). **Nicht Scope:** Laufzeit-Testing von RLS — das baut bereits `T_DATABASE/10_database_testschicht_pgtap.md` (echter `SET ROLE`-pgTAP-Test).

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1, 2 und 3 vollständig. **Guter Ausgangsbefund:** RLS-Enable-Abdeckung ist bereits 100 % (39/39 Tabellen) — kein Blindspot bei sensiblen Daten gefunden. Die Lücken liegen bei Doku-Genauigkeit, fehlender Matrix/Automatisierung und 4 konkreten REVOKE-Inkonsistenzen.
2. Beginne bei L1. Kein Meilenstein braucht Jan.
3. Diese Datei überschneidet sich **nicht** mit Säule 10 (`T_DATABASE/10_database_testschicht_pgtap.md`) — dort geht es um einen echten Laufzeittest, hier um Policy-Vollständigkeit und -Dokumentation.
4. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L1 | Doku-Korrektur (28→39 Denominator, Status-Header) | 🔴 geplant | `docs/database/04` korrigieren | LLM | Nein |
| L2 | Vollständige RLS-Coverage-Matrix generieren (Skript) | 🔴 geplant | `scripts/audit-rls-coverage.ts` | LLM | Nein |
| L3 | CI-Gate: neue Tabelle ohne RLS schlägt fehl | 🔴 geplant | Aufbau auf L2 | LLM | Nein |
| L4 | 4 REVOKE-Lücken schließen (echter Fund) | 🔴 geplant | Neue Migration | LLM | Nein |

**Warum kein Jan-Gate nötig ist:** L1–L3 sind Doku-/CI-Arbeit. L4 ist ein echter Fund, aber die Behebung (fehlende `REVOKE`-Statements ergänzen) folgt demselben Standard-K3/K4-Prozess wie jede andere neue Migration in diesem Projekt — keine neue Besonderheit.

---

## 2 — Row-Level-Security in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 4 | Vollständige RLS-Matrix-Dokumentation | **Top 90 %** | 🔴 | Keine einzige Datei im Repo listet alle 39 Tabellen mit Enable/Policy/REVOKE-Status — muss jedes Mal neu per Grep zusammengesucht werden |
| 5 | CI-/Lint-Automatisierung "neue Tabelle braucht RLS" | **Top 85 %** | 🔴 | Kein Gate; der bestehende Vitest-Test ist hartcodiert auf benannte Migrationsdateien, erkennt keine neue Tabelle automatisch |
| 3 | Doku-Korrektheit (Coverage-Verhältnis) | **Top 80 %** | 🔴 | Doku nennt "13 von 28" — real 13 von **39** RLS-Tabellen haben eine Policy; Nenner seit Migration 029+ nie aktualisiert |
| 6 | Policy-/Migrations-Kommentar-Genauigkeit | **Top 75 %** | 🔴 | Kommentar in `046_admin_analytics_snapshot.sql:20` behauptet fälschlich Parität mit `risk_events`/`jackpot_pool`, die (anders als diese Tabelle) echtes `REVOKE` haben |
| 2 | REVOKE-Backstop-Konsistenz (Defense-in-Depth) | **Top 60 %** | 🟡 | 4 von 39 Tabellen (`chat_messages`, `daily_races`, `daily_race_winners`, `admin_analytics_snapshots`) haben RLS ohne begleitendes `REVOKE` — kein aktives Risiko (Default-Deny greift), aber Musterbruch |
| 10 | Kern-Tabellen-Policy-Vollständigkeit | **Top 20 %** | 🟢 | Die 13 tatsächlichen `CREATE POLICY`-Tabellen decken plausibel genau die Tabellen ab, auf die Nutzer selbst lesend zugreifen müssen |
| 9 | Server-only-Tabellen-Muster | **Top 15 %** | 🟢 | Gutes Referenzmuster in `009_meta_features.sql` (RLS + explizites REVOKE für `user_identities`, `identity_link_quarantine`, `admin_roles`) |
| 7 | Neueste-Migrationen-Disziplin (060–063) | **Top 10 %** | 🟢 | Beide neuen Tabellen (`background_job_runs`, `user_wellbeing_limits`) folgen korrekt dem RLS+REVOKE-Muster — Disziplin ist aktuell intakt |
| 8 | Sensible-Spalten-Schutz (email/token/ip/fingerprint) | **Top 10 %** | 🟢 | Gezielte Suche fand keine Tabelle mit sensiblen Spalten ohne RLS |
| 1 | RLS-Enable-Abdeckung | **Top 5 %** | 🟢 | **100 % verifiziert:** alle 39 Tabellen aus `database.types.ts` haben ein passendes `ENABLE ROW LEVEL SECURITY` |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #4 und #5 sind eng verwandt — beide werden durch dasselbe Skript (L2) gelöst, das dann in L3 zum CI-Gate wird. #3 und #6 sind reine Doku-Korrekturen (L1, mit Randnotiz zum Kommentar statt Bearbeitung der historischen Migration). #2 ist der einzige echte, aber risikoarme Code-Fund (L4). #1, #7, #8, #9, #10 sind bereits solide — reiner Erhalt-Modus.

---

## 3 — Verifizierter Ist-Stand (2026-09-05, gegen echten Repo-Code geprüft)

**Guter Ausgangsbefund — 100 % RLS-Enable-Abdeckung:** `src/types/database.types.ts` listet 39 Tabellen; `grep "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql` findet für alle 39 einen passenden Treffer. Gezielt geprüfte, potenziell sensible Tabellen (`user_login_history` `052_user_login_history.sql:18`, `anonymous_sessions` `005_anonymous_sessions.sql:18`, `telegram_links` `025_telegram_link_notifications.sql:25`, `risk_events` `029_risk_events.sql:32`, `bet_network_fingerprints` `030_fraud_signal_detection.sql:121`) haben alle RLS. Kein vollständiger Blindspot gefunden.

**Doku-Denominator ist veraltet:** `docs/database/04_row_level_security_rls.md` Zeile 46 spricht von "13 von 28" RLS-Tabellen mit Policy. Die 13 sind korrekt (`vip_tiers`, `ranks`, `game_configs`, `anonymous_sessions`, `users`, `seeds`, `wallet_transactions`, `game_sessions`, `promo_codes`, `achievement_configs`, `seed_history`, `guide_documents`, `user_login_history`), aber der Nenner "28" ist seit Migration 029+ nicht mehr aktuell — real sind es 39.

**Echter Fund — 4 Tabellen ohne REVOKE-Backstop:** `chat_messages` (`016_full_server_authority_expansion.sql:16`), `daily_races`/`daily_race_winners` (`041_daily_race.sql:34-35`), `admin_analytics_snapshots` (`046_admin_analytics_snapshot.sql:19`) haben `ENABLE ROW LEVEL SECURITY`, aber **kein** begleitendes `REVOKE`. Das ist **keine aktive Sicherheitslücke** — RLS-Default-Deny blockiert `anon`/`authenticated` weiterhin (0 Zeilen, kein `42501`-Fehler, solange keine permissive Policy existiert), aber es durchbricht das sonst konsequent verfolgte Defense-in-Depth-Muster (RLS *und* REVOKE als zwei unabhängige Schichten), das der Rest des Schemas nutzt (z. B. `game_rounds` `007_server_authority.sql:239`, `risk_events` `029_risk_events.sql:33`, `jackpot_pool` `032_progressive_jackpot_pool.sql:17`).

**Irreführender Kommentar:** `046_admin_analytics_snapshot.sql:20` behauptet, das Verhalten sei "identisch zu daily_races/risk_events/jackpot_pool" — tatsächlich haben `risk_events` und `jackpot_pool` explizites `REVOKE`, `daily_races` nicht. Der Kommentar suggeriert also fälschlich Parität mit einem gemischten Vergleich.

**Keine Automatisierung, nur manuelle Disziplin:** `src/lib/security/__tests__/rls-defense-in-depth.test.ts` ist hartcodiert auf benannte Migrationsdateien (`usersSql`, `walletSql`, etc.) — eine neue Tabelle ohne RLS würde diesen Test **nicht** automatisch zum Scheitern bringen, solange niemand manuell eine neue Assertion ergänzt. Kein CI-Workflow, kein Pre-Commit-Hook prüft RLS-Vollständigkeit. `migration-security-guard` ist ein beratender, read-only Agent, kein automatischer Merge-Blocker.

**Aktuelle Disziplin ist intakt:** Die beiden neuesten tabellenanlegenden Migrationen (`060_pg_cron_retry_failure_handling.sql` → `background_job_runs`, `063_user_wellbeing_limits.sql` → `user_wellbeing_limits`) folgen beide korrekt dem RLS+REVOKE-Muster — kein Rückschritt in jüngster Zeit.

**Keine vollständige Matrix existiert:** Kein Repo-Dokument listet alle 39 Tabellen mit Enable/Policy/REVOKE-Status in einer Tabelle — jede Prüfung (auch diese) muss es per Grep neu ableiten.

---

## 4 — Meilensteine

### L1 — Doku-Korrektur

- **Ziel:** `docs/database/04_row_level_security_rls.md` an den echten Stand angleichen.
- **Schritte:** Zeile 46 "13 von 28" → "13 von 39" (nach frischer Nachzählung bestätigen). Status-Header präzisieren (Doku-Qualität ≠ System-Reifegrad, analog zu allen anderen Säulen).
- **Verifizierung:** `grep -n "von 28" docs/database/04_row_level_security_rls.md` liefert keinen Treffer mehr.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — Vollständige RLS-Coverage-Matrix generieren

- **Ziel:** Subkategorie #4 schließen — nie wieder manuell zusammensuchen müssen.
- **Schritte:** Neues Skript `scripts/audit-rls-coverage.ts` (Muster analog zu `scripts/audit-query-performance.ts`, `scripts/check-pooler-health.ts` aus den Schwester-Plänen): liest alle Tabellennamen aus `src/types/database.types.ts`, grept `supabase/migrations/*.sql` nach `ENABLE ROW LEVEL SECURITY`, `CREATE POLICY` und `REVOKE` je Tabelle, schreibt eine Markdown-Tabelle nach `docs/database/rls-coverage-matrix.md` (Spalten: Tabelle, RLS Enabled, Policy vorhanden, REVOKE vorhanden, Quelldatei).
- **Verifizierung:** Generierte Matrix zeigt exakt die in Abschnitt 3 gefundenen 4 Lücken (`chat_messages`, `daily_races`, `daily_race_winners`, `admin_analytics_snapshots`) als "REVOKE: Nein" — beweist, dass das Skript echte Befunde liefert, nicht nur grün ist.
- **Freigabe-Gate:** Keines (read-only). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — CI-Gate: neue Tabelle ohne RLS schlägt fehl

- **Ziel:** Subkategorie #5 schließen — künftige neue Tabellen ohne RLS automatisch erkennen, nicht erst durch manuelle Nachprüfung.
- **Schritte:** Neuer CI-Schritt (in `quality-ci.yml` oder als Teil des in `T_DATABASE/02_database_schema_design.md` L3 gebauten Schema-Drift-Gates): führt `scripts/audit-rls-coverage.ts` (L2) aus, schlägt fehl, wenn eine Tabelle ohne `ENABLE ROW LEVEL SECURITY` gefunden wird (nicht bei fehlendem REVOKE — das ist laut Abschnitt 3 kein aktives Risiko, nur eine Stilfrage, daher kein Hard-Fail dafür).
- **Verifizierung:** Workflow einmal mit einer absichtlich RLS-losen Test-Tabellendefinition (lokal simuliert, nicht committet) getestet — schlägt fehl; danach zurücksetzen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — 4 REVOKE-Lücken schließen

- **Ziel:** Subkategorie #2 schließen — die vier gefundenen Tabellen konsistent mit dem Rest des Schemas absichern.
- **Schritte:**
  1. Neue Migration `supabase/migrations/0NN_harden_rls_revoke_gaps.sql` (Nummer frisch per `ls supabase/migrations | sort | tail -1` ermitteln): `REVOKE ALL ON TABLE public.chat_messages, public.daily_races, public.daily_race_winners, public.admin_analytics_snapshots FROM PUBLIC, anon, authenticated;` (oder differenziert je Tabelle, falls einzelne Rechte abweichend gewünscht sind — vor dem Schreiben die jeweils bestehenden Policies auf diesen Tabellen erneut prüfen, um kein bestehendes, gewolltes Zugriffsrecht versehentlich zu entziehen).
  2. Migrationskommentar ergänzt eine Randnotiz, dass der irreführende Kommentar in `046_admin_analytics_snapshot.sql:20` hiermit korrigiert/ergänzt wird — **die historische Migrationsdatei selbst wird nicht editiert** (bereits angewendete Migrationen bleiben unverändert, Standardpraxis in diesem Projekt), die Korrektur lebt in der neuen Datei und in der L2-Matrix.
  3. Pre-Flight-Kollisionscheck + Pflicht-`@migration-security-guard`-Review vor Abschluss.
- **Verifizierung:** `scripts/audit-rls-coverage.ts` (L2) zeigt danach 0 Tabellen mit "REVOKE: Nein".
- **Freigabe-Gate:** K3 für die lokale Anlage; späterer Remote-Push regulär K4 (keine neue Sonderregel). **Money-Pfad:** Nein (keine der 4 Tabellen ist ein Geld-Pfad). **Security-Review:** Pflicht (`@migration-security-guard`).

---

## 5 — Definition of Done

1. Die Doku nennt den korrekten Coverage-Nenner (39, nicht 28) (L1).
2. Eine generierte, wiederholbare Matrix zeigt für alle 39 Tabellen den RLS/Policy/REVOKE-Status (L2).
3. Ein CI-Gate verhindert künftig eine neue Tabelle ohne RLS, verifiziert durch einen bewussten Negativtest (L3).
4. Die 4 gefundenen REVOKE-Lücken sind geschlossen, ohne eine historische Migration nachträglich zu verändern (L4).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 10 (`T_DATABASE/10_database_testschicht_pgtap.md`) klar abgegrenzt: dort echter Laufzeittest, hier Policy-Design/-Abdeckung — keine Doppelarbeit.
- [x] Abhängigkeiten benannt: L2 vor L3 (Gate braucht das Matrix-Skript); L1 und L4 unabhängig.
- [x] Neue Schreiboperation (L4) hat Pre-Flight-Check, Pflicht-Security-Review und Verifizierung; bestehende Policies werden vor dem REVOKE erneut geprüft, um kein gewolltes Recht zu entziehen.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-05) und verlinken auf Quellcode/Zeilen; der Fund (4 REVOKE-Lücken) ist explizit als "kein aktives Risiko" statt als Alarmismus eingeordnet.
- [x] Keine Referenz doppelt gepflegt: Der echte Laufzeittest bleibt Scope von Säule 10, hier nur als Abgrenzung erwähnt.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Ehrlichkeits-Check:** Der einzige echte Code-Fund (4 fehlende REVOKEs) wurde bewusst nicht als Sicherheitslücke dramatisiert — RLS-Default-Deny greift bereits, die Korrektur ist Konsistenz, keine Notfallmaßnahme.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 4) | [`docs/database/04_row_level_security_rls.md`](../docs/database/04_row_level_security_rls.md) — wird in L1 korrigiert |
| Echter RLS-Laufzeittest (separater, abgegrenzter Plan) | [`T_DATABASE/10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md) |
| Bestehender Text-Verifikationstest | [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) |
| Referenzmuster für Server-only-Tabellen | [`supabase/migrations/009_meta_features.sql`](../supabase/migrations/009_meta_features.sql) |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
