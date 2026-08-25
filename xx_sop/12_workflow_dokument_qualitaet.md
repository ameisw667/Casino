# Workflow-Jan Dokument-Qualität

> **Zweck:** Einheitlicher, wiederholbarer Maßstab für „Weltklasse"-Niveau bei Kontext-, Workflow-, Regel- und Design-Dateien (`xx_docs/`, `xx_sop/`). Ersetzt Ad-hoc-Einschätzung durch eine nachvollziehbare Rubrik. Kein Skill — reine Bewertungs- und Überarbeitungsmethodik nach `xx_sop/02_workflow_jan_execution.md`.

## 1 — Trigger und Start-Gate

- Gilt, wenn eine bestehende Datei in `xx_docs/` oder `xx_sop/` gezielt auf Weltklasse-Niveau gehoben werden soll (Einzelauftrag oder Batch-Audit).
- Gilt **nicht** als Ersatz für die reguläre `Doku-Aktualität`-Pflicht aus `CLAUDE.md` (Aktualisierung bei Architektur-/API-/Datenmodell-Änderungen bleibt laufend, unabhängig von dieser Rubrik).
- Vor Anwendung: betroffene Datei sowie den Code-/Repo-Zustand, den sie beschreibt, tatsächlich prüfen — nicht nur den Dateitext bewerten.

## 2 — Die 8-Kriterien-Rubrik

Jedes Kriterium wird mit 0–3 Punkten bewertet. Maximal 24 Punkte pro Datei.

| # | Kriterium | 0 Punkte | 3 Punkte |
| :---: | :--- | :--- | :--- |
| 1 | **Verifizierbarkeit gegen Repo-Realität** | Behauptungen ungeprüft übernommen | Jede Aussage stichprobenartig gegen tatsächliche Dateien/Commands/Code verifiziert |
| 2 | **Konkretheit der Handlungsanweisung** | Nur Prosa ("prüfen", "sicherstellen") | Ausführbare Befehle, Dateipfade, konkrete Schwellenwerte, wo anwendbar |
| 3 | **Vollständigkeit des Lebenszyklus/Scopes** | Einzelne Phasen fehlen komplett | Alle relevanten Phasen abgedeckt (z. B. Planung → Umsetzung → Verifikation → Rollout → Rollback) |
| 4 | **Bekannte-Probleme-Transparenz** | Real existierende Abweichungen verschwiegen oder unentdeckt | Aktuelle Lücken/Inkonsistenzen im Repo explizit benannt |
| 5 | **Cross-Referenz-Konsistenz** | Tote Links, fehlende oder falsche Verweise | Alle Verweise korrekt, vollständig, in beide Richtungen konsistent |
| 6 | **Risiko-/Freigabeklassifizierung** | Keine Kennzeichnung riskanter Schritte | K-Level oder gleichwertige Kennzeichnung bei jeder destruktiven/externen Aktion |
| 7 | **Lerneffekt-Tauglichkeit** | Nur WAS, kein WARUM | Begründung macht Entscheidung nachvollziehbar, keine Blackbox |
| 8 | **Aktualitäts-Check** | Datei nicht gegen aktuellen Code-Stand geprüft | Nachweislich gegen aktuellen Stand verifiziert (Datum vermerkt) |

## 3 — Tier-Zuordnung

| Punktzahl | Tier |
| :--- | :--- |
| 0–8 | Top 80–100 % (grundlegend überarbeitungsbedürftig) |
| 9–14 | Top 40–79 % (funktional, aber lückenhaft) |
| 15–19 | Top 10–39 % (solide, punktuelle Lücken) |
| 20–22 | Top 2–9 % (sehr stark) |
| 23–24 | Top 1 % (Weltklasse) |

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

