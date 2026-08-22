# 01 — Dokumentations-Strategie & Brain-Synchronisation · Execution-Master

> **Zentraler Masterplan** für den Neuaufbau der Dokumentationsarchitektur im Projekt `Casino` sowie den bidirektionalen Wissensfluss in das übergeordnete Obsidian `_Brain` (`V:\VibeCoding\_Brain`).
> **Schema:** Jan Planungs-Schema (Meilensteine → 3×3 Matrix → Selbst-Review → Execution-Log → Self-Verification).
> **Status:** 🟢 Bereit zur Prüfung · 🟡 In Vorbereitung · 🔴 Ausstehend.

---

## 1. Meilenstein-Tabelle (2%-Überblick für Jan)

Bewertungsskala: **1 = niedrig … 10 = sehr hoch** | Status: 🟢 fertig · 🟡 in Arbeit · 🔴 offen

| # | Meilenstein | Status | Risiko | Impact | Aufwand | Ziel-Artefakt / Ort |
|---|---|:---:|:---:|:---:|:---:|---|
| **M1** | Setup `x_Dokumentation/` & Routing-Architektur | 🟢 | 1 | 9 | 2 | `x_Dokumentation/01_DOKUMENTATIONS_STRATEGIE_PLANUNG.md` |
| **M2** | Projektinterne LLM-Dokumentations-Architektur (Casino) | 🟡 | 2 | 9 | 4 | `x_Dokumentation/02_LLM_DOKUMENTATIONS_STANDARD.md` & `worldmap/` |
| **M3** | Repo-Cleanup & Drift-Beseitigung (Stale Docs vs. Code) | 🔴 | 3 | 8 | 5 | `docs/`, `worldmap/00_WORLDMAP_STATUS.md`, `CLAUDE.md` |
| **M4** | Brain-Sync: `Casino-MOC.md` Update (Stand 2026-08-21) | 🔴 | 2 | 9 | 3 | `_Brain/40_Projects/Casino-MOC.md` |
| **M5** | Brain-Sync: Playbook-Mining & Extraktion ($\ge 2$ Projekte) | 🔴 | 2 | 8 | 4 | `_Brain/30_Playbooks/` & `_Playbooks-Index.md` |
| **M6** | Brain-Sync: Skill-Ladders & Journal-Progression | 🔴 | 1 | 8 | 2 | `_Brain/20_Skills/` & `_Brain/90_Journal/` |
| **M7** | Automatisierter Drift-Guard & Synchronisations-Workflow | 🔴 | 3 | 9 | 3 | `x_Dokumentation/03_DRIFT_GUARD_WORKFLOW.md` |

---

## 2. Weltklasse-Plan — 3 Perspektiven × 3 Stakeholder

### Die 3 Perspektiven
- **P1 Wissensarchitektur & LLM-Routing**: Deterministische Einstiegspunkte, strikte Layer-Trennung, Verlinkungsdisziplin, kein Token-Waste durch redundante Fließtexte.
- **P2 Wissens-Mining & Brain-Extraktion**: Nur musterhafte Erkenntnisse ($\ge 2$ Projekte oder fundamentale Architektur-Gates) ins `_Brain`, projektgebundener Live-Status bleibt im Repo.
- **P3 Wartung, Drift-Prävention & Evolution**: Automatisierte & prozessuale Mechanismen gegen das Veralten von Dokumenten bei Code-Änderungen.

### Die 3 Stakeholder
- **S1 Jan (Owner & Entscheider)**: Schnelle 2%-Übersichten, messbare KPIs, klare Status-Ampeln, Null Klartext-Secrets.
- **S2 LLM-Agenten (Claude / Antigravity / Gemini)**: Extrem hohe Signaldichte, eindeutige Quellpfade, standardisierte Typen/Contracts, null Halluzinationen durch veraltete Docs.
- **S3 Folgeprojekte (Upstream-Nutzer)**: Sofort adaptierbare Playbooks, klare Skill-Referenzen und Vermeidung bekannter Fallstricke.

### 3×3 Matrix

| Perspektive \ Stakeholder | **S1 Jan (Owner)** | **S2 LLM-Agent (Konsument/Router)** | **S3 Folgeprojekte (Wiederverwendung)** |
|---|---|---|---|
| **P1 Architektur** | Dashboard mit Meilenstein-Ampeln; Trennung von Live-Status (Repo) und Evergreen-Wissen (`_Brain`). | Eindeutige Entry-Points (`CLAUDE.md`, `x_Dokumentation/INDEX.md`), indexierte Tabellen statt Prosa. | Einheitliche MOC- & Doc-Struktur über alle VibeCoding-Repos hinweg. |
| **P2 Mining** | Sichtbarkeit neuer erlernter Tech-Stacks (Trigger.dev, Hybrid-RAG, Multiplayer Crash). | Strukturierte Playbook-Templates mit Code-Evidenz aus echten Commits/Dateien. | Extraktion von $\ge 2$-Projekt-Patterns in `_Brain/30_Playbooks/` vor Neuimplementierung. |
| **P3 Evolution** | Keine Dokumentationsschulden; automatisierte Konsistenzprüfungen. | „Single Source of Truth“-Regel: Code-Änderung erzwingt Doku-Update im selben Schritt. | Security- & Architektur-Fallstricke (z.B. Cookie-Refresh-Trap, RLS-Bypass) direkt dokumentiert. |

