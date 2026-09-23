# 01 — Startseite: Bildsprache & Markenwelt

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Die visuelle Bildsprache der Startseite: Hero-, Showcase-, Game-, Prestige- und Hintergrundbilder samt ihren Rollen, Crops, technischen Regeln und dem künftigen AI-Asset-Briefing.
>
> **Nicht Scope:** Keine neuen Bildassets erzeugen oder einbauen, kein Produktcode, keine Icons als UI-Ersatz, keine Farbtoken-Neuerfindung und keine CTA-/Claim-Änderung. Farbe/Material/Typo gehört zu Plan 02; iconfreie Bedienung zu Plan 09.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Desktop](../Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Vorher Hero](../Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Vorher Mobile](../Beweise/2026-09-08/00_status-quo_mobile_390x844.png) · [Kompositionsplan](../04_Komposition_Raum/Plan.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — Cinematic Stagecraft.** Die Startseite nutzt wenige, sehr starke Bilder mit klaren Rollen: ein ruhiger Hero als Hauptbühne, unterscheidbare Spielwelten als Auswahl, seltene Prestige-Momente als Belohnung und zurückhaltende Atmosphärenebenen. Text- und CTA-Zonen werden schon im Asset-Briefing geplant, nicht per nachträglichem dunklem Gradient gerettet. Zielwert: **86 auf 94/100**.

| Option | Ansatz                                                             | UX 45% | Marke 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil                             |
| ------ | ------------------------------------------------------------------ | -----: | --------: | ---------: | ----------------: | -----: | ---------------------------------- |
| **A**  | Rollenbasierte filmische Bildwelt mit Safe Zones und Asset-Vertrag |     43 |        29 |         13 |                 9 | **94** | **Empfohlen**                      |
| B      | Jede Kachel als eigene, maximal laute Kunstwelt                    |     31 |        25 |          9 |                 8 |     73 | Fragmentiert die Marke             |
| C      | Fast nur abstrakte Verläufe/Flächen                                |     34 |        18 |         14 |                10 |     76 | Verliert Spiel- und Prestigegefühl |

## 2. Scorezerlegung — genau 10 Hebel

| ID    | Unterkategorie                            | Status quo | Ziel | Konkreter Engpass / Planungsergebnis                                                                                 |
| ----- | ----------------------------------------- | ---------: | ---: | -------------------------------------------------------------------------------------------------------------------- |
| BW-01 | Visuelle Markenidee                       |         88 |   95 | Obsidian/Gold und 3D-Casino sind vorhanden; eine präzise Startseiten-Erzählung fehlt.                                |
| BW-02 | Bildrollen je Zone                        |         82 |   94 | Hero, Showcase, Bento, Trust und Prestige erhalten je eine Aufgabe statt derselben Deko-Lautstärke.                  |
| BW-03 | Hero-Safe-Zone                            |         80 |   95 | Bildbriefing garantiert freie Text-/CTA-Zone auf Desktop und Mobile.                                                 |
| BW-04 | Spielwelt-Differenzierung                 |         85 |   94 | Crash, Dice, Roulette, Slots und Blackjack unterscheiden sich in Objekt, Kamera und Bewegung, nicht nur Akzentfarbe. |
| BW-05 | Crop & Art-Continuity                     |         78 |   94 | `object-position`, Hauptobjekt und Blickrichtung werden für 390/1024/1440 bewusst geführt.                           |
| BW-06 | Seltenheit von Prestige-Art               |         84 |   93 | Krone/Trophäe/Gold-Inszenierung wird nur für echte Höhepunkte eingesetzt, nicht als wiederholter Sticker.            |
| BW-07 | Textfreie Asset-Disziplin                 |         90 |   96 | Bestehende Assets werden auf eingebrannten UI-Text/Controls geprüft; künftige Generierung bleibt textfrei.           |
| BW-08 | Bildqualität & Performance                |         83 |   94 | Rendergröße, Format, Dimensionen, Priorität und LCP-Rolle sind pro Bild dokumentiert.                                |
| BW-09 | Mobile Art Direction                      |         79 |   94 | Mobile erhält kuratierte Crops, nicht nur eine verkleinerte Desktop-Komposition.                                     |
| BW-10 | Prompt-, Manifest- & Varianten-Governance |         91 |   95 | Vorhandene Asset-/Manifest-Dokumente werden in einen wiederholbaren Freigabepfad überführt.                          |

## 3. Bildvertrag für die Startseite

| Rolle               | Bildinhalt                                                                                              | Kompositorische Regel                                                                               | Verbot                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Hero-Plate**      | Ein spielbarer Casino-Moment mit einem Hauptobjekt, kontrolliertem Goldlicht und tiefem negativen Raum. | Hauptobjekt liegt außerhalb der Text-/CTA-Zone; Desktop und Mobile haben definierte Crop-Varianten. | Stock-Hero, generischer Gold-Blob, eingebrannte Buttons, Text oder UI-Icons. |
| **Game-Showcase**   | Je Spiel ein physisches, erkennbares Objekt/Material und eigene Kameraperspektive.                      | Das Bild erklärt das Spiel vor dem Titel und funktioniert auch bei dunklem Overlay.                 | Fünf Varianten derselben Gold-Objekt-Collage.                                |
| **Bento-Art**       | Spielentdeckung oder eine konkrete Belohnung, nicht Dekoration.                                         | Eine visuelle Lautstärke-Spitze je Zone; Nachbarkarten bleiben ruhiger.                             | Gleiche Bloom-/Glow-Intensität auf jeder Karte.                              |
| **Prestige-Visual** | Seltene, daten- oder ereignisgebundene Auszeichnung.                                                    | Wird nur nach einem realen Status/Ergebnis gezeigt und bleibt bildlich vom UI-Control getrennt.     | Krone, Trophäe oder Siegel als Standardnavigation bzw. Status-Icon.          |
| **Ambient-Layer**   | Obsidian-Textur, kontrollierte Tiefe, keine Information.                                                | Niedrige Kontrastenergie; immer hinter Inhalt und pausierbar gemäß Motion-Plan.                     | Lesbarkeit überdecken oder eine zweite Hero-Geschichte erzählen.             |

### Generatives Briefing (für eine spätere Asset-Generation)

`[ein Casino-Spielobjekt] + [physisches Material] + [eindeutiger Kamerawinkel] + [kontrolliertes warmes Goldlicht] + [tiefer obsidianfarbener negativer Raum] + [text-free] + [no UI, no controls, no icons] + [freie Textzone: links/rechts/oben] + [Crop-Ziel und Seitenverhältnis]`.

Das Briefing erzeugt **keinen** Asset-Produktionsauftrag. Vor jeder Generation sind Zielrolle, Bildformat, Crop, Rendergröße und konkrete Einbaufläche verbindlich zu benennen.

## 4. Kontext-Koffer

| Quelle                                                                                                          | Relevanz                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/components/home/hero-cinematic/config.ts`                                                                  | Bindet die fünf aktuellen Spielbilder (`/images/games/hero-*.png`) und ihre Spielrollen.                |
| `src/components/home/hero-cinematic/GameShowcaseCard.tsx`                                                       | Aktueller Bildrahmen: `object-fit: cover`, `object-position: center 25%`, 400px-Showcase.               |
| `src/components/home/bento/BentoArcadeCells.tsx`                                                                | Bento-Bilder nutzen denselben aktuellen Crop-Ansatz; zentraler Kandidat für den künftigen Crop-Vertrag. |
| `public/images/00_IMAGES_OVERVIEW.md` und Asset-Manifeste                                                       | Bestehende Pipeline-/Governance-Dokumentation; als Basis verwenden, nicht parallel neu erfinden.        |
| [AI-Asset-Pipeline](../../../../../../public/images/06_asset_pipeline_storage.md)                               | Bereits dokumentierte Storage-/Ablagegrundlage.                                                         |
| [Anti-Template-Regeln](../../../../../../.claude/skills/casino-design-system-craft/references/anti-patterns.md) | Keine Standard-Icons, kein Asset mit eingebranntem UI-Text; keine generische Template-Ästhetik.         |

## 5. LLM-Ausführungsplan — L0 bis L5

| Level                                | LLM-Aufgabe & Ergebnis                                                                                                      | Jan-Gate                                                                 | Abbruch / Rollback                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| L0 — Asset-Inventar                  | Alle auf `/` sichtbaren Bilder mit Rolle, Quelle, Seitenverhältnis, rendernder Komponente, Crop und Ladepriorität erfassen. | Jan bestätigt nur die gewünschte Bildwelt.                               | Fehlt Herkunft/Lizenz-/Assetkontext: Bild nicht ersetzen oder neu verwenden.                          |
| L1 — Art-Direction-Matrix            | Für Hero, Showcase, Bento, Prestige und Ambient je ein Briefing, Safe-Zone und Ausschlusskriterien festlegen.               | Wahl zwischen zwei klar abgegrenzten, regelkonformen Bildrichtungen.     | Falls eine Richtung textfreie Zone oder Spielerkennbarkeit nicht sicherstellt: verwerfen.             |
| L2 — Responsive Crop-Vertrag         | Desktop-, Compact- und Mobile-Crop pro Rollenbild definieren; 390/1024/1440 als feste Beweisraster aufnehmen.               | Jan prüft nur die Bildkomposition.                                       | Hauptobjekt kollidiert mit Copy/CTA oder wird unkenntlich: zu L1 zurück.                              |
| L3 — Technischer Asset-Plan          | Zielformat, explizite Dimensionen, `sizes`, Hero-Priorität und Lazy-Strategie aus vorhandenen Standards ableiten.           | Kein Gate.                                                               | LCP-/CLS-Risiko oder falsche Rendergröße: keine Asset-Generation, L3 neu planen.                      |
| L4 — Qualitäts- und Provenance-Check | Generierte Kandidaten gegen Textfreiheit, UI-freie Bildsprache, Crop, Kontrast und Duplikat-Risiko prüfen.                  | Jan trifft die einzige ästhetische Auswahl aus qualifizierten Varianten. | Eingebrannter Text/Icon, unpassende Stilfamilie oder unsicherer Rechtekontext: Kandidat ausschließen. |
| L5 — Execution-Ready                 | Asset-Mapping, Dateinamens-/Manifestregeln, Nachher-Beweisplätze und Rollback je Bild dokumentieren.                        | Finales visuelles Ja/Nein.                                               | Ohne L4 und Nachher-Beweis bleibt Status **Geplant**; Ist-Assets bleiben erhalten.                    |

## 6. Fünf spätere Execution-Checks

1. **Rollencheck:** Jedes sichtbare Bild lässt sich genau einer Rolle zuordnen; keine dekorative Doppelung ohne Aufgabe.
2. **Cropcheck:** Hero und Game-Images sind bei 390, 1024 und 1440 px ohne CTA-/Textkollision und mit erkennbarem Hauptobjekt sichtbar.
3. **AI-Asset-Check:** Neue Bilder enthalten keinen Text, keine UI, keine Icons und keine imitierte Marken-/Stockoptik.
4. **Performancecheck:** Hero-Bild hat Dimensionen und bewusstes Prioritätsverhalten; Unterfold-Bilder sind dimensioniert und bedarfsorientiert geladen.
5. **Beweistest:** Vorher-Beweise bleiben unverändert; pro veränderter Bildrolle entsteht ein datierter Nachher-Screenshot mit Source-/Crop-Referenz.

## 7. Selbstprüfung vor Übergabe

- Genau 10 Unterkategorien, alle Zielwerte >= 93.
- Generative Bildproduktion ist ausdrücklich nicht durchgeführt und nicht implizit freigegeben.
- Der Plan trennt Bildinhalt von UI-Bedienung und respektiert die iconfreie Regel A2.
- Jede Stufe ist für ein neues Ausführungs-LLM mit Pfaden, Qualitätsgrenzen und Rollback nachvollziehbar.
