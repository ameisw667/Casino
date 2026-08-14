# 02 — World Map: Frontend Redesign & Komponenten-Modularisierung

> **Erstellt:** 2026-08-09 · **Status:** In Execution — Standard final definiert (Schrift: **Plus Jakarta Sans + JetBrains Mono**, Glas: **Frosted Obsidian + grüner Live-Dot**; siehe Abschnitt 7). Referenz-Skizze `option1_1_cyber_stealth.html` + optimiertes Duplikat `option1_1_cyber_stealth_v2.html` (siehe Abschnitt 8). 3D-Wasser-Wellen-Hintergrund als Mockup gebaut, strukturell verifiziert, `Executed` (siehe Abschnitt 9 + [docs/architecture/08_WATER_WAVE_BACKGROUND.md](../docs/architecture/08_WATER_WAVE_BACKGROUND.md)) — Jans visuelle Freigabe steht noch aus. **Eigenständige Lobby-Testseite `/refactoring`** (Three.js + GSAP + Frosted-Obsidian-Glass, komplett eigener Ansatz, nur Startseite) gebaut, strukturell verifiziert, `Executed` (siehe Abschnitt 10) — Jans visuelle Freigabe steht aus. App-Migration auf Jakarta steht aus. Rest-Kohorten offen. · **Ziel:** Vollumfängliches Redesign & simultane Zerlegung aller Großdateien.

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

### Direkte Browser-URLs für die visuelle Prüfung

**Lokale Basis-URL:** `http://localhost:3015`
Start des Dev-Servers: `npm run dev`

#### A — Redesign- und Lobby-Prototypen

