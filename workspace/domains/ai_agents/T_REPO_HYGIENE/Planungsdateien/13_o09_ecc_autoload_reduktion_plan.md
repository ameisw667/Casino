# 09 — ECC-Autoload auf die genutzten Regelschichten begrenzen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H5) · **Scope:** Die `@`-Importe in den globalen Regel-Einstiegspunkten werden so gesetzt, dass nur stackrelevante ECC-Regelschichten automatisch geladen werden.
> **Kontext:** In **jeder** Session werden **769 Zeilen** ECC-Regeln automatisch geladen (`ecc/common` 355 + `ecc/web` 414), gemessen per `wc -l`. Gleichzeitig werden die **stackrelevanten** `ecc/typescript`-Regeln (319 Zeilen) **nicht** geladen. Das Repo ist React/TypeScript — es zahlt also laufend für Regeln, die es nicht braucht, und bekommt die nicht, die es braucht. Das ist keine Platzfrage, sondern eine Treffergenauigkeitsfrage.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Achtung — Scope-Grenze:** Dieser Plan betrifft `V:\.claude\rules\ecc\**` und die globalen Einstiegspunkte, also **außerhalb des Casino-Repos**. Es wird nichts im Repo committet; die Änderung wirkt global für alle VibeCoding-Projekte. Deshalb: **Gate H5 vor jeder Änderung.**
> **Nachbarpläne:** `14_o10_regelschicht_widersprueche_plan.md` (Widersprüche zwischen den Regelschichten) · `15_o11_tote_verweise_gemini_spiegel_plan.md`.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                 | Scope (Dateien)                              | Ausführung        | Status | Zuständigkeit | Verifikation                                                  |
| --- | --------------------------- | -------------------------------------------- | ----------------- | ------ | ------------- | ------------------------------------------------------------- |
| L0  | Autoload-Kette messen       | `~/.claude/CLAUDE.md`, `V:\.claude\rules\**` | Sequenziell       | Bereit | LLM           | Je Import: Datei, Zeilenzahl, Herkunft des Imports            |
| L1  | Trefferprüfung              | die geladenen Regeln                         | Sequenziell       | Bereit | LLM           | Je Regelgruppe: „greift im Casino-Stack ja/nein" mit Beispiel |
| L2  | Soll-Importe festlegen      | —                                            | **Gate H5 (Jan)** | Bereit | LLM → Jan     | Neue Importliste mit Zeilensumme                              |
| L3  | Importe umstellen           | die Einstiegspunkte                          | Sequenziell       | Bereit | LLM           | Diff zeigt nur `@`-Zeilen                                     |
| L4  | Gegenprobe in neuer Session | —                                            | Sequenziell       | Bereit | LLM           | Gemessene Autoload-Zeilen = Sollwert                          |
| L5  | Abschluss                   | —                                            | Sequenziell       | Bereit | LLM           | Kein Regelverlust für den Stack                               |

Fan-out: **keiner.** Es sind wenige, eng gekoppelte Einstiegspunkte; parallele Schreiber erzeugen widersprüchliche Importlisten.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `C:\Users\hambu\.claude\CLAUDE.md` — globaler Einstiegspunkt; enthält die Regelblöcke und die Importkette.
- `V:\.claude\rules\ecc\common\*.md` (355 Zeilen gesamt), `V:\.claude\rules\ecc\web\*.md` (414), `V:\.claude\rules\ecc\typescript\*.md` (319, **nicht geladen**), `V:\.claude\rules\ecc\python\*.md` (226, **nicht geladen**).
- `V:\VibeCoding\CLAUDE.md` und `V:\VibeCoding\_Brain\CLAUDE.md` — projektübergreifende Einstiegspunkte.
- `V:\VibeCoding\Casino\CLAUDE.md` — Repo-Einstiegspunkt; **wird nicht angefasst** (Jan-Gate).

### 2.2 Invarianten

