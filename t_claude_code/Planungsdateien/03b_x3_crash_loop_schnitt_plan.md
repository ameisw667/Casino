# 03b — X3: Crash-Loop-Duplikation extrahieren (Umsetzungsplan)

> **Status:** Execution-Ready · **Stand:** 2026-09-17 · **Owner:** LLM (Jan nur bei Gate L3) · **Scope:** Die 4 verbatim doppelten Animationsblöcke der beiden Crash-Spielarten in ein gemeinsames Geschwister-Modul `src/components/casino/games/crash-loop/` überführen (Schritt 0 = pure Mathematik + erste Unit-Tests); keine Änderung an Spielablauf, Gewinnlogik oder Optik.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [03a-R03 §2b](03a_r03_single_responsibility_plan.md) Option **X3 (4,20)** mit **X1 als Schritt 0 (4,63)**, X2 (4,38) als optionales Netz · Klartext-Erklärung: [`../01_15_03b_w3_x3_erklaerung.md`](../01_15_03b_w3_x3_erklaerung.md) §4 · Katalog-Ziel: Regel 7 (Duplikation, 68 % → Ziel ~85 %) und Regel 3 (Verantwortlichkeiten, 62 %)
> **Ausgangsdateien (Messung 2026-09-16, `wc -l`):** `crash/useCrashGameLoop.ts` **982 Z.** · `crash-multiplayer/useCrashMultiplayerGameLoop.ts` **782 Z.** · ~350–360 verifizierte Duplikatzeilen in 4 Blöcken

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                 | Scope (Dateien)                                                                                                                             | Ausführung            | Status     | Zuständigkeit | Verifikation                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------- | ------------- | ------------------------------------------------------------------------- |
| L0     | Baseline: Block-Grenzen + Anker punktegenau fixieren, Testkonvention prüfen                                                 | read-only: beide Loop-Dateien, `vitest.config.ts`                                                                                           | Sequenziell           | 🔴 Geplant | LLM           | Anker-Tabelle mit `Datei:Zeile` für alle 4 Blöcke, 0 offene Fragen        |
| L1     | **Schritt 0 (= X1):** pure Rechenfunktionen + erste Unit-Tests für Crash-Animationscode                                     | **neu:** `crash-loop/particles-physics.ts`, `crash-loop/tail-geometry.ts`, `crash-loop/viewport-shake.ts`, `crash-loop/__tests__/*.test.ts` | Sequenziell           | 🔴 Geplant | LLM           | `npm test` grün (neue Tests), `npm run typecheck`, `npm run lint`         |
| L2     | 4 Dup-Blöcke 1:1 ins gemeinsame Modul, Unterschiede als Parameter                                                           | **neu:** `crash-loop/crash-loop-shared.ts` + `index.ts`; **geändert:** beide Loop-Dateien                                                   | Sequenziell           | 🔴 Geplant | LLM           | `npm test` + Sichtvergleich beider Crash-Seiten (Design-Guardian-Stufe 6) |
| L3     | _(optional, nur bei Unsicherheit im Sichtvergleich)_ = X2: Verhalten der 4 Blöcke mit jsdom/Zeichentakt-Attrappe festnageln | **neu:** `crash-loop/__tests__/crash-loop-shared.characterization.test.tsx`                                                                 | Sequenziell (bedingt) | 🟡 Bedingt | LLM           | Charakterisierungs-Tests grün **vor** dem Verschieben                     |
| L4     | Abschluss: Nachmessung, Katalog-Regeln R3/R7 rückschreiben, Ordnerdoku prüfen                                               | beide Loop-Dateien (read-only), `../../01_15_03a_…regelkatalog.md`                                                                          | Sequenziell           | 🔴 Geplant | LLM           | 5-Stufen-DoD + `npm run check-file-sizes`                                 |

**Fan-out-Check (Kriterium 5/6):** L1→L2→L4 sind strikt nacheinander (L2 setzt die Funktionen aus L1 voraus, L4 misst L1/L2). Kein Fan-out: L1 ist zwar pro Funktionsteil unabhängig, aber jede Teilaufgabe liegt unter der 10-Minuten-Schwelle — gebündelt, nicht parallelisiert.

## 2 — Self-Contained Kontext-Koffer

**Wo das Modul hingehört:** `src/components/casino/games/crash-loop/` als **Geschwister** beider Feature-Ordner (`crash/`, `crash-multiplayer/`; beide existieren, Verzeichnis `crash-loop/` existiert noch **nicht** — geprüft 2026-09-17). Grund: Regel R2 verbietet Importe quer zwischen den beiden konkurrierenden Feature-Ordnern; ein Modul **innerhalb** von `crash/` müsste von `crash-multiplayer/` importiert werden — genau das ist untersagt.

**Die 4 Blöcke mit verifizierten Ankern** (Solo = `crash/useCrashGameLoop.ts`, MP = `crash-multiplayer/useCrashMultiplayerGameLoop.ts`):

