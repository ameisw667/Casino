# Neon Arcade Complete Lobby — Design Specification

## Ziel und Scope

Die bisher isolierte Neon-Arcade-Oberfläche wird unter `/neon-arcade` zu einer vollständigen, eigenständigen Casino-Lobby ausgebaut. Der bestehende Game Floor bleibt erhalten. Neu hinzukommen ein erwachseneres Colourway, ein nachvollziehbarer Jackpot- und Trust-Snapshot, ein Daily-Tournament-Modul sowie eine aus der echten VIP-Konfiguration abgeleitete Rewards-Strecke. Die produktive Startseite `/` und die Spielregeln bleiben unverändert. Die bisherige Test-URL bleibt als nicht indexierte Vorschau erhalten.

## Drei evaluierte Colourways

| Variante               | Charakter                                                     |  Reife | Klarheit | Markenfit |                                   Risiko |    Gesamt |
| ---------------------- | ------------------------------------------------------------- | -----: | -------: | --------: | ---------------------------------------: | --------: |
| **A — Deep Verdigris** | Sattes dunkles Grünblau, warmes Ivory, kontrolliertes Citrine | 9.5/10 |     9/10 |    9.5/10 |                                  Niedrig | **46/50** |
| B — Burnished Slate    | Graphit, Messing und kühles Blau                              |   9/10 |   8.5/10 |      8/10 | Mittel: verliert Casino-Eigenständigkeit |     40/50 |
| C — Aubergine Mineral  | Aubergine, Tinte und gedämpftes Gold                          | 8.5/10 |   7.5/10 |    8.5/10 | Hoch: wirkt schneller luxuriös-verspielt |     38/50 |

**Entscheidung:** Deep Verdigris. Die Richtung ist sichtbar satter als der aktuelle Carbon-Mineral-Pass, bleibt aber frei von Neon-Glow. Lime/Citrine wird auf Auswahl, primäre Aktionen und Fortschritt begrenzt.

### Verbindliche Tokens

```css
--canvas: #061a1b;
--sidebar: #071718;
--surface: #10302f;
--surface-raised: #183b38;
--surface-soft: #0b2828;
--warm-ink: #f3efe3;
--muted: #aabab3;
--line: rgba(236, 240, 225, 0.14);
--line-strong: rgba(236, 240, 225, 0.25);
--lime: #c3cc75;
--teal: #52ab9b;
--saffron: #c6924f;
--terracotta: #c46c59;
--aubergine: #756d96;
--felt: #125a49;
--felt-deep: #0a4036;
--shadow: 0 28px 90px rgba(0, 9, 10, 0.46);
```

## Stakeholder-Review

| Perspektive        | Priorität                                                            | Konflikt                                                                         | Verbindliche Entscheidung                                                                                                   |
| ------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Player/Product     | Schneller Einstieg, Vertrauenssignale, täglicher Rückkehrgrund       | Viele Module können die primäre Spielroute verwässern                            | Hero und Game Floor bleiben zuerst; Jackpot, Turnier und Rewards folgen als klar getrennte Kapitel                          |
| Creative Direction | Reichere Farbe, eigene Casino-Sprache, kein generisches Bento        | Mehr Akzente können erneut kindlich/neonartig wirken                             | Pro Komponente nur eine chromatische Hauptrolle; farbige Vollflächen unter ca. 20 % der Seite                               |
| Engineering/Trust  | Ehrliche Daten, stabile Hydration, Tastatur- und Mobile-Tauglichkeit | Gewünschte „Live“-Kennzahlen besitzen aktuell keine autoritative Plattformquelle | Server-Snapshot mit Zeitstempel und ehrlichen Zuständen; keine Zufallsanimation monetärer Werte und keine erfundenen Leader |

## Informationsarchitektur

1. **Hero — Pace Selector:** markanter Einstieg, zwei klare Routen, zurückhaltender Floor Pulse.
2. **Game Floor — Game Runway:** alle fünf echten Game-Routen, Filter und aktives Spotlight.
3. **Progressive Pool & Proof Ledger:** Jackpot als serverseitiger Snapshot; vier Belegwerte für total paid, average payout, bets und provably fair.
4. **Daily Tournament — Standings Board:** Countdown aus UTC-Tagesgrenzen, Preisstaffel, ehrlicher Empty State bis autoritative Platzierungen vorliegen.
5. **Rewards — Progression Rail:** aktueller VIP-Tier, konfigurierter Rakeback, XP bis zum nächsten Tier und nachvollziehbare Stufen.
6. **Session & Community:** bestehende persönliche und gemeinschaftliche Signale.

Jackpot, Tournament und Rewards verwenden bewusst unterschiedliche casino-native Formen (Ledger, Standings Board, Progression Rail), nicht sechs gleichartige Karten.

## Daten- und Zustandsvertrag

- `createNeonLobbySnapshot(now)` erzeugt serverseitig einen deterministischen Snapshot mit `asOf`, Jackpot, Proof Metrics und UTC-Turnierfenster. Keine Zufallswerte.
- Der Client lädt `/api/neon-arcade/lobby` mit den Zuständen `loading`, `ready` und `unavailable`. Alle drei Zustände sind sichtbar und verständlich.
- Jackpot-Beträge werden nicht im Browser hochgezählt. „Live“ wird nicht für unbestätigte Werte verwendet; die Oberfläche spricht von einem zeitgestempelten „Floor snapshot“.
- Das Turnier zeigt ohne autoritative Leader keine erfundenen Namen. Stattdessen werden Preisleiter, Qualifikationsstatus und Rules-Link dargestellt.
- `deriveLobbyRewards(xp, vipTiers)` verwendet ausschließlich aktive, nach `minXp` sortierte Tiers. Fortschritt wird zwischen aktuellem und nächstem Tier berechnet; Max-Tier ist explizit abgeschlossen.
- Der Container lädt die vorhandene Casino-Konfiguration und verwendet bis zur Antwort die bereits im Store vorhandenen Defaults.
- Der Countdown wird erst nach Mount aus `endsAt` abgeleitet, bei invaliden Daten als `--:--:--` und bei Ablauf als `00:00:00` gerendert.

