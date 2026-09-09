# 43 — Spielekatalog Perspektiven-Raster: Scroll Tilted Grid

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Architektonische 3D-Bühne (`scroll-tilted-grid`) für das Haupt-Katalograster auf der Spiele-Übersichtsseite (`src/app/games/page.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie               | Niveau   | Befund & Beleg (Datei / Test)                        | Bottleneck? | Action Item                                                                    |
| --- | -------------------------- | -------- | ---------------------------------------------------- | :---------: | ------------------------------------------------------------------------------ |
| 01  | Räumliche Tiefe im Katalog | Top 70 % | Flaches 2D-Raster ohne Tiefenstaffelung.             |    🔴 JA    | Leichte Neigung des Rasters um die X-Achse mit perspektivischer Fluchtlinie.   |
| 02  | Scroll-Dampening           | Top 65 % | Gitter scrollt abrupt ohne Parallax-Versatz.         |    🔴 JA    | Gestaffelte Zeilenverschiebung mit Spring-Physik beim Scrollen.                |
| 03  | Rendering-Effizienz        | Top 35 % | Viele Game-Cards gleichzeitig gerendert.             |    🔴 JA    | `will-change: transform` und CSS-Perspective (1000px) strikt GPU-beschleunigt. |
| 04  | Klickbarkeit der Karten    | Top 20 % | Links dürfen durch CSS-Tilt nicht unklickbar werden. |    Nein     | Z-Index und Hitboxen strikt plan halten.                                       |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                         | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/app/games/page.tsx`                                | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/games/ScrollTiltedGamesGrid.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/app/games/page.tsx`                                | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/games/ScrollTiltedGamesGrid.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                       | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)
- Ziel-Komponente: [`src/components/casino/games/ScrollTiltedGamesGrid.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/ScrollTiltedGamesGrid.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/21_weakness_scroll_tilted_grid.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/21_weakness_scroll_tilted_grid.png)
- Componentry-Referenz: [43 — Spielekatalog Perspektiven-Raster: Scroll Tilted Grid](https://componentry.dev/docs/components/scroll-tilted-grid)

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

- **Ziel:** Erstellung von `src/components/casino/games/ScrollTiltedGamesGrid.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/app/games/page.tsx`.
- **Schritte:**
  1. Nahtlose Einbettung in die Host-Datei unter Beibehaltung aller Callbacks und Data-Streams.
  2. Prüfung von Active-States, Responsive Breakpoints und Viewport-Skalierung.
- **Abbruchkriterium:** Layout-Shift oder funktionale Regressionen bestehender Features.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — Keine neuen ESLint-Warnungen/Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Visuelle Prüfung via Playwright Screenshot.
