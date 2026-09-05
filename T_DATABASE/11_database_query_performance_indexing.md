# 11 — Query-Performance & Indexing

> **Status:** 🟢 Ausgeführt (L0–L7 verifiziert am 2026-09-05 inkl. erstem grünen CI-Lauf) · **Stand:** 2026-09-05 · **Owner:** LLM (kein Pflicht-Jan-Gate; L7 optional mit kleinem Jan-Touch) · **Scope:** Reproduzierbare, wiederholbare Read-Only-Audit-Methodik für Index-/Query-Performance der Casino-Datenbank. Kein Lasttest (siehe `docs/archive/05_Observability_und_Lasttest.md` für RPC-Latenz global), keine neue Index-Migration ohne konkreten, im Audit gefundenen Befund.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht) und Abschnitt 2 (verifizierter Ist-Stand inkl. eines wichtigen Sicherheitshinweises für L4) vollständig.
2. Beginne bei L1 in Reihenfolge. **L0–L6 brauchen kein Jan-Gate.** Nur L7 (CI-Automatisierung) ist optional und braucht ggf. ein GitHub-Secret von Jan — bei Zeitdruck einfach weglassen, der Plan gilt auch ohne L7 als vollständig.
3. **Sicherheitsregel für L4, unbedingt vorher lesen:** Niemals `EXPLAIN ANALYZE` direkt auf einen Aufruf einer Geld-RPC (`settle_game_bet(...)`, `start_game_round(...)`, `advance_blackjack_round(...)`) anwenden — `EXPLAIN ANALYZE` führt die Funktion dabei **wirklich aus**, inklusive aller Schreibeffekte. Eine echte Wette würde real verbucht. Nur die einzelnen `SELECT`/`UPDATE`-Statements **innerhalb** der Funktionskörper isoliert analysieren.
4. Nach jedem Meilenstein: Ampel in Abschnitt 1 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr.           | Meilenstein                                                       |                               Status                                | Nächster Schritt                                        |   Zuständigkeit   |           Money-Pfad           |
| ------------- | ----------------------------------------------------------------- | :-----------------------------------------------------------------: | ------------------------------------------------------- | :---------------: | :----------------------------: |
| L0            | Kontext & Scope                                                   |                     🟢 verifiziert (2026-09-04)                     | —                                                       |        LLM        |              Nein              |
| L1            | Doku-Korrektur: Index-Zahl & widersprüchliche Audit-Behauptung    |                     🟢 verifiziert (2026-09-05)                     | —                                                       |        LLM        |              Nein              |
| L2            | Audit-Skript bauen (kapselt die 4 `supabase inspect`-Befehle)     |                     🟢 verifiziert (2026-09-05)                     | —                                                       |        LLM        |              Nein              |
| L3            | Ersten echten, datierten Auditlauf ausführen & persistieren       |                     🟢 verifiziert (2026-09-05)                     | —                                                       |        LLM        |              Nein              |
| L4            | Gezielte EXPLAIN-ANALYZE-Tiefenprüfung der 3 Geld-RPC-Query-Pfade |                     🟢 verifiziert (2026-09-05)                     | —                                                       |        LLM        | Nein (bei korrekter Umsetzung) |
| L5            | Befund bewerten: Index-Migration nur bei echtem Fund              |      🟢 verifiziert (2026-09-05) — kein Fund, keine Migration       | Nächster Quartals-Check ~2026-12-05                     |        LLM        |              Nein              |
| L6            | Wiederholbarkeit: npm-Script ergänzen                             |                     🟢 verifiziert (2026-09-05)                     | —                                                       |        LLM        |              Nein              |
| L7 (optional) | CI-Cron-Automatisierung, quartalsweise                            | 🟢 verifiziert (2026-09-05, erster grüner CI-Lauf: Run 33993162288) | Secret hinterlegen, ersten Workflow-Dispatch beobachten | LLM, 1 Jan-Secret |              Nein              |

