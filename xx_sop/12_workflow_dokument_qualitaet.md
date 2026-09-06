# Workflow-Jan Dokument-Qualität

> **Zweck:** Einheitlicher, wiederholbarer Maßstab für „Weltklasse"-Niveau bei Kontext-, Workflow-, Regel- und Design-Dateien (`xx_docs/`, `xx_sop/`). Ersetzt Ad-hoc-Einschätzung durch eine nachvollziehbare Rubrik. Kein Skill — reine Bewertungs- und Überarbeitungsmethodik nach `xx_sop/02_workflow_jan_execution.md`.

## 1 — Trigger und Start-Gate

- Gilt, wenn eine bestehende Datei in `xx_docs/`, `xx_sop/` oder `docs/<Kategorie>/` gezielt auf Weltklasse-Niveau gehoben werden soll (Einzelauftrag oder Batch-Audit).
- Gilt **nicht** als Ersatz für die reguläre `Doku-Aktualität`-Pflicht aus `CLAUDE.md` (Aktualisierung bei Architektur-/API-/Datenmodell-Änderungen bleibt laufend, unabhängig von dieser Rubrik).
- Vor Anwendung: betroffene Datei sowie den Code-/Repo-Zustand, den sie beschreibt, tatsächlich prüfen — nicht nur den Dateitext bewerten.
- **`docs/<Kategorie>/`-Dateien** erhalten zusätzlich zum Kern-8-Rubrik (Abschnitt 2) die additive Docs-Erweiterung (Abschnitt 2a) und folgen der Skeleton-Konvention (Abschnitt 2b). Kein neuer Subagent nötig — diese Bewertung läuft wie die bestehende Rubrik direkt über die Hauptsession (Option D, `docs/archive/06_docs_qualitaet_sop12_erweiterung.md`).

## 2 — Die 8-Kriterien-Rubrik

Jedes Kriterium wird mit 0–3 Punkten bewertet. Maximal 24 Punkte pro Datei.

|  #  | Kriterium                                   | 0 Punkte                                                    | 3 Punkte                                                                                         |
| :-: | :------------------------------------------ | :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
|  1  | **Verifizierbarkeit gegen Repo-Realität**   | Behauptungen ungeprüft übernommen                           | Jede Aussage stichprobenartig gegen tatsächliche Dateien/Commands/Code verifiziert               |
|  2  | **Konkretheit der Handlungsanweisung**      | Nur Prosa ("prüfen", "sicherstellen")                       | Ausführbare Befehle, Dateipfade, konkrete Schwellenwerte, wo anwendbar                           |
|  3  | **Vollständigkeit des Lebenszyklus/Scopes** | Einzelne Phasen fehlen komplett                             | Alle relevanten Phasen abgedeckt (z. B. Planung → Umsetzung → Verifikation → Rollout → Rollback) |
|  4  | **Bekannte-Probleme-Transparenz**           | Real existierende Abweichungen verschwiegen oder unentdeckt | Aktuelle Lücken/Inkonsistenzen im Repo explizit benannt                                          |
|  5  | **Cross-Referenz-Konsistenz**               | Tote Links, fehlende oder falsche Verweise                  | Alle Verweise korrekt, vollständig, in beide Richtungen konsistent                               |
|  6  | **Risiko-/Freigabeklassifizierung**         | Keine Kennzeichnung riskanter Schritte                      | K-Level oder gleichwertige Kennzeichnung bei jeder destruktiven/externen Aktion                  |
|  7  | **Lerneffekt-Tauglichkeit**                 | Nur WAS, kein WARUM                                         | Begründung macht Entscheidung nachvollziehbar, keine Blackbox                                    |
|  8  | **Aktualitäts-Check**                       | Datei nicht gegen aktuellen Code-Stand geprüft              | Nachweislich gegen aktuellen Stand verifiziert (Datum vermerkt)                                  |

## 2a — Docs-Erweiterung (nur für `docs/<Kategorie>/`, additiv zum Kern-8)

