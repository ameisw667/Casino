# 06 — Namensgleiche Dateien zwischen `docs/` und `T_*`: Kanonizität herstellen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H2) · **Scope:** Die 12 exakt namensgleichen Dateien, die in `docs/<kategorie>/` **und** `T_<KATEGORIE>/` liegen, erhalten je genau eine gültige Fassung; abweichende Inhalte werden zusammengeführt, nicht weggeworfen.
> **Kontext:** 12 namensgleiche Paare. Drei davon divergieren **40–70 %** im Inhalt: `docs/security-hardening/01|04|07_*` gegen `T_SECURITY_HARDENING/01|04|07_*` (106 gegen 181 · 113 gegen 189 · 161 gegen 182 Zeilen). Bei Säule 01 existieren sogar **drei** Fassungen. Die Frage „welche ist kanonisch?" ist heute nicht beantwortbar — wer die falsche liest, plant gegen einen veralteten Stand.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `09_o05_parallele_doku_baeume_plan.md` (setzt die Konvention, dieser Plan führt sie aus) · `13_o08_archiv_index_und_verwaiste_plan.md` (Säule-01-Drittfassung).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                    | Scope (Dateien)                  | Ausführung  | Status | Zuständigkeit | Verifikation                                          |
| --- | ------------------------------ | -------------------------------- | ----------- | ------ | ------------- | ----------------------------------------------------- |
| L0  | Paar- und Divergenz-Inventar   | `docs/*`, `T_*` (lesend)         | Sequenziell | Bereit | LLM           | 12 Zeilen mit Zeilenzahl beidseitig und `diff`-Umfang |
| L1  | Drittfassungen erfassen        | `docs/archive/`                  | Sequenziell | Bereit | LLM           | Jede Datei mit > 2 Fassungen aufgelistet              |
| L2  | Abweichenden Inhalt sichten    | die 3 stark divergierenden Paare | Sequenziell | Bereit | LLM           | Je Paar: was steht nur in der schwächeren Fassung     |
| L3  | Kanonische Fassung + Übernahme | die 12 Paare                     | Sequenziell | Bereit | LLM           | Je Paar: Gewinner + übernommene Absätze belegt        |
| L4  | Gegenfassung zum Kurzverweis   | die 12 Verlierer                 | Sequenziell | Bereit | LLM           | Verlierer < 15 Zeilen, kein Planinhalt mehr           |
| L5  | Abschluss                      | —                                | Sequenziell | Bereit | LLM           | 0 namensgleiche Paare, Guard grün                     |

Fan-out: **zulässig ab L2**, ein Agent je stark divergierendem Paar. **L3 und L4 sind `Sequenziell`** — jeder Verlierer berührt dieselbe Regel und muss gegen die schon entschiedenen Fälle geprüft werden.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- `docs/security-hardening/01|04|07_*.md` und `T_SECURITY_HARDENING/01|04|07_*.md` — die drei divergierenden Paare, vollständig lesen.
- `docs/archive/t_security_hardening_01_*` — die mögliche Drittfassung zu Säule 01.
- Die übrigen 9 namensgleichen Paare über `docs/auth`, `docs/database`, `docs/frontend`, `docs/observability`.
- [`docs/README.md`](../../../../../docs/README.md) — Router; sachlich benachbart zu **A02** in `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG`.

### 2.2 Invarianten

- **Inhalt geht vor Form.** Divergiert die schwächere Fassung inhaltlich, wird der verwertbare Teil in die kanonische Fassung **übernommen**, bevor der Verlierer reduziert wird.
- Eine Datei wird **nicht gelöscht** — der Verlierer wird zum Kurzverweis mit Angabe, wodurch er ersetzt wurde.
- Die Regel aus Gate H2 (Potenzial 04 L1) gilt hier mit: neuere Statuszeile, erreichbarer Pfad, größerer Umfang, bei Gleichstand gewinnt die Planungsschicht `T_*`.
- Jede Entscheidung wird in einem Satz begründet — Begründung ist Teil des Ergebnisses, nicht Beiwerk.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Keine inhaltliche Neubewertung der Sicherheits- oder Datenbankthemen; hier wird nur Kanonizität hergestellt.
- Keine Auflösung der 11 `worldmap/`↔`T_FRONTEND/`-Paare (Potenzial 04).
- Kein Umzug abgeschlossener Dateien (Potenzial 03).
- Keine Änderung an `xx_sop/`/`xx_docs/`.

## 3 — Detaillierte Meilensteine

### L0 — Paar- und Divergenz-Inventar

- **Ziel:** 12 Paare mit belegtem Divergenzgrad.
- **Schritte:** Namensgleiche `.md` zwischen `docs/<kategorie>/` und `T_<KATEGORIE>/` finden; je Paar Zeilenzahl beidseitig und `diff --stat` erfassen; Divergenz in Prozent grob klassifizieren.
- **Erwartetes Verhalten:** Tabelle mit 12 Zeilen, drei davon als „stark divergierend" markiert.
- **Abbruch/Rückfall:** Abweichungen zur Zahl in dieser Datei werden dokumentiert, nicht geglättet.

### L1 — Drittfassungen erfassen

- **Ziel:** Dateien mit mehr als zwei Fassungen sind bekannt, bevor eine davon kanonisch wird.
- **Schritte:** `docs/archive/` nach Vorgängern der 12 Kandidaten durchsuchen; mehrfach vorhandene Dateien markieren.
- **Erwartetes Verhalten:** Jede Datei mit > 2 Fassungen namentlich erfasst.
- **Abbruch/Rückfall:** Eine unerwartete dritte Fassung stoppt dieses Paar und geht an L2 mit erhöhter Sorgfalt.

### L2 — Abweichenden Inhalt sichten

- **Ziel:** Nichts geht verloren, weil die falsche Fassung gewinnt.
- **Schritte:** Für die drei stark divergierenden Paare den `diff` Abschnitt für Abschnitt lesen; festhalten, was **nur** in der schwächeren Fassung steht und ob es noch gilt.
- **Erwartetes Verhalten:** Je Paar eine Liste übernehmenswerter Absätze oder die belegte Aussage „nichts Verwertbares".
- **Abbruch/Rückfall:** Ist nicht entscheidbar, ob ein Absatz noch gilt, bleibt er erhalten und wird als „Herkunft unklar" markiert.

### L3 — Kanonische Fassung und Übernahme

- **Ziel:** Je Paar genau eine gültige Fassung, die den besseren Inhalt enthält.
- **Schritte:** Regel anwenden; übernehmenswerte Absätze zuerst einarbeiten; Entscheidung mit Begründungssatz protokollieren.
- **Erwartetes Verhalten:** 12 Entscheidungen, jede nachvollziehbar; kein Absatz doppelt.
- **Abbruch/Rückfall:** Übernahme ohne Beleg wird zurückgenommen.

### L4 — Gegenfassung zum Kurzverweis

- **Ziel:** Der Verlierer kann nicht mehr als Arbeitsgrundlage gelesen werden.
- **Schritte:** Kopfzeile behalten, Status auf „überholt" setzen, Verweis auf die kanonische Fassung; Meilenstein-Inhalte entfernen.
- **Erwartetes Verhalten:** Verlierer < 15 Zeilen.
- **Abbruch/Rückfall:** Nicht übernommener Inhalt wird im Kurzverweis namentlich als verworfen benannt.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Namensgleiche Paare erneut suchen (Erwartung 0); Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Kein Thema hat zwei konkurrierende Arbeitsfassungen.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, Paar-Gegenprobe ergibt 0, jede der 12 Entscheidungen hat einen Begründungssatz.
