# 23 — Layout, Shell & Navigation (Modul 01)

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Nur die beiden Bottleneck-Sub-Punkte #3 (Datei-Dekomposition der 5 größten Layout-/Lobby-Dateien) und #6 (Sandbox-Isolation-Dokumentation) aus [`13_01_layout_shell_subkategorien.md`](../13_01_layout_shell_subkategorien.md). Kein Redesign, keine neuen Assets, keine visuelle Verhaltensänderung.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Kontext:** Modul 01 (Gewicht 15, Niveau Top 13,6 % laut [`00_UEBERSICHT.md` Zeile 46](../00_UEBERSICHT.md)) ist reine Lobby-/Navigations-UI ohne Berührung mit `src/lib/casino/`, Wallet-Snapshot-Logik oder Store-Persistenzfiltern (verifiziert: `grep -rn "applyServerWalletSnapshot\|useWalletBalance\|/api/casino" src/components/home src/components/casino/games-catalog/WheelCarousel.tsx` → 0 Treffer, Stand 2026-09-18).

---

## 0 — Auswahlmethodik (für alle 5 Ebene-2-Pläne dieser Runde identisch)

Von den Sub-Punkten in `13_01_...md` wurden diejenigen als Bottleneck-Meilenstein aufgenommen, deren Niveau **schlechter als Top 15 %** ist (numerischer Wert > 15, d. h. weiter von Top 1 % entfernt). Bei Modul 01 sind das:

|   #   | Sub-Punkt                                                     | Gewichtung |    Niveau    |            Bottleneck?             |
| :---: | :------------------------------------------------------------ | :--------: | :----------: | :--------------------------------: |
|   1   | Tri-State Shell-Routing                                       |     25     |   Top 10 %   |                Nein                |
|   2   | Z-Index-Zonen-System                                          |     15     |   Top 15 %   | Nein (Grenzwert, nicht schlechter) |
| **3** | **MainLayout/MainHeader/MainSidebar/Lobby-Grid (Dateigröße)** |   **20**   | **Top 18 %** |             **🔴 JA**              |
|   4   | Mobile Nav & Viewport                                         |     15     |   Top 10 %   |                Nein                |
|   5   | Modal-Orchestrierung                                          |     15     |   Top 8 %    |                Nein                |
| **6** | **Sandbox-Isolation**                                         |   **10**   | **Top 25 %** |             **🔴 JA**              |

Damit ergeben sich für Modul 01 genau 2 Bottlenecks — deckt sich mit der Vorgabe „schwächste 2–3 Sub-Punkte" ohne dass die Fallback-Regel (alle Werte oberhalb der Schwelle) greifen muss.

**Frisch verifiziert (2026-09-18, nicht nur aus der Quelldatei vom 2026-09-13 übernommen):**

```
src/components/home/NeonArcadeDashboardView.tsx     746 Zeilen
src/components/casino/games-catalog/WheelCarousel.tsx 686 Zeilen
src/components/home/LobbyScrollChoreography.tsx     620 Zeilen
src/components/home/InteractiveArcadeGrid.tsx        609 Zeilen
src/components/home/HeroSectionV2.tsx                573 Zeilen
```

