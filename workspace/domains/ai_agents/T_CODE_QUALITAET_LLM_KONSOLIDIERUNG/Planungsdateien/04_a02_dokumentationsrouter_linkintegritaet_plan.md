# A02 — Dokumentationsrouter und Link-Integrität

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Dokumentationsnavigation, ihre belegten fehlerhaften relativen Links und faktenfreie Router-Prosa.
> **Kontext:** Router geben Einstieg und Quelle, aber keine zweite volatile Bestandsbeschreibung.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                | Scope                                | Ausführung  | Status | Zuständigkeit | Verifikation             |
| --- | -------------------------- | ------------------------------------ | ----------- | ------ | ------------- | ------------------------ |
| L0  | Router-/Linkbaseline       | docs/README, CHANGELOG, 00_LERNREISE | Sequenziell | Bereit | LLM           | Linkliste und Zielstatus |
| L1  | Navigation bestimmen       | vorhandene Themenrouter              | Sequenziell | Bereit | LLM           | eine Quelle je Faktentyp |
| L2  | Fundstellen korrigieren    | nur L0-Fundstellen                   | Sequenziell | Bereit | LLM           | Ziel, Case, Anker        |
| L3  | Eingehende Verweise prüfen | geänderte Ziele                      | Sequenziell | Bereit | LLM           | keine Verwaisung         |
| L4  | Abschluss prüfen           | Doku und enger Diff                  | Sequenziell | Bereit | LLM           | fünf Stufen              |

Fan-out: keiner. Zielpfade und eingehende Verweise brauchen eine gemeinsame Linkkarte.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [Dokuindex](../../../../../docs/README.md)
- [Changelog](../../../../../CHANGELOG.md)
- [Lernreise](../../../../../00_LERNREISE.md)
- [Command-Referenz](../../../../../xx_docs/02_command_reference.md)
- [Linkprüfung](../../../../../scripts/check-doc-links.mjs)

### 2.2 Invarianten

- Router verlinken kanonische Themenquellen; sie kopieren keine volatile Datei-, Migrations- oder Testanzahl.
- Relative Links müssen Ziel, Groß-/Kleinschreibung und Anker lokal auflösen.
- Ein neuer Router entsteht nur ohne bestehenden thematischen Router.
- Archive ändern sich nur bei konkreter L0-Fundstelle.

### 2.3 Nicht-Scope

- Keine Vollreorganisation von docs und keine Archivbereinigung ohne Fund.
- Keine CLAUDE.md-, AGENTS.md-, GEMINI.md-, Worldmap-, Code-, Konfigurations- oder Asset-Änderung.
- Keine erfundenen Status-, Test- oder Migrationszahlen.

## 3 — Detaillierte Meilensteine

### L0 — Router-/Linkbaseline

- **Ziel:** Bearbeitbare Fundstellen samt Quell- und Zielpfad erfassen.
- **Schritte:** npm run check-doc-links ausführen; die drei bekannten Fundorte direkt prüfen; Befunde nach live, archiviert und außerhalb des Scopes sortieren.
- **Erwartetes Verhalten:** Nur konkrete lokale Pfade sind Arbeitsmenge.
- **Abbruch/Rückfall:** Externe oder nicht auflösbare Links werden nicht geraten.

### L1 — Navigation bestimmen

- **Ziel:** Für jeden Faktentyp genau einen Linktyp festlegen.
- **Schritte:** Lokale Fakten auf Bestand, Live-Aussagen auf Statuskarte und Prozesshinweise auf SOP oder Command-Referenz verweisen; vorhandene Router wiederverwenden. Der schlanke Router ist verbindlich; ein Vollinventar gehört nicht zu diesem Plan.
- **Erwartetes Verhalten:** Router enthalten Zweck, Einstieg und Links, aber keine zweite Faktenbasis.
- **Abbruch/Rückfall:** Fehlende Primärquelle verhindert eine neue Zusammenfassung.

### L2 — Fundstellen korrigieren

- **Ziel:** Nur L0-Befunde beseitigen.
- **Schritte:** Case, relative Pfade und Anker präzise korrigieren; volatile Zähler durch Quelle und Methode ersetzen.
- **Erwartetes Verhalten:** Jeder geänderte Link zeigt auf ein lokales Ziel.
- **Abbruch/Rückfall:** Mehrdeutige Ziele bleiben unangetastet.

### L3 — Eingehende Verweise prüfen

- **Ziel:** Keine Verwaisung erzeugen.
- **Schritte:** Eingehende relative Verweise für jedes veränderte Ziel suchen und direkte Treffer anpassen.
- **Erwartetes Verhalten:** Die bearbeitete Navigation bleibt nachvollziehbar.
- **Abbruch/Rückfall:** Fund außerhalb des Scopes bleibt dokumentiert statt geändert.

### L4 — Abschluss prüfen

- **Ziel:** Korrektur ohne Doku-Ausweitung abschließen.
- **Schritte:** Linkcheck wiederholen, geänderte Markdown-Links auflösen, Diff gegen L0 vergleichen.
- **Erwartetes Verhalten:** Keine unreferenzierte neue Datei und kein unbelegter Fakt.
- **Abbruch/Rückfall:** Zusätzliche Dateien werden aus dem Diff entfernt.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. npm run check-doc-links, manuelle Auflösung jeder geänderten relativen Referenz und git diff --check sind grün.
