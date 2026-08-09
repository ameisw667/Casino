# Option 1.1 Cyber-Stealth — Optimierungs-Plan & v2-Duplikat

> **Erstellt:** 2026-08-09 · **Basis:** `docs/prototypes/option1_1_cyber_stealth.html` (Favorit, neuer Ansatz) · **Ziel:** sektionsweise Evaluation → Weltklasse-Plan → Self-Audit → Execution am Duplikat `option1_1_cyber_stealth_v2.html` → Execution-Audit.

---

## 0 — Verbindlicher Ansatz (Favorit, fixiert)

`option1_1_cyber_stealth.html` ist der **einzige** verfolgte Ansatz. Kombination:

| Dimension                 | Festlegung                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Schrift (UI)              | **Plus Jakarta Sans** · `--font-inter`                                                                            |
| Schrift (Zahlen/Terminal) | **JetBrains Mono** · `--font-mono`                                                                                |
| Akzent                    | Platinum/Silver `#CBD5E1`                                                                                         |
| BG                        | Charcoal `#0B0E14` + anim. Grid/Glow-Blobs                                                                        |
| Win / Loss                | Emerald `#00E676` / Crimson `#FF3366`                                                                             |
| Glas                      | **Frosted Obsidian** (blur 18px saturate 140%, `rgba(20,25,35,0.55)`, 1px Platinum-Hairline, inset Top-Highlight) |
| Live-Indikator            | **grüner Live-Dot** (emerald, pulse 1.6s) — **nur** für echte Live-Daten                                          |

**Entfernte Varianten (verworfen):** `option1_cyber_stealth.html`, `option2_swiss_luxury.html`, `option3_neo_tokyo.html`, `option4_tactical_glass.html`. Eval-Mockups (`fonts_evaluation_6`, `fonts_top3`, `glassmorphism_top3`) bleiben als Entscheidungstrail.

---

## 1 — Sektionsweise Evaluation (Status Quo = option1_1)

### 1.1 Animierter Hintergrund (Grid + 3 Glow-Blobs)

- **Gut:** macht Backdrop-Blur sichtbar; Atmosphäre; drift dezent.
- **Schlecht:** 3 infinite `blur(70px)`-Animationen = teuer auf Mobile/Low-End; kein `prefers-reduced-motion`-Fallback; `mask-image` ohne `-webkit-`Prefix; Blobs rein dekorativ (kein Bezug zu Inhalten); `mix-blend-mode: screen` GPU-Last.
- **Anpassung:** `@media (prefers-reduced-motion: reduce)` → Blobs einfrieren; `-webkit-mask-image` ergänzen; Mobile (`max-width:560px`) auf 1 Blob + niedrigeres Blur reduzieren; `will-change: transform` nur für animierte Blobs; emerald-Blob in Nähe des Crash-Panels platzieren (content-aware).

### 1.2 Header / Nav

- **Gut:** Glas, Brand, aktiver Nav-State, Balance-Box mit Mono-Zahlen, Avatar.
- **Schlecht:** Nav verschwindet auf Mobile ohne Ersatz (tote Navigation); Brand-Tag "v1.1 · FROSTED" = Dev-Labeling; Live-Dot auf Brand konkurriert semantisch mit Live-Dot auf echten Live-Daten (Brand ist nicht "live"); keine Focus-Styles; kein Quick-Deposit; Avatar kein Menü-Affordance.
- **Anpassung:** Mobile-Hamburger → Glas-Dropdown (kleines JS-Toggle); Dev-Tag entfernen; **Live-Dot vom Brand entfernen** (reserviert für Live-Daten); `:focus-visible`-Outlines; `+`-Deposit-Button neben Balance; Avatar als `<button aria-haspopup="menu">`.

### 1.3 Metrics-Reihe (4 Stat-Cards)

