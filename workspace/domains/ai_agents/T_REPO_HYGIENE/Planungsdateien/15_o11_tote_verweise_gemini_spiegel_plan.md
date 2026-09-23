# 11 — Tote Pfad-Verweise und `GEMINI.md` als divergierender Spiegel

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H7) · **Scope:** Verweise in Start- und Navigationsdokumenten, die auf nicht existierende Pfade zeigen, werden belegt und korrigiert; die Rolle von `GEMINI.md` wird entschieden.
> **Kontext:** `Casino/CLAUDE.md:139` verweist auf `01_8_session_memory.md` — real existiert `01_5_…`. `GEMINI.md:127` nennt „001–037", real liegen 049 vor. Beide Dateien sind Regelschicht und damit **Jan-Gate**. Die **Migrationszähler-Hälfte** dieses Potenzials ist bereits als **A01** in `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG` geplant (P1: Startdateien enthalten keinen Zähler, nur Quelle und Methode) — dieser Plan deckt nur den **Verweis- und Spiegel-Teil** ab und dupliziert A01 nicht.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `14_o10_regelschicht_widersprueche_plan.md` (inhaltliche Widersprüche) · `06_o02_doc_link_guard_abdeckung_plan.md` (mechanische Erkennung toter Verweise).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                     | Scope (Dateien)                    | Ausführung            | Status | Zuständigkeit | Verifikation                                       |
| --- | ------------------------------- | ---------------------------------- | --------------------- | ------ | ------------- | -------------------------------------------------- |
| L0  | Verweis-Inventar                | Start-/Navigationsdateien (lesend) | **Fan-out-Cluster 1** | Bereit | LLM           | Je Fund: `Datei:Zeile`, Zielpfad, Existenz ja/nein |
| L1  | Divergenz-Analyse `GEMINI.md`   | `GEMINI.md` gegen Repo-Bestand     | Sequenziell           | Bereit | LLM           | Je Abschnitt: deckungsgleich / veraltet / fehlend  |
| L2  | Rollen-Entscheidung `GEMINI.md` | —                                  | **Gate H7 (Jan)**     | Bereit | LLM → Jan     | Eine von drei Optionen schriftlich entschieden     |
| L3  | Vorschlagsdokument              | eine neue Datei                    | Sequenziell           | Bereit | LLM           | Je Fund: Solltext + betroffene Zeile               |
| L4  | Textänderung nach Freigabe      | nur freigegebene Zeilen            | **Gate H7**           | Bereit | LLM           | Diff berührt nur freigegebene Zeilen               |
| L5  | Abschluss                       | —                                  | Sequenziell           | Bereit | LLM           | 0 tote Pfadverweise in lebendigen Dateien          |

Fan-out: **`Fan-out-Cluster 1` in L0** — die Verweissuche läuft über viele Dateien mit unabhängigen Lesebereichen. **Ab L1 alles `Sequenziell`**: die Rollen-Entscheidung für `GEMINI.md` steuert alle Folgeänderungen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`CLAUDE.md`](../../../../../CLAUDE.md) — Zeile 139 (toter Verweis); **nur lesen und vorschlagen**.
- [`GEMINI.md`](../../../../../GEMINI.md) — Spiegel mit Drift; **nur lesen und vorschlagen**.
- [`AGENTS.md`](../../../../../AGENTS.md) — verweist auf `CLAUDE.md`; prüfen, ob eigene tote Verweise vorliegen.
- `t_claude_code/01_5_session_memory.md` — das real existierende Ziel des toten Verweises.
- [`worldmap/00_WORLDMAP_STATUS.md`](../../../../../worldmap/00_WORLDMAP_STATUS.md) — Live-Status; als Schiedsinstanz für Statusaussagen.
- `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/Planungsdateien/02_a01_kanonischer_migrationskontext_plan.md` — **A01**; deckt die Zähler-Hälfte ab.

### 2.2 Invarianten

