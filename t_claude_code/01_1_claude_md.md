# 01.1 — CLAUDE.md / System-Prompt: Optimierung auf Weltklasse-Niveau (Top 1%)

> **Umbenannt am 2026-08-30** von `01_claude_md_worldclass_optimization.md` — Vereinheitlichung der Dateinamen im Ordner auf das Schema `01_<Kategorienummer>_<Kategoriename>.md` (Kategorie 1 aus `00_claude_code_uebersicht.md`). Inhalt unverändert, nur Dateiname und diese Kopfzeile neu.

> **Status:** Geplant · **Stand:** 2026-08-29 · **Owner:** Jan + LLM · **Scope:** Systematisches Audit, 10-Dimensionen-Benchmark (Top 1% bis 100%), Bottleneck-Analyse und schrittweiser Optimierungsplan für die zentrale Kontext- und Steuerungsdatei `CLAUDE.md` im Casino-Projekt.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                  | Status      | Nächster Schritt                                                     | Zuständigkeit |
| :----- | :------------------------------------------- | :---------- | :------------------------------------------------------------------- | :------------ |
| **M0** | **10-Dimensionen-Ist-Audit**                 | 🟢 Executed | Ergebnisse in Abschnitt 2 & 3 dokumentiert (Gesamtniveau: Top 8 %).  | LLM           |
| **M1** | **Bottleneck- & Lücken-Isolation**           | 🟢 Executed | 5 Kern-Schwachstellen isoliert (Abschnitt 3).                        | LLM           |
| **M2** | **Blueprint-Erstellung (Bausteine A–E)**     | 🟢 Executed | 5 modulare Text-Blöcke für `CLAUDE.md` bereitgestellt (Abschnitt 4). | LLM           |
| **M3** | **Review & Freigabe durch Jan**              | 🔴 Geplant  | Jan prüft Bausteine A–E auf Richtigkeit und Konsistenz.              | Jan           |
| **M4** | **Manuelle Übernahme in `CLAUDE.md`**        | 🔴 Geplant  | Übertrag der freigegebenen Bausteine in `CLAUDE.md`.                 | Jan           |
| **M5** | **Ökosystem-Angleichung (.agents & skills)** | 🔴 Geplant  | Synchronisation mit `.agents/rules/` und `.claude/agents/`.          | Jan + LLM     |

---

## 2 — 10-Dimensionen-Benchmark-Matrix (Top 1% bis 100%)

Die Skala bewertet die Effizienz, Kontext-Ökonomie und Steuerungspräzision der aktuellen Datei `CLAUDE.md` im Vergleich zu Best-Practice-Systemen aus dem agentischen AI-Ökosystem (_Everything Claude Code_, Anthropic Hackathon Standards).