- **Gut:** 4 Glas-Cards, Mono-Zahlen, semantische Farben, eine mit Live-Label.
- **Schlecht:** nur EINE Metric hat Live-Label (inkonsistent — welche sind echt live?); Zahlen-only = flach für "High-Frequency Terminal" (kein Trend); kein Delta-Pfeil; alle Cards gleichgewichtig (keine Hierarchie); Zahlenausrichtung nicht spalten-konsistent.
- **Anpassung:** Mini-Sparkline (SVG) pro Card; konsistente Live-Labels (alle echt-live Metrics markieren ODER ein Master-LIVE-Indikator); Delta-Pfeil ▲/▼ + semantische Farbe; **Hierarchie** — Primär-Metric (Net P/L) größer; Zahlen rechtsbündig für Spaltenalignment.

### 1.4 Bet-Stream-Panel (History)

- **Gut:** Live-Dot + LIVE-Pill, Filter-Chips mit Active-State, Mono-Zahlen, Win/Loss-Farben, Game-Tags, Row-Hover, Footer.
- **Schlecht:** kein Sticky-Thead (lange Listen verlieren Spaltenkontext); Chips sind `<div>` (nicht keyboard-togglebar, kein `aria-pressed`); Footer "Place Bet" gehört nicht in History; Game-Codes (RLT, BJ) kryptisch; kein Per-Row Provably-Fair-Nachweis (Footer-Behauptung ohne Beleg); kein Load-More/Pagination; kein Empty-State.
- **Anpassung:** Sticky `thead`; Chips → `<button aria-pressed>`; "Place Bet" → "Auto-Refresh"-Toggle; Load-More; Game-Namen ausgeschrieben ODER Legende; Per-Row Provably-Fair-Chevron → Seed-Link; numerische Spalten rechtsbündig; Zeilenanzahl + Avg.

### 1.5 Crash-Live-Panel

- **Gut:** Live-Dot + "CRASH // LIVE ROUND", große Mono-Multi, Progress-Bar, emerald Cashout, Timer.
- **Schlecht:** Multiplikator "2.41x" splittet Dezimal akzentfarben (visuelles Rauschen auf Schlüsselwert); Progress-Bar statisch (kein Bezug zum steigenden Multi); kein Bet-/Auto-Cashout-Input; keine Recent-Busts (Crash-Spiele zeigen Historie); Emerald-Überlad (Live-Dot + Cashout + Progress alle emerald).
- **Anpassung:** Multiplikator einfarbig (weiß), nur "x" akzent; Progress-Bar animiert (Transition auf Wert); Bet- + Auto-Cashout-Input; Recent-Busts-Strip (z. B. 1.2x · 3.4x · 1.0x · 8.2x); Emerald reduzieren — Progress → Platinum-Gradient, Emerald reserviert für Live-Dot + Cashout-Action; Cashout-Disabled-State.

### 1.6 Top-Payouts-Panel

- **Gut:** gerankte Liste, emerald Mono-Beträge, saubere Rows.
- **Schlecht:** keine Avatare/Identität (flach); kein Rang-Hierarchie (Rang 1 fühlt sich nicht größer an); kein "Du"-Highlight (persönlicher Rang fehlt); kein Game/Zeit-Kontext; kein Link zum vollen Leaderboard; Ränge nur Nummern.
- **Anpassung:** Initialen-Avatar pro Row; Rang 1–3 Medaille/Akzent; "Du"-Row highlighten; Game-Tag + Zeit pro Row; "View all →"-Link zum Leaderboard.

### 1.7 Featured-Games-Reihe (4 Cards)

- **Gut:** Glas-Cards, Hover-Lift, Name + Desc + Top-Multi, eine mit Live-Label.
- **Schlecht:** **Emoji-Icons (💥🎲🎰🎯) = Bruch mit professioneller Terminal-Ästhetik** (größter Downgrade); nur eine Live-Label (willkürlich); alle Cards gleich groß (keine Hierarchie); kein "Play"-CTA; keine Spielerzahl; "ico"-Box hinter Emoji leer; Desc-Truncation fehlt.
- **Anpassung:** Emoji → **Mono-Monogram-Badges** (CR/DC/SL/RL) oder minimalistische SVG-Line-Icons; "PLAY →"-Affordance bei Hover; aktive Spielerzahl; Desc ellipsis; Hierarchie (Hero-Game breiter).

