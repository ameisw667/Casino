# Anti-Patterns — verboten in Casino-UI

Vor jeder Fertigmeldung vollständig durchgehen. Jeder Treffer = Korrektur oder
BLOCKED (B2), keine stillschweigende Ausnahme.

## A1 — Dunkelblaue Kasten-Töne ❌

Jans ausdrückliche Ablehnung („soll der schwarze Ton wie bei /leaderboard sein"):

- **Slate-Familie:** `#1e293b`, `#0f172a`, `rgba(15,23,42)`, `rgba(30,41,59)` — z. B. gefunden in `blackjack/CardHand.tsx:66`, `CardHandV2.tsx:59` (`bg-blue-900/60`)
- **Blau-stichige Flächen-Gradients:** `rgba(24,24,32)`, `rgba(16,18,26)`, `rgba(20,22,28)`-Familie — der bisherige Seiten-Panel-Look auf /games, /history, /vault, /stats
- **Ersetze durch:** Neutral-Schwarz-Familie (`#111111`, `#121212`, `#141414`, Border `#222222`) — Referenz R5
- Historische Selbstdiagnose des Projekts: `src/app/testing/7.1/parts/StatusQuoSection.tsx:138` („Bläuliches `#1e293b` entspricht nicht Obsidian-Dark")

## A2 — Unmodifizierte Standard-Icons ❌

„Kinderhaft aussehende" Default-Icons (Lucide ungestylt übernommen). Entfernung läuft
in Jans paralleler Konversation — Endzustand dort abwarten.

- **Regel:** Icons nur mit bewusst gesetzter Größe, Strichstärke und Farbe — oder gar kein Icon. Ein Icon ist Deko mit Funktion (Status, Aktion), niemals Platzhalter.
- Vorlagen für gute Icon-Einbettung: RTP-Badge (`ShieldCheck size 11, color #10b981`) in `ElevatedGameCard.tsx`.

## A3 — Template-UI (ECC-Verbotsliste, geltend via CLAUDE.md-Verweis) ❌

- Uniforme Card-Grids ohne Hierarchie, Stock-Hero mit Gradient-Blob, safe gray-on-white + 1 Akzent
- Uniforme Radius/Spacing/Schatten überall (kein Rhythmus)
- Dashboard-by-numbers ohne Point of View

## A4 — Stil-Neuerfindung ❌

- Neue Farbwerte, Radien, Dauern, Schatten „aus dem Kopf" erfinden, obwohl eine Referenz existiert → Referenz R1–R5 nutzen
- Animate von Layout-Properties (`width`, `height`, `top`, `margin`, `font-size`) → nur `transform`, `opacity`, `clip-path`
- Inline-Zufallswerte für dynamische Zahlen in Serif/Sans → dynamische Zahlen immer **Monospace** `var(--font-mono)`

## A5 — Grenzverletzungen ❌

- UI-Code, der Wett-/Wallet-/RNG-/Settlement-Ergebnisse beeinflusst (0 % Client-Autorität)
- `dangerouslySetInnerHTML`, externe Fonts/CDN-Skripte ohne SRI, Secrets in Client-Components
- Bilder ohne `width`/`height` (CLS) oder als Quellauflösung weit über Rendergröße
