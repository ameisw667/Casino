# 11 — Query-Performance & Indexing

> **Status:** ✅ Ausgeführt (Säule 7, 2026-09-13; reale Last-/EXPLAIN-Läufe = Merge-Phase) · **Stand:** 2026-09-13 · **Owner:** LLM (kein Pflicht-Jan-Gate) · **Scope:** Von einer einmaligen Ruhezustands-Stichprobe zu einer kontinuierlichen, lastgekoppelten Performance-Verifikation mit Trendvergleich und Regressions-Alarm. Kein synthetischer Lasttest wird hier neu gebaut — die Lastquelle kommt aus `T_DATABASE/08_database_connection_pooling.md` N1 (Kopplung statt Duplikat).

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Warum diese Neufassung) und Abschnitt 2 (bereits vorhandene Audit-Infrastruktur, Referenz) vollständig.
2. **Wichtige Abhängigkeit:** N1 dieser Datei setzt voraus, dass `T_DATABASE/08_database_connection_pooling.md` Meilenstein L5a (Lasttest-Erweiterung) existiert oder gleichzeitig gebaut wird. Falls beide Dateien in derselben Session bearbeitet werden: 08-L5a zuerst oder parallel mit einem eigenen Subagenten, N1 hier konsumiert dessen Ausgabe.
3. N2–N4 sind unabhängig voneinander und können parallel bearbeitet werden.
4. **Sicherheitsregel, unbedingt vorher lesen (unverändert aus der Vorversion, weiterhin bindend):** Niemals `EXPLAIN ANALYZE` direkt auf einen Aufruf einer Geld-RPC (`settle_game_bet(...)`, `start_game_round(...)`, `advance_blackjack_round(...)`) anwenden — das würde die Funktion real ausführen inklusive aller Schreibeffekte. Nur die einzelnen `SELECT`/`UPDATE`-Statements **innerhalb** der Funktionskörper isoliert analysieren.

---

## 1 — Warum diese Neufassung existiert (Jan-Kontext)

Die Vorversion war vollständig ausgeführt (L0–L7, grüner CI-Lauf, quartalsweiser Cron aktiv) und trotzdem beim Re-Rating nur auf **Top 40 %** eingestuft. Der Grund ist strukturell, nicht ein Ausführungsfehler: Der bisherige Audit misst **ausschließlich im Ruhezustand** (`pg_stat_statements` ohne aktive Last) — eine Aussage wie "kein Fund" unter Idle-Last ist deutlich schwächer als eine Aussage unter realistischer, gleichzeitiger Last. Ein einzelner Messpunkt pro Quartal erlaubt zudem keine Trendaussage ("wird es langsam schlechter?") — nur einen Schwellenwert-Vergleich gegen einen absoluten Grenzwert.

Diese Neufassung schließt drei Lücken, ohne die bestehende, bereits solide Methodik zu verwerfen:

1. **Last-Kopplung statt Idle-Messung** (N1) — die eigentliche Ursache der Top-40-%-Bewertung.
2. **Trendspeicherung statt Einzel-Momentaufnahme** (N2/N3) — macht schleichende Verschlechterung sichtbar, bevor sie zum Fund wird.
3. **Breiteres Query-Set** (N4) — die Säule ist laut ihrer eigenen Gewichtungsbegründung für **breite Nutzererfahrung** verantwortlich, bisher wurden aber ausschließlich die 3 Geld-RPC-Pfade geprüft, nicht die tatsächlich nutzerseitig sichtbaren Lesepfade (Leaderboard, Admin-Dashboards).

Die **"Status"-Spalte der bisherigen Übersichtstabelle wurde entfernt** — durchgängig 🟢 ohne Informationswert, gleiches Muster wie bei den Säulen 9 und 10.

---

## 2 — Bereits vorhandene Audit-Infrastruktur (Referenz — nicht neu bauen)

