# Anti-Patterns — verboten in Casino-UI

Vor jeder Fertigmeldung vollständig durchgehen. Jeder Treffer = Korrektur oder
BLOCKED (B2), keine stillschweigende Ausnahme.

## A1 — Dunkelblaue Kasten-Töne ❌

Jans ausdrückliche Ablehnung („soll der schwarze Ton wie bei /leaderboard sein"):

- **Slate-Familie:** `#1e293b`, `#0f172a`, `rgba(15,23,42)`, `rgba(30,41,59)` — z. B. gefunden in `blackjack/CardHand.tsx:66`, `CardHandV2.tsx:59` (`bg-blue-900/60`)
- **Blau-stichige Flächen-Gradients:** `rgba(24,24,32)`, `rgba(16,18,26)`, `rgba(20,22,28)`-Familie — der bisherige Seiten-Panel-Look auf /games, /history, /vault, /stats
- **Ersetze durch:** Neutral-Schwarz-Familie (`#111111`, `#121212`, `#141414`, Border `#222222`) — Referenz R5
- **Scope (Jan 2026-09-06):** Umstellung nur auf /games, /history, /vault, /stats **plus** Slate-Skeletons (`GameSkeleton`); App-Hintergrund bleibt `#0B0E14`; Blackjack-Tisch-Look (`#152238 → #0c1524`, `BlackjackActions.tsx:58`) ist dokumentierte Ausnahme (bewusster Spiel-Look, behalten)
- Historische Selbstdiagnose des Projekts: `src/app/testing/7.1/parts/StatusQuoSection.tsx:138` („Bläuliches `#1e293b` entspricht nicht Obsidian-Dark")

## A2 — Unmodifizierte Standard-Icons ❌

„Kinderhaft aussehende" Default-Icons. **Endzustand (Jan 2026-09-06): ganz ohne Icons.**

- **Regel:** Keine Icons in Casino-UI — Typografie, Farbe und Flächen tragen die Hierarchie. Kein neues Icon hinzufügen; bestehende entfernen, wenn die Fläche ohnehin angefasst wird.
- Einzige Ausnahme bleibt offen: Falls Jan später doch einen minimalen Set will, ist das ein B2-Fall (Rückfrage), keine Eigenentscheidung.

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
