# 57 — Footer CTA & Community-Abschluss: Closing Plasma

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Atmosphärisches Plasma-Feld (`closing-plasma`) mit tiefem Obsidian- und Goldglimmen vor dem Footer (`src/components/layout/Footer.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie                      | Niveau   | Befund & Beleg (Datei / Test)                               | Bottleneck? | Action Item                                                                         |
| --- | --------------------------------- | -------- | ----------------------------------------------------------- | :---------: | ----------------------------------------------------------------------------------- |
| 01  | Visueller Ausklang der Hauptseite | Top 65 % | Harte schwarze Trennkante vor dem Footer ohne Ausstrahlung. |    🔴 JA    | Fließendes Plasmafeld erzeugt warmes Goldglimmen und rundet das Scroll-Erlebnis ab. |
| 02  | Brand-Emotion                     | Top 60 % | Footer wirkt rein funktional und verlassen.                 |    🔴 JA    | Kryptografische Signatur und VIP-Community-Rufzeichen im Plasma eingebettet.        |
| 03  | Shader-Performance                | Top 35 % | Footer ist oft dauerhaft im unteren Viewport.               |    🔴 JA    | Intersection Observer stoppt Shader-Loop wenn nicht sichtbar.                       |
| 04  | Kontrast der Footer-Links         | Top 25 % | Rechtliche Pflichtlinks müssen WCAG-konform lesbar bleiben. |    Nein     | Plasma bleibt strikt im oberen Zierbereich hinter sanfter Vignette.                 |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                 | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ----------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/layout/Footer.tsx`              | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/layout/FooterClosingPlasma.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/layout/Footer.tsx`              | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/layout/FooterClosingPlasma.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                               | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/components/layout/Footer.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/Footer.tsx)
- Ziel-Komponente: [`src/components/layout/FooterClosingPlasma.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/FooterClosingPlasma.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/35_weakness_footer_closing_plasma.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/35_weakness_footer_closing_plasma.png)
- Componentry-Referenz: [57 — Footer CTA & Community-Abschluss: Closing Plasma](https://componentry.dev/docs/components/closing-plasma)

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

- **Ziel:** Erstellung von `src/components/layout/FooterClosingPlasma.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Nahtlose Einbindung in `src/components/layout/Footer.tsx`.
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