- [`scripts/audit-query-performance.ts`](../scripts/audit-query-performance.ts): kapselt `calls`, `outliers`, `index-stats` (Supabase-CLI 2.116.0, `seq-scans`/`unused-indexes` sind deprecated und werden bereits aus `index-stats` abgeleitet).
- npm-Script: `npm run db:perf-audit`.
- CI: [`.github/workflows/query-performance-audit.yml`](../.github/workflows/query-performance-audit.yml) — quartalsweiser Cron + `workflow_dispatch`, nutzt `SUPABASE_ACCESS_TOKEN` (bereits von Jan hinterlegt) gegen die Management-API `/projects/{ref}/database/query/read-only` (CLI-`link`-Workaround wegen [supabase/cli#6392](https://github.com/supabase/cli/issues/6392)).
- Letzter belegter Auditlauf: [`docs/database/audits/query-performance-2026-09-05.md`](../docs/database/audits/query-performance-2026-09-05.md) — kein Fund im Anwendungspfad, alle 3 Geld-RPC-Lesepfade Index-Scan (0.017–1.32 ms).
- Schwelle (unverändert gültig): **>50 ms `EXPLAIN ANALYZE`** oder **Seq-Scan auf einer Tabelle mit >5.000 Zeilen**.
- 42 `CREATE (UNIQUE) INDEX`-Statements über die Migrationshistorie (Stand 2026-09-05, per `grep` vor Nutzung neu zählen — die Zahl driftet mit jeder neuen Migration).

---

## 3 — Neue Meilensteine (N1–N4)

### N1 — Last-Kopplung: Audit während echtem Lasttest statt nur im Ruhezustand

- **Ziel:** Die zentrale Schwäche der Vorversion beheben — eine Aussage "kein Fund" soll künftig unter realistischer gleichzeitiger Last gelten, nicht nur im Leerlauf.
- **Schritte:**
  1. `scripts/audit-query-performance.ts` um einen Modus `--sample-during-load` erweitern: statt eines Einzelaufrufs sampelt das Skript `pg_stat_statements`-Deltas in einem Intervall (z. B. alle 5 s) für die Dauer eines extern laufenden Lasttests.
  2. Abstimmung mit `T_DATABASE/08_database_connection_pooling.md` N1 (dortiger Lasttest liefert Connection-Counts; diese Datei liefert im selben Lauf die Query-Latenz-/Outlier-Zeitreihe) — **ein gemeinsamer Lasttest-Lauf, zwei Auswertungen**, keine doppelte Lasttest-Infrastruktur.
  3. `npm run loadtest:bet` (bestehend, siehe `docs/archive/05_Observability_und_Lasttest.md`) so erweitern/aufrufen, dass beide Sampler (Pooling-Health aus 08-N1, Query-Audit aus diesem Meilenstein) parallel während desselben Laufs mitschreiben.
  4. Ergebnis in `docs/database/audits/query-performance-load-<YYYY-MM-DD>.md` persistieren, mit klarer Trennung von der bestehenden Ruhezustands-Audit-Konvention (unterschiedlicher Dateiname-Präfix `-load-`).
- **Verifizierung:** Audit-Datei zeigt eine Zeitreihe mit sichtbar erhöhter `calls`/`outliers`-Aktivität während der Lastphase im Vergleich zur Ruhephase davor/danach (Beweis, dass die Last tatsächlich gemessen wurde, nicht nur behauptet).
- **Freigabe-Gate:** Keines (read-only, läuft lokal gegen die lokale Dev-Instanz). **Money-Pfad:** Nein. **Security-Review:** Nein.

### N2 — Historische Trendspeicherung

- **Ziel:** Aus Einzel-Momentaufnahmen eine Zeitreihe machen, die schleichende Verschlechterung sichtbar macht, bevor ein absoluter Schwellenwert überschritten wird.
- **Schritte:**
  1. `scripts/audit-query-performance.ts` schreibt zusätzlich zur Markdown-Datei einen kompakten JSON-Datensatz (Datum, p50/p95 je geprüftem Pfad, Anzahl Outlier-Funde) an eine append-only Datei `docs/database/audits/trend.jsonl` (ein JSON-Objekt pro Zeile, ein Lauf pro Zeile — kein Datenbank-Overhead nötig für diese Datenmenge, quartalsweise Läufe über Jahre bleiben klein).
  2. Kein Löschen/Überschreiben alter Einträge — reine Anhänge, damit die Historie vollständig bleibt.
- **Verifizierung:** Nach zwei aufeinanderfolgenden lokalen Testläufen enthält `trend.jsonl` zwei Zeilen mit unterschiedlichem Zeitstempel.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N3 — CI-Regressions-Gate gegen die Trendbaseline

- **Ziel:** Verschlechterung automatisch erkennen, statt auf den nächsten manuellen Blick in die Quartals-Audit-Datei zu warten.
- **Schritte:**
  1. Neues Skript `scripts/check-query-performance-regression.ts`: liest die letzten beiden Einträge aus `trend.jsonl` (N2), vergleicht p95 je Pfad. Bei Verschlechterung **>25 %** gegenüber dem Vorlauf **oder** einem neuen Seq-Scan-Fund, der im Vorlauf nicht vorkam: Exit-Code `1`.
  2. In [`.github/workflows/query-performance-audit.yml`](../.github/workflows/query-performance-audit.yml) nach dem bestehenden Audit-Schritt einhängen. Bei Fehlschlag: `gh issue create` (gleiches Muster wie `T_DATABASE/05_database_backup_and_recovery.md` N4 — kein neuer Alerting-Dienst nötig).
  3. **Bewusst kein Blocker für Deployments** (nur Cron/Dispatch, kein PR-Gate) — eine einzelne Lastspitze soll keinen Merge blockieren, aber sichtbar gemeldet werden.
- **Verifizierung:** Mit zwei absichtlich unterschiedlichen Fixture-Einträgen in einer Test-`trend.jsonl` (eine mit +40 % p95) erkennt das Skript die Regression korrekt; mit stabilen Werten bleibt es grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N4 — Breiteres Query-Set über die 3 Geld-RPCs hinaus

- **Ziel:** Die Gewichtungsbegründung dieser Säule lautet "betrifft Nutzererfahrung breit" — bisher wurden ausschließlich die 3 Geld-RPC-Lesepfade geprüft, nicht die tatsächlich breiten, nutzerseitig sichtbaren Pfade.
- **Schritte:**
  1. Kandidaten identifizieren: Leaderboard-Abfrage (`get_leaderboard`, Migration `015_get_leaderboard.sql`), Admin-Dashboard-Aggregationen (`src/app/admin/**`, per `grep` auf `.from(` / RPC-Aufrufe in den Admin-Datenquellen), Analytics-/Fraud-Aggregationen (029/030/040) — vor Testbau tatsächliche Nutzungshäufigkeit grob einschätzen (z. B. per `pg_stat_statements`-`calls`-Feld aus einem bestehenden Audit), nicht raten.
  2. Für jeden identifizierten Pfad denselben sicheren `EXPLAIN (ANALYZE, BUFFERS)`-Ansatz wie in der Vorversion für die Geld-RPCs anwenden — bei reinen `SELECT`-Abfragen (Leaderboard, Dashboards) ist direktes `EXPLAIN ANALYZE` unproblematisch, die Sicherheitsregel aus Abschnitt 0 gilt nur für RPCs mit Schreibeffekten.
  3. Ergebnis in dieselbe Audit-Datei wie N1 als zusätzlichen Abschnitt "Breites Query-Set" integrieren.
- **Verifizierung:** Mindestens 3 zusätzliche, nicht-Geld-RPC-Pfade haben einen dokumentierten `EXPLAIN ANALYZE`-Beleg.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine `SELECT`-Analyse ohne Schreibeffekte).

---

## 4 — Definition of Done & Abhängigkeiten

1. N1 hängt von `T_DATABASE/08_database_connection_pooling.md` L5a/N1 ab (gemeinsamer Lasttest) — bei paralleler Bearbeitung beider Dateien in derselben Session zuerst koordinieren, welcher Subagent den Lasttest tatsächlich startet, um doppelte gleichzeitige Läufe zu vermeiden.
2. N2 unabhängig, kann vor oder parallel zu N1 gebaut werden (reine Speicherlogik).
3. N3 nach N2 (braucht mindestens zwei Trend-Einträge, um sinnvoll zu vergleichen).
4. N4 vollständig unabhängig, kann jederzeit parallel laufen.
5. Erst nach N1–N4 gilt Säule 7 als voraussichtlich **Top 20–25 %** (statt der alten Top 40 %) — getragen durch lastgekoppelte statt Idle-Messung, Trendfähigkeit und ein Query-Set, das die tatsächliche Gewichtungsbegründung ("breite Nutzererfahrung") abdeckt.

---

## 5 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `T_DATABASE/08_database_connection_pooling.md` explizit abgegrenzt und verzahnt: der Lasttest selbst gehört zu 08, diese Datei konsumiert dessen Lauf nur für die Query-Auswertung — keine doppelte Lasttest-Infrastruktur (Verstoß gegen "keine Referenz doppelt gepflegt" wäre sonst hier entstanden).
- [x] Abhängigkeiten benannt (Abschnitt 4), Cross-Datei-Koordination bei paralleler Subagenten-Nutzung explizit adressiert.
- [x] Sicherheitsregel aus der Vorversion unverändert übernommen und in Abschnitt 0 vorangestellt (keine `EXPLAIN ANALYZE` auf Geld-RPC-Aufrufe direkt).
- [x] Neue Schreiboperationen (GitHub-Issue-Erstellung in N3) sind read-only bezüglich der Datenbank, kein Money-Pfad.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 1 + 2 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** N4 hätte naiv versuchen können, `EXPLAIN ANALYZE` pauschal auf alle RPCs anzuwenden — die Unterscheidung "reine SELECT-Pfade sind sicher, RPCs mit Schreibeffekt sind es nicht" wurde explizit als Kriterium benannt, um keinen Wiederholungsfehler der ursprünglich in der Vorversion vermiedenen Gefahr zu riskieren.

---

## 6 — Verwandte Artefakte

| Bedarf                                       | Datei                                                                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 7)          | [`docs/database/07_indexing_query_performance.md`](../docs/database/07_indexing_query_performance.md)             |
| Gekoppelter Lasttest (Quelle für N1)         | [`T_DATABASE/08_database_connection_pooling.md`](./08_database_connection_pooling.md) L5a / N1                    |
| Bestehendes Lasttest-Tooling                 | [`docs/archive/05_Observability_und_Lasttest.md`](../docs/archive/05_Observability_und_Lasttest.md)               |
| Letzter belegter Ruhezustands-Audit          | [`docs/database/audits/query-performance-2026-09-05.md`](../docs/database/audits/query-performance-2026-09-05.md) |
| CI-Vorlage                                   | [`.github/workflows/query-performance-audit.yml`](../.github/workflows/query-performance-audit.yml)               |
| Postgres-Migrations-Patterns, K-Level        | [`xx_sop/18_postgres_patterns_migrations.md`](../xx_sop/18_postgres_patterns_migrations.md)                       |
| Gewichtete Subkategorien-Bewertung (Säule 7) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                    |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`T_DATABASE/04_datenbank_migrationen.md`](../T_DATABASE/04_datenbank_migrationen.md)                             |
| Planungsdateien-Konvention                   | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                       |

