# 24 — Jackpot & Highroller Ticker: Monolithisches Odometer (Obsidian & Gold)

> **Status:** Execution-Ready · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Neugestaltung des Jackpottickers in `src/components/home/bento/BentoJackpotCells.tsx` und `src/components/casino/typography/KineticNumberRoller.tsx` nach dem Design-Muster **Option A: Monolithisches Odometer ⭐** — ein fugenloses, einheitlich gefasstes Luxus-Zahlenfenster (Obsidian-Bevel mit 24k-Goldfacetten, oberer/unterer Tiefen-Vignette und synchronem Ziffern-Rollwerk), das die bisherigen unruhigen Einzel-Pillen ablöst.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 58 %)

| #   | Subkategorie                          | Niveau   | Befund & Beleg (Datei / Test)                                                                                                                                       | Bottleneck? | Action Item                                                                                                                      |
| --- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: | -------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Monolithische Kammer vs. Einzelpillen | Top 55 % | Jede Ziffer sitzt aktuell in einer separaten dunklen Pille (`KineticNumberRoller.tsx:76`), während `,`, `.` und `$` freistehen; erzeugt ein unruhiges Kapselmuster. |    🔴 JA    | Ersetzung der Einzelkapseln durch ein einheitliches, fugenloses Odometer-Gehäuse mit Innen-Schatten.                             |
| 02  | Typografische Baseline & Rhythmus     | Top 60 % | Trennzeichen (Komma, Punkt) schweben asymmetrisch zwischen den Kapseln (`KineticNumberRoller.tsx:49`).                                                              |    🔴 JA    | Feste typografische Monospace-Baseline (`tabular-nums`) für alle Glyphen innerhalb desselben Odometer-Schlitzes.                 |
| 03  | Mechanische Odometer-Tiefenblende     | Top 65 % | Bisheriger Schlitz hat keine physische Odometer-Tiefenmaske oben/unten.                                                                                             |    🔴 JA    | Horizontale Odometer-Vignette (`linear-gradient`) oben und unten für authentische Walzen-Tiefe.                                  |
| 04  | Ziffern-Rollwerk & Federtakt          | Top 75 % | Ziffern rollen bereits mit Federphysik (`bounce: 0.25`), aber ohne Odometer-Walzen-Synchronizität.                                                                  |    🔴 JA    | Feinabstimmung der Roll-Dämpfung (`stiffness: 380, damping: 28`) und sanfter vertikaler Schlitz-Maskierung (`overflow: hidden`). |
| 05  | 24k Gold-Glanz & Reflex-Folie         | Top 70 % | Wandernder Shimmer ist vorhanden (`KineticNumberRoller.tsx:179`), wirkt aber isoliert.                                                                              |    Nein     | Gold-Sheen auf das gesamte monolithische Gehäuse abstimmen.                                                                      |
| 06  | Hook-Anbindung & Live-Feed            | Top 15 % | `useProgressiveJackpot` läuft stabil, liefert `formatted` und `numericAmount`.                                                                                      |    Nein     | Hook-Schnittstelle strikt unangetastet weiterverwenden.                                                                          |
| 07  | Zero-Wallet-Autorität                 | Top 05 % | Reines Präsentations-Element; keine Mutation von Spieler-Salden.                                                                                                    |    Nein     | Invariante garantiert gewahrt.                                                                                                   |
| 08  | Parallax- & Ambient-Glow              | Top 20 % | Scroll-Kopplung in `BentoJackpotCells.tsx` via `scrollYProgress` läuft performant.                                                                                  |    Nein     | Ambient-Parallax beibehalten.                                                                                                    |
| 09  | Mobile Responsiveness & Skalierung    | Top 65 % | Breites Zahlenfeld benötigt auf kleinen Bildschirmen sauberes Clamping.                                                                                             |    Nein     | `clamp()`-Typografie in `BentoJackpotCells.tsx` beibehalten.                                                                     |
| 10  | 60+ FPS & Compositor-Health           | Top 25 % | CSS-Transforms (`translateY`) und GPU-optimiertes Clipping.                                                                                                         |    Nein     | Reine Compositor-Eigenschaften nutzen.                                                                                           |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                  | Scope (Dateien)                                            | Status     | Zuständigkeit | Verifikation                                               |
| ------ | -------------------------------------------- | ---------------------------------------------------------- | ---------- | :-----------: | ---------------------------------------------------------- |
| **L0** | Baseline & Diagnose                          | `src/components/casino/typography/KineticNumberRoller.tsx` | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                                |
| **L1** | Monolithisches Odometer Gehäuse & Slot-Drum  | `src/components/casino/typography/KineticNumberRoller.tsx` | 🔴 Geplant |      LLM      | Einheitliche Odometer-Kammer ohne Einzelpillen             |
| **L2** | Integration in BentoJackpotCells             | `src/components/home/bento/BentoJackpotCells.tsx`          | 🔴 Geplant |      LLM      | Flüssige Ziffern-Animation bei Jackpot-Updates             |
| **L3** | Visuelle Kalibrierung & Screenshot-Erfassung | `docs/frontend/screenshots/`                               | 🔴 Geplant |      LLM      | Nachher-Screenshot `02_success_jackpot_ticker.png` erfasst |
| **L4** | Verifikation & 5-Stufen-DoD                  | Lokale Test-Suite                                          | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün                 |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/typography/KineticNumberRoller.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/typography/KineticNumberRoller.tsx)
- Host-Datei: [`src/components/home/bento/BentoJackpotCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoJackpotCells.tsx)
- Hook: [`src/hooks/useProgressiveJackpot.ts`](file:///v:/VibeCoding/Casino/src/hooks/useProgressiveJackpot.ts)
- Screenshots: [`docs/frontend/screenshots/02_weakness_jackpot_ticker.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_weakness_jackpot_ticker.png), [`docs/frontend/screenshots/02_success_jackpot_ticker.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_success_jackpot_ticker.png)
- Componentry-Referenz: [Kinetic Text Reveal (`kinetic-text-reveal`)](https://componentry.dev/docs/components/kinetic-text-reveal) & [Odometer / Slot-Drum Mechanik](https://componentry.dev/docs/components/rolling-counter)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Reine Tabular-Monospace-Ziffern (`tabular-nums`), Obsidian-Hintergründe mit 24k Gold-Gradienten (`#D4AF37`), kein Split-Flap.
- **Fail-Closed & Re-Render Schutz:** Ticker-Animation darf nicht bei jedem Millisekunden-Tick die gesamte Bento-Zelle neu mounten.
- **Zuständigkeit:** 100 % LLM-Zuständigkeit ohne manuelle Zwischenschritte.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderung an der Jackpot-Berechnung oder an `useProgressiveJackpot.ts`.
- Keine Änderung an den Plattform-Stats (Gesamt ausgezahlt, Auszahlungsdauer etc.).
- Kein Einsatz des vom Nutzer abgelehnten Split-Flap Displays.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Monolithisches Odometer Gehäuse & Slot-Drum

- **Ziel:** Umbau von `KineticNumberRoller.tsx` in ein fugenloses, monolithisches Haute-Horlogerie-Odometer.
- **Schritte:**
  1. Entfernung der individuellen Pillen-Ränder und Kapsel-Hintergründe um jede Ziffer.
  2. Konstruktion eines einheitlichen Odometer-Fensters:
     - Dunkles Obsidian-Chassis (`linear-gradient(180deg, #161C26 0%, #0D1118 45%, #07090E 100%)`)
     - Fein geätzte Gold-Lünette (`1px solid rgba(212, 175, 55, 0.45)`) mit sanftem Außenglow und Innen-Relief.
     - Obere und untere Walzen-Tiefen-Vignette (`background: linear-gradient(180deg, rgba(7,9,14,0.92) 0%, transparent 26%, transparent 74%, rgba(7,9,14,0.92) 100%)`).
     - Subtiler oberer Glas-Reflex (`linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)`).
  3. Ziffern (`0-9`) und Symbole (`$`, `,`, `.`) stehen auf einer gemeinsamen, harmonischen Baseline im selben Chassis.
  4. Wechselnde Ziffern rollen geschmeidig in ihrem jeweiligen Walzenslot via Spring-Motion (`stiffness: 380, damping: 28`).

### Meilenstein L2: Einbettung & Abstimmung in `BentoJackpotCells.tsx`

- **Ziel:** Harmonische Integration des monolithischen Odometers in das Bento-Lobby-Raster.
- **Schritte:**
  1. Prüfung der vertikalen und horizontalen Zentrierung im Bento-Container.
  2. Kalibrierung des Ambient-Glows, sodass das Odometer erhaben im Raum schwebt.
  3. Verifikation auf Desktop (1440px) und Mobile (390px).

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Erfassung und visuelle Verifikation des neuen monolithischen Odometers.
