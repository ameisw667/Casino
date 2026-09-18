# 28 — Multi-Agent- & Multi-Session-Wissenstransfer (Subkategorie #8)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Standardisierung der Subagenten-Endberichte (15-Zeilen-Fact-Sheet), Scratchpad-Nutzung für langlebige Zwischenergebnisse und Kollisionsschutz bei parallelen Konversationen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_08_multi_agent_wissenstransfer.md`](../01_5_08_multi_agent_wissenstransfer.md) (Niveau: Top 75 %, 5 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 8

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                | Scope (Dateien)                                       | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                       |
| :----: | :----------------------------------------- | :---------------------------------------------------- | :---------- | :--------: | :-----------: | :----------------------------------------------------------------- |
| **L0** | **15-Zeilen-Subagent-Template**            | `t_claude_code/session/subagent_report_template.md`   | Sequenziell | 🔴 Geplant |      LLM      | Standardisiertes Fact-Sheet für Subagenten-Rückfluss fertig        |
| **L1** | **Scratchpad-Protokoll für Fan-out**       | `xx_sop/02_workflow_jan_execution.md`                 | Sequenziell | 🔴 Geplant |      LLM      | Ablagepfad `scratch/subagent_*.md` für Zwischenergebnisse geregelt |
| **L2** | **Kollisionsschutz für Parallelsitzungen** | `t_claude_code/session/parallel_session_isolation.md` | Sequenziell | 🔴 Geplant |      LLM      | Worktree-/Branch-Regeln für Mehrfach-Sitzungen dokumentiert        |
| **L3** | **Verifikation & Niveau-Rückschreibung**   | `t_claude_code/01_5_session_memory.md`                | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 25 % verifiziert                 |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Lineare Ausführung (Template → SOP → Isolation → Verifikation). Gesamtaufwand ca. 25 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Das 15-Zeilen-Subagent-Fact-Sheet (Ziel für L0)

Jeder aufgerufene Subagent muss seinen Endbericht zwingend in dieser Struktur liefern (maximal 20 Zeilen):

```markdown
### 🕵️ Subagent Abschlussbericht: [Aufgabenname]

- **Geprüfte Dateien/Zeilen:** [Dateipfade mit Zeilenbereich]
- **Fakten & Befunde:**
  - [Punkt 1: Konkreter Fund mit Beleg]
  - [Punkt 2: Konkreter Fund mit Beleg]
- **Risiken & Invarianten:** [Identifizierte Nebenwirkungen / unberührte Zonen]
- **Nächster Handlungsschritt:** [Klare Empfehlung an den Hauptagenten]
```

### 2. Scratchpad-Ablageregel in `xx_sop/02` (Ziel für L1)

- Bei Subagenten-Tasks, die mehr als 5 Dateien analysieren, schreibt der Subagent seinen Zwischenbericht in `scratch/subagent_<task>_<timestamp>.md`.
- Der Hauptagent liest gezielt diese Zusammenfassung, statt den kompletten Gesprächsverlauf zu replizieren.

### 3. Kollisionsschutz (Ziel für L2)

- Wenn zwei Chats zeitgleich am Casino-Projekt arbeiten:
  - Niemals unkoordiniert dieselbe Planungsdatei mutieren.
  - Änderungen vor dem Commit immer per `git fetch` bzw. `git status` abgleichen.

---

## 3 — Expliziter Nicht-Scope

- Keine Modifikation der Agenten-Rollen in `.claude/agents/` (bleibt Gegenstand von Kategorie 3).
- Keine Änderung an Trigger-Schwellen (bereits durch Plan 01 abgedeckt).
- Keine automatische Einrichtung von Git-Worktrees ohne Konsultation.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Standardisierung liegt vollständig im LLM-Scope.
