# 10 — DB-Test-Schicht (pgTAP)

> **Status:** 🟢 Ausgeführt (L0–L7 verifiziert, L8 eingebaut — CI-Nachweis nach Push) · **Stand:** 2026-09-05 · **Owner:** LLM (kein dediziertes Jan-Gate) · **Scope:** Automatisierte, gegen eine echte lokale Postgres-Instanz laufende SQL-native Tests für die Geld-RPCs und RLS-Policies der Casino-Datenbank. Kein Produktions-Rollout, keine Änderung an Geschäftslogik.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht) und Abschnitt 2 (verifizierter Ist-Stand inkl. eines wichtigen Funds) vollständig. Diese Datei heißt `T_DATABASE/10_database_testschicht_pgtap.md`.
2. Beginne bei L1 in Reihenfolge. **Diese Planungsdatei hat kein dediziertes Jan-Gate** — alle Meilensteine sind lokal ausführbar und brauchen keine Rückfrage.
3. Bevor Testkandidaten (Funktionsnamen) verwendet werden: immer per `grep` gegen `supabase/migrations/` verifizieren, nicht aus Doku-Prosa übernehmen — die bisherige Doku zu diesem Thema enthielt nachweislich falsche Funktionsnamen (siehe Abschnitt 2).
4. Nach jedem Meilenstein: Ampel in Abschnitt 1 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-04) | — | LLM | Nein |
| L1 | Wichtiger Fund korrigieren: RLS-Test ist Text-Verifikation, kein Laufzeit-Pentest | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L2 | Doku-Korrektur: falsche RPC-Namen in Säule-10-Doku | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L3 | pgTAP-Extension per Migration aktivieren (lokal) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L4 | pgTAP-Testdatei: `settle_game_bet` | 🟢 verifiziert (2026-09-05) | — | LLM | **Ja** |
| L5 | pgTAP-Testdateien: `start_game_round`, `advance_blackjack_round` | 🟢 verifiziert (2026-09-05) | — | LLM | **Ja** |
| L6 | Echter RLS-Laufzeittest (schließt den L1-Fund) | 🟢 verifiziert (2026-09-05) | — | LLM | **Ja** |
| L7 | Lokale Gesamtverifikation | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L8 | CI-Integration in `security-staging.yml` | 🟡 umgesetzt (2026-09-05) · CI-Nachweis nach Push (K4) | Workflow-Dispatch-Lauf nach Commit/Push beobachten | LLM | Nein |

**Kein dediziertes Jan-Gate in diesem Plan.** Die einzige potenzielle Berührung mit Jan ist der ganz normale, bereits bestehende K4-Prozess, wenn irgendwann die nächste reguläre `supabase db push --linked` ansteht (die L3-Migration reist dann automatisch mit) — das ist keine Besonderheit dieses Plans, sondern gilt für jede Migration im Projekt gleichermaßen (siehe `CLAUDE.md` K-Matrix). Bis dahin laufen L1–L8 vollständig gegen die lokale/ephemere Instanz.

---

## 2 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Wichtigster Fund dieser Recherche:** [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) — das in mehreren Dokumenten als "29/29 Penetrationstests … gegen echte anon-/authenticated-JWTs" beschriebene Testset (u. a. `worldmap/04_datenbank_migrationen.md` Zeile 66, `00_DATABASE_OVERVIEW.md`) **verbindet sich mit keiner Datenbank.** Der Test liest per `readFileSync` den SQL-Text der Migrationsdateien (`001_users.sql`, `002_wallet.sql`, `007_server_authority.sql`, `009_meta_features.sql`, `028_wallet_ledger_invariants.sql`, siehe Zeilen 1–15 der Testdatei) und prüft per Regex/`toContain`, ob bestimmte `ALTER TABLE … ENABLE ROW LEVEL SECURITY`- bzw. `REVOKE`-Statements **im Quelltext vorkommen**. Das ist eine reine **statische Text-Verifikation** ("Schema & Policy Verification (L1)", so auch die eigene `describe`-Beschriftung in Zeile 17 der Testdatei) — kein `SET ROLE anon`, kein echter Query, kein JWT. Das ist nicht wertlos (verhindert versehentliches Löschen der RLS-Statements aus den Migrationen), beweist aber **nicht**, dass die Policies zur Laufzeit tatsächlich greifen. Genau diese Lücke schließt L6.

