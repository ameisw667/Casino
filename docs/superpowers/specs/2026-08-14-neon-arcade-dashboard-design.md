# Neon Arcade Dashboard Design Specification

## Ziel und Scope

Die Route `http://localhost:3015/testing/neon-arcade-dashboard` zeigt das neue Dashboard als isolierte Test-Komponente. Sie übernimmt die räumliche Klarheit und spielerische Energie von `reference_option_1_neon_arcade.html`, kopiert aber weder den alten Casino-Look noch die grellen Neonakzente des Prototyps. Die produktive Startseite `/` sowie `/games`, `/history`, `/leaderboard`, `/vault` und `/stats` bleiben funktional und visuell unverändert.

Der Dashboard-Umbau umfasst:

- eigenständige Sidebar, Topbar, Hero, Spielübersicht und Insights für die Testseite;
- Store-gebundene Balance-, Rank-, XP-, Community- und Aktivitätsdaten;
- echte Navigation zu vorhandenen Casino-Routen;
- responsive Desktop-/Tablet-/Mobile-Komposition;
- relevante CSS-/SVG-Visualisierungen statt dekorativer Emojis oder austauschbarer Iconflächen;
- keine neue npm-Abhängigkeit und keine Änderung an Casino-Backend, Wallet oder Spielregeln.

## Evaluierte Architekturansätze

| Ansatz                                                          | Vorteil                                                                           | Risiko                                                                                                       | Entscheidung |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| Bestehendes `MainLayout` und aktuelle Home-Komponenten restylen | Weniger neue Dateien                                                              | Übernimmt zwangsläufig alte Struktur, Inline-Styles und globale Gold-/Glow-Tokens; beeinflusst andere Routen | Verworfen    |
| Eigenständige Testseite unter `/testing/*`                      | Klare Isolation, freie Art Direction, vorhandene Daten und Routen bleiben nutzbar | Testseite muss Store-Initialisierung und mobile Navigation selbst übernehmen                                 | Ausgewählt   |
| Statischen HTML-Prototyp einbetten                              | Schnellste visuelle Nähe                                                          | Keine echten Daten, schlechte Accessibility und doppelte Navigation                                          | Verworfen    |

## Drei Stakeholder-Perspektiven

### 1. Player / Product

- Die erste Bildschirmhöhe muss sofort drei Fragen beantworten: Was kann ich spielen, was ist mein aktueller Status und welche Aktivität ist live?
- Hauptaktionen sind „Play featured“, „Browse all games“ und direkte Game-Cards; sekundäre Casino-Systeme dürfen die Spielauswahl nicht überlagern.
- Balance, Rank, Community-Ziel und letzte Ergebnisse verwenden echte Store-Werte oder verständliche Nullzustände.
- Mobile bleibt eine echte Dashboard-Erfahrung mit Drawer-Navigation, nicht nur eine zusammengeschobene Desktop-Seite.

### 2. Creative Director / Brand

- „Classy playful“ wird durch hochwertige Proportionen, kontrollierte Rundungen, Materialkanten und spielbezogene Visualisierungen erreicht, nicht durch permanenten Glow.
- Palette: Ink/Petrol als Basis, Aubergine und Terrakotta für Atmosphäre, gedämpftes Lime nur für primäre Aktionen und positive Signale, warmes Off-White für Text.
- Keine Fotocollagen, keine Emoji-Illustrationen, keine kopierten Referenzassets. Crash-Kurve, Roulette-Rad, Kartenfächer, Dice-Distribution und Slot-Reels entstehen als eigene CSS-/SVG-Systeme.
- Messaging: „Pick your pace. Own the run.“ verbindet Spielenergie mit Kontrolle und wirkt erwachsener als reine Jackpot-Kommunikation.

### 3. Frontend / Accessibility / Trust

- Die Testseiten-Route bleibt ein Server-Entry mit einem fokussierten Client-Dashboard; Interaktion liegt in einer Client-Komponente, statische Konfiguration und Ableitungen in einem reinen Modellmodul.
- Navigation verwendet `next/link`, ein H1, semantische `nav`-/`section`-Elemente, `aria-current`, benannte Buttons und `:focus-visible`.
- Decorative Visuals sind `aria-hidden`; Datenvisualisierungen haben Textlabels bzw. sichtbare Legenden.
- `prefers-reduced-motion` deaktiviert Ambient-Motion; Tablet und Mobile dürfen kein horizontales Overflow erzeugen.
- Die vorhandene `/testing/*`-Isolation in `ClientShell` wird unverändert genutzt; dadurch erhält die Komponente ihre eigene Bühne, ohne den produktiven Shell-Code zu verändern.

## Gemeinsamer Nenner

Das Dashboard wird als „private arcade floor“ gestaltet: ruhig genug für Vertrauen, lebendig genug für Spielspaß. Der Hero kombiniert klare Value Proposition und CTA mit einem Live-Floor-Pulse, der Volatilitätsmix und offene Tische sichtbar macht. Darunter folgen fünf echte Spielziele mit jeweils einer eigenen, zum Spiel passenden Visualisierung. Ein Insight-Bereich verbindet Session-Kennzahlen, Community-Fortschritt und letzte Live-Ergebnisse.

## Informationsarchitektur und Messaging

1. **Sidebar** — Marke, Lobby/Games/My Bets/Leaderboard/Vault/Stats, Rank-Run, Fairness-Hinweis.
2. **Topbar** — Live-Status, Balance, Deposit-/Login-Ziel und Nutzerstatus.
3. **Hero** — „Pick your pace. Own the run.“; CTA zu `/games/crash` und `/games`; Live-Floor-Pulse mit Low/Mid/High Mix.
4. **Game Floor** — Filter „Featured“, „Fast rounds“, „Table“, „All“; fünf Datenkarten für Crash, Roulette, Blackjack, Dice und Slots.
5. **Your Pulse** — Total wagered, win rate, best multiplier und aktuelle Rank-Progression.
6. **Live Floor** — letzte Gewinne aus `allBets`; klarer Empty State, wenn noch keine Aktivität existiert.
7. **Community Run** — Fortschritt aus `communityWagered / communityGoal` und Link zum Leaderboard.

