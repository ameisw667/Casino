# 30 — Desktop Header: Magnetic Quick-Nav Dock (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Integration eines dezenten, horizontal schwebenden Magnetic Docks (`magnetic-dock`) im Desktop-Header (`src/components/layout/MainHeader.tsx`) für VIP-Quick-Links (Spiele, Rang, Vault, Chat) mit sanfter Proximity-Vergrößerung und Obsidian-Gold-Ästhetik.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie                   | Niveau   | Befund & Beleg (Datei / Test)                                                     | Bottleneck? | Action Item                                                                    |
| --- | ------------------------------ | -------- | --------------------------------------------------------------------------------- | :---------: | ------------------------------------------------------------------------------ |
| 01  | Header-Layout & Flexibilität   | Top 50 % | Statische Buttons & Icons ohne organische Proximity-Bewegung bei Mausnähe.        |    🔴 JA    | Kompakte Dock-Pill-Leiste im Header mit Framer Motion Spring-Physik einbetten. |
| 02  | Mausinteraktion & Haptik       | Top 70 % | Standard-CSS Hover-Farbwechsel ohne physikalische Trägheit.                       |    🔴 JA    | Maus-Tracking mit `useMotionValue` und Proximity-Skalierung (1.0x bis 1.25x).  |
| 03  | Designsystem & Kontrast        | Top 35 % | Glassmorphism vorhanden, aber keine feine Gold-Akzentuierung der Schnellzugriffe. |    🔴 JA    | Obsidian `#0B0E14` mit feinem 1px Champagne-Gold-Rahmen und 16px Blur.         |
| 04  | Responsivität & Desktop-Schutz | Top 20 % | Header unterscheidet bereits sauber `isMobile` vs. Desktop.                       |    Nein     | Magnetic Dock strikt auf `!isMobile` beschränken, MobileNav bleibt unberührt.  |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                        | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | -------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/layout/MainHeader.tsx` | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/layout/MainHeader.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/layout/MainHeader.tsx` | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/layout/MainHeader.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                      | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/layout/MainHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainHeader.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/08_weakness_desktop_header.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/08_weakness_desktop_header.png)
- Componentry-Referenz: [30 — Desktop Header: Magnetic Quick-Nav Dock (Obsidian & Gold)](https://componentry.dev/docs/components/magnetic-dock)

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

- **Ziel:** Erstellung von `src/components/casino/navigation/DesktopHeaderDock.tsx` mit Proximity-Hover für Desktop-Shortcuts.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Einbindung in `MainHeader.tsx` zwischen Logo/Brand-Zone und Wallet-Chipsatz.
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
