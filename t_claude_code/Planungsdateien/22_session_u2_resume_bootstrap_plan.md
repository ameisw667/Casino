# 22 — Session-Resume- & Warmstart-Optimierung (Subkategorie #2)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Standardisierung des 30-Sekunden-Warmstarts bei Session-Beginn, Vermeidung redundanter Whole-Repo-Scans und Etablierung eines Fallback-Protokolls für abrupte Sitzungsabbrüche.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_02_session_resume_bootstrap.md`](../01_5_02_session_resume_bootstrap.md) (Niveau: Top 40 %, 3 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 2

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                | Scope (Dateien)                                    | Ausführung  |   Status   | Zuständigkeit | Verifikation                                          |
| :----: | :----------------------------------------- | :------------------------------------------------- | :---------- | :--------: | :-----------: | :---------------------------------------------------- |
| **L0** | **Bootstrap-Diagnose & Baseline-Check**    | `t_claude_code/session/bootstrap_guide.md`         | Sequenziell | 🔴 Geplant |      LLM      | 3-Schritte-Warmstart-Protokoll dokumentiert           |
| **L1** | **Redundanz-Schutz & No-Whole-Scan-Regel** | `xx_sop/02_workflow_jan_execution.md`              | Sequenziell | 🔴 Geplant |      LLM      | Verbot blinder Repo-Scans in SOP verankert            |
| **L2** | **Crash-Rekonstruktions-Protokoll**        | `t_claude_code/session/reconstruction_protocol.md` | Sequenziell | 🔴 Geplant |      LLM      | Fallback-Ablauf für unsaubere Handoffs fertiggestellt |
| **L3** | **Verifikation & Niveau-Rückschreibung**   | `t_claude_code/01_5_session_memory.md`             | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 20 % verifiziert    |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Aufgaben sind eng verknüpft (Diagnose → SOP-Regel → Fallback-Protokoll → Verifikation). Gesamtaufwand ca. 20 Minuten, Teilaufgaben < 10 Minuten. Daher **strikte sequenzielle Ausführung, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Das 30-Sekunden-Warmstart-Protokoll (Ziel für L0)

Jede neue Session führt bei Vorhandensein eines vorangegangenen Aufgabenbezugs zwingend diese 3 Schritte aus:

1. **Git-Schnellcheck:** `git status -s` und `git log -n 1 --oneline` (Dauer: 2 Sekunden).
2. **Snapshot-Check:** Existiert ein Handoff-Snapshot im Chat-Prompt oder in `docs/status-reports/`? Falls ja: Direkt dort ansetzen.
3. **Planungsdatei-Fokus:** Gezieltes Öffnen ausschließlich der im Handoff genannten Planungsdatei (`t_claude_code/Planungsdateien/*.md`). Keine weiteren Dateien lesen, bevor der Meilenstein klar ist.

### 2. Die No-Whole-Scan-Regel (Ziel für L1)

- Verbot von ungerichteten Grep-/Find-Befehlen über das gesamte Repo beim Session-Start.
- Wenn die aktive Planungsdatei einen Self-Contained Kontext-Koffer enthält, ist das erneute Einlesen der Quelldateien für die Orientierung unzulässig (Token-Ersparnis).

### 3. Fallback-Protokoll bei unsauberem Handoff (Ziel für L2)

- Falls die vorherige Sitzung abrupt abbrach:
  1. `git diff` gegen `HEAD` prüfen (Was war unfertig?).
  2. Letzte bearbeitete Datei ermitteln (`git status`).
  3. Den letzten Meilenstein in der zugehörigen Planungsdatei auf `🟡 In Execution` prüfen.

---

## 3 — Expliziter Nicht-Scope

- Keine Veränderung der Next.js- oder Supabase-Laufzeitumgebung.
- Keine automatische Ausführung von Schreibbefehlen ohne Aufgabenbezug.
- Keine Umgehung der bestehenden Git-Branches.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Alle Schritte sind rein dokumentarisch bzw. SOP-Anpassungen in 100 % LLM-Zuständigkeit.
