# 30 — Continuous-Learning-Auditing & Drift-Kontrolle (Subkategorie #10)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Etablierung einer Zero-Recurrence-Prüfung für behobene Incidents, Definition einer 30-Tage-Revisionskadenz für Memory-Dateien und Beseitigung widersprüchlicher Vorgaben in archivierten Plänen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_10_evaluation_drift_kontrolle.md`](../01_5_10_evaluation_drift_kontrolle.md) (Niveau: Top 75 %, 6 🔴-Bottlenecks) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 10

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                               | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                              |
| :----: | :--------------------------------------- | :-------------------------------------------- | :---------- | :--------: | :-----------: | :------------------------------------------------------------------------ |
| **L0** | **Zero-Recurrence-Audit**                | `t_claude_code/session/recurrence_audit.md`   | Sequenziell | 🔴 Geplant |      LLM      | Prüfung der Git-Historie auf Wiederholung alter Fehler (Kollisionen etc.) |
| **L1** | **Memory-Frische & Revisions-Kadenz**    | `t_claude_code/session/memory_hygiene_sop.md` | Sequenziell | 🔴 Geplant |      LLM      | 30-Tage-Audit-Routine und `consolidate-memory`-Leitfaden definiert        |
| **L2** | **Widerspruchs-Scan in Archivplänen**    | `docs/archive/**/*.md`                        | Sequenziell | 🔴 Geplant |      LLM      | Scan nach überholten Anweisungen gegen aktuelle SOPs durchgeführt         |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md`        | Sequenziell | 🔴 Geplant |      LLM      | Konsistenzprüfung, Hebung auf Top 25 % verifiziert                        |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Sequenzielle Prüfung (Recurrence-Check → Hygiene-SOP → Archiv-Scan → Verifikation). Gesamtaufwand ca. 25 Minuten, Teilaufgaben < 10 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Das Zero-Recurrence-Audit (Ziel für L0)

- Prüfung gegen die 2 bekannten Incidents:
  - _Migrations-Kollision:_ `ls -1 supabase/migrations/` prüfen. Existieren doppelte Nummern? (Aktueller Stand: 001 bis 059 sauber).
  - _Testpfad:_ Grep nach ungültigen Pfaden wie `tests/security` in aktiven Dateien.
- Dokumentation des Ergebnisses (Erfolgsquote 100 % = 0 Wiederholungen).

### 2. 30-Tage-Revisionskadenz (Ziel für L1)

- Alle 30 Tage oder nach 20 abgeschlossenen Plänen:
  - Prüfung der Memory-Dateien in `~/.claude/projects/.../memory/` auf veraltete Annahmen.
  - Ausführung von `consolidate-memory` vorbereiten und Jan zur Bestätigung vorlegen.

### 3. Archiv-Widerspruchs-Bereinigung (Ziel für L2)

- Bei Archivdateien (`docs/archive/`) im Kopfbereich sicherstellen, dass sie als historischer Stand markiert sind (`> **Hinweis:** Historischer Stand. Für aktuelle Vorgaben gilt xx_sop/02 & xx_sop/03.`).

---

## 3 — Expliziter Nicht-Scope

- Keine unaufgeforderten Schreiboperationen im globalen Account-Memory (Jans Vorbehalt).
- Keine Löschung historischer Archivdateien.
- Keine Beeinflussung aktiver Spieltests.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** Keine. Audits und Richtlinienerstellung liegen zu 100 % in LLM-Zuständigkeit.