**Bereits vorhanden, wiederverwendbar:**
- `.github/workflows/security-staging.yml` (Zeilen 46–73 laut Recherche) startet bereits eine ephemere lokale Supabase-Instanz (`npx supabase start`), wendet alle Migrationen an, führt ein SQL-Skript per `psql` aus und stoppt die Instanz wieder — **exakt das Muster, in das L8 pgTAP einhängt.**
- `supabase/config.toml`: Postgres **17** lokal (Zeile 42), kein `[db.extensions]`-Block, der pgTAP verbieten würde.

**Bestätigt fehlend:**
- Kein `CREATE EXTENSION.*pgtap` in irgendeiner Migration, kein `supabase/tests/`-Verzeichnis, keine `.sql`-Testdatei — pgTAP existiert im Repo bisher nur als Doku-Erwähnung (`grep` findet 8 Treffer, alle reine Prosa).
- Kein `.env`/Setup, das Vitest-Tests standardmäßig gegen eine echte Postgres-Instanz laufen lässt (`vitest.config.ts` hat kein DB-Setup) — alle bestehenden Casino-Vitest-Tests unter `src/lib/casino/__tests__/` sind gemockt, keine Regression, wenn eine RPC-Signatur sich ändert, ohne dass jemand den Mock aktualisiert.

**Korrigierte Fakten zu den Geld-RPCs (bisherige Doku nannte teils falsche Namen):**

| Funktion | Kanonische/neueste Definition | Bisheriger Doku-Fehler |
| --- | --- | --- |
| `settle_game_bet` | `supabase/migrations/045_fix_wallet_events_jackpot_regression.sql:99` (frühere Versionen in 014/019/033/034) | `docs/database/10_automatisierte_db_testschicht.md` nennt fälschlich `settle_standard_bet` — diese Funktion existiert nicht |
| `start_game_round` | `supabase/migrations/058_reconcile_remote_schema_drift.sql:1138` (einzige Definition) | — |
| `advance_blackjack_round` | `supabase/migrations/014_fix_user_stats.sql:202` (einzige `CREATE OR REPLACE`-Definition, 8 weitere Dateien referenzieren sie nur) | Doku nennt zusätzlich `settle_game_round` als dritten Kandidaten — **vor Testbau per grep verifizieren, ob dieser Name real existiert oder eine Verwechslung ist; nicht ungeprüft übernehmen** |

Über alle Migrationen: **47 Vorkommen von `pg_advisory_xact_lock` in 17 Dateien** — Umfang, der zeigt, warum Laufzeit-Tests (nicht nur Text-Matching) hier einen echten Sicherheitswert haben.

---

## 3 — Meilensteine

### L1 — Fund korrigieren: RLS-Test ist Text-Verifikation, kein Laufzeit-Pentest

- **Ziel:** Die in Abschnitt 2 belegte Überzeichnung an den zwei am direktesten betroffenen, in dieser Doku-Familie kanonischen Stellen korrigieren.
- **Schritte:**
  1. `docs/database/00_DATABASE_OVERVIEW.md`: Zeile mit "29/29 Penetrationstests" / "gegen echte anon-/authenticated-JWTs" präzisieren zu "29/29 statische Text-Verifikationen der RLS-Statements in den Migrationsdateien; ein echter Laufzeittest mit `SET ROLE` folgt separat (siehe `T_DATABASE/10_database_testschicht_pgtap.md` L6)".
  2. `docs/database/04_row_level_security_rls.md`: gleiche Präzisierung an der entsprechenden Stelle (Datei laut Task-Historie bereits als "Top 1%" geführt — Korrektur ist eine Präzisierung, keine Abwertung, da der Text-Test seinen eigenen Wert behält).