Gilt **nur** für Dateien unter `docs/<Kategorie>/`. Der Kern-8 (Abschnitt 2, max. 24 Punkte) bleibt für diese Dateien unverändert bewertbar; die folgenden 3 Kriterien kommen additiv hinzu (max. 9 Zusatzpunkte, Gesamt max. 33). `xx_docs/`/`xx_sop/`-Dateien werden weiterhin ausschließlich mit dem Kern-8 bewertet — die bestehende Scorecard in Abschnitt 6 bleibt dadurch unverändert gültig.

|  #  | Kriterium                                              | 0 Punkte                                                                | 3 Punkte                                                                                                                  |
| :-: | :----------------------------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
|  9  | **Dual-Audience-Split**                                | Nur eine Zielgruppe bedient                                             | Klar getrennte Executive-Summary (Jan, nicht-technisch) + Technical-Deep-Dive (LLM), wie `docs/auth/00_AUTH_OVERVIEW.md`  |
| 10  | **Diagramm-/Visualisierungs-Qualität**                 | Keine Diagramme trotz komplexer Datenflüsse                             | Mermaid-Flowchart/Sequenzdiagramm vorhanden, gegen echten Code verifiziert, Obsidian & Gold-Theming-konsistent            |
| 11  | **Submodul-Granularität & Master-Overview-Konsistenz** | Keine Submodul-Struktur oder Overview verweist nicht auf alle Submodule | Master-Datei verweist vollständig und korrekt auf alle nummerierten Submodule, jedes Submodul hat disjunkten Einzel-Scope |

### Tier-Zuordnung `docs/<Kategorie>/` (max. 33, proportional zur Kern-Skala)

| Punktzahl | Tier         |
| :-------- | :----------- |
| 0–11      | Top 80–100 % |
| 12–19     | Top 40–79 %  |
| 20–26     | Top 10–39 %  |
| 27–30     | Top 2–9 %    |
| 31–33     | Top 1 %      |

## 2b — Skeleton-Konvention für `docs/<Kategorie>/`

