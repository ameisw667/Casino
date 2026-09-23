# A01 — Kanonischer Migrationskontext

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Mutable lokale Migrationsfakten in Start- und Navigationsdokumenten durch Primärquelle und Ermittlungsmethode ersetzen.
> **Kontext:** Der lokale Dateibestand ist zuverlässig; parallel kopierte Zähler sind es nicht.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                   | Scope                        | Ausführung  | Status | Zuständigkeit | Verifikation                     |
| --- | ----------------------------- | ---------------------------- | ----------- | ------ | ------------- | -------------------------------- |
| L0  | Primärquelle erfassen         | supabase/migrations          | Sequenziell | Bereit | LLM           | Dateinamen, Zahl, höchste Nummer |
| L1  | Zähler-Fundstellen zuordnen   | CLAUDE.md, GEMINI.md, Router | Sequenziell | Bereit | LLM           | Zeile, alte Aussage, Solltext    |
| L2  | Startkontext minimal ersetzen | nur L1-Fundstellen           | Sequenziell | Bereit | LLM           | kein Zähler, Quellverweis        |
| L3  | Router konsistent machen      | L1-Fundstellen               | Sequenziell | Bereit | LLM           | lokale Aussage, Zielpfad         |
| L4  | Abschluss prüfen              | enger Diff und Links         | Sequenziell | Bereit | LLM           | fünf Stufen                      |

Fan-out: keiner. Alle Schritte verwenden dieselbe Faktenkette; parallele Schreibzugriffe erschweren den Textabgleich.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien und Quelle

- [Lokale Migrationsdateien](../../../../../supabase/migrations)
- [CLAUDE.md](../../../../../CLAUDE.md) und [GEMINI.md](../../../../../GEMINI.md): nur L1-Fundstellen
- [Dokumentationsindex](../../../../../docs/README.md)
- [Statuskarte](../../../../../worldmap/00_WORLDMAP_STATUS.md): alleinige Quelle für Live-Status

### 2.2 Invarianten

- P1 gilt: Dateien mit Endung .sql unter supabase/migrations sind die Primärquelle. Anzahl und höchste Präfixnummer werden aus ihrer Liste abgeleitet.
- Startdateien nennen nur Quelle und Methode, niemals einen Zähler oder höchste Nummer.
- „Lokal“ beschreibt nur den Arbeitsbaum. Remote- und Live-Aussagen stehen nicht in diesem Plan.
- SQL-Inhalt, Reihenfolge und Datenbankstatus bleiben unverändert.

### 2.3 Nicht-Scope

- Keine SQL-, Schema-, RLS- oder RPC-Änderung.
- Keine Produkt-, Test-, Konfigurations-, Asset- oder Deployment-Datei.
- Kein neuer Masterindex und keine Änderung fremder uncommitteter Inhalte.

## 3 — Detaillierte Meilensteine

### L0 — Primärquelle erfassen

- **Ziel:** Reproduzierbaren lokalen Snapshot schaffen.
- **Schritte:** SQL-Dateinamen listen, Anzahl und höchste Nummer ableiten, Filter und Datum protokollieren.
- **Erwartetes Verhalten:** Snapshot ist lokal und enthält keine Live-Behauptung.
- **Abbruch/Rückfall:** Uneindeutige Dateinamen stoppen alle Textänderungen.

### L1 — Zähler-Fundstellen zuordnen

- **Ziel:** Jede Änderung vorab belegen.
- **Schritte:** Migrationsanzahl, Bereich und höchste Nummer in Startdateien und betroffenen Routern suchen; Quelle, Zeile und Ersetzungstext erfassen.
- **Erwartetes Verhalten:** Jede neue Formulierung verlinkt auf die Primärquelle und enthält keinen Wert.
- **Abbruch/Rückfall:** Unbelegte Fundstellen bleiben unverändert.

### L2 — Startkontext minimal ersetzen

- **Ziel:** Unabhängige Faktenkopien entfernen.
- **Schritte:** Nur L1-Fundstellen ersetzen; Quelle und Ermittlungsmethode einsetzen; keine Architekturprosa umschreiben.
- **Erwartetes Verhalten:** Ein neues LLM findet die Quelle sofort.
- **Abbruch/Rückfall:** Diff außerhalb der Fundstellen wird zurückgenommen.

### L3 — Router konsistent machen

- **Ziel:** Router als Navigation statt Inventur führen.
- **Schritte:** Lokale Aussagen kennzeichnen; Live-Status auf die Statuskarte verlinken; eingehende Links prüfen.
- **Erwartetes Verhalten:** Keine mutable Tatsachenbehauptung bleibt im Startkontext.
- **Abbruch/Rückfall:** Fehlender Zielpfad stoppt den Linkwechsel.

### L4 — Abschluss prüfen

- **Ziel:** Nur die beabsichtigte Konsolidierung übergeben.
- **Schritte:** Alte Zahlen suchen, L0 erneut bilden, Links und Diff prüfen.
- **Erwartetes Verhalten:** Quelle, Methode und Statusgrenze sind konsistent.
- **Abbruch/Rückfall:** Nicht zugehörige Dateien werden aus dem Diff entfernt.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. npm run check-doc-links, L0-Snapshot und git diff --check sind grün.
