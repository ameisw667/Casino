# 01 — Migrations-Disziplin & Versionierung

> **Status:** In Execution (L1/L2/L4/L5 verifiziert, L3: Workflow steht — Restnachweis „CI-Lauf grün" benötigt einmalig das GitHub-Secret `SUPABASE_ACCESS_TOKEN` von Jan, siehe Ampel) · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** CI-Backstop für den bereits real existierenden Kollisions-Check, Audit-Trail für den Migration-Security-Guard, Doku-Aktualisierung, kompensierendes Rollback-Playbook. Keine Änderung an bestehenden Migrationen.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht), Abschnitt 2 (Subkategorien-Bewertung) und Abschnitt 3 (verifizierter Ist-Stand) vollständig. **Diese Säule ist im Kern bereits solide** — anders als die meisten anderen Säulen in dieser Planungsserie ist die zentrale Automatisierung (Kollisions-Check) hier echt, nicht fiktiv. Der Hauptfund ist Doku-Drift (059 vs. echt 063), kein kaputtes System.
2. Beginne bei L1. Kein Meilenstein braucht Jan.
3. **Migrationsnummer nie aus dieser Datei übernehmen** — immer frisch per `ls supabase/migrations | sort | tail -1` prüfen (Stand bei Abfassung: 063, kann sich verschoben haben).
4. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-04) | — | LLM | Nein |
| L1 | Doku-Korrektur: 059 → aktueller Stand, dynamisch formuliert | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L2 | CI-Backstop für Kollisions-Check (Husky ist umgehbar) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L3 | `supabase migration list` in CI (lokal/Remote-Drift früh erkennen) | 🟡 Workflow steht, CI-Lauf offener Nachweis | `.github/workflows/migration-drift-check.yml` steht; Logik lokal gegen echte Remote-Verbindung verifiziert (2026-09-05). In-CI-`workflow_dispatch`-Lauf erst nach einmaligem Anlegen des GitHub-Secrets `SUPABASE_ACCESS_TOKEN` durch Jan möglich | LLM (+ 1× Jan: Secret) | Nein |
| L4 | Migration-Security-Guard-Audit-Trail systematisieren | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L5 | Kompensierendes Rollback-Playbook (kein natives Down-Tooling) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |

**Warum kein Jan-Gate nötig ist:** Alle Meilensteine sind CI-Konfiguration, Doku-Korrektur oder ein reines Playbook/Template — kein Meilenstein ändert eine bestehende Migration, keiner braucht ein externes Secret oder Konto.

---

## 2 — Migrations-Disziplin in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3, nicht auf der bestehenden (teils veralteten) Doku.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 5 | Rollback-/Down-Migration-Tooling | **Top 90 %** | 🔴 | Kein natives Down-Migration-Tooling; Rollback läuft ausschließlich über manuell entworfene kompensierende Migrationen ohne Standardvorlage |
| 3 | Doku-Aktualität (genannte Migrationsanzahl/-bereich) | **Top 85 %** | 🔴 | `docs/database/01` und `worldmap/04` sprechen durchgehend von "001–059" — real bereits 001–063 |
| 7 | CI-seitige `migration list`-Verifikation | **Top 80 %** | 🔴 | `npm run supabase:migrations` läuft in keinem CI-Workflow — lokale/Remote-Drift wird erst beim manuellen Push-Versuch sichtbar |
| 4 | CI-Backstop für Kollisions-Check | **Top 70 %** | 🟡 | Kollisions-Check ist real, aber nur als lokaler Husky-Hook — umgehbar mit `--no-verify` oder bei Pushes ohne lokalen Hook (z. B. GitHub-Web-UI-Edit) |
| 6 | Migration-Security-Guard-Audit-Trail | **Top 60 %** | 🟡 | Realer Nutzungsnachweis existiert (Migration 063 explizit "Guard PASS" dokumentiert), aber verstreut in einzelnen Archiv-Plandateien statt zentral nachvollziehbar |
| 8 | No-Op-/Altlast-Historie-Klarheit | **Top 20 %** | 🟢 | K6-A hat Guild-Rückbau und No-Op-Marker (053) sauber dokumentiert und abgeschlossen |
| 9 | Historische Konsolidierungsdatei-Pflege | **Top 15 %** | 🟢 | Alte Konsolidierungsdatei korrekt nach `docs/archive/` verschoben, nicht mehr im aktiven `supabase/`-Ordner |
| 10 | Seed-Daten-Konsistenz | **Top 15 %** | 🟢 | Seed bewusst deaktiviert (`db.seed.enabled = false`), dokumentiert, kein Widerspruch zwischen Config und Doku |
| 2 | Kollisions-Check-Automatisierung (Existenz) | **Top 10 %** | 🟢 | Real vorhanden: `.husky/pre-commit` führt `uniq -d`-Check bei jedem Commit auf `supabase/migrations/**` aus, bricht bei Kollision ab |
| 1 | Kollisions-Freiheit (aktueller Zustand) | **Top 5 %** | 🟢 | Verifiziert: 001–063 lückenlos, jede Nummer genau einmal vergeben, keine offene Kollision |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #5 (kein Rollback-Standard) und #3 (Doku-Drift) sind die größten Lücken. #7 und #4 sind verwandt — beide fehlt ein CI-seitiger Backstop für etwas, das lokal bereits gut funktioniert (Kollisions-Check) oder manuell gut dokumentiert ist (`migration list`). #6 ist ein Nachvollziehbarkeits-, kein Sicherheitsproblem — der Guard wird nachweislich genutzt, nur nicht zentral geloggt. #1, #2, #8, #9, #10 sind bereits solide — reiner Erhalt-Modus, **diese Säule braucht keine tiefgreifende Sanierung**, anders als die meisten anderen in dieser Planungsserie.