## Routing

- Kanonische Oberfläche: `http://localhost:3015/neon-arcade`.
- Vorschau-Alias: `http://localhost:3015/testing/neon-arcade-dashboard`, weiterhin direkt aufrufbar, aber `noindex`.
- Beide Routen rendern dieselbe Komponente und umgehen den produktiven `MainLayout`-Shell.
- Interne Dashboard-/Brand-Links zeigen auf `/neon-arcade`.
- Lobby-Page und Lobby-API sind im Proxy explizit öffentlich; Casino-Konfigurations-API behält ihre vorhandene Auth-/Fallback-Logik.

## Accessibility und Interaktion

- Landmark-Hierarchie, genau ein `h1`, fortlaufende `h2`-Kapitel und echte Links/Buttons.
- Primäre Citrine-Flächen erreichen mindestens 7:1 Textkontrast; Standardtext mindestens 4.5:1.
- Drawer schließt via Backdrop und Escape; beim Öffnen erhält der Close-Button Fokus, Tab bleibt im Drawer, beim Schließen geht Fokus zum Menü-Button zurück.
- Countdown verwendet `<time>`, Statusmeldungen `role="status"` ohne aggressive Live-Region.
- `prefers-reduced-motion` deaktiviert dekorative Animationen und Transforms.
- Breakpoints 1280×720, 1024×768 und 390×844 besitzen keinen Seiten-Overflow; Inhaltsraster gehen 4 → 2 → 1 Spalte.

## Risiken und Gegenmaßnahmen

| Risiko                                       | Auswirkung                     | Gegenmaßnahme / Test                                                          |
| -------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| Marketingwerte wirken fälschlich live        | Vertrauensverlust              | „Floor snapshot“ + `asOf`; keine laufende Geldanimation; API-Contract-Test    |
| VIP-Prozentwerte widersprechen Konfiguration | Falsche Belohnungsversprechen  | Rewards rein aus `vipTiers`; Unit Tests für Zwischen- und Max-Tier            |
| Countdown erzeugt Hydration-Differenz        | React-Warnung / Flackern       | SSR-Platzhalter, Aktualisierung nach Mount, Browser-Konsole prüfen            |
| API oder Config nicht verfügbar              | Leere/kaputte Module           | Sichtbare Unavailable-/Fallback-Zustände; keine erfundenen Ersatzdaten        |
| Neue Kapitel erzeugen generisches Bento      | Beliebige Dashboard-Wirkung    | Ledger, Board und Rail mit unterschiedlicher Geometrie und Informationsdichte |
| Sattere Farben werden erneut neonartig       | Kinderhafte Wirkung            | Keine Bloom-Schatten; Lime nur interaktiv; maximal ein Akzent pro Modul       |
| Mobile Drawer lässt Fokus entkommen          | Tastatur-/Screenreader-Problem | Fokusfalle, Fokus-Rückgabe, Escape-Test                                       |
| Neue kanonische Route erbt MainLayout        | Doppelte Navigation            | Shell-Routing-Test für `/neon-arcade` und Alias                               |

## Akzeptanzkriterien

- Beide URLs rendern dieselbe eigenständige Lobby; `/neon-arcade` ist kanonisch.
- Deep-Verdigris-Tokens sind im Browser messbar; Hero-Hintergrund ist nicht mehr der beanstandete Carbon-Wert.
- Hero, fünf Games, Jackpot, vier Proof Metrics, Daily Tournament, VIP/Rakeback/Rewards, Session und Community sind vorhanden.
- Daten- und Fehlerzustände sind ehrlich; keine Zufalls-Jackpots, erfundenen Leader oder inkonsistenten Rakeback-Prozente.
- Filter, Room-Auswahl, Balance-Maske, Drawer, Fokusfalle und Escape funktionieren.
- Desktop, Tablet und Mobile ohne horizontalen Seiten-Overflow; Reduced Motion ohne dekorative Animationen.
- Gezielte Unit-/Render-/Routing- und E2E-Tests, ESLint, TypeScript und Production Build bestehen.

## Spec-Self-Review

- **Vollständigkeit:** Sämtliche vom Nutzer genannten Lobby-Elemente sind einem eigenen Kapitel und Datenvertrag zugeordnet.
- **Konfliktauflösung:** Produktdichte, Creative-Eigenständigkeit und Trust-Anforderungen sind in der Reihenfolge und in ehrlichen Snapshot-Zuständen zusammengeführt.
- **Konsistenz:** Farbe, Datenstatus, Routing, Accessibility, Responsive-Verhalten und technische Gates besitzen überprüfbare Akzeptanzkriterien.
- **Keine Platzhalter:** Es gibt keine TBD-/TODO-Entscheidungen. Ein fehlender autoritativer Leaderboard-Feed wird als ehrlicher Empty State spezifiziert, nicht als spätere Ausrede.
- **Scope-Schutz:** Root-Lobby, Wallet, Spielelogik und Datenbank bleiben unverändert.