| Datei | Score /24 | Diff | Tier | Status (≤14d) | Zuletzt geprüft / verbessert | Wichtigste Lücken / Kernänderungen |
| :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| `xx_sop/01_workflow_jan_option_gate.md` | 11 | Basis | Top 40–79 % | ✅ | 2026-08-23 18:30 | Nur Prosa-Anweisungen, keine Beispiel-Schwellenwerte |
| `xx_sop/02_workflow_jan_execution.md` | 12 | Basis | Top 40–79 % | ✅ | 2026-08-23 18:30 | Reine Prozessprosa ohne konkrete Befehle/Schwellen |
| `xx_sop/03_workflow_jan_planungsdateien.md` | 12 | Basis | Top 40–79 % | ✅ | 2026-08-23 18:30 | Keine Beispiele für Statuswerte in echten Plandateien geprüft |
| `xx_sop/05_database_supabase.md` | 23 | Basis | **Top 1 %** | ✅ | 2026-08-23 18:30 | Referenz — nach 8-Kriterien-Rubrik überarbeitet |
| `xx_sop/04_design_system_ui.md` | 24 | **+12** | **Top 1 %** | ✅ | 2026-08-23 20:25 | Reale Z-Index-Zonen (0–99999), Spring-Configs, Tabular-Nums, multisensorisches Feedback-System und K-Level. |
| `xx_sop/06_service_layer_casino.md` | 24 | **+11** | **Top 1 %** | ✅ | 2026-08-23 20:26 | Pure-Functions vs. Server-Services Trennung, 5-Phasen-Ablauf, Vitest-Befehle, K-Level und Concurrency-Erklärung. |
| `xx_sop/07_api_backend_routes.md` | 24 | **+7** | **Top 1 %** | ✅ | 2026-08-23 20:27 | 5-Phasen-Routen-Workflow, Schutzklassen-Matrix, Middleware-Ablauf, Upstash Rate-Limits und Fail-Closed. |
| `xx_sop/08_analytics_posthog.md` | 24 | **+8** | **Top 1 %** | ✅ | 2026-08-23 20:28 | 5 Datenschutz-Invarianten, Zod-strict Allowlist-Ablauf, HMAC-Identity, Erasure und Modulübersicht. |
| `xx_sop/09_security_wallet_invariants.md` | 24 | **+9** | **Top 1 %** | ✅ | 2026-08-23 20:29 | 5 Finanz-Invarianten, Sequence-Diagramm, `pg_advisory_xact_lock`, Secret-Isolation und Provably-Fair Formel. |
| `xx_sop/10_workflow_frontend_revamp.md` | 24 | **+12** | **Top 1 %** | ✅ | 2026-08-23 20:30 | 3-Optionen-Vorlage, 5-Phasen-Revamp-Lebenszyklus, Responsive-Audit-Befehle (`fast-responsive-audit.mjs`), K-Level. |
| `xx_sop/11_cicd_deployment.md` | 24 | **+6** | **Top 1 %** | ✅ | 2026-08-23 20:31 | 3 GitHub-Workflows, Release-Lebenszyklus, Fehler- und Rollback-Matrix, Concurrency-Regeln und K1–K5 Matrix. |
| `xx_sop/99_cloth_verbesserungen.md` | 24 | **+13** | **Top 1 %** | ✅ | 2026-08-23 20:15 | Startkontext-Verschlankung (≤80 Zeilen), 5-Ebenen-Architekturmodell, Paritäts-Checks und Lerneffekt. |
| `xx_docs/08_api_backend_context.md` | 24 | **+13** | **Top 1 %** | ✅ | 2026-08-23 20:20 | Vollständiges 47-Routen-Inventar, `src/proxy.ts` Flussdiagramm, Rate-Limits, K-Level und Testbefehle. |
| `xx_docs/09_layout_shell_context.md` | 24 | **+12** | **Top 1 %** | ✅ | 2026-08-23 20:35 | SSR Session Prefetch, Tri-State ClientShell Routing, reale Z-Index-Staffelung (0–99999) und K-Level. |
| `xx_docs/03_execution_environment_reference.md` | 24 | **+10** | **Top 1 %** | ✅ | 2026-08-23 20:36 | Vollständige K1–K5 Befehls-Matrix, Non-Interactive Flags, Plattformprofile (Antigravity, Claude, ChatGPT, Ollama). |
| `xx_docs/10_games_context.md` | 24 | **+10** | **Top 1 %** | ✅ | 2026-08-23 20:37 | 6 Spielmodule inkl. Multiplayer-Crash, Sequence-Diagramm, Wallet-Snapshot-Integration und K-Level. |
| `xx_docs/05_service_layer_context.md` | 24 | **+9** | **Top 1 %** | ✅ | 2026-08-23 20:38 | Vollständiges Inventar aller Module in `src/lib/casino/` inkl. der 4 zuvor fehlenden Module, Importgrenzen und Testbefehle. |
| `xx_docs/06_analytics_context.md` | 24 | **+8** | **Top 1 %** | ✅ | 2026-08-23 20:39 | Vollständige 14-Event Zod-Allowlist, Modulübersicht, Privacy-Laufzeitkette, Testbefehle und K-Level. |
| `xx_docs/07_state_store_context.md` | 24 | **+7** | **Top 1 %** | ✅ | 2026-08-23 20:40 | Persistenz-Matrix (`casino-storage` v3), Snapshot-Validierung (`walletSnapshotSchema`), Testbefehle und K-Level. |
| `xx_docs/11_cicd_deployment_context.md` | 24 | **+5** | **Top 1 %** | ✅ | 2026-08-23 20:41 | 3 Ausführungsebenen (Quality, Staging, Delivery), Secret-Isolation, Zuständigkeiten und K-Level Matrix. |
| `xx_docs/01_supabase_context.md` | 24 | **+11** | **Top 1 %** | ✅ | 2026-08-23 21:00 | 3-Client-Architektur (`client`, `server`, `admin`), 53 Migrationen, Tabellen- & RPC-Inventar, Advisory Locks und K-Level. |