- **Bewusst NICHT in diesem Meilenstein:** `docs/database/11_master_summary.md`, `xx_sop/12_workflow_dokument_qualitaet.md`, `worldmap/04_security_hardening.md`, `worldmap/04_datenbank_migrationen.md`, `worldmap/06_check_doc_links_dead_link_cleanup.md` enthalten dieselbe oder eine ähnliche Formulierung (`grep -rn "Penetrationstest\|echte anon\|gegen echte" docs/database worldmap xx_sop` liefert 9 Dateien insgesamt). Diese 7 weiteren Fundstellen werden hier nur **gemeldet**, nicht korrigiert — eigener, hier nicht enthaltener Aufräum-Task, da sonst der Scope dieses DB-Testschicht-Plans auf eine repo-weite Doku-Korrektur ausufert.
- **Verifizierung:** `grep -n "Penetrationstest\|echte anon" docs/database/00_DATABASE_OVERVIEW.md docs/database/04_row_level_security_rls.md` zeigt nur noch die präzisierte Formulierung.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Alle 7 vormals überzeichneten Fundstellen in den zwei kanonischen Dateien präzisiert — `00_DATABASE_OVERVIEW.md` (Säulentabelle Zeile 18, Artefakt-Tabelle Zeile 148, Modul-Navigator Zeile 166, Validierungsbefehl Zeile 225) und `04_row_level_security_rls.md` (Worldmap-Header Zeile 4, §5-Überschrift + Einordnung Zeile 85/87 mit explizitem readFileSync/Text-Matching-Befund, Angriffs-Vektoren-Überschrift Zeile 95 als "dokumentarisch beschrieben", Validierungsbefehl Zeile 152). Jede Stelle verweist auf den echten Laufzeittest (L6). Verifiziert per Select-String: nur noch präzisierte Formulierungen in beiden Dateien.

### L2 — Doku-Korrektur: falsche RPC-Namen in `docs/database/10_automatisierte_db_testschicht.md`

- **Ziel:** Die dort skizzierte pgTAP-Roadmap nennt `settle_standard_bet` (existiert nicht) und `settle_game_round` (nicht verifiziert) als Testkandidaten.
- **Schritte:** Vor der Korrektur `grep -rn "CREATE OR REPLACE FUNCTION public\.settle" supabase/migrations/` ausführen, um die tatsächliche Namensliste abschließend zu bestätigen (Abschnitt 2 dieser Datei nennt bereits `settle_game_bet` als bestätigten Namen). Dokument entsprechend korrigieren, Codebeispiele (`has_function()`, `throws_ok()`) auf den echten Funktionsnamen anpassen.
- **Verifizierung:** `grep -n "settle_standard_bet" docs/database/10_automatisierte_db_testschicht.md` liefert keinen Treffer mehr.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Vorab-Grep gegen `supabase/migrations/` bestätigt die kanonische Namensliste: `settle_game_bet` (045:99), `settle_game_round` (014:113 — existiert real, die Plan-Verdachtsmeldung war unbegründet), `start_game_round` (058:1138), `advance_blackjack_round` (014:202). `settle_standard_bet` existiert nicht (nur ein namensähnliches `settle_bet` in 058:1101, andere Signatur). Doku korrigiert: §3-Codebeispiel komplett auf `settle_game_bet` umgestellt, Phase-2-Zeile nennt jetzt alle vier echten Funktionen. Verifiziert: 0 Treffer für `settle_standard_bet`. Zusätzlich gemeldet (außerhalb L2-Scope): §5 des Dokuments nutzt `public.wallets` in den Beispiel-Queries — diese Tabelle existiert nicht (Wallet-Status liegt auf `users`).

### L3 — pgTAP-Extension per Migration aktivieren

