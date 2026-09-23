# 13 — Regenerierbare Build-Artefakte bereinigen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate K5) · **Scope:** Regenerierbare Build-Ausgaben (`.next-*`, `remotion-ad`, `.trigger`) werden inventarisiert und nach Beleg ihrer Regenerierbarkeit entfernt.
> **Kontext:** **~5,0 GB** (`du -sm`, 2026-09-18): `.next*` **3.951 MB** über **21 Einträge** (5 Verzeichnisse + 16 Log/Pid-Dateien), `remotion-ad` **974 MB** (logisch: 973,6 MB / 19.463 Dateien), `.trigger` **54 MB**. Alle drei sind in `.gitignore` erfasst und damit nicht versioniert — der Schaden ist reiner Plattenplatz und Verwirrung („welcher `.next-*`-Ordner ist der aktuelle?").
> **⚠ Volatilität:** `.next*` und `.trigger` ändern sich durch Builds und Dev-Server laufend — innerhalb derselben Sitzung wurde `.trigger` noch mit 129 MB und `.next*` mit 4.392 MB gemessen, kurz darauf mit 54 MB bzw. 3.951 MB. **Für diese zwei Gruppen ist der Kopfwert nur eine Größenordnung; verbindlich ist das Inventar aus L0.** `remotion-ad` ist stabil (Quellordner mit eigenem `node_modules`, nicht pro Build neu erzeugt).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Achtung — K5:** Entfernen ist destruktiv (wenn auch regenerierbar). Ohne Gate K5 wird nichts entfernt.
> **Nachbarpläne:** `16_o12_worktree_bereinigung_plan.md` · `18_o15_struktur_namensschema_scripts_plan.md` (Skript-Bloat; hier wird **kein** neues Aufräumskript angelegt).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                    | Scope (Dateien)                      | Ausführung        | Status | Zuständigkeit | Verifikation                                            |
| --- | ------------------------------ | ------------------------------------ | ----------------- | ------ | ------------- | ------------------------------------------------------- |
| L0  | Inventar mit Größe und Alter   | `.next-*`, `remotion-ad`, `.trigger` | Sequenziell       | Bereit | LLM           | Je Eintrag: Pfad, MB, Änderungsdatum, gitignore ja/nein |
| L1  | Regenerierbarkeit belegen      | die Kandidaten                       | Sequenziell       | Bereit | LLM           | Je Gruppe: Erzeugungsbefehl + gitignore-Zeile           |
| L2  | Aktiven Stand bestimmen        | `.next-*`                            | Sequenziell       | Bereit | LLM           | Genau ein Ordner als „in Benutzung" markiert            |
| L3  | Entfernung                     | Klasse „nicht in Benutzung"          | **Gate K5 (Jan)** | Bereit | LLM → Jan     | Belegte Freigabe in MB                                  |
| L4  | Nachweis der Regenerierbarkeit | das Projekt                          | Sequenziell       | Bereit | LLM           | `npm run build` erzeugt die Ausgabe neu                 |
| L5  | Abschluss                      | —                                    | Sequenziell       | Bereit | LLM           | Belegte Platzersparnis, Dev-Server startet              |

Fan-out: **keiner.** Alle Schritte beziehen sich auf dieselbe Plattenfläche und denselben Build-Zustand; parallele Läufe könnten einen gerade benutzten Ordner entfernen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`.gitignore`](../../../../../.gitignore) — enthält `/.next-*`, `/remotion-ad/`, `/.trigger`; die Zeilen werden in L1 zitiert.
- [`package.json`](../../../../../package.json) — `build`- und `dev`-Skripte; Quelle des Regenerierbarkeits-Nachweises.
- `next.config.*` — legt bei Bedarf den Ausgabeordner fest; prüfen, ob ein `.next-*`-Suffix konfiguriert ist.

### 2.2 Invarianten

- **Nichts wird entfernt, was git nicht ohnehin ignoriert.** Ist ein Kandidat nicht in `.gitignore` erfasst, wird er **nicht** angefasst, sondern als Fund gemeldet.
- Der **in Benutzung befindliche** `.next-*`-Ordner bleibt immer erhalten (L2). Wird kein aktiver Ordner erkannt, bleibt der zuletzt geänderte erhalten.
- Keine Löschung ohne Gate K5 und ohne Größenangabe je Kandidat.
- Es wird **kein Aufräumskript angelegt** — das würde den Skript-Bestand vergrößern (Potenzial 15). Der Vorgang ist einmalig und wird als Kommando dokumentiert.
- Keine Änderung an `.gitignore`, `next.config.*` oder Build-Skripten.

