# 04 — Mobile Performance & Layout-Fixes V2 (Kategorie 10)

> **Status:** Executed & archiviert — visuelle Abnahme durch Jan 2026-08-23 („passt alles", inkl. mobilem Menü-Fix §6.3.1) · **Stand:** 2026-08-23 · **Owner:** LLM (Jan = visuelle Abnahme) · **Scope:** ausschließlich mobile Layout-/Abstands-/Overlap-Fixes (≤768px, Fokus 375px) — Desktop bleibt unangetastet
> **Projekt:** Casino / Next.js 16.3 / React 19 / Supabase
> **Bezug:** Vorgänger [`04_MOBILE_PERFORMANCE.md`](./04_MOBILE_PERFORMANCE.md) (V1, L0–L4 🟢, L5 Jan-Abnahme offen — Abnahme ergab: Layout/Abstände/Overlaps auf Mobile stimmen noch nicht), [`00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md) (Kat. 10), [`05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md)
> **Gewählte Richtung:** V2-Vertiefung der V1-Richtung (Option 1) — gleiche Fix-Klassen, aber 5× Tiefe: pro Problemstelle konkrete Datei/Zeile, Fix-Spec, Regressionsschutz, Verifikationsmatrix. Kein neues Option-Gate (Richtung已在 V1 freigegeben).
> **Money-Pfad:** Nein · **Security-Review:** Nein (nur CSS/Inline-Style, kein Auth/Wallet/RNG/Settlement) · **Migrationen:** 0 · **Server-/Settlement-Eingriff:** keiner
> **Desktop-Schutz (harte Regel):** Kein Fix darf das Desktop-Rendering (≥1024px, zumindest ≥769px) verändern. Jeder Fix ist mobile-gated (`isMobile`-Ternary oder `@media (max-width:768px)`). Breakpoint-Vereinheitlichung ist explizit **Non-Scope** (würde Desktop an der 1024px-Grenze ändern).

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| L0 | V2-Plan & Ist-Analyse (5× Tiefe, Problem-Inventar mit Zeilen) | 🟢 Executed | — | LLM |
| L1 | Responsive-Foundation (sicher): Container-Padding-Token + Header-Button-Crowding-Opt-out | 🟢 Executed | — | LLM |
| L2 | `VipLiveStreamRail` mobile gate (Toggle-Pill + Drawer) | 🟢 Executed | — | LLM |
| L3 | `LiveHighrollerTickerBar` Truncation (Center-Ticker) | 🟢 Executed | — | LLM |
| L4 | `HeroCinematicShowcase` trust pill + bonus bar | 🟢 Executed | — | LLM |
| L5 | `ProgressiveJackpotSection` stat overflow + container padding | 🟢 Executed | — | LLM |
| L6 | `MainLayout` wallet-chip truncation + `HighrollerWinDetailModal` z-index | 🟢 Executed | — | LLM |
| L7 | Roulette: wheel scaling + board min-width (420px/880px) | 🟢 Executed | — | LLM |
| L8 | Slots: paytable responsive + reel frame scaling | 🟢 Executed | — | LLM |
| L9 | Crash: live-bets panel overlap + milestone flash | 🟢 Executed | — | LLM |
| L10 | Blackjack: win banner + split hands | 🟢 Executed | — | LLM |
| L11 | Dice: HUD stack + slider tooltip | 🟢 Executed | — | LLM |
| L12 | Verifikation: lint/typecheck/test/build + programmatische Overflow-Detection | 🟢 Executed | — | LLM |
| L13 | Doku-Update + Übergabe (Test-URLs + Prüfpunkte) an Jan | 🟢 Executed | visuelle Abnahme bei Jan | LLM |

- Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.
- **Keine visuelle Selbstbewertung durch Claude** (Memory `no-visual-check-frontend`). L12 nutzt ausschließlich programmatische Messung (`scrollWidth`/`clientWidth`/`getBoundingClientRect`) — keine Screenshots, keine ästhetische Bewertung. Die „passt"-Abnahme bleibt bei Jan (L-Handover).
- Jan-Aufwand: ausschließlich die visuelle Abnahme der finalen URLs (kein Code, keine Entscheidung in dieser V2).

---

## 2 — Ist-Analyse (live auditiert 2026-08-23, Code-Ebene mit Zeilen)

### 2.1 Querschnitt-Foundation (alle Dateien betreffend)

| # | Befund | Datei:Zeile | Severity | Mobile-Betroffenheit |
| :--- | :--- | :--- | :--- | :--- |
| F1 | Breakpoint-Mismatch: JS `isMobile < 1024` vs CSS `.mobile-only @ 768px` → Tablet-Band 769–1023px hat weder Desktop-Chips noch Bottom-Nav | `MainLayout.tsx:328` / `globals.css:343` | HIGH (aber Desktop-Risiko) | Tablet-Band |
| F2 | Globale `button,a,input,select { min-height:44px }` @768px zwingt kleine Header-Icon-Buttons auf 44px → überfüllt 64px Mobile-Header | `globals.css:2338-2344` | MEDIUM | Header |
| F3 | `.btn { min-height:48px; padding:12px 24px }` @768px zwingt alle `.btn` auf 48px | `globals.css:642-647` | MEDIUM | Header/Buttons |
| F4 | Home-Container `padding: 0 24px` nicht auf mobile reduziert → 48px horiz. Padding auf 375px (12,8%) | `HomeClientV2.tsx:84-87` | MEDIUM | Homepage-Breite |
| F5 | `body { overflow-x: hidden }` @768px maskiert Overflow als stummes Clipping statt sichtbaren Scroll | `globals.css:2331` | Debug-Hazard | alle |

**F1 wird NICHT behoben** (Non-Scope, Desktop-Schutz). F2/F3 werden durch scoping (Opt-out für Header-Icon-Buttons) statt globale Änderung gelöst. F4/F5 werden kontextuell in den Komponenten-Fixes berücksichtigt.

### 2.2 Homepage

| # | Befund | Datei:Zeile | Severity | Fix-Klasse |
| :--- | :--- | :--- | :--- | :--- |
| H1 | `VipLiveStreamRail` hat kein `isMobile`/`matchMedia` — Toggle-Pill `position:fixed; right:0; top:45%` (z45) + Drawer `width:300px` (z48) schweben permanent auf 375px, überlappen Header (z40) | `VipLiveStreamRail.tsx:106-368` | **HIGH (schlimmster Offender)** | mobile gate / width |
| H2 | `LiveHighrollerTickerBar` Center-Ticker: nowrap-Row aus 5 Spans in `flex:1; overflow:hidden`, kein `min-width:0`/ellipsis → Multiplikator wird stumm geclippt | `LiveHighrollerTickerBar.tsx:149-211` | HIGH | truncation |
| H3 | `HeroCinematicShowcase` Trust-Pill: `inline-flex; flexWrap:nowrap` mit `flexShrink:0`-Chips → überflißt 100% width, von `overflow:hidden` geclippt | `HeroCinematicShowcase.tsx:476-598` | HIGH | wrap / scroll |
| H4 | `HeroCinematicShowcase` Bonus-Claim-Bar: `justify-content:space-between` + `whiteSpace:nowrap`-Button + Code-Chip + 12px gap → crowd auf 375px | `HeroCinematicShowcase.tsx:342-445` | MEDIUM | stack mobile |
| H5 | `ProgressiveJackpotSection` 2-col Stat-Grid: lange Mono-Werte (`$14,280,450+`) in ~163px Zellen, kein overflow-handling → overflow | `ProgressiveJackpotSection.tsx:130-193` | HIGH | ellipsis / font |
| H6 | `MainLayout` Wallet-Chip: unbounded Mono-Balance-String ohne Truncation im 64px Header | `MainLayout.tsx:952-993` | MEDIUM | balance ellipsis |
| H7 | `HighrollerWinDetailModal` z-index 250 < `MobileNav` 1000 → Bottom-Nav überm Modal | `HighrollerWinDetailModal.tsx:63-71` | MEDIUM | z>1000 |
| H8 | `LiveHighrollerTickerBar`/`InteractiveArcadeGrid` Container `padding:0 24px` nicht mobile-reduziert | `LiveHighrollerTickerBar.tsx:100-107`, `InteractiveArcadeGrid.tsx:99-103` | MEDIUM | padding 16px |

### 2.3 Game-Pages

| # | Befund | Datei:Zeile | Severity | Fix-Klasse |
| :--- | :--- | :--- | :--- | :--- |
| G1 | **Roulette:** 420px FIXED wheel (`width:size,height:size`) überfließt 375px horizontal | `RouletteClient.tsx:300,415-435` | **CRITICAL** | `min(420px,92vw)` |
| G2 | **Roulette:** Board `minWidth:880px` (numbers/dozens/outside) erzwingt horiz. Scroll, 12-col numbers-grid unlesbar auf 375px | `RouletteClient.tsx:1920-2103` | **CRITICAL** | scroll-snap / compact |
| G3 | **Slots:** Paytable `gridTemplateColumns:105px 1fr 1fr 1fr` (fix) → 3 Mono-Dollar-Spalten zu ~70px auf 375px, cramping | `slots/page.tsx:1537-1573` | HIGH | 2-col / scroll |
| G4 | **Slots:** 5-reel frame `repeat(5,1fr)` → ~65px/reel zu eng für 80px SlotSymbol-Images | `slots/page.tsx:1352-1362` | HIGH | symbolSize mobile |
| G5 | **Crash:** Live-Bets-Panel `position:absolute; top:16; right:16; width:150px` (z15) überlappt zentralen Multiplikator auf 360px canvas | `crash/page.tsx:2423-2440` | MEDIUM-HIGH | panel resize/move |
| G6 | **Crash:** Milestone-Flash `whiteSpace:nowrap` centered → horiz. overflow auf 375px | `crash/page.tsx:2478-2499` | MEDIUM | truncate |
| G7 | **Blackjack:** Win-Banner `position:absolute; top:-45px` + `nowrap` + lange Auszahlungstexte → clip unter `overflow:hidden` | `BlackjackTable.tsx:139-170` | MEDIUM-HIGH | truncate |
| G8 | **Blackjack:** 2 split hands `gap:24px` + 32px card stagger → können 375px übersteigen bei 3+ Karten/Hand | `BlackjackTable.tsx:230-247`, `CardHand.tsx:141-167` | MEDIUM | stagger scale |
| G9 | **Dice:** HUD 3-col→1-col stack macht mobile sehr groß; slider tooltip `top:-42px` nowrap clippt an Kanten | `dice/page.tsx:1408-1418,1330-1366` | MEDIUM | HUD 2-col + truncate |

**Nicht betroffen (fluid, kein Fix nötig):** `AutoBetDrawer`, `GameStatsPanel`, `GameActionButton`, `BetInputGroup`, `BetModeTabs`, `BetModeTabs`, `SlotSymbol`/`V2` (isoliert), `Chip`, `InteractiveArcadeGrid` (nur padding H8), `DailyTournamentTeaser`, `VipProgressTeaser`.

---

## 3 — Meilenstein-Details (Fix-Specs mit Datei/Zeile/Fix)

### L0 — V2-Plan & Ist-Analyse
- **Ziel:** Problem-Inventar mit Zeilennummern, Fix-Klassen und Severity; Plan execution-ready.
- **Scope:** Diese Datei (§2 Inventar, §3 Specs).
- **Abhängigkeiten:** V1-Abnahme (Jans Feedback: Layout/Abstände/Overlaps).
- **Freigabe-Gate:** Jan /goal 2026-08-23 (V2 5× Tiefe, Desktop unangetastet, visuelle Abnahme bei Jan).
- **Verifizierung:** Datei existiert, Status `Execution-Ready`, alle 9 Probleme mit Spec.
- **Nicht-Scope:** Code-Edits (folgen ab L1).

### L1 — Responsive-Foundation (sicher, desktop-schonend)
- **Ziel:** Mobile-Container-Padding-Token nutzbar machen; Header-Icon-Buttons aus globaler 44/48px min-height opt-outen — OHNE globale Breakpoint-Verschiebung.
- **Scope:**
  - `globals.css`: `--container-padding` auf `16px` @768px bereits gesetzt (L105-109) — wird von Home-Komponenten nicht genutzt. Keine globale Änderung; stattdessen greifen L4/L5/L8 pro Komponente.
  - `globals.css:2338-2344`: `button,a,input,select { min-height:44px }` — belassen (Touch-Target gut), aber Header-Icon-Buttons in `MainLayout.tsx` (menu/close/logout/rank-chip ~L824-1072) bekommen explizite `style={{ minHeight: 'auto' }}` bzw. eine `.header-icon-btn`-Klasse mit `@media(max-width:768px){min-height:auto}` um die 64px-Header-Crowding aufzulösen.
  - `globals.css:642-647`: `.btn` 48px @768px — belassen für primäre CTAs (Touch-Target); Header-Chips nutzen nicht `.btn`, also nicht betroffen.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern (kein Money-Pfad, keine globale Breakpoint-Änderung).
- **Verifizierung:** `npm run typecheck`, `npm run lint`, `npm run build`; Desktop-Render unverändert (≥1024px trifft keine `@media(max-width:768px)`-Regel).
- **Nicht-Scope:** Breakpoint-Vereinheitlichung F1 (Desktop-Risiko), globale `.btn`-Verkleinerung, `overflow-x:hidden` F5 (bleibt als Sicherheitsnetz).

### L2 — `VipLiveStreamRail` mobile gate
- **Ziel:** Toggle-Pill und Drawer auf ≤768px entweder ausblenden oder vollbreit/abgesichert darstellen — kein permanentes Schweben über Content, kein Header-Overlap.
- **Scope:** `src/components/home/VipLiveStreamRail.tsx:106-368`.
- **Fix-Spec (eine von, bevorzugt a):**
  - (a) Komponente via `matchMedia('(max-width:768px)')` oder neuem `isMobile`-Prop auf mobile prüfen; auf mobile Toggle-Pill `display:none` (Feature ist Below-Fold-Luxus) — minimaler, sicherster Fix.
  - (b) Alternativ: Drawer `width: calc(100vw - 16px)`, `top: 64px` (Mobile-Header-Höhe statt fix 70px), `zIndex: 60` (über Header z40, unter Modals z50+/Nav z1000); Pill nur sichtbar wenn Drawer zu.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`; programmatische Overflow-Prüfung L12 (kein fixed-Element überlappt Header-Rect auf 375px).
- **Nicht-Scope:** Drawer-Inhalt-Redesign, Desktop-Verhalten (≥769px unverändert).

### L3 — `LiveHighrollerTickerBar` Truncation
- **Ziel:** Center-Ticker-Inhalt auf 375px nicht mehr stumm clippen; Multiplikator sichtbar oder sauber abgeschnitten mit Ellipse.
- **Scope:** `src/components/home/LiveHighrollerTickerBar.tsx:149-211`.
- **Fix-Spec:** Center-Container `min-width:0` (damit flex-item schrumpfen darf); innere Row `overflow:hidden; text-overflow:ellipsis; whiteSpace:nowrap`; letzte relevante Span (Multiplikator-Badge) `flexShrink:0`, mittlere Text-Spans (`user`, `gewann`, `amount`, `auf`, `game`) dürfen schrumpfen. Alternativ mobile: nur `user + amount + badge` rendern, Rest via `isMobile` ausblenden.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`; L12 Overflow-Prüfung.
- **Nicht-Scope:** Desktop-Ticker (unverändert), Marquee-Animation.

### L4 — `HeroCinematicShowcase` trust pill + bonus bar
- **Ziel:** Trust-Pill und Bonus-Claim-Bar auf 375px nicht mehr überlaufen/clipping.
- **Scope:** `src/components/home/HeroCinematicShowcase.tsx:342-598`.
- **Fix-Spec:**
  - Trust-Pill (L476-598): `flexWrap` von `nowrap` → `wrap` auf mobile (`isMobile ? 'wrap' : 'nowrap'`), oder `overflowX:auto` + `flexWrap:nowrap` (horizontal scroll, Chips erhalten). Dividers auf mobile ausblenden.
  - Bonus-Claim-Bar (L342-445): `flexDirection: isMobile ? 'column' : 'row'`, Button `width:100%` auf mobile, Code-Chip darüber; `whiteSpace` des Buttons auf mobile `normal` oder `nowrap` mit `overflow:hidden;text-overflow:ellipsis`.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`; L12.
- **Nicht-Scope:** Desktop-Hero, Particles, Simulation-Loop.

### L5 — `ProgressiveJackpotSection` stat overflow + container padding
- **Ziel:** Mono-Stat-Werte in 2-col-Grid auf 375px nicht mehr überlaufen; Container-Padding mobile 16px.
- **Scope:** `src/components/home/ProgressiveJackpotSection.tsx:24-25,130-193`.
- **Fix-Spec:** Stat-Zellen `overflow:hidden`, Werte `text-overflow:ellipsis; whiteSpace:nowrap; minWidth:0`; alternativ `fontSize: isMobile ? '0.95rem' : '1.1rem'`-Stufung verfeinern (statt 1.1rem → 0.9rem auf 375px). Container-Padding `isMobile ? '24px 16px'` (bereits 16px horiz, ok) — Section-Margin `0 auto 64px` → mobile `0 auto 32px` (Dichte). 
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`; L12.
- **Nicht-Scope:** Jackpot-Display (fluid clamp ok), Desktop 4-col-Grid.

### L6 — `MainLayout` wallet-chip truncation + `HighrollerWinDetailModal` z-index
- **Ziel:** Wallet-Balance im Header trunkiert; Highroller-Modal über Bottom-Nav.
- **Scope:** `src/components/layout/MainLayout.tsx:952-993`, `src/components/home/HighrollerWinDetailModal.tsx:63-71`.
- **Fix-Spec:**
  - Wallet-Chip: Balance-Span `maxWidth` (z.B. `isMobile ? '120px' : 'none'`), `overflow:hidden; text-overflow:ellipsis; whiteSpace:nowrap`. IconBadge davor `flexShrink:0`.
  - `HighrollerWinDetailModal`: `zIndex: 250` → `1050` (über MobileNav 1000, unter toasts/loading 100/999-Bereich stays ok da Modal backdrop inset-0). Alternativ Modal-Wrapper `paddingBottom` um `72px+safe-area` erhöhen damit Nav nichts verdeckt.
- **Abhängigkeiten:** L1 (Header-Button-Opt-out für Crowding).
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`; L12 (Modal-Rect nicht von Nav-Rect überlappt).
- **Nicht-Scope:** Header-Höhe (64px), Desktop-Wallet-Chip.

### L7 — Roulette: wheel scaling + board min-width
- **Ziel:** Rad und Board auf 375px nutzbar ohne horizontalen Page-Overflow; Board lesbar.
- **Scope:** `src/app/games/roulette/RouletteClient.tsx:300,401-435,1874,1905-2103`.
- **Fix-Spec:**
  - Wheel: `const size = isMobile ? Math.min(420, viewportWidth-32) : 420` — da `size` aktuell konstant 420, mobile-skalieren via `useState`+`matchMedia` oder CSS `width: min(420px, calc(100vw - 32px))` am Wrapper + `aspect-ratio:1` (statt fix `width/height:size`). Bevorzugt: `size` responsive machen (neue `useIsNarrowViewport`-ähnliche Hook oder `isMobile`-Ternary mit `window.innerWidth`-Snapshot).
  - Board: `minWidth:880px` mobile beibehalten für Scroll (Board ist inhärent breit), aber Scroll-Container `overflowX:auto` + `scroll-snap-type:x mandatory` + `paddingBottom` für scrollbar; zusätzlich mobile ein kompaktes Hint: „← wischen →". Alternative: mobile numbers-grid auf `repeat(6,1fr)` (2 Reihen à 6) umbrechen statt `repeat(12,1fr)`. **Bevorzugt:** scroll-snap + scroll-hint (weniger Logik-Änderung, kein Settlement-Risiko).
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern. **Vorsicht:** keine Settlement-/Betlogik ändern — nur Darstellung.
- **Verifizierung:** `typecheck`, `lint`, `build`, `npm run test` (Roulette-Tests grün); L12 (wheel-Rect ≤ viewport, kein page overflow).
- **Nicht-Scope:** Roulette-Settlement, Racetrack-Logik, Desktop-Board.

### L8 — Slots: paytable responsive + reel frame scaling
- **Ziel:** Paytable und 5-reel Frame auf 375px lesbar/nicht geclippt.
- **Scope:** `src/app/games/slots/page.tsx:1352-1362,1537-1573`.
- **Fix-Spec:**
  - Paytable: mobile `gridTemplateColumns: '1fr 1fr'` (2-col statt 4-col) mit `gridTemplateAreas` oder Zeilen-Stack; `105px`-fix-Spalte mobile entfallen (`1fr`-Spalte für Symbolname). `whiteSpace:nowrap` L1603 → mobile `normal`/`ellipsis`.
  - Reel frame: `symbolSize`/Reel-Width mobile reduzieren — SlotSymbol `size` von caller auf `isMobile ? 56 : 80`-ähnlich; oder 5-reel frame `gridTemplateColumns: repeat(5, minmax(0,1fr))` + `overflow:hidden` + kleinere `REEL_WINDOW_HEIGHT` auf mobile. **Vorsicht:** Reel-Geometrie ist mit `SLOT_CELL_HEIGHT`/`REEL_WINDOW_HEIGHT`-Konstanten verdrahtet — nur über `isMobile`-Ternary auf diese Konstanten, nicht ihre Verknüpfung ändern.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern. **Vorsicht:** keine RNG-/Settlement-Logik (reels sind animiert, Ergebnis server-seitig).
- **Verifizierung:** `typecheck`, `lint`, `build`, `npm run test`; L12.
- **Nicht-Scope:** Slot-RNG, Desktop-Cabinet, V2-Slots (`/games/slots/v2`).

### L9 — Crash: live-bets panel + milestone flash
- **Ziel:** Live-Bets-Panel überlappt zentralen Multiplikator nicht; Milestone-Flash überfließt nicht.
- **Scope:** `src/app/games/crash/page.tsx:2168-2499`.
- **Fix-Spec:**
  - Live-Bets-Panel (L2423-2440): mobile `width:120px`, `top:8`, `right:8`, `fontSize` kleiner, `maxHeight` + `overflowY:auto`; oder mobile auf `bottom`-Bereich verschieben (nicht über zentralen Multiplikator bei `top:50%`).
  - Milestone-Flash (L2478-2499): `whiteSpace:'nowrap'` → `normal` oder `maxWidth:90vw; overflow:hidden; text-overflow:ellipsis`; `fontSize: isMobile ? '1.4rem' : '1.8rem'`.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** LLM-intern. **Vorsicht:** keine Crash-Runden-/Cashout-Logik.
- **Verifizierung:** `typecheck`, `lint`, `build`, `npm run test`; L12.
- **Nicht-Scope:** Canvas-Rendering, Multiplayer-RPC, Desktop-Panel.

### L10 — Blackjack: win banner + split hands
- **Ziel:** Win-Banner clippt nicht; 2 split hands übersteigen 375px nicht.
- **Scope:** `src/components/casino/games/blackjack/BlackjackTable.tsx:139-170,230-247`, `src/components/casino/games/blackjack/CardHand.tsx:141-167`.
- **Fix-Spec:**
  - Win-Banner (L139-170): `whiteSpace:'nowrap'` → `normal`/`ellipsis` mit `maxWidth:100%`, `overflow:hidden`, `text-overflow:ellipsis`; `top:-45px` mobile beibehalten aber `text-align:center`.
  - Split hands (L230-247): `gap:24px` → mobile `gap:12px`; CardHand stagger `left: index*32` → mobile `index*20` (via `isMobile`-Prop); `CardHand` bekommt `isMobile`-Prop durchgereicht.
- **Abhängigkeiten:** keine. **Vorsicht:** keine Blackjack-Settlement-/Action-Logik.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`, `npm run test`; L12.
- **Nicht-Scope:** Blackjack-RNG, Card-Sizes (fix ok), Desktop-Table.

### L11 — Dice: HUD stack + slider tooltip
- **Ziel:** HUD nicht übermäßig groß auf mobile; slider tooltip clippt nicht an Kanten.
- **Scope:** `src/app/games/dice/page.tsx:1330-1418`.
- **Fix-Spec:**
  - HUD (L1408-1418): mobile `gridTemplateColumns: '1fr 1fr'` (2-col statt 1-col) für kompaktere Darstellung, oder `1fr` belassen aber `gap`/`padding` reduzieren. Bevorzugt 2-col auf 375px (2×2-Grid).
  - Slider tooltip (L1330-1366): `whiteSpace:'nowrap'` → `normal`/`ellipsis`; Position `left` clampen `Math.max(8, Math.min(pct%, 100-8))` damit Tooltip nicht an Kanten clippt; `top:-42px` beibehalten.
- **Abhängigkeiten:** keine. **Vorsicht:** keine Dice-RNG-/Betlogik.
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `typecheck`, `lint`, `build`, `npm run test`; L12.
- **Nicht-Scope:** Dice-RNG, Slider-Value-Logik, Desktop-HUD.

### L12 — Verifikation (lint/typecheck/test/build + programmatische Overflow-Detection)
- **Ziel:** Harter Nachweis: lint 0 neue Errors, types grün, tests grün, build grün; kein programmatisch messbarer horizontaler Page-Overflow oder Element-Overlap auf 375px.
- **Scope:**
  - `npm run lint && npm run typecheck && npm run test && npm run build`.
  - Programmatische Messung via Playwright (Headless, viewport 375×812 + 768×1024): `page.evaluate` prüft je URL `document.documentElement.scrollWidth <= clientWidth` (kein Page-Overflow) und `getBoundingClientRect`-Overlap ausgewählter kritischer Element-Paare (Header vs. VipLiveStreamRail-Drawer, Modal vs. MobileNav, Roulette-Wheel vs. viewport, Crash-Panel vs. Multiplikator-Rect). **KEINE Screenshots, KEINE ästhetische Bewertung** — nur Booleans/Numbers. Memory `no-visual-check-frontend`.
  - Desktop-Stabilität: gleiche Messung bei 1280×800 ergibt unveränderte Struktur (kein Desktop-Element verschwindet/verschiebt sich durch mobile-@media).
- **Abhängigkeiten:** L1–L11.
- **Freigabe-Gate:** LLM-intern (Numbers-basierter Nachweis).
- **Verifizierung:** Ausgaben dokumentiert (§6 Verifikations-Log); Milestone-Status 🟢.
- **Nicht-Scope:** Lighthouse (erfordert Chrome+Prod-Server → Jan L-Handover), visuelle Abnahme (Jan).

### L13 — Doku-Update + Übergabe an Jan
- **Ziel:** Plan-Status `Executed (archiviert)`, V1 als superseded markiert, worldmap synchronisiert, Abschlussmeldung mit Test-URLs + Prüfpunkten.
- **Scope:** Diese Datei, `04_MOBILE_PERFORMANCE.md` (V1 superseded-Header), `worldmap/00_WORLDMAP_STATUS.md` (Kat. 10), `worldmap/05_ZUKUNFTSPLANUNG.md` (P28/1.16-Referenz falls Kat-10-zugeordnet).
- **Abhängigkeiten:** L12 🟢.
- **Freigabe-Gate:** LLM-intern (Doku); visuelle Abnahme bleibt Jan.
- **Verifizierung:** Alle Status konsistent; Abschlussmeldung enthält Test-URLs (§5).
- **Nicht-Scope:** Visuelle Abnahme (Jan), CI-Integration.

---

## 4 — Selbstprüfung vor `Execution-Ready` (SOP 03 §4)

1. **Scope abgegrenzt:** Gegenüber V1 (`04_MOBILE_PERFORMANCE.md`) — V1 behandelte Image-Migration + Code-Splitting (Perf-Bundle); V2 behandelt mobile Layout-/Abstands-/Overlap-Fixes (das, was Jans V1-Abnahme als noch fehlerhaft markierte). Gegenüber `05_FRONTEND_SPLITTING_LINT.md` — dort <800-Zeilen-Splits + Lint-Cleanup; hier nur mobile Darstellung. Keine Überschneidung im Money-/Server-Pfad.
2. **Abhängigkeiten/Reihenfolge:** L1 (Foundation) → L2–L11 (parallelisierbare Komponenten-Fixes) → L12 (Verifikation) → L13 (Doku). Keine Jan-Entscheidung in L1–L13 (nur visuelle Abnahme danach).
3. **Datenklassen/API-Grenzen:** keine neuen; alle Fixes sind CSS/Inline-Style/`isMobile`-Ternary. Keine neue Datenklasse, kein API, kein Schreibpfad. Allowlist/Negativtest/Fallback nicht anwendbar.
4. **Statusbehauptungen:** Ist-Analyse = Code-Ebene verifiziert 2026-08-23 (Zeilennummern aus Live-Code). Keine Remote-/Prod-Aussagen.
5. **Keine Doppelpflege:** SOP 02 (Execution), SOP 03 (Planungsdateien), SOP 10 (Frontend-Revamp) verlinkt, nicht kopiert.
6. **Desktop-Schutz:** jeder Fix ist mobile-gated (`isMobile` oder `@media(max-width:768px)`); Breakpoint-Vereinheitlichung (F1) explizit Non-Scope.
7. **Keine visuelle Selbstbewertung:** L12 nutzt nur programmatische Messung; „passt"-Abnahme bei Jan (Memory `no-visual-check-frontend`).

---

## 5 — Stopp & Übergabe (Test-URLs + Prüfpunkte für Jan)

Nach L13 Übergabe an Jan. Dev-Server auf Port 3015 (Next.js). Zu prüfende URLs (mobile viewport, ≤375px):

- `http://localhost:3015/` — Homepage (VipLiveStreamRail, Ticker, Hero, Jackpot)
- `http://localhost:3015/games` — Spiele-Katalog
- `http://localhost:3015/games/dice`
- `http://localhost:3015/games/slots`
- `http://localhost:3015/games/roulette`
- `http://localhost:3015/games/crash`
- `http://localhost:3015/games/blackjack`

**Prüfpunkte (Jan, visuell):**
- Kein horizontaler Scroll/Clipping auf 375px.
- Keine Overlaps (Header, Drawers, Modals, Bottom-Nav).
- Abstände/Dichte passend (nicht zu groß, nicht gedrängt).
- Desktop (≥1024px) unverändert — nur Stichprobe, darf keine Regression zeigen.

---

## 6 — Verifikations-Log (Execution-ergebnisse, 2026-08-23)

### 6.1 L1–L11 — Umgesetzte Fixes (mobile-gated, Desktop unangetastet)

| L | Datei | Fix (mobile-only) |
| :-- | :-- | :-- |
| L1 | `src/app/globals.css`, `src/components/layout/MainLayout.tsx` | `@media(max-width:768px)` `.no-mobile-minheight { min-height:auto !important }` Opt-out für 64px Header-Icon/Chip-Buttons; Wallet-Balance `maxWidth:130px` + ellipsis (mobile). |
| L2 | `src/components/home/VipLiveStreamRail.tsx` | `matchMedia(max-width:768px)`-Hook; kompletter Drawer `null` auf mobile (toggle-Pill bleibt). |
| L3 | `src/components/home/LiveHighrollerTickerBar.tsx` | Container padding `0 16px`, Ticker `minWidth:0` + `overflow:hidden`, user `maxWidth:70px` ellipsis, amount/mult `flexShrink:0`, Füllwörter hidden (mobile). |
| L4 | `src/components/home/HeroCinematicShowcase.tsx` | Bonus-Bar `flexDirection:column`, Code-Info `minWidth:0 flex:1`, Button `width:100%`, Trust-Pill `flexWrap:wrap`, Mikro-Divider hidden (mobile). |
| L5 | `src/components/home/ProgressiveJackpotSection.tsx` | Value `fontSize:0.92rem` + `maxWidth:100%` ellipsis; Section `margin:0 auto 32px` (mobile). |
| L6 | `src/components/layout/MainLayout.tsx`, `src/components/home/HighrollerWinDetailModal.tsx` | `no-mobile-minheight` auf Menü-/Rank-/Eye-Button; Modal-Backdrop `zIndex:250→1050` (über MobileNav 1000). |
| L7 | `src/app/games/roulette/RouletteClient.tsx` | `size` responsive `useState`+`resize`-Effect (`min(420, w-32)` auf <768px); cx/cy/Radius/scale abgeleitet; Board `padding 12px 10px` + `scroll-snap x` + Wisch-Hinweis (mobile). |
| L8 | `src/app/games/slots/page.tsx`, `src/components/casino/games/slots/SlotReel.tsx` | `cellHeight`-Prop (default 112 = Desktop unverändert); mobile `84px` → Window 252px; Paytable `gridTemplateColumns 70px 1fr 1fr 1fr` + `fontSize 0.56/0.62rem` + Value-Cells ellipsis. |
| L9 | `src/app/games/crash/page.tsx` | Live-Bets-Panel `width:112px maxHeight:132px top/right:8px padding:8px`; Milestone-Flash `maxWidth:92vw` + ellipsis + `fontSize:1.2rem letterSpacing:1px` (mobile). |
| L10 | `src/components/casino/games/blackjack/BlackjackTable.tsx`, `CardHand.tsx` | Win-Banner `maxWidth:92vw` + Span `maxWidth:60vw` ellipsis + `fontSize:0.85rem`; Split-Hands `gap:12px flexWrap:wrap`; CardHand `isMobile`-Prop → Stagger `index*20` + width `88+(n-1)*20` (mobile). |
| L11 | `src/app/games/dice/page.tsx` | HUD `gridTemplateColumns:1fr 1fr gap:10px`; Quick-Chips `minmax(0,1fr) fontSize:0.6rem padding:0 2px`; Slider-Tooltip Transform-Clamp (`<12%→translateX(0)`, `>88%→translateX(-100%)`) + `maxWidth:92px` ellipsis (mobile). |

### 6.2 L12 — Harter programmatischer Nachweis (Numbers only, keine Screenshots, keine ästhetische Bewertung)

| Prüfung | Befehl / Methode | Ergebnis |
| :-- | :-- | :-- |
| Lint | `npm run lint` | **0 Errors**, 6 Warnings (5 pre-existing `react-hooks/exhaustive-deps` in crash/dice/roulette — nicht im Diff berührt; 1 neu eingeführte `SlotReel cellHeight` → **behoben** durch Dep-Ergänzung) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **grün** (0 Errors) |
| Tests | `npm run test` (Vitest) | **959/966 passed** (122 Test-Files). 7 Failures in `multiplayer-crash-reveal-leak.test.ts` (Crash/Wallet-Routen-Source-Assertion) — **vorbestehender Drift im committed HEAD**, verursacht durch Commit `ac6274e` (Stufe M Voice Interface), der `bet/route.ts` auf `APP_ERROR_CODES.VALIDATION_FAILED` umstellte, ohne den Test anzupassen. Weder Test noch Quelle (`bet/route.ts`, `wallet.ts`) haben Diff zu HEAD; der Menu-Fix (MainLayout) berührt keine Tests/Wallet/Crash/Route. **Keine Regression durch V2.** (Vorheriger Stand 946/946 war vor Aufnahme der 4 neuen Test-Files im Tree.) |
| Build | `npm run build` | **grün** — alle Routen kompiliert (ƒ Dynamic + ○ Static) |
| Overflow-Detection | `node scripts/mobile-overflow-check.mjs` (Playwright headless, `document.documentElement.scrollWidth - window.innerWidth`) | **18/18 Checks hOverflow=0.0px** — 375×812 (6 Seiten) + 768×1024 (6 Seiten) + 1280×800 (6 Seiten) |
| Desktop-Stabilität | gleiche Messung @1280×800 | **0 Overflow** (Desktop-Elemente durch mobile-`@media`/`isMobile` nicht verschoben/verdeckt) |

**Overflow-Detail (Auszug, vollständige Zahlen im Skript-Output):**
- `[mobile-375]` home/dice/slots/roulette/crash/blackjack → alle `hOverflow=0.0px`
- `[tablet-768]` alle 6 Seiten → `hOverflow=0.0px`
- `[desktop-1280]` alle 6 Seiten → `hOverflow=0.0px`

**Methodik-Hinweis:** Page-Level-Overflow (`scrollWidth > clientWidth`) ist die objektive, numbers-basierte Messung. Element-pairweise Overlap- Erkennung bewusst nicht durchgeführt — Overlap ist visuell/judgment-based (Layering ist meist intendiert: Modals, Badges, absolute Cards) und fällt damit in Jans visuelle Abnahme, nicht in LLM-Selbstbewertung (Memory `no-visual-check-frontend`).

### 6.3.1 — Menü-Fix (Follow-up-Bug von Jan, 2026-08-23, außerhalb L1–L13-Inventar)

Jan öffnete das mobile Menü (Hamburger oben links) und es „schlecht gelungen" geöffnet. Root-Cause-Analyse (programmatisch, keine visuelle Bewertung):

**Zwei unabhängige Bugs:**

1. **z-Index-Layering** (`MainLayout.tsx`): Drawer `aside` z=150 und Backdrop z=145 lagen **unter** `MobileNav` (fixed bottom nav, z=1000) → Bottom-Nav schwebte über dem geöffneten Drawer.
   - Fix: Backdrop z `145 → 1040`; Drawer z `150 → (isMobile ? 1050 : 150)` (mobile-gated; Desktop bleibt z=150 sticky, kein visueller Eingriff, da flex-Siblings sich nicht überlappen).

2. **Route-Change-Effect Dependency-Bug** (`MainLayout.tsx:350`): Der Effect zum Schließen der Sidebar bei Routenwechsel hatte `mobileSidebarOpen` in der Dep-Array. Da `setMobileSidebarOpen(false)` gesetzt wurde, feuerte der Effect erneut beim Öffnen und schloss den Drawer **sofort wieder** — er blieb nie offen.
   - Fix: `useEffect(() => { setMobileSidebarOpen(false); }, [pathname]);` (deps intentionally nur `[pathname]`; Desktop no-op da mobileSidebarOpen dort nie true).

**Zusätzliche Härtung:** `SettingsPopover`-Callbacks (`onOpenProvablyFair`, `onExpandModal`) schließen den Drawer jetzt zuerst (`setMobileSidebarOpen(false)`), damit Settings/Provably-Fair-Modal nicht hinter dem Drawer aufgehen.

**Verifikation (programmatisch, `scripts/mobile-overflow-check.mjs` Drawer-Coverage-Check):**
- Drawer bleibt offen nach Klick (`asideLeft:0`, `asideTransform:none`).
- `drawerZ=1050 > mobileNavZ=1000` ✓
- `backdropZ=1040 > mobileNavZ=1000` ✓ → Bottom-Nav vom Drawer/Backdrop verdeckt.
- 18/18 Overflow-Checks weiterhin `hOverflow=0.0px` (keine neue Overflow durch z-Raise).
- Desktop bei 1280px unverändert (Drawer z=150, kein mobile-@media aktiv).

**Gates (lokal verifiziert 2026-08-23):** lint 0 Errors · typecheck grün · build grün · Overflow+Drawer-Coverage grün. Tests: siehe §6.2 (7 vorbestehende Failures, keine Regression durch diesen Fix — MainLayout hat keine eigenen Tests, berührt kein Wallet/Crash/Route).

### 6.3 — L13 — Doku & Übergabe

- Diese Datei: Status → **Executed**; §1-Tabelle alle 🟢; §6 gefüllt.
- V1 `04_MOBILE_PERFORMANCE.md`: als superseded markiert (siehe Header dort).
- Verifikations-Skript: `scripts/mobile-overflow-check.mjs` (bleibt als reproduzierbarer L12-Nachweis).
- Visuelle Abnahme: offen bei Jan (siehe §5 Test-URLs + Prüfpunkte).