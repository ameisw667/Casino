# 07 — Homepage Hero: Spatial Universe Visuals & Stargate Wheel Rotation (Phase 5)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Weiterentwicklung der Homepage-Hero-Bühne (`/`) — Restlose Entfernung der 2. Sektion (Live Progressive Vault Storyline), Re-Aktivierung der spektakulären Stargate-Rad-Drehung um die eigene Achse mit Vergrößerung beim Scrollen, und Hinzufügen von 3–4 schwebenden 3D-Visuals (Magier, Jet, Würfel, Roulette/Lucky-7) über das gesamte Hero-Banner (inkl. über der H1).
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Visual-, Layout- & Animation-Layer.

---

## 1 — Status-Quo & Jan-Feedback

### Feedback-Punkte von Jan:

1. **Fortschritt & Bestätigung:**
   - Der schwebende 3D-Würfel oben rechts kam extrem gut an.
   - Statt alles nach rechts oben zu drängen, sollen nun über die gesamte Hero-Bühne verteilt (auch links über der H1, mittig-oben, rechts) 3–4 weitere schwebende 3D-Elemente integriert werden (z. B. Royale Guide Magier, Crash Jet, Roulette/Lucky-7, Würfel) in verschiedenen Größen.
2. **Kritik & Korrekturbedarf:**
   - **Zweite Sektion (Live Progressive Vault Jackpot) restlos entfernen:** Der Textblock mit Zähler und Telemetrie wird nicht gewünscht und soll komplett gelöscht werden.
   - **Stargate Rad-Drehung wiederbeleben:** Das rechte Element soll sich beim Scrollen wieder spürbar wie ein Rad um die eigene Achse drehen und nach vorne vergrößern (Scale & Z-Rotation), anstelle des 180°-Flips.

---

## 2 — Meilenstein-Übersicht mit LLM-Zuständigkeiten

| Nummer | Meilenstein                              | Scope (Dateien)                                              | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                                    |
| :----- | :--------------------------------------- | :----------------------------------------------------------- | :---------- | :--------: | :------------ | :------------------------------------------------------------------------------ |
| **L0** | **Assets & Layout-Vorbereitung**         | `public/images/`, `src/components/home/hero-scrolly/`        | Sequenziell | 🔴 Geplant | LLM           | 4 transparente 3D-Assets geprüft / bereitgestellt                               |
| **L1** | **Entfernung Live Vault Storyline**      | `HeroJackpotStoryline.tsx`, `HeroScrollyStage.tsx`           | Sequenziell | 🔴 Geplant | LLM           | Komponente gelöscht/entkoppelt, 0 Dead-Refs                                     |
| **L2** | **Floating 3D-Cosmos Satelliten**        | `HeroFloatingCosmos.tsx`, `HeroScrollyStage.tsx`             | Sequenziell | 🔴 Geplant | LLM           | 3–4 schwebende Elemente (Magier, Jet, Würfel, 7) über H1 & Banner verteilt      |
| **L3** | **Stargate Rad-Drehung & GSAP-Scrub**    | `HeroScrollyDesktopPortalVisual.tsx`, `HeroScrollyStage.tsx` | Sequenziell | 🔴 Geplant | LLM           | Spürbare Rad-Z-Rotation (360°–540°) + Vergrößerung (1.9x) synchron zum Scrollen |
| **L4** | **5-Stufen-DoD & 11-Stufen-Screenshots** | `scripts/capture-10pct-steps.mjs`, `walkthrough.md`          | Sequenziell | 🔴 Geplant | LLM           | Typecheck, Vitest, Lint, Build & 11 saubere Frames                              |

---

## 3 — Technische Spezifikation

### 3.1 Restlose Bereinigung der 2. Sektion

- Entfernung des Imports und der Renderung von `HeroJackpotStoryline` in `HeroScrollyStage.tsx`.
- Bereinigung der GSAP-Timeline: Löschung von `jackpotColRef` und `counterRef` Animation-Steps.

### 3.2 3D-Floating Cosmos (`HeroFloatingCosmos.tsx`)

Verteilt 4 schwebende Satelliten-Visuals im Raum:

1. **Satellit 1 (Links oben, über der H1):** Royale Guide Magier (`royale-guide-mascot.png`) mit goldenem Sternenstab (Größe: ~90px), schwebend mit sanftem Floating & Z-Depth.
2. **Satellit 2 (Mittig oben):** Crash Quantum Jet (`2026-09-05_crash-jet-quantum-gold_v001.png`, Größe: ~110px), dynamisch im Raum angestellt.
3. **Satellit 3 (Rechts oben):** Quantum Gold Würfel (`2026-09-02_icon-dice-quantum-gold_transparent.png`, Größe: ~85px), rotiert sanft.
4. **Satellit 4 (Rechts schwebend / Flanke):** Lucky Seven 3D (`2026-09-05_ach-dice-seven-3d_v001.png`, Größe: ~95px) oder schwebender Gold-Chip.

Alle Elemente erhalten:

- Federgelagertes Parallax-Mouse-Tilt (`useSpring`).
- Unabhängige GSAP-Scroll-Trajektorien (unterschiedliche x, y, z Drifts für echte Dreidimensionalität).

### 3.3 Re-Aktivierung der Stargate-Rad-Drehung

- Das Stargate-Siegel (`sealRef`) erhält via GSAP eine Z-Achsen-Rotation gekoppelt an den Scrollweg:
  `rotation: "+=360"` (oder `+=540`) und `scale: 1.85`.
- Die Ace-Karte fliegt im Zentrum plastisch nach vorne (`scale: 1.4`, `z: 120`).
- Kein verzerrender 180° Y-Flip, sondern echtes rotierendes Tresor-/Glücksrad.