**Warum praktisch kein Jan-Gate nötig ist:** Alle Kernschritte (L1–L6) sind read-only gegen die Datenbank — dieselbe Kategorie wie die bereits im Projekt etablierten, freigabefreien K1-Befehle `npm run supabase:migrations` und `npm run supabase:diff` (beide laufen ebenfalls mit `--linked` gegen das Remote-Projekt, ohne Jan-Freigabe, siehe `CLAUDE.md` K-Matrix). L7 ist die einzige Ausnahme, weil ein GitHub-Actions-Secret (`SUPABASE_ACCESS_TOKEN`) nötig wäre, das nur Jan im Repo-Secret-Store hinterlegen kann — und selbst L7 ist optional, kein Kernbestandteil.

---

## 2 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Bereits vorhanden (nicht neu erfinden):**

- `docs/database/07_indexing_query_performance.md` enthält bereits eine reife, konkrete Methodik: `npx supabase inspect db calls --linked`, `db outliers --linked`, `db seq-scans --linked`, `db unused-indexes --linked` (Zeilen 80–83, 142–153) plus ein `EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)`-Studio-Snippet (Zeilen 100–106) und eine klare Schwelle für neue Indizes: **>50 ms EXPLAIN ANALYZE oder Seq-Scan auf einer Tabelle mit >5.000 Zeilen** (Zeile 118). Das ist keine Prosa-Lücke — es fehlt nur die **Automatisierung/Wiederholbarkeit**, nicht die Methode selbst.
- 41 `CREATE (UNIQUE) INDEX`-Statements in 25 Migrationsdateien (Doku nennt 40 — kleine Differenz, wird in L1 korrigiert). Hot-Path-Indizes für die Geld-RPCs existieren bereits: `idx_game_rounds_active` (`supabase/migrations/007_server_authority.sql:32`), `idx_transactions_user`/`idx_transactions_game`/`idx_transactions_created`/`idx_sessions_user`/`idx_sessions_game` (`supabase/migrations/002_wallet.sql:42-46`).

**Wichtiger Fund — widersprüchliche Behauptungen zweier Dokumente:** `docs/database/07_indexing_query_performance.md:63` behauptet einen "jüngsten Remote-Audit ... 35 FK-Relationen" als bereits durchgeführt. `worldmap/04_datenbank_migrationen.md:74` sagt dagegen explizit: "Keine dokumentierte `EXPLAIN ANALYZE`-Prüfung, kein Slow-Query-Log-Review" und nennt kein Datum für einen tatsächlichen Audit-Lauf. **Keine der beiden Dateien belegt Datum oder Rohausgabe eines echten Laufs.** Diese Planungsdatei löst den Widerspruch nicht durch Vermutung, sondern dadurch, dass L3 einen echten, frisch datierten Lauf erzeugt, der beide bisherigen Behauptungen ersetzt.

**Bestätigt fehlend:**

- Kein Skript im Repo automatisiert die vier `supabase inspect`-Befehle oder persistiert ihr Ergebnis (`scripts/` enthält nichts dazu).
- Kein npm-Script kapselt sie (`package.json:21-27` hat nur `supabase:start/stop/reset/migrations/types/diff`, kein `perf`/`inspect`/`explain`).
- `pg_stat_statements` ist in keiner Migration und keiner `config.toml`-Zeile explizit aktiviert — die Doku setzt stillschweigend auf Supabase-Hosted-Standardaktivierung. **Vor L2 verifizieren:** `SELECT extname FROM pg_extension WHERE extname = 'pg_stat_statements';` gegen `--linked` ausführen; falls leer, liefern die `inspect`-Befehle in L3 keine sinnvollen Daten und eine Aktivierungsmigration wird zur Voraussetzung (dann zusätzlicher Schritt in L2, siehe dort).

**Verfügbare CI-Vorlage für L7:** `.github/workflows/doc-drift-check.yml:8-9` — `schedule: cron: '0 6 * * 1'`, informativ, `permissions: contents: read`, kein PR-Blocker. Gutes Gerüst, muss auf `SUPABASE_ACCESS_TOKEN`-Secret und die L2-Skript-Aufrufe umgestellt werden.

---

## 3 — Meilensteine

### L1 — Doku-Korrektur: Index-Zahl & widersprüchliche Audit-Behauptung