### 1.8 Querschnitt (alle Sektionen)

- **A11y:** `:focus-visible` fehlt universell; `aria-pressed`/`aria-label` fehlen; Live-Dot ohne `aria-label`.
- **Performance:** 3 Blob-Animationen + `blur(70px)` ohne Reduced-Motion/Mobile-Degradation.
- **Hierarchie:** alles gleichgewichtiges "Glas-Card" → Weltklasse-Terminal braucht primär/sekundär/tertiär Surfaces.
- **Spacing:** Gap-Rhythmus okay (14–18px), aber keine explizite Skala (8/12/16/24/32).
- **Kontrast:** `--text-dim #5a6678` auf Charcoal — für kleine Dim-Texte AA-grenzwertig; Platinum-Akzent + Emerald/Crimson gut.

---

## 2 — Implementationsplan (Weltklasse) für `option1_1_cyber_stealth_v2.html`

**Dupe-Strategie:** `option1_1_cyber_stealth.html` 1:1 kopieren, dann pro Sektion die untenstehenden Änderungen anwenden. Kein Verhalten/Logik-Bruch (rein statische Skizze, keine App-Code-Abhängigkeit).

### P1 — Tokens & Querschnitt

- Spacing-Scale als Vars: `--sp-1:8px … --sp-6:32px`; konsistent in allen Gaps/Paddings.
- `--text-dim` etwas aufhellen (`#6b7689`) für AA bei kleinen Texten.
- Universelle `:focus-visible`-Regel: `outline: 2px solid var(--accent); outline-offset: 2px`.
- `@media (prefers-reduced-motion: reduce)` → alle `animation`/`transition` auf `none`/minimal, Blobs einfrieren, Progress-Bar auf statisch.
- `aria-label="live"` an alle `.live-dot`; `aria-pressed` an alle Chips.

### P2 — Hintergrund

- `-webkit-mask-image` ergänzen (Safari).
- `@media (max-width:560px)`: `.blob-2, .blob-3 { display:none }`, `.blob-1` Blur auf 50px.
- `will-change: transform` an `.blob`.
- Emerald-Blob (`.blob-2`) Positionierung näher an Crash-Panel (rechts).

### P3 — Header/Nav

- Brand: Live-Dot entfernen; Dev-Tag entfernen; Brand = reiner Wortmarke.
- `+`-Deposit-Button (glasig, platinum-border) neben Balance-Box.
- Avatar → `<button aria-haspopup="menu" aria-label="Benutzermenü">`.
- Mobile: Hamburger-Button (`max-width:980px`) → togglt Glas-Dropdown (JS `classList.toggle('open')`).
- `:focus-visible` auf alle Nav-Links + Buttons.

### P4 — Metrics

- Primär-Metric (Net P/L) → `grid-column: span 2` + größere Zahl (32px) = Hierarchie.
- Mini-Sparkline (inline SVG `polyline`) pro Card (Platinum-Linie, emerald- Fill dezent).
- Delta-Pfeil (▲/▼) + Farbe je Vorzeichen.
- Konsistente Live-Labels: Volume, Net P/L, Active Players → alle `live-label` (echt live); Win Rate nicht (aggregiert) → kein Label.
- Zahlen rechtsbündig in Metrik-Zelle.

### P5 — Bet-Stream

- `thead` → `position: sticky; top: 0` innerhalb scrollbaren Panel (Panel `max-height` + `overflow:auto`).
- Chips → `<button aria-pressed="…">`; Active = `aria-pressed="true"`.
- Footer: "Place Bet" entfernen → "Auto-Refresh"-Toggle (`aria-pressed`); "Export" bleibt.
- Game-Tags ausgeschrieben: CRASH, DICE, ROULETTE, SLOTS, BLACKJACK (legende-frei, klar).
- Pro Row: Provably-Fair-Chevron (`aria-label="Fairness verifizieren"`) → Link-Optik.
- Numerische Spalten rechtsbündig; Footer-Note + Zeilenanzahl "412 settled · 24h".

