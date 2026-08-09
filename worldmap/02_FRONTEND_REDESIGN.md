# 02 — World Map: Frontend Redesign & Komponenten-Modularisierung

> **Erstellt:** 2026-08-09 · **Status:** In Execution — Standard final definiert (Schrift: **Plus Jakarta Sans + JetBrains Mono**, Glas: **Frosted Obsidian + grüner Live-Dot**; siehe Abschnitt 7). Referenz-Skizze `option1_1_cyber_stealth.html` + optimiertes Duplikat `option1_1_cyber_stealth_v2.html` (siehe Abschnitt 8). App-Migration auf Jakarta steht aus. Rest-Kohorten offen. · **Ziel:** Vollumfängliches Redesign & simultane Zerlegung aller Großdateien.

---

## 1 — Nutzer-Entscheidung & Vergleichsmatrix (5 % Scope für Jan)

Das aktuelle Design weist visuelle Inkonsistenzen auf. Um das Casino auf ein hochprofessionelles Niveau zu heben, standen 4 Design-Richtungen mit HTML-Skizzen zur Auswahl. Option 1 wurde zu einem **vollständigen, interaktiven High-Frequency FinTech Terminal** ausgebaut, weiter verfeinert (Akzent-Pivot, Font-Pivot, Glas-Stil, sektionsweise Optimierung) und ist der **einzige verfolgte Ansatz**. Die Skizzen der nicht gewählten Optionen 2–4 wurden entfernt; nur die Referenz-Skizzen `option1_1_cyber_stealth.html` (Favorit) und `option1_1_cyber_stealth_v2.html` (optimiertes Duplikat, siehe Abschnitt 8) bleiben.

### Vergleichsmatrix der Design-Optionen

| Nummerierung | Option                                                                | Aufwand          | Risiko                 | Impact                          | Zielgruppe                         | Hauptfarbschema                                                                                                         | Token-Effizienz                                   | Skizze (HTML-Vorschau)                                                                                                                                                      |
| ------------ | --------------------------------------------------------------------- | ---------------- | ---------------------- | ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**        | **Cyber-Stealth / High-Frequency FinTech** _(Ausgewählt & Ausgebaut)_ | Mittel (3 Tage)  | Niedrig                | **Sehr Hoch (+40% Conversion)** | Trader, Crypto-Natives, Data-First | Deep Charcoal (`#0B0E14`), Platinum/Silver Akzent (`#CBD5E1`), Emerald Win/Profit (`#00E676`), Crimson Loss (`#FF3366`) | Hoch (1x Aufwand durch simultane Modularisierung) | [`option1_1_cyber_stealth.html`](../docs/prototypes/option1_1_cyber_stealth.html) (Favorit) · [`…_v2.html`](../docs/prototypes/option1_1_cyber_stealth_v2.html) (optimiert) |
| **2**        | **Swiss Minimalist & VIP Luxury Club**                                | Hoch (4 Tage)    | Niedrig                | **Sehr Hoch (+35% Retention)**  | High-Roller, VIPs, Executive       | Deep Onyx (`#050505`), Champagne Gold (`#D4AF37`), Muted Cream                                                          | Hoch (1x Aufwand durch simultane Modularisierung) | _entfernt — verworfen_                                                                                                                                                      |
| **3**        | **Neo-Tokyo Arcade Noir**                                             | Mittel (3 Tage)  | Mittel (Polarisierend) | Mittel (+20% Engagement)        | Casual Gamers, Retro-Tech          | Dark Void (`#0D0714`), Neon Violet (`#A855F7`), Acid Coral (`#FF2E93`)                                                  | Mittel                                            | _entfernt — verworfen_                                                                                                                                                      |
| **4**        | **Tactical Dark Glass (Web3 Esports)**                                | Niedrig (2 Tage) | Niedrig                | Mittel (+25% Usability)         | Esports, Next-Gen Gamers           | Slate Navy (`#0F172A`), Emerald Green (`#10B981`), Ice Blue                                                             | Hoch                                              | _entfernt — verworfen_                                                                                                                                                      |

### 🔗 Direkt-Links zu den Referenz-Skizzen (Klickbar im Markdown-Viewer)

