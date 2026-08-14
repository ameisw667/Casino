# Neon Arcade Dashboard — Optimization Design Specification

## Ziel und Scope

Die isolierte Testseite `http://localhost:3015/testing/neon-arcade-dashboard` erhält einen zweiten visuellen Design-Pass. Die bestehende Datenanbindung, Game-Routen und produktive Startseite `/` bleiben unverändert. Ziel ist eine lebendigere, erwachsenere und klarer kuratierte Casino-Oberfläche, die weder wie ein generisches Bento-Dashboard noch wie ein entsättigter „VibeCoding“-Entwurf wirkt.

## Audit des Ist-Zustands

- Der Selektor `.dashboard a` besitzt höhere Spezifität als `.navItemActive` und `.accountAction`. Dadurch werden dunkle Texte auf Lime-Flächen im Browser weiß dargestellt; der angehängte Screenshot dokumentiert diesen Kontrastfehler.
- Das Featured-Raster setzt Crash über zwei Spalten, Roulette rechts daneben und Blackjack in die nächste Zeile links. Rechts neben Blackjack entsteht eine große ungenutzte Fläche.
- Die Roulette-Visualisierung ist ein kleines, perspektivisch gekipptes Rad ohne Tischkontext. „European Table“ bleibt dadurch eine Beschriftung statt einer erkennbaren Spielerfahrung.
- Die Blackjack-Visualisierung zeigt drei frei schwebende Karten. Dealer, Spielerhand, Felt, Einsatz und Tischbogen fehlen; „Private Table“ wirkt wie ein Platzhalter.
- Fast alle Flächen verwenden ähnliche Petrolwerte, identische Radien und dieselbe Border-Logik. Die Seite wirkt statisch, flach und modular zusammengesteckt.
- Lime, Teal, Terrakotta und Aubergine sind stark gedämpft. Weil Flächen und Akzente ähnliche Luminanz besitzen, verliert die visuelle Hierarchie Energie.

## Zehn Optimierungshebel

Signifikanz bewertet die Relevanz für die Nutzerkritik; Impact bewertet die erwartete sichtbare Verbesserung. `Top 8` werden umgesetzt.

| Nr. | Quelle         | Optimierungshebel                                                                        | Signifikanz | Impact | Entscheidung                                                          |
| --- | -------------- | ---------------------------------------------------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------- |
| 1   | Nutzer + Audit | CSS-Kaskade und Kontrastrollen für alle interaktiven Flächen isolieren                   | Kritisch    | 10/10  | **Top 8**                                                             |
| 2   | Nutzer         | European Table als vollständige Roulette-Tischszene neu gestalten                        | Kritisch    | 9/10   | **Top 8**                                                             |
| 3   | Nutzer         | Private Table als vollständige Blackjack-Tischszene neu gestalten                        | Kritisch    | 9/10   | **Top 8**                                                             |
| 4   | Nutzer + Audit | Starres Bento-Grid durch interaktive „Game Runway“ mit Spotlight und Room Index ersetzen | Kritisch    | 10/10  | **Top 8**                                                             |
| 5   | Nutzer         | Fahle Palette durch reichere, semantisch begrenzte Farben ersetzen                       | Hoch        | 9/10   | **Top 8**                                                             |
| 6   | Eigenanalyse   | Bedeutungsvolle Motion für Spotlight, Kurve, Rad, Karten und Hover ergänzen              | Hoch        | 8/10   | **Top 8**                                                             |
| 7   | Eigenanalyse   | Editoriale Typohierarchie und lesbarere Microcopy statt Mono-Übergewicht                 | Hoch        | 8/10   | **Top 8**                                                             |
| 8   | Eigenanalyse   | Uniforme Kartenmaterialität durch Felt, Hairlines, Layer und gerichtete Tiefe ersetzen   | Hoch        | 8/10   | **Top 8**                                                             |
| 9   | Eigenanalyse   | Komplette Sidebar-Informationsarchitektur neu ordnen                                     | Mittel      | 6/10   | Zurückgestellt; Navigation funktioniert, nur Kontrast wird korrigiert |
| 10  | Eigenanalyse   | Insights-Datenmodell und Kennzahlen neu strukturieren                                    | Mittel      | 6/10   | Zurückgestellt; Daten sind korrekt und nicht Ursache der Hauptkritik  |