---

## 3 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Aktueller Zustand ist sauber:** 63 Migrationsdateien, Präfixe 001–063, jede Nummer genau einmal vergeben, keine Lücke. Die früher dokumentierten Kollisionen (`049`/`050` doppelt) sind aufgelöst — die zweiten Dateien wurden zu `055_custom_access_token_hook.sql` und `056_user_notifications.sql` umnummeriert. Die frühere Lücke bei `053` ist mit `053_guild_feature_intentionally_removed.sql` als bewusstem No-Op-Platzhalter geschlossen.

**Kollisions-Check ist real automatisiert, nicht nur SOP-Prosa:** [`.husky/pre-commit`](../.husky/pre-commit) (Zeilen 1–7) führt bei jedem Commit, der `supabase/migrations/**` berührt, `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` aus und bricht mit `exit 1` bei einem Treffer ab. Das ist eine der wenigen Automatisierungen in dieser gesamten Planungsserie, die **tatsächlich existiert und nicht nur dokumentiert ist** — anders als die fiktiven Skripte in Säule 8/9/10. `security-staging.yml` referenziert denselben Befehl zusätzlich als Diagnose-Hinweis, aber kein GitHub-Actions-Job führt ihn aktiv und blockierend selbst aus.

**Kein Rollback-/Down-Migration-Tooling:** Keine Treffer für `rollback`/`down.sql` in `supabase/` oder `scripts/`. Rollback läuft ausschließlich über kompensierende Migrationen oder `supabase migration repair` — kein Standardformat, keine Vorlage dafür im Repo.

**Signifikanter Doku-Drift:** `docs/database/01_migrations_und_versionierung.md` behauptet durchgehend „59 fortlaufend nummerierte Migrationsdateien" (Zeilen 3–4, 50–52, 158) und listet die Historie nur bis `059`, ohne `060`–`063` (`pg_cron_retry_failure_handling`, `wallet_transactions_history_cursor_index`, `bot_signal_types`, `user_wellbeing_limits`). `worldmap/04_datenbank_migrationen.md` (Stand 2026-08-29) ist ebenfalls auf 059 stehen geblieben; die dort beschriebenen Kollisions-/Lücken-Befunde (Zeilen 47–48) sind durch die zwischenzeitliche Umnummerierung überholt.

**`npm run supabase:migrations` läuft nirgends in CI:** Keine Treffer für `supabase:migrations`/`migration list` in den 6 GitHub-Actions-Workflows. Rein manuell, wie in `xx_sop/05_database_supabase.md` Abschnitt 2 als Pre-Flight-Schritt beschrieben — funktioniert, aber ohne automatisierten Frühwarn-Mechanismus.