- **Keine Duplizierung von A01.** Migrationszähler in `GEMINI.md`/`CLAUDE.md` werden in diesem Plan **nicht** angefasst; sie sind A01 und werden in §2.3 ausdrücklich ausgeschlossen.
- Kein Verweis wird entfernt, wenn ein gültiges Ziel existiert — es wird korrigiert.
- Ein Verweis in **Anweisungstext** (als Beispiel oder Zitat) wird in Inline-Code umgeschrieben, nicht repariert — das ist die belegte Lehre aus dem lokal roten Fall in `T_FRONTEND/Planungsdateien/23_…:115`.
- `Casino/CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden **nur nach Gate H7** geändert, und nur an freigegebenen Zeilen.
- `CLAUDE.md`/`AGENTS.md` bleiben unangetastet, solange Jan nicht ausdrücklich freigibt — Doku-Aktualitätspflicht hebt dieses Verbot nicht auf.

### 2.3 Nicht-Scope

- **Keine Migrationszähler** in Startdateien (das ist A01).
- Keine inhaltlichen Widersprüche zwischen Schichten (Potenzial 10).
- Keine Reparatur toter Verweise **innerhalb** `docs/archive/`.
- Kein Umbau der `@`-Importkette (Potenzial 09).

## 3 — Detaillierte Meilensteine

### L0 — Verweis-Inventar (**Fan-out-Cluster 1**)

- **Ziel:** Alle toten Pfadverweise in lebendigen Dateien, nicht nur die zwei bekannten.
- **Schritte:** Start- und Navigationsdokumente (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `xx_docs/`, `xx_sop/`, `t_claude_code/`) nach Pfadangaben durchsuchen; je Fund prüfen, ob das Ziel existiert; `Datei:Zeile` und Zielpfad erfassen.
- **Erwartetes Verhalten:** Tabelle, die mindestens die zwei bekannten Funde enthält.
- **Abbruch/Rückfall:** Zusätzliche Funde werden aufgenommen und die Zahl in dieser Datei korrigiert.

### L1 — Divergenz-Analyse `GEMINI.md`

- **Ziel:** Belegen, ob `GEMINI.md` ein nutzbarer Spiegel oder eine Fehlerquelle ist.
- **Schritte:** `GEMINI.md` abschnittsweise gegen `CLAUDE.md` und den Repo-Bestand stellen; je Abschnitt einordnen: deckungsgleich / veraltet (konkrete Abweichung nennen) / im Original fehlend.
- **Erwartetes Verhalten:** Abschnittsliste mit Einordnung und Abweichungsbeispiel.
- **Abbruch/Rückfall:** Unklare Zuordnung wird als „veraltet" geführt.

### L2 — Rollen-Entscheidung `GEMINI.md` (**Gate H7**)

- **Ziel:** Eine dauerhafte Rolle statt fortlaufender Doppelpflege.
- **Schritte:** Drei Optionen mit Auswirkung vorlegen: **(a)** Spiegel auf einen Kurzverweis auf `CLAUDE.md` reduzieren, **(b)** als eigenständige Regelquelle beibehalten und dafür in die Doku-Aktualitätspflicht aufnehmen, **(c)** entfernen.
- **Erwartetes Verhalten:** Eine schriftliche Entscheidung mit Begründung.
- **Abbruch/Rückfall:** Ohne Entscheidung werden keine Textänderungen an `GEMINI.md` vorgenommen.

### L3 — Vorschlagsdokument

- **Ziel:** Entscheidungsfähige Vorlage für Gate H7.
- **Schritte:** Je Fund Ist-Zustand (`Datei:Zeile`), Solltext, Auswirkung auf andere Dokumente.
- **Erwartetes Verhalten:** Jan kann je Zeile einzeln freigeben.
- **Abbruch/Rückfall:** Ohne Solltext ist der Fund nicht entscheidungsreif.

### L4 — Textänderung nach Freigabe

- **Ziel:** Umsetzung streng begrenzt.
- **Schritte:** Nur freigegebene Zeilen ändern; tote Verweise auf gültige Ziele korrigieren; Beispiel-Verweise in Inline-Code wandeln; eingehende Verweise prüfen.
- **Erwartetes Verhalten:** `git diff` zeigt ausschließlich freigegebene Zeilen.
- **Abbruch/Rückfall:** Diff außerhalb der Freigabe wird zurückgenommen.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Inventar aus L0 erneut prüfen — Erwartung 0 tote Pfadverweise in lebendigen Dateien; Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Kein Startdokument zeigt ins Leere.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, 0 tote Pfadverweise in lebendigen Dateien, `git diff` enthält nur per Gate H7 freigegebene Zeilen.
