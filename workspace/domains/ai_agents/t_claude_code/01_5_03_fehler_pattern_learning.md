# 01.5.3 — Fehler-Pattern-Extraktion & Incident-Learning (Subkategorie #3): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Systematische Extraktion gelöster Fehler, Incident-Learning, Kopplung an `learn-eval` und Überführung in präventive Schutzmechanismen.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 3 (Niveau: **Top 55 %**, Gewichtung: **14 %**).

---

## 1 — Kernaussage

In `CLAUDE.md` ist der Grundsatz verankert: „Nach gelöstem, wiederkehrendem Fehler: `learn-eval` statt Planungsdatei-Prosa." Zudem liegen mit der Migrations-Nummernkollision (`049`/`050`) und dem falschen Testpfad (`tests/security/` statt `src/lib/security/__tests__/`) zwei reale, gut dokumentierte Vorfälle vor. Das System scheitert aktuell jedoch daran, dass der Übergang von einem einmaligen Bug zu einem persistenten „Fehler-Pattern" unklar definiert ist, Vorfälle im Statuslog verstreut sind und die globale Memory-Schreibsperre (Jans Einzelfreigabe) als Blockade empfunden wird, anstatt strukturierte Vorschläge zu generieren.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×40 + 15×55 + 15×55 + 10×25 + 10×80 + 10×70 + 10×70 + 10×60) / 100` = **Top 55 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                      | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                                             | Bottleneck? |
| :-: | :---------------------------------------------------- | :--------: | :----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Trigger-Regel nach gelöstem technischem Fehler**    |    20 %    | **Top 40 %** | Regel in `CLAUDE.md` vorhanden; wird im operativen Eifer jedoch häufig übersprungen, sobald der Bugfix kompiliert.                                         |    Nein     |
|  2  | **Differenzierung: Einzelfehler vs. Muster**          |    15 %    | **Top 55 %** | Es fehlt ein quantitatives Kriterium (z. B. ≥ 2 Vorkommen oder Architekturschaden), ab wann ein Vorfall als Muster eingestuft wird.                        |    🔴 JA    |
|  3  | **Root-Cause-Extraktion (Ursache vs. Symptom)**       |    15 %    | **Top 55 %** | Fehlerbehebungen dokumentieren oft nur den Patch, nicht den strukturellen Grund (z. B. fehlende Pre-Commit-Guardrail).                                     |    🔴 JA    |
|  4  | **Guardrail-Konformität (Jans Freigabevorbehalt)**    |    10 %    | **Top 25 %** | Die globale Regel („Write to memory only when I explicitly ask") wird strikt respektiert; Vorbereitung ohne Schreibzugriff klappt.                         |    Nein     |
|  5  | **Katalogisierung bekannter Vorfälle**                |    10 %    | **Top 80 %** | Bisherige Incidents (Stash-Vorfall, Migrationskonflikt) stehen als Freitext in `worldmap/00_WORLDMAP_STATUS.md` Zeile 40 statt in einem Incident-Register. |    🔴 JA    |
|  6  | **Formulierung maschinenlesbarer Präventionsregeln**  |    10 %    | **Top 70 %** | Lerneffekte werden oft als vage Prosa-Ratschläge formuliert, statt als konkrete If-This-Then-That-Prüfregeln.                                              |    🔴 JA    |
|  7  | **Rückfluss in automatisierte Tests**                 |    10 %    | **Top 70 %** | Aus gelösten Fehlern entstehen selten automatisierte Regressions-Tests (z. B. Vitest-Case oder Linter-Regel).                                              |    🔴 JA    |
|  8  | **Überprüfbarkeit der Lerneffekte in Folgesitzungen** |    10 %    | **Top 60 %** | Keine Messung, ob ein dokumentiertes Fehlermuster nach 4 Wochen erneut in einer Sitzung auftritt.                                                          |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 20 %

1. **Bottleneck 2 & 5: Das Incident-Register.** Einführung eines standardisierten Incident-Templates (Datum, Symptom, Ursache, Sofortmaßnahme, Präventionsregel) für alle Vorfälle ab Wiederholungsgrad 2.
2. **Bottleneck 3: 5-Why-Ursachenanalyse.** Verbindliche 3-Zeilen-Ursachenanalyse vor dem Schließen eines Fehlertickets im Chat.
3. **Bottleneck 6 & 7: Test-First-Lernen.** Jeder behobene kritische Fehler muss entweder einen Testfall, einen Typecheck-Typ oder eine explizite Hook-Prüfung nach sich ziehen.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Lückenlose Kette von der Fehlererkennung bis zur dauerhaften Prävention.
- [x] Respektierung von Jans globalen Memory-Rechten bei gleichzeitiger operativer Vorbereitung.
- [x] Direkte Anknüpfung an die realen Casino-Vorfälle (Migrationen & Pfade).

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 3)
- Planungsdatei: [`Planungsdateien/23_session_u3_fehler_pattern_plan.md`](Planungsdateien/23_session_u3_fehler_pattern_plan.md)
- Status: [`worldmap/00_WORLDMAP_STATUS.md`](../../../../worldmap/00_WORLDMAP_STATUS.md)