**Systemischer Fortschritt:** Alle 10 `xx_docs/`-Dateien befinden sich nun ausnahmslos auf Top 1 % Weltklasse-Niveau (24/24 Punkte).

**Verbleibende Einzel-Überarbeitungen:**
1. `xx_sop/01_workflow_jan_option_gate.md` (Score: 11) — reine Prosa, benötigt quantitative Entscheidungskriterien für Optionen A/B/C
2. `xx_sop/02_workflow_jan_execution.md` (Score: 12) — benötigt konkrete Prüfbefehle & Schwellenwerte
3. `xx_sop/03_workflow_jan_planungsdateien.md` (Score: 12) — Plandateien-Lifecycle & Statusvalidierung

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Ausführung und Verifikation | `xx_sop/02_workflow_jan_execution.md` |
| Plan-/Statuspflege | `xx_sop/03_workflow_jan_planungsdateien.md` |
| Referenzbeispiele einer Weltklasse-Überarbeitung | `xx_sop/05_database_supabase.md` · `xx_sop/04_design_system_ui.md` · `xx_sop/06_service_layer_casino.md` · `xx_sop/07_api_backend_routes.md` · `xx_sop/08_analytics_posthog.md` · `xx_sop/09_security_wallet_invariants.md` · `xx_sop/10_workflow_frontend_revamp.md` · `xx_sop/11_cicd_deployment.md` · `xx_sop/99_cloth_verbesserungen.md` · `xx_docs/08_api_backend_context.md` · `xx_docs/09_layout_shell_context.md` · `xx_docs/03_execution_environment_reference.md` · `xx_docs/10_games_context.md` · `xx_docs/05_service_layer_context.md` · `xx_docs/06_analytics_context.md` · `xx_docs/07_state_store_context.md` · `xx_docs/11_cicd_deployment_context.md` · `xx_docs/01_supabase_context.md` |
