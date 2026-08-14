# Neon Arcade Visual Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Option 1 wird als eigenständiger Casino-Dashboard-Prototyp in zwei priorisierten Optimierungsrunden visuell präziser, hochwertiger und stärker als zusammenhängendes System ausgearbeitet.

**Architecture:** Eine self-contained HTML-Datei bleibt der einzige Ausführungsort für Layout, Design Tokens, CSS-Illustrationen und lokale Interaktion. Die Überarbeitung baut auf der vorhandenen Dashboard-Struktur auf und verbessert zuerst die sichtbare Hierarchie, Colorway und Art Direction; danach folgt ein zweiter Self-Review für Detailqualität, Responsive-Verhalten und Accessibility.

**Tech Stack:** HTML5, CSS Custom Properties, CSS Gradients/Shapes, natives Inline-JavaScript; keine externen Assets, Fonts oder npm-Abhängigkeiten.

**Spec:** `worldmap/02_FRONTEND_REDESIGN.md` §13 plus aktuelle Benutzeranforderung für die Optimierung von `reference_option_1_neon_arcade.html`.

## Global Constraints

- Nur `public/prototypes/reference_option_1_neon_arcade.html` wird als visuelles Artefakt weiterentwickelt.
- `public/prototypes/reference_option_2_night_crest.html` wird gelöscht; Option 3 bleibt unverändert.
- Kein Produktions-Store, Wallet, API, Auth-State oder App-Bundle wird verändert.
- Keine kopierten Dribbble-Assets; alle Illustrationen bleiben eigenständige CSS-Kompositionen.
- Der Prototype muss auf Desktop und 390×844 Mobile ohne horizontales Overflow funktionieren.
- `prefers-reduced-motion`, native Fokuszustände und semantische Controls bleiben erhalten bzw. werden ergänzt.

## Ausgangsprüfung

- Desktop-Render bei 1280×720: Hero, drei Promo-Karten und Sidebar vorhanden; `scrollWidth` bleibt innerhalb des Viewports.
- Ausgangsschwächen: generisches Branding, zu gleichförmige Promo-Art, konkurrierende Akzentfarben, geringe visuelle Tiefe, unpräzise Fokus-/Hover-Zustände und noch zu wenig Informationshierarchie.
- Ausgangsdatei: `public/prototypes/reference_option_1_neon_arcade.html` (self-contained, ca. 11 KB).

## Runde 1 — 15 Optimierungshebel nach Signifikanz

