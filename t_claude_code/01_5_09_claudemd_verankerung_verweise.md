# 01.5.9 — CLAUDE.md-Verankerung & Verweis-Integrität (Subkategorie #9): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Qualität der Verankerung in `CLAUDE.md`, Einhaltung der Jan-Hard-Rule (Edit nur durch Jan), Beseitigung staler Alt-Verweise (`01_8` → `01_5`) und Token-Ökonomie der Kernregeln.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 9 (Niveau: **Top 35 %**, Gewichtung: **8 %**).

---

## 1 — Kernaussage

Die Verankerung von Session-Memory-Regeln in `CLAUDE.md` ist bereits zu weiten Teilen erfolgreich umgesetzt (**Top 35 %**): Der Abschnitt „Session-Kontinuität" ist live im System-Prompt eingebunden, verbraucht nur rund 100 Tokens und etabliert die Werkzeuge `checkpoint`, `save-session`, `resume-session` und `learn-eval`. Der verbleibende Bottleneck ist klein, aber symbolisch hart: Die letzte Zeile verweist wörtlich auf `01_8_session_memory.md §4a` — eine Datei, die am 2026-08-30 in `01_5_session_memory.md` umbenannt wurde. Da `CLAUDE.md` laut Hard Rule ausschließlich von Jan editiert werden darf, wartet dieser Einzeiler-Fix seit Wochen auf dessen manuelle Durchführung.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×10 + 15×90 + 15×10 + 10×25 + 10×45 + 10×35 + 10×45 + 10×30) / 100` = **Top 35 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                                | Gewichtung |    Niveau    | Befund & Beleg                                                                                                  | Bottleneck? |
| :-: | :-------------------------------------------------------------- | :--------: | :----------: | :-------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Präsenz des Abschnitts „Session-Kontinuität" in `CLAUDE.md`** |    20 %    | **Top 10 %** | Textblock ist real vorhanden und wird bei jedem Sitzungsstart über den System-Prompt geladen.                   |    Nein     |
|  2  | **Staler Verweis (`01_8` → `01_5`)**                            |    15 %    | **Top 90 %** | Zeile in `CLAUDE.md` verweist auf den nicht mehr existierenden Dateinamen `01_8_session_memory.md §4a`.         |    🔴 JA    |
|  3  | **Einhaltung der Jan-Hard-Rule für `CLAUDE.md`**                |    15 %    | **Top 10 %** | LLM-Agenten respektieren ausnahmslos das Edit-Verbot für `CLAUDE.md`; keine unerlaubten Schreibzugriffe.        |    Nein     |
|  4  | **Token-Footprint des Session-Abschnitts**                      |    10 %    | **Top 25 %** | Mit ~4 Zeilen und unter 110 Tokens ist der Textblock optimal verdichtet und belastet den Kontext kaum.          |    Nein     |
|  5  | **Verweiskonsistenz in `t_claude_code/`**                       |    10 %    | **Top 45 %** | Einige ältere Meilenstein-Dateien führen noch historische Bezüge auf `01_8`; systematischer Bereinigungsbedarf. |    Nein     |
|  6  | **Handlungsleitende Klarheit bei Session-Start**                |    10 %    | **Top 35 %** | Regeln sind prägnant formuliert, bedürfen aber einer Schärfung bezüglich des genauen Übergabe-Formats.          |    Nein     |
|  7  | **Synchronisation mit `GEMINI.md` / `AGENTS.md`**               |    10 %    | **Top 45 %** | `GEMINI.md` und `AGENTS.md` verweisen sauber auf `CLAUDE.md`, enthalten aber keine eigenen Inkonsistenzen.      |    Nein     |
|  8  | **Vermeidung redundanter Doppel-Regeln in SOPs**                |    10 %    | **Top 30 %** | Keine Doppelpflege; `xx_sop/02` und `xx_sop/03` verweisen sauber auf den Einstiegspunkt.                        |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 15 %

1. **Bottleneck 2: Jan-Einzeiler ausführen.** Sobald Jan die nächste Sitzung eröffnet, ändert er manuell in `CLAUDE.md`:
   `- Kein neues Fehler-Pattern-Dateiformat ohne Freigabe — offen: 01_8_session_memory.md §4a.`
   wird zu:
   `- Kein neues Fehler-Pattern-Dateiformat ohne Freigabe — offen: 01_5_session_memory.md §4a.`
2. **Bottleneck 5: Grep-Audit über Altverweise.** Einmaliges Suchen und Ersetzen aller toten `01_8_session_memory.md`-Links in `t_claude_code/`.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Respektierung der obersten Governance-Regel (`CLAUDE.md` nur durch Jan).
- [x] Token-Ökonomie der Kernregeln verifiziert.
- [x] Vollständige Bereinigung aller toten Alt-Links vorbereitet.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 9)
- Planungsdatei: [`Planungsdateien/29_session_u9_claudemd_verankerung_plan.md`](Planungsdateien/29_session_u9_claudemd_verankerung_plan.md)
- Hauptregelwerk: [`CLAUDE.md`](../CLAUDE.md)