---

## §9 — Ausführungsergebnis (Säule 7, 2026-09-13)

### §9.1 — Meilenstein-Status

| Meilenstein                               | Status           | Bemerkung                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1 Last-Kopplung (`--sample-during-load`) | ✅ Implementiert | Sampler im `audit-query-performance.ts` (Intervall 5 s, Stop-Marker-File, Max-Dauer 30 min als Sicherheitsnetz); Kopplung über `before`/`after`-Hooks in `scripts/loadtest/bet-flow.processor.mjs` + `bet-flow.artillery.yml`. **Realer Lauf deferred in Merge-Phase** (docker daemon down — L5a Lasttest aus Säule 8 benötigt laufende lokale Supabase). |
| N2 Trendspeicherung                       | ✅ Implementiert | `scripts/query-perf-trend.ts` + append-only `docs/database/audits/trend.jsonl`; `main()` des Idle-Audits hängt nach jedem Lauf einen Trend-Eintrag an; Last-Läufe landen mit `mode: 'load'` ebenfalls in der Historie.                                                                                                                                    |
| N3 Regressions-Gate                       | ✅ Implementiert | `scripts/check-query-performance-regression.ts` (> 25 % Verschlechterung je Pfad oder neuer Seq-Scan-Fund → Exit 1); CI-Hook in `query-performance-audit.yml` mit `continue-on-error` + `gh issue create`, **kein Deployment-Blocker** (Plan-konform).                                                                                                    |
| N4 breiteres Query-Set                    | ✅ Implementiert | `scripts/audit-broad-query-set.ts` mit 4-Pfad-Allowlist (get_leaderboard, get_community_stats, match_guide_documents, get_guide_feedback_summary); alle 4 per Migration als `STABLE` verifiziert (015, 016, 039, 042); **reale EXPLAIN-Läufe deferred in Merge-Phase**.                                                                                   |
| Sicherheitsregel Abschnitt 0              | ✅ Eingehalten   | Allowlist enthält ausschließlich per Migration verifizierte `STABLE`-Funktionen; Geld-RPC-Exklusion per Unit-Test abgesichert (`audit-broad-query-set.test.ts`).                                                                                                                                                                                          |