**Migration-Security-Guard: real genutzt, aber verstreut dokumentiert:** Für Migration `063` dokumentiert `docs/archive/06_2_responsible_gambling_controls_plan.md:26` explizit „Guard PASS, authenticated role fail-closed verifiziert". Für `061`/`062` referenzieren die zugehörigen Archiv-Pläne den Guard als Pflicht-Gate, aber ohne ein ebenso explizites PASS-Ergebnis im Text. Die dedizierten Eval-Runs unter `.claude/agent-evals/06_migration_security_guard/runs/` sind alle älter (2026-08-24/25, reine Fixture-Evaluierungen) als die Migrationen 060–063 — der reale Produktiveinsatz wird also nicht an derselben Stelle geloggt wie die Agent-Kalibrierung selbst.

---

## 4 — Meilensteine

### L1 — Doku-Korrektur: 059 → aktueller Stand, dynamisch formuliert

- **Ziel:** Den in Abschnitt 3 belegten Drift schließen, ohne ihn bei der nächsten Migration erneut zu erzeugen.
- **Schritte:**
  1. `docs/database/01_migrations_und_versionierung.md` Zeilen 3–4, 50–52, 158: Zahl "59" durch den aktuellen Stand ersetzen (`ls supabase/migrations | sort | tail -1` frisch abfragen), Historie-Abschnitt um 060–063 ergänzen.
  2. `worldmap/04_datenbank_migrationen.md` Zeilen 47–48 (Kollisions-/Lücken-Befunde): als historisch überholt kennzeichnen — die beschriebenen Kollisionen sind inzwischen durch Umnummerierung aufgelöst (055/056).
  3. Wo möglich, Formulierungen so wählen, dass sie nicht bei jeder neuen Migration erneut veralten (Muster bereits etabliert in `T_DATABASE/02_database_schema_design.md` L2: "aktuell bis Migration NNN, per `npm run supabase:migrations` prüfbar" statt einer bloßen Zahl).
- **Verifizierung:** Genannte Zahl in beiden Dateien stimmt mit `ls supabase/migrations | sort | tail -1` überein.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — CI-Backstop für Kollisions-Check