| Rang | Hebel                                                                                            | Signifikanz | Entscheidung                                                                        |
| ---: | ------------------------------------------------------------------------------------------------ | :---------: | ----------------------------------------------------------------------------------- |
|    1 | Colorway-Hierarchie auf Primärfarbe, Lime-CTA und kontrollierte Violet/Cyan-Akzente reduzieren   |    10/10    | Top 10, um die Seite weniger zufällig und markenstärker wirken zu lassen            |
|    2 | Hero-Art Direction mit mehreren Tiefenebenen, Glows und klarerem Mascot-/Coin-Fokus              |    10/10    | Top 10, weil der Hero den ersten Eindruck dominiert                                 |
|    3 | Typografie-System für Brand, Hero und Cards präzisieren                                          |   9.5/10    | Top 10, weil die aktuelle Systemschrift zu generisch wirkt                          |
|    4 | Promo-Karten mit unterschiedlichen visuellen Motiven statt dreimal derselben Sparkle-Form        |   9.5/10    | Top 10, um Spielangebote schneller unterscheidbar zu machen                         |
|    5 | Layout-Rhythmus und Inhaltsbreiten zwischen Header, Hero und Card-Grid harmonisieren             |    9/10     | Top 10, um den Prototyp weniger wie zusammengesteckte Blöcke wirken zu lassen       |
|    6 | Hintergrund in Canvas-, Sidebar- und Content-Ebene mit subtiler Textur/Lichtstaffelung aufteilen |    9/10     | Top 10, um Tiefe ohne weitere große Elemente zu erzeugen                            |
|    7 | Sidebar-Branding und Navigation als hochwertiges Produkt-Element schärfen                        |   8.5/10    | Top 10, weil Sidebar und Markenkürzel aktuell unfertig wirken                       |
|    8 | Border-, Radius- und Shadow-System vereinheitlichen                                              |   8.5/10    | Top 10, um die vielen runden Flächen präziser und weniger „template-like“ zu machen |
|    9 | CTA-/Card-Actions mit sichtbarer Hover-, Press- und Focus-Hierarchie versehen                    |    8/10     | Top 10, um die Interaktionssprache glaubwürdiger zu machen                          |
|   10 | Utility-Header um Live-/Balance-Kontext ergänzen, ohne zusätzliche Dichte zu erzeugen            |    8/10     | Top 10, um die Dashboard-Anmutung zu stärken                                        |
|   11 | Mobile Hero-Art und Card-Stack gegen Cropping/Überdeckung absichern                              |   7.5/10    | Runde 2 Self-Review-Kandidat                                                        |
|   12 | Content-Copy und Naming zu einer konsistenten Casino-Microcopy vereinheitlichen                  |    7/10     | Runde 2 Self-Review-Kandidat                                                        |
|   13 | Motion für Hero-Atmosphäre und Card-Feedback mit Reduced-Motion-Fallback ergänzen                |    7/10     | Runde 2 Self-Review-Kandidat                                                        |
|   14 | Accessibility-Signale für Button-Fokus, Kontrast und dekorative Art nachschärfen                 |    7/10     | Runde 2 Self-Review-Kandidat                                                        |
|   15 | Kleine Trust-/Status-Indikatoren ergänzen, ohne eine echte Produktfunktion vorzutäuschen         |    6/10     | Runde 2 Self-Review-Kandidat                                                        |

### Runde-1-Implementationsschritte

- [x] 1. Design Tokens für Palette, Textfarben, Rahmen, Radien und Schatten neu ordnen.
- [x] 2. Hero-Hintergrund mit kontrollierter Cyan-/Violet-Lichtachse und zusätzlicher Tiefenebene überarbeiten.
- [x] 3. Hero-Typografie und Brand-Lettering auf eine konsistente, engere Display-Hierarchie setzen.
- [x] 4. Mascot, Burst, Coins und zusätzliche Orbit-/Glow-Ebene klarer komponieren.
- [x] 5. Promo-Karten in Slot, Cashback und Table-Heat visuell differenzieren.
- [x] 6. Canvas-/Sidebar-/Content-Hintergrund und Section-Spacings harmonisieren.
- [x] 7. NEON ARCade-Branding, Sidebar-Label und Nav-Zustände bereinigen.
- [x] 8. Border-/Radius-/Shadow-Tokens über Hero, Cards und Controls konsistent anwenden.
- [x] 9. Hover, `:focus-visible` und pressed feedback für Navigation, CTAs und Promo-Buttons ergänzen.
- [x] 10. Header um kompakten Live-/Balance-Kontext ergänzen und dabei Mobile-Dichte begrenzen.

## Runde 2 — Self-Review nach Runde 1

Nach dem ersten Render wird die Seite erneut aus den Perspektiven Creative Direction, Frontend/Responsive und Accessibility/Trust geprüft. Die zehn vorgesehenen Nachprüfungshebel sind:

| Rang | Weiteres Potenzial                                                          | Signifikanz nach Runde 1 | Geplante Entscheidung                             |
| ---: | --------------------------------------------------------------------------- | :----------------------: | ------------------------------------------------- |
|    1 | Mobile Hero-Proportionen, Art-Cropping und CTA-Zeilenlänge                  |          9.5/10          | Top 7                                             |
|    2 | Mehr echte Spielkarten-Anmutung durch Mini-UI-Artefakte in der Promo-Art    |           9/10           | Top 7                                             |
|    3 | Konsistente Content-Copy und sichtbare Statuslabels                         |          8.5/10          | Top 7                                             |
|    4 | Subtile, deterministische Motion für Ambient-Orbs und Card-Hover            |          8.5/10          | Top 7                                             |
|    5 | Kontrast- und Fokusbehandlung auf allen dunklen Flächen                     |           8/10           | Top 7                                             |
|    6 | Sidebar-/Header-Trennung bei kompakten Viewports                            |           8/10           | Top 7                                             |
|    7 | Layered shadows und Highlight-Kanten für mehr Materialität                  |          7.5/10          | Top 7                                             |
|    8 | Reduktion möglicher dekorativer Überlagerungen hinter Text                  |           7/10           | Nicht Top 7, nur falls Renderprüfung erforderlich |
|    9 | Footer-/Prototype-Hinweis leiser und besser in den Contentfluss integrieren |           6/10           | Nicht Top 7                                       |
|   10 | Kleine Status-/Live-Dots als visuelles Bindeglied zwischen Header und Cards |           6/10           | Nicht Top 7                                       |

### Runde-2-Implementationsschritte

- [x] 1. Mobile Hero-Höhe, Art-Position und CTA-Wrap auf 390×844 korrigieren.
- [x] 2. Promo-Art um drei unterschiedliche Mini-Artefakte mit klarer Slot-/Cashback-/Table-Semantik ergänzen.
- [x] 3. Copy- und Statuslabels auf ein einheitliches „floor / run / boost“-Vokabular bringen.
- [x] 4. Niedrig-amplitudige CSS-Motion mit `prefers-reduced-motion`-Fallback ergänzen.
- [x] 5. Kontrast, `:focus-visible` und Textüberlagerungen auf Desktop und Mobile erneut prüfen.
- [x] 6. Kompakte Sidebar-/Header-Trennung und Touch-Zielgrößen absichern.
- [x] 7. Layered highlights/shadows für Hero, Promo-Karten und Controls verfeinern.

## Verifikation und Abschlusskriterien

- `reference_option_2_night_crest.html` existiert nicht mehr.
- Option 1 lädt per HTTP mit `200 OK` und enthält genau ein H1.
- Inline-JavaScript lässt sich per `vm.Script` parsen; Browser-Konsole bleibt ohne Error/Warning.
- Desktop 1280×720 und Mobile 390×844 zeigen keinen horizontalen Overflow.
- Mobile: Sidebar ausgeblendet, CTA erreichbar, Hero-Art nicht über dem Haupttext zerstört, drei Karten untereinander lesbar.
- `git diff --check` und der HTML-/Inline-JavaScript-Parse bleiben erfolgreich; TypeScript-/Build-Läufe werden als Repository-Baseline geprüft.
- Worldmap-Dokumentation enthält Ranking, beide Self-Audits, neue URL und die finalen Prüfresultate.

## Plan-Self-Review und Abschluss

- Der Plan deckt beide vom Benutzer geforderten Priorisierungsrunden, alle 15 Ersthebel, 10 zweite Potenziale und die Umsetzungen Top 10 + Top 7 ab.
- Bei der Renderprüfung wurde als zusätzlicher Punkt `aria-hidden` für dekorative Hero-/Card-Art ergänzt; dadurch werden CSS-Illustrationen nicht als unverständlicher Inhalt vorgelesen.
- `type="button"` wurde bei den neuen lokalen Controls ergänzt, damit die Testseite beim späteren Einbetten nicht versehentlich Submit-Verhalten erbt.
- Die einzige relevante Mobile-Auffälligkeit — zu dominante Hero-Art im unteren Bereich — wurde in Runde 2 mit kleinerer Art-Fläche, tieferem Crop und stabiler CTA-Z-Indexierung korrigiert.
- Der TypeScript-/Build-Audit wurde ausgeführt, bleibt aber wegen eines bestehenden Imports auf die nicht vorhandene Datei `src/components/auth/auth-validation` rot; keine der betroffenen `src`-Dateien wurde in diesem Durchlauf verändert.
- Planstatus: **ausgeführt und selbstgeprüft**.