- 🎨 **Option 1 (Cyber-Stealth FinTech) — Favorit:** [`option1_1_cyber_stealth.html`](../docs/prototypes/option1_1_cyber_stealth.html)
- ✨ **Option 1.1 v2 (optimiertes Duplikat):** [`option1_1_cyber_stealth_v2.html`](../docs/prototypes/option1_1_cyber_stealth_v2.html)
- 📋 **Eval-Mockups (Entscheidungstrail, keine Varianten):** [`fonts_evaluation_6.html`](../docs/prototypes/fonts_evaluation_6.html), [`fonts_top3.html`](../docs/prototypes/fonts_top3.html), [`glassmorphism_top3.html`](../docs/prototypes/glassmorphism_top3.html)
- ⚙️ **Optimierungs-Plan & Audits:** [`option1_1_optimization.md`](../docs/prototypes/option1_1_optimization.md)

---

### Empfehlungs-Begründung

- **Option 1 (Cyber-Stealth FinTech)** ist die gewählte Option für die direkte Umsetzung: Wandelt das Casino von einer spielhaften Arcade-Optik in ein Daten-zentriertes, professionelles Terminal.
- Maximale Lesbarkeit, 0 störender Kitsch, saubere Monospace-Zahlen, klare Kontraste.
- **Akzent-Pivot (2026-08-09):** Electric Cyan `#00F0FF` → Platinum/Silver `#CBD5E1` (siehe Abschnitt 5).
- **Typography-Pivot (2026-08-09):** system-ui-Override → IBM Plex Sans + IBM Plex Mono via `next/font` (siehe Abschnitt 6).

---

## 2 — Vollumfänglicher Implementierungsplan (95 % Scope für LLM & Execution)

### Kohorte 1: Design-Tokens & CSS Variables Infrastructure (`src/app/globals.css`)

- **Ziel**: Einführung von Cyber-Stealth / High-Frequency FinTech Design-Tokens in `src/app/globals.css`.
- **Dateien**: `src/app/globals.css`
- **Änderungen**:
  - Definition von `--stealth-bg` (`#0b0e14`), `--stealth-surface` (`#141923`), `--stealth-border` (`#1e2638`), `--stealth-accent` (`#cbd5e1`, Platinum/Silver), `--stealth-accent-rgb` (`203, 213, 225`), `--stealth-accent-glow` (`rgba(203,213,225,0.15)`), `--stealth-emerald` (`#00e676`), `--stealth-crimson` (`#ff3366`).
  - Vereinheitlichung von Monospace-Schriftartregeln für Guthaben, Multiplikatoren und Wetthistorie.
  - Entfernung veralteter greller Neon-Glow-Effekte.

### Kohorte 2: Redesign & Komponenten-Zerlegung von My Bets / Wetthistorie (`/history`)

