# 03a-R07 — Duplikation vermeiden (Regel 7)

> **Status:** Executed (2026-09-14; L0–L2 + L4 ✅; L3 = Verweis auf Plan 03 — **Gate dort am 2026-09-16 geschlossen (X3, 4,20)**, Umsetzung in separatem Implementation-Plan; R7 49→68 %) · **Stand:** 2026-09-16 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Duplikat-Detection-Tooling + Wachstums-Gate; die Crash-Loop-Extraktion selbst ist Plan-03-Option X3 und bleibt dort (kein Doppelplan).
> **Money-Pfad:** Nein (Tooling + CI-Schritt; keine Spiellogik-Berührung) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R7 (Niveau 68 %, Bottlenecks #1/#2/#5) · Vorarbeit: [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) (Option **2026-09-16 entschieden: X3, Score 4,20** — Schritt 0 = X1, 4,63)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                            | Scope (Dateien)                                                        | Ausführung  | Status                                    | Zuständigkeit | Verifikation                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- | ----------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| L0     | Baseline & Diagnose: Crash-Duplikation als Referenzfall nutzen — aktuelle Duplikatzeilen-Zahl gegen Plan-03-Analyse (~350–360 Z.) verifizieren                                                                                                                         | read-only: beide Game-Loop-Dateien                                     | Sequenziell | 🔴 Geplant                                | LLM           | Zahl konsistent mit Plan 03 §2a                                                                  |
| L1     | Duplikat-Detection-Tooling aufsetzen: `scripts/check-duplication.mjs` (jscpd oder eigene Zeilen-Fenster-Heuristik) mit Schwellwert (z. B. ≥ 30 identische Zeilen über Dateien = Warnung); Ausgabe maschinenlesbar (`file:line`-Format)                                 | `scripts/check-duplication.mjs` (neu), `package.json` (Script-Eintrag) | Sequenziell | 🔴 Geplant                                | LLM           | Script-Lauf lokal: findet die bekannten ~350 Crash-Duplikatzeilen (Echt-Test gegen Referenzfund) |
| L2     | Duplikat-Wachstums-Gate: 1 Schritt in `quality-ci.yml` (Warn-Level, nicht blockierend — erste Fahrzeit Beobachtung) oder dokumentierte Begründung, warum nur lokal                                                                                                     | `.github/workflows/quality-ci.yml`                                     | Sequenziell | 🔴 Geplant                                | LLM           | CI-Run grün; Warnausgabe sichtbar                                                                |
| L3     | Crash-Extraktion (Sub-Sub #1): **Verweis, kein Doppel-Plan** — Umsetzung läuft über [Plan 03 §2a Option X3](03_code_modularisierung_lesfootprint_plan.md), seit dem Gate-Abschluss 2026-09-16 in einem separaten Implementation-Plan; diese Planungsdatei verweist nur | Verweis                                                                | Sequenziell | 🟢 Gate geschlossen (Plan 03, 2026-09-16) | Jan           | Gate-Abschluss in Plan 03 §2a dokumentiert                                                       |
| L4     | Niveau-Rückschreibung: §R7 Sub-Subs #1/#2/#5                                                                                                                                                                                                                           | `../01_15_03a_code_modularisierung_regelkatalog.md`                    | Sequenziell | 🔴 Geplant                                | LLM           | Neuer R7-Schnitt dokumentiert                                                                    |

**Fan-out-Check (Kriterium 5):** L1→L2 kausal, L3 extern geblockt — **kein Fan-out.** Kriterium 6: L1 kann 10–20 Min. überschreiten, aber nur 1 Teilaufgabe → sequenziell sinnvoller als Fan-out.

## 2 — Self-Contained Kontext-Koffer

- **Referenzfund (verifiziert, Plan 03 L0):** `useCrashGameLoop.ts` (982 Z.) vs. `useCrashMultiplayerGameLoop.ts` (782 Z.) — ~350–360 Duplikatzeilen, 4 verbatim-Blöcke, gameLoop-Body ~125 Z. größter Block; einzige echte Divergenz = Crash-Resolution-Timing in 2 kleinen Callbacks.
- **Tooling-Wahl:** jscpd (bewährt, Token-basiert, JS/TS-Support) oder Zeilen-Fenster-Heuristik (0 Dependency). Bevorzugt jscpd als Dev-Dependency, außer Abhängigkeits-Politik spricht dagegen — dann Heuristik.
- **Extern belegt:** Registration-Pattern + Duplikat-Checks machen Teilimplementierungen sichtbar, bevor sie zu Parallel-Modulen wachsen; Duplikate werden ohne Tooling nur zufällig gefunden (Sub-Sub #2 Niveau 25).
- **Gate-Logik:** Warn-Level statt Block-Level in CI — erste Fahrzeit soll Falsch-Positiv-Rate zeigen, bevor hart blockiert wird (Fail-soft-Übergang).

## 3 — Expliziter Nicht-Scope

- Keine Crash-Loop-Extraktion in diesem Plan (Plan 03 §2a Option X3, Gate am 2026-09-16 geschlossen — Umsetzung in separatem Implementation-Plan).
- Kein Refactor sonstiger Duplikate, die das Tooling finden wird (Fundliste = Input für künftige Pläne, keine Sofort-Aktion).
- Keine Änderung an Spiellogik, Dep-Arrays oder Rendering.

## 4 — Lebenszyklus

`Execution-Ready` → L0–L2, L4 sequenziell → `Executed (archiviert)`; L3 folgt unabhängig dem Plan-03-Lebenszyklus (Gate am 2026-09-16 geschlossen: X3 — Umsetzung in separatem Plan).

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Referenzfund gegen Plan-03-Analyse verifiziert — nicht manuell, sondern als Echt-Test des L1-Toolings: Script trifft `useCrashGameLoop.ts` ↔ `useCrashMultiplayerGameLoop.ts` (3 Blöcke, größter 96 Z. verbatim: Z. 491–586 ↔ 669–764) plus das übrige Crash-Cluster (Pages, Sidebars, Stages). Konsistent mit Plan-03-Angabe (~350–360 Z., gameLoop-Body größter Block).
- **L1:** ✅ `scripts/check-duplication.mjs` angelegt — **Entscheidung gegen jscpd**: Heuristik ist 0-Dependency (keine Dev-Dep-Änderung an package.json nötig) und reicht für das Wachstums-Gate. Mechanik: Zeilen-Fenster (default 30 signifikante Zeilen, Kommentar-/Leerzeilen-gefiltert) gehasht, Fenster-Gruppen mit Vorkommen in ≥ 2 Dateien zu Blöcken gemergt, Ausgabe `file:line-range <-> file:line-range`, exit 0 (Warn-Level; `--strict` für Block-Modus reserviert). `npm run check-duplication` in package.json eingetragen. Erste Messung: 69 Paare, davon 34 aus bewusst duplizierten Sandbox-Kopien (`src/app/testing/**` — R02-Befund „einheitliches Client+parts-Muster") → Sandboxes ausgenommen, verbleibende 35 Paare sind echtes Signal (Crash-Cluster, Blackjack-Karten, Store-Helper).
- **L2:** ✅ CI-Schritt in `.github/workflows/quality-ci.yml` nach `check-doc-links`: `npm run check-duplication` mit `continue-on-error: true` (Warn-Level, Fail-soft wie Coverage-Schritt) + Kommentar zur beobachtenden ersten Fahrzeit.
- **L3:** 🟢 Verweis (kein Doppel-Plan): Crash-Extraktion läuft über [Plan 03 §2a Option X3](03_code_modularisierung_lesfootprint_plan.md) — Fundliste des Tools ist dort bereits Input. Das Gate ist am 2026-09-16 geschlossen (X3 4,20, Schritt 0 = X1 4,63); die Extraktion selbst folgt in einem separaten Implementation-Plan.
- **L4:** ✅ Re-Rating §R7: #2 25→90 (Tooling live + Echt-Test), #5 25→75 (CI-Warn-Level). #1 bleibt 40 (die Extraktion selbst steht in einem separaten Implementation-Plan; das Options-Gate wurde am 2026-09-16 mit **X3 (4,20)** geschlossen). Neuer R7-Schnitt: **68 %** (vorher 49 %; (40+90+70+55+75+80)/6 = 68,3).