---

## 3. Konkrete Ausführungs-Aktionen (Priorisiert)

### Block A: Projektinterne Dokumentations-Restrukturierung (`Casino`)
1. **Zentrales Doku-Hub `x_Dokumentation/`**:
   - `INDEX.md`: Maschinenlesbarer Master-Katalog aller Spezifikationen, Architekturen und APIs.
   - `02_LLM_DOKUMENTATIONS_STANDARD.md`: Richtlinien für LLM-optimierte Dokumente (Kompaktheit, Monospace für Werte, Tabellen-Fokus, No-Adjectives).
2. **Harmonisierung von `CLAUDE.md` / `AGENTS.md` / `GEMINI.md`**:
   - Vereinheitlichung der Service-Layer-, API- und Migrationstabellen (aktuell Stand Migration 042).
   - Verlinkung auf `x_Dokumentation/` und `worldmap/00_WORLDMAP_STATUS.md`.
3. **Audit der `worldmap/` & `docs/`**:
   - Bereinigung redundanter / veralteter Dokumente (`archive/`).
   - Schließen von Dokumentationslücken (z.B. Trigger.dev Background-Tasks, Hybrid-RAG Casino Guide, Multiplayer Crash Round-Takt).

### Block B: Synchronisation mit `_Brain` (`V:\VibeCoding\_Brain`)
1. **Update `40_Projects/Casino-MOC.md`**:
   - Nachziehen des Live-Stands von Migration 029 auf 042 (`042_guide_feedback_evals.sql`).
   - Dokumentation neuer Subsysteme: Trigger.dev v3 Tasks, pgvector Hybrid-RAG Knowledge Base, Multiplayer Crash (`crash_rounds`).
2. **Playbook-Mining & Extraktion (Kandidaten $\ge 2$ Projekte)**:
   - `trigger-dev-background-orchestration.md` (Vergleichbare Background-Worker-Muster).
   - `hybrid-rag-postgres-pgvector.md` (Keyword-Match + In-Memory/pgvector Embeddings).
   - `multiplayer-stateless-room-broadcaster.md` (Supabase Realtime Broadcast ohne Table-Replication).
3. **Skill-Ladder & Journal-Update**:
   - `20_Skills/Supabase-Skill-Ladder.md`: Update um pgvector, Trigger.dev DB-Integration und erweiterte RLS/RPC Patterns.
   - `90_Journal/Skill-Progression-Log.md`: Neuer Eintrag mit den Fortschritten im Bereich Event-Driven Architecture & RAG.

---

## 4. Selbst-Review des Plans (Risiken & Korrekturen)

1. **Anti-Pattern Duplikation**: Vermeidung redundanter Dokumentation zwischen Repo und `_Brain`. Live-Status gehört 100% ins Repo, Abstraktionen & Querverweise ins `_Brain`.
2. **Token-Effizienz für LLMs**: Zu lange Fließtexte in Prompt-Kontexten vermeiden. Fokus auf komprimierte Tabellen, Code-Snippets mit Zeilennummern und Pfad-Referenzen.
3. **Drift-Gefahr**: Wenn Tabellen manuell synchronisiert werden müssen, entsteht Drift. Daher Definition klarer Hierarchien (Repo-Status ist Master für Code, `_Brain` ist Master für Patterns).
4. **Secrets-Hygiene**: Keine sensiblen Variablen oder Credentials in `x_Dokumentation/` oder `_Brain` aufnehmen.

---

## 5. Execution-Log & Tracking

| Schritt | Aktion | Zielpfad | Status |
|:---:|---|---|:---:|
| 1 | Erstellung `x_Dokumentation/01_DOKUMENTATIONS_STRATEGIE_PLANUNG.md` | `Casino/x_Dokumentation/` | 🟢 |
| 2 | Erstellung `x_Dokumentation/INDEX.md` (LLM-Catalog) | `Casino/x_Dokumentation/` | 🔴 |
| 3 | Update `Casino-MOC.md` im Brain | `_Brain/40_Projects/Casino-MOC.md` | 🔴 |
| 4 | Extraktion neuer Playbooks | `_Brain/30_Playbooks/` | 🔴 |
| 5 | Update Skill-Ladders & Journal | `_Brain/20_Skills/`, `_Brain/90_Journal/` | 🔴 |

---

## 6. Self-Verification & Abnahmekriterien

- [x] Ordner `x_Dokumentation/` im Projekt `Casino` angelegt.
- [x] Master-Plan nach Jan Planungs-Schema (Meilensteine, 3×3 Matrix, Selbst-Review, Verification) erstellt.
- [ ] Alle Wikilinks und Pfad-Verweise zwischen `Casino` und `_Brain` sind gültig und ohne 404-Ziele.
- [ ] `Casino-MOC.md` im `_Brain` spiegelt den exakten Stand der 42 Migrationen wider.
- [ ] Doku-Regeln (Kompaktheit, Tabellen, keine unbelegten Adjektive) sind strikt eingehalten.
