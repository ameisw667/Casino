# 07 — Archivierung als Umzug statt als Kopie

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate H4) · **Scope:** Dateien, die zugleich an ihrer aktiven Position **und** unter `docs/archive/` liegen, werden auf genau einen Ort reduziert — in der Regel der Archivort.
> **Kontext:** Die Archivierung wurde mehrfach als **Kopie** ausgeführt statt als Umzug: `docs/security-hardening/0{1,4,7}_*` existieren zusätzlich als `docs/archive/t_security_hardening_0{1,4,7}_*`; 9 × `T_FRONTEND/41–49_*` liegen doppelt (aktiv und unter `docs/archive/41–49_*`). Ergebnis: zwei Fassungen, keine gilt. Das ist die direkte Folge von Potenzial 03 (kein Umzug) — hier wird der bereits entstandene Schaden behoben.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `07_o03_lifecycle_abgeschlossene_plaene_plan.md` (beugt künftigen Kopien vor) · `13_o08_archiv_index_und_verwaiste_plan.md` (Archiv-Index und verwaiste Dateien).

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein             | Scope (Dateien)                         | Ausführung        | Status | Zuständigkeit | Verifikation                                                  |
| --- | ----------------------- | --------------------------------------- | ----------------- | ------ | ------------- | ------------------------------------------------------------- |
| L0  | Doppelbestand ermitteln | `docs/archive/`, aktive Ordner (lesend) | Sequenziell       | Bereit | LLM           | Je Datei: aktiver Pfad, Archivpfad, Zeilenzahl beidseitig     |
| L1  | Fassungen vergleichen   | die gefundenen Paare                    | Sequenziell       | Bereit | LLM           | `diff` je Paar: identisch / abweichend / Archiv ist Teilmenge |
| L2  | Entscheidung je Paar    | —                                       | Sequenziell       | Bereit | LLM           | Je Paar: Archiv fassung kanonisch oder aktiv reaktivieren     |
| L3  | Reduktion auf einen Ort | nur abweichende Fälle                   | **Gate H4 (Jan)** | Bereit | LLM → Jan     | Genau eine Datei je Thema                                     |
| L4  | Verweise nachziehen     | alle eingehenden Verweise               | Sequenziell       | Bereit | LLM           | 0 tote Links außerhalb `docs/archive/`                        |
| L5  | Abschluss               | —                                       | Sequenziell       | Bereit | LLM           | Gegenprobe: 0 identische Dateien aktiv + archiviert           |

Fan-out: **zulässig ab L0** (reines Lesen, unabhängige Paare). **L3 und L4 sind `Sequenziell`** — Löschungen und Verweisänderungen dürfen nicht parallel laufen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`docs/archive/`](../../../../../docs/archive) — Zielort; Namensschema `t_<thema>_NN_<slug>.md`.
- `docs/security-hardening/0{1,4,7}_*` und `T_FRONTEND/41–49_*` — die bekannten Doppelbestände.
- [`scripts/check-doc-links.mjs`](../../../../../scripts/check-doc-links.mjs) — Archive sind von der Linkpflicht ausgenommen; das ist der Grund, warum der Doppelbestand so lange unentdeckt blieb.

### 2.2 Invarianten

- **Ein Ort je Thema.** Nach Abschluss existiert jede betroffene Datei genau einmal.
- Bevorzugt wird der **Archivort** — die Datei ist abgeschlossen; es sei denn, L2 ergibt, dass die aktive Fassung die inhaltlich neuere ist.
- **Keine Löschung ohne Beleg.** Jede Löschung setzt voraus, dass L1 die Inhaltsgleichheit oder die Teilmengen-Beziehung nachgewiesen hat. Reines Gate H4 genügt als Beleg nicht.
- Archivdateien werden inhaltlich nicht verändert; bei Abweichung gewinnt die vollständigere Fassung.
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` werden nicht angefasst.

### 2.3 Nicht-Scope

- Kein Umzug noch aktiver, nicht abgeschlossener Dateien (Potenzial 03).
- Keine Auflösung namensgleicher Dateien zwischen `docs/<kategorie>/` und `T_<KATEGORIE>/` (Potenzial 06).
- Kein Anlegen oder Umbau des Archiv-Index (Potenzial 08).
- Keine inhaltliche Bearbeitung der betroffenen Dokumente.

## 3 — Detaillierte Meilensteine

### L0 — Doppelbestand ermitteln

- **Ziel:** Der Doppelbestand ist vollständig, nicht nur die bekannten Fälle.
- **Schritte:** Dateinamen aus `docs/archive/` gegen alle aktiven Ordner abgleichen (Namensvergleich ohne Pfad); je Treffer beide Zeilenzahlen erfassen.
- **Erwartetes Verhalten:** Liste, die mindestens die 12 bekannten Fälle enthält.
- **Abbruch/Rückfall:** Zusätzliche Treffer werden aufgenommen; die Zahl in dieser Datei wird korrigiert statt beibehalten.

### L1 — Fassungen vergleichen

- **Ziel:** Beleg statt Annahme.
- **Schritte:** Je Paar `diff` fahren; Ergebnis einer der drei Klassen zuordnen: **identisch**, **Archiv ist Teilmenge der aktiven Fassung**, **abweichend**.
- **Erwartetes Verhalten:** Drei klar getrennte Gruppen.
- **Abbruch/Rückfall:** Ein binär oder sehr groß divergierendes Paar wird als „abweichend" geführt (fail-closed).

### L2 — Entscheidung je Paar

- **Ziel:** Eine nachvollziehbare Regel statt Einzelfallgefühl.
- **Schritte:** `identisch` → aktive Kopie entfernen; `Teilmenge` → Archivfassung durch die aktive ersetzen, dann aktive entfernen; `abweichend` → Inhalte zusammenführen, Ergebnis archivieren, aktive Kopie entfernen.
- **Erwartetes Verhalten:** Je Paar eine Entscheidung mit Klassenangabe.
- **Abbruch/Rückfall:** Nicht klassifizierbare Fälle gehen an Gate H4.

### L3 — Reduktion auf einen Ort (**Gate H4**)

- **Ziel:** Der Doppelbestand ist weg.
- **Schritte:** Zusammenführungen und Löschungen ausführen; jede Löschung mit `diff`-Beleg im Protokoll. Das Gate bestätigt die Liste, bevor entfernt wird.
- **Erwartetes Verhalten:** Je Thema genau eine Datei; `git status` zeigt Delete (aktiv) und ggf. Modify (Archiv).
- **Abbruch/Rückfall:** Fehlt der `diff`-Beleg, wird nicht entfernt.

### L4 — Verweise nachziehen

- **Ziel:** Navigation bleibt intakt.
- **Schritte:** Repo-weit nach den entfernten Pfaden suchen; Verweise auf die verbleibende Fassung umschreiben oder entfernen.
- **Erwartetes Verhalten:** Guard grün.
- **Abbruch/Rückfall:** Fehlt ein Ziel, wird der Verweis entfernt, nicht erfunden.

### L5 — Abschluss

- **Ziel:** Nachweis.
- **Schritte:** Abgleich aus L0 erneut fahren — Erwartung 0 Treffer; Guard und Suite laufen lassen.
- **Erwartetes Verhalten:** Kein Thema liegt doppelt.
- **Abbruch/Rückfall:** Restfälle werden benannt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün, Doppelbestands-Gegenprobe ergibt 0, jede Entfernung hat einen `diff`-Beleg.