### 2.3 Nicht-Scope

- Kein Löschen von `public/`-Alternativfassungen (Potenzial 14, dortige Planung in `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG` B02).
- Kein Entfernen von Worktrees (Potenzial 12).
- Kein Aufräumen von `node_modules` — die Toolchain ist laut `03_uncommitted_unmerged_audit_plan.md` vollständig und wird nicht angetastet.
- Keine Änderung an CI-Caches.

## 3 — Detaillierte Meilensteine

### L0 — Inventar mit Größe und Alter

- **Ziel:** Die Zahlen sind belegt und aktuell.
- **Schritte:** `.next-*`-Einträge mit Größe und Änderungsdatum auflisten; `remotion-ad` und `.trigger` ebenso; je Eintrag die `.gitignore`-Abdeckung prüfen.
- **Erwartetes Verhalten:** Tabelle mit ~21 + 2 Einträgen und einer Summe in MB **mit Datum und Uhrzeit der Messung** — die Werte sind volatil, eine Zahl ohne Messzeitpunkt ist nicht prüfbar.
- **Abbruch/Rückfall:** Abweichende Größen werden dokumentiert; die Aussage in dieser Datei wird korrigiert, nicht beibehalten.

### L1 — Regenerierbarkeit belegen

- **Ziel:** „Kann neu erzeugt werden" ist ein Nachweis, keine Annahme.
- **Schritte:** Je Gruppe den Erzeugungsbefehl aus `package.json` benennen und die `.gitignore`-Zeile zitieren; bei `remotion-ad` prüfen, ob die Quelle im Repo liegt.
- **Erwartetes Verhalten:** Je Gruppe `Erzeugungsbefehl → gitignore-Zeile`.
- **Abbruch/Rückfall:** Fehlt der Erzeugungsbefehl oder die Quelle, wird die Gruppe **behalten** und als Fund gemeldet.

### L2 — Aktiven Stand bestimmen

- **Ziel:** Den laufenden Dev-/Build-Stand nicht zerstören.
- **Schritte:** Bei `.next-*` den in Benutzung befindlichen Ordner bestimmen (Konfiguration, letztes Änderungsdatum, laufender Prozess); ihn ausdrücklich als „behalten" markieren.
- **Erwartetes Verhalten:** Genau ein Ordner als aktiv benannt.
- **Abbruch/Rückfall:** Nicht bestimmbar → der zuletzt geänderte bleibt erhalten.

### L3 — Entfernung (**Gate K5**)

- **Ziel:** Platz zurückgewinnen.
- **Schritte:** Liste der Kandidaten mit Größe vorlegen; nach Freigabe entfernen; Ergebnis in MB protokollieren.
- **Erwartetes Verhalten:** Nur freigegebene Kandidaten sind weg; der aktive Ordner existiert.
- **Abbruch/Rückfall:** Sperrt ein Prozess einen Ordner, wird er behalten und gemeldet — nicht erzwungen.

### L4 — Nachweis der Regenerierbarkeit

- **Ziel:** Die Behauptung aus L1 wird geprüft.
- **Schritte:** `npm run build` ausführen und prüfen, dass die Ausgabe neu entsteht; Dev-Server kurz starten und wieder beenden.
- **Erwartetes Verhalten:** Build erzeugt die entfernten Ausgaben neu.
- **Abbruch/Rückfall:** Schlägt der Build fehl, wird der Fund gemeldet und der Vorgang gestoppt.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Größen erneut messen, Ersparnis gegen L0 stellen; Verifikations-Suite laufen lassen.
- **Erwartetes Verhalten:** Belegte Ersparnis, funktionierender Dev-Server.
- **Abbruch/Rückfall:** Verbleibende Einträge werden mit Grund benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. Platzersparnis belegt, `git status` unverändert (nur ignorierte Pfade betroffen), Gate K5 dokumentiert.
