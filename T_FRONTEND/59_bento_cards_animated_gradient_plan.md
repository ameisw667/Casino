# 59 — Dynamic Ambient Glow in Bento-Cards: Animated Gradient

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Subtiler WebGL-Perlin-Noise Gold-Glimmer (`animated-gradient`) hinter den wichtigsten Bento-Karten (`src/components/home/bento/BentoCell.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Kantenbrillanz & Kontur | Top 65 % | Statische Box-Shadows wirken platt und digital tot. | 🔴 JA | Organisch atmender Goldglanz hinter den Kartenkanten mit weichem Randabfall. |
| 02 | Hierarchie der Kacheln | Top 55 % | Alle Kacheln haben denselben Rahmen. | 🔴 JA | Featured-Kacheln (Jackpot, Crash) erhalten intensiveren Puls. |
| 03 | Compositing & Repaints | Top 40 % | Glow-Effekte können Repaint-Stürme auslösen. | 🔴 JA | Reine GPU-Layer (`transform: translateZ(0)`) ohne CPU-Repaints. |
| 04 | Akkulaufzeit auf Mobile | Top 30 % | Kontinuierliche Loops leeren Smartphone-Akkus. | 🔴 JA | Auf Mobile CSS-Keyframe-Gradient mit minimaler Rechenlast nutzen. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/home/bento/BentoCell.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/home/bento/BentoAnimatedGlow.tsx` | 🔴 Geplant | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/components/home/bento/BentoCell.tsx` | 🔴 Geplant | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/components/home/bento/BentoAnimatedGlow.tsx` | 🔴 Geplant | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Host-Datei: [`src/components/home/bento/BentoCell.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoCell.tsx)
- Ziel-Komponente: [`src/components/home/bento/BentoAnimatedGlow.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoAnimatedGlow.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/37_weakness_bento_ambient_glow.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/37_weakness_bento_ambient_glow.png)
- Componentry-Referenz: [59 — Dynamic Ambient Glow in Bento-Cards: Animated Gradient](https://componentry.dev/docs/components/animated-gradient)

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
- **Ziel:** Erstellung von `src/components/home/bento/BentoAnimatedGlow.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Nahtlose Einbindung in `src/components/home/bento/BentoCell.tsx`.
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