### P6 — Crash-Live-Panel

- Multiplikator einfarbig `var(--text)`, nur `x` = `var(--accent)`.
- Progress-Bar: `transition: width 0.6s ease` (Wert via Inline-Style); Farbe Platinum-Gradient.
- Recent-Busts-Strip: 6 Chips (Mono) mit farblicher Markierung (Bust < 2x = crimson, ≥ 2x = text).
- Bet-Input (`$`) + Auto-Cashout-Input (`x`) als Glas-Inputs.
- Cashout-Button: emerald, aber `disabled`-State (grau) wenn nicht cashbar.

### P7 — Top-Payouts

- Initialen-Avatar (24px) pro Row.
- Rang 1–3: Medaille-Glyph (🥇→AKZENT? nein — SVG/CSS-Medaille oder `rank` in Akzentfarbe + größer für Rang 1).
- "Du"-Row: Akzent-Border + "YOU"-Badge (falls User in Liste — Skizze: eine Row markieren).
- Game-Tag + Zeit pro Row.
- "View all →" Link im Panel-Head.

### P8 — Featured-Games

- Emoji → Mono-Monogram-Badge (`CR`/`DC`/`SL`/`RL`) in `--font-mono`, 1px Border, Akzent-Tinte.
- "PLAY →" Affordance bei Hover (Slide-In).
- Aktive Spielerzahl pro Card (Mono, dim).
- Desc: `text-overflow: ellipsis` + 2-Line-Clamp.
- Hierarchie: erstes Card (`Crash`) = `grid-column: span 2` (Hero, breiter, größerer Multi).

### P9 — A11y/Perf-Final

- Alle interaktiven Elemente `:focus-visible`.
- `lang="de"` ist gesetzt (gut); `role`-Checks für Chips/Tab.
- Reduzierte Blob-Last auf Mobile; reduced-motion-Ast.
- Keine externen Assets außer Google Fonts (self-contained).

---

## 3 — Self-Audit des Plans (vor Execution)

| #   | Risiko/Gap im ersten Entwurf                                                   | Maßnahme im Plan verankert                                                       |
| --- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| A1  | Sticky `thead` braucht scrollbaren Container (sonst kein Effekt)               | P5: Panel `max-height` + `overflow:auto` ergänzt                                 |
| A2  | Mobile-Hamburger braucht JS-Toggle (nicht nur CSS)                             | P3: JS `classList.toggle('open')` spezifiziert                                   |
| A3  | Sparklines ohne echten Datenpunkt-Look beliebig                                | P4: `polyline` + dezent emerald-Fill, feste Mini-Höhe (28px)                     |
| A4  | "Du"-Row in Payouts ohne User-Identität willkürlich                            | P7: eine Row fix als "YOU" markieren + Begründung im Kommentar                   |
| A5  | Hero-Card `span 2` bricht Grid auf Mobile                                      | P8: Hero-Span nur `@media(min-width:980px)`                                      |
| A6  | Recent-Busts-Farbregel (<2x crimson) könnte unübersichtlich                    | P6: nur Text-Farbe, kein BG; ≤6 Chips                                            |
| A7  | Reduced-Motion friert Blobs — aber BG wird dann flach/leer                     | Akzeptiert: flacher Charcoal-Grid bleibt lesbar; Akzeptanzkriterium dokumentiert |
| A8  | `:focus-visible`-Outline auf Glas-Buttons evtl. unsichtbar (Platinum auf Glas) | P1: `outline-offset: 2px` + 2px Solid Platinum = sichtbar                        |
| A9  | Game-Tags ausgeschrieben = breiter in Tabelle (Layout-Druck)                   | P5: kleiner Font (10px) + `letter-spacing`; Akzeptanz                            |
| A10 | Avatar als `<button>` ohne echtes Menü = Dead-Button                           | P3: `aria-haspopup="menu"` + Skizze zeigt Menü-Optik (Caret); rein visuell       |
| A11 | Eval-Mockups verbleiben — Verwechslungsrisch mit "Varianten"                   | §0 listet explizit, dass Eval-Mockups Trail bleiben, keine Varianten             |
| A12 | v2-Dateiname vs. option1_1 — klar?                                             | v2 = optimiertes Duplikat; §0 + worldmap erklären Beziehung                      |

