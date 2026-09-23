# 03b — X3: Crash-Loop-Duplikation extrahieren (Umsetzungsplan)

> **Status:** ✅ **Executed** (L0–L4 am 2026-09-18 abgeschlossen, nicht archiviert) · **Owner:** LLM · **Scope:** Die 4 verbatim doppelten Animationsblöcke der beiden Crash-Spielarten in ein gemeinsames Geschwister-Modul `src/components/casino/games/crash-loop/` überführen (Schritt 0 = pure Mathematik + erste Unit-Tests); keine Änderung an Spielablauf, Gewinnlogik oder Optik.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [03a-R03 §2b](03a_r03_single_responsibility_plan.md) Option **X3 (4,20)** mit **X1 als Schritt 0 (4,63)**, X2 (4,38) als optionales Netz · Klartext-Erklärung: [`../01_15_03b_w3_x3_erklaerung.md`](../01_15_03b_w3_x3_erklaerung.md) §4 · Katalog-Ziel: Regel 7 (Duplikation, 68 % → Ziel ~85 %) und Regel 3 (Verantwortlichkeiten, 62 %)
> **Ergebnis (gemessen 2026-09-18, `wc -l`):** `crash/useCrashGameLoop.ts` **982 → 849 Z.** · `crash-multiplayer/useCrashMultiplayerGameLoop.ts` **782 → 663 Z.** · Differenz beider Hooks: **332 Zeilen entfernt, 80 Zeilen Hüllen/Importe zurück** (netto −252) · neu: 5 Module + 5 Testdateien mit **71 Tests**, Suite **1942 → 2013 Tests grün**

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                 | Scope (Dateien)                                                                                                                                                           | Ausführung            | Status         | Zuständigkeit | Verifikation                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| L0     | Baseline: Block-Grenzen + Anker punktegenau fixieren, Testkonvention prüfen                                                 | read-only: beide Loop-Dateien, `vitest.config.ts`                                                                                                                         | Sequenziell           | ✅ Erledigt    | LLM           | Anker-Tabelle mit `Datei:Zeile` für alle 4 Blöcke, 0 offene Fragen                                 |
| L1     | **Schritt 0 (= X1):** pure Rechenfunktionen + erste Unit-Tests für Crash-Animationscode                                     | **neu:** `crash-loop/particles-physics.ts`, `crash-loop/tail-geometry.ts`, `crash-loop/viewport-shake.ts`, `crash-loop/canvas-frame.ts`, `crash-loop/__tests__/*.test.ts` | Sequenziell           | ✅ Erledigt    | LLM           | `npm test` grün (37 neue Tests), `npm run typecheck`, `npm run lint`                               |
| L2     | 4 Dup-Blöcke 1:1 ins gemeinsame Modul, Unterschiede als Parameter                                                           | **neu:** `crash-loop/crash-loop-shared.ts` + `index.ts`; **geändert:** beide Loop-Dateien                                                                                 | Sequenziell           | ✅ Erledigt    | LLM           | `npm test` grün, `npm run typecheck` grün, `npm run lint` ohne Befund in den Crash-Dateien         |
| L3     | _(optional, nur bei Unsicherheit im Sichtvergleich)_ = X2: Verhalten der 4 Blöcke mit jsdom/Zeichentakt-Attrappe festnageln | **neu:** `crash-loop/__tests__/crash-loop-shared.characterization.test.ts`                                                                                                | Sequenziell (bedingt) | ✅ **Gezogen** | LLM           | 34 Charakterisierungs-Tests grün — sie ersetzen den Sichtvergleich, den der LLM nicht leisten kann |
| L4     | Abschluss: Nachmessung, Katalog-Regeln R3/R7 rückschreiben, Ordnerdoku prüfen                                               | beide Loop-Dateien (read-only), `../../01_15_03a_…regelkatalog.md`                                                                                                        | Sequenziell           | ✅ Erledigt    | LLM           | 5-Stufen-DoD + `npm run check-file-sizes` (OK, 1063 Dateien)                                       |