### §9.2 — 5-Stufen-Selbstprüfung

- Stufe 1 typecheck: ✅ (`tsc --noEmit` fehlerfrei)
- Stufe 2 Tests: ✅ 226 Dateien / 1715 Tests grün (neu: `query-perf-trend.test.ts` 6, `query-perf-regression.test.ts` 5, `audit-broad-query-set.test.ts` 3)
- Stufe 3 lint: ✅ 0 Fehler / 37 Pre-existing-Warnings
- Stufe 4 build: ✅
- Stufe 5 git status: ✅ (alle Artefakte auf Branch `database-queryperf` committet)

### §9.3 — Abweichungen vom Plan

1. **p50/p95 → meanMs-Approximation (N2/N3):** `pg_stat_statements` liefert keine Perzentile, nur `mean_exec_time`. Der Trend-/Regressionsvergleich läuft daher über die Top-Pfade nach `meanMs` — die konservativste verfügbare Approximation. Im Header von `query-perf-trend.ts` dokumentiert.
2. **N1-Sampler als Marker-File-Stopp statt Signal:** detached Child-Prozess + Stop-File (`query-perf-sampler.stop`, 5-s-Intervall-Prüfung) statt Prozess-Signalen — Artillery-Hooks und Sampler laufen in getrennten Prozessbäumen, Signal-Handling darüber ist unzuverlässig. Max-Dauer 30 min als Sicherheitsnetz, falls der after-Hook nie feuert.
3. **N3-Issue-Erzeugung als eigener CI-Step:** statt Exit-1-Gate mit nachgelagertem Issue-Material nutzt der Workflow `continue-on-error: true` + bedingten `gh issue create`-Step — der Audit-Lauf selbst bleibt grün gemeldet, die Regression wird aber sichtbar als Issue (Plan-konform: kein Blocker).
4. **N4-Allowlist mit 4 statt ≥ 3 Pfaden:** 4 nutzerseitig sichtbare Lesepfade gefunden und verifiziert — mehr als das Plan-Minimum.
5. **Reale DB-Läufe (N1-Lasttest, N4-EXPLAIN) deferred in Merge-Phase** — docker daemon down während der Ausführung; die N1-Kopplung setzt ohnehin die L5a-Lasttest-Infrastruktur aus Säule 8 voraus (Plan-Kopplung Abschnitt 0 Punkt 2).

