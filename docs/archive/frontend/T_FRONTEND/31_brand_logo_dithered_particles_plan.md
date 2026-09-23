# 31 — Casino Royale Marken-Wappen: Dithered Particle Logo (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des Casino Royale Marken-Wappens (`brand-ace-icon.png`) in `src/components/layout/MainSidebar.tsx` durch einen interaktiven Dither-Partikel-Canvas (`dithered-logo`), der bei Hover in feine Goldpartikel zerstäubt und sich physikalisch neu formiert.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| #   | Subkategorie              | Niveau   | Befund & Beleg (Datei / Test)                                                                                 | Bottleneck? | Action Item                                                                             |
| --- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- | :---------: | --------------------------------------------------------------------------------------- |
| 01  | Marken-Identität & Emblem | Top 60 % | Statisches PNG-Bild mit simpler CSS-Kippung (`brand-logo-tilt`), wirkt nicht wie ein lebendiges Luxus-Siegel. |    🔴 JA    | Dithered-Logo Canvas integrieren, das Alpha-Pixel analysiert und als Goldstaub rendert. |
| 02  | GPU- & Canvas-Performance | Top 65 % | Reine Web-Animationen müssen dauerhaft 60 FPS garantieren.                                                    |    🔴 JA    | HTML5 2D Canvas mit Offscreen-Rendering und rAF-Loop; stoppt bei Ruhezustand.           |
| 03  | Interaktivität & Haptik   | Top 70 % | Kein interaktives Feedback bei Berührung oder Cursor-Hover.                                                   |    🔴 JA    | Partikel weichen dem Mauszeiger radial aus und federn mit elastischer Trägheit zurück.  |
| 04  | Sidebar-Layout-Integrität | Top 20 % | Sidebar-Routing zu `/` und Mobile-Drawer-Schließen müssen erhalten bleiben.                                   |    Nein     | Next.js `Link`-Wrapping und Größendimensionierung (40x40px) strikt wahren.              |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                         | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | --------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/layout/MainSidebar.tsx` | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/layout/MainSidebar.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/layout/MainSidebar.tsx` | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/layout/MainSidebar.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                       | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/layout/MainSidebar.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainSidebar.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/09_weakness_brand_logo.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/09_weakness_brand_logo.png)
- Componentry-Referenz: [31 — Casino Royale Marken-Wappen: Dithered Particle Logo (Obsidian & Gold)](https://componentry.dev/docs/components/dithered-logo)

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

- **Ziel:** Entwicklung von `src/components/ui/DitheredLogo.tsx` auf Basis des PNG-Artworks mit Web-Crypto/Canvas-Raster.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Austausch des statischen `<Image>` in `MainSidebar.tsx` durch das interaktive `DitheredLogo`.
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