Extrahiert aus dem bestehenden Vorbild `docs/auth/` (siehe `worldmap/00_WORLDMAP_STATUS.md`, dort explizit als „Best-Practice-Vorbild" genannt), hier erstmals dokumentiert statt nur intuitiv nachgeahmt:

- `docs/<kategorie>/00_<KATEGORIE>_OVERVIEW.md` — Dual-Audience-Master: Abschnitt 1 „Executive Summary für Jan" (Tabelle, keine Fachbegriffe ungeklärt), Abschnitt 2 „Technischer Deep-Dive für das LLM" (Mermaid-Architektur- und/oder Sequenzdiagramm, gegen echten Code verifiziert).
- `docs/<kategorie>/NN_<submodul>.md` — nummerierte Einzeldateien mit disjunktem Scope, von der Overview-Datei vollständig verlinkt.
- Anzahl der Submodule richtet sich nach echten, thematisch unterscheidbaren Teilbereichen — **nicht** nach der Anzahl gemessener Unterkategorien in der zugehörigen `worldmap/`-Aufschlüsselung (KISS/YAGNI, siehe Abschnitt 4 Punkt 3: „ohne Umfang aufzublähen").
- Lifecycle (löschen/archivieren bei Bedarf) folgt `xx_sop/03_workflow_jan_planungsdateien.md` §5 — keine eigene, abweichende Regel.

## 3 — Tier-Zuordnung

| Punktzahl | Tier                                               |
| :-------- | :------------------------------------------------- |
| 0–8       | Top 80–100 % (grundlegend überarbeitungsbedürftig) |
| 9–14      | Top 40–79 % (funktional, aber lückenhaft)          |
| 15–19     | Top 10–39 % (solide, punktuelle Lücken)            |
| 20–22     | Top 2–9 % (sehr stark)                             |
| 23–24     | Top 1 % (Weltklasse)                               |

## 4 — Ablauf einer Einzel-Überarbeitung

1. Datei lesen, referenzierten Code/Repo-Zustand stichprobenartig gegenprüfen (nicht nur Text).
2. Gegen alle 8 Kriterien scoren, Lücken mit Datei-/Zeilenbezug konkret benennen.
3. Überarbeitung: fehlende Kriterien gezielt schließen, ohne Umfang aufzublähen (KISS/YAGNI — nicht jede denkbare Ergänzung ist ein Gewinn).
4. Reale, im Zuge der Prüfung entdeckte Repo-Probleme, die außerhalb des Dateiscopes liegen, in einem "Bekannte offene Probleme"-Abschnitt der Datei benennen statt eigenständig zu beheben (K4/K5-Grenze beachten).
5. Vorher-/Nachher-Score in Abschnitt 6 dieser Datei eintragen (Score, Diff, Tier, Status-Haken ≤14d, Timestamp, Kernänderungen).

## 5 — Ablauf eines Batch-Audits (Option 4)

- Ziel: schnelle Priorisierung über viele Dateien, nicht sofortige Vollüberarbeitung aller.
- Durchführung: Ein Subagent (Explore oder general-purpose) liest alle Zieldateien parallel, wendet Abschnitt 2 an und liefert eine kompakte Tabelle (Datei, 8 Einzelscores, Summe, Tier, max. 2 wichtigste Lücken).
- Das Ergebnis ersetzt keine Einzel-Überarbeitung — es liefert nur die Reihenfolge, in der Abschnitt 4 pro Datei angewendet wird.
- Nach jeder Einzel-Überarbeitung wird der Scorecard-Eintrag in Abschnitt 6 aktualisiert (Datei bleibt damit lebender Statusindikator, ähnlich `worldmap/00_WORLDMAP_STATUS.md`).

## 6 — Aktuelle Scorecard

> **Stand:** 2026-08-23. Audit über `xx_docs/` und `xx_sop/`, Stichproben-verifiziert gegen echten Code-/Repo-Zustand.
> **Legende Status (≤14d):** `✅` = innerhalb der letzten 14 Tage geprüft/überarbeitet · `⚠️` = älter als 14 Tage (Re-Audit fällig).

| Datei                                           | Score /24 |  Diff   | Tier        | Status (≤14d) | Zuletzt geprüft / verbessert | Wichtigste Lücken / Kernänderungen                                                                                                                          |
| :---------------------------------------------- | :-------: | :-----: | :---------- | :-----------: | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xx_sop/01_workflow_jan_option_gate.md`         |    11     |  Basis  | Top 40–79 % |      ✅       | 2026-08-23 18:30             | Nur Prosa-Anweisungen, keine Beispiel-Schwellenwerte                                                                                                        |
| `xx_sop/02_workflow_jan_execution.md`           |    12     |  Basis  | Top 40–79 % |      ✅       | 2026-08-23 18:30             | Reine Prozessprosa ohne konkrete Befehle/Schwellen                                                                                                          |
| `xx_sop/03_workflow_jan_planungsdateien.md`     |    12     |  Basis  | Top 40–79 % |      ✅       | 2026-08-23 18:30             | Keine Beispiele für Statuswerte in echten Plandateien geprüft                                                                                               |
| `xx_sop/05_database_supabase.md`                |    23     |  Basis  | **Top 1 %** |      ✅       | 2026-08-23 18:30             | Referenz — nach 8-Kriterien-Rubrik überarbeitet                                                                                                             |
| `xx_sop/04_design_system_ui.md`                 |    24     | **+12** | **Top 1 %** |      ✅       | 2026-08-23 20:25             | Reale Z-Index-Zonen (0–99999), Spring-Configs, Tabular-Nums, multisensorisches Feedback-System und K-Level.                                                 |
| `xx_sop/06_service_layer_casino.md`             |    24     | **+11** | **Top 1 %** |      ✅       | 2026-08-23 20:26             | Pure-Functions vs. Server-Services Trennung, 5-Phasen-Ablauf, Vitest-Befehle, K-Level und Concurrency-Erklärung.                                            |
| `xx_sop/07_api_backend_routes.md`               |    24     | **+7**  | **Top 1 %** |      ✅       | 2026-08-23 20:27             | 5-Phasen-Routen-Workflow, Schutzklassen-Matrix, Middleware-Ablauf, Upstash Rate-Limits und Fail-Closed.                                                     |
| `xx_sop/08_analytics_posthog.md`                |    24     | **+8**  | **Top 1 %** |      ✅       | 2026-08-23 20:28             | 5 Datenschutz-Invarianten, Zod-strict Allowlist-Ablauf, HMAC-Identity, Erasure und Modulübersicht.                                                          |
| `xx_sop/09_security_wallet_invariants.md`       |    24     | **+9**  | **Top 1 %** |      ✅       | 2026-08-23 20:29             | 5 Finanz-Invarianten, Sequence-Diagramm, `pg_advisory_xact_lock`, Secret-Isolation und Provably-Fair Formel.                                                |
| `xx_sop/10_workflow_frontend_revamp.md`         |    24     | **+12** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | 3-Optionen-Vorlage, 5-Phasen-Revamp-Lebenszyklus, Responsive-Audit-Befehle (`fast-responsive-audit.mjs`), K-Level.                                          |
| `xx_sop/15_workflow_frontend_taste_qc.md`       |    24     | **+12** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | Skill-Routing Persuade/Operate, Framer-Motion Leaf-Isolation, `useMotionValue`-Standards, K-Level.                                                          |
| `xx_sop/16_motion_and_ui_polish.md`             |    24     | **+14** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | Konzentrische Radien ($R_{out}=R_{in}+P$), $44\times44$px Hit-Areas, `tabular-nums`, Framer Motion 12 AnimatePresence-Verträge & A11y.                      |
| `xx_sop/17_web_design_quality.md`               |    24     | **+14** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | Anti-Template-Direktive, Obsidian & Gold Tiefen-Layering, Bento-Grid-Komposition, 6 Qualitätssäulen & K-Level.                                              |
| `xx_sop/18_postgres_patterns_migrations.md`     |    24     | **+15** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | Zero-Downtime Expand-Contract-Pattern, Batch-Backfill mit `FOR UPDATE SKIP LOCKED`, Advisory Locks, RLS-Optimierung (`(SELECT auth.uid())`) & Index-Matrix. |
| `xx_sop/19_security_review_standards.md`        |    24     | **+15** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | 5 Zero-Trust-Mandate, 0% Browser Wallet-Autorität, Timing-Safe Comparison, Zod-strict, Log-Sanitization & Provably Fair Kette.                              |
| `xx_sop/11_cicd_deployment.md`                  |    24     | **+6**  | **Top 1 %** |      ✅       | 2026-08-23 20:31             | 3 GitHub-Workflows, Release-Lebenszyklus, Fehler- und Rollback-Matrix, Concurrency-Regeln und K1–K5 Matrix.                                                 |
| `xx_sop/99_cloth_verbesserungen.md`             |    24     | **+13** | **Top 1 %** |      ✅       | 2026-08-23 20:15             | Startkontext-Verschlankung (≤80 Zeilen), 5-Ebenen-Architekturmodell, Paritäts-Checks und Lerneffekt.                                                        |
| `xx_docs/08_api_backend_context.md`             |    24     | **+13** | **Top 1 %** |      ✅       | 2026-08-23 20:20             | Vollständiges 47-Routen-Inventar, `src/proxy.ts` Flussdiagramm, Rate-Limits, K-Level und Testbefehle.                                                       |
| `xx_docs/09_layout_shell_context.md`            |    24     | **+12** | **Top 1 %** |      ✅       | 2026-08-29 10:45             | SSR Session Prefetch, Tri-State ClientShell Routing, reale Z-Index-Staffelung (0–99999) und K-Level.                                                        |
| `xx_docs/03_execution_environment_reference.md` |    24     | **+10** | **Top 1 %** |      ✅       | 2026-08-23 20:36             | Vollständige K1–K5 Befehls-Matrix, Non-Interactive Flags, Plattformprofile (Antigravity, Claude, ChatGPT, Ollama).                                          |
| `xx_docs/10_games_context.md`                   |    24     | **+10** | **Top 1 %** |      ✅       | 2026-08-23 20:37             | 6 Spielmodule inkl. Multiplayer-Crash, Sequence-Diagramm, Wallet-Snapshot-Integration und K-Level.                                                          |
| `xx_docs/05_service_layer_context.md`           |    24     | **+9**  | **Top 1 %** |      ✅       | 2026-08-23 20:38             | Vollständiges Inventar aller Module in `src/lib/casino/` inkl. der 4 zuvor fehlenden Module, Importgrenzen und Testbefehle.                                 |
| `xx_docs/06_analytics_context.md`               |    24     | **+8**  | **Top 1 %** |      ✅       | 2026-08-23 20:39             | Vollständige 14-Event Zod-Allowlist, Modulübersicht, Privacy-Laufzeitkette, Testbefehle und K-Level.                                                        |
| `xx_docs/07_state_store_context.md`             |    24     | **+7**  | **Top 1 %** |      ✅       | 2026-08-23 20:40             | Persistenz-Matrix (`casino-storage` v3), Snapshot-Validierung (`walletSnapshotSchema`), Testbefehle und K-Level.                                            |
| `xx_docs/11_cicd_deployment_context.md`         |    24     | **+5**  | **Top 1 %** |      ✅       | 2026-08-23 20:41             | 3 Ausführungsebenen (Quality, Staging, Delivery), Secret-Isolation, Zuständigkeiten und K-Level Matrix.                                                     |
| `xx_docs/01_supabase_context.md`                |    24     | **+11** | **Top 1 %** |      ✅       | 2026-08-23 21:00             | 3-Client-Architektur (`client`, `server`, `admin`), 53 Migrationen, Tabellen- & RPC-Inventar, Advisory Locks und K-Level.                                   |

**Systemischer Fortschritt:** Alle 10 `xx_docs/`-Dateien und alle Kern-SOPs (`xx_sop/04, 05, 06, 07, 08, 09, 10, 11, 15, 16, 17, 18, 19, 99`) befinden sich nun ausnahmslos auf Top 1 % Weltklasse-Niveau (24/24 Punkte).

**Verbleibende Einzel-Überarbeitungen:**

1. `xx_sop/01_workflow_jan_option_gate.md` (Score: 11) — reine Prosa, benötigt quantitative Entscheidungskriterien für Optionen A/B/C
2. `xx_sop/02_workflow_jan_execution.md` (Score: 12) — benötigt konkrete Prüfbefehle & Schwellenwerte
3. `xx_sop/03_workflow_jan_planungsdateien.md` (Score: 12) — Plandateien-Lifecycle & Statusvalidierung

## 7 — Verwandte Artefakte

| Bedarf                                           | Datei                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ausführung und Verifikation                      | `xx_sop/02_workflow_jan_execution.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Plan-/Statuspflege                               | `xx_sop/03_workflow_jan_planungsdateien.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Docs-Erweiterung + Pilot-Entscheidung (Option D) | `docs/archive/06_docs_qualitaet_sop12_erweiterung.md` (abgeschlossene Plandatei)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Referenzbeispiel Docs-Erweiterung                | `docs/auth/00_AUTH_OVERVIEW.md` (Vorbild), `docs/database/00_DATABASE_OVERVIEW.md` (Pilot)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Referenzbeispiele einer Weltklasse-Überarbeitung | `xx_sop/04_design_system_ui.md` · `xx_sop/05_database_supabase.md` · `xx_sop/16_motion_and_ui_polish.md` · `xx_sop/17_web_design_quality.md` · `xx_sop/18_postgres_patterns_migrations.md` · `xx_sop/19_security_review_standards.md` · `xx_sop/06_service_layer_casino.md` · `xx_sop/07_api_backend_routes.md` · `xx_sop/08_analytics_posthog.md` · `xx_sop/09_security_wallet_invariants.md` · `xx_sop/10_workflow_frontend_revamp.md` · `xx_sop/11_cicd_deployment.md` · `xx_sop/99_cloth_verbesserungen.md` |