### §9.4 — K5-/Jan-Reste

1. **L5a-Lasttest mit N1-Kopplung:** realer Lauf erst in Merge-Phase (docker daemon); ein gemeinsamer Lauf erzeugt beide Auswertungen (Pooler-Health aus 08-L5a + pg_stat_statements-Zeitreihe aus N1).
2. **N4-EXPLAIN-Läufe:** realer Lauf in Merge-Phase gegen lokale Instanz (`supabase db query --local`).
3. **N3-CI-Lauf:** erster CI-Lauf erzeugt ggf. das erste Issue nur bei echter Regression; trend.jsonl startet leer (erster Lauf grün).
4. **Secret:** `SUPABASE_ACCESS_TOKEN` bereits hinterlegt (Säule 7 L7-Konvention) — kein neues Secret nötig.

### §9.5 — Commits (ausgeführt, 6)

1. `e7858112` feat(queryperf): N2 trend.jsonl append-only Modul + Tests
2. `b8ce7fa9` feat(queryperf): N3 Regressions-Gate + CI-Hook (continue-on-error + gh issue, kein Blocker)
3. `9892629a` feat(queryperf): N4 breites Query-Set Audit (STABLE-Allowlist, 4 Pfade)
4. `4e80a06f` feat(queryperf): N1 --sample-during-load Sampler + Artillery-Kopplung (ein Lauf, zwei Auswertungen)
5. `9987a33c` chore(queryperf): npm-Scripts db:perf-regression + db:perf-broad-query-set
6. `36a94a6c` docs(queryperf): §9 Ausführungsergebnis + Status-Header (Säule 7 ausgeführt)
