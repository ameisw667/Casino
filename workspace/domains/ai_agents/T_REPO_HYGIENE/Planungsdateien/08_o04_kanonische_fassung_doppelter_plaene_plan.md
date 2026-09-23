# 04 — Kanonische Fassung für doppelte Pläne festlegen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H2) · **Scope:** Die 11 namensgleichen Plan-Paare aus `worldmap/` und `T_FRONTEND/` erhalten je genau **eine** gültige Fassung; die andere wird zum Kurzverweis. Widersprüchliche Statuszeilen werden vorher aufgelöst.
> **Kontext:** 11 Paare, davon **6 mit widersprüchlicher Statuszeile** (`worldmap/50,55,56,58,59` = „Geplant · 09-12, Host-Pfad tot" gegen `T_FRONTEND/50,55,56,58,59` = „Execution-Ready · 09-07"; ebenso 40). Für einen Teil der Paare wurden **beide** Fassungen im selben Commit `d009b635` (2026-09-13) geschrieben — die Doppelung wurde aktiv erzeugt, nicht historisch angesammelt. Ein LLM, das die falsche Fassung liest, arbeitet an einem toten Host-Pfad weiter.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `07_o03_lifecycle_abgeschlossene_plaene_plan.md` (zieht danach um) · `09_o05_parallele_doku_baeume_plan.md` (dieselbe Ursache, andere Baumebene).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                  | Scope (Dateien)                     | Ausführung        | Status | Zuständigkeit | Verifikation                                                  |
| --- | ---------------------------- | ----------------------------------- | ----------------- | ------ | ------------- | ------------------------------------------------------------- |
| L0  | Paar-Inventar                | `worldmap/`, `T_FRONTEND/` (lesend) | Sequenziell       | Bereit | LLM           | 11 Zeilen: beide Statuszeilen, Datum, Zeilenzahl, Diff-Umfang |
| L1  | Kanonizitäts-Regel           | —                                   | **Gate H2 (Jan)** | Bereit | LLM → Jan     | Eine Regel, die alle 11 Fälle entscheidet                     |
| L2  | Statuswiderspruch auflösen   | die 6 Fälle                         | Sequenziell       | Bereit | LLM           | Je Paar: eine belegte Statuszeile                             |
| L3  | Kanonische Fassung bestimmen | die 11 Paare                        | Sequenziell       | Bereit | LLM           | Je Paar: Gewinner + Begründung in 1 Satz                      |
| L4  | Verlierer zum Kurzverweis    | die 11 Verlierer                    | Sequenziell       | Bereit | LLM           | Verlierer < 15 Zeilen, zeigt auf Gewinner                     |
| L5  | Abschluss                    | —                                   | Sequenziell       | Bereit | LLM           | Kein Paar mehr namensgleich, Guard grün                       |

Fan-out: **zulässig ab L3**, ein Agent je Paar — die Paare sind unabhängige Schreibbereiche. **L1 und L2 sind `Sequenziell`**: die Regel muss vor jeder Einzelentscheidung stehen, sonst werden 11 Einzelfallurteile produziert.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `worldmap/40,50,55,56,58,59_*.md` und die gleichnamigen Gegenstücke unter `T_FRONTEND/` — vollständig lesen, beide Fassungen.
- `T_FRONTEND/51,52,53,54,57_*.md` — die 5 Paare mit **identischer** Statuszeile (nur Formatierung abweichend); sie werden nach derselben Regel behandelt, aber ohne L2.
- [`worldmap/00_WORLDMAP_STATUS.md`](../../../../../worldmap/00_WORLDMAP_STATUS.md) — die Statuskarte; `worldmap/` erhält **keine neuen** Plandateien mehr.
- Commit `d009b635` (2026-09-13) — Beleg, dass die Doppelung erzeugt wurde; als `git show`-Nachweis nutzbar.

### 2.2 Invarianten

