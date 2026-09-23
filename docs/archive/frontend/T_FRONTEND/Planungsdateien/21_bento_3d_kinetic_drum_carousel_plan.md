# 21 — Bento-Lobby: 3D-Kinetik & Zylinder-Karussell (Live-Jackpot & VIP-Podium)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-13 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `src/components/home/bento/BentoJackpotCells.tsx` (Live-Jackpot & Platform-Stats 3D Vault Kinetic Drum) und `src/components/home/bento/BentoStripCells.tsx` (TournamentPodiumStrip 3D Cylindrical Podium Carousel) sowie zugehörige Subkomponenten im selben Bento-Ordner. Keine Änderungen an Hero, Header, Sidebar, Game-Engines oder Wallet-RNG.
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Visual- & Kinetic-Motion-Layer im Frontend.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                  | Scope (Dateien)                                        | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                                                                 |
| :----- | :----------------------------------------------------------- | :----------------------------------------------------- | :---------- | :--------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------- |
| **L0** | **Baseline & Vorbereitung**                                  | `BentoJackpotCells.tsx`, `BentoStripCells.tsx`         | Sequenziell | 🟢 Abgeschlossen |      LLM      | Baseline Typecheck grün, Scope-Grenzen isoliert                                                                              |
| **L1** | **3D Vault Kinetic Drum (Live-Jackpot & Stats)**             | `VaultKineticDrum.tsx`, `BentoJackpotCells.tsx`        | Sequenziell | 🟢 Abgeschlossen |      LLM      | Echte 3D-Zylindertrommeln mit `preserve-3d`, Glanzkanten, Wheel/Drag-Kinetik & Spring-Physik (`damping: 24, stiffness: 350`) |
| **L2** | **Zylindrisches 3D-Karussell (VIP-Rankings & Daily Podium)** | `CylindricalPodiumCarousel.tsx`, `BentoStripCells.tsx` | Sequenziell | 🟢 Abgeschlossen |      LLM      | Vertikales 3D-Zylinder-Karussell mit Depth-of-Field (Blur 4–8px), 24k-Gold-Korona, Auto-Rotation & Snap-Gesten               |
| **L3** | **Responsive Stabilität & Layout-Audit**                     | `BentoJackpotCells.tsx`, `BentoStripCells.tsx`         | Sequenziell | 🟢 Abgeschlossen |      LLM      | `node scripts/fast-responsive-audit.mjs` 0 Overflow-Bugs auf 320px–1280px                                                    |
| **L4** | **5-Stufen-DoD Verifikation**                                | `npm run typecheck`, `npm run build`                   | Sequenziell | 🟢 Abgeschlossen |      LLM      | 0 Fehler im Typecheck und Production-Build                                                                                   |
| **L5** | **Visuelle Abnahme (Screenshots)**                           | Playwright Headless Screenshot-Pipeline                | Sequenziell | 🟢 Abgeschlossen |      LLM      | Desktop & Mobile Screenshots beider Komponenten im Walkthrough                                                               |

---

## 2 — Detaillierte Architektur & Spezifikation

### A. 3D Vault Kinetic Drum (Live-Jackpot & Platform-Stats)

- **Zylinder-Geometrie:** Jede Ziffer (0–9) ist als 10-teiliges regelmäßiges Prisma modelliert (`rotateX(k * 36deg) translateZ(radius)`).
- **Bezel & Chassis:** Hochwertiges gebürstetes Obsidian-Chassis (`#0B0E14` / `#161D27`) mit oberem und unterem Glanzkanten-Sheen (`linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)`) und Vignettierung, sodass Ziffern plastisch aus der Dunkelheit herausrollen.
- **Interaktive Kinetik:** Gestensteuerung per Touch-Drag, Mausrad und Scroll-Kopplung mit haptischem Spring-Nachfedern (`stiffness: 350, damping: 24`).
- **Typografie & Zahlen:** Striktes Monospace und `tabular-nums` mit 24k Gold Gradient (`#FFFFFF` -> `#F5E08C` -> `#D4AF37`).
- **Platform-Stats:** Ausweitung der Trommel-Optik auf die Plattform-Kennzahlen mit 3D-Zylinder-Stationen und haptischem Feedback.

### B. Zylindrisches 3D-Karussell (VIP-Podium & Daily Race)

- **3D-Bühne & Dampened Radial-Bogen (`rotateY`):** Trophäen, Podest-Karten und Avatare der Top-Gewinner sind auf einer geschwungenen 3D-Bühne angeordnet.
  - **Dampened Y-Rotation:** Flanken-Karten werden nicht um 72° (Kanten-Effekt), sondern sanft um maximal ~22° geneigt. Avatare, Spielernamen und Preisgelder bleiben zu 90% sichtbar und voll lesbar.
  - **Stepped Showcase Auto-Advance:** 5 Sekunden Verweildauer pro VIP mit weicher Federungs-Gleitbewegung (`stiffness: 280, damping: 28`) zum nächsten Rang.
  - **Hintergrund-Karten:** Karten außerhalb des 3er-Blickfelds faden nahtlos aus (`opacity: 0`), sodass kein Ghosting entsteht.
- **Headroom & Zero-Clipping:** Großzügiger oberer Freiraum (`paddingTop: 20px`, Stage-Dimensionierung), damit Krone (#1) und Rang-Badges niemals an der Oberkante beschnitten werden.
- **Dezente Luxus-Steuerung:** Ultrasubtile Geister-Pfeile ohne dominante Kreis-Rahmen und minimalistische 4px-Paginierung mit sanftem Gold-Highlight. Keine Überlappung mit den Kartenrahmen.
- **Vollständige Preisgeldverteilung:** Ränge 1–5 erhalten korrekte Beträge ($5.000, $2.500, $1.500, $600, $400) passend zum $10.000 Daily Race Pool (keine $0 Anzeige mehr).
- **Interaktion:**
  - Klick auf Flanken-Karte rotiert diese direkt in den Hauptfokus.
  - Horizontales Wischen / Draggen dreht das Karussell flüssig mit Spring-Snap.
  - Pausiert sofort bei Mouse-Hover oder Touch.