**Plan-Level-Up aus Audit:** Sparkline-Höhe fixieren, Hero-Span responsiv machen, Sticky-Container ergänzen, Reduced-Motion-Akzeptanz dokumentieren. → in P-Werte integriert.

---

## 4 — Execution-Audit (nach Bau von v2)

**Datei:** `docs/prototypes/option1_1_cyber_stealth_v2.html` (568 Zeilen, self-contained, nur Google-Fonts extern).

### Strukturelle Verifikation (objektiv, kein visuelles Urteil)

| Check                                                                    | Methode                                                             | Ergebnis                                                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Keine Emoji-Icons mehr                                                   | grep `💥\|🎲\|🎰\|🎯`                                               | ✓ 0 Treffer → durch Mono-Monogram-Badges (CR/DC/SL/RL) ersetzt                                                                         |
| ARIA-Abdeckung                                                           | grep `aria-pressed/label/haspopup/expanded/controls`                | ✓ 26 Attribute                                                                                                                         |
| `prefers-reduced-motion`-Ast                                             | grep                                                                | ✓ Zeile 330 — Blobs + Progress eingefroren                                                                                             |
| `-webkit-mask-image` (Safari)                                            | grep                                                                | ✓ Zeile 63                                                                                                                             |
| `will-change: transform` an Blobs                                        | grep                                                                | ✓ Zeile 68                                                                                                                             |
| Sticky `thead` + scrollbarer Container                                   | grep `position: sticky` + `.stream-scroll`                          | ✓ Zeile 206 + `max-height:360px; overflow:auto`                                                                                        |
| Dev-Tag `v1.1 · FROSTED` entfernt                                        | grep                                                                | ✓ 0 Treffer                                                                                                                            |
| Brand-Live-Dot entfernt (reserviert für Live-Daten)                      | grep `brand-logo`-Block                                             | ✓ nur `ROYALE.TERMINAL` Text, kein `.live-dot`-Child                                                                                   |
| Mobile-Hamburger + JS-Toggle                                             | grep `classList.toggle('open')` + `aria-expanded`                   | ✓ Zeile 563/564 + Hamburger-Button Zeile 367                                                                                           |
| `+`-Deposit-Button                                                       | grep `btn-deposit`                                                  | ✓ Zeile 363                                                                                                                            |
| Avatar als `<button aria-haspopup="menu">`                               | grep                                                                | ✓ mit Caret-Affordance                                                                                                                 |
| Hero-Spans responsiv (Mobile → span 1)                                   | grep `grid-column: span` in `@media`                                | ✓ 980px→span 2, 560px→span 1                                                                                                           |
| Recent-Busts-Strip                                                       | grep `bust low`                                                     | ✓ 6 Chips, <2x als crimson-Text                                                                                                        |
| Bet- + Auto-Cashout-Inputs                                               | grep `crash-inputs`                                                 | ✓ 2-Spalten-Grid                                                                                                                       |
| Multi einfarbig, nur `x` akzent                                          | Code-Zeile `2.41<span class="x">x</span>`                           | ✓                                                                                                                                      |
| Progress-Bar animiert + Platinum-Gradient                                | `transition: width 0.6s ease` + `linear-gradient(…, var(--accent))` | ✓                                                                                                                                      |
| Top-Payouts: Avatare + Rang-Hierarchie + "Du"-Row + View-all + Game/Zeit | grep `pa-avatar\|payout-row.you\|you-badge\|View all`               | ✓                                                                                                                                      |
| Chips als `<button aria-pressed>`                                        | grep                                                                | ✓                                                                                                                                      |
| Provably-Fair-Chevron pro Row                                            | grep `pf-link`                                                      | ✓ 9 Rows + Payouts-View-all                                                                                                            |
| Auto-Refresh-Toggle statt "Place Bet"                                    | grep `toggle` + `aria-pressed`                                      | ✓                                                                                                                                      |
| Load-More                                                                | grep `Load More`                                                    | ✓                                                                                                                                      |
| Game-Tags ausgeschrieben (CRASH/DICE/ROULETTE/SLOTS/BLACKJACK)           | grep                                                                | ✓                                                                                                                                      |
| Font-Vars (`--font-sans`/`--font-mono`) konsistent                       | grep                                                                | ✓ Plus Jakarta Sans + JetBrains Mono                                                                                                   |
| Spacing-Skala `--sp-1…--sp-6`                                            | grep                                                                | ✓                                                                                                                                      |
| `--text-dim` aufgehellt (`#6b7689`) für AA                               | Code                                                                | ✓                                                                                                                                      |
| Self-contained (keine externen Assets außer Google Fonts)                | grep externe `src`/`href`                                           | ✓                                                                                                                                      |
| Closing-Tags / HTML-Struktur                                             | visuell-inspektiv nicht geprüft (No-Visual-Check-Regel)             | strukturell: geöffnete Tags je Section geschlossen (Header/Section/Aside/Featured) — bitte Jan HTML-Validität/Rendering visuell prüfen |

