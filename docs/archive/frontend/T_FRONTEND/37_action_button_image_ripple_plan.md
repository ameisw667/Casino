# 37 — Tischfilz & Action-Buttons: Image Ripple Brechungswelle (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des zentralen Spiel-Action-Buttons in `src/components/casino/controls/GameActionButton.tsx` durch eine physikalische WebGL-Flüssigkeits-/Tischfilz-Brechungswelle (`image-ripple-effect`), die sich bei Einsatzplatzierung über das Spielfeld ausbreitet.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| #   | Subkategorie                   | Niveau   | Befund & Beleg (Datei / Test)                                              | Bottleneck? | Action Item                                                                               |
| --- | ------------------------------ | -------- | -------------------------------------------------------------------------- | :---------: | ----------------------------------------------------------------------------------------- |
| 01  | Taktiles Tisch-Feedback        | Top 70 % | Reines CSS `scale: 0.96` fühlt sich flach an wie eine gewöhnliche Web-App. |    🔴 JA    | Shader-basierte Brechungswelle im Tischfilz, die vom Druckpunkt des Fingers ausgeht.      |
| 02  | Druckwellen-Shader             | Top 60 % | Standard-Canvas-Ripples wirken oft billig oder laggen.                     |    🔴 JA    | Ultra-effizienter WebGL-Displacement-Shader mit kurzer Halbwertszeit (350ms).             |
| 03  | Geldpfad-Sicherheit & Zero-Lag | Top 10 % | Einsatzabgabe darf keinesfalls durch Render-Lags verzögert werden.         |    Nein     | OnClick-Callback wird synchron sofort gefeuert; Ripple läuft non-blocking im Hintergrund. |
| 04  | WCAG AAA Kontrast              | Top 15 % | Gold-Kontrast 14:1 ist bereits vorbildlich etabliert.                      |    Nein     | Text- und Farbkontraste (#fef08a auf #141108) bleiben unangetastet erhalten.              |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                       | Status      | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ----------------------------------------------------- | ----------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/casino/controls/GameActionButton.tsx` | 🟢 Erledigt |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/controls/GameActionButton.tsx` | 🟢 Erledigt |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/casino/controls/GameActionButton.tsx` | 🟢 Erledigt |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/controls/GameActionButton.tsx` | 🟢 Erledigt |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                     | 🟢 Erledigt |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/controls/GameActionButton.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/GameActionButton.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/15_weakness_game_action_button.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/15_weakness_game_action_button.png)
- Componentry-Referenz: [37 — Tischfilz & Action-Buttons: Image Ripple Brechungswelle (Obsidian & Gold)](https://componentry.dev/docs/components/image-ripple-effect)

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

- **Ziel:** Erstellung von `src/components/ui/RippleCanvas.tsx` für physikalische Tischimpulse.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Kopplung mit `GameActionButton.tsx` bei Mouse-/Touch-Trigger.
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
