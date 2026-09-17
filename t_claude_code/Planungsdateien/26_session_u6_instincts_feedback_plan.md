# 26 — Instincts- & Verhaltens-Lernschleifen (Subkategorie #6)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Etablierung einer Feedback-zu-Instinkt-Routine, Definition initialer Projekt-Instinkte für das Casino, Confidence-Scoring und Richtlinien zur Vermeidung von Overfitting.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_06_instincts_feedback_loops.md`](../01_5_06_instincts_feedback_loops.md) (Niveau: Top 80 %, 5 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 6

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                                | Ausführung  |   Status   | Zuständigkeit | Verifikation                                              |
| :----: | :--------------------------------------- | :--------------------------------------------- | :---------- | :--------: | :-----------: | :-------------------------------------------------------- |
| **L0** | **Baseline-Inventar & Instinkt-Katalog** | `t_claude_code/session/instinct_catalog.md`    | Sequenziell | 🔴 Geplant |      LLM      | Katalog für 3 initiale Casino-Projekt-Instinkte entworfen |
| **L1** | **Feedback-zu-Instinkt-Protokoll**       | `t_claude_code/session/feedback_loop_sop.md`   | Sequenziell | 🔴 Geplant |      LLM      | Kriterien für Confidence-Scores (0.6 → 0.9) definiert     |
| **L2** | **Overfitting-Schutz & Pruning-Regel**   | `t_claude_code/session/instinct_governance.md` | Sequenziell | 🔴 Geplant |      LLM      | Pruning-Workflow für veraltete Gewohnheiten dokumentiert  |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md`         | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 25 % verifiziert        |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Ablauf ist sequenziell geordnet (Katalog → Protokoll → Schutzregeln → Verifikation). Gesamtaufwand ca. 20 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Die drei initialen Casino-Projekt-Instinkte (Ziel für L0)

1. **Instinkt 1: Non-Interactive CLI-Flags:**
   - _Verhalten:_ Bei PowerShell-Befehlen immer non-interactive Flags setzen (`--yes`, `CI=true`, `PAGER=cat`), um Terminal-Hangs zu verhindern.
   - _Confidence:_ `0.9` (durchgängig bewährt).
2. **Instinkt 2: Keine Ad-hoc-Einzeldatei-Linter:**
   - _Verhalten:_ Niemals `npx eslint file.tsx` mit Einzelpfaden ausführen (erzeugt unbekannte Permission-Prompts), sondern kanonisches `npm run lint` / `npm test`.
   - _Confidence:_ `0.9` (in `GEMINI.md` verankert).
3. **Instinkt 3: Glob-Verifikation vor Pfad-Ausgabe:**
   - _Verhalten:_ Nie einen Dateipfad in einer Dokumentation behaupten, ohne ihn vorher per `find_by_name` oder `view_file` verifiziert zu haben.
   - _Confidence:_ `0.8` (Ergebnis des Testpfad-Incidents).

### 2. Der 3-Stufen-Confidence-Lifecycle (Ziel für L1)

- **Stufe 1 (Beobachtung, 0.5):** Jan korrigiert ein Verhalten 1-malig im Chat → Notiz in Session-Scratch.
- **Stufe 2 (Kandidat, 0.7):** Verhalten wird in 2. unabhängiger Sitzung bestätigt → Aufnahme in `instinct_catalog.md`.
- **Stufe 3 (Etabliert, 0.9):** Verhalten wird über 5 Sitzungen widerspruchsfrei angewendet.

### 3. Overfitting-Schutz & Pruning (Ziel für L2)

- Ein Instinkt darf niemals SOP-Regeln abschwächen.
- Widerspricht ein gelernter Instinkt einer neuen Anweisung von Jan, wird er sofort auf 0.4 zurückgestuft und zur Löschung (`prune`) vorgemerkt.

---

## 3 — Expliziter Nicht-Scope

- Keine unerlaubten Modifikationen an globalen Benutzer-Konfigurationen ohne Jans Bestätigung.
- Keine Verwässerung der strikten SOP-Architekturregeln durch flexible Instinkte.
- Keine automatischen Registrierungen nicht-verifizierter Befehle.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Die Dokumentation und Richtlinienerstellung erfolgt rein im LLM-Scope.