**Fan-out-Check (Kriterium 5/6):** L1→L2→L4 sind strikt nacheinander (L2 setzt die Funktionen aus L1 voraus, L4 misst L1/L2). Kein Fan-out: L1 ist zwar pro Funktionsteil unabhängig, aber jede Teilaufgabe liegt unter der 10-Minuten-Schwelle — gebündelt, nicht parallelisiert.

## 2 — Self-Contained Kontext-Koffer

**Wo das Modul liegt:** `src/components/casino/games/crash-loop/` als **Geschwister** beider Feature-Ordner (`crash/`, `crash-multiplayer/`). Grund: ein Modul **innerhalb** von `crash/` müsste von `crash-multiplayer/` importiert werden — der Quer-Import zwischen den beiden konkurrierenden Feature-Ordnern bleibt so vermieden; beide Hooks importieren ausschließlich `../crash-loop`.

**Modul-Aufteilung (Ist, 2026-09-18):**

| Datei                  | Zeilen | Rolle                                                                        |
| ---------------------- | -----: | ---------------------------------------------------------------------------- |
| `particles-physics.ts` |    140 | pure Mengen/Konstanten + Partikel-Generatoren (Explosion, Schweif)           |
| `tail-geometry.ts`     |     57 | pure Düsen-/Herkunfts-Geometrie + Stereopan des Explosionsklangs             |
| `viewport-shake.ts`    |     32 | pure Kamera-Ruck-Mathematik (Schwelle, Versatz, Abklingen, Intensität)       |
| `canvas-frame.ts`      |     27 | pure Auflösungs-Mathematik (Pixeldichte, Rückpuffer-Größe, Update-Entscheid) |
| `crash-loop-shared.ts` |    251 | die vier verschobenen Blöcke, pro Aufruf an Refs/Kontext gebunden            |
| `index.ts`             |     48 | Fassade — re-exportiert alle Bausteine                                       |

**Die 4 Blöcke mit verifizierten Ankern** (Solo = `crash/useCrashGameLoop.ts`, MP = `crash-multiplayer/useCrashMultiplayerGameLoop.ts`):

|  #  | Block                          | Solo-Anker heute                                                                       | MP-Anker heute                                                           | Tatsächlicher Unterschied                                                                            |
| :-: | ------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
|  1  | Partikel: Explosion + Bewegung | `createExplosion` vorher Z. 119 · `updateAndDrawParticles` vorher Z. 211               | `createExplosion` vorher Z. 121 · `updateAndDrawParticles` vorher Z. 199 | keiner (verbatim)                                                                                    |
|  2  | Tail (Schweif)                 | `createTail` vorher Z. 161 (Dual-Düsen-Geometrie `-46` axial, `±11` quer, Jitter `±3`) | `createTail` vorher Z. 163 (Einzelpunkt, Jitter `±4`)                    | **zwei**, nicht einer: Spreizung `0,35` vs. `0,45` **und** Herkunfts-Strategie (Dual-Düse vs. Punkt) |
|  3  | Auflösung (devicePixelRatio)   | vorher Z. 441                                                                          | vorher Z. 245                                                            | keiner                                                                                               |
|  4  | Shake + Starfield              | Shake vorher Z. 456–462 · Starfield vorher Z. 486–517                                  | Shake vorher Z. 260–266 · Starfield vorher Z. 326–357                    | keiner                                                                                               |

> **Plan-Korrektur (in L0 gefunden, in der Umsetzung berücksichtigt):** Die Plan-Fassung nannte als Tail-Unterschied nur die Nozzle-Konstante (`0,45` vs. `0,35`). Tatsächlich unterscheidet sich zusätzlich die **Herkunft der Partikel**: Solo rechnet zwei Düsenpositionen aus und alterniert sie, Multiplayer streut um einen Emissionspunkt. Deshalb übergibt der geteilte Generator die Herkunft als **Resolver** (`createDualNozzleOriginResolver` / `createSinglePointOriginResolver`) und die Spreizung als Parameter — beides bleibt damit je Spielart bitgleich.

**Nicht extrahiert (bewusst):** der Haupt-Zeichentakt (~125 Z., unterscheidet sich in 2 Rückrufen um `settleCrashedRound`) · `MOBILE_IDLE_CANVAS_DELAY_MS = 5_000` (MP-Hook) · der eigentliche Zeichenaufruf (`draw`) · der Solo-eigene „Kinetic Photonic Pulses"-Block (dort lebt auch das lokale `tailGrad`).