- **Ziel:** `docs/database/07_indexing_query_performance.md` an den echten Repo-Stand angleichen und die unbelegte Audit-Behauptung durch einen Verweis auf diese Planungsdatei ersetzen, statt sie stehen zu lassen.
- **Schritte:** Zeile mit "40 gezielt gesetzte Indizes" → "41" (nach eigener `grep`-Nachzählung vor dem Edit bestätigen, Zahl kann sich zwischen dieser Planung und Ausführung erneut verschoben haben). Zeile 63 ("jüngster Remote-Audit … 35 FK-Relationen") präzisieren: entweder mit echtem Datum/Befehl belegen, falls beim Nachprüfen doch ein Nachweis auftaucht, oder auf "siehe `T_DATABASE/11_database_query_performance_indexing.md` L3 für den ersten belegten Auditlauf" ändern.
- **Verifizierung:** `grep -c "CREATE INDEX\|CREATE UNIQUE INDEX" supabase/migrations/*.sql | ...` (Summe) stimmt mit der in der Doku genannten Zahl überein.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Vorab-Nachzählung per `Select-String` über `supabase/migrations/*.sql`: **42** `CREATE (UNIQUE) INDEX`-Statements, **64** Migrationsdateien (die Planung erwartete 41/59 — die Zahl driftet, wie in der Planung bereits vermutet). [`docs/database/07_indexing_query_performance.md`](../docs/database/07_indexing_query_performance.md) korrigiert: §2-Überschrift entnommen ("Das 40-Indizes-Inventar" → neutrales "Technisches Index-Inventar"), Zahl auf 42 mit Nachzähl-Datum und Drift-Hinweis. §3 umgebaut: die unbelegte "jüngster Remote-Audit … 35 FK-Relationen"-Behauptung durch einen Hinweis-Block ersetzt (unbelegt bis L3, Verweis auf Audit-Dateien unter `docs/database/audits/`); die FK-Analyse selbst bleibt als "Bisherige Einschätzung (unbelegt, bis L3 liefert)" erhalten. Verifiziert: `grep` auf "40 gezielt", "59 Migrationen", "jüngster Remote-Audit" → 0 Treffer.

### L2 — Audit-Skript bauen

- **Ziel:** Die vier bereits dokumentierten `supabase inspect`-Befehle in ein wiederholbares, ergebnisspeicherndes Skript kapseln, statt sie jedes Mal manuell und ohne Historie auszuführen.
- **Schritte:**
  1. Vorab prüfen (siehe Abschnitt 2): `pg_stat_statements` aktiv? Falls nicht, **vor** dem eigentlichen Skript eine Migration `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;` vorbereiten (gleicher Pre-Flight-Kollisionscheck + `@migration-security-guard`-Pflicht wie bei jeder neuen Migration, siehe `xx_sop/05_database_supabase.md` Abschnitt 2 und `CLAUDE.md`).
  2. Neues Skript `scripts/audit-query-performance.ts`: ruft `npx supabase inspect db calls --linked`, `db outliers --linked`, `db seq-scans --linked`, `db unused-indexes --linked` über `execFile` (kein Shell-String, analog zu `scripts/backup-supabase.ts`) auf, sammelt `stdout` jedes Befehls.
  3. Ergebnis als Markdown-Datei unter `docs/database/audits/query-performance-<YYYY-MM-DD>.md` schreiben: Zeitstempel, CLI-Version, Rohausgabe aller vier Befehle, plus eine automatische Bewertung gegen die Schwelle aus `docs/database/07_indexing_query_performance.md:118` (>50 ms oder Seq-Scan >5.000 Zeilen → `⚠️ Befund`, sonst `✅ Kein Handlungsbedarf`).
  4. Kein Schreibzugriff auf die Datenbank in diesem Skript — ausschließlich `inspect`-Befehle, die selbst laut Supabase-CLI-Dokumentation read-only sind.
