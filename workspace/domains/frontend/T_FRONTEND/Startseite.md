# Startseite - Frontend-Design-Audit & Elevation-Plan

> **Status:** Entscheidungsreif | **Frontend-only** | lokal verifiziert: 06.09.2026  
> **Route:** `http://localhost:3015/` | **Massstab:** Premium-Product-Design 2026 / Top-1-%-Anspruch  
> **Nicht im Scope:** Backend, Bonus-/Echtgeldlogik, Sicherheit, Datenwahrheit und KPIs.

## Kernaussage

Die Startseite erreicht **72/100**. Sie ist klar ueber klassischem Vibe-Coding und die Obsidian-Gold-Bildwelt hat bereits Eigenstaendigkeit. Top-1-%-Niveau erreicht sie noch nicht: Bei 1024 px beschneiden bzw. ueberlagern sich Hero, Jackpot und Game-Showcase. Zudem konkurrieren zu viele Icons, Badges und gleich starke Live-Signale um Aufmerksamkeit.

**Empfehlung:** Erst responsive Hero-Geometrie und CTA-Hierarchie reparieren. Danach Symbolsprache sowie Bild-/Motion-Dramaturgie schaerfen. Neue Effekte davor wuerden die Seite dichter, nicht hochwertiger machen.

## Verifizierter Ist-Zustand

| Pruefung                         | Ergebnis                                                                                                                                                                            | Einordnung                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Desktop, lokales Standardfenster | Bildwelt, Materialtiefe und Bento-Karten wirken wertig; der rechte Showcase ist angeschnitten.                                                                                      | Befund                          |
| 1024 x 900                       | Dreispaltiger Hero bleibt neben der festen Sidebar aktiv; CTA und Jackpot kollidieren, der Showcase verschwindet teilweise ausserhalb der sichtbaren Flaeche.                       | **P0-Fehler**                   |
| 390 x 844                        | Header, Claim, Bonus-CTA und Crash-Card ergeben eine gut lesbare vertikale Abfolge; die Bottom-Navigation ist daumengerecht.                                                        | Staerke                         |
| Quellstichprobe                  | `HomeClientV2 → BentoLobbyHome → HeroCinematicShowcase`; Headline flexibel mit Basis 420/max. 480 px, Jackpot 320 und Showcase 400 px nicht schrumpfend. Mobilezweig unter 1024 px. | Präzisierte Ursache, 06.09.2026 |

Ein Top-1-%-Screen ist nicht der mit den meisten Effekten. Er fuehrt den Blick, setzt Material gezielt ein und laesst alles weg, was keine Aufgabe hat.

## Scorecard (maximal 10 Kategorien)

> **Planungserweiterung 06.09.2026:** Zunächst Kategorien 3–6, sequenziell bearbeitet. Execution bleibt ungestartet. Ist-Scores sind heuristische Designbewertungen (100 = bestmöglich), keine gemessenen Marktperzentile. 90+ ist das zu verifizierende Ziel nach späterer Umsetzung.

