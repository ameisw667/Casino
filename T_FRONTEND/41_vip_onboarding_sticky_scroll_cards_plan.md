# 41 — VIP Onboarding & Feature-Tour: Sticky Scroll Cards

> **Status:** Completed & Archived · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Implementierung einer geführten, cineastischen VIP-Feature-Tour (`sticky-scroll-cards`) im Onboarding-Dialog (`src/components/layout/OnboardingFlow.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Onboarding-Dramaturgie | Top 70 % | Klassisches Stepper-Modal mit Vor/Zurück-Buttons wirkt wie Standard-SaaS. | 🔴 JA | Karten bleiben sticky verankert während sich die Feature-Inhalte cinematisch darüber schieben. |
| 02 | VIP-Gefühl & Exklusivität | Top 65 % | Keine visuelle Begrüßung wie in einem echten High-End-Club. | 🔴 JA | Gestaffelte Präsentation von Rakeback, Weekly Bonus und persönlichem VIP-Host. |
| 03 | Motion-Performance | Top 30 % | Framer Motion ist bereits vorhanden. | Nein | Scroll-getriebene Transformationen mit Spring-Smoothing. |
| 04 | Mobile Usability | Top 45 % | Modal muss auf Mobile fehlerfrei wischbar sein. | 🔴 JA | Touch-Gesten und vertikale Wisch-Phasen optimieren. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/layout/OnboardingFlow.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/onboarding/StickyScrollTour.tsx` | 🔴 Geplant | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/components/layout/OnboardingFlow.tsx` | 🔴 Geplant | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/components/casino/onboarding/StickyScrollTour.tsx` | 🔴 Geplant | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Host-Datei: [`src/components/layout/OnboardingFlow.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/OnboardingFlow.tsx)
- Ziel-Komponente: [`src/components/casino/onboarding/StickyScrollTour.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/onboarding/StickyScrollTour.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/19_weakness_onboarding_flow.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/19_weakness_onboarding_flow.png)
- Componentry-Referenz: [41 — VIP Onboarding & Feature-Tour: Sticky Scroll Cards](https://componentry.dev/docs/components/sticky-scroll-cards)

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
- **Ziel:** Erstellung von `src/components/casino/onboarding/StickyScrollTour.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Nahtlose Einbindung in `src/components/layout/OnboardingFlow.tsx`.
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
