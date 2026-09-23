# 15 — Struktur-/Namensschema festschreiben, Skript-Bestand und Wiederholungs-Boilerplate reduzieren

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H8) · **Scope:** Ein verbindliches Ordner-/Namensschema wird festgeschrieben und auf die Abweichungen angewendet; der `scripts/`-Bestand und wortgleich mehrfach ausgerollte Handoff-Boilerplate werden auf ein Minimum reduziert.
> **Kontext:** Drei Ausprägungen derselben Ursache (keine festgeschriebene Namens- und Vorlagenkonvention).
> **(a) Struktur-/Namensdrift:** 8 Abweichungen vom Schema `00_<ORDNER>_UEBERSICHT.md` — `docs/auth/` hat **zwei** `00_*`-Dateien; 2 Ordner enthalten **Leerzeichen** (`Fuer Jan/`, `Lerneffekt Jan/`); `T_FRONTEND` liegt mit 88 Dateien flach neben 33 in `Planungsdateien/`.
> **(b) Skript-Bloat:** `scripts/` enthält **136 Dateien**, davon **54 einmalige `capture-*.mjs`**.
> **(c) Wiederholungs-Boilerplate (Rang-16-Befund):** `T_DATABASE/12_execution_handoff_prompt.md` (116 Z.), `T_SECURITY_HARDENING/09_execution_handoff_prompt.md` (113), `11_status_quo_and_next_actions_prompt.md` (63), `12_conversation_handoff_context_prompt.md` (85), `T_RATE_LIMITING_ABUSE_PREVENTION/11_execution_handoff_prompt.md` (65), `PATHFINDER-2026-05-10/04-handoff-prompts.md` (394). **4 von 6** tragen denselben Satz über eine „komplett frische, separate LLM-Konversation" wortgleich. Auflösung wäre **eine** Vorlage + Kurzverweise.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `09_o05_parallele_doku_baeume_plan.md` (Konvention der zwei Bäume) · `07_o03_lifecycle_abgeschlossene_plaene_plan.md` (Umzüge) · `17_o13_build_artefakte_bereinigung_plan.md`.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                        | Scope (Dateien)           | Ausführung            | Status | Zuständigkeit | Verifikation                                      |
| --- | ---------------------------------- | ------------------------- | --------------------- | ------ | ------------- | ------------------------------------------------- |
| L0  | Abweichungs-Inventar               | alle Doku-Ordner (lesend) | **Fan-out-Cluster 1** | Bereit | LLM           | Je Abweichung: Pfad, Sollform, Istform            |
| L1  | Schema festschreiben               | eine Zieldatei            | **Gate H8 (Jan)**     | Bereit | LLM → Jan     | Ein Absatz, aus dem jede Abweichung folgt         |
| L2  | Ordner-/Dateinamen korrigieren     | die Abweichungen          | Sequenziell           | Bereit | LLM           | 0 Abweichungen, 0 Ordner mit Leerzeichen          |
| L3  | `T_FRONTEND`-Flachlage ordnen      | `T_FRONTEND/`             | Sequenziell           | Bereit | LLM           | Keine Datei liegt ohne Grund flach                |
| L4  | `scripts/`-Bestand reduzieren      | `scripts/`                | **Gate H8**           | Bereit | LLM → Jan     | 136 → belegte Restmenge, Einmal-Skripte gesichert |
| L5  | Handoff-Boilerplate zusammenführen | die 6 Dateien             | Sequenziell           | Bereit | LLM           | Eine Vorlage + 6 Kurzverweise                     |
| L6  | Abschluss                          | —                         | Sequenziell           | Bereit | LLM           | Guard grün, 0 Abweichungen                        |

Fan-out: **`Fan-out-Cluster 1` in L0** — das Inventar liest viele unabhängige Ordner. **Ab L2 alles `Sequenziell`**: Umbenennungen und Verweisänderungen überschneiden sich und dürfen nicht parallel laufen. Innerhalb von L4 ist ein weiterer Fan-out zulässig, wenn die Zuordnung der Einmal-Skripte in unabhängige Gruppen zerfällt.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`xx_sop/03_workflow_jan_planungsdateien.md`](../../../../../xx_sop/03_workflow_jan_planungsdateien.md) — bereits verbindlich für Ablage **aktiver Pläne** (`T_<THEMA>/Planungsdateien/<NN>_<thema>_plan.md`); das neue Schema muss dazu passen und darf es nicht überschreiben.
- `docs/auth/` — der Fall mit zwei `00_*`-Dateien.
- `T_REPO_HYGIENE/Fuer Jan/` — Ordner mit Leerzeichen; zusätzlich in keinem Register erfasst.
- `T_FRONTEND/` (88 flach) und `T_FRONTEND/Planungsdateien/` (33).
- `scripts/` — 136 Dateien, davon 54 `capture-*.mjs`.
- Die 6 Handoff-Dateien aus dem Kopf dieser Datei.
- [`docs/archive/`](../../../../../docs/archive) — möglicher Zielort für Einmal-Skripte und ausgeführte Handoffs.

### 2.2 Invarianten