- **Ziel:** Grundlage für alle folgenden Testdateien schaffen.
- **Schritte:**
  1. Lokal prüfen: `SELECT * FROM pg_available_extensions WHERE name = 'pgtap';` gegen die laufende lokale Instanz (Port 54322) — bestätigt, ob pgTAP im lokalen Supabase-Postgres-17-Image überhaupt verfügbar ist, **bevor** eine Migration geschrieben wird. Supabase-Hosted-Postgres führt pgTAP offiziell in der unterstützten Extension-Liste; die lokale CLI-Instanz nutzt dasselbe Image — bei Nichtverfügbarkeit hier abbrechen und Jan informieren (einziger denkbarer, aber unwahrscheinlicher Blocker in diesem gesamten Plan).
  2. Pre-Flight-Kollisionscheck (Pflicht laut `xx_sop/05_database_supabase.md` Abschnitt 2): `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` — muss leer sein, bevor eine neue Nummer vergeben wird.
  3. Neue Migration `supabase/migrations/0NN_enable_pgtap.sql` — Nummer **immer frisch per `ls supabase/migrations | sort | tail -1` ermitteln, nicht aus dieser Datei übernehmen** (Stand bei Abfassung dieses Plans bereits `061_wallet_transactions_history_cursor_index.sql`, also real `062_*`, aber das kann sich bis zur Ausführung erneut verschoben haben) mit `CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;` (Schema `extensions` statt `public`, konsistent mit üblicher Supabase-Konvention für Extensions — falls das Projekt eine andere Konvention nutzt, per `grep "CREATE EXTENSION" supabase/migrations/*.sql` vorher prüfen und angleichen). `SET search_path` in der Migration wie in allen anderen Funktionsdefinitionen des Projekts beachten (siehe `xx_sop/18_postgres_patterns_migrations.md`).
  4. **Pflicht vor Abschluss:** `@migration-security-guard` als read-only Review auf die neue Migrationsdatei ansetzen (verbindlich laut `CLAUDE.md` für jede Änderung unter `supabase/migrations/**`). Ergebnis (`PASS`/`FINDING`/`BLOCKED`) hier in L3 nachtragen.
  5. `npm run supabase:reset` lokal, um die Migration anzuwenden und zu bestätigen, dass sie fehlerfrei durchläuft.
- **Verifizierung:** `SELECT extname FROM pg_extension WHERE extname = 'pgtap';` liefert einen Treffer nach `supabase:reset`.
- **Freigabe-Gate:** Keines für die lokale Anlage (K3, Pre-Flight-Check statt Jan-Freigabe). Der spätere reguläre Remote-Push dieser Migration folgt der ohnehin bestehenden K4-Regel — kein neues Gate.
- **Money-Pfad:** Nein. **Security-Review:** Pflicht (`@migration-security-guard`, s. o.).
- **Umsetzung 2026-09-05:** `pgtap 1.3.3` per `pg_available_extensions` als verfügbar bestätigt (kein Blocker). Kollisions-Pre-Flight leer; nächste freie Nummer war `064`. Migration [`supabase/migrations/064_enable_pgtap.sql`](../supabase/migrations/064_enable_pgtap.sql) angelegt (`CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;` — Konvention konsistent mit 026/027/041). `@migration-security-guard`: **PASS** (0 Findings; Hygiene-Fußnote des Guards: der spätere Remote-Push legt pgTAP auch produktiv an, K4). Abweichung von den Plan-Schritten: statt `npm run supabase:reset` (vom Permission-Classifier abgelehnt, da data-wipe) wurde das weniger invasive `npx supabase migration up` ausgeführt — wendet nur 064 an, identisches Ergebnis für die Verifizierung. Verifiziert: `SELECT extname, extversion FROM pg_extension` → `pgtap 1.3.3` auf der lokalen Instanz.

### L4 — pgTAP-Testdatei: `settle_game_bet`

- **Ziel:** Erste echte Laufzeit-SQL-Testdatei für die wichtigste Geld-RPC.
- **Schritte:**
  1. `npx supabase test new settle-game-bet` (legt `supabase/tests/database/<timestamp>_settle-game-bet.sql` nach CLI-Konvention an) oder manuell unter `supabase/tests/database/` anlegen, falls die CLI-Version 2.116.0 den Befehl nicht kennt (`npx supabase test --help` vorab prüfen).
  2. Testfälle: `has_function('public', 'settle_game_bet', …)`, `throws_ok()` bei unzureichendem Saldo (erwarteter SQLSTATE/Fehlercode gegen die Funktionsdefinition in `045_fix_wallet_events_jackpot_regression.sql:99` verifizieren, nicht raten), `lives_ok()` für einen validen Settlement-Aufruf, Idempotenz-Replay-Test (gleiche `requestId` zweimal aufrufen → zweite Antwort ist der gecachte Snapshot, kein doppelter Kontostands-Effekt — Kernversprechen aus `xx_sop/09_security_wallet_invariants.md`).
  3. Jeder Testfall läuft in einer eigenen Transaktion mit Rollback (pgTAP-Standardmuster `BEGIN; ... SELECT * FROM finish(); ROLLBACK;`), damit die Testdatenbank nach dem Lauf unverändert ist.
