# 03 — Lifecycle: abgeschlossene Pläne aus dem aktiven Ordner holen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H1) · **Scope:** Dateien, deren Statuszeile sie als abgeschlossen ausweist, werden von ihrer aktiven Position nach `docs/archive/` **verschoben** (nicht kopiert) und eingehende Verweise nachgezogen.
> **Kontext:** **134 Dateien** tragen „Executed/Archived/Completed" und liegen weiter im aktiven Ordner — T_FRONTEND 51 · t_claude_code 55 · T_BUGS 18 · T_LLM 12 · T_SECURITY_HARDENING 8 · T_IMAGE_CREATION 8 · worldmap 1. Nichts im Repo bewegt sie jemals weg. Das ist Jans formuliertes Kernproblem („alter Kram hängt sich dran").
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `08_o04_kanonische_fassung_doppelter_plaene_plan.md` (erst Duplikate auflösen, dann umziehen) · `12_o07_archiv_umzug_statt_kopie_plan.md` und `13_o08_archiv_index_und_verwaiste_plan.md` (Archiv selbst in Ordnung bringen).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                 | Scope (Dateien)           | Ausführung        | Status | Zuständigkeit | Verifikation                                      |
| --- | --------------------------- | ------------------------- | ----------------- | ------ | ------------- | ------------------------------------------------- |
| L0  | Bestandsaufnahme            | alle Doku-Ordner (lesend) | Sequenziell       | Bereit | LLM           | Liste: Pfad, Statuszeile, Datum, Zeilenzahl       |
| L1  | Regel + Zielnamen festlegen | —                         | **Gate H1 (Jan)** | Bereit | LLM → Jan     | Eine schriftliche Regel, ein Namensschema         |
| L2  | Verweis-Landkarte           | alle eingehenden Verweise | Sequenziell       | Bereit | LLM           | Je Datei: Liste der eingehenden `Datei:Zeile`     |
| L3  | Umzug in Ordner-Batches     | je Ordner ein Batch       | Sequenziell       | Bereit | LLM           | `git status` zeigt Renames, keine Kopien          |
| L4  | Verweise nachziehen         | L2-Liste                  | Sequenziell       | Bereit | LLM           | 0 tote Links außerhalb `docs/archive/`            |
| L5  | Archiv-Index                | `docs/archive/README.md`  | Sequenziell       | Bereit | LLM           | Jede umgezogene Datei im Index                    |
| L6  | Abschluss                   | —                         | Sequenziell       | Bereit | LLM           | Guard grün, Gegenprobe: 0 Treffer im aktiven Baum |

Fan-out: **zulässig ab L3**, ein Agent je Ordner-Batch, weil die Ordner unabhängige Schreibbereiche sind. **L2 und L4 sind `Sequenziell`** — Verweise überschreiten Ordnergrenzen und dürfen nicht parallel erfasst werden.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- Zielordner: [`docs/archive/`](../../../../../docs/archive) — etabliertes Namensschema `t_<thema>_NN_<slug>.md` (10 Security-Hardening- und 5 t_api-Dateien als Vorbild).
- `worldmap/00_WORLDMAP_STATUS.md` — Abschnitt „Aktive Pläne"; **hier werden Einträge entfernt**, nicht ergänzt.
- [`xx_sop/03_workflow_jan_planungsdateien.md`](../../../../../xx_sop/03_workflow_jan_planungsdateien.md) — Lifecycle `Geplant → Execution-Ready → In Execution → Executed (archiviert)`.
- [`scripts/check-doc-links.mjs`](../../../../../scripts/check-doc-links.mjs) — das Werkzeug der Verifikation.

### 2.2 Invarianten

- **Verschieben, niemals kopieren.** Eine Kopie erzeugt genau das Problem, das Potenzial 07 beschreibt (zwei Fassungen, keine gilt).
- Der Statusmarker wird beim Umzug auf `Executed (archiviert)` normalisiert und um das Umzugsdatum ergänzt.
- Archivierte Dateien dürfen tote Verweise tragen; ihre Verweise werden **nicht** repariert, nur ihre eingehenden Verweise.
- Es wird **nichts gelöscht**. Dieser Plan kennt keine Löschung.
- Ein Plan, dessen Status widersprüchlich ist (Potenzial 04), wird **nicht** umgezogen, sondern an `08_o04_kanonische_fassung_doppelter_plaene_plan.md` übergeben.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine inhaltliche Bearbeitung der umgezogenen Dateien.
- Keine Auflösung von Duplikaten (Potenzial 04) und keine Reparatur des bestehenden Archivs (Potenziale 07, 08).
- Keine Löschung, keine Konsolidierung mehrerer Archivdateien zu einer.

