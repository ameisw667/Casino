# K6-A — Remote-Schema-Rekonstruktion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Ausschließlich K6-A: den bereits vorhandenen, vom Nutzer als fachlich korrekt bestätigten Remote-Schema-Drift in nachvollziehbare lokale Migrationen überführen, ohne neue Produktfunktionen oder einen Remote-Rollback.

**Goal:** Lokale Migrationsbasis und Remote-Schema sollen denselben dokumentierten Zustand haben, sodass der dokumentierte Remote-Zustand lokal reproduzierbar ist und Teil A/L7 der Datenbankhärtung anhand von Migrationshistorie, Remote-Dump und dem bekannten pg-delta-Idempotenzartefakt verifiziert abgeschlossen werden kann.

**Architecture:** Der Supabase-CLI-Diff wird ausschließlich als Review-Quelle verwendet. Seine DDL wird in eine feste, fortlaufende Migration `058_reconcile_remote_schema_drift.sql` übernommen und nach Security-Review als bereits auf Remote vorhandener Zustand in der Migrationshistorie markiert. Dadurch werden lokale Resets und neue Umgebungen reproduzierbar, ohne bestehende Remote-Funktionen, Berechtigungen oder Trigger blind zu überschreiben.

**Tech Stack:** Supabase CLI, PostgreSQL DDL/RPCs, TypeScript, Vitest, Next.js 16.

**Spec:** `docs/archive/05_datenbank_haertung.md` Teil A/L7; K6-A-Freigabe vom 2026-08-29; `xx_sop/05_database_supabase.md`; `xx_sop/02_workflow_jan_execution.md`.

## Global Constraints

- Projektbindung ausschließlich `hmqwozhdckbwjqzcmire`.
- K6-A behandelt nur den vorhandenen Remote-Drift; kein Produkt-Rollback, keine neue Datenklasse, keine neue API-Grenze.
- Keine `DROP TABLE`, kein `CASCADE`, kein `supabase db reset`.
- Neue oder geänderte `SECURITY DEFINER`-Funktionen müssen einen festen `search_path` haben; finanzielle bzw. identitätsbezogene Funktionen bleiben serverseitig eingeschränkt.
- Jede Remote-Aktion wird erst nach Pre-Flight, Review und erfolgreicher lokaler Verifikation ausgeführt.
- Nach jedem Task werden Status, Evidenz und nächste Aufgabe in dieser Datei aktualisiert.

---

### Task LLM-0: Pre-Flight und Drift-Snapshot