|  #  | Block                          | Solo-Anker                                                                        | MP-Anker                                                                          | Bekannter Unterschied                                   |
| :-: | ------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
|  1  | Partikel: Explosion + Bewegung | `createExplosion` Z. 119, `particleCount` Z. 123, `updateAndDrawParticles` Z. 211 | `createExplosion` Z. 121, `particleCount` Z. 125, `updateAndDrawParticles` Z. 199 | keiner (verbatim)                                       |
|  2  | Tail (Schweif)                 | `createTail` Z. 161, `tailGrad` Z. 774                                            | `createTail` Z. 163                                                               | **Nozzle-Konstante: MP 0,45 vs. Solo 0,35** → Parameter |
|  3  | Auflösung (devicePixelRatio)   | Z. 441                                                                            | Z. 245                                                                            | keiner                                                  |
|  4  | Shake + Starfield              | `shakeX/shakeY` Z. 458–459                                                        | `shakeX/shakeY` Z. 262–263                                                        | keiner                                                  |

**Nicht extrahieren (bewusst):**

- Der Haupt-Zeichentakt (~125 Z.) unterscheidet sich in 2 kleinen Rückrufen um `settleCrashedRound` — bleibt je Spielart.
- `MOBILE_IDLE_CANVAS_DELAY_MS = 5_000` (MP-Hook Z. 32, genutzt Z. 771–778) bleibt im MP-Hook (dokumentiert in `crash-multiplayer/CLAUDE.md`).
- Der eigentliche Zeichenaufruf (`draw`) bleibt je Modus divergent.

**Harte Constraints:**

1. **Reihenfolge-Merker verbatim:** die React-Abhängigkeitslisten müssen Zeichen für Zeichen erhalten bleiben (`draw` `[status]`, `gameLoop` `[draw, settleCrashedRound, resetRiskVisuals]`) — sie sichern die stabile Handle-Semantik; jede Umsortierung erzeugt Neuaufbau-Schleifen.
2. **Parameter statt Codeänderung:** der Nozzle-Unterschied (0,45/0,35) wird als Argument übergeben, nicht als zwei Codepfade.
3. **Testkonvention (geprüft 2026-09-17):** `vitest.config.ts` lädt `src/**/__tests__/**/*.test.{ts,tsx}`, Standardumgebung `node`; DOM/Zeichentakt-Tests brauchen die Datei-Kopfzeile `// @vitest-environment jsdom` (jsdom ist projektweit vorhanden).

**Bestand an Tests (präzise, geprüft 2026-09-17):** In beiden Crash-Ordnern existieren je **22 Zeilen** Test — beide prüfen **Stil-/Asset-Fragen** per `readFileSync` (`crash-mobile-backdrop.test.ts`, `crash-multiplayer-styles.test.ts`). Für die **Animations-/Schleifenlogik** gibt es **0 Tests** — diese Aussage aus §2b bleibt damit korrekt, sie ist nur enger zu lesen als „keine Tests im Ordner".

## 3 — Expliziter Nicht-Scope

- Keine Änderung an Spielablauf, Trefferchancen, Gewinnberechnung oder Abrechnung.
- Kein Umbau des Zeichentakts, kein Zusammenlegen der beiden Spielarten, kein Strategy-Umbau (Option A der 1. Fassung, 3,03 — unter der Bar).
- Keine neue Abhängigkeit, kein Eingriff in `vitest.config.ts`-Schwellen.
- Kein Verschieben von `MOBILE_IDLE_CANVAS_DELAY_MS` in das gemeinsame Modul.

## 4 — Lebenszyklus

`Execution-Ready` → L0 → L1 → L2 → (L3 nur falls Sichtvergleich unsicher) → L4 Nachmessung → `Executed (archiviert)`; danach Katalog-Regeln R3/R7 auf die **echten** Ist-Werte zurückschreiben.

**Rollback:** Nach **jedem** Meilenstein ein eigener Commit-Punkt (L1 = nur neue Dateien → verwerfbar ohne Rückwirkung; L2 = beide Loop-Dateien → `git checkout --` auf die zwei Dateien genügt).

## 5 — Execution-Log

**2026-09-17:**

- Plan angelegt (LLM-Entscheidung, von Jan delegiert). Faktenprüfung: `crash-loop/` existiert nicht · Anker verifiziert (Solo/MP): Explosion 119/121, `particleCount` 123/125, `createTail` 161/163, `updateAndDrawParticles` 211/199, devicePixelRatio 441/245, Shake 458–459/262–263, `tailGrad` 774 (nur Solo) · Testkonvention `src/**/__tests__/**/*.test.{ts,tsx}` + Umgebung `node` (`jsdom` per Datei-Kopfzeile) und die zwei 22-Zeilen-Bestandstests (Stil/Asset, keine Animationslogik) verifiziert.
- Noch offen: L0–L4 (Umsetzung).
