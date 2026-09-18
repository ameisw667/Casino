# 55 — Live-Wetten Ticker & Rollen: Flipping Word Swap

> **Status:** Geplant · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Kinetisches 3D-Flipwerk (`flipping-word-swap`) für einlaufende Live-Wetten in der Bento-Lobby (`src/components/home/bento/BentoLiveWinsCell.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

> **Statuskorrektur 2026-09-12:** Der im Scope genannte Host-Pfad existiert nicht mehr. Vor L0 ist eine aktuelle Host-Zuordnung und die Aktualisierung des Kontext-Koffers erforderlich; erst danach ist der Plan wieder Execution-Ready.

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie           | Niveau   | Befund & Beleg (Datei / Test)                               | Bottleneck? | Action Item                                                          |
| --- | ---------------------- | -------- | ----------------------------------------------------------- | :---------: | -------------------------------------------------------------------- |
| 01  | Live-Puls des Casinos  | Top 70 % | Textzeilen poppen abrupt auf oder werden schlicht ersetzt.  |    🔴 JA    | Kinetischer 3D-Halbseiten-Flip der Multiplikatoren und Spielernamen. |
| 02  | Dopamin bei High-Wins  | Top 60 % | Gewinne über 100x stechen optisch nicht hervor.             |    🔴 JA    | Goldener Funken-Flip bei Multiplikatoren > 50x.                      |
| 03  | Realtime-Event-Taktung | Top 35 % | Viele Wetten pro Sekunde können Flips überlagern.           |    🔴 JA    | Event-Queue puffert Flips und garantiert saubere Transitions.        |
| 04  | Zero-Wallet-Autorität  | Top 10 % | Öffentlicher Live-Stream ohne Einfluss auf das User-Wallet. |    Nein     | Reiner Read-Stream.                                                  |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                      | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ---------------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/home/bento/BentoLiveWinsCell.tsx`    | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/home/bento/LiveWinsFlippingSwap.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/home/bento/BentoLiveWinsCell.tsx`    | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/home/bento/LiveWinsFlippingSwap.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                    | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/components/home/bento/BentoLiveWinsCell.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoLiveWinsCell.tsx)
- Ziel-Komponente: [`src/components/home/bento/LiveWinsFlippingSwap.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/LiveWinsFlippingSwap.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/33_weakness_live_bets_flip.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/33_weakness_live_bets_flip.png)
- Componentry-Referenz: [55 — Live-Wetten Ticker & Rollen: Flipping Word Swap](https://componentry.dev/docs/components/flipping-word-swap)

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

- **Ziel:** Erstellung von `src/components/home/bento/LiveWinsFlippingSwap.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/components/home/bento/BentoLiveWinsCell.tsx`.
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