**Harte Constraints (eingehalten):**

1. **Ziehfolge der Zufallswerte ist Optik.** `pseudoRandom(prngSeedRef)` wird in beiden Spielarten in exakt der ursprünglichen Reihenfolge gezogen; die Generatoren bekommen eine `() => number`-Quelle, keinen eigenen Zufall. Auch der Starfield-Umbruch nutzt weiterhin `Math.random()` (nicht die Seed-Quelle) — sonst würde jede Sternenposition wandern.
2. **Abhängigkeitslisten verbatim:** `draw` `[status]`, `gameLoop` `[draw, settleCrashedRound, resetRiskVisuals]`, RAF-Bootstrap `[]` — Zeichen für Zeichen unverändert.
3. **Aufrufstellen unverändert:** die Blöcke wurden durch dünne, ref-gebundene Hüllen gleichen Namens ersetzt (`createExplosion`, `createTail`, `updateAndDrawParticles`), damit Zeichentakt und Spielschleife **keine einzige Zeile** ändern mussten.
4. **Partikel-Filter bleibt beim Aufrufer:** `advanceAndDrawParticles` gibt die Überlebenden zurück (neues Array), die Hülle schreibt sie in ihre Ref — identisch zum bisherigen `particlesRef.current = particlesRef.current.filter(...)`.

**Testkonvention (verifiziert):** `vitest.config.ts` lädt `src/**/__tests__/**/*.test.{ts,tsx}`, Standardumgebung `node`; DOM-/Canvas-Tests nutzen die Datei-Kopfzeile `// @vitest-environment jsdom` und eine aufzeichnende Kontext-Attrappe (jsdom liefert selbst keinen 2D-Kontext).

**Bestand an Tests:** Für die **Animations-/Schleifenlogik** gab es vorher **0 Tests** (in beiden Ordnern existierten nur je 22 Zeilen Stil-/Asset-Tests per `readFileSync`). Nach X3: **71 Tests** in 5 Dateien — 37 für die puren Module, 34 Charakterisierungs-Tests für die vier Blöcke selbst.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an Spielablauf, Trefferchancen, Gewinnberechnung oder Abrechnung.
- Kein Umbau des Zeichentakts, kein Zusammenlegen der beiden Spielarten, kein Strategy-Umbau (Option A der 1. Fassung, 3,03 — unter der Bar).
- Keine neue Abhängigkeit, kein Eingriff in `vitest.config.ts`-Schwellen.
- Kein Verschieben von `MOBILE_IDLE_CANVAS_DELAY_MS` in das gemeinsame Modul.
- Keine Änderung an `crash-helpers.ts` — der geteilte Ordner importiert daraus **nur Typen** (`import type { Particle, Star }`), also ohne Laufzeit- oder Bundle-Kopplung.

## 4 — Lebenszyklus

`Execution-Ready` → L0 ✅ → L1 ✅ → L2 ✅ → L3 ✅ (gezogen) → L4 ✅ → **`Executed`** (Stand 2026-09-18; Datei bleibt als Nachweis im Planungsordner, nicht archiviert — der Katalog-Regelstand R3/R7 ist darin zurückgeschrieben).

**Rollback:** ein Commit-Punkt je Meilenstein; L1 ist als reine Neuanlage ohne Rückwirkung verwerfbar, L2 betrifft genau drei Dateien (`crash-loop/crash-loop-shared.ts`, beide Hooks).

## 5 — Execution-Log

**2026-09-17:**

- Plan angelegt (LLM-Entscheidung, von Jan delegiert). Faktenprüfung: `crash-loop/` existiert nicht · Anker verifiziert (Solo/MP): Explosion 119/121, `particleCount` 123/125, `createTail` 161/163, `updateAndDrawParticles` 211/199, devicePixelRatio 441/245, Shake 458–459/262–263, `tailGrad` 774 (nur Solo) · Testkonvention `src/**/__tests__/**/*.test.{ts,tsx}` + Umgebung `node` (`jsdom` per Datei-Kopfzeile) und die zwei 22-Zeilen-Bestandstests (Stil/Asset, keine Animationslogik) verifiziert.