- **Keine Regel wird gelöscht.** Es wird nur entschieden, was automatisch geladen wird. Nicht geladene Regeln bleiben als Datei erhalten und bleiben on-demand lesbar.
- Der Stack dieses Repos ist React/TypeScript — die Trefferprüfung wird gegen den Casino-Stack geführt, nicht gegen einen hypothetischen.
- Die Änderung wirkt **global** (alle VibeCoding-Projekte). Wenn ein anderes Projekt Python-Regeln braucht, müssen sie on-demand erreichbar bleiben; das wird in L2 ausdrücklich mitgeprüft.
- `Casino/CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.
- Kein Commit im Casino-Repo; dieser Plan hat kein Repo-Diff.

### 2.3 Nicht-Scope

- Keine Änderung des Inhalts einzelner Regeln — nur der Lademenge. Widersprüchliche Inhalte sind Potenzial 10.
- Keine Konsolidierung gleichlautender Regeln zu einer Datei.
- Keine Änderung an Projekt- oder Repo-CLAUDE.md-Dateien.
- Kein Umbau des `_Brain\`-Routers.

## 3 — Detaillierte Meilensteine

### L0 — Autoload-Kette messen

- **Ziel:** Die 769 Zeilen sind belegt und vollständig aufgeschlüsselt.
- **Schritte:** Von den Einstiegspunkten über die `@`-Importe die tatsächlich geladene Kette nachziehen; je Datei Zeilenzahl per `wc -l` messen; je Datei notieren, **welcher** Import sie hereinholt.
- **Erwartetes Verhalten:** Tabelle `Datei → Zeilen → importiert von → im Stack relevant`.
- **Abbruch/Rückfall:** Überrascht die Messung (z. B. `ecc/typescript` doch geladen), wird die Aussage in dieser Datei korrigiert, nicht beibehalten.

### L1 — Trefferprüfung

- **Ziel:** Nicht „viel ist schlecht", sondern „unpassend ist teuer".
- **Schritte:** Je Regelgruppe ein konkretes Beispiel aus dem Casino-Stack suchen, das die Regel betrifft, oder belegen, dass keines existiert (z. B. Python-Abschnitte).
- **Erwartetes Verhalten:** Je Gruppe ein Beleg oder ein Gegenbeleg.
- **Abbruch/Rückfall:** Ohne Beleg wird eine Gruppe nicht abgewählt.

### L2 — Soll-Importe festlegen (**Gate H5**)

- **Ziel:** Eine Importliste, die den Stack trifft.
- **Schritte:** Vorschlagen: `common` behalten, `web` behalten oder reduzieren, `typescript` aufnehmen, `python` aus dem Autoload nehmen; Zeilensumme vorher/nachher nennen; die On-Demand-Erreichbarkeit der abgewählten Regeln sicherstellen.
- **Erwartetes Verhalten:** Neue Liste mit Zeilensumme und Begründung je Zeile.
- **Abbruch/Rückfall:** Ohne Gate wird nichts umgestellt.

### L3 — Importe umstellen

- **Ziel:** Umsetzung minimal-invasiv.
- **Schritte:** Nur die `@`-Zeilen der Einstiegspunkte ändern; Reihenfolge und Struktur unverändert.
- **Erwartetes Verhalten:** Diff zeigt ausschließlich `@`-Zeilen.
- **Abbruch/Rückfall:** Berührt der Diff Regelinhalt, wird er zurückgenommen.

### L4 — Gegenprobe in neuer Session

- **Ziel:** Der Effekt ist gemessen, nicht behauptet.
- **Schritte:** Neue Session starten; die geladene Regelmenge erneut messen; gegen den Sollwert aus L2 stellen.
- **Erwartetes Verhalten:** Gemessene Summe = Sollwert.
- **Abbruch/Rückfall:** Abweichung wird dokumentiert und die Importliste korrigiert.

### L5 — Abschluss

- **Ziel:** Keine Verschlechterung.
- **Schritte:** Prüfen, dass die stackrelevanten Regeln nun geladen sind und keine benötigte Regel fehlt; Ergebnis für Jan notieren, damit der globale Effekt bewusst bleibt.
- **Erwartetes Verhalten:** Weniger Zeilen, höhere Trefferquote.
- **Abbruch/Rückfall:** Fehlt eine benötigte Regel, wird sie in L3 zurückgeholt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler (Nachweis, dass der Repo-Stand unberührt ist).
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `git status` zeigt **keinen** neuen Casino-Diff; Autoload-Messung aus L4 liegt vor und entspricht dem Sollwert.
