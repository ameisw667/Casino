# 47 — Tastatur-Shortcuts Cheat-Sheet: Mac 3D Keyboard

> **Status:** 🟢 Completed & Archived · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Interaktives 3D-Tastatur-Modell (`mac-keyboard`) mit leuchtenden Tastenkappen bei Tastenanschlag (`src/components/layout/NavigationShortcuts.tsx`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Power-User-Erlebnis | Top 75 % | Reine Texttabelle der Shortcuts im Einstellungsdialog wirkt trocken. | 🔴 JA | Physikalisches 3D-Keyboard im Apple-Look mit mechanischem Hub und Tastenglühen. |
| 02 | Live-Feedback | Top 70 % | Kein visuelles Feedback beim Drücken von Leertaste oder Zahlen. | 🔴 JA | Reales Keydown-Event lässt die jeweilige virtuelle Taste in Gold aufleuchten. |
| 03 | Plattform-Erkennung | Top 45 % | Windows-Nutzer sehen ggf. Mac-spezifische Tasten. | 🔴 JA | Dynamisches Switch zwischen Command ⌘ und Strg je nach OS. |
| 04 | Bundle-Größe | Top 30 % | Keine schweren 3D-Modelle (GLTF) laden. | Nein | Reine CSS-3D-Boxen und Framer Motion ohne WebGL-Overhead. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/layout/NavigationShortcuts.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/settings/Mac3DKeyboardShortcuts.tsx` | 🔴 Geplant | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/components/layout/NavigationShortcuts.tsx` | 🔴 Geplant | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/components/casino/settings/Mac3DKeyboardShortcuts.tsx` | 🔴 Geplant | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Host-Datei: [`src/components/layout/NavigationShortcuts.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/NavigationShortcuts.tsx)
- Ziel-Komponente: [`src/components/casino/settings/Mac3DKeyboardShortcuts.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/settings/Mac3DKeyboardShortcuts.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshot: [`docs/frontend/screenshots/25_weakness_mac_keyboard.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/25_weakness_mac_keyboard.png)
- Componentry-Referenz: [47 — Tastatur-Shortcuts Cheat-Sheet: Mac 3D Keyboard](https://componentry.dev/docs/components/mac-keyboard)

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
- **Ziel:** Erstellung von `src/components/casino/settings/Mac3DKeyboardShortcuts.tsx` mit erstklassiger Motion-Physik und Obsidian-Gold-Aura.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Nahtlose Einbindung in `src/components/layout/NavigationShortcuts.tsx`.
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