- **Ziel:** Den bereits real funktionierenden, aber umgehbaren lokalen Husky-Check um eine CI-seitige Absicherung ergänzen (Subkategorie #4).
- **Schritte:** Neuer Schritt in `quality-ci.yml` (läuft bei jedem PR): denselben Befehl wie im Husky-Hook (`ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d`) ausführen, PR-Check schlägt bei einem Treffer fehl. Kein Secret nötig, rein lokale Dateisystem-Prüfung.
- **Verifizierung:** Workflow einmal absichtlich mit einer temporär duplizierten Präfix-Nummer getestet (lokal simulieren, nicht committen), CI-Schritt schlägt fehl; danach zurücksetzen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — `supabase migration list` in CI

- **Ziel:** Lokale/Remote-Drift automatisiert früh erkennen, nicht erst beim manuellen `db push`-Versuch (Subkategorie #7).
- **Schritte:** Neuer, geplanter (Cron, z. B. täglich oder wöchentlich) CI-Job, der `npx supabase migration list --linked` ausführt und bei unerwarteter Abweichung zwischen lokal und remote eine sichtbare Warnung erzeugt (kein harter Fail nötig, da Drift manchmal beabsichtigt zwischen Entwicklungsphasen ist — informativ wie `doc-drift-check.yml`, nicht blockierend).
- **Verifizierung:** Workflow einmal per `workflow_dispatch` ausgelöst, Lauf grün beobachtet.
- **Freigabe-Gate:** Keines (read-only `--linked`-Abfrage, K1-Klasse laut bestehender K-Matrix). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Migration-Security-Guard-Audit-Trail systematisieren

- **Ziel:** Den in Abschnitt 3 belegten realen, aber verstreuten Nutzungsnachweis zentral nachvollziehbar machen (Subkategorie #6).
- **Schritte:** Neue, fortlaufend gepflegte Datei `docs/database/migration-guard-log.md` (oder Ergänzung in `docs/database/01_migrations_und_versionierung.md`): eine Tabelle mit Spalten Migration-Nummer, Datum, Guard-Ergebnis (`PASS`/`FINDING`/`BLOCKED`), Verweis auf die zugehörige Plandatei. Rückwirkend für 060–063 aus den bereits vorhandenen Archiv-Plänen befüllen (063 hat bereits ein explizites PASS, 060–062 ggf. nachträglich verifizieren oder als "Guard-Pflicht erfüllt, Einzel-PASS nicht separat dokumentiert" kennzeichnen — keine rückwirkende Erfindung von Ergebnissen).
- **Verifizierung:** Tabelle enthält einen Eintrag für jede Migration ab 060.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Kompensierendes Rollback-Playbook

- **Ziel:** Die größte reale Lücke (Subkategorie #5) schließen — **kein** natives Down-Migration-Tooling bauen (Supabase/Postgres-DDL-Historie unterstützt das strukturell nicht ohne Datenverlustrisiko bei bereits angewendeten, datentragenden Migrationen), sondern ein standardisiertes Vorgehen dafür dokumentieren.
- **Schritte:**
  1. Neue Datei `docs/database/rollback-playbook.md`: Schritt-für-Schritt-Vorgehen für eine kompensierende Migration (wann anwendbar, wann nicht — z. B. bei reinem Schema ohne Datenverlust unkritisch, bei bereits geschriebenen Produktdaten nur mit Datenmigration statt reinem Rollback).
  2. Vorlage für den Kommentarkopf einer kompensierenden Migration (analog zum bereits etablierten Muster in `059_harden_legacy_definer_search_path.sql`, das den früheren Drift dokumentiert).
  3. Explizit begründen, warum kein automatisiertes `down.sql`-Tooling gebaut wird: Datenverlustrisiko bei automatischem Rückbau bereits geschriebener Produktdaten ist höher als der Nutzen eines generischen Skripts — bewusste Entscheidung, keine übersehene Lücke.
- **Verifizierung:** Playbook existiert, mindestens ein historisches Beispiel (058/059 Drift-Fix) wird als Referenzfall verlinkt.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Beide zentralen Dokumente nennen den aktuellen, korrekten Migrationsstand statt "059" (L1).
2. Der Kollisions-Check ist nicht mehr nur lokal umgehbar, sondern hat einen CI-Backstop (L2).
3. Lokale/Remote-Drift wird automatisiert sichtbar, nicht erst beim manuellen Push-Versuch (L3).
4. Migration-Security-Guard-Nutzung ist an einer zentralen Stelle nachvollziehbar, nicht über Archiv-Pläne verstreut (L4).
5. Ein dokumentiertes, begründetes Rollback-Playbook existiert, ohne ein riskantes automatisiertes Down-Migration-Tool zu bauen (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber anderen Säulen abgegrenzt: Diese Datei behandelt ausschließlich Migrations-Prozess/-Disziplin, keine Schema-Inhalte (Säule 2) oder pgTAP-Tests (Säule 10).
- [x] Abhängigkeiten benannt: Alle 5 Meilensteine sind unabhängig voneinander, keine erzwungene Reihenfolge außer der natürlichen Priorisierung nach Bottleneck-Größe.
- [x] Keine neue Schreiboperation an bestehenden Migrationen — alle Meilensteine sind additiv (neue CI-Schritte, neue Doku-Dateien).
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen.
- [x] Keine Referenz doppelt gepflegt: Kollisions-Check-Logik bleibt im Husky-Hook, hier nur um einen CI-Spiegel ergänzt (bewusste, begründete Redundanz als Backstop, kein Duplikat derselben Zuständigkeit).
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Ehrlichkeits-Check:** Diese Säule wurde nicht künstlich schlechter dargestellt, um mehr Meilensteine zu rechtfertigen — die 5 soliden Subkategorien (#1, #2, #8, #9, #10) sind explizit als "bereits gut" benannt, der Plan bleibt proportional zum tatsächlichen Lückenumfang.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 1) | [`docs/database/01_migrations_und_versionierung.md`](../docs/database/01_migrations_und_versionierung.md) — wird in L1 korrigiert |
| Bestehender, real funktionierender Kollisions-Check | [`.husky/pre-commit`](../.husky/pre-commit) |
| Supabase-Betriebs-SOP | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md) |
| Postgres-Migrations-Patterns | [`xx_sop/18_postgres_patterns_migrations.md`](../xx_sop/18_postgres_patterns_migrations.md) |
| Referenzfall für Drift-Fix (L5) | [`supabase/migrations/059_harden_legacy_definer_search_path.sql`](../supabase/migrations/059_harden_legacy_definer_search_path.sql) |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