## 3 — Detaillierte Meilensteine

### L0 — Bestandsaufnahme

- **Ziel:** Die 134 Dateien sind namentlich belegt, nicht geschätzt.
- **Schritte:** Alle `.md` in der Doku-Schicht nach Statuszeilen durchsuchen. **Wichtig:** exakt auf die Statuswerte matchen (`Executed`, `Archived`, `Completed`, `Abgeschlossen`) — ein Suche nach `Execut` würde die eigenen `Execution-Ready`-Pläne fälschlich mitzählen. Je Treffer Pfad, Statuszeile, Datum, Zeilenzahl erfassen.
- **Erwartetes Verhalten:** Tabelle mit 134 Zeilen (± Momentaufnahme), gruppiert nach Ordner.
- **Abbruch/Rückfall:** Weicht die Zahl stark ab, wird die Suchregel dokumentiert und die neue Zahl verwendet — nicht die alte Zahl aus dieser Datei.

### L1 — Regel und Zielnamen festlegen (**Gate H1**)

- **Ziel:** Eine dauerhafte Ruhe-Regel, nicht 134 Einzelentscheidungen.
- **Schritte:** Festlegen (a) welche Statuswerte „fertig" bedeuten, (b) ob sofort oder mit Karenz umgezogen wird, (c) das Zielnamensschema, (d) wer künftig umzieht (Routine im Abschluss eines Plans).
- **Erwartetes Verhalten:** Ein Absatz, der den Lifecycle abschließend beschreibt und in `xx_sop/03` eingetragen werden kann.
- **Abbruch/Rückfall:** Ohne diese Regel beginnt L3 nicht — sonst entsteht eine zweite uneinheitliche Archivordnung.

### L2 — Verweis-Landkarte

- **Ziel:** Kein Umzug bricht einen Verweis unbemerkt.
- **Schritte:** Repo-weit nach dem Dateinamen (ohne Pfad) jedes Umzugskandidaten suchen; je Treffer `Datei:Zeile` erfassen; Treffer innerhalb `docs/archive/` ignorieren.
- **Erwartetes Verhalten:** Je Kandidat eine vollständige Liste eingehender Verweise.
- **Abbruch/Rückfall:** Ein Verweis aus `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` stoppt diesen Kandidaten und wird als Jan-Gate-Fund gemeldet.

### L3 — Umzug in Ordner-Batches

- **Ziel:** Sichtbarer Effekt bei minimalem Risiko.
- **Schritte:** Einen Ordner pro Batch umziehen (`git mv`), Zielnamen nach L1; nach jedem Batch `git status` prüfen.
- **Erwartetes Verhalten:** Ausschließlich Renames, keine Delete/Add-Paare.
- **Abbruch/Rückfall:** Erscheint eine Datei als gelöscht und neu angelegt, wird der Batch zurückgenommen.

### L4 — Verweise nachziehen

- **Ziel:** Navigation bleibt intakt.
- **Schritte:** L2-Liste abarbeiten, Ziele auf den Archivpfad umschreiben; wo ein Verweis nur historisch war, durch Inline-Code ersetzen.
- **Erwartetes Verhalten:** `npm run check-doc-links` grün.
- **Abbruch/Rückfall:** Fehlt ein Ziel, wird der Verweis entfernt, nicht erfunden.

### L5 — Archiv-Index

- **Ziel:** Das Archiv ist lesbar, nicht nur voll.
- **Schritte:** `docs/archive/README.md` anlegen bzw. erweitern; je Datei eine Zeile mit Thema, Abschlussdatum und einer Aussage, wodurch sie ersetzt wurde.
- **Erwartetes Verhalten:** Jede umgezogene Datei hat eine Indexzeile.
- **Abbruch/Rückfall:** Ohne Ersatz-Nachweis bleibt die Aussage „überholt, ohne Nachfolger" — das ist zulässig und ehrlich.

### L6 — Abschluss

- **Ziel:** Die Gegenprobe.
- **Schritte:** Status-Suche im aktiven Baum erneut fahren — Erwartung 0 Treffer außerhalb `docs/archive/`; Guard und Verifikations-Suite laufen lassen.
- **Erwartetes Verhalten:** Die Regel greift nachweislich.
- **Abbruch/Rückfall:** Resttreffer werden benannt und begründet, nicht verschwiegen.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, `git status` zeigt Renames, Gegenprobe im aktiven Baum ergibt 0 abgeschlossene Dateien.
