# 29 — CLAUDE.md-Verankerung & Verweis-Integrität (Subkategorie #9)

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei CLAUDE.md-Gate) · **Scope:** Vollständige Bereinigung aller Alt-Verweise auf `01_8_session_memory.md` im Projekt, Vorbereitung des 1-Zeilen-Diffs für `CLAUDE.md` und Absicherung der Verweis-Integrität.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_5_09_claudemd_verankerung_verweise.md`](../01_5_09_claudemd_verankerung_verweise.md) (Niveau: Top 35 %, 1 🔴-Bottleneck) · Parent: [`../01_5_session_memory.md`](../01_5_session_memory.md) Position 9

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                              | Scope (Dateien)                        | Ausführung  |   Status   |     Zuständigkeit     | Verifikation                                                           |
| :----: | :--------------------------------------- | :------------------------------------- | :---------- | :--------: | :-------------------: | :--------------------------------------------------------------------- |
| **L0** | **Projektweiter Alt-Verweis-Scan**       | `t_claude_code/**/*.md`                | Sequenziell | 🔴 Geplant |          LLM          | Vollständige Liste aller Fundstellen von `01_8_session_memory`         |
| **L1** | **Repo-interne Link-Bereinigung**        | `t_claude_code/`                       | Sequenziell | 🔴 Geplant |          LLM          | Alle relativen Links im Repo auf `01_5_session_memory.md` aktualisiert |
| **L2** | **CLAUDE.md 1-Zeilen-Diff Vorbereitung** | `CLAUDE.md`                            | Sequenziell | 🔴 Geplant | **Jan Decision Gate** | Exakter Einzeiler für Jan zur manuellen Übernahme bereitgestellt       |
| **L3** | **Verifikation & Niveau-Rückschreibung** | `t_claude_code/01_5_session_memory.md` | Sequenziell | 🔴 Geplant |          LLM          | Link-Prüfung grün, Hebung auf Top 15 % verifiziert                     |

**Fan-out-Check (Kriterium 5 & 6 nach `xx_sop/03`):**
Aufgaben sind sequenziell (Scan → Repo-Fix → Diff-Bereitstellung → Verifikation). Gesamtaufwand ca. 15 Minuten. **Strikt sequenziell, kein Fan-out.**

---

## 2 — Self-Contained Kontext-Koffer

### 1. Der Scan-Befehl (Ziel für L0)

- Durchführen einer Grep-Suche nach `01_8_session_memory` über alle Markdown-Dateien im Repository:
  `grep_search: Query = "01_8_session_memory", SearchPath = "v:\VibeCoding\Casino"`

### 2. Repo-interne Bereinigung (Ziel für L1)

- Ersetzen aller Vorkommen in `t_claude_code/` und `worldmap/` durch den aktuellen Namen `01_5_session_memory.md`.

### 3. Der exakte CLAUDE.md 1-Zeilen-Diff (Ziel für L2)

In `CLAUDE.md` Abschnitt „Session-Kontinuität" (Zeile 217 in `00_claude_code_uebersicht.md` referenziert):

```diff
- - Kein neues Fehler-Pattern-Dateiformat ohne Freigabe — offen: 01_8_session_memory.md §4a.
+ - Kein neues Fehler-Pattern-Dateiformat ohne Freigabe — offen: 01_5_session_memory.md §4a.
```

_Hinweis:_ Gemäß der absoluten Projekt-Hard-Rule darf diese Änderung **nur von Jan selbst** im Quelltext durchgeführt werden. Die LLM bereitet die exakte Zeile vor.

---

## 3 — Expliziter Nicht-Scope

- Kein eigenmächtiges Editieren von `CLAUDE.md` durch die LLM (Hard Rule).
- Keine Umbenennung anderer nummerierter Architektur-Dateien.

---

## 4 — Lebenszyklus & Jan-Gates

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** L2 ist ein Jan-Gate für das finale manuelle Einpflegen der Zeile in `CLAUDE.md`. L0, L1 und L3 sind vollständig durch die LLM ausführbar.