- **Verifizierung:** `npx tsx scripts/audit-query-performance.ts` läuft einmal lokal durch (gegen `--linked`, da lokale Dev-Instanz ohne Produktionslast keine aussagekräftigen `pg_stat_statements`-Daten hat), erzeugt eine Markdown-Datei mit den vier Rohausgaben.
- **Freigabe-Gate:** Keines (read-only, K1-Klasse siehe Abschnitt 1). **Money-Pfad:** Nein. **Security-Review:** Nein (kein neuer Datenzugriff über bestehende `--linked`-Rechte hinaus, keine Credentials im Skript — nutzt die bereits vorhandene, lokal eingeloggte Supabase-CLI-Session).
- **Umsetzung 2026-09-05:** Vorab-Check gegen `--linked` per `npx supabase db query`: `pg_stat_statements` ist auf dem Remote-Projekt aktiv — **keine Zusatzmigration nötig**. [`scripts/audit-query-performance.ts`](../scripts/audit-query-performance.ts) gebaut (execFile-Muster analog `backup-supabase.ts`, kein Shell-String; JSON-Ausgabe statt Text für auswertbare Schwellenwerte). **Bewusste Planabweichung:** CLI 2.116.0 stuft `seq-scans` und `unused-indexes` als deprecated ein (beide mappen auf `index-stats`, dessen JSON beide Daten hergibt) — das Skript läuft daher `calls`, `outliers`, `index-stats` und leitet die vier geplanten Sichten daraus ab statt der zwei Deprecated-Befehle. Erster Lauf erfolgreich: `docs/database/audits/query-performance-2026-09-05.md` erzeugt, inkl. automatischer Schwellenwert-Bewertung. Während der Umsetzung gefundener Skript-Bug sofort gefixt: `unusedIndexes` war berechnet, aber nicht ins Markdown geschrieben worden.

### L3 — Ersten echten, datierten Auditlauf ausführen & persistieren

- **Ziel:** Den in Abschnitt 2 belegten Widerspruch zwischen zwei Dokumenten durch einen echten, nachvollziehbaren Lauf ersetzen.
- **Schritte:** `scripts/audit-query-performance.ts` (L2) tatsächlich ausführen, die erzeugte Datei unter `docs/database/audits/` committen (als Nachweis, nicht nur lokal liegen lassen), `docs/database/07_indexing_query_performance.md` Zeile 63 (bereits in L1 zur Präzisierung markiert) mit dem echten Datum und Link auf die neue Audit-Datei aktualisieren.
- **Verifizierung:** Datei unter `docs/database/audits/query-performance-2026-09-04.md` (oder aktuelles Datum) existiert und enthält vier nicht-leere Abschnitte.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** [`docs/database/audits/query-performance-2026-09-05.md`](../docs/database/audits/query-performance-2026-09-05.md) persistiert mit Zeitstempel, CLI-Version (2.116.0) und Roh-JSON aller drei Inspect-Sichten. **Ergebnis des Laufs:** 6 Befunde über der 50-ms-Schwelle, aber **alle sechs sind Infrastruktur-/Katalog-Queries** (`pg_sleep` von Testinfrastruktur, `pg_catalog`-Introspection von Studio/CLI) — **keine Anwendungs- oder Money-Pfad-Query**, kein Seq-Scan über 5.000 Aufrufe. 30 unbenutzte Indizes (informativ). `docs/database/07` §3 verweist jetzt auf diese konkrete Audit-Datei als ersten belegten Lauf. **Hinweis (beim Commit zu beachten):** Die Audit-Rohdaten enthalten bis zu 160 Zeichen der Query-Texte aus `pg_stat_statements` — keine Secrets, keine User-Daten, nur Schema-/Katalog-Statements.

### L4 — Gezielte EXPLAIN-ANALYZE-Tiefenprüfung der 3 Geld-RPC-Query-Pfade

