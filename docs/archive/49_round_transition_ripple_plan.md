# 49 — Rundenübergänge & Game-Reset: Ripple Transition

> **Status:** Executed (archiviert) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Chromatische Aberrations-Welle (`ripple-transition`) zentriert vom Auslöser-Klick bei Runden-Reset (`src/components/casino/GameLayout.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie                | Niveau   | Befund & Beleg (Datei / Test)                                | Bottleneck? | Action Item                                                                 |
| --- | --------------------------- | -------- | ------------------------------------------------------------ | :---------: | --------------------------------------------------------------------------- |
| 01  | Runden-Abschluss & Neustart | Top 70 % | Plötzliches Leeren des Canvas ohne physische Haptik.         |    🔴 JA    | Konzentrische Schockwelle mit feiner Farbzerlegung wischt den Tisch sauber. |
| 02  | Spannungs-Cooldown          | Top 65 % | Keine spürbare Zäsur zwischen Niederlage und neuer Chance.   |    🔴 JA    | Subtiler haptischer Puls lässt das Spielbrett neu fokussieren.              |
| 03  | Game-Loop Entkopplung       | Top 20 % | Wett-Status und RPC-Responses dürfen nicht blockiert werden. |    Nein     | Animation läuft parallel als visueller Puffer während des Settlement.       |
| 04  | Reduced Motion              | Top 15 % | Empfindliche Nutzer müssen den Effekt dämpfen können.        |    🔴 JA    | `prefers-reduced-motion` schaltet auf sanften 150ms Opacity-Crossfade um.   |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                              | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------------------------------------------ | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/casino/GameLayout.tsx`                       | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/transitions/GameRippleTransition.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/casino/GameLayout.tsx`                       | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/transitions/GameRippleTransition.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                            | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/components/casino/GameLayout.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/GameLayout.tsx)
- Ziel-Komponente: [`src/components/casino/transitions/GameRippleTransition.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/transitions/GameRippleTransition.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/27_weakness_ripple_transition.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/27_weakness_ripple_transition.png)
- Componentry-Referenz: [49 — Rundenübergänge & Game-Reset: Ripple Transition](https://componentry.dev/docs/components/ripple-transition)

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

- **Ziel:** Erstellung von `src/components/casino/transitions/GameRippleTransition.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/components/casino/GameLayout.tsx`.
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