### Gegen-Check vs. Plan (P1–P9 Abdeckung)

- **P1 Tokens/Querschnitt:** ✓ Spacing-Scale, `--text-dim` aufgehellt, `:focus-visible`, reduced-motion, `aria-label`/`aria-pressed`.
- **P2 Hintergrund:** ✓ `-webkit-mask`, Mobile-Blob-Reduktion, `will-change`, emerald-Blob näher an Crash-Panel.
- **P3 Header/Nav:** ✓ Dev-Tag + Brand-Dot entfernt, Deposit-Button, Avatar-Button, Mobile-Hamburger+JS.
- **P4 Metrics:** ✓ Hero-Metric (Net P/L span 2, 32px), Sparklines, Delta-Pfeile, konsistente Live-Labels, rechtsbündig.
- **P5 Bet-Stream:** ✓ Sticky thead + scroll, Button-Chips `aria-pressed`, Auto-Refresh-Toggle, Load-More, ausgeschriebene Game-Tags, Provably-Fair-Chevron pro Row, numerisch rechtsbündig, Zeilenanzahl.
- **P6 Crash:** ✓ Multi einfarbig + x akzent, animierte Platinum-Progress, Recent-Busts, Bet-/Auto-Cashout-Inputs, Cashout-Disabled-State (CSS vorhanden).
- **P7 Payouts:** ✓ Avatare, Rang-Hierarchie r1/r2/r3, "Du"-Row + YOU-Badge, Game/Zeit-Meta, View-all-Link.
- **P8 Featured:** ✓ Mono-Monogram-Badges, PLAY→-Affordance, Spielerzahl, Desc-Truncation, Hero-Card (Crash) breiter.
- **P9 A11y/Perf-Final:** ✓ `:focus-visible` universell, reduced-motion, Mobile-Blob-Last reduziert, self-contained.

### Bekannte Grenzen (bewusst, nicht visuell behandelbar)

- HTML-Rendering-Validität, visuelle Hierarchie, Kontrast-Wirkung, Hover-Fühlbarkeit, Sparkline-Lesbarkeit, Mobile-Dropdown-Usability → **Jans visuelle QA** (No-Visual-Check-Regel).
- Cashout-Disabled-State ist CSS-seitig definiert (`:disabled`), im Mockup aktiv geschaltet (Runde läuft) — Disabled-Optik erst sichtbar wenn `disabled`-Attribut gesetzt (bewusst nicht gesetzt, da "live round").

**Ergebnis:** v2 deckt P1–P9 vollständig ab. Strukturell sauber. Visuelle Freigabe → Jan.