- **Das Schema weicht `xx_sop/03` nicht auf.** Es ergänzt es um das, was dort fehlt: Ordnerbenennung, Eindeutigkeit der `00_*`-Datei, Verbot von Leerzeichen, Umgang mit Einmal-Skripten.
- Kein Ordner und keine Datei wird umbenannt, ohne dass alle eingehenden Verweise im selben Schritt nachgezogen werden.
- **Einmal-Skripte werden nicht gelöscht, bevor ihre Einmaligkeit belegt ist** — der Beleg ist: kein Aufruf in `package.json`, kein Aufruf in `.github/workflows/`, kein Aufruf in `.husky/`, kein Verweis in einem Dokument.
- Die Handoff-Boilerplate wird zu **einer** Vorlage konsolidiert; die 6 Stellen werden Kurzverweise. Kein Handoff-Inhalt geht verloren — die individuellen Teile bleiben je Datei.
- Keine Änderung an `.husky/`, `.github/workflows/`, `next.config.*`.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine Inhaltskonsolidierung von Dokumenten (Potenziale 05, 06).
- Keine Lifecycle-Umzüge (Potenzial 03).
- Kein Anlegen neuer Skripte — auch kein Aufräumskript.
- Keine Änderung an `xx_sop/03` selbst (die Datei ist kanonisch und wird nur als Rahmen zitiert).
- Keine Bewertung, welche Ordner mit Leerzeichen inhaltlich sinnvoll sind — nur die Umbenennung.

## 3 — Detaillierte Meilensteine

### L0 — Abweichungs-Inventar (**Fan-out-Cluster 1**)

- **Ziel:** Alle Abweichungen, nicht nur die bekannten 8.
- **Schritte:** Alle Doku-Ordner nach dem Schema `00_<ORDNER>_UEBERSICHT.md` prüfen (fehlt sie? mehrfach?); Ordner mit Leerzeichen finden; Dateien finden, die nach `xx_sop/03` in `Planungsdateien/` gehörten, aber flach liegen; `scripts/`-Bestand mit Referenzprüfung erfassen.
- **Erwartetes Verhalten:** Drei Listen (Struktur, Namen, Skripte) mit `Pfad → Sollform`.
- **Abbruch/Rückfall:** Zusätzliche Abweichungen werden aufgenommen und die Zahl in dieser Datei korrigiert.

### L1 — Schema festschreiben (**Gate H8**)

- **Ziel:** Eine Regel, aus der jede Einzelentscheidung folgt.
- **Schritte:** Festschreiben: `00_<ORDNER>_UEBERSICHT.md` genau einmal je Ordner; keine Leerzeichen in Ordner-/Dateinamen; aktive Pläne in `Planungsdateien/` (gemäß `xx_sop/03`); Einmal-Skripte gehören nicht in `scripts/`; wiederverwendbare Vorlagen statt kopierter Boilerplate.
- **Erwartetes Verhalten:** Ein Absatz, verlinkbar aus den betroffenen Ordnern.
- **Abbruch/Rückfall:** Ohne Schema beginnt L2 nicht.

### L2 — Ordner- und Dateinamen korrigieren

- **Ziel:** Kein Name verhindert Suchen oder Verlinken.
- **Schritte:** Doppelte `00_*` auflösen (eine bleibt, die andere wird thematisch eindeutig benannt); Ordner mit Leerzeichen umbenennen; alle eingehenden Verweise nachziehen.
- **Erwartetes Verhalten:** 0 Abweichungen; `npm run check-doc-links` grün.
- **Abbruch/Rückfall:** Fehlt ein eindeutiger neuer Name, wird der Fall an Gate H8 zurückgegeben.

### L3 — `T_FRONTEND`-Flachlage ordnen

- **Ziel:** Pläne liegen auffindbar, nicht verstreut.
- **Schritte:** Die 88 flachen Dateien klassifizieren: aktiver Plan, abgeschlossener Plan, Analyse-/Referenzdatei; aktive Pläne nach `Planungsdateien/`, abgeschlossene an `07_o03_lifecycle_abgeschlossene_plaene_plan.md` übergeben, Analysen benennen.
- **Erwartetes Verhalten:** Jede flache Datei hat eine begründete Kategorie.
- **Abbruch/Rückfall:** Unklare Fälle bleiben flach und werden als Fund gemeldet.

### L4 — `scripts/`-Bestand reduzieren (**Gate H8**)

- **Ziel:** Weniger Dateien, alle mit einem Aufrufer.
- **Schritte:** Für jede der 54 `capture-*.mjs` prüfen, ob sie in `package.json`, `.github/workflows/`, `.husky/` oder einem Dokument aufgerufen wird. Ohne Aufrufer: als Einmal-Skript klassifizieren. Nach Freigabe nach `docs/archive/` verschieben (Umzug, keine Löschung) oder entfernen.
- **Erwartetes Verhalten:** Jede verbleibende Datei unter `scripts/` hat mindestens einen belegten Aufrufer.
- **Abbruch/Rückfall:** Ein Skript ohne Aufrufer, dessen Zweck unklar ist, bleibt und wird als Fund gemeldet.

### L5 — Handoff-Boilerplate zusammenführen

- **Ziel:** Eine Vorlage statt sechs Kopien.
- **Schritte:** Gemeinsamen Text der 6 Dateien herausziehen; in **einer** Vorlage ablegen; je Datei nur den individuellen Teil behalten plus Verweis auf die Vorlage; den wortgleich belegten Satz („komplett frische, separate LLM-Konversation") nur noch an einer Stelle führen.
- **Erwartetes Verhalten:** Zeilensumme der 6 Dateien sinkt deutlich; kein individueller Inhalt verloren.
- **Abbruch/Rückfall:** Nicht eindeutig zuordenbare Absätze bleiben in ihrer Datei.

### L6 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Inventar aus L0 erneut prüfen — Erwartung 0 Abweichungen; Aufrufer-Prüfung erneut fahren; Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Schema greift, Skripte sind erklärt, Boilerplate ist einmalig.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, 0 Schema-Abweichungen, jede Datei unter `scripts/` hat einen belegten Aufrufer.