Kein Drift seit dem 2026-09-13-Audit — identische Zeilenzahlen. Die 5 Sandbox-Routen (`/v2`, `/testing`, `/lab`, `/games-2`, `/refactoring`) existieren weiterhin alle (`ls src/app/{v2,testing,lab,games-2,refactoring}`, Stand 2026-09-18).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                               | Scope (Dateien)                                                                 | Ausführung                   | Status     | Zuständigkeit | Verifikation                                                                                                                                |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Baseline & Diagnose                                       | 5 Zieldateien unten + `13_01_layout_shell_subkategorien.md`                     | Sequenziell                  | 🔴 Geplant | LLM           | Zeilenzahlen bestätigt, je Datei 2–4 kohäsive Extraktionskandidaten benannt (Datei-/Zeilenbezug)                                            |
| L1     | Extraktion `NeonArcadeDashboardView.tsx`                  | `src/components/home/NeonArcadeDashboardView.tsx`                               | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Datei < 600 Zeilen, identisches JSX-Output (kein visueller Diff), `npm test` grün                                                           |
| L2     | Extraktion `WheelCarousel.tsx`                            | `src/components/casino/games-catalog/WheelCarousel.tsx`                         | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Datei < 600 Zeilen, `npm test` grün                                                                                                         |
| L3     | Extraktion `LobbyScrollChoreography.tsx`                  | `src/components/home/LobbyScrollChoreography.tsx`                               | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Datei < 600 Zeilen, `npm test` grün                                                                                                         |
| L4     | Extraktion `InteractiveArcadeGrid.tsx`                    | `src/components/home/InteractiveArcadeGrid.tsx`                                 | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Datei < 500 Zeilen (bereits nah an 600, kleinerer Puffer), `npm test` grün                                                                  |
| L5     | Extraktion `HeroSectionV2.tsx`                            | `src/components/home/HeroSectionV2.tsx`                                         | 🔀 Fan-out-Cluster 1         | 🔴 Geplant | LLM           | Datei < 500 Zeilen, `npm test` grün                                                                                                         |
| L6     | Merge: Cross-Datei-Konsistenz + volle Verifikations-Suite | —                                                                               | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM           | `npm run typecheck` / `npm test` / `npm run lint` / `npm run build` alle grün, 0 unbeabsichtigte Änderungen außerhalb der 5+neuen Dateien   |
| L7     | Sandbox-Isolation-Dokupflicht (#6)                        | neu: `T_FRONTEND/SANDBOX_ROUTES_STATUS.md`                                      | Sequenziell                  | 🔴 Geplant | LLM           | Doku-Datei mit allen 5 Routen, Zweck, Anlage-Datum (soweit per `git log --diff-filter=A` ermittelbar) und "nächstes Review"-Datum existiert |
| L8     | Abschluss: Doku-Update & Self-Audit                       | `T_FRONTEND/00_UEBERSICHT.md`, `T_FRONTEND/13_01_layout_shell_subkategorien.md` | Sequenziell                  | 🔴 Geplant | LLM           | Planungsdatei-Spalte umgestellt, Niveau-Projektion (Abschnitt 5) verifiziert eingetragen                                                    |

**Fan-out-Cluster 1 (L1–L5) — Gegenprobe an Kriterium 6 des Jan-Planer-Skills:**
(a) Gesamtaufwand: 5 Dateien mit je 570–750 Zeilen strukturell zu zerlegen liegt deutlich über der 45-Minuten-Schwelle. (b) Jede Einzeldatei ist für sich ein eigenständiger Themenbereich (eigene Komponente, eigener Ordner, kein gemeinsamer Schreibbereich zwischen den 5 Dateien) und liegt klar über der 10-Minuten-Schwelle pro Teilaufgabe. Kein Meilenstein braucht das Ergebnis eines anderen als Eingabe (a), kein gemeinsamer Schreibbereich (b), ein Fehlschlag ändert nicht die Bewertung der anderen (c) — Fan-out-Cluster korrekt gebildet.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- Zieldateien (siehe Tabelle L1–L5 oben)
- Quelldaten: [`T_FRONTEND/13_01_layout_shell_subkategorien.md`](../13_01_layout_shell_subkategorien.md), [`T_FRONTEND/00_UEBERSICHT.md` Abschnitt 1 Zeile 46](../00_UEBERSICHT.md)
- Präzedenzfall für Extraktion (Vorbild, gleiche Methodik bereits erfolgreich ausgeführt): `HistoryTableStream.tsx` 824 → 173 Zeilen, siehe [`03_meta_features_admin_ui_plan.md`](../../../../../docs/archive/frontend/T_FRONTEND/Planungsdateien/03_meta_features_admin_ui_plan.md)
- Konvention für neue Unterdateien: co-lokiert im selben Ordner, `PascalCase.tsx`, benannt nach dem extrahierten UI-Block (z. B. `NeonArcadeDashboardHeader.tsx`), keine neue Ordnertiefe nötig

### 2.2 Systemregeln & Invarianten

- Reine strukturelle Extraktion: identisches JSX-Markup, identische Props/State-Flüsse, identisches Rendering-Ergebnis — **kein** Verhaltens-, Styling- oder Copy-Change.
- `xx_sop/17_web_design_quality.md` (Anti-Template) bleibt unberührt, da kein Design geändert wird.
- Keine Kollision mit der parallelen Mobile-LCP-Kampagne: `grep` gegen `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` und alle `T_FRONTEND/Planungsdateien/06–20_mobile_lcp_*` (2026-09-18) ergab **0 Treffer** für die 5 Zieldateinamen — kein Scope-Overlap.
- Datei `WheelCarousel.tsx` liegt unter `src/components/casino/games-catalog/` — vor Änderung kurz prüfen, ob ein `CLAUDE.md` in diesem Ordner existiert (Stand L0-Prüfung: falls ja, dessen Ordner-Konventionen zusätzlich beachten).

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- **Keine** Löschung oder Deaktivierung der 5 Sandbox-Routen (`/v2`, `/testing`, `/lab`, `/games-2`, `/refactoring`) — das ist eine Scope-Entscheidung, die laut Aufgabenstellung ins Options-Gate gehört, nicht in diesen Plan. L7 dokumentiert nur, entscheidet nicht.
- **Keine** Änderung an `ClientShell.tsx` Tri-State-Routing (Sub-Punkt #1, Top 10 %, kein Bottleneck in dieser Runde).
- **Keine** Migration des Z-Index-Systems (Sub-Punkt #2, Grenzfall Top 15 %, bewusst nicht Teil dieser Runde).
- **Keine** visuelle/CSS-Änderung an den 5 Zieldateien — reine Datei-Dekomposition.
- **Keine** Änderung an fremden, uncommitteten Dateien (siehe `git status` vor L0).

---

## 3 — Detaillierte Meilensteine

### L0: Baseline & Diagnose

- **Ziel:** Für jede der 5 Dateien 2–4 kohäsive, klar abgrenzbare JSX-Blöcke identifizieren, die sich ohne Verhaltensänderung in eigene Komponenten extrahieren lassen (z. B. Header-Markup, Karten-Render-Funktion, Modal-/Overlay-Block, wiederholte Listen-Item-Struktur).
- **Schritte:** 1. Jede Datei mit `Read` (bei > 300 Zeilen zunächst `limit ≤ 120`, dann gezielte Slices — keine Voll-Reads ohne Begründung, siehe `CLAUDE.md` Tool-Output-Ökonomie) einlesen. 2. Extraktionskandidaten mit Zeilenbereich notieren. 3. Bestätigen, dass keine der Dateien Wallet-/API-Aufrufe enthält (`grep -n "fetch(\|supabase\|applyServerWalletSnapshot"`).
- **Erwartetes Verhalten:** Eine Liste pro Datei mit Kandidaten-Blöcken (Name, Zeilenbereich, geschätzte extrahierte Zeilenzahl).
- **Abbruchkriterium:** Falls eine Datei keine sinnvoll disjunkten Blöcke hat (monolithische Logik ohne trennbare UI-Abschnitte), diese Datei von L1–L5 ausnehmen und im Abschlussbericht als "nicht extrahierbar ohne Redesign" vermerken statt zu erzwingen.

### L1–L5: Extraktion je Datei (Fan-out-Cluster 1)

- **Ziel:** Jede Zieldatei auf den in der Übersichtstabelle genannten Zielwert reduzieren, indem die in L0 identifizierten Blöcke in eigene, co-lokierte Komponentendateien verschoben werden.
- **Schritte je Datei:** 1. Neue Datei(en) anlegen mit exportierter Komponente, die exakt das ursprüngliche JSX + benötigte Props kapselt. 2. Ursprungsdatei importiert und rendert die neue Komponente an derselben Stelle. 3. `npm run typecheck` lokal für die betroffene Datei prüfen.
- **Erwartetes Verhalten:** Kein Unterschied im gerenderten Output; nur Dateistruktur ändert sich.
- **Abbruchkriterium:** Wenn eine Extraktion Props-Bohrung (Prop-Drilling) über mehr als 2 Ebenen erzwingen würde, Block kleiner schneiden oder auslassen statt Architektur zu verbiegen — im Zweifel konservativer extrahieren, nicht um jeden Preis unter die Ziel-Zeilenzahl kommen.

### L6: Merge & volle Verifikations-Suite

- **Ziel:** Sicherstellen, dass alle 5 Extraktionen zusammen keine Regressionen verursachen.
- **Schritte:** 1. `npm run typecheck`. 2. `npm test`. 3. `npm run lint`. 4. `npm run build`. 5. `git status` / `git diff --stat` prüfen — nur die 5 Zieldateien + neue extrahierte Dateien dürfen geändert/neu sein.
- **Abbruchkriterium:** Jeder rote Schritt stoppt den Merge; Ursache in der jeweiligen L1–L5-Extraktion beheben, nicht in L6 selbst patchen.

### L7: Sandbox-Isolation-Dokupflicht

- **Ziel:** Den Befund „kein dokumentiertes Aufräum-Datum" aus Sub-Punkt #6 schließen, ohne eine Lösch-Entscheidung zu treffen.
- **Schritte:** 1. Für jede der 5 Sandbox-Routen per `git log --diff-filter=A --format=%ad --date=short -- src/app/<route>` das Anlage-Datum ermitteln. 2. Neue Datei `T_FRONTEND/SANDBOX_ROUTES_STATUS.md` mit Tabelle (Route, Zweck laut vorhandener Doku/Kommentare, Anlage-Datum, "nächstes Review" = +90 Tage ab heute) anlegen.
- **Erwartetes Verhalten:** Eine einzelne, verlinkte Übersichtsdatei; keine Code-Änderung an den Sandbox-Routen selbst.
- **Abbruchkriterium:** Keines — reine Dokumentation, nicht fehlschlagbar.

### L8: Abschluss

- **Ziel:** `T_FRONTEND/00_UEBERSICHT.md` Zeile 46 (Modul 01) und `13_01_layout_shell_subkategorien.md` auf den neuen, verifizierten Stand heben; Self-Audit dieser Datei durchführen.
- **Schritte:** 1. Planungsdatei-Spalte in Zeile 46 von „—" auf `23_layout_shell_navigation_plan.md` setzen (Execution-Spalte bleibt „—", da Execution-Ready ≠ Executed). 2. Sub-Punkte #3/#6 in `13_01_...md` mit neuem Niveau versehen, sobald tatsächlich ausgeführt (nicht in dieser Planungsrunde).

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler
2. **Tests:** `npm test` — alle bestehenden Tests weiterhin grün (keine neuen Tests nötig, da reine Struktur-Extraktion ohne Verhaltensänderung)
3. **Lint:** `npm run lint` — 0 neue Errors/Warnings (bestehende 40 Warnings aus anderen Dateien unverändert, siehe Baseline 2026-09-18)
4. **Build:** `npm run build` — Production-Build erfolgreich
5. **Git Diff:** `git diff --stat` zeigt ausschließlich die 5 Zieldateien + neu extrahierte Komponentendateien + `T_FRONTEND/SANDBOX_ROUTES_STATUS.md` + `00_UEBERSICHT.md`/`13_01_...md`

---

## 5 — Ehrliche Niveau-Projektion

| Sub-Punkt            |   Vorher   | Nach Ausführung (Projektion) | Begründung                                                                                                                                                                                                                           |
| :------------------- | :--------: | :--------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #3 Dateigröße        |  Top 18 %  |       **Top 10–12 %**        | Alle 5 Dateien unter 600 (bzw. 500) Zeilen, analog zum Modul-10-Präzedenzfall (824→173 Zeilen brachte Top 40 %→Top-Einzelwert deutlich runter) — hier vorsichtiger projiziert, da 5 Dateien mit größerer Varianz in Extrahierbarkeit |
| #6 Sandbox-Isolation |  Top 25 %  |         **Top 15 %**         | Dokumentation schließt die Transparenzlücke vollständig, löst aber die zugrunde liegende technische Schuld (5 parallele Routen) nicht — daher keine Top-10-%-Projektion                                                              |
| **Modul-Gesamt**     | Top 13,6 % |      **≈ Top 11–12 %**       | Gewichteter Schnitt mit unveränderten Sub-Punkten 1/2/4/5                                                                                                                                                                            |

**Nicht schöngerechnet:** Die Projektion für #3 hat eine Bandbreite (10–12 %) statt eines Einzelwerts, weil L0 erst zur Ausführungszeit zeigt, wie sauber sich jede der 5 Dateien tatsächlich zerlegen lässt — bei einer monolithischen Datei ohne trennbare Blöcke (siehe L0-Abbruchkriterium) fällt der reale Wert schlechter aus als hier projiziert.

---

## 6 — Selbstprüfung (Kern-8-Rubrik nach `xx_sop/12_workflow_dokument_qualitaet.md` §2)

|  #  | Kriterium                               | Score /3 | Begründung                                                                                                                                       |
| :-: | :-------------------------------------- | :------: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Verifizierbarkeit gegen Repo-Realität   |    3     | Alle 5 Zeilenzahlen, Sandbox-Routen und Money-Pfad-Grep frisch am 2026-09-18 verifiziert, nicht aus der Quelldatei vom 13. übernommen            |
|  2  | Konkretheit der Handlungsanweisung      |    3     | Exakte Dateipfade, Fan-out-Cluster mit Gegenprobe, konkrete Zielwerte (< 600/500 Zeilen), reale Befehle                                          |
|  3  | Vollständigkeit des Lebenszyklus/Scopes |    3     | L0 Diagnose → L1–L5 Umsetzung → L6 Verifikation → L7 Doku → L8 Abschluss/Rollout vollständig                                                     |
|  4  | Bekannte-Probleme-Transparenz           |    2     | Abbruchkriterium für „nicht extrahierbare" Dateien benannt; keine weiteren bekannten Lücken zu diesem engen Scope                                |
|  5  | Cross-Referenz-Konsistenz               |    3     | Verweise auf `13_01_...md`, `00_UEBERSICHT.md`, Modul-10-Präzedenzfall und Mobile-LCP-Kampagne alle stichprobenartig geprüft (0 Overlap-Treffer) |
|  6  | Risiko-/Freigabeklassifizierung         |    3     | Money-Pfad: Nein mit Grep-Beleg; kein Jan-Gate nötig; Sandbox-Löschung explizit als Nicht-Scope/Options-Gate ausgeklammert                       |
|  7  | Lerneffekt-Tauglichkeit                 |    3     | Auswahlmethodik (Abschnitt 0) und Fan-out-Gegenprobe explizit hergeleitet, kein Blackbox-Ergebnis                                                |
|  8  | Aktualitäts-Check                       |    3     | Stand 2026-09-18 vermerkt, gegen `npm run lint`-Baseline vom selben Tag abgeglichen                                                              |

**Score: 23 / 24 → Tier Top 1 %.** Einzige bewusste Lücke: Kriterium 4 (2 statt 3), da der Scope so eng ist, dass es außer dem L0-Abbruchkriterium keine weiteren „bekannten Probleme" zu benennen gibt.
