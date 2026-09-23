# 58 — Wett-Modus Umschalter (Auto/Manual): Flipping Word Swap

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Haptischer 3D-Perspektiven-Flip (`flipping-word-swap`) beim Umschalten zwischen Manual und Auto Bet (`src/components/casino/controls/BetControlPanel.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie                 | Niveau   | Befund & Beleg (Datei / Test)                                    | Bottleneck? | Action Item                                                                 |
| --- | ---------------------------- | -------- | ---------------------------------------------------------------- | :---------: | --------------------------------------------------------------------------- |
| 01  | Wett-Modus Wahrnehmung       | Top 65 % | Simple flache Tabs; Risiko versehentlicher Klicks im Auto-Modus. |    🔴 JA    | 3D-Rotations-Flip mit spürbarem taktilem Schaltgefühl trennt Modi glasklar. |
| 02  | Haptischer Klick-Puls        | Top 60 % | Standardmäßiger Farbwechsel ohne Trägheit.                       |    🔴 JA    | Subtiler Goldrand-Blitz bei Modus-Aktivierung.                              |
| 03  | Wett-Sicherheit & Money-Pfad | Top 20 % | Bet-Handler und Bet-Amounts dürfen nicht manipuliert werden.     |    Nein     | Reine UI-Umschaltung des lokalen ActiveTab-States.                          |
| 04  | Keyboard-Barrierefreiheit    | Top 25 % | Pfeiltasten müssen Tabs wechseln können.                         |    Nein     | Volle ARIA-Tablist-Semantik erhalten.                                       |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                          | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | -------------------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/casino/controls/BetControlPanel.tsx`     | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/controls/BetModeFlippingTabs.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/casino/controls/BetControlPanel.tsx`     | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/controls/BetModeFlippingTabs.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                        | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/components/casino/controls/BetControlPanel.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/BetControlPanel.tsx)
- Ziel-Komponente: [`src/components/casino/controls/BetModeFlippingTabs.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/BetModeFlippingTabs.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/36_weakness_bet_mode_tabs.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/36_weakness_bet_mode_tabs.png)
- Componentry-Referenz: [58 — Wett-Modus Umschalter (Auto/Manual): Flipping Word Swap](https://componentry.dev/docs/components/flipping-word-swap)

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

- **Ziel:** Erstellung von `src/components/casino/controls/BetModeFlippingTabs.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/components/casino/controls/BetControlPanel.tsx`.
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