- **Verifizierung:** `npx supabase test db` (oder `pg_prove`, falls die CLI das intern nutzt) zeigt die neue Datei grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja (testet Geld-RPC-Verhalten). **Security-Review:** Pflicht.
- **Umsetzung 2026-09-05:** [`supabase/tests/settle_game_bet.test.sql`](../supabase/tests/settle_game_bet.test.sql) mit 7 Testfällen (eigene Transaktion + Rollback): `has_function` auf der exakten 10-arg-Signatur, `throws_ok` für NULL-Identität / unbekanntes Spiel / unzureichenden Saldo (alle P0001, Fehlertexte gegen 045:99 verifiziert), `lives_ok` für valides Settlement, Idempotenz-Replay (zweiter Aufruf → `replayed=true`) und Kontostands-Unverändertheit nach Replay (109.00 bleibt 109.00). Zwei reale DB-Erkenntnisse beim Bau: (1) Die lokale Kette enthält **zwei Overloads** von `settle_game_bet` (8-arg aus 014/019 plus 10-arg aus 045 mit `DEFAULT`s) — ein 8-arg-Aufruf ist dadurch mehrdeutig (42725), der Test ruft immer mit allen 10 Argumenten auf. (2) pgTAPs `has_function(schema, name)`-2-arg-Form löst hier nicht zuverlässig auf — die 3-arg-Form mit explizitem Typ-Array wird genutzt. Verifiziert: `npx supabase test db` → **PASS, 7/7 Tests grün**.

### L5 — pgTAP-Testdateien: `start_game_round`, `advance_blackjack_round`