| Variante / Testseite                              | Vollständige URL                                                                                                                             | Zweck                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Cyber-Stealth Lobby — isolierte Next.js-Testseite | [http://localhost:3015/refactoring](http://localhost:3015/refactoring)                                                                       | Eigenständige Lobby mit Three.js, GSAP und Frosted-Obsidian-Glass |
| Cyber-Stealth Lobby — direktes HTML               | [http://localhost:3015/prototypes/lobby_v2_refactoring.html](http://localhost:3015/prototypes/lobby_v2_refactoring.html)                     | Direkter Aufruf des isolierten HTML-Prototyps ohne App-Wrapper    |
| Cyber-Stealth Favorit                             | [V:/VibeCoding/Casino/docs/prototypes/option1_1_cyber_stealth.html](V:/VibeCoding/Casino/docs/prototypes/option1_1_cyber_stealth.html)       | Ursprüngliche Referenz-Skizze                                     |
| Cyber-Stealth v2                                  | [V:/VibeCoding/Casino/docs/prototypes/option1_1_cyber_stealth_v2.html](V:/VibeCoding/Casino/docs/prototypes/option1_1_cyber_stealth_v2.html) | Optimierte Referenz-Skizze                                        |
| Wasser-Wellen-Hintergrund                         | [V:/VibeCoding/Casino/docs/prototypes/water_background_v1.html](V:/VibeCoding/Casino/docs/prototypes/water_background_v1.html)               | Separater 3D-Wasser-/Ripple-Hintergrund-Mockup                    |

Die drei folgenden Dateien sind reine Evaluationsseiten und keine eigenständigen Casino-Lobbys:

| Evaluationsseite      | Vollständige lokale Datei                                                                                                    | Zweck                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Fonts — 6 Kandidaten  | [V:/VibeCoding/Casino/docs/prototypes/fonts_evaluation_6.html](V:/VibeCoding/Casino/docs/prototypes/fonts_evaluation_6.html) | Vergleich der sechs Schriftkombinationen  |
| Fonts — Top 3         | [V:/VibeCoding/Casino/docs/prototypes/fonts_top3.html](V:/VibeCoding/Casino/docs/prototypes/fonts_top3.html)                 | Verdichtete Schriftarten-Auswahl          |
| Glassmorphism — Top 3 | [V:/VibeCoding/Casino/docs/prototypes/glassmorphism_top3.html](V:/VibeCoding/Casino/docs/prototypes/glassmorphism_top3.html) | Vergleich der drei Glas-/Panel-Richtungen |

> **Hinweis:** Die Dateien unter `docs/prototypes/` sind aktuell Quelldateien und keine HTTP-Routen. Die beiden Lobby-Varianten unter `public/prototypes/` sind direkt über `localhost:3015` erreichbar. Für die `docs/prototypes/`-Dateien muss die Datei lokal im Browser geöffnet oder zunächst über einen statischen File-Server bereitgestellt werden.

#### B — Vorhandene visuelle App- und Komponenten-Testseiten

| Testseite              | Vollständige URL                                                                             | Zweck                                    |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| V2-Startseite          | [http://localhost:3015/v2](http://localhost:3015/v2)                                         | Bestehende V2-Lobby-Variante             |
| Brand Showcase         | [http://localhost:3015/testing/brand-showcase](http://localhost:3015/testing/brand-showcase) | Zentrale Brand- und Komponentenübersicht |
| 7.1 — BetModeTabs      | [http://localhost:3015/testing/7.1](http://localhost:3015/testing/7.1)                       | Harmonisierung der Bet-Mode-Tabs         |
| 7.2 — BetInputGroup    | [http://localhost:3015/testing/7.2](http://localhost:3015/testing/7.2)                       | Harmonisierung der Bet-Inputs            |
| 7.3 — GameActionButton | [http://localhost:3015/testing/7.3](http://localhost:3015/testing/7.3)                       | Harmonisierung der primären Spielaktion  |
| 7.4 — VibeSlider       | [http://localhost:3015/testing/7.4](http://localhost:3015/testing/7.4)                       | Evaluierung des Slider-Verhaltens        |
| 7.5 — AutoBetDrawer    | [http://localhost:3015/testing/7.5](http://localhost:3015/testing/7.5)                       | Evaluierung des Auto-Bet-Drawers         |
| 7.6 — GameStatsPanel   | [http://localhost:3015/testing/7.6](http://localhost:3015/testing/7.6)                       | Evaluierung des Statistik-Panels         |

#### C — Relevante Live-Seiten für den Gesamtvergleich

| Seite              | Vollständige URL                                                               |
| ------------------ | ------------------------------------------------------------------------------ |
| Startseite / Lobby | [http://localhost:3015/](http://localhost:3015/)                               |
| Spiele-Übersicht   | [http://localhost:3015/games](http://localhost:3015/games)                     |
| Crash              | [http://localhost:3015/games/crash](http://localhost:3015/games/crash)         |
| Dice               | [http://localhost:3015/games/dice](http://localhost:3015/games/dice)           |
| Roulette           | [http://localhost:3015/games/roulette](http://localhost:3015/games/roulette)   |
| Slots              | [http://localhost:3015/games/slots](http://localhost:3015/games/slots)         |
| Blackjack          | [http://localhost:3015/games/blackjack](http://localhost:3015/games/blackjack) |
| Leaderboard        | [http://localhost:3015/leaderboard](http://localhost:3015/leaderboard)         |
| Wetthistorie       | [http://localhost:3015/history](http://localhost:3015/history)                 |
| VIP Vault          | [http://localhost:3015/vault](http://localhost:3015/vault)                     |

---

### Empfehlungs-Begründung

- **Option 1 (Cyber-Stealth FinTech)** ist die gewählte Option für die direkte Umsetzung: Wandelt das Casino von einer spielhaften Arcade-Optik in ein Daten-zentriertes, professionelles Terminal.
- Maximale Lesbarkeit, 0 störender Kitsch, saubere Monospace-Zahlen, klare Kontraste.
- **Akzent-Pivot (2026-08-09):** Electric Cyan `#00F0FF` → Platinum/Silver `#CBD5E1` (siehe Abschnitt 5).
- **Typography-Pivot (2026-08-09):** system-ui-Override → **Plus Jakarta Sans + JetBrains Mono** via `next/font` (verbindlich, siehe Abschnitt 7; IBM Plex aus Abschnitt 6 verworfen).

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

## 6 — Typography-Pivot: IBM Plex (2026-08-09) — _superseded by §7_

> **Veraltet (2026-08-09):** IBM Plex war ein Zwischenschritt. Nach Jans visueller Evaluation wurde in **Abschnitt 7 verbindlich** auf **Plus Jakarta Sans + JetBrains Mono** gewechselt. Dieser Abschnitt bleibt als Entscheidungstrail erhalten, ist aber **nicht mehr der aktive Standard** — die App-Migration (Kohorten 1–4) migriert **von IBM Plex auf Plus Jakarta Sans**, nicht auf IBM Plex. Alle "Umsetzung"-Angaben unten beschreiben den ehemals geplanten, inzwischen überschriebenen Schritt.

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

---

## 9 — 3D-Wasser-Wellen-Hintergrund (2026-08-09)

Der v2-Hintergrund (Raster + Blobs) wurde als zu langweilig bewertet. Neuer Ansatz: der Hintergrund wirkt wie eine tiefe **3D-Wasseroberfläche** — Maus-Bewegung **erzeugt Wellen**, die sich ausbreiten, interferieren und (absorptiv) abklingen. **Kein** Spotlight/Taschenlampe. Wasser liegt **hinter** dem Frosted-Obsidian-Glas; Inhalt bleibt scharf.

Vollständiger Weltklasse-Plan (Recherche · Entscheidung · Implementationsplan · Self-Audit · Level-Ups · Execution-Audit) — `Executed`, nach `docs/architecture/` archiviert: [`docs/architecture/08_WATER_WAVE_BACKGROUND.md`](../docs/architecture/08_WATER_WAVE_BACKGROUND.md).

**Wiederverwendung (2026-08-09):** Technik als kanonisches Playbook extrahiert ([`_Brain/30_Playbooks/water-ripple-background`](../../../_Brain/30_Playbooks/water-ripple-background.md)) + als testbare React-Komponente ins Projekt ReactLandingpages überführt (Subprojekt [`ReactLandingpages/water-ripple/`](../../../ReactLandingpages/water-ripple/) — 16 Vitest-Tests grün, `tsc`/`vite build` sauber; Plan mit Pitfalls + Two-Perspective-Review). Siehe Abschnitt 8 des 08-Docs.

### Artefakte

| Datei                                           | Rolle                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/architecture/08_WATER_WAVE_BACKGROUND.md` | Weltklasse-Plan + Self-Audit + Execution-Audit (`Executed`)                                                                          |
| `docs/prototypes/water_background_v1.html`      | **Mockup** — Canvas-2D-Hugo-Elias-Heightmap, Maus erzeugt Wellen, 3D-Bump-Look, hinter Frosted-Obsidian (375 Zeilen, self-contained) |

### Technik (Mockup)

- **Höhenfeld-Simulation** (Hugo Elias Wellengleichung): 2 Float32-Puffer, 4-Nachbar-Smoothing + Dämpfung (0.988 → ~5s sichtbar), Maus/Touch/Click injizieren Gauß-Bumps → propagierende Wellen.
- **3D-Look** via Heightmap-Gradient-Bump-Shading + Platinum-Specular auf Kämmen (Palette: Charcoal/Slate/Platinum, kein Neon).
- **Performant:** internes Grid ≤256 (Mobile ≤160) → Offscreen-Canvas → bilineares Upscale; `visibilitychange`-Pause; `prefers-reduced-motion`-Fallback (statischer Wasser-Gradient); Auto-Seed.
- **Layering:** Wasser `z-index:0` (`aria-hidden`, `pointer-events:none`), Glas-Content `z-index:1` scharf.

### Produktion (später, nach visueller Freigabe)

WebGL GPGPU Heightmap als Production-Upgrade (GPU, echte Refraktion/Phong), Canvas-2D als Fallback — siehe `08` §3/§4.7. Mockup gilt als visuelle Referenz.

### Visuelle Freigabe → Jan

Wellen-Optik, Specular-Intensität, Damping-Gefühl, Farbe, "Wasser vs. Plasma"-Wirkung, Mobile-Performance → Jans visuelle QA (No-Visual-Check-Regel).

---

## 10 — Eigenständige Lobby-Testseite `/refactoring` (2026-08-09) · `Executed`

Eigenständige Lobby-Konzeption (**nicht** die aktuelle Variante, **nicht** HomeClientV2) mit hochrelevanten **Three.js 3D-Effekten, GSAP, Frosted-Obsidian-Glassmorphism, hohem Kontrast**. **Ausschließlich die Startseite/Lobby** — keine Games-/MyBets-/Leaderboard-/Vault-Routen. Aufrufbar als isolierte Testseite unter `/refactoring`.

> **No-Visual-Check-Regel (verbindlich, siehe §7):** Claude prüft in dieser Konversation **nichts visuell** — kein Browser, keine Screenshots, keine "sieht gut aus"-Aussagen. Nur objektive/strukturelle Verifikation (Build, `tsc`, `lint`, Datei-/Link-Existenz, CSP-Kompatibilität, Token-Konsistenz). Jede visuelle Freigabe liegt bei Jan.

### 10.1 — Ziel & Scope

| Dimension                  | Festlegung                                                                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope**                  | Ausschließlich **Lobby/Startseite** (Header, Hero, Stat-Strip, Spiele-Grid, Live-Feed). **Keine** `/games/*`-Seiten, keine `/history`, `/leaderboard`, `/vault`, kein Spiel-Canvas, kein Wallet-Mutation-Code. |
| **Ansatz**                 | **Komplett eigenständig** — bewusst **nicht** von `HomeClientV2.tsx` / `option1_1_cyber_stealth_v2.html` inspiriert. Eigene Komposition, eigene 3D-Objekte, eigene Timeline.                                   |
| **Stack**                  | Three.js (3D-Szene) + GSAP (Entrance-Timeline) + Frosted-Obsidian-Glass + hohem Kontrast.                                                                                                                      |
| **Farbschema**             | **Cyber-Stealth Platinum** (§7 verbindlich: Charcoal `#0B0E14`, Platinum `#CBD5E1`, Emerald `#00E676`, Crimson `#FF3366`) — "hoher Kontrast" passt zum verbindlichen Standard; keine neue Palette.             |
| **Abwägung (transparent)** | Layout & 3D-Effekte sind neu/originell; das Farbschema bleibt §7, da ein eigener Ansatz nicht zwingend eine eigene Palette erfordert und §7 verbindlich ist.                                                   |
| **Route**                  | `/refactoring` — Next.js-Route, die das HTML-Prototype in einem fullscreen-iframe bettet.                                                                                                                      |
| **Isolation**              | HTML ist **self-contained** in `public/prototypes/` → kein neuer npm-Dep, kein Bundle-/Build-Risiko für die Live-App.                                                                                          |

### 10.2 — Anforderungen (Requirements)

**Funktional**

- R1 — Lobby-Layout: Header (Brand + Balance), Hero (Eyebrow+Live-Dot, Titel, Sub, 2 CTAs), 4-fach Stat-Strip, Spiele-Grid (6 Karten: Crash/Dice/Roulette/Slots/Blackjack + "Mehr bald"), Live-Feed (≥5 Rows).
- R2 — Three.js-3D-Szene: schwebende niedrig-poly Spielobjekt-Meshes (Icosahedron=Dice, Torus=Roulette-Ring, Box=Karten, Cylinder=Münze/Slot, Dodekaeder-Akzent, Partikel-Würfel) im dunklen Void mit `FogExp2`.
- R3 — Maus-Parallax: Kamera folgt der Maus weich (Lerp 0.05); Objekte rotieren langsam + sanftes Float.
- R4 — GSAP-Entrance-Timeline (nur Core `gsap`, kein ScrollTrigger-Plugin): Header → Hero → Stats → Sec-Labels → Game-Cards (staggered) → Feed.
- R5 — Frosted-Obsidian-Glass auf allen Panels (§7-Standard: `blur(18px) saturate(140%)`, Platinum-Hairline, inset Top-Highlight).
- R6 — Grüner Live-Dot (§7-Standard, pulsierend) auf Hero-Eyebrow + Crash-Karte.
- R7 — Hoher Kontrast: `#f1f5f9` auf `#0b0e14` (Text), Emerald/Crimson als Wert-Signale.
- R8 — Monospace (`JetBrains Mono`) für Balance, Stat-Values, Payouts, Tags, Avatare-Initialen → keine Layout-Flicker (`tabular-nums`).

**Robustheit / Qualität**

- R9 — **WebGL-Fallback:** falls `WebGLRenderer`-Konstruktor wirft → statischer Gradient-Hintergrund + sichtbarer Hinweis-Overlay (kein leeres Schwarzes).
- R10 — **`prefers-reduced-motion`:** kein RAF-Loop (ein statischer Frame), keine GSAP-Timeline (Content direkt sichtbar), Live-Dot-Animation aus.
- R11 — **`visibilitychange`-Pause:** RAF wird bei `document.hidden` gestoppt, beim Wiedereintritt fortgesetzt → keine Hintergrund-CPU.
- R12 — **DPR-Cap:** `Math.min(devicePixelRatio, 1.75)` → keine Over-Render auf HiDPI.
- R13 — **No-JS-Fallback:** `.no-js`-Body-Klasse → `.reveal`-Elemente direkt sichtbar (kein unsichtbarer Content, falls JS deaktiviert).
- R14 — **A11y:** Canvas `aria-hidden="true"` (dekorativ); `:focus-visible` Outline; semantisches HTML (`<header>`, `<section>`, `<a>`, `<h1>/<h2>`); iframe `title`.
- R15 — **CSP-sicher:** Three.js + GSAP **lokal vendored** (kein CDN — Casino-CSP erlaubt kein Script-CDN, siehe `src/proxy.ts`).
- R16 — **Build-Isolation:** Prototype lebt in `public/prototypes/` → geht nicht in den Next.js-Bundle der Live-App; `/refactoring` ist reiner iframe-Wrapper (keine Casino-Store-/Wallet-Abhängigkeit).
- R17 — **Route-Freigabe:** `/refactoring` in `PUBLIC_ROUTES` (`src/proxy.ts`) + `ClientShell` behandelt es als bare Sandbox (kein `MainLayout`-Shell).
- R18 — **Metadaten:** `layout.tsx` (Server-Component) exportiert `metadata` (Title + Description, `robots: noindex`); `page.tsx` (Client-Component) → kein `metadata`-Export möglich.
- R19 — **Tabular-Numerics:** alle Geld-/Multi-Werte `font-variant-numeric: tabular-nums` → keine Spalten-Jitter.

### 10.3 — Abhängigkeiten (Dependencies)

| Abhängigkeit                                 | Typ                     | Quelle                                               | CSP-Relevanz             |
| -------------------------------------------- | ----------------------- | ---------------------------------------------------- | ------------------------ |
| **Three.js r160** (UMD `build/three.min.js`) | Runtime, lokal vendored | `public/prototypes/lib/three.min.js` (669 KB)        | `'self'`-gedeckt (lokal) |
| **GSAP 3.12.5** (Core, `gsap.min.js`)        | Runtime, lokal vendored | `public/prototypes/lib/gsap.min.js` (72 KB)          | `'self'`-gedeckt (lokal) |
| Next.js App Router                           | Build-Route             | `src/app/refactoring/{layout,page}.tsx`              | —                        |
| `src/proxy.ts` `PUBLIC_ROUTES`               | Middleware              | Eintrag `/refactoring(.*)` hinzugefügt               | —                        |
| `src/components/layout/ClientShell.tsx`      | Shell-Bypass            | `isRefactoring`-Branch → bare render                 | —                        |
| Frosted-Obsidian-Token                       | Design-System           | §7-Standard (Inline im Prototype, da self-contained) | —                        |

**Kein** neuer `package.json`-Eintrag. **Kein** CDN. **Kein** externer Font (Prototype nutzt System-Fallback-Stack mit Jakarta-/JetBrains-namen — visuelle Finalisierung der echten Webfonts folgt in der App-Migration, nicht hier).

### 10.4 — Mögliche Probleme / Fehler & Handhabung

| #   | Problem / Fehlerfall                                                          | Wahrscheinlichkeit     | Auswirkung                           | Handhabung (im Prototype umgesetzt)                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------- | ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | WebGL nicht verfügbar (alten Browser, Software-Renderer-Block, Kontext-Limit) | Mittel                 | Schwarzer Bildschirm                 | `try/catch` um `new THREE.WebGLRenderer()` → statischer Gradient `#scene-fallback` + Hinweis-Overlay `#no-webgl` (R9)                                                                        |
| P2  | Three.js/GSAP-Laden schlägt fehl (Pfad, 404)                                  | Niedrig                | `THREE`/`gsap` undefined → JS-Fehler | Lokale, relative Pfade `./lib/*.min.js`; Datei-Existenz strukturell verifiziert (siehe §10.8). IIFE-Wrapper fängt fehlendes `window.gsap` ab (R10-Pfad: direkt sichtbar).                    |
| P3  | HiDPI-Over-Render (4K+ DPR)                                                   | Mittel                 | CPU/GPU-Spike                        | `setPixelRatio(Math.min(dpr, 1.75))` (R12)                                                                                                                                                   |
| P4  | `prefers-reduced-motion` ignoriert                                            | Niedrig                | Motion-Sickness, Barriere            | `matchMedia`-Check → statischer Frame + keine Timeline + Dot-Animation aus (R10)                                                                                                             |
| P5  | RAF läuft weiter im Background-Tab                                            | Hoch (ohne Mitigation) | Akku/CPU-Drain                       | `visibilitychange` → `cancelAnimationFrame`/restart (R11)                                                                                                                                    |
| P6  | iframe blocked by CSP / `X-Frame-Options`                                     | Niedrig                | `/refactoring` leer                  | `X-Frame-Options: SAMEORIGIN` (gleiche Herkunft erlaubt); Prototype wird von gleicher Origin geliefert. Sandbox-Attribut `allow-same-origin allow-scripts` gesetzt.                          |
| P7  | CSP blockt lokale Scripts                                                     | Mittel                 | Three/GSAP laden nicht               | Casino-CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval'` → lokale Scripts erlaubt. Middleware-Matcher schließt `.html` aus → Prototype-HTML bekommt **kein** CSP-Header (noch robuster). |
| P8  | Hydration-Mismatch (`/refactoring` page)                                      | Niedrig                | Console-Warnung                      | `page.tsx` ist pure Client-Component ohne server-gerenderte dynamische Werte; `layout.tsx` (Server) hat statisches `metadata`-Objekt.                                                        |
| P9  | Stale `.next/dev/types` nach Routen-Add                                       | Mittel                 | `tsc`-Fehler zu `LayoutRoutes`       | Cleanup `.next/dev/types` → `tsc` regeneriert → 0 Fehler (siehe §10.8).                                                                                                                      |
| P10 | Content unsichtbar bei deaktiviertem JS                                       | Niedrig                | Leere Lobby                          | `.no-js`-Klasse + `.reveal`-Fallback-Regel → Content sichtbar ohne JS (R13)                                                                                                                  |
| P11 | Z-Index-Konflikt (Canvas vs. Glass)                                           | Niedrig                | Content hinter Canvas                | Canvas `z-index:0` (`pointer-events:none`), Glass `z-index:10` — klare Schichttrennung.                                                                                                      |
| P12 | Mobile-Performance (viele Meshes + RAF)                                       | Mittel                 | Ruckeln                              | DPR-Cap + begrenzte Mesh-Anzahl (6 Haupt-Objekte + 8 Partikel) + `visibilitychange`-Pause. Mobile-Finaltuning → Jans visuelle QA.                                                            |
| P13 | Tastatur-Fokus im iframe verloren                                             | Niedrig                | A11y-Lücke                           | iframe hat `title`; Esc im Parent → zurück zu `/` (Helper, keine echte Trap nötig, da Prototype keine internen Routen hat).                                                                  |
| P14 | `robots` indiziert Testseite                                                  | Niedrig                | SEO-Noise                            | `metadata.robots = { index: false, follow: false }` (R18)                                                                                                                                    |
| P15 | Veraltete Three.js-UMD-Deprecation-Warnung                                    | Niedrig                | Console-Warnung                      | r160-`three.min.js` hat `console.warn`-Prefix (deprecation-Hinweis); funktional unverändert. Production-Migration → ESM-Modul-Pipeline (siehe §10.9).                                        |

### 10.5 — Architektur-Entscheidung (Warum iframe + lokales Vendoring)

**Entscheidung:** Self-contained HTML-Prototype in `public/prototypes/` + Next.js-Route `/refactoring` als iframe-Wrapper. **Nicht** eine React/TS-Komponente mit `import * as THREE from 'three'`.

**Begründung:**

1. **Build-Isolation:** Three.js (669 KB) + GSAP (72 KB) verlassen **nie** den Next.js-Bundle der Live-App → 0 Bundle-/CWV-Risiko für Spieler-Routen.
2. **Kein neuer npm-Dep:** kein Lockfile-Drift, keine Security-Advisory-Pflicht, keine `next.config`-Änderung.
3. **CSP-Sicherheit:** lokale Scripts → Casino-CSP `script-src 'self'` deckt sie ab; kein CDN (verboten). Middleware-Matcher schließt `.html` aus → Prototype sogar ganz ohne CSP-Header.
4. **Iterierbarkeit:** Prototype ist eine einzelne HTML-Datei → Jan kann visuell iterieren, ohne Dev-Server-Rebuilds der Casino-App.
5. **Gleicher Isolations-Präzedenz:** wie `option1_1_cyber_stealth*.html` und `water_background_v1.html` — Prototypes leben in `public/prototypes/` (bzw. `docs/prototypes/`), nie im App-Bundle.

**Trade-off (akzeptiert):** iframe ⟹ keine direkte Casino-Store-/Wallet-Kopplung. Für eine reine Lobby-Mockup-Testseite ist das korrekt (keine echten Wetten, keine echten Salden — alle Werte hardcoded Mock-Daten). Bei späterer App-Migration würde die Lobby als echte React-Komponente mit Store-Binding neu gebaut.

### 10.6 — Adversarielles Review (zwei Perspektiven)

#### Perspektive A — "Skeptischer Frontend-Engineer" (Fokus: Robustheit, Performance, Wartbarkeit)

- **A1 — Memory-Leak-Risiko:** RAF-Loop + Event-Listener (`mousemove`, `resize`, `visibilitychange`) werden bei Page-Unmount **nicht** abgeräumt. → **Akzeptiert für Prototype** (Page-Reload clearingt); bei App-Migration zwingend `useEffect`-Cleanup. Dokumentiert in §10.9.
- **A2 — Partikelanzahl unskaliert auf Mobile:** 8 Partikel-Würfel + 6 Haupt-Meshes sind moderat, aber nicht DPR/Viewport-adaptiv. → **Akzeptiert** (DPR-Cap dämpft); Mobile-Finaltuning → Jan.
- **A3 — `unsafe-eval`-Abhängigkeit der Casino-CSP:** Three.js UMD nutzt evtl. `eval`-ähnliche Pfade? → **Geklärt:** Prototype-HTML bekommt **keinen** CSP-Header (Matcher schließt `.html` aus), also irrelevant. Casino-App selbst braucht `'unsafe-eval'` ohnehin.
- **A4 — Kein echter Loading-State-Fallback im iframe:** wenn Three.js hängt, bleibt "lädt …" stehen. → **Akzeptiert**; `onLoad` setzt `loaded=true`; Timeout bewusst weggelassen (lokale Resource, keine nennenswerte Latenz).
- **A5 — `sandbox` ohne `allow-forms`/`allow-popups-to-escape-sandbox`:** CTAs sind `href="#"`-Anker → keine echte Navigation. → **OK**; `allow-popups` gesetzt, falls später echte Links.
- **A6 — Hardcoded Mock-Daten (Balance, Feed):** täuschen Live-Verhalten vor. → **Beabsichtigt** (Testseite); im iframe gibt es keinen Store-Zugriff. Als "Mock" im Hero-Text und `robots:noindex` deklariert.
- **A7 — `no-js`-Klasse nur entfernt, nicht bei JS-Fehler gesetzt:** wenn die IIFE vor `remove('no-js')` wirft → Content unsichtbar. → **Reihenfolge:** `remove('no-js')` ist erste Anweisung in der IIFE vor jedem Three-Code → Fehler später lässt Content sichtbar (CSS-Fallback greift, da `.no-js .reveal` nur bei `no-js` überschreibt; ohne `.no-js` bleibt `.reveal { opacity:0 }`). → **Risiko erkannt:** bei JS-Fehler bleibt `.reveal` bei `opacity:0`. → **Mitigation (eingebaut):** GSAP-Fehl-Pfad (else-Branch) sowie `no-js`-Entfernung ganz am Anfang; zudem setzt ein eventueller Three-Fehler die GSAP-Timeline nicht außer Kraft (GSAP-Block ist unabhängig vom Three-Block). Verbleibendes Restrisiko: gsap _und_ Three-Fehler gleichzeitig → Content unsichtbar. → **Akzeptiert** (lokale vendored Libs, strukturell verifiziert); dokumentiert.

#### Perspektive B — "Security-/Compliance-Reviewer" (Fokus: Angriffsfläche, Isolation, Prod-Nähe)

- **B1 — iframe-Sandbox-Matrix:** `allow-same-origin allow-scripts allow-popups` → kombinierter Flag erlaubt dem iframe, Same-Origin zu sein **und** Scripts zu laufen. Theoretisch könnte Prototype-Code Parent-DOM lesen. → **Risiko niedrig** (Prototype ist eigene, statische, lokal geladerte Datei — kein User-Input, keine externen Inputs). Bei Bedarf strenger: `allow-scripts` ohne `allow-same-origin` → bricht aber WebGL/Kontext. → **Akzeptiert** mit Begründung; dokumentiert.
- **B2 — Kein User-Input-Vector:** Prototype hat keine Formulare, keine User-Eingaben, keine API-Calls → keine Injection-, XSS-, CSRF-Oberfläche. → **OK.**
- **B3 — `target="_blank"`/Popups:** CTAs sind `href="#"` (keine externe Navigation). → **OK.**
- **B4 — Service-Role-/Supabase-Berührung:** Prototype + `/refactoring`-Route berühren **keine** Wallet-/Supabase-/Service-Role-Logik. → **OK** (entspricht Casino-Sicherheitsregel: Wallet-Autorität nur via `processGameResult`/atomare RPCs — hier irrelevant, keine echten Werte).
- **B5 — PII-Leak:** Live-Feed verwendet erfundene Namen (`_whale.eth`, `cr0nx` …) → keine echten User-Daten. → **OK.**
- **B6 — Dep-Vendoring-Sicherheit:** lokal vendored Three.js/GSAP = fixe Versionen → kein Supply-Chain-Drift, aber auch keine Auto-Patches. → **Akzeptiert** für Prototype; bei App-Migration auf npm + `npm audit` + Renovate wechseln (§10.9).
- **B7 — CSP-Header-Abwesenheit für Prototype-HTML:** Middleware-Matcher schließt `.html` aus → kein CSP-Header auf `/prototypes/lobby_v2_refactoring.html`. → **Akzeptiert** (statische, input-lose Ressource, same-origin, im iframe sandboxed); andernfalls würde `unsafe-inline`-CSP für inline `<script>` nötig. Dokumentiert als bewusste Wahl.
- **B8 — `robots:noindex` korrekt:** verhindert Indexierung der Testseite. → **OK.**

**Konsens beider Perspektiven:** Plan ist für eine **isolierte Testseite** robust genug; die identifizierten Restrisiken (A1 Cleanup, A7 Edge-Fehler, B1 Sandbox-Matrix) sind für den Prototype akzeptiert und in §10.9 als zwingende Voraussetzungen für die App-Migration dokumentiert.

### 10.7 — Self-Audit (Next-Level: was fehlt / Level-Ups)

Eigenes Review des eigenen Plans — nachgelagerte Lücken & Verbesserungen:

| #    | Gefundene Lücke / Level-Up                                                                                                                                                                                                                                                           | Status                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| SA1  | **Lücke:** §10.2 listet A11y, aber **kein** Keyboard-Test des 3D-Canvas. → Klarstellung: Canvas ist `aria-hidden` + `pointer-events:none` → nicht tastbar, kein Tab-Stop. Tastatur bleibt auf Glass-Content (CTAs, Karten).                                                          | Dokumentiert (R14)        |
| SA2  | **Level-Up:** DPR-Cap **1.75** ist willkürlich. → Begründung: handelsüblicher Sweet-Spot zwischen Schärfe und Perf (3+→1.75 dämpft ~40%). Bei Mobile-QA ggf. auf 1.5 senken.                                                                                                         | Offen für Jan             |
| SA3  | **Lücke:** Kein ResizeObserver (nur `window.resize`). iframe-Vollbild → `window.resize` reicht, da iframe viewport-gekoppelt.                                                                                                                                                        | OK (keine Aktion)         |
| SA4  | **Level-Up:** Partikel-Würfel via `Math.random()` platziert → nicht deterministisch (verletzt Casino-Regel "kein `Math.random()` in Spiel-Logik"). → **Geklärt:** Regel gilt für **Spiel-/Wetlogik** (ProvablyFair), nicht dekorative 3D-Platzierung. Prototype hat keine Wettlogik. | Akzeptiert + begründet    |
| SA5  | **Lücke:** `metadata` in `layout.tsx` — ist `/refactoring` eine echte "page" im Next-Sinne mit eigener Layout-Route? → **Ja:** `src/app/refactoring/{layout,page}.tsx` erzeugt eine echte Route; `ClientShell`-Bypass vermeidet MainLayout.                                          | Verifiziert (§10.8)       |
| SA6  | **Level-Up:** Three.js-Deprecation-Warnung (UMD) in Console. → Bei App-Migration ESM-Import + Tree-Shaking.                                                                                                                                                                          | Dokumentiert (P15, §10.9) |
| SA7  | **Lücke:** Keine Verbindung zu §9 (Wasser-Hintergrund). → Bewusst: §10 ist **eigener Ansatz** (Three.js-Objekte), §9 ist Wasser-Heightmap. Beide sind separate Test-Stränge; evt. spätere Kombination → Jans Entscheidung.                                                           | Dokumentiert              |
| SA8  | **Level-Up:** Live-Feed ist statisch. Für Prod-Nähe ein Auto-Rotate/Virtual-Stream denkbar. → Out-of-Scope (Testseite, keine API).                                                                                                                                                   | Dokumentiert              |
| SA9  | **Lücke:** `prefers-reduced-motion`-Ast rendert nur **einen** Frame — aber `mousemove`-Listener bleibt gemountet (wird nie gefeuert, da reduceMotion-Check `start3D` blockt). → **OK**; Listener wird im reduceMotion-Pfad gar nicht erst registriert (Code-Pfad).                   | Verifiziert im Code       |
| SA10 | **Lücke:** Kein Test (Vitest/Playwright) für die Route. → Prototype ist HTML-iframe-Wrapper ohne Geschäftlogik → Unit-Tests nicht sinnvoll; visuelle/Playwright-Tests → Jans QA + spätere App-Migration.                                                                             | Akzeptiert (keine Logik)  |
| SA11 | **Level-Up:** §10 sollte auf §7 (verbindlicher Standard) und §6 (IBM Plex verworfen) verlinken, damit der Entscheidungstrail kohärent bleibt. → Done: §6-Header + §10.1 referenzieren §7.                                                                                            | Erledigt                  |
| SA12 | **Lücke:** Status-Zeile oben erwähnt §10 noch nicht. → Done (Status-Zeile aktualisiert).                                                                                                                                                                                             | Erledigt                  |

### 10.8 — Execution-Audit (strukturell, nicht visuell)

**Gebaut:**

| Datei                                         | Rolle                                                                                                                                                    | Status     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `public/prototypes/lobby_v2_refactoring.html` | Self-contained Lobby-Prototype (Three.js + GSAP + Frosted-Obsidian-Glass)                                                                                | ✓ erstellt |
| `public/prototypes/lib/three.min.js`          | Three.js r160 UMD, lokal vendored (669 KB, `THREE`-Global verifiziert)                                                                                   | ✓ erstellt |
| `public/prototypes/lib/gsap.min.js`           | GSAP 3.12.5 Core, lokal vendored (72 KB, `window.gsap` verifiziert)                                                                                      | ✓ erstellt |
| `src/app/refactoring/layout.tsx`              | Server-Component, exportiert `metadata` (Title/Description, `robots:noindex`)                                                                            | ✓ erstellt |
| `src/app/refactoring/page.tsx`                | Client-Component, fullscreen-iframe-Wrapper (`/prototypes/lobby_v2_refactoring.html`), `sandbox="allow-same-origin allow-scripts allow-popups"`, Esc→`/` | ✓ erstellt |
| `src/proxy.ts`                                | `/refactoring(.*)` zu `PUBLIC_ROUTES` hinzugefügt                                                                                                        | ✓ geändert |
| `src/components/layout/ClientShell.tsx`       | `isRefactoring`-Branch → bare render (kein MainLayout)                                                                                                   | ✓ geändert |

**Strukturelle Verifikation (objektiv, nicht visuell):**

- `npx tsc --noEmit` → **0 Fehler** (nach Cleanup der stale `.next/dev/types`, siehe P9).
- `npx eslint` auf die 4 geänderten/erstellten TS/TSX-Dateien → **0 Fehler, 0 Warnungen** (Repo-weit pre-existing errors unangetastet).
- Datei-Existenz: `public/prototypes/{lobby_v2_refactoring.html, lib/three.min.js, lib/gsap.min.js}` ✓.
- Referenz-Auflösung: HTML referenziert `./lib/three.min.js` + `./lib/gsap.min.js` → resolve zu `public/prototypes/lib/*.min.js` ✓.
- CSP-Kompatibilität: Casino-CSP `script-src 'self' 'unsafe-inline' 'unsafe-eval'` deckt lokale Scripts; Middleware-Matcher schließt `.html` aus → Prototype ohne CSP-Header ✓.
- `X-Frame-Options: SAMEORIGIN` (gleiche Origin) → iframe-Load erlaubt ✓.
- Route-Freigabe: `/refactoring` ∈ `PUBLIC_ROUTES` → kein Auth-Redirect ✓; `ClientShell` bare → kein MainLayout ✓.

### 10.9 — Nächster Schritt & Freigabe

**Visuelle Freigabe → Jan** (No-Visual-Check-Regel): 3D-Objekt-Komposition, Maus-Parallax-Feel, GSAP-Entrance-Rhythmus, Glass-Tiefe/Kontrast, Live-Dot-Wirkung, Mobile-Performance, "eigener Ansatz vs. aktuelle Variante"-Eindruck.

**Falls Jan visuell freigibt → App-Migration** (separater Plan, **nicht** hier): Lobby als echte React-Komponente mit Casino-Store-Binding neu bauen; Three.js/GSAP via npm + ESM + Tree-Shaking; `useEffect`-Cleanup (A1); DPR/Partikel adaptiv (A2, SA2); `npm audit`/Renovate (B6); echte Live-Feed-API (SA8); Vitest für Logik + Playwright für Lobby-Flow (SA10).

**Falls Jan ablehnt** → Ansatz verwerfen oder iterieren; dieser §10 bleibt als Entscheidungstrail erhalten.

---

## 11 — Unabhängige Awwwards-Benchmark-Landingpage: „House of Signal“ (2026-08-14) · `Executed`

> **Status:** `Executed` — eigenständiger Design-Prototype als zusätzliche Testseite gebaut, im Browser auf Desktop und Mobile geprüft, Production-Build und TypeScript erfolgreich verifiziert. **Wichtig:** Dieser Ansatz ist bewusst nicht aus den Cyber-Stealth-, Frosted-Obsidian-, Wasser- oder bestehenden V2-Seiten aus §§1–10 abgeleitet. [Awwwards](https://www.awwwards.com/) wurde ausschließlich als allgemeiner Benchmark für kuratierte, interaktionsorientierte Web-Erlebnisse betrachtet.

### 11.1 — Ziel & eigenständige Designentscheidung

Die neue Seite testet eine vollständig andere visuelle Sprache für Casino Royale:

- **Paper-first statt Dark-first:** warme Papierfläche (`#f4f0e8`) als Grundfläche, dunkle Tinte nur für Hierarchie und eine einzelne Trust-Sektion.
- **Editorial Signal:** übergroße typografische Komposition, asymmetrisches Raster, klare horizontale Ticker-Linie und wenige, bewusste Akzentfarben (Cobalt, Lime, Coral).
- **Mixed Glass:** nur eine transluzente „Room temperature“-Karte mit begrenztem `backdrop-filter`; kein flächendeckendes Glassmorphism-System.
- **Interaction as meaning:** Pointer-Orb, dezentes Tilt-Verhalten, Metric Count-up und scroll-basierter „Commit → Play → Verify“-Storytelling-Fluss.
- **Casino ohne Kitsch:** keine Emojis, keine Neon-Glow-Wolken, keine 3D-Library und kein bestehendes Casino-Layout als visuelle Referenz.

### 11.2 — Vollumfänglicher Implementationsplan

| Bereich                | Umsetzung                                                                                                                             | Qualitätsziel                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Artefakt-Isolation** | Self-contained HTML unter `public/prototypes/awwwards_signal_landing.html`; keine Änderung am Live-Store, Wallet, API oder App-Bundle | Prototype bleibt gefahrlos lösch-/vergleichbar                       |
| **Layout**             | 1440px-Editorial-Raster, mobile Breakpoints bei 900px/560px, Hero → Metrics → Rooms → Proof → Manifesto                               | Hierarchie bleibt auf Desktop und Mobile stabil                      |
| **Visual System**      | Paper/ink foundation, Cobalt/Lime/Coral accents, Hairline borders, ein kontrolliertes Frosted-Panel                                   | Helles Theme mit hohem Kontrast und klarer Markenpersönlichkeit      |
| **Motion**             | CSS ticker, reveal transitions, deterministic metric animation, pointer tilt/orb, IntersectionObserver-Fallback                       | Bewegung unterstützt Orientierung statt Dekoration                   |
| **Storytelling**       | Proof-Sektion mit sticky Visual und drei sichtbaren Zuständen: Commit, Play, Verify                                                   | Fairness wird als Teil der Nutzerreise verständlich                  |
| **Accessibility**      | Skip-Link, semantische H1/H2/H3-Hierarchie, benannte Links, `:focus-visible`, Rollen für Signal-Visuals, `prefers-reduced-motion`     | Tastatur- und reduzierte-Bewegung-Nutzung bleibt vollständig möglich |
| **Performance**        | Keine neuen npm-Abhängigkeiten, keine externen Bilder, keine WebGL-/GSAP-Laufzeit, Pointer-Updates via `requestAnimationFrame`        | Schneller, deterministischer Visual-Prototype                        |
| **Fallbacks**          | IntersectionObserver nicht verfügbar → Inhalte und Metriken sofort sichtbar; reduced motion → keine animierte Bewegung                | Kein leeres oder unsichtbares Layout bei eingeschränkter Runtime     |

### 11.3 — Selbstprüfung aus drei Stakeholder-Perspektiven

| Perspektive                            | Prüf-Fragen                                                                                                                                        | Ergebnis / Entscheidung                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Creative Director / Brand**      | Ist der Ansatz eigenständig? Wirkt das Theme hell, hochwertig und nicht verspielt? Gibt es eine klare visuelle Idee statt einer UI-Sammlung?       | **Bestanden:** Editorial „signal before decision“-Idee, Paper-first-Grundfläche, kontrolliertes Mixed Theme und eigene Komposition.      |
| **B — Frontend-/Performance-Engineer** | Gibt es neue Bundle-Abhängigkeiten? Sind Motion und Fallbacks deterministisch? Kann die Seite auf Mobile ohne horizontales Clipping funktionieren? | **Bestanden:** eine statische Datei, keine neuen Dependencies, Pointer-Raf-Bündelung, Observer-Fallback, Mobile-Smoke ohne `overflow-x`. |
| **C — Accessibility-/Trust-Reviewer**  | Sind CTA, Navigation und Proof-Inhalt verständlich? Was passiert bei Tastatur, reduced motion oder fehlender Observer-API?                         | **Bestanden:** Skip-Link, Fokus-Ringe, klare Linktexte, semantische Signalrollen, reduced-motion-Regel und sofort sichtbarer Fallback.   |

### 11.4 — Self-Audit nach der ersten Implementationsrunde

| Fundstelle                                                                                      | Korrektur / Verstärkung                                                                                    | Status   |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| IntersectionObserver hätte bei älteren Browsern die `.reveal`-Elemente unsichtbar lassen können | Observer-Erkennung ergänzt; ohne Observer werden Reveal-Inhalte und Metriken sofort sichtbar               | Erledigt |
| Pointer-Events hätten bei schneller Mausbewegung unnötig viele Style-Updates erzeugt            | Cursor- und Hintergrundupdates via `requestAnimationFrame` zusammengeführt                                 | Erledigt |
| Dekorative Signalflächen hatten nur `aria-label` auf generischen `div`s                         | `role="img"` für Hero-Stage und Multiplier-Core ergänzt                                                    | Erledigt |
| Die Testseite durfte keine produktive Abhängigkeit vortäuschen                                  | Direkter Static-Prototype ohne Store/API/Wallet-Verbindung; Produktionsmigration ausdrücklich out of scope | Erledigt |
| Motion durfte nicht zum Pflichtbestandteil der Erfahrung werden                                 | `prefers-reduced-motion` deaktiviert Ticker-/Pointer-/Reveal-Animationen                                   | Erledigt |

### 11.5 — Execution-Audit

| Artefakt / Prüfung                               | Ergebnis                                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/prototypes/awwwards_signal_landing.html` | Erstellt, self-contained, 1 HTML-Datei, keine neuen npm-Pakete                                                                                                                        |
| HTTP-Aufruf                                      | `200 OK` auf `http://localhost:3015/prototypes/awwwards_signal_landing.html`                                                                                                          |
| Browser-Desktop                                  | Titel, Hero, Metrics, Rooms, Proof und Manifesto gerendert; Console ohne Fehler/Warnungen                                                                                             |
| Browser-Mobile (390×844)                         | `overflow-x: false`, ein H1, CTA sichtbar, Rooms sichtbar, reduced-motion-Regel vorhanden; Console ohne Fehler/Warnungen                                                              |
| Navigation / Storytelling                        | `Rooms` und `Proof` scrollen korrekt; Proof-Schritte werden beobachtet; Metric-Werte erscheinen als `1.37s`, `100%`, `24/7`                                                           |
| Inline-JavaScript                                | `vm.Script`-Parse erfolgreich                                                                                                                                                         |
| `npx tsc --noEmit --incremental false`           | **0 Fehler**                                                                                                                                                                          |
| `npm run build`                                  | **Erfolgreich**, 29 statische Seiten generiert                                                                                                                                        |
| `npm run lint`                                   | Repo-weiter Lauf bleibt wegen bestehender Fehler in vendorten `public/prototypes/lib/*.js` und vorhandenen App-Dateien rot; keine neue TS/TSX-Datei durch diesen Prototype eingeführt |

### 11.6 — Direkte visuelle Prüf-URL & Übergabe

**Direkte URL:** [http://localhost:3015/prototypes/awwwards_signal_landing.html](http://localhost:3015/prototypes/awwwards_signal_landing.html)

Dev-Server starten:

```bash
npm run dev
```

**Bewusste Grenze:** „House of Signal“ ist ein eigenständiger visueller Spike/Test und noch keine Migration der bestehenden Lobby. Erst wenn die visuelle Richtung freigegeben ist, wäre der nächste separate Plan die Überführung in eine echte React-Seite mit echten Casino-Daten, Navigation, Auth-States und Game-Links.

---

## 12 — Drei neue Landingpage-Richtungen zur Auswahl (2026-08-14) · `Superseded`

> **Korrektur des vorherigen Versuchs:** „House of Signal“ aus §11 wurde als Stilrichtung verworfen. Die drei folgenden Mockups sind neue, bewusst deutlich anders gedachte Spikes. Sie sind keine Produktionsseiten und verwenden keine bestehende Redesign-Seite als Vorlage.

> **Status aktualisiert 2026-08-14:** Die Optionen A/B/C aus diesem Abschnitt wurden auf Wunsch verworfen und die drei zugehörigen HTML-Dateien entfernt. Die gültigen, referenznahen Nachfolger stehen in §13.

### 12.1 — Auswahlmatrix

| Option | Stilrichtung      | Visuelle Idee                                                                                                         | Geeignet, wenn …                                                                  | Trade-off                                                                                        | Direkte HTML-Mockup-URL                                                                                                                      |
| ------ | ----------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **A**  | **Quiet Luxury**  | Warmes Ivory, Graphit, feine Goldlinien, Serifenschrift und eine private-room-artige Bühne. Sehr wenig Glassmorphism. | das Casino ruhig, hochwertig und erwachsen wirken soll.                           | Weniger „digital“ und weniger datenintensiv; Spielspannung muss über Content und Motion kommen.  | [http://localhost:3015/prototypes/landing_option_a_quiet_luxury.html](http://localhost:3015/prototypes/landing_option_a_quiet_luxury.html)   |
| **B**  | **Pearl Glass**   | Helles Mint-/Pearl-Grunddesign, milchige Glasflächen, Aqua-/Cobalt-Akzente und weiche Live-Datenkarten.               | ein helles Mixed Theme mit Atmosphäre und sichtbarem Glassmorphism gewünscht ist. | Kann bei zu vielen transparenten Flächen wieder zu „soft“ oder verspielt werden.                 | [http://localhost:3015/prototypes/landing_option_b_pearl_glass.html](http://localhost:3015/prototypes/landing_option_b_pearl_glass.html)     |
| **C**  | **Cobalt Studio** | Weißes Canvas, Navy, Cobalt-Blau, klare Live-Board-Grafik und strikt strukturierte Karten.                            | Professionalität, Kontrast und Nutzbarkeit wichtiger sind als Club-/Luxusgefühl.  | Weniger emotional und weniger einzigartig als A oder B; näher an einem Premium-Produktinterface. | [http://localhost:3015/prototypes/landing_option_c_cobalt_studio.html](http://localhost:3015/prototypes/landing_option_c_cobalt_studio.html) |

### 12.2 — Erstellte Mockup-Dateien

| Datei                                                   | Status   | Enthält                                                                      |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `public/prototypes/landing_option_a_quiet_luxury.html`  | Erstellt | Hero, Private-Room-Visual, Chip, Rooms-Liste, responsive Layout              |
| `public/prototypes/landing_option_b_pearl_glass.html`   | Erstellt | Pearl-Glass-Hero, Live-Pulse, Sparkline-Karte, Room-Cards, responsive Layout |
| `public/prototypes/landing_option_c_cobalt_studio.html` | Erstellt | Live-Board, Graph, KPI-Bar, asymmetrisches Room-Grid, responsive Layout      |

### 12.3 — Gemeinsame Qualitätsgrenzen der drei Spikes

- Kein Dark-Theme als Grundfläche.
- Keine neuen npm-Abhängigkeiten, keine Store-/Wallet-/API-Anbindung.
- Direkte Game-Links sind nur visuelle Platzhalter für die bestehende App.
- `prefers-reduced-motion` ist in allen drei Mockups berücksichtigt.
- Alle drei Varianten wurden auf Desktop und 390×844 Mobile ohne horizontales Overflow geprüft.

### 12.4 — Nächster Entscheidungs-Check

Die drei Seiten sollten mit identischen Fragen verglichen werden:

1. Welche Variante fühlt sich am wenigsten verspielt und trotzdem nach Casino an?
2. Welche Variante funktioniert für Lobby, Games, History und Leaderboard als gemeinsames System?
3. Welche Variante bleibt auf Mobile klar, ohne ihren Charakter zu verlieren?

Erst nach der Auswahl einer Richtung folgt ein eigener Produktionsplan für Tokens, echte React-Komponenten und die Migration der bestehenden Seiten.

---

## 13 — Referenznahe Casino-Dashboard-Mockups (2026-08-14) · `Option 1 selected / Option 2 removed`

> **Ziel:** Die drei gelieferten Referenzen wurden auf ihre gemeinsame visuelle Sprache reduziert: dunkle Navy-/Teal-Grundflächen, farbintensive Purple-/Blue-Flächen, neonartige Akzente, linke Dashboard-Navigation, starke Hero-Bühne und große illustrative Karten. Die Umsetzung bleibt eigenständig: eigene Texte, eigene CSS-Visuals, keine kopierten Dribbble-Assets und keine Produktionsanbindung.

> **Status aktualisiert:** Option 2 / Night Crest wurde auf Wunsch entfernt. Option 1 / Neon Arcade wird als aktive Richtung optimiert; Option 3 / Bet Circuit bleibt als Vergleichsrichtung erhalten.

### 13.1 — Analyse der drei Referenzrichtungen

| Referenz                  | Beobachtete Leitidee                                                                                     | Übertragene Struktur                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| JACKPOP / Crypto Casino   | Maximale Energie, Purple-/Cyan-Umgebung, Lime-CTA, 3D-Charakter-/Coin-Anmutung, drei breite Promo-Karten | Neon Arcade: kompakte Casino-Sidebar, große zweifarbige Hero-Bühne, CSS-Mascot/Burst/Coin-Art und drei farbige Kampagnenkarten |
| Ninja Blaze / Casino      | Fantasy-Spielwelt, tiefe Blue-/Violet-Flächen, große Featured Games, Community-Chat                      | Night Crest: Hero mit Mond-/Turm-Szene, 2 Featured Games, 3 kommende Spiele und rechte Live-Lounge                             |
| EarnBet / Casino Redesign | Finanz-/Rewards-Anmutung, Teal-Grundfläche, Roulette-/Wheel-Visual, VIP-Status, klare Bonus-Cards        | Bet Circuit: Level-/VIP-Hero, CSS-Roulette-Wheel, Feature-Bullets, Lime-CTA und drei Rewards-/Cashback-Karten                  |

### 13.2 — Neue Testseiten

| Option | Stilrichtung    | Kurze Beschreibung                                                                                                                                     | Direkte URL                                                                                                                                  |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Neon Arcade** | Energetische JACKPOP-nahe Casino-Lobby mit Sidebar, „Play loud. Win brighter.“-Hero, abstrakter CSS-Mascot-Szene und drei farbigen Promo-Karten.       | [http://localhost:3015/prototypes/reference_option_1_neon_arcade.html](http://localhost:3015/prototypes/reference_option_1_neon_arcade.html) |
| **3**  | **Bet Circuit** | Rewards-/Trading-inspirierte Lobby mit „Zero waiting. All action.“-Hero, CSS-Roulette-Wheel, VIP-Levelkarte, Feature-Bullets und drei Kampagnenkarten. | [http://localhost:3015/prototypes/reference_option_3_bet_circuit.html](http://localhost:3015/prototypes/reference_option_3_bet_circuit.html) |

**Entfernt:** `public/prototypes/reference_option_2_night_crest.html` · Status: verworfen.

### 13.3 — Gemeinsame Umsetzungsgrenzen

| Bereich           | Entscheidung                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Artefakt**      | Zwei verbleibende self-contained HTML-Dateien unter `public/prototypes/`; keine Änderung an Store, Wallet, API oder App-Bundle           |
| **Visuals**       | CSS-only Shapes, Gradients und Typografie; keine externen Bilder, Fonts oder neuen npm-Abhängigkeiten                                    |
| **Interaction**   | Kleine lokale Nav-State-Interaktion; Chat-Eingabe bleibt bewusst ein nicht-sendendes Mockup                                              |
| **Responsive**    | Desktop-Dashboard mit kompakter Sidebar; bei 390×844 wird die Sidebar ausgeblendet und die Karten werden in ein mobiles Raster überführt |
| **Accessibility** | Ein H1 je Seite, benannte Buttons/Input, `:focus`-fähige native Controls und `prefers-reduced-motion`                                    |

### 13.4 — Prüfung aus drei Perspektiven

| Perspektive                            | Prüffrage                                                                                           | Ergebnis                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **A — Creative Director**              | Sind die Varianten klar näher an den Referenzen und trotzdem eigenständig?                          | **Bestanden:** drei unterschiedliche Schwerpunkte, aber gemeinsame Referenzsprache; keine kopierten Assets/Texte.                   |
| **B — Frontend-/Performance-Engineer** | Sind die Testseiten isoliert, deterministisch und ohne neue Abhängigkeiten?                         | **Bestanden:** statische HTML-Spikes, keine Netzwerk-Assets, keine Runtime-Dependencies, keine neuen TS/TSX-Dateien.                |
| **C — Accessibility-/Trust-Reviewer**  | Bleibt die Struktur auf Mobile verständlich und wird kein echter Casino-/Wallet-State vorgetäuscht? | **Bestanden:** klare Demo-Texte, kein Store/API-Call, Mobile ohne horizontales Overflow, Chat und CTA bleiben als Mockup erkennbar. |

### 13.5 — Execution-Audit

| Prüfung                    | Ergebnis                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Veraltete A/B/C-Dateien    | Entfernt: `landing_option_a_quiet_luxury.html`, `landing_option_b_pearl_glass.html`, `landing_option_c_cobalt_studio.html`                                                                 |
| HTTP-Erreichbarkeit        | Option 1 und Option 3 liefern `200 OK`; Option 2 ist absichtlich entfernt                                                                                                                  |
| Browser-Desktop            | Option 1 final bei 1280×720 geprüft; 1 H1, sichtbarer Hero, keine Console-Fehler/Warnungen, kein horizontales Overflow                                                                     |
| Browser-Mobile             | Option 1 final bei 390×844 geprüft; 1 H1, Hero-Karte innerhalb des Viewports, Sidebar ausgeblendet, drei Karten lesbar, keine Console-Fehler/Warnungen                                     |
| Visuelle Kontrolle         | Option 1 vor der Überarbeitung sowie nach Runde 1 und Runde 2 als gerenderte Desktop-/Mobile-Ansicht kontrolliert                                                                          |
| Inline-HTML-Parse / Diff   | Beide verbleibenden HTML-Scripts per `vm.Script` geparst; `git diff --check` ohne Whitespace-Fehler                                                                                        |
| TypeScript-/Build-Baseline | Ausgeführt, aber bestehender Importfehler auf die nicht vorhandene `src/components/auth/auth-validation` blockiert beide Läufe; keine betroffene `src`-Datei durch diese Aufgabe verändert |
| Scope                      | Option 2 entfernt, Option 1 optimiert, Option 3 unverändert; Produktionsmigration bleibt ein späterer, separater Schritt                                                                   |

---

## 14 — Neon Arcade Optimierungsdurchlauf (2026-08-14) · `Executed`

> **Arbeitsplan:** [Neon Arcade Visual Optimization Plan](../docs/superpowers/plans/2026-08-14-neon-arcade-optimization.md)

### 14.1 — Signifikanz- und Umsetzungsstatus

| Runde           | Umfang                                                                                                                            | Ergebnis                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Ausgangsanalyse | 15 Optimierungshebel nach Signifikanz bewertet                                                                                    | Abgeschlossen; Top 10 für Runde 1 ausgewählt     |
| Runde 1         | Colorway, Hero-Art, Typografie, Kartenmotive, Layout-Rhythmus, Canvas-Tiefe, Branding, Shape-System, Interactions, Utility-Header | Umgesetzt und per Desktop-/Mobile-Render geprüft |
| Self-Review     | 10 weitere Potenziale aus Creative-, Frontend- und Accessibility-Perspektive bewertet                                             | Abgeschlossen; Top 7 für Runde 2 ausgewählt      |
| Runde 2         | Mobile-Crop, Mini-Artefakte, Copy/Status, Motion, Kontrast/Fokus, kompakte Shell, Materialität                                    | Umgesetzt und abschließend verifiziert           |

### 14.2 — Finale Option-1-URL

[http://localhost:3015/prototypes/reference_option_1_neon_arcade.html](http://localhost:3015/prototypes/reference_option_1_neon_arcade.html)

---

## 15 — Neon Arcade Dashboard-Komponente (2026-08-14) · `Executed / Isolated Test Page`

> **Scope-Korrektur:** Die ausgewählte Richtung wurde bewusst **nicht** auf die produktive Startseite `/` übertragen. Sie lebt als eigenständige React-Testkomponente unter `/testing/neon-arcade-dashboard`; `src/app/page.tsx` und das produktive `ClientShell` blieben unverändert.

> **Design-Spezifikation:** [Neon Arcade Dashboard Design Specification](../docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-design.md) · **Implementationsplan:** [Neon Arcade Dashboard Implementation Plan](../docs/superpowers/plans/2026-08-14-neon-arcade-dashboard.md)

### 15.1 — Direkte URL

[http://localhost:3015/testing/neon-arcade-dashboard](http://localhost:3015/testing/neon-arcade-dashboard)

### 15.2 — Gemeinsame Entscheidung aus drei Stakeholder-Perspektiven

| Perspektive                      | Priorität                                                               | Umgesetzter gemeinsamer Nenner                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Player / Product                 | Spielauswahl, Status und Live-Aktivität sofort verständlich             | Hero mit zwei klaren CTAs, fünf echte Game-Ziele, Session-Pulse, Live Floor und Community Run                                                          |
| Creative / Brand                 | Classy-playful ohne grelle Dauer-Neons                                  | Petrol-/Ink-Basis, gedämpftes Lime nur für primäre Aktionen, Terrakotta/Aubergine/Teal als kontrollierte Visual-Akzente                                |
| Frontend / Accessibility / Trust | Isolation, reale Daten, verständliche Zustände und mobile Bedienbarkeit | `/testing/*`-Standalone-Shell, Zustand-Store/API-Anbindung, semantische Navigation, benannte Controls, Escape-Drawer, Fokus- und Reduced-Motion-Regeln |

### 15.3 — Implementierte Artefakte

| Datei                                                           | Verantwortung                                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/app/testing/neon-arcade-dashboard/page.tsx`                | Isolierter Next.js-Testseiten-Entry und Metadata                                   |
| `src/components/home/NeonArcadeDashboard.tsx`                   | Casino-Store/Auth-Anbindung sowie lokaler Filter-, Drawer- und Balance-State       |
| `src/components/home/NeonArcadeDashboardView.tsx`               | Testbare Dashboard-View mit Sidebar, Topbar, Hero, Game Floor und Insights         |
| `src/components/home/NeonArcadeDashboard.module.css`            | Tokens, Responsive Shell, Kontrastrollen und CSS-/SVG-Visualisierungen             |
| `src/components/home/neon-arcade-dashboard-model.ts`            | Fünf Game-Konfigurationen, robuste Kennzahlenableitung und Money-Formatierung      |
| `src/components/home/__tests__/neon-arcade-dashboard-*.test.ts` | Modell- und Renderverträge für Daten, Navigation, Filter, Drawer und Balance-Maske |

### 15.4 — Relevante Visualisierungen

- Crash Atelier: eigene SVG-Trajektorie mit Live-Multiplikator.
- Royale Roulette: CSS-Rad mit Segmenten, Track, Hub und Kugel.
- Velvet Blackjack: gestaffelter Kartenfächer mit Dealer-Signal.
- Dice Studio: Wahrscheinlichkeitsverteilung plus modelliertes Würfelpaar.
- Afterglow 777: dreispaltiges Reel-Fenster mit Payline und Progressive-Pool.
- Session- und Community-Bereich: Activity-Bars, Rank-Fortschritt, Live-Win-Tabelle und radialer Community-Fortschritt.

### 15.5 — Execution- und Self-Review-Audit

| Gate                | Evidenz / Ergebnis                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| TDD RED             | View-Test schlug erwartungsgemäß fehl, solange `NeonArcadeDashboardView` noch nicht existierte                        |
| TDD GREEN           | 3 Testdateien, 23 Tests bestanden                                                                                     |
| Gezieltes ESLint    | Ohne Befund                                                                                                           |
| TypeScript          | `npx tsc --noEmit --incremental false` bestanden                                                                      |
| Production Build    | `npm run build` bestanden; Route `/testing/neon-arcade-dashboard` im Build-Manifest enthalten                         |
| Desktop 1280×720    | Eigenständige Sidebar/Topbar, Hero/Floor Pulse, kein altes Gold-/Foto-Design und kein horizontales Overflow           |
| Tablet 1024×768     | Kompakte zweispaltige Bühne und sichtbarer Beginn des Game Floors, kein horizontales Overflow                         |
| Mobile 390×844      | Einspaltige Komposition, geschlossener Drawer, alle fünf Spielkarten und Insights geprüft, kein horizontales Overflow |
| Interaktionen       | Featured/Fast/Table/All, Drawer öffnen/schließen, Escape-Key und Balance-Maske geprüft                                |
| Kontrast-Stichprobe | Warm Ink/Canvas 16.49:1, Muted/Surface 6.69:1, CTA-Text/Lime 10.99:1, Terrakotta/Surface 4.95:1                       |
| Browser-Konsole     | Keine Errors oder Warnings                                                                                            |
| Self-Review-Fix     | Mobile Account-Block vom Next.js-Entwicklungsindikator weggerückt; anschließend erneut visuell geprüft                |
| Produktionsschutz   | `/` rendert weiterhin `HomeClientV2`; `ClientShell` weist keinen Dashboard-Diff auf                                   |

---

## 16 — Neon Arcade Dashboard Optimization Pass 2 (2026-08-14) · `Executed`

> **Auslöser:** Der erste React-Pass war funktional, wirkte aber zu statisch und zu stark wie ein gleichförmiges Bento-Dashboard. Besonders European Table und Private Table waren visuell zu abstrakt; Lime-Aktionen wurden durch eine CSS-Kaskadenkollision teilweise mit weißem Text gerendert.

> **Design-Spezifikation:** [Optimization Design Specification](../docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-optimization-design.md) · **Implementationsplan:** [Optimization Implementation Plan](../docs/superpowers/plans/2026-08-14-neon-arcade-dashboard-optimization.md)

### 16.1 — Direkte URL

[http://localhost:3015/testing/neon-arcade-dashboard](http://localhost:3015/testing/neon-arcade-dashboard)

### 16.2 — Umgesetzte Top 8

| Rang | Optimierungshebel                     | Signifikanz | Resultat                                                                                 |
| ---- | ------------------------------------- | ----------: | ---------------------------------------------------------------------------------------- |
| 1    | CSS-Kaskade und Control-Kontrast      |       10/10 | Scoped Selektoren; dunkler Text auf allen Lime-Aktionen, gemessen mit mindestens 12,66:1 |
| 2    | European Table als vollständige Szene |        9/10 | Top-down-Wheel, Ballbahn, Zero-Segment und Betting Board statt Mini-Rad                  |
| 3    | Private Table als vollständige Szene  |        9/10 | Halbrundes Felt, Dealer-/Player-Zonen, Hände, Scores und Chipstack statt Kartenfächer    |
| 4    | Bento-Grid zur Game Runway            |       10/10 | Ein großes aktives Spotlight plus interaktiver Room Index ohne tote Rasterfläche         |
| 5    | Reichere semantische Farbwelt         |        9/10 | Spruce/Teal/Ivory mit Lime, Coral, Saffron und Iris statt fahler Einfarbigkeit           |
| 6    | Bedeutungsvolle Motion                |        8/10 | Chart Draw, Ball Orbit, Card Deal und Spotlight Entry mit Reduced-Motion-Fallback        |
| 7    | Editorialere Typografie               |        8/10 | Kompakterer Hero, stärkere Größenkontraste und klarere Meta-Hierarchie                   |
| 8    | Material und Tiefe                    |        8/10 | Felt, Hairlines, Tischkanten und gerichtete Flächen statt uniformer Bento-Karten         |

### 16.3 — Bewusst zurückgestellt

| Hebel                           | Grund                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Vollständiger Sidebar-IA-Umbau  | Kein direkter Hebel gegen die aktuelle Hauptkritik; bestehende Navigation bleibt funktional und verständlich |
| Neue Datenstruktur für Insights | Würde Produkt-/Daten-Scope erweitern, ohne die zentrale Game-Floor-Wirkung proportional zu verbessern        |

### 16.4 — Execution- und Self-Review-Audit

| Gate                        | Ergebnis                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tests                       | 2 gezielte Testdateien, 12/12 Tests bestanden                                                                                              |
| ESLint / TypeScript / Build | Alle bestanden; `/testing/neon-arcade-dashboard` im Next.js-Build-Manifest                                                                 |
| Desktop / Tablet / Mobile   | 1280×720, 1024×768 und 390×844 visuell geprüft; jeweils kein horizontaler Seitenüberlauf                                                   |
| Interaktionen               | Featured/Fast rounds/Table/All und alle Room-Selectoren halten den aktiven Zustand konsistent                                              |
| Kontrast                    | Active Nav 12,66:1; Sign-in 12,68:1; Primary CTA 12,68:1; aktiver Filter 12,70:1                                                           |
| Reduced Motion              | Laufende CSSOM-Regeln deaktivieren neue Animationen, Hover-Transforms und Übergänge                                                        |
| Browser-Konsole             | Keine Errors oder Warnings                                                                                                                 |
| Self-Review-Fixes           | Blackjack-Regelnotiz vom Player-Label entkoppelt; Roulette-Ballradius responsive gemacht; nativer Tablet-/Mobile-Scrollbalken ausgeblendet |
| Scope                       | Ausschließlich isolierte Testseite, Dashboard-Komponenten, Tests und Dokumentation; produktive Startseite und `ClientShell` unverändert    |
