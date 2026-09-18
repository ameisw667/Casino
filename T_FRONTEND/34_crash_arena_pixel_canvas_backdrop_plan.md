# 34 — Crash Arena: Reaktives Pixel Canvas Backdrop (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Ersetzung des statischen Weltraum-Hintergrunds in `src/app/games/crash/page.tsx` durch ein interaktives, reaktives Partikel-Pixel-Gitter (`pixel-canvas`), dessen Dichte und Goldleuchten mit dem Crash-Multiplikator eskalieren.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 45 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Atmosphärische Intensität | Top 65 % | Statischer Sternenstaub-Canvas reagiert nicht dynamisch auf die Flugphase der Rakete. | 🔴 JA | Interaktiver Pixel-Canvas: Bei steigendem Multiplikator beschleunigen die Pixel in Flugrichtung. |
| 02 | Cursor-Interaktivität | Top 70 % | Nutzer kann nicht mit der Flugbahn oder dem Hintergrund interagieren. | 🔴 JA | Klicks oder Cursorbewegungen erzeugen Stoßwellen im Pixel-Gitter. |
| 03 | Rendering-Effizienz | Top 40 % | Crash Game Loop darf keinesfalls Frame-Drops unter 60 FPS erleiden. | Nein | Leichtgewichtiger 2D-Canvas-Shader mit festem Pixel-Raster und Dirty-Rect-Updates. |
| 04 | Game-State-Kopplung | Top 20 % | Multiplikator-Zustand (`multiplier`, `status`) ist im Hook sauber getrennt. | Nein | Pixel-Farbe morpht von dezentem Obsidian (`1.0x`) zu gleißendem Gold (`>10x`) und Rot bei Crash. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/app/games/crash/page.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/app/games/crash/page.tsx` | 🔴 Geplant | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/app/games/crash/page.tsx` | 🔴 Geplant | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/app/games/crash/page.tsx` | 🔴 Geplant | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei: [`src/app/games/crash/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/crash/page.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/12_weakness_crash_backdrop.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/12_weakness_crash_backdrop.png)
- Componentry-Referenz: [34 — Crash Arena: Reaktives Pixel Canvas Backdrop (Obsidian & Gold)](https://componentry.dev/docs/components/pixel-canvas)

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
- **Ziel:** Entwicklung von `src/components/casino/games/crash/CrashPixelCanvas.tsx`.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Integration in `src/app/games/crash/page.tsx` als Backdrop-Layer hinter dem Raketen-Canvas.
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