- **Ziel:** Die generische Outlier-Liste aus L2/L3 zeigt Symptome projektweit, aber nicht gezielt, ob genau die Geld-RPCs betroffen sind. Diese Tiefenprüfung schließt das.
- **Zwingende Sicherheitsregel (siehe auch Abschnitt 0):** `EXPLAIN ANALYZE` auf einen RPC-Aufruf selbst (`EXPLAIN ANALYZE SELECT settle_game_bet(...)`) ist **verboten** — die Funktion würde real ausgeführt inklusive Wallet-Mutation. Stattdessen: aus den Funktionskörpern in `045_fix_wallet_events_jackpot_regression.sql:99` (`settle_game_bet`), `058_reconcile_remote_schema_drift.sql:1138` (`start_game_round`), `014_fix_user_stats.sql:202` (`advance_blackjack_round`) die einzelnen `SELECT ... FROM wallet_transactions/users/game_rounds ...`-Lesestatements extrahieren und **nur diese** isoliert mit `EXPLAIN (ANALYZE, BUFFERS)` gegen `--linked` prüfen (reine `SELECT`-Statements sind bei `ANALYZE` sicher, da sie selbst bei echter Ausführung nichts mutieren).
- **Schritte:** Für jede der 3 Funktionen die relevanten internen `SELECT`-Statements identifizieren (per Lesen der Migrationsdatei, nicht raten), gegen `--linked` mit `EXPLAIN (ANALYZE, BUFFERS, COSTS, VERBOSE)` ausführen (Supabase Studio SQL-Editor oder `psql` mit `--linked`-Connection-String), Ergebnis in der Audit-Datei aus L3 als eigenen Abschnitt "Geld-RPC-Tiefenprüfung" ergänzen.
- **Verifizierung:** Alle 3 Funktionen haben mindestens einen dokumentierten `EXPLAIN ANALYZE`-Beleg mit tatsächlicher Laufzeit in Millisekunden.
- **Freigabe-Gate:** Keines, sofern die Sicherheitsregel eingehalten wird. **Money-Pfad:** Nein (bei korrekter Umsetzung — genau deshalb die zwingende Sicherheitsregel). **Security-Review:** Pflicht (Vier-Augen-Charakter: vor Ausführung nochmal bestätigen, dass keine der geprüften Queries eine `INSERT`/`UPDATE`/`DELETE`-Komponente enthält).
- **Umsetzung 2026-09-05:** Sicherheitsregel vollständig eingehalten: kein einziger RPC-Aufruf mit `EXPLAIN ANALYZE` ausgeführt. Funktionskörper aus 045:99 / 058:1138 / 014:202 gelesen, 6 interne reine `SELECT`-Pfade extrahiert und **nur diese** per `npx supabase db query "EXPLAIN (ANALYZE, BUFFERS) …" --linked` gegen **nicht-existierende IDs** geprüft (0 Zeilen, keine Locks, keine Mutation). Vier-Augen-Check dokumentiert: kein Statement mit DML-Komponente. **Ergebnis:** Alle 6 Pfade Index-Scan (u. a. `idx_wallet_transactions_history_cursor`, `idx_users_id`, `game_rounds_pkey`), Race-Guard sogar Index-Only-Scan auf `idx_game_rounds_active`; Actual 0.017–1.32 ms, alles unterhalb der 50-ms-Schwelle. Beleg als Abschnitt "Geld-RPC-Tiefenprüfung" in [`docs/database/audits/query-performance-2026-09-05.md`](../docs/database/audits/query-performance-2026-09-05.md) ergänzt. Nebenbefund dokumentiert (nicht behoben): Replay-Lookup auf `game_rounds` nutzt `idx_game_rounds_active` statt `game_rounds_user_id_request_id_key` — korrekt und schnell, optionaler Feinschliff.

### L5 — Befund bewerten: Index-Migration nur bei echtem Fund

