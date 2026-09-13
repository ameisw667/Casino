# 39 — Hero Showcase: Interaktive Text-Repel Headline (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung der Haupt-Headline „NEXT LEVEL VIP CASINO“ in `src/components/home/HeroCinematicShowcase.tsx` durch physikalischen Text-Repel (`text-repel`), bei dem die goldenen Buchstaben dem Mauszeiger organisch ausweichen und zurückfedern.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Erster Eindruck & Wow-Faktor | Top 65 % | Statische Headline-Textzeile ohne lebendige Reaktion auf den Besucher. | 🔴 JA | Taktiles Buchstaben-Ausweichen bei Cursor-Nähe mit elastischer Trägheits-Rückstellung. |
| 02 | Typografische Physik & Kerning | Top 60 % | Buchstaben dürfen beim Verdrängen nicht das Layout zerreißen. | 🔴 JA | Inline-Block Buchstabensegmentierung mit begrenztem Translationsradius (max. 15px). |
| 03 | SEO & Screenreader-Zugänglichkeit | Top 20 % | Headline `h1` muss für Suchmaschinen und Accessibility einheitlich lesbar bleiben. | Nein | `aria-label="Next Level VIP Casino"` auf dem übergeordneten `<h1>`-Tag sicherstellen. |
| 04 | Mobile Deaktivierung | Top 15 % | Auf Touch-Geräten gibt es keinen Hover-Mauszeiger. | Nein | Bei `isMobile` automatisch auf sanftes Pulsieren umschalten, Repel nur auf Pointer-Move. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | 🟢 Erledigt | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | 🟢 Erledigt | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | 🟢 Erledigt | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | 🟢 Erledigt | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🟢 Erledigt | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei: [`src/components/home/hero-cinematic/HeroHeadlineColumn.tsx`](file:///v:/VibeCoding/Casino/src/components/home/hero-cinematic/HeroHeadlineColumn.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/17_weakness_hero_text_repel.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/17_weakness_hero_text_repel.png)
- Componentry-Referenz: [39 — Hero Showcase: Interaktive Text-Repel Headline (Obsidian & Gold)](https://componentry.dev/docs/components/text-repel)

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
- **Ziel:** Entwicklung von `src/components/ui/TextRepelHeadline.tsx` mit Framer Motion Spring-Physik.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Austausch der statischen `<motion.h1>` in `HeroHeadlineColumn.tsx`.
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