## Zielbild der Top 8

### 1. Interaktive Game Runway statt Bento-Grid

Der Game Floor besteht aus einem großen Spotlight und einem vertikalen Room Index. Das Spotlight zeigt genau ein Spiel in großzügiger visueller Qualität; der Index wechselt das aktive Spiel ohne Navigation. Filter begrenzen den Room Index und setzen ein nicht mehr sichtbares aktives Spiel deterministisch auf das erste passende Spiel zurück. Auf Mobile wird der Index zu einer horizontalen, scrollbaren Auswahl vor dem Spotlight.

### 2. European Table V2

Roulette erhält eine Draufsicht mit großem Wheel, Ballbahn, Zero-Segment, angedeutetem Betting Layout und lesbaren Tischsignalen. Die Szene verwendet reiches Grün/Petrol, warmes Rot, Messing und Elfenbein. Motion bleibt langsam: Wheel-Drift und Ball-Orbit statt Glow oder hektischer Rotation.

### 3. Private Table V2

Blackjack erhält eine echte halbrunde Felt-Bühne: Dealer-Zone, verdeckte Karte, Spielerhand, Chipstapel, Score und dezente Tischkante. Karten werden als Teil einer Tischkomposition gesetzt; keine schwebende Dreikarten-Illustration.

### 4. Colourway und Material

- Canvas: tiefes Ink `#041619`.
- Raised Spruce: `#0d3d40` und `#155357`.
- Warm Ivory: `#f7f1e5`.
- Action Lime: `#d7ef6d`, ausschließlich für primäre Aktionen und aktive Auswahl.
- Signal Teal: `#45c8b9`.
- Coral: `#ef8068` für High-Risk/Crash.
- Saffron: `#efb84c` für Chips, Wheel und warme Tiefenakzente.
- Iris: `#7e75c9` für Private/VIP-Kontext.

Flächen unterscheiden sich über gerichtete Verläufe, Inset-Hairlines, Schatten und Materialtexturen; nicht jede Einheit erhält dieselbe Karte mit demselben Radius.

### 5. Typografie, Controls und Motion

- Display-Text bleibt klar und groß, wird aber kompakter, damit der Game Floor früher sichtbar wird.
- Mono bleibt für Werte, Quoten und Zustände; Beschreibungen und Actions verwenden Sans.
- Primäre Lime-Aktionen verwenden immer dunkle Schrift mit mindestens 7:1 Zielkontrast.
- Sekundäre Aktionen erhalten klar sichtbare Outline und Hover-Fill.
- Spotlight und Room Index nutzen kurze Transitionen; Game-Visuals erhalten langsame, inhaltliche CSS-Motion.
- `prefers-reduced-motion` deaktiviert alle neuen Animationen und Transforms.

## Daten- und Zustandsvertrag

- `filterDashboardGames(games, category)` liefert die sichtbare Reihenfolge ohne Mutation.
- `resolveDashboardGame(games, activeGameId)` liefert das aktive Spiel oder deterministisch das erste sichtbare Spiel.
- Der Container verwaltet `activeGameId`; beim Filterwechsel wird auf das erste passende Spiel gesetzt.
- Die View erhält `activeGameId` und `onGameSelect`; sie bleibt ohne Store testbar.
- Leere Games-Listen rendern keinen ungültigen Link und behalten eine verständliche Empty-State-Struktur.

## Risiken, Abhängigkeiten und Gegenmaßnahmen