**Files:**
- Modify: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md`
- Read: `supabase/.temp/project-ref`, `supabase/migrations/*.sql`

**Produces:** Nachweis einer kollisionsfreien Reihe 001–057, korrekter Projektbindung und eine ausschließlich lesende Liste der noch nicht in Migrationen repräsentierten Remote-Objekte.

- [x] `npm run supabase:migrations` war vor K6-A bis 057 lokal und remote synchron.
- [x] Projekt-Ref ist `hmqwozhdckbwjqzcmire`.
- [x] Präfix-Duplikate bereinigt: die byte-identischen Altdateien 049/050 entfernt; 001–059 ist eindeutig.
- [x] Read-only-Diff erfasst: 29 Funktionsdefinitionen, Promo-Code-REVOKEs, Hook-Kommentar und `ensure_rls`-Event-Trigger.
- [x] Kein Guild-Objekt, kein `DROP` und kein `CASCADE` im K6-A-Diff.

**Ausführungslog LLM-0 (2026-08-29):** `npm run supabase:migrations` war zuvor bis 057 synchron; die erneute, vollständige Shadow-Diff-Prüfung bricht reproduzierbar bei lokaler Migration 054 ab. Remote bestätigt `public.users.guide_persona` und keine Tabelle `public.profiles`; der aktuelle Checkout enthält dagegen noch `ALTER TABLE profiles` und zwei Route-Queries gegen `profiles`. Root-Cause-Korrektur ist vor dem K6-A-Snapshot erforderlich. Keine Remote-Änderung ausgeführt.
### Task LLM-1: Remote-Drift fachlich und sicherheitlich abgrenzen

**Files:**
- Modify: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md`
- Read: `src/**`, `supabase/migrations/*.sql`, `xx_docs/01_supabase_context.md`, `xx_sop/09_security_wallet_invariants.md`

**Produces:** Objektliste mit Codebezug, Rollen-/RLS-Auswirkung und Rollback-Grenze.

- [x] Legacy-`place_bet`/`settle_bet` haben keine Anwendungscall-Sites; nur Typen und Schutztests referenzieren sie.
- [x] `promo_codes` verliert Browserrechte; der Auth-Hook bleibt auf `supabase_auth_admin` begrenzt; `ensure_rls` hat festen `pg_catalog`-Pfad.
- [x] Security-Review: 28 Definitionen haben festen Pfad; die zwei Legacy-RPCs werden in 059 mit festem Pfad und vollständigem externen EXECUTE-Entzug quarantänisiert.
- [x] Rollback-Grenze: nur kompensierende Migration, kein Datenlösch-Rollback.

### Task LLM-2: Reproduzierbare Migration 058 testgetrieben erstellen

**Files:**
- Modify: `src/lib/casino/__tests__/migration-history.test.ts`
- Create: `supabase/migrations/058_reconcile_remote_schema_drift.sql`
- Modify: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md`

**Produces:** Feste Migration 058, die den geprüften Remote-Zustand lokal reproduziert und keine Guild- oder Löschoperation enthält.

- [x] Regressionstest auf 058/059 erweitert, inklusive Negativregeln für destructive/Guild-SQL.
- [x] RED: Test belegte vor der Bereinigung die zwei historischen Präfixduplikate und den Header-Fehlalarm.
- [x] 058 übernimmt den vollständigen geprüften Diff; 059 ergänzt ausschließlich Search-Path- und Rollen-Härtung der ungenutzten Legacy-RPCs.
- [x] GREEN: Guide-Persona- und Migrationshistorie-Tests 9/9 bestanden.

### Task LLM-3: Migration Security Guard und lokale Schema-Verifikation

**Files:**
- Read: `supabase/migrations/058_reconcile_remote_schema_drift.sql`
- Modify: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md`

**Produces:** Dokumentierter read-only Review mit `PASS`, `FINDING` oder `BLOCKED`; leere lokale Shadow-DB-Diff-Prüfung.

- [x] Security Guard (054, 058, 059; 1.286 Zeilen): PASS nach 059-Quarantäne der Legacy-RPCs.
- [x] Finding zu `place_bet`/`settle_bet` minimal in 059 behoben: fester Pfad plus REVOKE für PUBLIC, anon, authenticated, service_role.
- [x] Shadow-Diff ausgeführt: 28 verbleibende pg-delta-Funktionsblöcke sind bytegenau identisch mit 058; Berechtigungen, Kommentar und Event Trigger konvergieren. Das ist ein pg-delta-Idempotenzartefakt, kein verbleibender DDL-Unterschied.


**Ausführungslog LLM-0 bis LLM-3 (2026-08-29):** Projektbindung, Migrationsreihe und Diff wurden vollständig geprüft. Die fehlerhafte historische 054-Quelle wurde auf `public.users` korrigiert; zwei byte-identische Altduplikate (049/050) wurden nach Hashvergleich entfernt. Migration 058 enthält den vollständigen erfolgreichen Remote-Diff ohne destruktive/Guild-DDL. Migration 059 quarantänisiert die nicht verwendeten Legacy-Wallet-RPCs zusätzlich. Security Guard v0.2.0: PASS für den finalen Migrationssatz 054/058/059 (1.286 Zeilen); ein anfänglicher Legacy-RPC-Befund wurde vor dem Abschluss durch Pfad- und REVOKE-Härtung behoben. Die pg-delta-Restliste umfasst 28 Funktionsblöcke, die bytegenau in 058 stehen; sie ist als Engine-Idempotenzartefakt dokumentiert.
### Task LLM-4: Remote-Historie, Typen und Qualitätsgates

**Files:**
- Modify: `src/types/database.types.ts`
- Modify: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md`

**Produces:** Remote-Historie inklusive 058 und aktuelle generierte Typen, ohne Remote-DDL erneut anzuwenden.

- [x] `npx supabase migration repair --status applied 058 --linked` ausgeführt; markierte ausschließlich den bereits vorhandenen Remote-Stand als angewendet.
- [x] `npx supabase db push --linked` führte ausschließlich `059_harden_legacy_definer_search_path.sql` aus; keine Tabellen- oder Datenänderung.
- [x] `npm run supabase:migrations` bestätigt lokal und remote synchron: 001–059.
- [x] `npm run supabase:types` nach dem Remote-Abgleich erfolgreich ausgeführt.
- [x] `npm run typecheck`, serielles `npx vitest run --maxWorkers=1 --no-file-parallelism`, `npm run lint` und isoliertes `npm run build` bestanden: 1.220/1.220 Tests, Typecheck 0 Fehler, Lint 0 Fehler (20 bestehende Warnungen), Build vollständig inklusive Static Generation.
- [x] Final `npm run supabase:diff` erfolgreich ausgeführt: 001–059 in der Shadow-DB; verbleibende 28 Funktionsblöcke sind der dokumentierte pg-delta-Idempotenzartefakt und bytegleich mit 058, ohne Rechte-, Trigger-, Kommentar-, Guild- oder destructive-Diff.


**Ausführungslog LLM-4 – final (2026-08-29):** 058 wurde in der Remote-Historie als bereits vorhandener Stand markiert; `db push` führte nur 059 aus. Die Historie 001–059 ist synchron, die Typen wurden danach neu generiert. Jan gab den kleinen Build-Fix frei: das doppelte `overflowX` in `src/app/games-2/page.tsx` wurde entfernt. Der reguläre Build-Ordner war durch den laufenden Dev-Server gesperrt; die Next-konforme isolierte Ausgabe (`NEXT_DIST_DIR`) verifizierte deshalb den vollständigen Produktions-Build ohne den Server zu beenden. Final zum K6-A-Abschlusszeitpunkt: Typecheck 0 Fehler, serielles Vitest 157/157 Dateien und 1.220/1.220 Tests, Lint 0 Fehler/20 bestehende Warnungen, Build vollständig. Eine spätere Wiederholung der Gesamtbuild-Prüfung wurde durch parallel neu angelegte, ungetrackte `src/app/lab/`-Dateien mit fehlenden `@react-three/fiber`-/`three`-Abhängigkeiten blockiert; diese externe Workspace-Änderung liegt außerhalb von K6-A. Der finale Shadow-Diff lief durch und bestätigte das dokumentierte pg-delta-Idempotenzartefakt.
### Task LLM-5: Dokumentation, Archivierung und WorldMap-Korrektur

**Files:**
- Modify: `xx_docs/01_supabase_context.md`
- Modify: `xx_sop/05_database_supabase.md`
- Modify: `worldmap/04_datenbank_migrationen.md`
- Modify: `worldmap/00_WORLDMAP_STATUS.md`
- Move: `worldmap/05_datenbank_haertung.md` → `docs/archive/05_datenbank_haertung.md`
- Move: `worldmap/workflow.jan-k6-a_remote_schema_reconciliation.md` → `docs/archive/2026-08-29_k6-a_remote_schema_reconciliation.md`

**Produces:** A-L7 grün, aktive WorldMap ohne abgeschlossenen Härtungsplan, korrigierte Tabellen-/Referenzdarstellung und archivierte Evidenz.

- [x] Teil A/L7 in der Härtungsplanung auf 🟢 gesetzt und den vollständigen Nachweis eingetragen.
- [x] Relevante Supabase-/Migrationsdokumentation auf 058/059 und den dokumentierten pg-delta-Idempotenznachweis aktualisiert.
- [x] Alle eingehenden Verweise auf die Härtungsplanung auf den Archivpfad oder den Statusnachweis umgestellt.
- [x] Die WorldMap-Tabelle bei Kategorie 02 und Kategorie 04 auf den verifizierten Sicherheits- und Migrationsstand gekürzt.
- [x] Beide abgeschlossenen Pläne nach `docs/archive/` verschoben; ihr Status ist `Executed (archiviert)` und alle Verweise wurden geprüft.
- [x] `node scripts/check-doc-links.mjs` ausgeführt; Ergebnis im Ausführungslog dokumentiert.

**Ausführungslog LLM-5 (2026-08-29):** L7 ist grün, die WorldMap- sowie Supabase-Dokumentation ist auf 001–059, 058/059 und den Security-Guard-Nachweis aktualisiert, und beide Abschlussdokumente liegen im Archiv. `node scripts/check-doc-links.mjs` endet erfolgreich: 0 tote Links in lebendigen Dateien; die gemeldeten 6 historischen Archivlinks und 5 bereits vorhandenen Encoding-Hinweise liegen außerhalb dieser Archivierung.
## Selbstprüfung vor Ausführung

- Scope deckt K6-A, A-L7, Archivierung und WorldMap-Status ab.
- Alle Aufgaben liegen beim LLM; die Nutzerfreigabe K6-A ist als Remote-Historienfreigabe dokumentiert.
- Keine Aufgabe verändert Datenklassen, APIs, Wallet-Logik oder RLS-Policies.
- Jeder Schreib-/Remote-Schritt hat einen konkreten Sicherheits- und Verifikationsschritt.
- Kein Platzhalter, keine unklare Migrationsnummer und keine nicht autorisierte destructive Operation enthalten.