- **Ziel:** Nicht auf Vorrat indizieren (widerspräche der bestehenden, bereits guten Praxis laut `worldmap/04_datenbank_migrationen.md`), aber einen echten Fund aus L3/L4 nicht ignorieren.
- **Schritte:** Ergebnisse aus L3 (`unused-indexes`, `seq-scans`, `outliers`) und L4 (RPC-Tiefenprüfung) gegen die Schwelle (>50 ms, Seq-Scan >5.000 Zeilen) auswerten. **Kein Fund (aktuell erwarteter Fall laut vorheriger Einschätzung):** Nur Audit-Datei als "kein Handlungsbedarf, nächster Quartals-Check am `<Datum + 3 Monate>`" abschließen. **Echter Fund:** Neue Index-Migration mit Pre-Flight-Kollisionscheck + Pflicht-`@migration-security-guard`-Review anlegen (K3, lokal) — der spätere Remote-Push dieser Migration bleibt regulär K4 (Jan-Freigabe), das ist keine neue Sonderregel dieses Plans.
- **Freigabe-Gate:** Nur im Fund-Fall, und dann ausschließlich der bereits bestehende K4-Prozess für den Remote-Push — keine Besonderheit. **Money-Pfad:** Nein. **Security-Review:** Nur im Fund-Fall Pflicht (neue Migration).
- **Umsetzung 2026-09-05 (Ergebnis: KEIN Fund, keine Index-Migration):** Auswertung L3: 6 Überschreitungen der 50-ms-Schwelle in `pg_stat_statements`, aber **alle sechs sind Infrastruktur-/Katalog-Queries** (`pg_sleep` aus Testinfrastruktur, `pg_catalog`-Introspection aus Studio/CLI) — keine Anwendungs-Query, keine Money-Pfad-Query. Kein Seq-Scan über 5.000 Aufrufe (max. beobachtete Seq-Scans: 0 auf allen Kern-Indizes). Auswertung L4: alle 6 Geld-RPC-Pfade Index-Scan, 0.017–1.32 ms. 30 unbenutzte Indizes sind informativ (viele davon Neu-Anlage in Migrationen 063/064 oder konfigurative Lookup-Tabellen) — Entfernung erst nach ≥ 90 Tagen Beobachtungswindow. **Entscheidung:** Keine Index-Migration. Nächster Quartals-Check: **~2026-12-05** (via `npm run db:perf-audit`, dann automatisiert falls L7 umgesetzt wird).

### L6 — Wiederholbarkeit: npm-Script ergänzen

- **Ziel:** Die in Abschnitt 2 bestätigte Lücke schließen (kein `perf`/`inspect`/`explain`-Script existiert).
- **Schritte:** `package.json` um `"db:perf-audit": "tsx scripts/audit-query-performance.ts"` ergänzen (Namenskonvention konsistent zu `backup:run`).
- **Verifizierung:** `npm run db:perf-audit` funktioniert identisch zu `npx tsx scripts/audit-query-performance.ts`.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** `package.json` um `"db:perf-audit": "tsx scripts/audit-query-performance.ts"` ergänzt (Zeile direkt nach `backup:run`, gleiche Namenskonvention). Verifiziert per `npm run db:perf-audit` — identisches Ergebnis zum Direktaufruf (Audit-Datei erneut erzeugt).

### L7 (optional, nachrangig) — CI-Cron-Automatisierung

