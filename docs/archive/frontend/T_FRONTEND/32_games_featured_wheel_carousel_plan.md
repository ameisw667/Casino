# 32 — Spieleauswahl: Interaktive 3D-Zylinderwalze Wheel Carousel (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Integration eines 3D-Zylinder-Karussells (`wheel-carousel`) auf der Spielekatalog-Seite (`src/app/games/page.tsx`) zur spielerischen Haptik-Auswahl der Featured Originals (Crash, Dice, Slots, Roulette, Blackjack).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| #   | Subkategorie             | Niveau   | Befund & Beleg (Datei / Test)                                       | Bottleneck? | Action Item                                                                            |
| --- | ------------------------ | -------- | ------------------------------------------------------------------- | :---------: | -------------------------------------------------------------------------------------- |
| 01  | Spielauswahl-Erlebnis    | Top 65 % | Statische Buttons & einfaches 2D-Karten-Raster ohne Casino-Feeling. |    🔴 JA    | 3D-Zylinderwalze für Top-Featured Games mit Drall- und Trägheitsphysik einbauen.       |
| 02  | Taktile Casino-Mechanik  | Top 75 % | Fehlendes haptisches Feedback beim Durchstöbern von Spielen.        |    🔴 JA    | Drag- und Scroll-Physik mit akustischem Klick-Tick (`soundManager.playClick`) koppeln. |
| 03  | Perspektivische 3D-Tiefe | Top 55 % | Flache CSS-Ebenen ohne räumliche Staffelung.                        |    🔴 JA    | CSS 3D `perspective(1000px) rotateX()` mit dynamic Blur auf inaktiven Karten.          |
| 04  | Quick-Launch & Tastatur  | Top 25 % | Tastatur-Hotkeys (1–5) bereits vorhanden und funktionstüchtig.      |    Nein     | Hotkeys mit der visuellen Walzen-Position synchronisieren.                             |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)          | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------ | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/app/games/page.tsx` | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/app/games/page.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/app/games/page.tsx` | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/app/games/page.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite        | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/10_weakness_wheel_carousel.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/10_weakness_wheel_carousel.png)
- Componentry-Referenz: [32 — Spieleauswahl: Interaktive 3D-Zylinderwalze Wheel Carousel (Obsidian & Gold)](https://componentry.dev/docs/components/wheel-carousel)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Obsidian (`#0B0E14`), Gold (`#D4AF37`), feiner Rand (`rgba(212, 175, 55, 0.2)`), Glass-Blur (`backdrop-filter: blur(20px)`).
- **Zero-Wallet-Autorität:** Keine State-Mutationen von Finanzwerten; reine UI-/Motion-Schicht.
- **Fail-Closed & Stabilität:** Keine Runtime-Crashes bei WebGL-/Canvas-Ausfall; elegante Fallbacks.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an Backend-Routen oder Auth-Flows.
- Keine Mutationen von Bet-Logik oder Supabase-RPCs.
- Keine Zerstörung von bestehenden barrierefreien Attributen (`aria-*`).

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Kernkomponente

- **Ziel:** Implementierung von `src/components/casino/games-catalog/WheelCarousel.tsx` mit 3D-Transform-Mathematik.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Einbindung als Showcase-Header oberhalb des Filter-Rasters in `src/app/games/page.tsx`.
- **Schritte:**
  1. Nahtlose Einbettung in die Host-Datei unter Beibehaltung aller Callbacks.
  2. Prüfung von Active-States und Viewport-Skalierung.
- **Abbruchkriterium:** Layout-Shift oder funktionale Regressionen bestehender Features.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — Keine neuen ESLint-Warnungen/Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Visuelle Prüfung via Playwright Screenshot.
