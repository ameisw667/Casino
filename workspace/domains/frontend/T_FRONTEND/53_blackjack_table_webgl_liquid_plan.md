# 53 — Blackjack Kartentisch Ambient-Backdrop: WebGL Liquid Fluid

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Flüssiger Smaragd- und Goldstaub-Shader (`webgl-liquid`) für den Blackjack-Spieltisch (`src/app/games/blackjack/page.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie         | Niveau   | Befund & Beleg (Datei / Test)                                   | Bottleneck? | Action Item                                                                     |
| --- | -------------------- | -------- | --------------------------------------------------------------- | :---------: | ------------------------------------------------------------------------------- |
| 01  | Salon-Atmosphäre     | Top 75 % | Flacher grüner Filz-Hintergrund wirkt wie 90er-Jahre Shareware. |    🔴 JA    | Subtile Fluid-Dynamik im Filz mit Goldpartikeln, die auf Kartenspiel reagieren. |
| 02  | GPU-Budget & FPS     | Top 60 % | Blackjack hat viele Karten-Animationen.                         |    🔴 JA    | Maximal 30 Shader-Updates/Sekunde im Hintergrund, GPU-Load unter 5 %.           |
| 03  | Karten-Kontrast      | Top 25 % | Kartenwerte müssen absolut klar erkennbar bleiben.              |    Nein     | Shader liegt hinter dem Filz-Overlay mit 80 % Deckkraft-Dämpfung.               |
| 04  | Fail-Closed Fallback | Top 15 % | WebGL-Crash darf Spielrunde niemals stören.                     |    Nein     | Automatischer Fallback auf CSS-Radial-Gradient bei Canvas-Fehler.               |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                                     | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/app/games/blackjack/page.tsx`                                  | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/games/blackjack/BlackjackLiquidBackdrop.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/app/games/blackjack/page.tsx`                                  | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/games/blackjack/BlackjackLiquidBackdrop.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                                   | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/app/games/blackjack/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/page.tsx)
- Ziel-Komponente: [`src/components/casino/games/blackjack/BlackjackLiquidBackdrop.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/blackjack/BlackjackLiquidBackdrop.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/31_weakness_blackjack_ambient.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/31_weakness_blackjack_ambient.png)
- Componentry-Referenz: [53 — Blackjack Kartentisch Ambient-Backdrop: WebGL Liquid Fluid](https://componentry.dev/docs/components/webgl-liquid)

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

- **Ziel:** Erstellung von `src/components/casino/games/blackjack/BlackjackLiquidBackdrop.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/app/games/blackjack/page.tsx`.
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
