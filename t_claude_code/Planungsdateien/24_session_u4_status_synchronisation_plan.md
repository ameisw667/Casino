# 24 — Aktive Statusartefakt-Pflege & In-Flight-Trigger (Subkategorie #4)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Etablierung aktiver Zwischen-Snapshots für `worldmap/00_WORLDMAP_STATUS.md`, Automatisierung von Status-Konsistenzprüfungen und Schutz vor Drift bei Sitzungsabbrüchen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_04_status_synchronisation_trigger.md`](../01_5_04_status_synchronisation_trigger.md) (Niveau: Top 65 %, 5 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 4

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                                | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                      |
| :----: | :--------------------------------------- | :--------------------------------------------- | :---------- | :--------: | :-----------: | :---------------------------------------------------------------- |
| **L0** | **In-Flight-Snapshot-Regelwerk**         | `xx_sop/03_workflow_jan_planungsdateien.md`    | Sequenziell | 🔴 Geplant |      LLM      | Zwischenstand-Dokumentationspflicht bei langen Tasks verankert    |
| **L1** | **Worldmap-Konsistenz-Prüfskript**       | `scripts/check-status-consistency.mjs`         | Sequenziell | 🔴 Geplant |      LLM      | Prüfskript verifiziert verlinkte Planungsdateien auf Existenz     |
| **L2** | **Multi-Branch-Status-Disziplin**        | `t_claude_code/session/multi_branch_status.md` | Sequenziell | 🔴 Geplant |      LLM      | Vorgaben zur Vermeidung von Status-Kollisionen bei Parallelarbeit |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md`         | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 20 % verifiziert                |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Sequenzieller Ablauf (SOP-Erweiterung → Skriptbau → Multi-Branch-Regel → Verifikation). Gesamtaufwand ca. 30 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. In-Flight-Snapshot-Logik (Ziel für L0)

- Wenn ein Meilenstein länger als 30 Minuten dauert oder eine komplexe Multi-Datei-Bearbeitung umfasst:
  - In der aktiven Planungsdatei den Status auf `🟡 In Execution` setzen.
  - Im Plan-Header ein 3-Zeilen-Log einfügen: `> Zwischenstand [HH:MM]: Datei X bearbeitet, Tests Y grün, offen Z.`

### 2. Das Konsistenz-Prüfskript `check-status-consistency.mjs` (Ziel für L1)

Ein Node.js-Skript, das:

- `worldmap/00_WORLDMAP_STATUS.md` parst.
- Alle darin referenzierten relativen Markdown-Dateien auf Existenz im Dateisystem prüft.
- Meldet, falls ein Plan auf `🟢 Executed` steht, aber noch im Abschnitt „Aktive Pläne" gelistet ist.

### 3. Multi-Branch-Regel (Ziel für L2)

- Parallele Agenten-Sessions dürfen `worldmap/00_WORLDMAP_STATUS.md` nur aktualisieren, wenn sie auf dem Hauptbranch arbeiten oder einen atomaren Status-Commit durchführen.

---

## 3 — Expliziter Nicht-Scope

- Keine Veränderung der Archivierungslogik nach `xx_sop/03` (abgeschlossene Pläne wandern weiterhin nach `docs/archive/`).
- Keine Modifikation produktiver Spielfunktionen.
- Keine automatischen Git-Pushes auf Remote.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Das Prüfskript und die SOP-Erweiterung liegen vollständig in LLM-Zuständigkeit.
