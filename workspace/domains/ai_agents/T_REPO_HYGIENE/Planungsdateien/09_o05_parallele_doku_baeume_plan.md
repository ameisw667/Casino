# 05 — Parallele Doku-Bäume: Konvention festschreiben und Schichten trennen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H3) · **Scope:** Das Verhältnis `docs/<kategorie>/` ↔ `T_<KATEGORIE>/` wird als **eine** schriftliche Konvention festgehalten und danach so umgesetzt, dass beide Schichten nicht mehr verwechselt werden können.
> **Kontext:** Fünf Themen existieren doppelt — `docs/auth` (15) · `docs/database` (18) · `docs/frontend` (33) · `docs/security-hardening` (12) · `docs/observability` (10), insgesamt **89 Dateien**, je mit `T_*`-Gegenstück. Die Doppelung ist **kein Unfall**: `T_DATABASE/00` dokumentiert sie selbst („Dort wird die Dokumentation beschrieben … Hier geht es um den tatsächlichen Reifegrad"). Das Problem ist damit nicht die Struktur, sondern dass die Konvention **nirgends verbindlich steht** und die Dateinamen in beiden Schichten identisch sind.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `10_o06_namensgleiche_dateien_kanonizitaet_plan.md` (löst die 12 Namenskollisionen konkret auf) · `11_o07_archiv_umzug_statt_kopie_plan.md`.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein               | Scope (Dateien)                     | Ausführung        | Status | Zuständigkeit | Verifikation                                         |
| --- | ------------------------- | ----------------------------------- | ----------------- | ------ | ------------- | ---------------------------------------------------- |
| L0  | Baum-Vergleich            | `docs/*`, `T_*` (lesend)            | Sequenziell       | Bereit | LLM           | Je Thema: Dateien links/rechts, gemeinsame Namen     |
| L1  | Konvention rekonstruieren | die `00_*`-Dateien beider Schichten | Sequenziell       | Bereit | LLM           | Beleg je Schicht: Rolle in eigenen Worten der Datei  |
| L2  | Konvention festschreiben  | eine Zieldatei                      | **Gate H3 (Jan)** | Bereit | LLM → Jan     | Regel steht an genau einer Stelle                    |
| L3  | Einstiegspunkte markieren | die `00_*`-Köpfe                    | Sequenziell       | Bereit | LLM           | Jede Schicht nennt ihre Rolle und die andere Schicht |
| L4  | Namensgleichheit brechen  | Kollisionsdateien                   | Sequenziell       | Bereit | LLM           | 0 gemeinsame Dateinamen (an `10_o06_…` übergeben)    |
| L5  | Abschluss                 | —                                   | Sequenziell       | Bereit | LLM           | Guard grün, Gegenprobe auf Namenskollisionen         |

Fan-out: **zulässig ab L0**, ein Agent je Themenpaar (5 Paare, unabhängige Lesebereiche). **L2 und L4 sind `Sequenziell`** — die Konvention muss vor der Umbenennung stehen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `docs/auth/`, `docs/database/`, `docs/frontend/`, `docs/security-hardening/`, `docs/observability/` — je `00_*`-Kopf und Dateiliste.
- `T_AUTH/`, `T_DATABASE/`, `T_FRONTEND/`, `T_SECURITY_HARDENING/`, `T_OBSERVABILITY/` — je `00_<ORDNER>_UEBERSICHT.md`.
- [`docs/README.md`](../../../../../docs/README.md) — der Doku-Router; sachlich benachbart zu **A02** in `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG` (dort wird der Router repariert, hier wird die Konvention festgeschrieben).

### 2.2 Invarianten

- Die Zwei-Schichten-Struktur wird **nicht** als Fehler behandelt und **nicht** aufgelöst, solange die Dateien selbst sie begründen. Ein Zusammenlegen wäre eine Strukturentscheidung, kein Hygiene-Schritt, und braucht Gate H3.
- Die Konvention steht danach an **genau einer** Stelle und wird von beiden Schichten verlinkt — nicht in jeder `00_*`-Datei neu formuliert.
- Kein Inhalt wird verschoben oder zusammengeführt; geändert werden nur Köpfe, Rollenbeschreibungen und Dateinamen.
- `worldmap/` erhält keine neuen Plandateien.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine Inhaltskonsolidierung, kein Zusammenlegen der Schichten.
- Keine Auflösung der 12 namensgleichen Einzeldateien (Potenzial 06).
- Keine Archivierung abgeschlossener Dateien (Potenzial 03).
- Keine Änderung an `xx_sop/`/`xx_docs/` — sie sind eine dritte, bereits sauber getrennte Schicht.

## 3 — Detaillierte Meilensteine

### L0 — Baum-Vergleich

- **Ziel:** Die Doppelung ist beziffert, nicht behauptet.
- **Schritte:** Je Themenpaar die Dateilisten beider Schichten bilden; gemeinsame Dateinamen und divergierende markieren.
- **Erwartetes Verhalten:** Tabelle `Thema → Dateien links → Dateien rechts → gemeinsame Namen`.
- **Abbruch/Rückfall:** Fehlt ein `T_*`-Gegenstück, wird das Thema nur mit einer Seite geführt und als Ausnahme notiert.

### L1 — Konvention rekonstruieren

- **Ziel:** Die Absicht der Struktur belegen statt sie zu erfinden.
- **Schritte:** Die `00_*`-Dateien beider Schichten lesen und je Schicht die selbstformulierte Rolle wörtlich zitieren; prüfen, ob beide Schichten dieselbe Rolle beanspruchen.
- **Erwartetes Verhalten:** Pro Schicht ein Zitat mit `Datei:Zeile`.
- **Abbruch/Rückfall:** Beanspruchen beide dieselbe Rolle, ist der Befund „Rollenkollision" und geht in L2 als Entscheidung ein.

### L2 — Konvention festschreiben (**Gate H3**)

- **Ziel:** Eine verbindliche Regel gegen Verwechslung.
- **Schritte:** In **einer** Datei festschreiben: welcher Baum welche Frage beantwortet, wer bei Konflikt gewinnt, wohin neue Inhalte gehören. Optional zusätzlich festlegen, dass Dateinamen sich zwischen den Schichten unterscheiden müssen.
- **Erwartetes Verhalten:** Ein Absatz, verlinkbar aus beiden Schichten.
- **Abbruch/Rückfall:** Ohne Entscheidung beginnt L3 nicht.

### L3 — Einstiegspunkte markieren

- **Ziel:** Wer in einen der Bäume gerät, weiß sofort, wo er ist.
- **Schritte:** In jeden `00_*`-Kopf eine Zeile mit der eigenen Rolle und einem Verweis auf die Konvention und die Gegenschicht setzen.
- **Erwartetes Verhalten:** 10 Köpfe (5 × 2) mit konsistenter Formulierung.
- **Abbruch/Rückfall:** Abweichende Formulierung wird vereinheitlicht.

### L4 — Namensgleichheit brechen

- **Ziel:** Verwechslung ist mechanisch unmöglich.
- **Schritte:** Die Kollisionsdateien nach `10_o06_namensgleiche_dateien_kanonizitaet_plan.md` behandeln; hier wird die **Regel** festgelegt, nach der Dateinamen künftig eindeutig sind.
- **Erwartetes Verhalten:** 0 gemeinsame Dateinamen zwischen den Schichten.
- **Abbruch/Rückfall:** Umbenennungen ohne Aktualisierung der eingehenden Verweise werden zurückgenommen.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Namenskollisionen erneut suchen (Erwartung 0); Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Beide Schichten sind eindeutig adressierbar.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, Namenskollisions-Gegenprobe ergibt 0, Konvention an genau einer Stelle belegt.