|  #  | Kategorie                     |  Score  | Planungsdateien                                                                                                                             | Stärke                                                                  | Lücke zum Zielniveau                                                                   | Execution                     | Status quo                                                                                                                                                                                                                          | Neuer Status                 |
| :-: | ----------------------------- | :-----: | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
|  1  | Bildsprache & Markenwelt      | **86**  | [Plan: 10 Unterkategorien → 94](Startseite/01_Bildsprache_Markenwelt/Plan.md)                                                               | Eigene goldene 3D-/Cinematic-Assets statt Stock-Optik.                  | Keine harte Hierarchie zwischen Hero-, Game- und Mikro-Assets.                         | Nicht gestartet · nur Planung | [Desktop](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Hero](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Mobile](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png) | Ausstehend – keine Execution |
|  2  | Farbe, Material & Typo        | **84**  | [Plan: 10 Unterkategorien → 94](Startseite/02_Farbe_Material_Typo/Plan.md)                                                                  | Obsidian, Gold, Smaragd, Glas und Monospace-Zahlen sind konsistent.     | Gold ist gleichzeitig CTA, Rahmen, Badge und Glow.                                     | Nicht gestartet · nur Planung | [Desktop](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Hero](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Mobile](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png) | Ausstehend – keine Execution |
|  3  | Informationshierarchie        | **71**  | [Plan: 10 Unterkategorien → 92+](Startseite/03_Informationshierarchie/Plan.md)                                                              | Headline, Bonus und Crash Rocket sind sofort erkennbar.                 | Hauptaktionen, Demo-/Live-Rollen und semantische Outline.                              | Nicht gestartet · nur Planung | [Hero Desktop](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Hero Mobile](Startseite/Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png)                                                                 | Ausstehend – keine Execution |
|  4  | Komposition & Raum            | **70**  | [Plan: 10 Unterkategorien → 93+](Startseite/04_Komposition_Raum/Plan.md)                                                                    | Asymmetrischer Hero und Bento-Mosaik.                                   | Breitenbudget, gemeinsame Kanten, Crop und Bewegungsfreiraum.                          | Nicht gestartet · nur Planung | [Desktop](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Mobile](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png)                                                                             | Ausstehend – keine Execution |
|  5  | Responsive Design             | **62**  | [Plan: 10 Unterkategorien → 94+](Startseite/05_Responsive_Design/Plan.md)                                                                   | 390-px-Flow: Claim → Bonus → Featured Game.                             | Contentbasierte Modi, Reflow, Touch und nachweisbare Grenztests.                       | Nicht gestartet · nur Planung | [1440 × 1024](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [390 × 844](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png)                                                                      | Ausstehend – keine Execution |
|  6  | Motion & Interaktion          | **81**¹ | [Basisplan](Startseite/06_Motion_Interaktion/Plan.md) · [MotionDev/Componentry](Startseite/07_MotionDev_Componentry_Luxury_Empfehlungen.md) | Tilt, Parallax und Card-Hover vorhanden; einzelne Mobile-Sparmaßnahmen. | Reduced Motion, Pause-/Fokussteuerung, Lifecycle und Renderkosten.                     | Nicht gestartet · nur Planung | [Hero Desktop](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Hero Mobile](Startseite/Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png)                                                                 | Ausstehend – keine Execution |
|  7  | CTA & Navigation              | **72**  | [Plan: 10 Unterkategorien → 93](Startseite/07_CTA_Navigation/Plan.md)                                                                       | Bonus-CTA und Mobile-Dock sind klar.                                    | Mehrere Aktionen teilen eine Blickzone.                                                | Nicht gestartet · nur Planung | [Desktop Shell](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Mobile Dock](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png)                                                                  | Ausstehend – keine Execution |
|  8  | Glaubwürdigkeit & Premium-Ton | **62**  | [Plan: 10 Unterkategorien → 92](Startseite/08_Glaubwuerdigkeit_Premium_Ton/Plan.md)                                                         | Provably Fair, RTP und Auszahlung als mögliche Proofs.                  | Wiederholte Rating-/Live-Signale.                                                      | Nicht gestartet · nur Planung | [Hero Desktop](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Hero Mobile](Startseite/Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png)                                                                 | Ausstehend – keine Execution |
|  9  | Symbolsprache & Anti-Template | **56**  | [Plan: 10 Unterkategorien → 94](Startseite/09_Symbolsprache_Anti_Template/Plan.md)                                                          | Bestehendes Symbolinventar erkennbar.                                   | Aktuelle Referenz A2 fordert iconfreie Oberflächen; frühere Utility-Ausnahme entfällt. | Nicht gestartet · nur Planung | [Desktop Shell](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Mobile Dock](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png)                                                                  | Ausstehend – keine Execution |
| 10  | Lesbarkeit & Fokus            | **74**  | [Plan: 10 Unterkategorien → 93](Startseite/10_Lesbarkeit_Fokus/Plan.md)                                                                     | Kerntext auf Mobile lesbar.                                             | Microcopy und Badge-Reihen stellenweise zu klein/dicht.                                | Nicht gestartet · nur Planung | [Hero Desktop](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Hero Mobile](Startseite/Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png)                                                                 | Ausstehend – keine Execution |

¹ Motion: 81 ist der historische visuelle Ausgangsscore. Der Teilplan bewertet Steuerbarkeit und technische Interaktionsqualität vertieft mit 68,5/100; andere Rubrik, keine gemessene zeitliche Verschlechterung. Der ursprüngliche Gesamtscore 72 bleibt dadurch als Ausgangsaudit erhalten und ist kein neuer Mittelwert der Detailpläne.

**Planungsstand 09.09.2026:** Kategorien 1–10 sind vollständig geplant, jeweils mit zehn Unterkategorien, Ist-/Zielwerten, Bottlenecks, LLM-Aufgaben, Abnahme und Rollback. Alle zehn Scorecard-Pläne sind angelegt und verlinkt; keine Frontend-Execution ist beauftragt oder durchgeführt. Die folgenden allgemeinen Ideen stammen aus dem Erstaudit; für die spätere Umsetzung gelten die präziseren Teilpläne und ihre noch freizugebenden A/B/C-Designwahlen. Insbesondere zustandsabhängige CTAs, ein dreispaltiger Wide-Hero und zusätzliche Assets sind keine beschlossenen Änderungen.

### Vorher-/Nachher-Protokoll

**Status quo, lokal am 08.09.2026 aufgenommen:** [Desktop 1440 × 1024](Startseite/Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Desktop-Hero Crop](Startseite/Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Mobile 390 × 844](Startseite/Beweise/2026-09-08/00_status-quo_mobile_390x844.png) · [Mobile-Hero Crop](Startseite/Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png).

Die vier Dateien sind eingefrorene Vorher-Belege und werden nicht ersetzt. Nach einer konkret freigegebenen Execution entstehen neue Dateien mit Datum und Präfix `neuer-status-`; erst nach derselben Viewport-/Crop-Matrix wird die Spalte **Neuer Status** verlinkt und ein erreichter Score aktualisiert. Gefällt die Änderung nicht, wird ausschließlich der zugehörige Execution-Diff zurückgenommen; die Vorher-Belege und dieses Protokoll bleiben erhalten.

## Zielbild: A Casino With One Irresistible Moment

1. **Ein Moment above the fold:** ein Featured Game als bildstarke Einladung.
2. **Ein glaubwuerdiger Grund:** ein konkreter Trust-Proof am Moment, nicht drei Badge-Reihen.
3. **Eine Aktion:** bei neuen Nutzern Bonus aktivieren, bei eingeloggten Spielern direkt spielen; die Alternative bleibt sekundaer.
4. **Ein Aufbau danach:** Live-Proof -> Jackpot/Turnier -> VIP-Fortschritt -> Community.

Die Markenwelt bleibt. Der Qualitaetssprung kommt durch weniger, staerkere Signale und kontrollierte Dichte, nicht durch eine neue Farbe oder einen weiteren Effekt.

## Priorisierte Roadmap

### P0 - Hero fuer die tatsaechliche Breite komponieren

| Variante                 | Regel                                                                                              | Sichtbarer Effekt                         |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Wide Desktop             | Erst bei ausreichend breitem Inhaltsbereich Claim/CTA, Jackpot und Game-Showcase gemeinsam zeigen. | Cinematic-Hero bleibt das Aushängeschild. |
| Compact Desktop / Tablet | Claim + Featured Game als Hauptbuehne; Jackpot als volle, ruhige Zeile oder Nebenkarte darunter.   | Keine Kollision, groessere Fokusflaeche.  |
| Mobile                   | Bestehende Reihenfolge behalten: Claim, Bonus, Featured Game; Jackpot und Social Proof folgen.     | Schneller Spieleinstieg.                  |

- **Ausgangspunkte:** `src/components/home/HeroCinematicShowcase.tsx`, `HeroHeadlineColumn.tsx`, `hero-cinematic/JackpotPulseCard.tsx`, `hero-cinematic/GameShowcaseCard.tsx`, `src/components/layout/MainLayout.tsx`.
- **Akzeptanz:** Bei 390, 1024, 1280 und 1536 px keine abgeschnittene Oberflaeche, kein CTA ueber anderem Inhalt, kein horizontaler Body-Overflow. Der Wechsel muss die Sidebar-bereinigte Content-Breite beruecksichtigen.
- **Warum zuerst:** Geometrie ist die Voraussetzung, dass Bild, Typo und Motion hochwertig wahrgenommen werden.

### P0 - Aus fuenf Hero-Signalen ein Entscheidungsangebot machen

- Gast: Bonus als primaerer CTA, Spielhalle als Textlink.
- Eingeloggt: `Crash Rocket spielen` als primaerer CTA; Bonuscode nur sekundaer, falls relevant.
- Jackpot nicht als gleichwertigen Hero-Button behandeln, sondern als Status oder naechste Sektion.
- Trust-Chips auf **einen relevanten Proof** reduzieren, etwa `Provably Fair - jede Runde pruefbar`; RTP, Rating und Auszahlung folgen im Kontext.

**Akzeptanz:** Pro Zustand ein dominanter Button, above the fold maximal zwei CTA-Flaechen.

### P1 - Iconfreie Bedienung nach aktueller Referenz

**Korrektur 06.09.2026:** Die frühere Utility-Ausnahme ist überholt. Die aktuelle [Designreferenz A2](../../../../.claude/skills/casino-design-system-craft/references/anti-patterns.md) fordert eine iconfreie Casino-UI. Bedienfunktionen bleiben über sichtbare Textlabels, Zustandsbeschriftung und ausreichend große Trefferflächen verständlich. Die konkrete Startseiten-Migration ist in Kategorie 09 geplant und bleibt bis zur Execution unverändert.

| Klasse             | Entscheidung                                       | Beispiel                                            |
| ------------------ | -------------------------------------------------- | --------------------------------------------------- |
| Utility            | Sichtbare Textbedienelemente; 44 × 44 px Hit-Area. | Menü, Ton an/aus, Abmelden, Chat.                   |
| Navigation         | Verständliche Textlabels ohne neue Symbole.        | Lobby, Games, Vault.                                |
| Dekoration         | Entfernen oder durch Material/Typografie ersetzen. | Sterne, Blitze, Sparkles in Labels und Trust-Chips. |
| Belohnung / Status | Typografie und Material; keine neuen Icon-Embleme. | Rang, Jackpot, Gewinn.                              |

**Asset-Richtung:** Bestehende Spielillustrationen bleiben Bildinhalte. Keine neuen Icon-Embleme, eingebrannten UI-Texte oder generierten Bedienelemente. Eine spätere Asset-Neuproduktion darf ausschließlich nach dem Rollen-, Crop- und Qualitätsvertrag aus Kategorie 01 erfolgen.

### P1 - Bildwelt als Art Direction fuehren

- **Hero-Art:** eine dominante Hero-Plate mit garantiert freier Text-/CTA-Zone; das Crash-Schiff ist ein gutes Fundament.
- **Game-Art:** je Spiel andere Bewegung, Perspektive und Goldtemperatur, statt fuenf gleicher gluehender Objekt-Collagen.
- **UI-Art:** keine Bilder als Ersatz fuer Standard-Controls; Prestige-Grafik bleibt selten.
- **Generatives Briefing:** `game object + physical material + camera angle + controlled gold light + deep obsidian negative space + text-free + UI-safe left/right zone`. Jede Variante vor Einbau fuer Desktop und Mobile croppen.

### P1 - Bento-Dramaturgie lesbar machen

```text
Featured Game / Entscheidung
        ↓
Ein Trust- oder Live-Proof
        ↓
Jackpot oder Daily Race (zeitliche Dringlichkeit)
        ↓
VIP-Fortschritt (Grund zur Rueckkehr)
        ↓
Live Feed / Community (soziale Tiefe, keine Conversion-Huerde)
```

Das Mosaik bleibt erhalten, erhaelt aber klare Zonen: **spielen**, **glauben**, **wiederkommen**, **mitfiebern**. Pro Zone nur eine visuelle Lautstaerke-Spitze.

### P2 - Motion als Luxus einsetzen

- Einen Signature-Moment waehlen: Featured-Game-Wechsel oder echtes Jackpot-Eintreffen.
- Pointer-Tilt und Parallax nur bei grosser Eingabeflaeche und Budget; Compact Desktop und Touch ruhiger behandeln.
- Nie zwei pulsierende Gold-Akzente in einer Blickzone.
- `prefers-reduced-motion`, pausierende Timer und tabular numbers auf alle neuen Effekte ausdehnen.

**Abnahme:** Motion erklaert Zustand oder Prioritaet, transportiert aber nie Information allein. Jeder Effekt hat eine Ruhe- und Mobile-Variante.

## Preview-V2 als verbindliche Execution-Grenze

**Entscheidung:** Die erste vollständige Umsetzung erfolgt ausschließlich auf einer isolierten **Startseite V2 / Preview-Route**. Die aktuelle Hauptseite bleibt bis zu Jans visueller Freigabe unverändert. Die Preview ist kein loses Moodboard, sondern eine funktionsfähige Frontend-Referenz mit derselben inhaltlichen Wahrheit und denselben Startseitenpfaden; Backend-, Wallet-, Bonus-, Auth- und Echtgeldlogik werden weder kopiert noch verändert.

| Stufe                            | LLM-Aufgabe                                                                                                                                                                                  | Freigabe / Stop-Regel                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2-L0 — Isolierung               | Preview-Route, eigene Startseiten-Kompositionsschicht und klarer Rückweg zur aktuellen Hauptseite planen; zunächst keine Shared-Component oder Main-Route mutieren.                          | Wenn die Isolation nur durch globalen Shell-/Store-Umbau möglich wäre: K3-Review, keine direkte Hauptseitenänderung.                                                      |
| V2-L1 — Visuelle Basis           | Pläne 01–05 als sichtbare Basis umsetzen: Bildrollen, Materialvertrag, Hierarchie, Raum und responsive Modi.                                                                                 | Vor Motion muss die Ruheansicht bei 390/1024/1440 px bereits hochwertig, lesbar und iconfrei sein.                                                                        |
| V2-L2 — Componentry-/3D-Qualität | Nur wenige, begründete Signature-Momente einbauen: räumliche Featured-Art, reflektierende Materialtiefe und direktionales Card-Hover. Componentry/Motion.dev ist Werkzeug, nicht Dekoration. | Kein neues Paket, keine Motion+-Abhängigkeit, kein generischer 3D-Kartenstapel und kein Effekt ohne Informations- oder Interaktionsaufgabe.                               |
| V2-L3 — Interaktionsvertrag      | Plan 06, 07, 08, 09 und 10 auf die Preview anwenden: stabile Textcontrols, Focus, Reduced Motion, echte/markierte Datenzustände und ruhige CTA-Rangfolge.                                    | Wenn Fokus, Touch, Leistung oder Datenwahrheit schlechter als auf der Hauptseite sind: verursachenden V2-Diff zurücknehmen.                                               |
| V2-L4 — Visuelle Abnahme         | Datierte Nachher-Beweise im selben 390/1024/1440-Raster anlegen; V2 gegen die eingefrorenen Vorher-Beweise und diese zehn Teilpläne prüfen.                                                  | Jan entscheidet ausschließlich anhand der Preview, ob ein bestätigter Diff abschnittsweise auf die Hauptseite übertragen wird. Ohne Ja bleibt die Hauptseite unverändert. |

### Professionelles 3D statt Effekt-Sammlung

Die V2 darf sichtbar moderner und räumlicher sein, aber nur über diese Hierarchie:

1. **Bildraum:** Ein Featured-Game bekommt eine kontrollierte Tiefenebene; Text und primäre Aktion bleiben geometrisch stabil davor.
2. **Materialraum:** Obsidian, Glas, Metallkante und seltenes Gold erzeugen Tiefe. Gold-Glow ist keine dauerhafte vierte Ebene.
3. **Interaktionsraum:** Höchstens ein bewegter Signature-Moment je Blickzone — etwa Directional Hover auf der Featured-Card. Pointer-Tilt bewegt ausschließlich Bildmaterial, niemals den CTA oder Fokus.

Geeignete, bereits dokumentierte Kandidaten sind Directional Hover für Game-Cards, ein zurückhaltender Liquid-Chrome-/Prism-Materialakzent für aktive Premiumflächen und ein **textgeführtes** Mobile-Dock. Orbit-, Wheel- oder WebGL-Experimente sind nur zulässig, wenn sie einen konkreten Startseitenpfad verbessern und das L0–L4-Gate bestehen; sie sind nicht automatisch Bestandteil der V2.

**V2-DoD vor Promotion:** Ruheansicht überzeugend ohne Motion; `prefers-reduced-motion` und Touch statisch/stabil; keine Standard-Icons; keine neue UI-Bildschrift; keine layouttreibende Animation; keine LCP-/CLS-Verschlechterung; alle Nachher-Beweise, Typecheck, Tests, Lint und Build grün. Erst danach kann Jan einzelne bestätigte V2-Diffs für die Hauptseite freigeben.

## Umsetzungsreihenfolge ohne Scope-Creep

1. **Preview-Guard:** Isolierte V2 aufbauen, Vorher-Beweise und Rückweg zur Hauptseite sichern.
2. **Layout-Guard:** Breakpoints und Hero-Varianten definieren, 1024-px-Clipping beseitigen.
3. **Hierarchy-Guard:** zustandsabhaengiger Haupt-CTA und reduzierte Trust-Reihe.
4. **Asset-Guard:** Symbolinventar in Utility, Navigation, Dekoration und Prestige aufteilen; erst dann KI-Assets erzeugen/einbauen.
5. **Dramaturgie-Guard:** Bento-Reihenfolge und Kartenlautstaerke kalibrieren.
6. **Motion-Guard:** Signature-Moment, begrenzte gleichzeitige Ambient-Effekte.
7. **Promotion-Guard:** Erst nach V2-Abnahme einzelne bestätigte Diffs auf die Hauptseite übertragen.

Jeder Schritt ist Frontend-only und zunaechst **K1/K2**. Veraenderungen an `MainLayout` oder am Breakpoint-Contract koennen Sidebar, Bottom Dock und Overlays beruehren; vor Umsetzung ist deshalb ein **K3-Reviewpunkt** Pflicht.

## Abnahme-Checkliste

- [ ] 390 x 844: CTA und Featured Game ohne horizontalen Overflow im ersten Scrollbereich.
- [ ] 1024 x 900: keine ueberlappenden oder abgeschnittenen Hero-Karten/CTAs.
- [ ] 1280 x 900 und 1536 x 960: Wide-Desktop mit Luft und ohne dritte konkurrierende CTA.
- [ ] Alle primären Touch-Ziele mindestens 44 × 44 px; iconfreie Utility-Textlabels bleiben zugänglich.
- [ ] Dynamische Geld-, Jackpot- und Timerwerte nutzen `tabular-nums`.
- [ ] `prefers-reduced-motion` entfernt nicht essenzielle Dauerbewegung; Information bleibt verstaendlich.
- [ ] Fokuszustand und Kontrast per Keyboard und Kontrastpruefung sichtbar.
- [ ] Abschluss: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` plus lokale Desktop-/Mobile-Sichtpruefung.

## Selbstpruefung der Planung

| Prueffrage                                                 | Ergebnis                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Ist sie auf beobachtete UI und Quellstichproben gestuetzt? | Ja: lokale Route sowie 390-, 1024- und Desktop-Ansicht; Hero- und Bento-Komponenten gegengelesen. |
| Trennt sie Design von Backend-/Gluecksspiellogik?          | Ja: Claims werden nur als Design-/Vertrauenshierarchie beurteilt, nicht inhaltlich validiert.     |
| Hat sie Prioritaet statt Wunschliste?                      | Ja: Layout und CTA sind P0, Symbol/Bild/Dramaturgie P1, Motion P2.                                |
| Berücksichtigt sie den Icon-Wunsch?                        | Aktuelle A2-Regel übernommen: sichtbare Textbedienung statt Utility-Icon-Ausnahme.                |
| Ist der Umfang sicher planbar?                             | Ja: konkrete Ausgangspunkte, Akzeptanzkriterien und K3-Reviewpunkt sind enthalten.                |

## Referenzen

**Abschlussprüfung der Planung, 09.09.2026:** Zehn verlinkte Teilpläne mit jeweils genau zehn Unterkategorien; alle Zielwerte mindestens 90, sämtliche lokalen Markdown-Verweise auf vorhandene Dateien geprüft. Verantwortlichkeiten, Abbruch/Rücknahme und die Grenzen zwischen den Plänen gegengelesen. Erstansichts- und Motion-Behauptungen anhand des Agentenreviews präzisiert. Keine neue Browserabnahme und keine Produkt-Test-/Buildläufe in dieser Planungserweiterung; die 90+-Werte bleiben Ziele.

- [Design-System & UI](../../../../xx_sop/04_design_system_ui.md)
- [Taste-/Responsive-QC](../../../../xx_sop/15_workflow_frontend_taste_qc.md)
- [Motion & UI-Polish](../../../../xx_sop/16_motion_and_ui_polish.md)
- [Anti-Template-Qualitaet](../../../../xx_sop/17_web_design_quality.md)
- [Aktuelle Lobby-Komposition](../../../../src/components/home/BentoLobbyHome.tsx)
- [Aktueller Hero](../../../../src/components/home/HeroCinematicShowcase.tsx)
