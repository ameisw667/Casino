# React Bits (reactbits.dev) — Vollständiger Komponenten-Katalog (184 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [reactbits.dev](https://reactbits.dev/) (David Haz — MIT, 46K+ GitHub-Stars, schnellstwachsende animierte React-Lib)
**Kanonische Projekt-Ablage:** [`docs/frontend/14_reactbits_dev_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/14_reactbits_dev_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Alle URLs stammen 1:1 aus der offiziellen Sitemap (`reactbits.dev/sitemap.xml`, Stand 6. September 2026). **Install-Modell:** shadcn-CLI — der Komponenten-Code wandert ins eigene Repo (kein Version-Lock-in): `npx shadcn@latest add @react-bits/<Name>-TS-TW` (4 Varianten je Komponente: JS/TS × CSS/Tailwind).
> **Hinweis zur Technologie-Spalte:** Grobe Klassifikation (CSS / Motion / Canvas / WebGL) nach offizieller Beschreibung — bei der manuellen Klick-Prüfung verifizieren.

---

## 1. Quickstart

```bash
# Komponente per shadcn-CLI ins Projekt ziehen (TS + Tailwind Variante):
npx shadcn@latest add "@react-bits/BlurText-TS-TW"
# Alternativ: jsrepo. Installation-Details: https://reactbits.dev/get-started/installation
```

---

## 2. Übersicht der 6 Kategorien (184 Einträge)

1. [Kategorie 1: Text-Animationen](#kategorie-1-text-animationen) _(32 Komponenten)_
2. [Kategorie 2: Animationen & Effekte](#kategorie-2-animationen--effekte) _(38 Komponenten)_
3. [Kategorie 3: Komponenten](#kategorie-3-komponenten) _(45 Komponenten)_
4. [Kategorie 4: Hintergründe](#kategorie-4-hintergründe) _(56 Komponenten)_
5. [Kategorie 5: Guides & Tools](#kategorie-5-guides--tools) _(7 Einträge)_
6. [Kategorie 6: Pro & Plattform-Seiten](#kategorie-6-pro--plattform-seiten) _(6 Einträge)_

---

### Legende zum User-Votum

Identisch zur Legende in [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Alle Einträge initial neutral, Votum wird von Jan nach manueller Prüfung nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** _(reserviert)_
- ⭐⭐ **Bestätigt** _(reserviert)_
- ❌ **Abgelehnt** _(reserviert)_
- ⚪ **Katalog-Bestand** (aktueller Status aller Einträge)
- 💰 **Pro** (kostenpflichtiger React-Bits-Bereich)

---

## Kategorie 1: Text-Animationen

| Komponente             | Offizieller Link (reactbits.dev)                                                                  |     User-Votum     | Casino-Einsatzbereich                                                                                                           | Technologie                     |
| :--------------------- | :------------------------------------------------------------------------------------------------ | :----------------: | :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------ |
| **Text Loop**          | [`/text-animations/text-loop`](https://reactbits.dev/text-animations/text-loop)                   | ⚪ Katalog-Bestand | Rotierende Claims im Lobby-Hero                                                                                                 | Sequenzieller Text-Rotation     |
| **Masked Heading**     | [`/text-animations/masked-heading`](https://reactbits.dev/text-animations/masked-heading)         | ⚪ Katalog-Bestand | Hero-Überschriften mit Masken-Reveal                                                                                            | CSS Mask-Reveal                 |
| **Particle Text**      | [`/text-animations/particle-text`](https://reactbits.dev/text-animations/particle-text)           | ⚪ Katalog-Bestand | Goldstaub-Typo im Big-Win-Overlay ([`BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)) | Canvas-Partikel                 |
| **Split Flap Text**    | [`/text-animations/split-flap-text`](https://reactbits.dev/text-animations/split-flap-text)       | ⚪ Katalog-Bestand | Abgewählt in 12-Componentry (Split-Flap) — Vergleichskandidat                                                                   | CSS Flap-Mechanik               |
| **Warp Text**          | [`/text-animations/warp-text`](https://reactbits.dev/text-animations/warp-text)                   | ⚪ Katalog-Bestand | Crash-Multiplikator-Deko                                                                                                        | SVG-Warp                        |
| **Stroke Text**        | [`/text-animations/stroke-text`](https://reactbits.dev/text-animations/stroke-text)               | ⚪ Katalog-Bestand | Outline-Goldtypo für Sektionstitel                                                                                              | SVG-Stroke-Animation            |
| **Depth Text**         | [`/text-animations/depth-text`](https://reactbits.dev/text-animations/depth-text)                 | ⚪ Katalog-Bestand | Tiefe-Effekt für Vault-Titel                                                                                                    | Layered Depth                   |
| **Fold Text**          | [`/text-animations/fold-text`](https://reactbits.dev/text-animations/fold-text)                   | ⚪ Katalog-Bestand | Falt-Reveal für Modal-Headlines                                                                                                 | 3D-Falt-Transform               |
| **Echo Text**          | [`/text-animations/echo-text`](https://reactbits.dev/text-animations/echo-text)                   | ⚪ Katalog-Bestand | Echo-Nachzieheffekt für Deko-Text                                                                                               | Sequenzielle Kopien             |
| **Split Text**         | [`/text-animations/split-text`](https://reactbits.dev/text-animations/split-text)                 | ⚪ Katalog-Bestand | Buchstaben-Stagger für Game-Status-Overlays                                                                                     | Per-Char Stagger                |
| **Blur Text**          | [`/text-animations/blur-text`](https://reactbits.dev/text-animations/blur-text)                   | ⚪ Katalog-Bestand | Blur-Reveal (Kandidat für Kinetic Text Reveal-Ersatz)                                                                           | Blur + Stagger                  |
| **Circular Text**      | [`/text-animations/circular-text`](https://reactbits.dev/text-animations/circular-text)           | ⚪ Katalog-Bestand | Runde Deko-Schrift (Münz-Emblem)                                                                                                | SVG-Kreislauf                   |
| **Text Type**          | [`/text-animations/text-type`](https://reactbits.dev/text-animations/text-type)                   | ⚪ Katalog-Bestand | Terminal-/Status-Zeilen im Dev-Modus                                                                                            | Typewriter-Engine               |
| **Shuffle**            | [`/text-animations/shuffle`](https://reactbits.dev/text-animations/shuffle)                       | ⚪ Katalog-Bestand | Zeichen-Shuffle bei Multiplikator-Wechsel                                                                                       | Zeichen-Randomizer              |
| **Shiny Text**         | [`/text-animations/shiny-text`](https://reactbits.dev/text-animations/shiny-text)                 | ⚪ Katalog-Bestand | Gold-Glanz-Sweep über Text                                                                                                      | CSS Shimmer                     |
| **Text Pressure**      | [`/text-animations/text-pressure`](https://reactbits.dev/text-animations/text-pressure)           | ⚪ Katalog-Bestand | Pointer-abhängige Variablen-Typo                                                                                                | Variable Fonts + Pointer        |
| **Curved Loop**        | [`/text-animations/curved-loop`](https://reactbits.dev/text-animations/curved-loop)               | ⚪ Katalog-Bestand | Gebogene Laufband-Typo                                                                                                          | SVG-Pfad-Text                   |
| **Fuzzy Text**         | [`/text-animations/fuzzy-text`](https://reactbits.dev/text-animations/fuzzy-text)                 | ⚪ Katalog-Bestand | Verwackelnder Text als Loss-Effekt                                                                                              | Canvas-Displacement             |
| **Gradient Text**      | [`/text-animations/gradient-text`](https://reactbits.dev/text-animations/gradient-text)           | ⚪ Katalog-Bestand | Gold-Gradient-Typo                                                                                                              | Animated Gradient Clip          |
| **Falling Text**       | [`/text-animations/falling-text`](https://reactbits.dev/text-animations/falling-text)             | ⚪ Katalog-Bestand | Herabfallende Buchstaben (Gewinn-Regen)                                                                                         | Gravity-Simulation              |
| **Text Cursor**        | [`/text-animations/text-cursor`](https://reactbits.dev/text-animations/text-cursor)               | ⚪ Katalog-Bestand | Blinkender Cursor für Terminal-UI                                                                                               | Blink-Animation                 |
| **Decrypted Text**     | [`/text-animations/decrypted-text`](https://reactbits.dev/text-animations/decrypted-text)         | ⚪ Katalog-Bestand | Provably-Fair-Seed-Entschlüsselungs-Deko                                                                                        | Zeichen-Decrypt-Effekt          |
| **True Focus**         | [`/text-animations/true-focus`](https://reactbits.dev/text-animations/true-focus)                 | ⚪ Katalog-Bestand | Kamera-Fokus-Rahmen auf Wortgruppen                                                                                             | Fokusraster-Overlay             |
| **Scroll Float**       | [`/text-animations/scroll-float`](https://reactbits.dev/text-animations/scroll-float)             | ⚪ Katalog-Bestand | Scroll-gebundene Text-Reveals (Onboarding)                                                                                      | Scroll-Linked Opacity/Transform |
| **Scroll Reveal**      | [`/text-animations/scroll-reveal`](https://reactbits.dev/text-animations/scroll-reveal)           | ⚪ Katalog-Bestand | Bento-Reveals beim Scrollen                                                                                                     | IntersectionObserver            |
| **ASCII Text**         | [`/text-animations/ascii-text`](https://reactbits.dev/text-animations/ascii-text)                 | ⚪ Katalog-Bestand | Abgewählt in 12-Componentry (ASCII) — Vergleichskandidat                                                                        | ASCII-Zeichensatz               |
| **Scrambled Text**     | [`/text-animations/scrambled-text`](https://reactbits.dev/text-animations/scrambled-text)         | ⚪ Katalog-Bestand | Jackpot-Zahlen-Entrauschen                                                                                                      | Zeichen-Scramble                |
| **Rotating Text**      | [`/text-animations/rotating-text`](https://reactbits.dev/text-animations/rotating-text)           | ⚪ Katalog-Bestand | Wechselnde Modus-Labels (Manuell/Auto)                                                                                          | Rotation-Swap                   |
| **Glitch Text**        | [`/text-animations/glitch-text`](https://reactbits.dev/text-animations/glitch-text)               | ⚪ Katalog-Bestand | Fehler-Effekt bei Fehltransaktionen                                                                                             | Glitch-Layer                    |
| **Scroll Velocity**    | [`/text-animations/scroll-velocity`](https://reactbits.dev/text-animations/scroll-velocity)       | ⚪ Katalog-Bestand | Laufband mit Scroll-Impuls                                                                                                      | Velocity-basiertes Laufband     |
| **Variable Proximity** | [`/text-animations/variable-proximity`](https://reactbits.dev/text-animations/variable-proximity) | ⚪ Katalog-Bestand | Pointer-Nähe dünn→fett (VIP-Slogan)                                                                                             | Variable Fonts + Proximity      |
| **Count Up**           | [`/text-animations/count-up`](https://reactbits.dev/text-animations/count-up)                     | ⚪ Katalog-Bestand | Zähler für Wallet/KPI (Monospace-Pflicht)                                                                                       | Interpolierter Counter          |

---

## Kategorie 2: Animationen & Effekte

| Komponente            | Offizieller Link (reactbits.dev)                                                      |     User-Votum     | Casino-Einsatzbereich                                    | Technologie                |
| :-------------------- | :------------------------------------------------------------------------------------ | :----------------: | :------------------------------------------------------- | :------------------------- |
| **Glow Cursor**       | [`/animations/glow-cursor`](https://reactbits.dev/animations/glow-cursor)             | ⚪ Katalog-Bestand | Cursor-Leuchten über Spielkarten                         | Pointer-Glow               |
| **Scroll Expand**     | [`/animations/scroll-expand`](https://reactbits.dev/animations/scroll-expand)         | ⚪ Katalog-Bestand | Scroll-gebundene Aufklapp-Sektionen                      | Scroll-Linked Scale        |
| **Ripple Distortion** | [`/animations/ripple-distortion`](https://reactbits.dev/animations/ripple-distortion) | ⚪ Katalog-Bestand | Klick-Wellen auf Tischfilz (vgl. Image Ripple in 12)     | WebGL-Verzerrung           |
| **Elastic Mesh**      | [`/animations/elastic-mesh`](https://reactbits.dev/animations/elastic-mesh)           | ⚪ Katalog-Bestand | Elastisches Gitter-Feedback                              | Mesh-Verzerrung            |
| **Swarm Cursor**      | [`/animations/swarm-cursor`](https://reactbits.dev/animations/swarm-cursor)           | ⚪ Katalog-Bestand | Goldschwarm folgt dem Cursor                             | Partikel-Schwarm           |
| **Halftone Reveal**   | [`/animations/halftone-reveal`](https://reactbits.dev/animations/halftone-reveal)     | ⚪ Katalog-Bestand | Raster-Punkte-Reveal für Bilder                          | Halftone-Maske             |
| **Pixel Swap**        | [`/animations/pixel-swap`](https://reactbits.dev/animations/pixel-swap)               | ⚪ Katalog-Bestand | Pixel-Dissolve bei Bildwechseln                          | Pixel-Raster               |
| **Cursor Grid**       | [`/animations/cursor-grid`](https://reactbits.dev/animations/cursor-grid)             | ⚪ Katalog-Bestand | Reaktives Punktraster (Provably-Fair-Deko)               | Grid-Reaktion              |
| **Animated Content**  | [`/animations/animated-content`](https://reactbits.dev/animations/animated-content)   | ⚪ Katalog-Bestand | Universal-Reveal-Wrapper                                 | Motion-Wrapper             |
| **Fade Content**      | [`/animations/fade-content`](https://reactbits.dev/animations/fade-content)           | ⚪ Katalog-Bestand | Einfaches Einblenden beim Mount                          | Fade-In                    |
| **Electric Border**   | [`/animations/electric-border`](https://reactbits.dev/animations/electric-border)     | ⚪ Katalog-Bestand | Neon-Rand für aktive Spielkachel                         | SVG/Electric-Glow          |
| **Orbit Images**      | [`/animations/orbit-images`](https://reactbits.dev/animations/orbit-images)           | ⚪ Katalog-Bestand | Kreisförmige Bild-Orbits (VIP-Tier-Logos)                | Orbit-Transform            |
| **Pixel Transition**  | [`/animations/pixel-transition`](https://reactbits.dev/animations/pixel-transition)   | ⚪ Katalog-Bestand | Pixel-Übergang bei Kartenwechsel                         | Pixel-Dissolve             |
| **Glare Hover**       | [`/animations/glare-hover`](https://reactbits.dev/animations/glare-hover)             | ⚪ Katalog-Bestand | Glanzkanten-Hover (vgl. Hover Transition in 12)          | CSS-Glanzvektor            |
| **Antigravity**       | [`/animations/antigravity`](https://reactbits.dev/animations/antigravity)             | ⚪ Katalog-Bestand | Schwebe-Partikel-Deko                                    | Physik-Simulation          |
| **Logo Loop**         | [`/animations/logo-loop`](https://reactbits.dev/animations/logo-loop)                 | ⚪ Katalog-Bestand | Endloses Partner-Logo-Laufband                           | Marquee-Loop               |
| **Target Cursor**     | [`/animations/target-cursor`](https://reactbits.dev/animations/target-cursor)         | ⚪ Katalog-Bestand | Fadenkreuz-Cursor im Spielkontext                        | Custom Cursor              |
| **Magic Rings**       | [`/animations/magic-rings`](https://reactbits.dev/animations/magic-rings)             | ⚪ Katalog-Bestand | Ring-Wellen bei Button-Klick                             | SVG-Ringe                  |
| **Laser Flow**        | [`/animations/laser-flow`](https://reactbits.dev/animations/laser-flow)               | ⚪ Katalog-Bestand | Goldlaser-Linie als Sektionstrenner                      | Shader-Strahl              |
| **Magnet Lines**      | [`/animations/magnet-lines`](https://reactbits.dev/animations/magnet-lines)           | ⚪ Katalog-Bestand | Direkter Zwilling zu 12-Componentry-Favorit              | Magnetische Vektoren       |
| **Ghost Cursor**      | [`/animations/ghost-cursor`](https://reactbits.dev/animations/ghost-cursor)           | ⚪ Katalog-Bestand | Nachziehender Geist-Cursor                               | Trailing-Pointer           |
| **Gradual Blur**      | [`/animations/gradual-blur`](https://reactbits.dev/animations/gradual-blur)           | ⚪ Katalog-Bestand | Weiche Scroll-Ränder                                     | Progressiver Blur          |
| **Click Spark**       | [`/animations/click-spark`](https://reactbits.dev/animations/click-spark)             | ⚪ Katalog-Bestand | Funken bei Wett-Button-Klick                             | Partikel-Burst             |
| **Magnet**            | [`/animations/magnet`](https://reactbits.dev/animations/magnet)                       | ⚪ Katalog-Bestand | Magnetische Buttons (HUD)                                | Magnetic-Transform         |
| **Strands**           | [`/animations/strands`](https://reactbits.dev/animations/strands)                     | ⚪ Katalog-Bestand | Faden-Kurven-Deko                                        | Canvas-Stränge             |
| **Sticker Peel**      | [`/animations/sticker-peel`](https://reactbits.dev/animations/sticker-peel)           | ⚪ Katalog-Bestand | Abzieh-Effekt für Bonus-Sticker                          | Peel-Transform             |
| **Pixel Trail**       | [`/animations/pixel-trail`](https://reactbits.dev/animations/pixel-trail)             | ⚪ Katalog-Bestand | Abgewählt in 12 (Pixel Image Trail) — Vergleichskandidat | Pixel-Schweif              |
| **Cubes**             | [`/animations/cubes`](https://reactbits.dev/animations/cubes)                         | ⚪ Katalog-Bestand | Würfel-Deko (Würfel-Symbolik)                            | 3D-Würfel-Grid             |
| **Metallic Paint**    | [`/animations/metallic-paint`](https://reactbits.dev/animations/metallic-paint)       | ⚪ Katalog-Bestand | Flüssiger Goldanstrich auf Logos                         | WebGL-Metall-Shader        |
| **Noise**             | [`/animations/noise`](https://reactbits.dev/animations/noise)                         | ⚪ Katalog-Bestand | Filmkorn-Atmosphäre                                      | Noise-Canvas               |
| **Shape Blur**        | [`/animations/shape-blur`](https://reactbits.dev/animations/shape-blur)               | ⚪ Katalog-Bestand | Formgebter Blur-Reveal                                   | Masken-Blur                |
| **Crosshair**         | [`/animations/crosshair`](https://reactbits.dev/animations/crosshair)                 | ⚪ Katalog-Bestand | Fadenkreuz-Overlay für Präzisions-UI                     | Cursor-Overlay             |
| **Image Trail**       | [`/animations/image-trail`](https://reactbits.dev/animations/image-trail)             | ⚪ Katalog-Bestand | Abgewählt in 12 — Vergleichskandidat                     | Pointer-Trail              |
| **Ribbons**           | [`/animations/ribbons`](https://reactbits.dev/animations/ribbons)                     | ⚪ Katalog-Bestand | Goldbänder im Hintergrund                                | WebGL-Bänder               |
| **Splash Cursor**     | [`/animations/splash-cursor`](https://reactbits.dev/animations/splash-cursor)         | ⚪ Katalog-Bestand | Flüssigkeits-Splash am Cursor                            | Fluid-Simulation           |
| **Meta Balls**        | [`/animations/meta-balls`](https://reactbits.dev/animations/meta-balls)               | ⚪ Katalog-Bestand | Verschmelzende Goldtropfen                               | Metaball-SDF               |
| **Blob Cursor**       | [`/animations/blob-cursor`](https://reactbits.dev/animations/blob-cursor)             | ⚪ Katalog-Bestand | Weiche Blob-Verfolgung                                   | Blob-Physik                |
| **Star Border**       | [`/animations/star-border`](https://reactbits.dev/animations/star-border)             | ⚪ Katalog-Bestand | Funkenrand für VIP-Badges                                | Animierter Border-Gradient |

---

## Kategorie 3: Komponenten

| Komponente            | Offizieller Link (reactbits.dev)                                                      |     User-Votum     | Casino-Einsatzbereich                                               | Technologie               |
| :-------------------- | :------------------------------------------------------------------------------------ | :----------------: | :------------------------------------------------------------------ | :------------------------ |
| **Infinite Spiral**   | [`/components/infinite-spiral`](https://reactbits.dev/components/infinite-spiral)     | ⚪ Katalog-Bestand | Spiralförmige Galerie (Hall of Fame)                                | Spiral-Transform          |
| **Depth Carousel**    | [`/components/depth-carousel`](https://reactbits.dev/components/depth-carousel)       | ⚪ Katalog-Bestand | Tiefen-Karussell für Spielauswahl                                   | 3D-Tiefen-Staffelung      |
| **Morph Slider**      | [`/components/morph-slider`](https://reactbits.dev/components/morph-slider)           | ⚪ Katalog-Bestand | Morphender Slider (Einsatz-Regler)                                  | Morph-Übergang            |
| **Drift Wall**        | [`/components/drift-wall`](https://reactbits.dev/components/drift-wall)               | ⚪ Katalog-Bestand | Treibende Bildwand (Gewinnerwand)                                   | Drift-Parallax            |
| **Accordion Gallery** | [`/components/accordion-gallery`](https://reactbits.dev/components/accordion-gallery) | ⚪ Katalog-Bestand | Fächer-Galerie für Spielkategorien                                  | Accordion-Flex            |
| **Specular Button**   | [`/components/specular-button`](https://reactbits.dev/components/specular-button)     | ⚪ Katalog-Bestand | Reflexions-Buttons für CTA                                          | Specular-Highlight        |
| **Option Wheel**      | [`/components/option-wheel`](https://reactbits.dev/components/option-wheel)           | ⚪ Katalog-Bestand | Radiales Optionsmenü (Einsatzstufen)                                | Radial-Layout             |
| **Curved Input**      | [`/components/curved-input`](https://reactbits.dev/components/curved-input)           | ⚪ Katalog-Bestand | Gebogener Slider (Curve-Bets)                                       | Bogen-Slider              |
| **Line Sidebar**      | [`/components/line-sidebar`](https://reactbits.dev/components/line-sidebar)           | ⚪ Katalog-Bestand | Linienbasierte Navigation                                           | Border-Nav                |
| **Animated List**     | [`/components/animated-list`](https://reactbits.dev/components/animated-list)         | ⚪ Katalog-Bestand | Live-Feed (Gewinner-Liste)                                          | Sequenzielle List-Reveals |
| **Scroll Stack**      | [`/components/scroll-stack`](https://reactbits.dev/components/scroll-stack)           | ⚪ Katalog-Bestand | Kartens stapelt sich beim Scrollen (vgl. Sticky Scroll Cards in 12) | Sticky-Stacking           |
| **Bubble Menu**       | [`/components/bubble-menu`](https://reactbits.dev/components/bubble-menu)             | ⚪ Katalog-Bestand | Blasen-Kontextmenü                                                  | Bubble-Pop                |
| **Magic Bento**       | [`/components/magic-bento`](https://reactbits.dev/components/magic-bento)             | ⚪ Katalog-Bestand | Interaktive Bento-Kacheln (Home)                                    | Spotlight-Bento           |
| **Circular Gallery**  | [`/components/circular-gallery`](https://reactbits.dev/components/circular-gallery)   | ⚪ Katalog-Bestand | Rundlauf-Galerie der Spiele                                         | Kreisbahn-Galerie         |
| **Reflective Card**   | [`/components/reflective-card`](https://reactbits.dev/components/reflective-card)     | ⚪ Katalog-Bestand | Spiegelnde Spielkarte                                               | Reflection-Hover          |
| **Card Nav**          | [`/components/card-nav`](https://reactbits.dev/components/card-nav)                   | ⚪ Katalog-Bestand | Kartenbasierte Navigation                                           | Card-Nav                  |
| **Stack**             | [`/components/stack`](https://reactbits.dev/components/stack)                         | ⚪ Katalog-Bestand | Kartenstapel (Blackjack-Optik)                                      | Stack-Drag                |
| **Fluid Glass**       | [`/components/fluid-glass`](https://reactbits.dev/components/fluid-glass)             | ⚪ Katalog-Bestand | Glassmorphism-Elemente (Obsidian & Gold Standard)                   | WebGL-Glas-Verzerrung     |
| **Pill Nav**          | [`/components/pill-nav`](https://reactbits.dev/components/pill-nav)                   | ⚪ Katalog-Bestand | Pillen-Navigation (Tabs)                                            | Pill-Indicator            |
| **Tilted Card**       | [`/components/tilted-card`](https://reactbits.dev/components/tilted-card)             | ⚪ Katalog-Bestand | 3D-Tilt auf Spielkarten                                             | Pointer-Tilt              |
| **Masonry**           | [`/components/masonry`](https://reactbits.dev/components/masonry)                     | ⚪ Katalog-Bestand | Masonry-Grid für Promo-Wand                                         | Masonry-Layout            |
| **Glass Surface**     | [`/components/glass-surface`](https://reactbits.dev/components/glass-surface)         | ⚪ Katalog-Bestand | Glas-Oberflächen-Primitive (blur 12px Standard)                     | Glassmorphism             |
| **Dome Gallery**      | [`/components/dome-gallery`](https://reactbits.dev/components/dome-gallery)           | ⚪ Katalog-Bestand | Kuppel-Galerie (Gewinner-Avatar)                                    | 3D-Dome-Projektion        |
| **Chroma Grid**       | [`/components/chroma-grid`](https://reactbits.dev/components/chroma-grid)             | ⚪ Katalog-Bestand | Chromatic-Bildraster                                                | Chromatic-Aberration      |
| **Folder**            | [`/components/folder`](https://reactbits.dev/components/folder)                       | ⚪ Katalog-Bestand | Ordner-Drag-Interaktion                                             | Folder-Transform          |
| **Staggered Menu**    | [`/components/staggered-menu`](https://reactbits.dev/components/staggered-menu)       | ⚪ Katalog-Bestand | Staffel-Vollbildmenü                                                | Staggered-Reveal          |
| **Model Viewer**      | [`/components/model-viewer`](https://reactbits.dev/components/model-viewer)           | ⚪ Katalog-Bestand | 3D-Modell-Anzeige (Trophäen)                                        | Three.js-Viewer           |
| **Lanyard**           | [`/components/lanyard`](https://reactbits.dev/components/lanyard)                     | ⚪ Katalog-Bestand | Physik-Objekt (VIP-Ausweis-Deko)                                    | Rapier-Physik + Three.js  |
| **Profile Card**      | [`/components/profile-card`](https://reactbits.dev/components/profile-card)           | ⚪ Katalog-Bestand | Spieler-Profilkarte                                                 | Tilt-Card                 |
| **Dock**              | [`/components/dock`](https://reactbits.dev/components/dock)                           | ⚪ Katalog-Bestand | macOS-Dock (MobileNav-Ersatz, vgl. Magnetic Dock in 12)             | Magnification-Dock        |
| **Gooey Nav**         | [`/components/gooey-nav`](https://reactbits.dev/components/gooey-nav)                 | ⚪ Katalog-Bestand | Verschmelzender Nav-Indikator                                       | SVG-Goo-Filter            |
| **Pixel Card**        | [`/components/pixel-card`](https://reactbits.dev/components/pixel-card)               | ⚪ Katalog-Bestand | Pixel-Reveal-Karte                                                  | Pixel-Dissolve-Hover      |
| **Carousel**          | [`/components/carousel`](https://reactbits.dev/components/carousel)                   | ⚪ Katalog-Bestand | Standard-Karussell (Spielauswahl)                                   | Scroll-Snap               |
| **Spotlight Card**    | [`/components/spotlight-card`](https://reactbits.dev/components/spotlight-card)       | ⚪ Katalog-Bestand | Spotlight-Verlauf auf Karten                                        | Pointer-Spotlight         |
| **Border Glow**       | [`/components/border-glow`](https://reactbits.dev/components/border-glow)             | ⚪ Katalog-Bestand | Glühold-Rand für aktive Kachel                                      | Glow-Border               |
| **Flying Posters**    | [`/components/flying-posters`](https://reactbits.dev/components/flying-posters)       | ⚪ Katalog-Bestand | Schwebende Poster (Promo)                                           | 3D-Poster-Wand            |
| **Card Swap**         | [`/components/card-swap`](https://reactbits.dev/components/card-swap)                 | ⚪ Katalog-Bestand | Kartenwechsel-Karussell                                             | Swap-Physik               |
| **Glass Icons**       | [`/components/glass-icons`](https://reactbits.dev/components/glass-icons)             | ⚪ Katalog-Bestand | Glas-Icon-Leiste                                                    | Glassmorphism-Icons       |
| **Decay Card**        | [`/components/decay-card`](https://reactbits.dev/components/decay-card)               | ⚪ Katalog-Bestand | Zerfallende Karte (Verlust-Deko)                                    | Decay-Shader              |
| **Flowing Menu**      | [`/components/flowing-menu`](https://reactbits.dev/components/flowing-menu)           | ⚪ Katalog-Bestand | Fließende Menü-Übergänge                                            | Wave-Transform            |
| **Elastic Slider**    | [`/components/elastic-slider`](https://reactbits.dev/components/elastic-slider)       | ⚪ Katalog-Bestand | Elastischer Slider                                                  | Federphysik-Slider        |
| **Counter**           | [`/components/counter`](https://reactbits.dev/components/counter)                     | ⚪ Katalog-Bestand | Animierte Zähler (Monospace-Pflicht)                                | Interpolations-Counter    |
| **Infinite Menu**     | [`/components/infinite-menu`](https://reactbits.dev/components/infinite-menu)         | ⚪ Katalog-Bestand | Endloses Kreis-Menü                                                 | Infinite-Radial           |
| **Stepper**           | [`/components/stepper`](https://reactbits.dev/components/stepper)                     | ⚪ Katalog-Bestand | Schritt-Fortschritt (Onboarding)                                    | Stepper-Animation         |
| **Bounce Cards**      | [`/components/bounce-cards`](https://reactbits.dev/components/bounce-cards)           | ⚪ Katalog-Bestand | Federn-Kartenstapel                                                 | Spring-Physik             |

---

## Kategorie 4: Hintergründe

| Komponente          | Offizieller Link (reactbits.dev)                                                    |     User-Votum     | Casino-Einsatzbereich                                                | Technologie         |
| :------------------ | :---------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------- | :------------------ |
| **Aero Shards**     | [`/backgrounds/aero-shards`](https://reactbits.dev/backgrounds/aero-shards)         | ⚪ Katalog-Bestand | Splitter-Atmosphäre                                                  | WebGL-Shader        |
| **Ghost Fibers**    | [`/backgrounds/ghost-fibers`](https://reactbits.dev/backgrounds/ghost-fibers)       | ⚪ Katalog-Bestand | Faseriger Nebel                                                      | WebGL-Shader        |
| **CRT Warp**        | [`/backgrounds/crt-warp`](https://reactbits.dev/backgrounds/crt-warp)               | ⚪ Katalog-Bestand | Retro-Röhren-Warp (Easter-Egg)                                       | WebGL-Shader        |
| **Molten Metal**    | [`/backgrounds/molten-metal`](https://reactbits.dev/backgrounds/molten-metal)       | ⚪ Katalog-Bestand | Geschmolzenes Gold (Liquid-Chrome-Alternative)                       | WebGL-Shader        |
| **Gradient Waves**  | [`/backgrounds/gradient-waves`](https://reactbits.dev/backgrounds/gradient-waves)   | ⚪ Katalog-Bestand | Weiche Wellen-Verläufe                                               | WebGL-Shader        |
| **Web Threads**     | [`/backgrounds/web-threads`](https://reactbits.dev/backgrounds/web-threads)         | ⚪ Katalog-Bestand | Faden-Netz-Deko                                                      | Canvas/WebGL        |
| **Topography**      | [`/backgrounds/topography`](https://reactbits.dev/backgrounds/topography)           | ⚪ Katalog-Bestand | Höhenlinien-Deko                                                     | Linien-Shader       |
| **Light Tunnel**    | [`/backgrounds/light-tunnel`](https://reactbits.dev/backgrounds/light-tunnel)       | ⚪ Katalog-Bestand | Tunnel-Licht (Crash-Flug)                                            | WebGL-Shader        |
| **Sliced Waves**    | [`/backgrounds/sliced-waves`](https://reactbits.dev/backgrounds/sliced-waves)       | ⚪ Katalog-Bestand | Segmentierte Wellen                                                  | WebGL-Shader        |
| **Acid Squares**    | [`/backgrounds/acid-squares`](https://reactbits.dev/backgrounds/acid-squares)       | ⚪ Katalog-Bestand | Psychedelische Kacheln                                               | WebGL-Shader        |
| **Scanner**         | [`/backgrounds/scanner`](https://reactbits.dev/backgrounds/scanner)                 | ⚪ Katalog-Bestand | Scanlinien (Audit-Deko)                                              | Scanline-Shader     |
| **Ferrofluid**      | [`/backgrounds/ferrofluid`](https://reactbits.dev/backgrounds/ferrofluid)           | ⚪ Katalog-Bestand | Magnetische Flüssigkeit (Obsidian-Look)                              | WebGL-Simulation    |
| **Lightfall**       | [`/backgrounds/lightfall`](https://reactbits.dev/backgrounds/lightfall)             | ⚪ Katalog-Bestand | Fallendes Licht                                                      | Partikel-Shader     |
| **Liquid Ether**    | [`/backgrounds/liquid-ether`](https://reactbits.dev/backgrounds/liquid-ether)       | ⚪ Katalog-Bestand | Flüssiges Äther-Gold (Liquid-Chrome-Alternative)                     | Fluid-Simulation    |
| **Prism**           | [`/backgrounds/prism`](https://reactbits.dev/backgrounds/prism)                     | ⚪ Katalog-Bestand | Prismen-Reflexion (vgl. Prism Gradient in 12)                        | WebGL-Shader        |
| **Dark Veil**       | [`/backgrounds/dark-veil`](https://reactbits.dev/backgrounds/dark-veil)             | ⚪ Katalog-Bestand | Dunkler Schleier (Obsidian-Atmosphäre)                               | WebGL-Shader        |
| **Light Pillar**    | [`/backgrounds/light-pillar`](https://reactbits.dev/backgrounds/light-pillar)       | ⚪ Katalog-Bestand | Lichtsäule (Jackpot-Reveal)                                          | Beam-Shader         |
| **Silk**            | [`/backgrounds/silk`](https://reactbits.dev/backgrounds/silk)                       | ⚪ Katalog-Bestand | Abgewählt in 12 (Silk Aurora) — Vergleichskandidat                   | Satin-Shader        |
| **Floating Lines**  | [`/backgrounds/floating-lines`](https://reactbits.dev/backgrounds/floating-lines)   | ⚪ Katalog-Bestand | Schwebende Linien                                                    | Linien-Shader       |
| **Side Rays**       | [`/backgrounds/side-rays`](https://reactbits.dev/backgrounds/side-rays)             | ⚪ Katalog-Bestand | Seitenstrahlen (Hero-Licht)                                          | Beam-Shader         |
| **Light Rays**      | [`/backgrounds/light-rays`](https://reactbits.dev/backgrounds/light-rays)           | ⚪ Katalog-Bestand | Strahlenbüschel hinter Logo                                          | Beam-Shader         |
| **Pixel Blast**     | [`/backgrounds/pixel-blast`](https://reactbits.dev/backgrounds/pixel-blast)         | ⚪ Katalog-Bestand | Pixel-Explosion bei Jackpot                                          | Partikel-Pixel      |
| **Color Bends**     | [`/backgrounds/color-bends`](https://reactbits.dev/backgrounds/color-bends)         | ⚪ Katalog-Bestand | Farb-Biegungen                                                       | WebGL-Shader        |
| **Evil Eye**        | [`/backgrounds/evil-eye`](https://reactbits.dev/backgrounds/evil-eye)               | ⚪ Katalog-Bestand | Auge-Motiv (Roulette-Kugel-Deko)                                     | WebGL-Shader        |
| **Line Waves**      | [`/backgrounds/line-waves`](https://reactbits.dev/backgrounds/line-waves)           | ⚪ Katalog-Bestand | Linienwellen                                                         | Linien-Shader       |
| **Radar**           | [`/backgrounds/radar`](https://reactbits.dev/backgrounds/radar)                     | ⚪ Katalog-Bestand | Radar-Sweep (Live-Feed-Deko)                                         | Sweep-Animation     |
| **Soft Aurora**     | [`/backgrounds/soft-aurora`](https://reactbits.dev/backgrounds/soft-aurora)         | ⚪ Katalog-Bestand | Zarte Polarlichter                                                   | WebGL-Shader        |
| **Aurora**          | [`/backgrounds/aurora`](https://reactbits.dev/backgrounds/aurora)                   | ⚪ Katalog-Bestand | Polarlichter (vgl. Aurora Flow in 12)                                | WebGL-Shader        |
| **Plasma**          | [`/backgrounds/plasma`](https://reactbits.dev/backgrounds/plasma)                   | ⚪ Katalog-Bestand | Plasmafeld (vgl. Closing Plasma in 12)                               | Plasma-Shader       |
| **Plasma Wave**     | [`/backgrounds/plasma-wave`](https://reactbits.dev/backgrounds/plasma-wave)         | ⚪ Katalog-Bestand | Plasmawellen                                                         | Plasma-Shader       |
| **Particles**       | [`/backgrounds/particles`](https://reactbits.dev/backgrounds/particles)             | ⚪ Katalog-Bestand | Interaktives Partikelfeld (vgl. Magnet Lines in 12)                  | Partikel-Canvas     |
| **Gradient Blinds** | [`/backgrounds/gradient-blinds`](https://reactbits.dev/backgrounds/gradient-blinds) | ⚪ Katalog-Bestand | Lamellen-Verlauf                                                     | WebGL-Shader        |
| **Grainient**       | [`/backgrounds/grainient`](https://reactbits.dev/backgrounds/grainient)             | ⚪ Katalog-Bestand | Körniger Verlauf (Textur-Pflicht)                                    | Grain-Shader        |
| **Grid Scan**       | [`/backgrounds/grid-scan`](https://reactbits.dev/backgrounds/grid-scan)             | ⚪ Katalog-Bestand | Raster-Scan-Deko                                                     | Grid-Shader         |
| **Beams**           | [`/backgrounds/beams`](https://reactbits.dev/backgrounds/beams)                     | ⚪ Katalog-Bestand | Lichtbalken                                                          | Beam-Shader         |
| **Pixel Snow**      | [`/backgrounds/pixel-snow`](https://reactbits.dev/backgrounds/pixel-snow)           | ⚪ Katalog-Bestand | Pixel-Fall (Seasonal-Deko)                                           | Partikel-Canvas     |
| **Lightning**       | [`/backgrounds/lightning`](https://reactbits.dev/backgrounds/lightning)             | ⚪ Katalog-Bestand | Blitz-Effekt (Big-Win)                                               | Blitz-Canvas        |
| **Prismatic Burst** | [`/backgrounds/prismatic-burst`](https://reactbits.dev/backgrounds/prismatic-burst) | ⚪ Katalog-Bestand | Prismen-Burst                                                        | WebGL-Shader        |
| **Galaxy**          | [`/backgrounds/galaxy`](https://reactbits.dev/backgrounds/galaxy)                   | ⚪ Katalog-Bestand | Galaxie-Spirale (Hall of Fame)                                       | Partikel-Galaxie    |
| **Dither**          | [`/backgrounds/dither`](https://reactbits.dev/backgrounds/dither)                   | ⚪ Katalog-Bestand | Abgewählt in 12 (Dither Gradient) — Vergleichskandidat               | Dither-Shader       |
| **Faulty Terminal** | [`/backgrounds/faulty-terminal`](https://reactbits.dev/backgrounds/faulty-terminal) | ⚪ Katalog-Bestand | Stör-Terminal (Dev-Mode)                                             | Terminal-Shader     |
| **Ripple Grid**     | [`/backgrounds/ripple-grid`](https://reactbits.dev/backgrounds/ripple-grid)         | ⚪ Katalog-Bestand | Wellen-Raster                                                        | Grid-Shader         |
| **Dot Field**       | [`/backgrounds/dot-field`](https://reactbits.dev/backgrounds/dot-field)             | ⚪ Katalog-Bestand | Punktfeld                                                            | Partikel-Gitter     |
| **Dot Grid**        | [`/backgrounds/dot-grid`](https://reactbits.dev/backgrounds/dot-grid)               | ⚪ Katalog-Bestand | Punkteraster mit Interaktion                                         | Canvas-Gitter       |
| **Threads**         | [`/backgrounds/threads`](https://reactbits.dev/backgrounds/threads)                 | ⚪ Katalog-Bestand | Faden-Geflecht                                                       | Faden-Shader        |
| **Hyperspeed**      | [`/backgrounds/hyperspeed`](https://reactbits.dev/backgrounds/hyperspeed)           | ⚪ Katalog-Bestand | Hyperspeed-Tunnel (Crash)                                            | WebGL-Simulation    |
| **Iridescence**     | [`/backgrounds/iridescence`](https://reactbits.dev/backgrounds/iridescence)         | ⚪ Katalog-Bestand | Irisierender Schimmer (High-Roller)                                  | WebGL-Shader        |
| **Waves**           | [`/backgrounds/waves`](https://reactbits.dev/backgrounds/waves)                     | ⚪ Katalog-Bestand | Klassische Wellen                                                    | WebGL-Shader        |
| **Grid Distortion** | [`/backgrounds/grid-distortion`](https://reactbits.dev/backgrounds/grid-distortion) | ⚪ Katalog-Bestand | Verzerrtes Raster am Pointer                                         | Mesh-Verzerrung     |
| **Ballpit**         | [`/backgrounds/ballpit`](https://reactbits.dev/backgrounds/ballpit)                 | ⚪ Katalog-Bestand | Goldkugeln-Bad (Lobby-Deko)                                          | Three.js-Physik     |
| **Orb**             | [`/backgrounds/orb`](https://reactbits.dev/backgrounds/orb)                         | ⚪ Katalog-Bestand | Leuchtende Kugel (CTA-Hintergrund)                                   | WebGL-Shader        |
| **Letter Glitch**   | [`/backgrounds/letter-glitch`](https://reactbits.dev/backgrounds/letter-glitch)     | ⚪ Katalog-Bestand | Zeichen-Glitch-Raster                                                | Canvas-Zeichen      |
| **Grid Motion**     | [`/backgrounds/grid-motion`](https://reactbits.dev/backgrounds/grid-motion)         | ⚪ Katalog-Bestand | Bewegtes Raster                                                      | Grid-Animation      |
| **Shape Grid**      | [`/backgrounds/shape-grid`](https://reactbits.dev/backgrounds/shape-grid)           | ⚪ Katalog-Bestand | Formen-Raster                                                        | Formen-Canvas       |
| **Liquid Chrome**   | [`/backgrounds/liquid-chrome`](https://reactbits.dev/backgrounds/liquid-chrome)     | ⚪ Katalog-Bestand | **Direkter Zwilling zum 12-Favoriten** Liquid Chrome (Gold/Obsidian) | WebGL-Metall-Shader |
| **Balatro**         | [`/backgrounds/balatro`](https://reactbits.dev/backgrounds/balatro)                 | ⚪ Katalog-Bestand | Kasino-Pixel-Decken-Look (Balatro-Stil)                              | Pixel-Shader        |

---

## Kategorie 5: Guides & Tools

| Komponente                     | Offizieller Link (reactbits.dev)                                              |     User-Votum     | Casino-Einsatzbereich                   | Technologie      |
| :----------------------------- | :---------------------------------------------------------------------------- | :----------------: | :-------------------------------------- | :--------------- |
| **Home**                       | [`/`](https://reactbits.dev/)                                                 | ⚪ Katalog-Bestand | Einstieg & Live-Demos                   | Produktübersicht |
| **Get Started (Introduction)** | [`/get-started/introduction`](https://reactbits.dev/get-started/introduction) | ⚪ Katalog-Bestand | Onboarding in die Library               | Dokumentation    |
| **Installation**               | [`/get-started/installation`](https://reactbits.dev/get-started/installation) | ⚪ Katalog-Bestand | Setup-Referenz (shadcn/jsrepo CLI)      | CLI-Setup        |
| **MCP**                        | [`/get-started/mcp`](https://reactbits.dev/get-started/mcp)                   | ⚪ Katalog-Bestand | KI-Agenten-Integration (Cursor, Claude) | MCP-Server       |
| **Showcase**                   | [`/showcase`](https://reactbits.dev/showcase)                                 | ⚪ Katalog-Bestand | Referenz-Projekte                       | Galerie          |
| **Favorites**                  | [`/favorites`](https://reactbits.dev/favorites)                               | ⚪ Katalog-Bestand | Gemerkte Komponenten sammeln            | Merkliste        |
| **Sponsors**                   | [`/sponsors`](https://reactbits.dev/sponsors)                                 | ⚪ Katalog-Bestand | Projekt-Finanzierung                    | Info-Seite       |

---

## Kategorie 6: Pro & Plattform-Seiten

| Komponente          | Offizieller Link (reactbits.dev)                          | User-Votum | Casino-Einsatzbereich                 | Technologie  |
| :------------------ | :-------------------------------------------------------- | :--------: | :------------------------------------ | :----------- |
| **Pro (Übersicht)** | [`/pro`](https://reactbits.dev/pro)                       |   💰 Pro   | Kostenpflichtiger Erweiterungsbereich | Premium-Plan |
| **Pro Components**  | [`/pro/components`](https://reactbits.dev/pro/components) |   💰 Pro   | Erweiterte Komponenten                | Premium-Plan |
| **Pro Blocks**      | [`/pro/blocks`](https://reactbits.dev/pro/blocks)         |   💰 Pro   | Fertige Sektions-Blöcke               | Premium-Plan |
| **Pro App UI**      | [`/pro/app-ui`](https://reactbits.dev/pro/app-ui)         |   💰 Pro   | App-UI-Patterns                       | Premium-Plan |
| **Pro Templates**   | [`/pro/templates`](https://reactbits.dev/pro/templates)   |   💰 Pro   | Komplett-Templates                    | Premium-Plan |
| **Pro Agent Kit**   | [`/pro/agent-kit`](https://reactbits.dev/pro/agent-kit)   |   💰 Pro   | KI-Agenten-Kit                        | Premium-Plan |