- **Ziel:** Den quartalsweisen Check nicht auf "jemand erinnert sich" verlassen.
- **Schritte:** `.github/workflows/query-performance-audit.yml` nach Vorlage `doc-drift-check.yml` (Abschnitt 2): `schedule: cron` quartalsweise (z. B. `0 6 1 1,4,7,10 *`), `permissions: contents: read`, ruft `npm run db:perf-audit` (L6) auf. **Braucht `SUPABASE_ACCESS_TOKEN` als GitHub-Actions-Secret** — muss von Jan im Repo-Settings hinterlegt werden (LLM kann das nicht selbst, Secret-Store-Zugriff ist Jan-exklusiv laut `xx_sop/09_security_wallet_invariants.md`). **Das ist der einzige Punkt in diesem gesamten Plan, der Jan überhaupt berührt — und er ist optional.** Ohne L7 bleibt der Audit ein manuell (aber vollständig LLM-ausführbar) wiederholter Vierteljahres-Check.
- **Freigabe-Gate:** Nur für das Secret-Hinterlegen selbst (einmalig). **Money-Pfad:** Nein. **Security-Review:** Nein (Token ist bereits ein bestehendes, nur bisher nicht in CI verwendetes Credential, kein neues Berechtigungsmodell).
- **Umsetzung 2026-09-05:** [`.github/workflows/query-performance-audit.yml`](../.github/workflows/query-performance-audit.yml) gebaut nach Vorlage `doc-drift-check.yml`: quartalsweiser Cron (`0 6 1 1,4,7,10 *`, 1. Jan/Apr/Jul/Okt) + `workflow_dispatch`, `permissions: contents: read`, Actions-Pinning per Commit-SHA wie `security-staging.yml`. Der Workflow ruft `npm run db:perf-audit` auf; das Ergebnis landet als Summary im Run-View.
- **CI-Nachweis 2026-09-05 (🟢):** Jan hat das Secret `SUPABASE_ACCESS_TOKEN` hinterlegt (granulares Token v3, Read auf Project Settings/Database/Migrations). Zwei Nachjustagen waren nötig: (1) `supabase link` akzeptiert granulare Access-Tokens nicht (offener CLI-Bug [supabase/cli#6392](https://github.com/supabase/cli/issues/6392)) — der Workflow wurde daher auf den Management-API-Endpoint `/projects/{ref}/database/query/read-only` umgestellt (`e27aec1`); (2) `pg_stat_statements` liegt im Extension-Schema und ist im `search_path` des Endpunkts nicht auflösbar — dynamische Schemalookup via `pg_extension` (`1c9dcaf`). **Erster grüner Lauf: Run 33993162288** (workflow_dispatch, 2026-09-05, ~1 Min).

---

## 4 — Definition of Done

1. Ein wiederholbares Skript (L2/L6) ersetzt die bisherige Handanleitung, ohne die dokumentierte Methodik zu verändern.
2. Ein echter, datierter Auditlauf (L3) ersetzt die unbelegte "jüngster Remote-Audit"-Behauptung.
3. Alle 3 Geld-RPCs haben eine sichere, gezielte `EXPLAIN ANALYZE`-Tiefenprüfung (L4), ohne dass dabei reale Geldmutationen ausgelöst wurden.
4. Ein klarer, dokumentierter Entscheidungspfad für "Fund vs. kein Fund" verhindert sowohl Ignorieren echter Probleme als auch Index-Aufblähung auf Vorrat (L5).
5. (Optional) Der Check läuft automatisiert quartalsweise ohne manuelles Erinnern (L7).

---

## 5 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `docs/archive/05_Observability_und_Lasttest.md` (globale RPC-Latenz unter Last) abgegrenzt: Diese Datei prüft Index-Wirksamkeit isoliert, keinen Lasttest.
- [x] Abhängigkeiten benannt: L1 unabhängig; L2 vor L3 vor L4 vor L5; L6 kann parallel zu L3–L5 laufen; L7 unabhängig, nachrangig.
- [x] Neue Schreiboperation (nur im Fund-Fall in L5, sonst keine) hat Pre-Flight-Check und Pflicht-Security-Review.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 2, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen; der Widerspruch zwischen zwei bestehenden Dokumenten ist explizit benannt statt stillschweigend eine Seite zu glauben.
- [x] Keine Referenz doppelt gepflegt: Methodik und Schwellenwerte bleiben in `docs/database/07_indexing_query_performance.md`, hier nur referenziert und automatisiert.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 (inkl. der kritischen Sicherheitsregel für L4) + Abschnitt 2 liefern den kompletten Einstiegskontext.
- [x] **Kritischer Selbstcheck durchgeführt:** Die naheliegende, aber gefährliche Umsetzung ("EXPLAIN ANALYZE direkt auf die RPC-Aufrufe") wurde erkannt und explizit als verboten markiert, bevor sie in Code hätte landen können.

---

## 6 — Verwandte Artefakte

| Bedarf                                           | Datei                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 7)              | [`docs/database/07_indexing_query_performance.md`](../docs/database/07_indexing_query_performance.md) — wird in L1/L3 korrigiert/ergänzt |
| Globaler Lasttest (RPC-Latenz, kein Index-Fokus) | [`docs/archive/05_Observability_und_Lasttest.md`](../docs/archive/05_Observability_und_Lasttest.md)                                      |
| CI-Vorlage für L7                                | [`.github/workflows/doc-drift-check.yml`](../.github/workflows/doc-drift-check.yml)                                                      |
| Postgres-Migrations-Patterns, K-Level            | [`xx_sop/18_postgres_patterns_migrations.md`](../xx_sop/18_postgres_patterns_migrations.md)                                              |
| Supabase-Betriebs-SOP, Pre-Flight-Check          | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md)                                                                    |
| Gewichtete Subkategorien-Bewertung (Säule 7)     | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                                           |
| Übergeordnete Aufschlüsselung (Kategorie 02)     | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md)                                                        |
| Planungsdateien-Konvention                       | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                              |