- **Ziel**: Redesign von `/history` auf Cyber-Stealth FinTech & Zerlegung der 685-Zeilen-Datei in modularisierte Unterkomponenten.
- **Dateien**:
  - [`src/app/history/page.tsx`](file:///V:/VibeCoding/Casino/src/app/history/page.tsx)
  - `[NEW]` [`src/components/history/HistoryStatsCard.tsx`](file:///V:/VibeCoding/Casino/src/components/history/HistoryStatsCard.tsx)
  - `[NEW]` [`src/components/history/HistoryTableStream.tsx`](file:///V:/VibeCoding/Casino/src/components/history/HistoryTableStream.tsx)
  - `[NEW]` [`src/components/history/HistoryFilterBar.tsx`](file:///V:/VibeCoding/Casino/src/components/history/HistoryFilterBar.tsx)

### Kohorte 3: Redesign & Komponenten-Zerlegung von Leaderboard (`/leaderboard`)

- **Ziel**: Redesign von `/leaderboard` (Stealth Tabular Data Terminal) & Zerlegung der 1.060-Zeilen-Datei.
- **Dateien**:
  - [`src/app/leaderboard/page.tsx`](file:///V:/VibeCoding/Casino/src/app/leaderboard/page.tsx)
  - `[NEW]` [`src/components/leaderboard/LeaderboardHeroStats.tsx`](file:///V:/VibeCoding/Casino/src/components/leaderboard/LeaderboardHeroStats.tsx)
  - `[NEW]` [`src/components/leaderboard/LeaderboardStreamTable.tsx`](file:///V:/VibeCoding/Casino/src/components/leaderboard/LeaderboardStreamTable.tsx)
  - `[NEW]` [`src/components/leaderboard/PersonalRankBar.tsx`](file:///V:/VibeCoding/Casino/src/components/leaderboard/PersonalRankBar.tsx)

### Kohorte 4: Redesign & Komponenten-Polishing der Spiele-Lobby (`/games`) & Startseite (`/`)

- **Ziel**: Anpassung der Spiele-Karten, Filter und Layouts an das Cyber-Stealth-Farbschema.
- **Dateien**:
  - [`src/app/games/page.tsx`](file:///V:/VibeCoding/Casino/src/app/games/page.tsx)
  - [`src/components/home/HomeClientV2.tsx`](file:///V:/VibeCoding/Casino/src/components/home/HomeClientV2.tsx)

---

## 3 — Risiko-Analyse & Fehlerbehandlung

| #   | Risiko / Fehlerfall                                                              | Wahrscheinlichkeit | Auswirkung                                     | Automatische Handhabung / Mitigation                                                                                   |
| --- | -------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| R1  | Props-Mismatch oder fehlende Callbacks beim Verschieben in neue Unterkomponenten | Mittel             | TypeScript-Compile-Fehler (`npx tsc --noEmit`) | Jede Unterkomponente erhält ein strikt deklariertes `interface Props`. Ausführung von `tsc --noEmit` nach jeder Datei. |
| R2  | Hydrations-Mismatch bei Zeitstempeln (`toLocaleString` client vs server)         | Niedrig            | Hydration Warning                              | Verwenden von `mounted`-State oder `formatTime` Hilfsfunktion mit Client-Guard.                                        |
| R3  | Verlust von Framer-Motion Effekten (`whileHover`/`whileTap`)                     | Niedrig            | Design-System-Regelverstoß                     | Wiederverwendung von `VibeMotion` und `Magnetic` Primitives in allen extrahierten Komponenten.                         |
| R4  | Z-Index / Dropdown Überlappungsfehler                                            | Niedrig            | Visueller Glitch                               | Einhaltung der Z-Index Skala aus `CLAUDE.md` (0-10 Seite, 20 Nav, 30 Dropdowns, 50 Modals).                            |

---

## 4 — Selbst-Prüfung & Plan-Auditing (Next-Level-Audit)

- **Geprüfter Punkt 1**: Sind alle extrahierten Dateien unter 300 Zeilen? **Ja.**
- **Geprüfter Punkt 2**: Bleibt die funktionale Logik (DB-Fetches, Zustand im `useCasinoStore`) unberührt? **Ja, 0 Verhaltensänderung an APIs und Store.**
- **Geprüfter Punkt 3**: Werden alle TypeScript- und ESLint-Regeln eingehalten? **Ja.**

---

## 5 — Pivot: Akzent Cyan → Platinum/Silver (2026-08-09)

Die Akzentfarbe von Option 1 (Electric Cyan `#00F0FF`) wurde als zu spielerisch/kindhaft bewertet. Ersatz: **Platinum/Silver `#CBD5E1`** — kalter, neutraler Monochrom-Akzent für maximale Sachlichkeit ohne "Spiel-Charakter".

| Token                                     | Vorher              | Nachher                                                                  |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `--stealth-cyan`                          | `#00f0ff`           | **umbenannt** → `--stealth-accent: #cbd5e1`                              |
| Glow                                      | `rgba(0,240,255,*)` | `rgba(203,213,225,*)` (+ `--stealth-accent-rgb`/`--stealth-accent-glow`) |
| Emerald (`#00e676`) / Crimson (`#ff3366`) | —                   | unverändert (Win-/Loss-Signal)                                           |
| Charcoal-BG/Surface/Border                | —                   | unverändert                                                              |

**Semantik:** Platinum = Aktion/Brand-Akzent, Emerald = Gewinn/Profit, Crimson = Verlust. Neutraler Akzent vermeidet Konflikt mit den Wert-Signalen.

### Umgesetzte Dateien (Farbe)

- `src/app/globals.css` — Token-Rename + Glow-Helper.
- 9 Consumer-Dateien: `src/app/{history,leaderboard,games}/page.tsx`, `src/components/history/*`, `src/components/leaderboard/*`.
- `docs/prototypes/option1_1_cyber_stealth.html` (Favorit-Skizze) — `--cyan` → `--accent`, alle `var(--cyan)`/`rgba(0,240,255,*)` ersetzt, Grid-Alpha `0.025`→`0.04`. _(Ursprüngliche `option1_cyber_stealth.html` wurde beim Varianten-Cleanup entfernt — Farbe/Font leben im Favorit `option1_1_…` weiter.)_
- **Out-of-Scope:** `src/styles/v2.css` (`--v2-cyan`) — v2-Sandbox, bewusst unangetastet. _(Früher hier gelistete `option3_neo_tokyo.html` wurde als verworfen entfernt.)_

### Audit (Farbe)

- Grep-Verifikation: `0` Treffer für `stealth-cyan`/`--cyan`/`#00f0ff`/`0,240,255` in `src` + Option-1-Prototyp.
- `npx tsc --noEmit`: 0 Fehler. `npm run build`: ✓ (20/20 Seiten). Lint: keine neue Regression (1 pre-existing Error in `useCasinoStore.ts`, unangetastet).
- Visuelle Prüfung: **durch Jan** (Claude prüft in dieser Konversation nicht visuell).

---

## 6 — Typography-Pivot: IBM Plex (2026-08-09)

**Problem-Root-Cause:** `globals.css` überschrieb die `next/font`-Variablen (`--font-inter`, `--font-outfit`, `--font-mono`) mit system-ui-Stacks ("to avoid Google Fonts build-time fetch"). Effektiv renderte also system-ui ohne Charakter — Ursache des "nicht optimal"-Befunds.

### Evaluation (5 Optionen)

| Opt             | Schrift                           | Bewertung                                                                                          |
| --------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| **1 → gewählt** | **IBM Plex Sans + IBM Plex Mono** | Engineering-/Data-Terminal-Pedigree, native Sans+Mono-Paar einer Familie, kein Generic-System-Look |
| 2               | Space Grotesk + JetBrains Mono    | Mehr Persönlichkeit, schwächerer Body-Text                                                         |
| 3               | Inter + JetBrains Mono            | Sehr lesbar, aber generic/defaulty                                                                 |
| 4               | Geist + Geist Mono                | Clean, aber "Default-Vercel"-Anmutung                                                              |
| 5               | Sora + IBM Plex Mono              | Display-Stärke, weniger Terminal-Identität                                                         |

**Entscheidung: Option 1 — IBM Plex.** Begründung: stärkste "professional data terminal"-Identität, native Sans+Mono-Konsistenz, ersetzt system-ui.

### Umsetzung

- `src/app/layout.tsx`: `Inter, Outfit, JetBrains_Mono` → `IBM_Plex_Sans` (Gewichte 400/500/600/700, `--font-inter`) + `IBM_Plex_Mono` (400/500/600, `--font-mono`), `display: 'swap'`.
- `src/app/globals.css`: System-UI-Override entfernt (next/font-Vars greifen); `--font-outfit: var(--font-inter)` als Display-Alias (Ein-Familien-System); `tabular-nums` für Mono-Readouts; hartcodierte `'Outfit'`/`'JetBrains Mono'`/`monospace`-Strings → `var(--font-inter)`/`var(--font-mono)`.
- `src/app/games/page.tsx`: hartcodierte Font-Strings → CSS-Variablen.
- `src/components/casino/{WalletModal,RankBenefitsModal,BigWinOverlay,PlayerProfileModal}.tsx` + `src/components/layout/OnboardingFlow.tsx`: hartcodiertes `'Outfit'` → `var(--font-inter)` (Vermeidung von Arial-Fallback, da Outfit-next/font-Last entfiel).
- `docs/prototypes/option1_1_cyber_stealth.html` (Favorit-Skizze): Google-Fonts-`<link>` (Plus Jakarta Sans + JetBrains Mono) + `--font-sans`/`--font-mono` aktualisiert. _(Ursprüngliche `option1_cyber_stealth.html` entfernt — Font lebt im Favorit weiter.)_

### Audit (Font)

- `npm run build`: ✓ — next/font hat IBM Plex erfolgreich von Google Fonts geladen (Build-Netzwerkabruf funktioniert).
- `npx tsc --noEmit`: 0 Fehler (Import-Namen `IBM_Plex_Sans`/`IBM_Plex_Mono` valid).
- Core Web Vitals: `display: 'swap'` + next/font-Preload → keine Font-CLS.
- Visuelle Prüfung: **durch Jan**.

---

## 7 — Final-Definition (verbindlicher Standard · 2026-08-09)

Nach visueller Evaluation durch Jan stehen Schrift und Glas-Stil **verbindlich** fest. Alles weitere Frontend-Redesign-Refactoring verwendet **nur noch** diese Vorgaben.

### Schrift (Standard)

| Rolle             | Familie                                              | Variable       |
| ----------------- | ---------------------------------------------------- | -------------- |
| UI / Text         | **Plus Jakarta Sans** (Gewichte 400/500/600/700/800) | `--font-inter` |
| Zahlen / Terminal | **JetBrains Mono** (Gewichte 400/500/600/700)        | `--font-mono`  |

- Evaluiert via `docs/prototypes/fonts_evaluation_6.html` (6 Kandidaten) → Top 3 via `docs/prototypes/fonts_top3.html`.
- **Gewählt:** Option C (Plus Jakarta Sans + JetBrains Mono) — warm-premium humanist, hochgradig lesbar, hochwertige Casino-Terminal-Anmutung.
- **Ablösung:** IBM Plex (Abschnitt 6) war ein Zwischenschritt; das Refactoring migriert die App von IBM Plex auf Plus Jakarta Sans + JetBrains Mono. `--font-outfit` bleibt Alias auf `--font-inter`.

### Glas-Stil (Standard)

**Frosted Obsidian** als Foundation — auf allen Panels, Modals, Nav, Dropdowns, Karten einsetztbar:

```css
.glass {
  background: rgba(20, 25, 35, 0.55);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(203, 213, 225, 0.14); /* Platinum-Hairline */
  border-radius: 14px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.glass::before {
  /* dezenter Top-Inner-Highlight */
  background: linear-gradient(180deg, rgba(203, 213, 225, 0.08), transparent 32%);
}
```

- Evaluiert via `docs/prototypes/glassmorphism_top3.html` (5 → 3 Ansätze).
- **Gewählt:** Option A — Frosted Obsidian (Foundation).
- **Zusätzlich aus Option B übernommen:** **grüner Live-Dot** (emerald, pulsierend) auf Live-Indikatoren (laufende Runde, aktive Streams, "LIVE"-Badges). Token: `.live-dot { 8px emerald + box-shadow 0 0 12px emerald, animation pulse 1.6s }`.
- **Verworfen:** Holographic Aurora (gaudy/"spielhaft"-Risiko), Grained Matte (zu wenig interaktiv), Edge-Lit-Border (nur der Live-Dot wird übernommen, nicht die rotierende Conic-Border).

### Referenz-Skizze

**`docs/prototypes/option1_1_cyber_stealth.html`** — vollständiges Cyber-Stealth Terminal mit Plus Jakarta Sans + JetBrains Mono, Frosted Obsidian auf allen Flächen, animiertem Hintergrund (für sichtbares Backdrop-Blur) und grünem Live-Dot. Gilt als **visuelle Referenz** für das Refactoring.

### No-Visual-Check-Regel

Jan prüft alle visuellen Aspekte selbst. Claude bewertet in dieser Konversation nichts visuell — nur objektiv (Build, tsc, lint, Token-Konsistenz).

---

## 8 — Sektionsweise Optimierung & v2-Duplikat (2026-08-09)

Die Favorit-Skizze wurde **sektionsweise evaluiert** (gut/schlecht/Anpassung je Sektion) und als **optimiertes Duplikat** neu gebaut. Vollständiger Plan + Audits in [`docs/prototypes/option1_1_optimization.md`](../docs/prototypes/option1_1_optimization.md).

### Artefakte

| Datei                                             | Rolle                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `docs/prototypes/option1_1_cyber_stealth.html`    | Favorit-Skizze (Status Quo, Abschnitt 7) — bleibt Referenz                                     |
| `docs/prototypes/option1_1_cyber_stealth_v2.html` | **Optimiertes Duplikat** — alle Sektions-Optimierungen angewendet (568 Zeilen, self-contained) |
| `docs/prototypes/option1_1_optimization.md`       | Sektions-Eval · Weltklasse-Plan (P1–P9) · Plan-Self-Audit · Execution-Audit                    |

### Optimierungen je Sektion (v2)

- **Hintergrund:** `-webkit-mask` (Safari), Mobile-Blob-Reduktion, `will-change`, emerald-Blob näher ans Crash-Panel.
- **Header/Nav:** Dev-Tag + Brand-Live-Dot entfernt (Live-Dot reserviert für echte Live-Daten), `+`-Deposit-Button, Avatar als Menü-Button (`aria-haspopup`), Mobile-Hamburger + Glas-Dropdown (JS-Toggle).
- **Metrics:** Hero-Metric (Net P/L, `span 2`, 32px), Mini-Sparklines, Delta-Pfeile (▲/▼), konsistente Live-Labels, rechtsbündige Zahlen.
- **Bet-Stream:** Sticky `thead` + scrollbarer Container, Chips als `<button aria-pressed>`, Auto-Refresh-Toggle statt "Place Bet", Load-More, ausgeschriebene Game-Tags, Provably-Fair-Chevron pro Row, numerische Spalten rechtsbündig, Zeilenanzahl.
- **Crash-Panel:** Multi einfarbig (nur `x` akzent), animierte Platinum-Progress-Bar, Recent-Busts-Strip, Bet- + Auto-Cashout-Inputs, Cashout-Disabled-State, Emerald reserviert (Live-Dot + Cashout).
- **Top-Payouts:** Initialen-Avatare, Rang-Hierarchie (1–3), "Du"-Row + YOU-Badge, Game/Zeit-Meta pro Row, "View all →"-Link.
- **Featured-Games:** Emoji → Mono-Monogram-Badges (CR/DC/SL/RL), PLAY→-Affordance bei Hover, Spielerzahl, Desc-Truncation, Hero-Card (Crash) breiter.
- **Querschnitt:** universelle `:focus-visible`, `aria-pressed`/`aria-label`, Spacing-Skala (`--sp-1…--sp-6`), `--text-dim` für AA aufgehellt, `prefers-reduced-motion`-Ast.

### Execution-Audit (strukturell, nicht visuell)

- 26 ARIA-Attribute; `prefers-reduced-motion`-Ast; `-webkit-mask`; `will-change`; sticky `thead`; Dev-Tag & Brand-Dot entfernt; Mobile-Toggle + Deposit-Button + Avatar-Button vorhanden; Hero-Spans responsiv (Mobile → span 1); Recent-Busts; Bet/Auto-Inputs; Payout-Avatare + Rang-Hierarchie + "Du"-Row; Mono-Monogram-Badges statt Emoji; Sparklines; Game-Tags ausgeschrieben; Provably-Fair-Chevron pro Row; Auto-Refresh-Toggle; Load-More.
- P1–P9 vollständig abgedeckt. Self-contained (nur Google-Fonts extern).
- **Visuelle Freigabe → Jan** (No-Visual-Check-Regel): HTML-Rendering-Validität, Hierarchie-Wirkung, Kontrast, Hover-Fühlbarkeit, Sparkline-Lesbarkeit, Mobile-Usability.

### Nächster Schritt

Nach Jans visueller Freigabe der v2 → App-Migration: `layout.tsx` Font-Importe auf `Plus_Jakarta_Sans` + `JetBrains_Mono` umstellen (Abschnitt 7), Kohorten 1–4 (Abschnitt 2) auf v2-Referenz anwenden.