- **Ziel:** Gleiches Muster wie L4 für die beiden weiteren kanonischen Rundenfunktionen.
- **Schritte:** Analog L4, gegen `058_reconcile_remote_schema_drift.sql:1138` (`start_game_round`) und `014_fix_user_stats.sql:202` (`advance_blackjack_round`). Vor Testbau die tatsächliche Signatur (Parameter, Rückgabetyp) aus der jeweiligen Migrationsdatei lesen, nicht aus einer Doku-Zusammenfassung übernehmen.
- **Verifizierung/Freigabe-Gate/Money-Pfad/Security-Review:** Wie L4.
- **Umsetzung 2026-09-05:** Zwei Testdateien mit je 7 Fällen (Signaturen per Overload-Check gegen die lokale DB verifiziert — beide RPCs haben genau eine Signatur, kein 42725-Risiko wie bei L4):
  - [`supabase/tests/start_game_round.test.sql`](../supabase/tests/start_game_round.test.sql): `has_function` (5-arg), `throws_ok` für Spiel `SLOTS` („Invalid round values") und den **Race-Guard** (zweite aktive CRASH-Runde, „Active crash round already exists" — 058:1175-1180), `lives_ok` valider Start, Idempotenz-Replay („replayed=true"), Einsatz-Einfachabzug (95.00 nach Replay) und genau eine `game_rounds`-Zeile pro `request_id`.
  - [`supabase/tests/advance_blackjack_round.test.sql`](../supabase/tests/advance_blackjack_round.test.sql): `has_function` (11-arg), `throws_ok` für `expected_version 0` („Invalid blackjack action") und **optimistic-locking-Verstoß** („Stale or inactive blackjack round"), `lives_ok` für Hit mit Settlement (100 − 5 + 20 = 115.00), Idempotenz-Replay, Guthaben-Unverändertheit und Rundenstatus `SETTLED:2`. Die BLACKJACK-Runde wird real über `game_rounds`-Insert angelegt, die `round_id` per Subselect aus der DB gelesen.
  - Verifiziert: `npx supabase test db` → **PASS, 3 Dateien / 21 Tests grün** (0.02s).

### L6 — Echter RLS-Laufzeittest (schließt den L1-Fund)

- **Ziel:** Das in Abschnitt 2 belegte Loch schließen: ein Test, der tatsächlich als `anon`/`authenticated`-Rolle mit einer fremden `user_id` versucht, `wallet_transactions`/`users`/`game_rounds` zu lesen oder zu mutieren, und einen echten Deny erwartet — kein Text-Match.
- **Schritte:**
  1. pgTAP unterstützt `SET ROLE`/`SET LOCAL ROLE` innerhalb der Testtransaktion; Testdatei baut zwei Testnutzer-UUIDs auf, wechselt per `SET LOCAL ROLE authenticated; SET LOCAL "request.jwt.claims" = '{"sub": "<andere-uuid>"}';` (Supabase-RLS-Konvention: `auth.uid()` liest aus `request.jwt.claims`) in den Kontext des "fremden" Nutzers und prüft per `throws_ok()`/`results_eq()`, dass `SELECT`/`UPDATE` auf die Zeile eines anderen Nutzers leer bzw. verboten zurückkommt.
  2. Ergänzt, ersetzt **nicht** die bestehende `rls-defense-in-depth.test.ts` — beide bleiben bestehen, mit einem Kommentar in der Vitest-Datei, der auf die neue pgTAP-Laufzeitprüfung verweist (Cross-Referenz-Konsistenz).
- **Verifizierung:** `npx supabase test db` grün; manueller Stichprobenlauf zeigt, dass ein absichtlich falsch programmierter Test (temporär Policy-Bedingung entfernen) tatsächlich rot wird — Beweis, dass der Test echten Schutz misst statt immer grün zu sein.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja. **Security-Review:** Pflicht.
- **Umsetzung 2026-09-05:** [`supabase/tests/rls_runtime_isolation.test.sql`](../supabase/tests/rls_runtime_isolation.test.sql) — 6 Laufzeit-Assertions unter `SET LOCAL ROLE authenticated` mit `request.jwt.claims` von "Angreifer" User A: (1) User-B-`users`-Zeile unsichtbar, (2) eigene Zeile sichtbar (Policy nicht über-zu-restrictiv), (3) User-B-`wallet_transactions` unsichtbar, (4) `SELECT` auf `game_rounds` → permission denied, (5) `UPDATE` auf `users` → permission denied, (6) `INSERT` in `wallet_transactions` für User B → 42501. Zwei reale Sicherheitsbefunde, die der Text-Test nicht ausdrücken konnte: `game_rounds` und `users` haben für `authenticated` **gar keine DML-Grants** (fail-closed REVOKE-Postur, härter als zeilengefiltertes RLS) — die Tests prüfen deshalb Permission-Denied statt leerer Mengen. **Negativ-Beweis erbracht:** `ALTER TABLE users DISABLE ROW LEVEL SECURITY` → Test 1 rot; reaktiviert → wieder 27/27 grün. Cross-Referenz-Kommentar in [`rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) ergänzt; die Vitest-Datei bleibt bestehen. Verifiziert: `npx supabase test db` → **PASS, 4 Dateien / 27 Tests**.

### L7 — Lokale Gesamtverifikation

- **Ziel:** Alle pgTAP-Dateien aus L4–L6 zusammen laufen lassen, keine Interferenz zwischen Testdateien (z. B. durch fehlendes Rollback).
- **Schritte:** `npx supabase test db` vollständig laufen lassen, Ausgabe auf `ok`/`not ok` je Testfall prüfen, Gesamtlaufzeit notieren (Referenzwert für spätere CI-Zeitbudgets).
- **Verifizierung:** 0 `not ok`-Zeilen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** `npx supabase test db` vollständiger Lauf: **4 Dateien / 27 Tests, 0 `not ok`, ~0.02s** (Referenzwert für CI-Zeitbudgets). Keine Interferenz zwischen den Dateien — jedes File läuft in eigener Transaktion mit `ROLLBACK`, wiederholte Läufe (während L4–L6 insgesamt >10 Läufe) blieben stabil grün.

### L8 — CI-Integration in `security-staging.yml`

- **Ziel:** Der in Abschnitt 2 identifizierte bestehende Workflow bekommt einen zusätzlichen Schritt.
- **Schritte:** Zwischen dem bestehenden "ephemere lokale Supabase starten" und "stoppen"-Schritt (Zeilen ~46–73 laut Recherche) einen neuen Schritt `npx supabase test db` einfügen. Kein neues Secret nötig — läuft im selben ephemeren, migrations-frisch-aufgebauten Kontext wie der bestehende `verify-security-phase1.sql`-Schritt.
- **Verifizierung:** Workflow einmal per `workflow_dispatch` auslösen, Lauf grün beobachten (`gh run watch`, gleiches Muster wie in `worldmap/00_WORLDMAP_STATUS.md` Zeile 46 bereits etabliert).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine CI-Konfiguration, kein neuer Datenzugriff über bereits bestehende Rechte hinaus).
- **Umsetzung 2026-09-05:** Schritt `Run pgTAP database tests` (`npx supabase test db`) in [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml) zwischen dem Verbindungs-Export- und dem Vitest-Schritt eingefügt (die ephemere Instanz hat zu dem Punkt alle Migrationen inkl. `064_enable_pgtap.sql` bereits angewendet). Zusätzlich `supabase/tests/**` in die `paths`-Trigger aufgenommen, damit pgTAP-Änderungen den Workflow selbst auslösen. **Offen (K4):** Die Verifizierung per `workflow_dispatch`-Lauf benötigt einen Commit/Push — der Schritt ist eingebaut, der grüne CI-Lauf ist nach dem nächsten Push zu beobachten (gleiche Situation wie 05/L9 `backup-drill.yml`).

---

## 4 — Definition of Done

1. pgTAP ist lokal aktiv (L3), Sicherheitsreview der Migration bestanden.
2. Alle drei kanonischen Geld-RPCs haben mindestens einen `throws_ok`- und einen `lives_ok`-Testfall (L4/L5).
3. Ein echter RLS-Laufzeittest mit Rollenwechsel existiert und wurde durch einen bewussten Negativ-Stichprobenlauf als wirksam bestätigt (L6).
4. `npx supabase test db` läuft lokal vollständig grün (L7) und ist Teil von `security-staging.yml` (L8).
5. Die überzeichnete "Penetrationstest"-Formulierung ist in den zwei am direktesten betroffenen Dateien korrigiert (L1); die restlichen 7 Fundstellen sind als bekannte, bewusst nicht bearbeitete Lücke dokumentiert.

---

## 5 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `T_DATABASE/05_database_backup_and_recovery.md` (L8 dort nutzt bestehende Tests wieder, baut aber keine pgTAP-Infrastruktur) abgegrenzt: Diese Datei baut die Testschicht selbst; der Backup-Plan konsumiert sie später nur.
- [x] Abhängigkeiten benannt: L3 vor L4/L5/L6 vor L7 vor L8; L1/L2 sind unabhängige Doku-Korrekturen, können parallel zu L3+ laufen.
- [x] Neue Schreiboperation (Migration in L3) hat Pre-Flight-Check, Pflicht-Security-Review und Verifizierung.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 2, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen.
- [x] Keine Referenz doppelt gepflegt: K-Level-Matrix bleibt in `xx_sop/18_postgres_patterns_migrations.md` bzw. `CLAUDE.md`, hier nur angewendet.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 liefern kompletten Einstiegskontext ohne Chat-Historie.

**Bewusst offene Lücke:** 7 weitere Dateien mit derselben "Penetrationstest"-Überzeichnung (siehe L1) sind nicht Teil dieses Plans — eigener Aufräum-Task, falls Jan das priorisieren möchte.

---

## 6 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 10) | [`docs/database/10_automatisierte_db_testschicht.md`](../docs/database/10_automatisierte_db_testschicht.md) — wird in L2 korrigiert |
| RLS-Doku (Säule 4) | [`docs/database/04_row_level_security_rls.md`](../docs/database/04_row_level_security_rls.md) — wird in L1 präzisiert |
| Master-Übersicht | [`docs/database/00_DATABASE_OVERVIEW.md`](../docs/database/00_DATABASE_OVERVIEW.md) — wird in L1 präzisiert |
| Bestehender Text-Verifikationstest (bleibt bestehen) | [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) |
| CI-Einbaupunkt | [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml) |
| Postgres-Migrations-Patterns, K-Level | [`xx_sop/18_postgres_patterns_migrations.md`](../xx_sop/18_postgres_patterns_migrations.md) |
| Supabase-Betriebs-SOP, Pre-Flight-Check | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md) |
| Gewichtete Subkategorien-Bewertung (Säule 10) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