## Datenmodell

`neon-arcade-dashboard-model.ts` exportiert:

- `DASHBOARD_GAMES`: unveränderliche Game-Konfiguration mit `id`, `name`, `category`, `path`, `eyebrow`, `description`, `maxPayout`, `tone`, `visual`;
- `deriveDashboardMetrics(allBets)`: robuste Aggregation für `totalWagered`, `winRate`, `bestMultiplier`, `recentWins` und `activityBars`;
- `formatDashboardMoney(value)`: deterministische USDC-Darstellung;
- Typen für Game- und Bet-Projektionen.

Null-/Fehlerverhalten:

- leere oder unvollständige Bet-Listen ergeben `0`-Werte und eine stabile siebenstellige Activity-Serie;
- nicht-finite Beträge werden bei der Aggregation ignoriert;
- Community-Prozent wird zwischen 0 und 100 geklemmt;
- Balance-Visibility bleibt lokal und verändert keine Walletdaten.

## Komponentenstruktur

- `src/app/testing/neon-arcade-dashboard/page.tsx` — Metadata und isolierter Testseiten-Entry.
- `src/components/home/NeonArcadeDashboard.tsx` — Store-Bindings sowie lokale Filter-/Drawer-/Balance-Interaktion.
- `src/components/home/NeonArcadeDashboardView.tsx` — reine, testbare View für Sidebar, Topbar, Hero, Game Floor und Insights.
- `src/components/home/NeonArcadeDashboard.module.css` — isoliertes Token-, Layout-, Visualisierungs-, Motion- und Responsive-System.
- `src/components/home/neon-arcade-dashboard-model.ts` — statische Game-Daten und reine Kennzahlenableitungen.
- `src/components/layout/ClientShell.tsx` — bereits vorhandene `/testing/*`-Standalone-Regel; bleibt unverändert.

## Design Tokens

| Rolle          | Wert      | Verwendung                     |
| -------------- | --------- | ------------------------------ |
| Canvas         | `#07171b` | Seitenhintergrund              |
| Sidebar        | `#081317` | Navigationsebene               |
| Surface        | `#103238` | Standardkarten                 |
| Surface Raised | `#17434a` | Hero-/interaktive Flächen      |
| Aubergine      | `#5b4b82` | atmosphärischer Gegenpol       |
| Muted Lime     | `#c9df70` | primäre CTA und positive Daten |
| Terracotta     | `#d98766` | High-volatility-/Crash-Akzent  |
| Soft Teal      | `#68b8af` | Live-/Trust-Signale            |
| Warm Ink       | `#f3f4e8` | Primärtext                     |
| Muted Text     | `#a8b9b5` | Sekundärtext                   |

Kontrastregel: Lime, Terrakotta und Aubergine dürfen nie gleichzeitig als gleichgewichtige CTA-Farben auftreten. Lime ist die einzige Primäraktionsfarbe; andere Töne bleiben Visualisierungs- und Flächenakzente.

## Accessibility und Responsive

- 44px Mindest-Touchziele; Mobile-Drawer mit `aria-expanded`, Overlay-Close und Escape-Key.
- Alle Links haben sichtbare Fokuszustände und verständliche Namen.
- Charts enthalten sichtbare numerische Labels; SVGs sind dekorativ, wenn die Information bereits als Text daneben steht.
- Breakpoints: 1180px kompakte Sidebar, 900px Drawer-Shell, 640px einspaltige Hero-/Card-/Insight-Komposition.
- Motion beschränkt sich auf langsame Ambient-Drift und Hover-Lift; keine pulsierenden Neon-Glows.

## Test- und Verifikationsstrategie

- Unit-Test der Metrikableitung mit Empty State, gemischten Bets und nicht-finiten Werten.
- Unit-Test der Game-Konfiguration auf eindeutige IDs, echte Route-Ziele und vollständige Visualtypen.
- Render-Vertrag der View: H1, semantische Navigation, fünf echte Game-Ziele, Drawer-, Balance- und Filterzustände.
- ESLint nur auf neu/gezielt geänderten Dateien; TypeScript ohne Incremental Cache; relevante Vitest-Dateien; Production Build.
- Browserprüfung auf 1280×720, 1024×768 und 390×844; Console Error/Warning, Overflow, H1, Links, Filter und Mobile-Drawer.

## Spec-Self-Review

- **Vergessene Store-Initialisierung ergänzt:** Weil die Testseite das `MainLayout` umgeht, initialisiert das Dashboard Rehydration und API-Snapshot selbst.
- **Produktionsrisiko entfernt:** Weder `src/app/page.tsx` noch `ClientShell` werden verändert; die neue Variante lebt vollständig unter `/testing/neon-arcade-dashboard`.
- **Scope-Widerspruch bereinigt:** Alle produktiven Routen behalten ihr bestehendes Layout; nur die Testseite zeigt die neue Art Direction.
- **Visualisierungsanforderung konkretisiert:** Jede Game-Card besitzt einen eigenen Visualtyp; Navigation-Icons sind funktional, aber keine Ersatzvisualisierung.
- **Kontrastregel ergänzt:** Nur gedämpftes Lime dient als Primär-CTA; andere Akzente konkurrieren nicht um Aktionen.
- Keine Platzhalter, offenen Architekturentscheidungen oder neuen Backend-Abhängigkeiten verbleiben.
