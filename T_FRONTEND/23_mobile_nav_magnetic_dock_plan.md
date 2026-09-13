# 23 — Mobile Navigation: Magnetic Dock Revamp (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-09 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Ersetzung der starren 5-Icon-Leiste in `src/components/layout/MobileNav.tsx` durch ein freischwebendes, haptisches Magnetic Dock (`magnetic-dock`) mit Proximity-Magnification, Spring-Physik, Safe-Area-Inset-Support und Obsidian & Gold Ästhetik.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 65 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Viewport-Ökonomie | Top 70 % | Starre 72px + Safe Area Leiste blockiert dauerhaft den unteren Bildschirm (`src/components/layout/MobileNav.tsx:31`). | 🔴 JA | Schwebendes Dock mit Transparenz & kompaktem Footprint. |
| 02 | Haptik & Motion | Top 80 % | Reine CSS-Farbübergänge `transition: color 0.2s`, keine Proximity-Skalierung (`MobileNav.tsx:55`). | 🔴 JA | Framer Motion Spring-Physik mit Proximity-Magnification (`useTransform`, `useMotionValue`). |
| 03 | Design-System | Top 55 % | Standard Tailwind Glassmorphism ohne exklusive Obsidian-Lichtreflexe. | 🔴 JA | Obsidian & Gold Trim (`#0B0E14` / `#D4AF37`) mit 20px Blur. |
| 04 | Touch- & Ergonomie | Top 60 % | Feste 5 Buttons gleichverteilt ohne zentrierte Daumen-Zone. | Nein | Ergonomische Daumen-Clusterung beibehalten. |
| 05 | Safe-Area-Handling | Top 25 % | `env(safe-area-inset-bottom)` bereits vorhanden, aber starr verdrahtet. | Nein | Saubere Inset-Abstände im schwebenden Zustand erhalten. |
| 06 | Zustand & Routing | Top 15 % | `useCasinoStore` für Chat-Drawer & `usePathname` laufen fehlerfrei. | Nein | Bestehende Store- & Route-Anbindung 1:1 übernehmen. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/layout/MobileNav.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Dock-Kernkomponente mit Proximity | `src/components/casino/navigation/MagneticDock.tsx` | 🔴 Geplant | LLM | Isolierter Komponententest mit Spring-Motion |
| **L2** | Integration in `MobileNav.tsx` | `src/components/layout/MobileNav.tsx` | 🔴 Geplant | LLM | Navigation, Chat-Toggle & Active-States intakt |
| **L3** | Touch- & Mobile-Kalibrierung | `src/components/layout/MobileNav.tsx` | 🔴 Geplant | LLM | Touchmove-Event-Handling & Safe-Area-Prüfung |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei: [`src/components/layout/MobileNav.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MobileNav.tsx)
- Neue Komponente: `src/components/casino/navigation/MagneticDock.tsx`
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Store: [`src/store/useCasinoStore.ts`](file:///v:/VibeCoding/Casino/src/store/useCasinoStore.ts)
- Screenshots: [`docs/frontend/screenshots/01_weakness_mobile_nav.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/01_weakness_mobile_nav.png)
- Componentry-Referenz: [Magnetic Dock (`magnetic-dock`)](https://componentry.dev/docs/components/magnetic-dock)

### 3.2 Systemregeln & Invarianten
- **Design-System:** Obsidian (`#0B0E14`), Gold (`#D4AF37`), feiner Rand (`rgba(212, 175, 55, 0.2)`), Glass-Blur (`backdrop-filter: blur(20px)`).
- **Z-Index:** Strikt `Z_INDEX.mobileNav` (1000) aus den generierten Design-Tokens verwenden.
- **Zero-Wallet-Autorität:** Keine State-Mutationen außerhalb von UI-Flags (`isChatOpen`).

### 3.3 Nicht-Scope (Ausdrücklich verboten)
- Keine Änderungen an Desktop-Navigation (`Header.tsx` oder Sidebar).
- Keine Änderungen an Backend-Routen oder Auth-Flows.
- Keine neuen Icons; die bestehenden Lucide-Icons (`Home`, `Gamepad2`, `MessageSquare`, `Trophy`, `User`) bleiben erhalten.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Kernkomponente `MagneticDock.tsx`
- **Ziel:** Erstellung einer wiederverwendbaren Dock-Komponente mit Proximity-Magnification.
- **Schritte:**
  1. `useMotionValue` trackt Cursor- bzw. Touch-Position relativ zur Dock-Achse.
  2. Jedes Dock-Item berechnet via `useTransform` und Distanzfunktion den dynamischen Skalierungsfaktor (z. B. 1.0x bis 1.45x) und Y-Versatz.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Maus-/Touch-Bewegung.

### Meilenstein L2: Verdrahtung in `MobileNav.tsx`
- **Ziel:** Ersetzen der statischen HTML-Elemente durch das schwebende Dock.
- **Schritte:**
  1. Zentrierter, schwebender Container mit `bottom: calc(12px + env(safe-area-inset-bottom))`.
  2. Klickbare Routen (`/`, `/games`, `/leaderboard`, `/vault`) via Next.js `Link`.
  3. Action-Button für Chat (`setIsChatOpen`).
  4. Aktiver Indikator mit dezentem goldenem Ambient-Glow unter dem aktiven Tab.
- **Abbruchkriterium:** Navigation bricht ab oder Chat-Drawer öffnet sich nicht.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)
1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — Keine neuen ESLint-Warnungen/Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Visuelle Prüfung via Playwright Screenshot (Mobiler Viewport 390x844).