- Ziel ist **eine gültige Fassung je Thema**, nicht eine schönere. Der Verlierer wird nicht gelöscht, sondern zum Kurzverweis mit dem Hinweis, wodurch er ersetzt wurde.
- Keine Inhalte gehen verloren: divergiert der Verlierer inhaltlich, wird der **verwertbare** Teil vor dem Kurzverweis in die kanonische Fassung übernommen.
- `worldmap/` bleibt der Ort der Statuskarte; es bekommt **keine neuen** Plandateien.
- Eine Statuszeile wird nur dann geändert, wenn der Widerspruch belegt ist (Diff, Commit-Datum, Pfad-Erreichbarkeit) — nicht „nach Gefühl".
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine Bearbeitung der 12 namensgleichen Dateien zwischen `docs/` und `T_*` — das ist `10_o06_namensgleiche_dateien_kanonizitaet_plan.md`.
- Kein Umzug ins Archiv — das ist `07_o03_lifecycle_abgeschlossene_plaene_plan.md`.
- Kein neues Ordnungsschema für `worldmap/`.

## 3 — Detaillierte Meilensteine

### L0 — Paar-Inventar

- **Ziel:** 11 Paare belegt statt „ungefähr 11".
- **Schritte:** Namensgleiche `.md`-Dateien zwischen `worldmap/` und `T_FRONTEND/` finden; je Paar beide `**Status:**`- und `**Stand:**`-Zeilen, Zeilenzahl und `diff`-Umfang erfassen.
- **Erwartetes Verhalten:** Tabelle mit 11 Zeilen und einer Spalte „Status identisch ja/nein".
- **Abbruch/Rückfall:** Findet sich ein 12. Paar, wird es aufgenommen und die Abweichung zur Zahl in dieser Datei notiert.

### L1 — Kanonizitäts-Regel (**Gate H2**)

- **Ziel:** Eine Regel, die jeden der 11 Fälle entscheidet, ohne Einzelurteil.
- **Schritte:** Kriterien in eine feste Reihenfolge bringen, z. B. (1) neuere Statuszeile, (2) erreichbarer Host-Pfad schlägt toten, (3) größerer Inhaltsumfang, (4) bei Gleichstand `T_*` (weil `worldmap/` keine neuen Pläne mehr aufnimmt).
- **Erwartetes Verhalten:** Ein Absatz mit 4 geordneten Kriterien.
- **Abbruch/Rückfall:** Ohne diese Regel wird kein Paar aufgelöst.

### L2 — Statuswiderspruch auflösen

- **Ziel:** Die 6 widersprüchlichen Fälle sind entschieden, bevor Inhalte zusammengeführt werden.
- **Schritte:** Je Fall den Widerspruch belegen (Diff, Datum, Pfaderreichbarkeit) und die gültige Statuszeile festschreiben.
- **Erwartetes Verhalten:** 6 Fälle mit Beleg und Entscheidung.
- **Abbruch/Rückfall:** Nicht belegbar → der Fall geht als offener Fund an Jan, wird nicht geraten.

### L3 — Kanonische Fassung bestimmen

- **Ziel:** Je Paar genau ein Gewinner.
- **Schritte:** Regel aus L1 auf jedes Paar anwenden; Ergebnis mit einem Begründungssatz protokollieren.
- **Erwartetes Verhalten:** 11 Entscheidungen, jede in einem Satz nachvollziehbar.
- **Abbruch/Rückfall:** Zwei Paare mit gleichem Ergebnis widersprechen sich nicht — jedes wird eigenständig entschieden.

### L4 — Verlierer zum Kurzverweis

- **Ziel:** Kein zweiter Arbeitsstand bleibt lesbar als „echter" Plan.
- **Schritte:** Verwertbare Inhalte des Verlierers zuerst in die kanonische Fassung übernehmen; danach den Verlierer auf Kopfzeile + Verweis auf den Gewinner reduzieren.
- **Erwartetes Verhalten:** Verlierer < 15 Zeilen, kein Meilenstein-Inhalt mehr.
- **Abbruch/Rückfall:** Nicht übernommener Inhalt wird im Kurzverweis namentlich als „verworfen" benannt — nicht stillschweigend entfernt.

### L5 — Abschluss

- **Ziel:** Das Problem ist nachweislich weg.
- **Schritte:** Erneut nach namensgleichen Dateien zwischen beiden Ordnern suchen — Erwartung 0; Guard und Verifikations-Suite laufen lassen.
- **Erwartetes Verhalten:** 0 namensgleiche Paare mit widersprüchlichem Status.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, Paar-Gegenprobe ergibt 0, jede Entscheidung hat einen Begründungssatz.
