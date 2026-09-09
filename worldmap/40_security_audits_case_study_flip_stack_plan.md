# 40 — Sicherheits- & Auszahlungs-Audits: Case Study Flip Stack (Obsidian & Gold)

> **Status:** Execution-Ready · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Integration eines interaktiven 3D-Kartenstapels (`case-study-flip-stack`) für Sicherheitszertifikate und Auszahlungs-Audits im Footer (`src/components/layout/Footer.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie                           | Niveau   | Befund & Beleg (Datei / Test)                                                                     | Bottleneck? | Action Item                                                                         |
| --- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- | :---------: | ----------------------------------------------------------------------------------- |
| 01  | Trust & Sicherheitskommunikation       | Top 65 % | Statische Textlisten und simple Badges wirken generisch und erzeugen wenig emotionales Vertrauen. |    🔴 JA    | 3D Flip Stack mit gestaffelten Prüfungssiegeln (CertiK, Provably Fair, iTech Labs). |
| 02  | Haptisches Blättern & Scroll-Verhalten | Top 70 % | Keine interaktive Exploration der Prüfberichte möglich.                                           |    🔴 JA    | Kartenstapel reagiert auf Scroll/Hover mit geschmeidiger Kartenfaltung.             |
| 03  | Designsystem-Harmonie                  | Top 40 % | Footer-Links sind dunkelgrau auf Schwarz ohne Tiefe.                                              |    🔴 JA    | Obsidian `#0B0E14` mit Goldrand `#D4AF37/20` und feiner Tiefenunschärfe.            |
| 04  | Zero-Wallet-Autorität                  | Top 10 % | Reines UI-Trust-Element ohne Kontostand-Mutationen.                                               |    Nein     | Reine Read-Only Audit-Daten.                                                        |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                    | Status     | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | -------------------------------------------------- | ---------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/layout/Footer.tsx`                 | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/layout/SecurityAuditFlipStack.tsx` | 🔴 Geplant |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/layout/Footer.tsx`                 | 🔴 Geplant |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/layout/SecurityAuditFlipStack.tsx` | 🔴 Geplant |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                  | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Host-Datei: [`src/components/layout/Footer.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/Footer.tsx)
- Ziel-Komponente: [`src/components/layout/SecurityAuditFlipStack.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/SecurityAuditFlipStack.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/18_weakness_security_audits.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/18_weakness_security_audits.png)
- Componentry-Referenz: [40 — Sicherheits- & Auszahlungs-Audits: Case Study Flip Stack (Obsidian & Gold)](https://componentry.dev/docs/components/case-study-flip-stack)

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

- **Ziel:** Erstellung von `src/components/layout/SecurityAuditFlipStack.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
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