**2026-09-18 (Umsetzung, freigegeben von Jan: „Execution fortführen, bis alles abgeschlossen ist"):**

- **L0:** Anker erneut am lebenden Code fixiert. Befund: der Tail-Block unterscheidet sich in **zwei** Punkten, nicht nur in der Nozzle-Konstante (siehe §2 Plan-Korrektur) → Resolver-Design statt reiner Parameterübergabe. Tail-Block des Solo-Hooks ist außerdem **länger** als der MP-Block (Dual-Düsen-Rechnung), also nicht verbatim.
- **Baseline:** `npm test` → 267/268 Dateien, 1941/1942 Tests grün. **Der eine rote Test ist vorbestehend und X3-fremd:** `src/lib/security/__tests__/mutation-origin-inventory.test.ts` (gepinnte Inventarliste 26 vs. tatsächlich 29 schreibende Routen, aus dem Security-Cohort dieser Branch). Er wurde während der Umsetzung von dritter Seite nachgezogen; alle Läufe danach waren vollständig grün.
- **L1:** `particles-physics.ts`, `tail-geometry.ts`, `viewport-shake.ts` angelegt **plus** `canvas-frame.ts` — **Abweichung vom Plan** (dort drei Module): die Auflösungs-Mathematik ist keine Shake-Mathematik; sie in `viewport-shake.ts` zu legen hätte die Modul-Verantwortlichkeit verwässert. Vierter Modulname bewusst sprechend (`canvas-frame`). Vier Testdateien, 37 Tests, `npm test` grün, `npm run typecheck` grün, `npm run lint` ohne Befund in `crash-loop/**`.
- **L2:** `crash-loop-shared.ts` (251 Z.) + `index.ts` (Fassade) angelegt; in beiden Hooks die vier Blöcke entfernt und durch ref-gebundene Hüllen ersetzt; `soundManager`-Import in beiden Hooks entfallen (der Klangaufruf lebt jetzt im geteilten Modul) — das hat `npm run lint` als einzigen neuen Hinweis gemeldet und wurde bereinigt. Ergebnis: 332 Zeilen entfernt, 80 zurück, netto −252; `wc -l` 982→849 und 782→663. `npm test` 272/272 Dateien, `typecheck` und `lint` grün.
- **L3 gezogen** (der Plan hatte sie als bedingt markiert): Da der LLM den Sichtvergleich nicht leisten kann — visuelle Kontrolle liegt bei Jan —, wurden stattdessen 34 Charakterisierungs-Tests mit jsdom und aufzeichnender Canvas-Attrappe geschrieben: Filter/New-Array-Semantik, Schockwellen-Ring, Münz-Fall, Rauch-Aufquellen, Alpha-Rücksetzung, Rückpuffer-Update-Entscheid, Kamera-Ruck-Schwelle und -Abklingen, Sternendrift/Umbruch/Hyperraumstrich, Herkunfts-Unterschied Solo vs. Multiplayer, Partikelgrenze, Klang-Stereopan bei reduzierter Bewegung. `npm test` 273/273 Dateien, **2013/2013 Tests grün**.
- **L4:** `npm run check-file-sizes` → OK (1063 Dateien, keine Datei über 800 Zeilen). Katalog R3/R7 nachgezogen.
- **Offen bei Jan (nicht vom LLM zu ändern):** die beiden **Ordner-`CLAUDE.md`** in `crash/` und `crash-multiplayer/` dokumentieren noch die alten Zeilennummern (`draw` „Z. 611" → heute **492**, `gameLoop` „Z. 761" → **642**, RAF „Z. 781" → **662**, `MOBILE_IDLE_CANVAS_DELAY_MS` „Z. 32" → **39**, genutzt „Z. 771–778" → **652–660**). Editiert werden sie nur nach Jans Freigabe.
- **Offen bei Jan (visuell):** der Sichtvergleich beider Crash-Seiten (Solo + Multiplayer) im laufenden Spiel — im Plan als Verifikation von L2 vorgesehen und die einzige Prüfung, die die Testebene strukturell nicht ersetzen kann.