| Risiko / Abhängigkeit                              | Auswirkung                                       | Gegenmaßnahme                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Globale CSS-Regeln überschreiben lokale Linkfarben | Unlesbare CTA und aktive Navigation              | Scoped Selektoren mit mindestens gleicher Spezifität; Browser-Kontrastmessung der tatsächlichen Computed Styles |
| Aktives Spiel verschwindet nach Filterwechsel      | Leeres oder falsches Spotlight                   | Reine Resolve-Funktion plus Container-Reset und Tests für ungültige IDs                                         |
| Große Table-Szenen erzeugen Mobile-Overflow        | Horizontales Scrollen oder abgeschnittene Karten | Intrinsische Prozentgrößen, `min-width: 0`, 390×844 Browser-Gate                                                |
| Motion wirkt wie Neon-/Casino-Kitsch               | Vertrauensverlust und Ablenkung                  | Langsame Material-/Objektbewegung, keine pulsierenden Glows, Reduced-Motion-Gate                                |
| CSS-Komplexität wächst                             | Regressionen an vorhandenen Insights             | Neue Runway-/Visualklassen isoliert halten; ungenutzte Grid-Regeln entfernen, gezieltes ESLint/TypeScript/Build |
| Live Store liefert Nullwerte                       | Visuell leerer Insights-Bereich                  | Bestehende Nullzustände und Activity-Minimum beibehalten                                                        |
| Next.js Dev Indicator überlagert Mobile-Controls   | Bedienelement nicht erreichbar                   | Bestehenden Mobile-Abstand beibehalten und visuell prüfen                                                       |

## Test- und Akzeptanzkriterien

- TDD für Filter-/Resolve-Verhalten und neue View-Verträge.
- View rendert `data-layout="game-runway"`, ein aktives Spotlight und Room-Selectoren mit `aria-pressed`.
- Roulette und Blackjack rendern eigene V2-Datenmarker und sichtbare Tischlabels.
- Computed Textkontrast für Active Nav, Sign-in, Primary CTA und Active Filter beträgt mindestens 7:1; sekundäre Game-CTA mindestens 4.5:1.
- Kein horizontales Overflow auf 1280×720, 1024×768 und 390×844.
- Filter, Game-Auswahl, Drawer, Escape und Balance-Maske funktionieren.
- Browser-Konsole ohne Error/Warning; Reduced-Motion deaktiviert Visualanimationen.
- `src/app/page.tsx` und `ClientShell.tsx` bleiben ohne Diff.

## Spec-Self-Review

- **Placeholder scan:** Keine TBD-/TODO-Punkte oder offenen Entscheidungen.
- **Consistency:** Die Top-8-Matrix stimmt mit Zielbild, Zustandsvertrag, Risiken und Akzeptanzgates überein.
- **Scope:** Nur die isolierte Testseite, ihre Komponenten, Tests und abhängige Dokumentation werden verändert.
- **Ambiguity:** „Weniger Bento“ ist konkret als ein Spotlight-plus-Room-Index-System definiert; „mehr Farbe“ ist durch feste semantische Tokens begrenzt.
- **Accessibility:** Auswahlzustände, Fokus, Kontrast und Reduced Motion sind als überprüfbare Kriterien verankert.

## Execution Validation (2026-08-14)

Die Spezifikation wurde ohne Scope-Erweiterung umgesetzt. Sämtliche Top-8-Hebel und Akzeptanzkriterien sind erfüllt. Das Browser-Self-Review führte zu drei zusätzlichen Korrekturen innerhalb des vorgesehenen Designs: Die Blackjack-Regelnotiz wurde von der Player-Zone getrennt, der Roulette-Ballradius wurde als responsive CSS-Variable modelliert und der native Scrollbalken des mobilen Room Index wurde visuell ausgeblendet. Gemessene Primärkontraste liegen zwischen 12,66:1 und 12,70:1; Desktop, Tablet und Mobile besitzen keinen horizontalen Seitenüberlauf. Tests, ESLint, TypeScript und Production Build sind grün.
