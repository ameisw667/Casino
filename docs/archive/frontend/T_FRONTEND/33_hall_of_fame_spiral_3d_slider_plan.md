# 33 — Hall of Fame: 3D-Doppelhelix Spiral Stage (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Erweiterung der Lobby-Bento-Gewinnerwand (`src/components/home/bento/BentoArcadeCells.tsx`) um eine vertikal rotierende 3D-Doppelhelix (`spiral-3d-slider`) zur monumentalen Ehrung der größten All-Time- und Wochen-Gewinne.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| #   | Subkategorie               | Niveau   | Befund & Beleg (Datei / Test)                                                         | Bottleneck? | Action Item                                                                |
| --- | -------------------------- | -------- | ------------------------------------------------------------------------------------- | :---------: | -------------------------------------------------------------------------- |
| 01  | Monumentale Inszenierung   | Top 70 % | Gewinner werden in simplen Tabellenzeilen/Kacheln dargestellt, kein High-Roller-Ruhm. |    🔴 JA    | 3D-Helix-Spirale mit schwebenden VIP-Gewinnkarten im Monte-Carlo-Stil.     |
| 02  | Tiefenschärfe & Z-Rotation | Top 60 % | Kein echtes räumliches Gefühl im Lobby-Grid.                                          |    🔴 JA    | Mathematische Spiralbahn mit dynamischer Skalierung und Opazitäts-Verlauf. |
| 03  | Echtzeit-Gewinndaten       | Top 30 % | Store liefert bereits `bets` und Live-Events zuverlässig.                             |    Nein     | Bestehende Gewinn-Datenquelle nahtlos an die Spiral-Bühne anbinden.        |
| 04  | Mobile-Fallback            | Top 25 % | Auf kleinen Bildschirmen droht Überfrachtung.                                         |    Nein     | Reduzierte 2D-Flugbahn mit reduzierter Partikelanzahl für `isMobile`.      |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                  | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------------------------------ | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/home/bento/BentoArcadeCells.tsx` | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/home/bento/BentoArcadeCells.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/home/bento/BentoArcadeCells.tsx` | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/home/bento/BentoArcadeCells.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/home/bento/BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/11_weakness_spiral_3d_slider.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/11_weakness_spiral_3d_slider.png)
- Componentry-Referenz: [33 — Hall of Fame: 3D-Doppelhelix Spiral Stage (Obsidian & Gold)](https://componentry.dev/docs/components/spiral-3d-slider)

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

- **Ziel:** Erstellung von `src/components/casino/hall-of-fame/Spiral3dSlider.tsx` mit CSS-3D-Transform-Ring.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Einbettung in die Bento-Lobby-Gewinnerzone in `BentoArcadeCells.tsx`.
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