|   #    | Dimension                                    | Kinderleicht erklärt: Was ist das eigentlich?                                                                                                                                                                                                            | Niveau (Ist) | Stärken (Was läuft bereits?)                                | Bottlenecks / Schwachstellen (Was bremst?)                                                                          |               Ziel-Niveau (Top 1%)                |
| :----: | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------: | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :-----------------------------------------------: |
| **1**  | **Instruktionsdichte & Signal-to-Noise**     | Wie viel Wichtiges auf wie wenig Text passt — wie eine gute, kurze Bedienungsanleitung statt eines langen Romans, in dem die wichtige Zeile irgendwo versteckt ist.                                                                                      | **Top 15 %** | Präzise Output- und Klärungs-Regeln.                        | Syntax-Bruch in Z. 16–17 (`[`xx_sop...`                                                                             | ...`); Fließtexte in Z. 65–130 blähen Prompt auf. | **Top 1 %** |
| **2**  | **Token- & Context-Ökonomie**                | Wie sparsam mit dem „Gedächtnis-Platz" der KI umgegangen wird. Die KI kann nur eine begrenzte Menge Text gleichzeitig „im Kopf" behalten — je weniger unnötiges Zeug dort steht, desto mehr Platz bleibt für die eigentliche Aufgabe.                    | **Top 10 %** | SOP-Router (`xx_sop/`) lagert Details on-demand aus.        | Redundanz zwischen Architekturbeschreibungen in `CLAUDE.md` und `xx_docs/05–10`.                                    |                    **Top 1 %**                    |
| **3**  | **Hard Invariants (Must Always / Never)**    | Die absoluten „Tu das niemals" / „Tu das immer"-Regeln, die unter keinen Umständen gebrochen werden dürfen — wie Verkehrsregeln, die immer gelten, egal wie die Situation aussieht.                                                                      | **Top 3 %**  | 0 % Client-Autorität, `search_path`, Zod, RPC-Locks.        | Noch als Prosatext formuliert statt als sofort scannbare tabellarische Hard-Guardrails.                             |                    **Top 1 %**                    |
| **4**  | **Tool-Execution & Zero-Friction Policy**    | Wie reibungslos die KI Befehle ausführen kann, ohne ständig nachfragen zu müssen oder unnötig hängen zu bleiben — wie eine gut geölte Tür statt einer, die bei jedem Öffnen klemmt.                                                                      | **Top 2 %**  | Auto-Allow-Klassen, non-interactive, kein Linter-File-Spam. | Keine explizite Regel für Windows-spezifische Pfadnotationen (`/` vs. `\`) in Tool-Aufrufen.                        |                    **Top 1 %**                    |
| **5**  | **On-Demand Routing & SOP-Architektur**      | Ob die KI weiß, wo sie im Zweifel nachschauen muss, statt vorher alles auf einmal lesen zu müssen — wie ein gutes Inhaltsverzeichnis in einem dicken Buch, das direkt zur richtigen Seite führt.                                                         | **Top 5 %**  | Vorbildliche Router-Tabelle am Ende der Datei.              | Neuere SOPs (`12_dokument_qualitaet`, `14_secret_rotation`, `19_security_review`) fehlen noch.                      |                    **Top 1 %**                    |
| **6**  | **Command- & Workflow-Automatisierung**      | Ob es fertige, griffbereite Kurzbefehle für wiederkehrende Aufgaben (Testen, Bauen, Prüfen) gibt — wie Kurzwahltasten am Telefon statt jedes Mal die ganze Nummer neu einzutippen.                                                                       | **Top 45 %** | 5 Basis-NPM-Befehle aufgelistet.                            | **Größter Bottleneck:** Keine Workflow-Ketten (Smoke-Tests, Single-Game-Runs, Security-Gates, Vibe-Check).          |                    **Top 1 %**                    |
| **7**  | **Subagent- & Delegations-Harness**          | Ob es spezialisierte „Helfer" gibt, an die bestimmte Prüf-Aufgaben automatisch weitergereicht werden (z. B. ein Sicherheits-Checker nur für Datenbank-Änderungen) — wie ein Team mit Spezialisten statt einem Alleskönner, der alles selbst machen muss. | **Top 20 %** | `@migration-security-guard` eingebunden.                    | Keine Trigger für Frontend-QC, Code-Simplifier oder Release-Guard.                                                  |                    **Top 1 %**                    |
| **8**  | **Session-Memory & Continuous Learning**     | Ob sich die KI merkt, was in früheren Gesprächen passiert ist, und aus wiederkehrenden Fehlern lernt — statt bei jedem neuen Gespräch komplett bei null anzufangen, wie ein Mitarbeiter mit gutem statt schlechtem Gedächtnis.                           | **Top 60 %** | Status-Nachweise in `worldmap/` vorhanden.                  | **Schwachstelle:** Kein Protokoll für Session-Handoffs, Context-Compaction-Vorbereitung oder Fehler-Pattern-Lernen. |                    **Top 1 %**                    |
| **9**  | **Verifikationsschleifen & Quality Gates**   | Ob es feste Kontrollpunkte gibt, an denen automatisch geprüft wird „ist das wirklich fertig und richtig?", bevor etwas als erledigt gilt — wie der TÜV-Check vorm Losfahren.                                                                             | **Top 12 %** | Verweis auf 5-Stufen-Prüfung in SOP 02.                     | Kein schneller Pre-Flight-Befehlskatalog für Routine-Checks vor Commits.                                            |                    **Top 1 %**                    |
| **10** | **Pädagogisches Alignment (Jan-Lerneffekt)** | Ob die KI so arbeitet, dass Jan dabei wirklich etwas lernt, statt ihm nur eine fertige Blackbox-Lösung hinzuwerfen, die er hinterher nicht versteht — wie ein guter Lehrer, der erklärt statt nur die Antwort zu verraten.                               | **Top 1 %**  | Verbot von Blackbox-Lösungen, klares Primärziel.            | Absolut weltklasse – muss unverändert an oberster Stelle verankert bleiben.                                         |                    **Top 1 %**                    |

**Gesamtergebnis:** **Top 8 % (92. Perzentil)** → Rechnerischer Schnitt über alle 10 Dimensionen.

### 2.1 — Umsetzungs-Status je Dimension (Spalten „Planungsdateien" & „Execution", ergänzt 2026-09-05)

Spaltenlogik (für alle Dateien `01_1`–`01_10` einheitlich): **Planungsdateien** = Datei, in der die Umsetzung des Themas geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise umgesetzt · 🔵 geplant/wartet auf Freigabe · ⚪ nicht geplant.

|  #  | Dimension                              | Planungsdateien                                                                                        | Execution                                                                              |
| :-: | :------------------------------------- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
|  1  | Instruktionsdichte & Signal-to-Noise   | — (Bausteine A–E in dieser Datei)                                                                      | 🔵 wartet auf Jan-Review (M3)                                                          |
|  2  | Token- & Context-Ökonomie              | — (Bausteine A–E in dieser Datei)                                                                      | 🔵 wartet auf Jan-Review (M3)                                                          |
|  3  | Hard Invariants                        | — (Baustein B)                                                                                         | 🔵 wartet auf Jan-Review (M3)                                                          |
|  4  | Tool-Execution & Zero-Friction         | — (Baustein C; **nur korrigierte Fassung** aus `01_4_command_workflow.md` §5 übernehmen)               | 🔵 wartet auf Jan-Review (M3)                                                          |
|  5  | On-Demand Routing                      | — (Baustein D)                                                                                         | 🔵 wartet auf Jan-Review (M3)                                                          |
|  6  | Command- & Workflow-Automatisierung    | [`01_4_command_workflow.md`](01_4_command_workflow.md) (K6-1–K6-3 → `xx_docs/02_command_reference.md`) | 🟡 2 Policy-Zeilen in `CLAUDE.md` übernommen, Rest geplant                             |
|  7  | Subagent- & Delegations-Harness        | [`01_3_custom_agents.md`](01_3_custom_agents.md) (K7-3)                                                | 🟡 `migration-security-guard` aktiv; 2 Piloten ohne Router-Zeile                       |
|  8  | Session-Memory & Continuous Learning   | [`01_5_session_memory.md`](01_5_session_memory.md) (§4a offen)                                         | 🟡 Abschnitt „Session-Kontinuität" in `CLAUDE.md` übernommen; Options-Gate A/B/C offen |
|  9  | Verifikationsschleifen & Quality Gates | [`01_4_command_workflow.md`](01_4_command_workflow.md) §3.2 (CI-Parität)                               | 🔵 geplant                                                                             |
| 10  | Pädagogisches Alignment                | —                                                                                                      | 🟢 umgesetzt (bereits auf Zielniveau, unverändert)                                     |

---

## 3 — Detaillierte Schwachstellen-Analyse

### 3.1 — Formatierungs- & Syntaxfehler (Zeile 16–17)

In der aktuellen `CLAUDE.md` befindet sich direkt unter Abschnitt 1 ein unvollständiger Markdown-Tabellenrest:

```markdown
### CI/CD & Deployment

[`xx_sop/11_cicd_deployment.md`](xx_sop/11_cicd_deployment.md) · [`xx_docs/11_cicd_deployment_context.md`](xx_docs/11_cicd_deployment_context.md) | Vor CI/CD-, GitHub-Actions-, Vercel-, Release- oder Rollback-Aufgaben zuerst Kontext und SOP lesen; Production nur nach ausdrücklicher Jan-Freigabe. |
```

_Problem:_ Dieser Block erzeugt ein ungültiges Tabellenfragment mitten im Text und verwirrt die hierarchische Gliederung für LLMs.

### 3.2 — Prosatext statt tabellarischer Negativ-Constraints

LLMs neigen bei langen Fließtexten zu Aufmerksamkeitsverlust (_Lost in the Middle_). Die Architekturabschnitte (Zeilen 65–130) enthalten essentielle Sicherheitsregeln (z. B. „0 % Wallet-Autorität“, „Keine Balance-Mutation im Store“), die jedoch in langen Paragraphen eingebettet sind.
_Lösung:_ Eine dedizierte `Must Always / Must Never`-Matrix am Dateianfang sorgt für 100 % deterministische Einhaltung.

### 3.3 — Command-Bottleneck: Nur Basis-Befehle

Aktuell existieren nur 5 Befehle (`npm run dev`, `test`, `typecheck`, `lint`, `build`). In einer Top-1%-Umgebung benötigt das LLM zielgerichtete Teil-Befehle, um nicht für eine kleine Änderung stets die gesamte 1.100+-Test-Suite laufen lassen zu müssen (Token- und Zeitverschwendung).

### 3.4 — Fehlendes Subagent- & Skill-Routing

Außer dem `@migration-security-guard` existiert kein systematisches Routing für Subagenten oder spezifische Arbeitsmodi.

### 3.5 — Fehlendes Session-Handoff- & Context-Budgeting-Schema

Wenn Konversationen lang werden, droht Context-Rot. In _Everything Claude Code_ wird dies durch definierte Übergabepunkte (`/save-session`, Handoff-Dateien in `.tmp/` oder `worldmap/`) gelöst.

---

## 4 — Blueprint & Modulare Textbausteine für `CLAUDE.md`

Diese 5 Bausteine können von Jan nach Prüfung direkt übernommen werden:

### Baustein A: Header, Schutzregel & Pädagogischer Leitstern

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Primärziel: Maximaler Lerneffekt für Jan

- **Projektzweck:** Das Projekt dient primär dem systematischen Skill- und Wissensaufbau von Jan anhand einer produktionsreifen Next.js/Supabase-Architektur.
- **Lerneffekt:** Bei der Implementierung neuer Features oder deren Evaluierung steht der Lerneffekt für Jan immer an erster Stelle.
- **Keine Blackbox-Lösungen:** Komplexe Logik nicht stillschweigend kapseln, sondern bei Übergaben und Planungsdateien die Funktionsweise in 1–2 prägnanten Sätzen greifbar machen.
- **Konfigurations-Schutz:** Editiere `CLAUDE.md` oder `AGENTS.md` unter keinen Umständen eigenständig — auch nicht im Rahmen der Doku-Aktualitäts-Pflicht — sondern nur nach expliziter Freigabe von Jan im laufenden Chat.
```

### Baustein B: Hard Invariants & Negativ-Constraints (Must Always / Must Never)

```markdown
## Hard Invariants & Guardrails

| Kategorie              | Must Always (Pflicht)                                                                                                                                    | Must Never (Strikt verboten)                                                                                                              |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Financial / Wallet** | Wallet-Updates nur via `applyServerWalletSnapshot()`. Atomare DB-RPCs mit `search_path = public` und `pg_advisory_xact_lock`.                            | 0 % Client-Autorität. Keine Mutation von Balance/XP in UI-Stores oder Page-Komponenten. Keine Ausführung veralteter `place_bet()`-Ketten. |
| **API & Backend**      | Idempotency-Key (`Idempotency-Key` / `requestId`) erzwingen. Fail-closed (4xx/503) bei DB-, Auth- oder Rate-Limit-Fehlern.                               | Niemals sensitive Keys/Secrets im Client exposen. Keine ungeschützten Admin-Routen (immer `SUPABASE_ADMIN_EMAILS`).                       |
| **State (Zustand)**    | Zustand hält ausschließlich UI-, View- und Toast-Status. Startbalance strikt `0`. Strikte Zod-Validierung via `walletSnapshotSchema`.                    | Niemals `balance`, `xp`, `level` oder `rank` in `localStorage` persistieren. `processGameResult()` mutiert niemals Guthaben.              |
| **Tool Execution**     | Native Tools (`view_file`, `write_to_file`, `replace_file_content`, `grep_search`) nutzen. Standardisierte Befehle ohne variable Pfade (`npm run lint`). | Niemals Datei-Operationen via Shell (`cat <<EOF`, `node -e`, `Set-Content`, `rm`). Keine dynamisch verketteten Commands (`cmd1 && cmd2`). |
| **Doku & Status**      | Live-/Prod-Status strikt aus `worldmap/00_WORLDMAP_STATUS.md` zitieren. Doku bei API-/Schema-Änderungen im selben Schritt synchronisieren.               | Niemals hypothetische Live-Zustände erfinden. Keine unbelegten Behauptungen ohne Verifikation.                                            |
```

### Baustein C: Erweiterte Command- & Verification-Matrix

> **Korrektur-Hinweis (2026-08-29, siehe [`01_4_command_workflow.md`](01_4_command_workflow.md) Abschnitt 2.2):** Zeile 120 (`npx vitest run tests/security/`) nennt einen Pfad, der in diesem Repo **nicht existiert**. Die echte Security-Testsuite liegt unter `src/lib/security/__tests__/`. Diesen Baustein bitte **nicht** unverändert übernehmen — korrigierte, verifizierte Fassung siehe `01_4_command_workflow.md` Abschnitt 5.

````markdown
## Commands & Verification Workflows

Vor nicht aufgeführten Skripten sowie vor Remote- oder Schreibaktionen `xx_docs/02_command_reference.md` lesen.
Auswahl und Reihenfolge der Prüfungen folgen `xx_sop/02_workflow_jan_execution.md`.

### 1. Standard-Befehle (Auto-Allow)

```bash
npm run dev          # Next.js Dev-Server auf Port 3015
npm run test         # Vitest Gesamt-Suite (CI-Modus)
npm run typecheck    # TypeScript Typ-Prüfung ohne Emit (tsc --noEmit)
npm run lint         # ESLint Gesamt-Prüfung (Projektweit)
npm run build        # Next.js Production Build
```
````

### 2. Gezielte Teil-Verifikationen (Token- und Zeitersparnis)

```bash
npx vitest run src/lib/casino/             # Service-Layer & Game-Engine Tests
npx vitest run src/app/api/                # API-Route & Idempotenz Tests
npx vitest run tests/security/             # Security & Invarianten Tests
npm run test -- src/components/casino/     # UI- & Komponenten Tests
npm run vibe-check                         # Vollständiger Multi-Check vor Übergaben
```

### 3. Execution & Auto-Allow Policy (Antigravity / CLI)

- **K1/K2 Auto-Allow**: Read-only (`git status`, `git diff`, `git log`) und CI/Test-Befehle laufen ohne manuelle Blockade.
- **Keine variablen Dateipfade an Linter**: Niemals `npx eslint file1.tsx ...` aufrufen, sondern immer **`npm run lint`**.
- **Non-Interactive Execution**: Befehle immer mit `--yes`, `-y`, `CI=true` ausführen.
- **No-Pager**: `PAGER=cat` oder `--no-pager` für Git-Befehle nutzen.
- **K5 Block**: Destruktive/Live-Befehle (`git push --force`, `rm -rf`, `supabase db reset`) erfordern zwingend manuelle Bestätigung.

````

### Baustein D: Vollständiger On-Demand Router (SOPs & Subagents)
```markdown
## Workflows, SOPs & Subagents (On-Demand Router)

Vor dem Ausführen strukturierter Aufgaben liest das LLM die entsprechende SOP via File-Read-Tool ein bzw. delegiert an den zuständigen Subagenten:

| Trigger / Aufgabe | SOP / Agent | Wann einlesen / aktivieren |
| :--- | :--- | :--- |
| **Workflow-Jan Option-Gate** | [`xx_sop/01_workflow_jan_option_gate.md`](xx_sop/01_workflow_jan_option_gate.md) | Vor Architektur-, Design- & Scope-Entscheidungen (3 Optionen nach Jan-Schema). |
| **Workflow-Jan Execution** | [`xx_sop/02_workflow_jan_execution.md`](xx_sop/02_workflow_jan_execution.md) | Bei Aufgaben-Umsetzung & 5-Stufen-Selbstprüfung. |
| **Planungs- & Meilensteine** | [`xx_sop/03_workflow_jan_planungsdateien.md`](xx_sop/03_workflow_jan_planungsdateien.md) | Vor dem Anlegen/Pflegen von Meilenstein-Dateien in `worldmap/`. |
| **Frontend, UI & Motion Hub** | [`xx_sop/04_design_system_ui.md`](xx_sop/04_design_system_ui.md) | Bei allen UI/UX-Themen — koordiniert intern: Revamp (`10`), Taste-QC (`15`), Motion (`16`) & Anti-Template (`17`). |
| **Supabase & DB-Migrationen** | [`xx_sop/05_database_supabase.md`](xx_sop/05_database_supabase.md) · [`xx_sop/18_postgres_patterns_migrations.md`](xx_sop/18_postgres_patterns_migrations.md) | Vor Schema-, RPC-, RLS-Änderungen oder Concurrency-Locks. |
| **Migration Security Review** | Subagent: `@migration-security-guard` (`.claude/agents/06_...`) | Read-only Pflicht-Review bei allen Änderungen unter `supabase/migrations/**`. |
| **Zero-Trust Security Review** | [`xx_sop/19_security_review_standards.md`](xx_sop/19_security_review_standards.md) | Vor Deployments, bei API-Endpunkten, Auth-Änderungen & Wallet-Schnittstellen. |
| **CI/CD & Deployment** | [`xx_sop/11_cicd_deployment.md`](xx_sop/11_cicd_deployment.md) | Vor Vercel-, GitHub-Actions- & Release-Aufgaben (Prod nur mit Jan-Freigabe). |
| **Dokumentations-Qualität** | [`xx_sop/12_workflow_dokument_qualitaet.md`](xx_sop/12_workflow_dokument_qualitaet.md) | Vor dem Erstellen oder Refaktorisieren kanonischer Dokumente. |
| **Secret-Handling & Rotation** | [`xx_sop/14_secret_rotation.md`](xx_sop/14_secret_rotation.md) | Bei API-Keys, Webhook-Secrets, Token-Erneuerung oder Env-Änderungen. |
````

### Baustein E: Session-State, Context-Budget & Model-Routing (ECC Best Practice)

```markdown
## Context Management & Model Routing

- **Token- & Tool-Budget:** Halte aktive MCPs und Tools schlank (< 10 aktive MCP-Server), um Context-Degradation zu verhindern.
- **Model Routing Matrix:**
  - _Fast / Haiku:_ Schnelle Datei-Suche, einfache Syntax-Checks, Dokumentations-Lookups.
  - _Balanced / Sonnet:_ 90 % aller Feature-Entwicklungen, Komponentenbau, UI- und API-Tasks.
  - _Deep / Opus / Pro:_ Kritische DB-Migrationen, Wallet-RPCs, Zero-Trust-Security-Reviews, komplexe Multi-File-Refactorings.
- **Anti-Halluzinations-Gate:** Behauptungen über Signaturen, Tabellenspalten oder Teststände müssen durch einen vorherigen Read-/Grep-Tool-Call belegt sein. Niemals Annahmen aus dem Gedächtnis als Fakten deklarieren.
- **Handoff- & Checkpoint-Disziplin:** Vor Context-Compaction oder Modellwechsel den Zwischenstand in der zuständigen Planungsdatei (`worldmap/`) mit 3 Punkten festhalten: (1) Was funktioniert verifiziert mit Evidenz? (2) Was schlug fehl? (3) Was ist der exakte nächste Schritt?
```

---

## 5 — Ökosystem-Erweiterungen (.agents, rules, skills & MCP)

Um das Gesamtprojekt über `CLAUDE.md` hinaus an das ECC-Niveau anzugleichen:

1. **Modulare Regeln (`.agents/rules/`):**
   - `tool-execution.md` (bereits aktiv — strikte Tool-Disziplin)
   - `security-invariants.md` (Auslagerung der harten Wallet-Regeln)
   - `nextjs-conventions.md` (Next.js 16 App Router Spezifika: async `cookies()`, async `params`, Server Actions)

2. **Subagenten-Ausbau (`.claude/agents/`):**
   - `06_migration_security_guard.md` (aktiv)
   - `14_design_system_guardian.md` — **gestrichen (2026-08-30)**, Begründung in `t_claude_code/agents/12_workflow_agent_creation.md` §2.3 (Design-Regeln leben verbindlich in `xx_sop/04`; visuelle Prüfung liegt bei Jan)
   - `20_release_readiness_guard.md` — **gestrichen (2026-08-30, Jan-Anweisung)**
   - Zusätzlich gebaut: `31_casino_code_explorer.md` und `11_residue_scout.md` (beide Draft; Registry + Scores in `t_claude_code/agents/12_workflow_agent_creation.md` §2.1)

3. **Skills-Pipeline (`.claude/skills/`):**
   - `casino-security-scan` (Sicherheitsprüfung von API-Endpunkten und RPC-Aufrufen)
   - `casino-test-matrix` (Selektive Testausführung nach Komponenten-Scope)
   - `session-checkpoint` (Standardisiertes Handoff-Protokoll für Session-Wechsel)

4. **MCP-Tool-Budgetierung (`.mcp.json`):**
   - Nicht genutzte Server deaktivieren, um den Baseline-Prompt unter 20k Tokens zu halten.

---

## 6 — Selbstprüfung nach SOP 03 & SOP 12

- [x] **Klarer Scope:** Reine Optimierungsplanung für `CLAUDE.md` ohne unbefugte Dateiedits.
- [x] **Trennung der Artefaktklassen:** Plan liegt in `worldmap/`, verlinkt auf SOPs und Docs ohne Inhaltsduplizierung.
- [x] **Deterministische Skala:** 10 Dimensionen transparent von Top 1 % bis Top 100 % bewertet.
- [x] **Konkrete Entwürfe:** Bausteine A–E sind vollständig formuliert und direkt von Jan prüfbar.
- [x] **Vollständigkeit geprüft:** Model-Routing, MCP-Budgeting, Next.js 16 Regeln und Session-Handoffs integriert.
- [x] **Keine System-Mutation:** `CLAUDE.md` und `AGENTS.md` bleiben unangetastet.
