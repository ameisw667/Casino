# Aceternity UI (ui.aceternity.com) — Vollständiger Komponenten-Katalog (115 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [ui.aceternity.com](https://ui.aceternity.com/) (Manu Arora — Copy-Paste-Modell, Tailwind + Motion, ~19K Stars)
**Kanonische Projekt-Ablage:** [`docs/frontend/15_ui_aceternity_com_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/15_ui_aceternity_com_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Alle 115 URLs stammen 1:1 aus der offiziellen Sitemap (`ui.aceternity.com/sitemap.xml`, Stand 6. September 2026). Darüber hinaus existieren 167 `/blocks/*`-Sektions-Blöcke und 17 `/templates/*` (überwiegend im kostenpflichtigen **All-Access-Pass**) — hier nicht einzeln katalogisiert.
> **Hinweis zur Technologie-Spalte:** Grobe Klassifikation nach offizieller Beschreibung — bei der manuellen Klick-Prüfung verifizieren. Aceternity ist **dark-mode-first** designed (Passung zu Obsidian & Gold).

---

## 1. Quickstart

```bash
# Komponenten per Copy-Paste oder CLI (framer-motion + tailwindcss-animate als deps):
npx shadcn@latest add "https://ui.aceternity.com/registry/spotlight.json"
# Setup-Guides: /components/install-nextjs und /components/install-tailwindcss
```

---

## 2. Übersicht der 7 Kategorien (115 Einträge)

1. [Kategorie 1: 3D- & WebGL-Effekte](#kategorie-1-3d--webgl-effekte) _(17 Komponenten)_
2. [Kategorie 2: Hintergründe](#kategorie-2-hintergründe) _(18 Komponenten)_
3. [Kategorie 3: Text-Effekte](#kategorie-3-text-effekte) _(13 Komponenten)_
4. [Kategorie 4: Karten & Galerien](#kategorie-4-karten--galerien) _(21 Komponenten)_
5. [Kategorie 5: Navigation & Scroll](#kategorie-5-navigation--scroll) _(16 Komponenten)_
6. [Kategorie 6: Buttons, Inputs & UI-Primitives](#kategorie-6-buttons-inputs--ui-primitives) _(22 Komponenten)_
7. [Kategorie 7: Guides & Free-Sammlungen](#kategorie-7-guides--free-sammlungen) _(8 Einträge)_

---

### Legende zum User-Votum

Identisch zur Legende in [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Alle Einträge initial neutral, Votum wird von Jan nach manueller Prüfung nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** _(reserviert)_
- ⭐⭐ **Bestätigt** _(reserviert)_
- ❌ **Abgelehnt** _(reserviert)_
- ⚪ **Katalog-Bestand** (aktueller Status aller Einträge)

---

## Kategorie 1: 3D- & WebGL-Effekte

| Komponente               | Offizieller Link (ui.aceternity.com)                                                            |     User-Votum     | Casino-Einsatzbereich                               | Technologie            |
| :----------------------- | :---------------------------------------------------------------------------------------------- | :----------------: | :-------------------------------------------------- | :--------------------- |
| **3D Card Effect**       | [`/components/3d-card-effect`](https://ui.aceternity.com/components/3d-card-effect)             | ⚪ Katalog-Bestand | 3D-Kartenflip für Spielkacheln                      | CSS 3D-Transform       |
| **3D Globe**             | [`/components/3d-globe`](https://ui.aceternity.com/components/3d-globe)                         | ⚪ Katalog-Bestand | Globus-Deko (Live-Spieler-Länder)                   | Three.js/Cobe          |
| **3D Marquee**           | [`/components/3d-marquee`](https://ui.aceternity.com/components/3d-marquee)                     | ⚪ Katalog-Bestand | 3D-Laufband der Spiellogos                          | 3D-Transform-Laufband  |
| **3D Pin**               | [`/components/3d-pin`](https://ui.aceternity.com/components/3d-pin)                             | ⚪ Katalog-Bestand | Anstecknadel-Karte (Standort/Event)                 | 3D-Perspective         |
| **ASCII Art**            | [`/components/ascii-art`](https://ui.aceternity.com/components/ascii-art)                       | ⚪ Katalog-Bestand | Abgewählt in 12 (ASCII Effect) — Vergleichskandidat | ASCII-Rendering        |
| **Canvas Reveal Effect** | [`/components/canvas-reveal-effect`](https://ui.aceternity.com/components/canvas-reveal-effect) | ⚪ Katalog-Bestand | Strahlen-Reveal hinter Logos                        | Canvas-Gradienten      |
| **Cloud Shader**         | [`/components/cloud-shader`](https://ui.aceternity.com/components/cloud-shader)                 | ⚪ Katalog-Bestand | Atmosphären-Nebel für Hintergründe                  | WebGL-Shader           |
| **Comet Card**           | [`/components/comet-card`](https://ui.aceternity.com/components/comet-card)                     | ⚪ Katalog-Bestand | Kometen-Schweif auf Karten                          | Strahl-Simulation      |
| **Dither Shader**        | [`/components/dither-shader`](https://ui.aceternity.com/components/dither-shader)               | ⚪ Katalog-Bestand | Abgewählt in 12 (Dither) — Vergleichskandidat       | Dither-Shader          |
| **GitHub Globe**         | [`/components/github-globe`](https://ui.aceternity.com/components/github-globe)                 | ⚪ Katalog-Bestand | Punkte-Globus (Community-Section)                   | Three.js-Punkte        |
| **Google Gemini Effect** | [`/components/google-gemini-effect`](https://ui.aceternity.com/components/google-gemini-effect) | ⚪ Katalog-Bestand | Scroll-gebundener Lichtbogen                        | SVG + Scroll-Transform |
| **Lamp Effect**          | [`/components/lamp-effect`](https://ui.aceternity.com/components/lamp-effect)                   | ⚪ Katalog-Bestand | Lichtkegel-Reveal für Hero                          | Conic-Gradient         |
| **MacBook Scroll**       | [`/components/macbook-scroll`](https://ui.aceternity.com/components/macbook-scroll)             | ⚪ Katalog-Bestand | Produkt-Scroll-Story (Geräte-Showcase)              | Scroll-Linked 3D       |
| **Pixelated Canvas**     | [`/components/pixelated-canvas`](https://ui.aceternity.com/components/pixelated-canvas)         | ⚪ Katalog-Bestand | Pixel-Auflösungseffekt (vgl. Pixel Canvas in 12)    | Pixel-Canvas           |
| **Vortex**               | [`/components/vortex`](https://ui.aceternity.com/components/vortex)                             | ⚪ Katalog-Bestand | Partikel-Wirbel (Big-Win-Sog)                       | Partikel-Vortex        |
| **Webcam Pixel Grid**    | [`/components/webcam-pixel-grid`](https://ui.aceternity.com/components/webcam-pixel-grid)       | ⚪ Katalog-Bestand | Pixel-Webcam-Spielerei (Easter-Egg)                 | WebCam + Pixel-Grid    |
| **Glowing Effect**       | [`/components/glowing-effect`](https://ui.aceternity.com/components/glowing-effect)             | ⚪ Katalog-Bestand | Verfolgender Goldrand für HUD-Kacheln               | Border-Glow-Shader     |

---

## Kategorie 2: Hintergründe

| Komponente                            | Offizieller Link (ui.aceternity.com)                                                                                          |     User-Votum     | Casino-Einsatzbereich                       | Technologie             |
| :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------ | :---------------------- |
| **Aurora Background**                 | [`/components/aurora-background`](https://ui.aceternity.com/components/aurora-background)                                     | ⚪ Katalog-Bestand | Polarlicht-Hero (vgl. Aurora Flow in 12)    | CSS/Motion-Gradient     |
| **Background Beams**                  | [`/components/background-beams`](https://ui.aceternity.com/components/background-beams)                                       | ⚪ Katalog-Bestand | Grid mit Lichtstrahlen (Provably-Fair-Deko) | SVG-Beams               |
| **Background Beams with Collision**   | [`/components/background-beams-with-collision`](https://ui.aceternity.com/components/background-beams-with-collision)         | ⚪ Katalog-Bestand | Lichtstrahlen mit Kollisions-Impuls         | Beams + Kollisionspunkt |
| **Background Boxes**                  | [`/components/background-boxes`](https://ui.aceternity.com/components/background-boxes)                                       | ⚪ Katalog-Bestand | Raster-Kacheln im Hintergrund               | CSS-Grid-Animation      |
| **Background Gradient**               | [`/components/background-gradient`](https://ui.aceternity.com/components/background-gradient)                                 | ⚪ Katalog-Bestand | Weicher Farbverlauf                         | Animated Gradient       |
| **Background Gradient Animation**     | [`/components/background-gradient-animation`](https://ui.aceternity.com/components/background-gradient-animation)             | ⚪ Katalog-Bestand | Bewegter Verlauf (CTA-Fläche)               | Gradient-Morphing       |
| **Background Lines**                  | [`/components/background-lines`](https://ui.aceternity.com/components/background-lines)                                       | ⚪ Katalog-Bestand | Liniengefüge (Footer-Deko)                  | SVG-Linienmuster        |
| **Background Ripple Effect**          | [`/components/background-ripple-effect`](https://ui.aceternity.com/components/background-ripple-effect)                       | ⚪ Katalog-Bestand | Wellen-Interaktion im Hintergrund           | Canvas-Ripple           |
| **Dotted Glow Background**            | [`/components/dotted-glow-background`](https://ui.aceternity.com/components/dotted-glow-background)                           | ⚪ Katalog-Bestand | Leuchtendes Punktraster                     | Dot-Glow-Grid           |
| **Glowing Stars Effect**              | [`/components/glowing-stars-effect`](https://ui.aceternity.com/components/glowing-stars-effect)                               | ⚪ Katalog-Bestand | Funkelnde Sterne (Goldstaub)                | Star-Canvas             |
| **Grid & Dot Backgrounds**            | [`/components/grid-and-dot-backgrounds`](https://ui.aceternity.com/components/grid-and-dot-backgrounds)                       | ⚪ Katalog-Bestand | Raster-/Punktmuster-Sammlung                | CSS-Muster              |
| **Meteors**                           | [`/components/meteors`](https://ui.aceternity.com/components/meteors)                                                         | ⚪ Katalog-Bestand | Meteor-Schweife (Crash-Deko)                | CSS-Trail-Animation     |
| **Noise Background**                  | [`/components/noise-background`](https://ui.aceternity.com/components/noise-background)                                       | ⚪ Katalog-Bestand | Filmkorn-Textur (Grain-Pflicht)             | SVG-Noise               |
| **Shooting Stars & Stars Background** | [`/components/shooting-stars-and-stars-background`](https://ui.aceternity.com/components/shooting-stars-and-stars-background) | ⚪ Katalog-Bestand | Sternenhimmel mit Sternschnuppen            | CSS-Keyframes           |
| **Sparkles**                          | [`/components/sparkles`](https://ui.aceternity.com/components/sparkles)                                                       | ⚪ Katalog-Bestand | Funken-Partikel hinter Headlines            | Partikel-Canvas         |
| **Spotlight**                         | [`/components/spotlight`](https://ui.aceternity.com/components/spotlight)                                                     | ⚪ Katalog-Bestand | Lichtkegel im Hero                          | SVG-Spotlight           |
| **Spotlight New**                     | [`/components/spotlight-new`](https://ui.aceternity.com/components/spotlight-new)                                             | ⚪ Katalog-Bestand | Neufassung des Spotlight-Effekts            | Spotlight-V2            |
| **Wavy Background**                   | [`/components/wavy-background`](https://ui.aceternity.com/components/wavy-background)                                         | ⚪ Katalog-Bestand | Wellen-Partikel (Wasser-Tisch-Deko)         | Partikel-Wellen         |

---

## Kategorie 3: Text-Effekte

| Komponente               | Offizieller Link (ui.aceternity.com)                                                            |     User-Votum     | Casino-Einsatzbereich                             | Technologie       |
| :----------------------- | :---------------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------ | :---------------- |
| **Canvas Text**          | [`/components/canvas-text`](https://ui.aceternity.com/components/canvas-text)                   | ⚪ Katalog-Bestand | Canvas-gerenderter Deko-Text                      | Canvas-Typo       |
| **Colourful Text**       | [`/components/colourful-text`](https://ui.aceternity.com/components/colourful-text)             | ⚪ Katalog-Bestand | Farbwechselnde Buchstaben (Gold-Variante prüfen)  | Per-Char-Farbe    |
| **Container Text Flip**  | [`/components/container-text-flip`](https://ui.aceternity.com/components/container-text-flip)   | ⚪ Katalog-Bestand | Wechselnde Begriffe im Hero (Word Swap, vgl. 12)  | Container-Flip    |
| **Encrypted Text**       | [`/components/encrypted-text`](https://ui.aceternity.com/components/encrypted-text)             | ⚪ Katalog-Bestand | Decrypt-Deko (Provably-Fair)                      | Zeichen-Decrypt   |
| **Flip Words**           | [`/components/flip-words`](https://ui.aceternity.com/components/flip-words)                     | ⚪ Katalog-Bestand | Flippende Wörter (Modus-Tabs)                     | Flip-Transform    |
| **Layout Text Flip**     | [`/components/layout-text-flip`](https://ui.aceternity.com/components/layout-text-flip)         | ⚪ Katalog-Bestand | Layout-stabiles Wort-Flippen                      | FLIP-Technik      |
| **Squiggly Text**        | [`/components/squiggly-text`](https://ui.aceternity.com/components/squiggly-text)               | ⚪ Katalog-Bestand | Geschwungene Unterstreichung                      | SVG-Squiggle      |
| **SVG Mask Effect**      | [`/components/svg-mask-effect`](https://ui.aceternity.com/components/svg-mask-effect)           | ⚪ Katalog-Bestand | Text als Bildmaske (Motion-Slogan)                | SVG-Maske         |
| **Text Flipping Board**  | [`/components/text-flipping-board`](https://ui.aceternity.com/components/text-flipping-board)   | ⚪ Katalog-Bestand | Abgewählt in 12 (Split-Flap) — Vergleichskandidat | Flap-Board        |
| **Text Generate Effect** | [`/components/text-generate-effect`](https://ui.aceternity.com/components/text-generate-effect) | ⚪ Katalog-Bestand | Wortweises Einblenden (Onboarding)                | Staggered Reveal  |
| **Text Hover Effect**    | [`/components/text-hover-effect`](https://ui.aceternity.com/components/text-hover-effect)       | ⚪ Katalog-Bestand | Leuchtraster folgt Pointer auf Text               | Gradient-Follow   |
| **Text Reveal Card**     | [`/components/text-reveal-card`](https://ui.aceternity.com/components/text-reveal-card)         | ⚪ Katalog-Bestand | Bild-Reveal durch Text                            | Masken-Reveal     |
| **Typewriter Effect**    | [`/components/typewriter-effect`](https://ui.aceternity.com/components/typewriter-effect)       | ⚪ Katalog-Bestand | Getippter Text (KI-Guide)                         | Typewriter-Engine |

---

## Kategorie 4: Karten & Galerien

| Komponente                | Offizieller Link (ui.aceternity.com)                                                              |     User-Votum     | Casino-Einsatzbereich                                          | Technologie              |
| :------------------------ | :------------------------------------------------------------------------------------------------ | :----------------: | :------------------------------------------------------------- | :----------------------- |
| **Animated Testimonials** | [`/components/animated-testimonials`](https://ui.aceternity.com/components/animated-testimonials) | ⚪ Katalog-Bestand | Community-Stimmen-Slider                                       | Karten-Slider            |
| **Apple Cards Carousel**  | [`/components/apple-cards-carousel`](https://ui.aceternity.com/components/apple-cards-carousel)   | ⚪ Katalog-Bestand | Apple-Style-Karussell (VIP-Tiers, vgl. Orbit Card Stack in 12) | Expandierendes Karussell |
| **Bento Grid**            | [`/components/bento-grid`](https://ui.aceternity.com/components/bento-grid)                       | ⚪ Katalog-Bestand | Bento-Layouts (Home-Kacheln)                                   | Bento-Raster             |
| **Card Hover Effect**     | [`/components/card-hover-effect`](https://ui.aceternity.com/components/card-hover-effect)         | ⚪ Katalog-Bestand | Aufhell-Hover auf Grid-Karten                                  | Hover-Overlay            |
| **Card Spotlight**        | [`/components/card-spotlight`](https://ui.aceternity.com/components/card-spotlight)               | ⚪ Katalog-Bestand | Spotlight folgt Pointer (vgl. ElevatedGameCard)                | Pointer-Spotlight        |
| **Card Stack**            | [`/components/card-stack`](https://ui.aceternity.com/components/card-stack)                       | ⚪ Katalog-Bestand | Kartenstapel (Blackjack-Optik)                                 | Stack-Überschneidung     |
| **Chromatic Image**       | [`/components/chromatic-image`](https://ui.aceternity.com/components/chromatic-image)             | ⚪ Katalog-Bestand | Chromatische Aberration auf Bildern                            | RGB-Split-Filter         |
| **Container Cover**       | [`/components/container-cover`](https://ui.aceternity.com/components/container-cover)             | ⚪ Katalog-Bestand | Aufklappender Rahmen beim Scrollen                             | Scale-Container          |
| **Direction Aware Hover** | [`/components/direction-aware-hover`](https://ui.aceternity.com/components/direction-aware-hover) | ⚪ Katalog-Bestand | Richtungsabhängiger Bild-Sweep                                 | Richtungserkennung       |
| **Draggable Card**        | [`/components/draggable-card`](https://ui.aceternity.com/components/draggable-card)               | ⚪ Katalog-Bestand | Ziehbare Karten mit Physik                                     | Drag-Physik              |
| **Evervault Card**        | [`/components/evervault-card`](https://ui.aceternity.com/components/evervault-card)               | ⚪ Katalog-Bestand | Verschlüsselungs-Deko (Seed-Verifikation)                      | Zeichen-Verschlüsselung  |
| **Expandable Card**       | [`/components/expandable-card`](https://ui.aceternity.com/components/expandable-card)             | ⚪ Katalog-Bestand | Aufklapp-Karte (Spieldetails)                                  | Layout-Animation         |
| **Focus Cards**           | [`/components/focus-cards`](https://ui.aceternity.com/components/focus-cards)                     | ⚪ Katalog-Bestand | Fokus-Effekt in Galerie-Grids                                  | Blur/Focus-Hover         |
| **Glare Card**            | [`/components/glare-card`](https://ui.aceternity.com/components/glare-card)                       | ⚪ Katalog-Bestand | Glanzwinkel auf Karten (Hologramm-Optik)                       | Glare-Gradient           |
| **Hero Highlight**        | [`/components/hero-highlight`](https://ui.aceternity.com/components/hero-highlight)               | ⚪ Katalog-Bestand | Pointer-Spotlight auf Wortgruppe                               | Text-Spotlight           |
| **Images Badge**          | [`/components/images-badge`](https://ui.aceternity.com/components/images-badge)                   | ⚪ Katalog-Bestand | Bildstapel-Badge (Spiel-Icons)                                 | Überlapp-Badge           |
| **Layout Grid**           | [`/components/layout-grid`](https://ui.aceternity.com/components/layout-grid)                     | ⚪ Katalog-Bestand | Expandierendes Magazin-Grid                                    | Layout-Animation         |
| **Lens**                  | [`/components/lens`](https://ui.aceternity.com/components/lens)                                   | ⚪ Katalog-Bestand | Lupen-Zoom auf Screenshots                                     | Zoom-Lupe                |
| **Timeline**              | [`/components/timeline`](https://ui.aceternity.com/components/timeline)                           | ⚪ Katalog-Bestand | Vertikale Chronik (Roadmap/Changelog)                          | Scroll-Timeline          |
| **Tooltip Card**          | [`/components/tooltip-card`](https://ui.aceternity.com/components/tooltip-card)                   | ⚪ Katalog-Bestand | Tooltip mit Karteninhalt                                       | Popover-Karte            |
| **Wobble Card**           | [`/components/wobble-card`](https://ui.aceternity.com/components/wobble-card)                     | ⚪ Katalog-Bestand | Wobble-Effekt beim Scrollen                                    | Skew-Transform           |

---

## Kategorie 5: Navigation & Scroll

| Komponente                     | Offizieller Link (ui.aceternity.com)                                                                        |     User-Votum     | Casino-Einsatzbereich                                        | Technologie         |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------- | :----------------: | :----------------------------------------------------------- | :------------------ |
| **Carousel**                   | [`/components/carousel`](https://ui.aceternity.com/components/carousel)                                     | ⚪ Katalog-Bestand | Standard-Karussell (Spielauswahl)                            | Embla/Scroll-Snap   |
| **Container Scroll Animation** | [`/components/container-scroll-animation`](https://ui.aceternity.com/components/container-scroll-animation) | ⚪ Katalog-Bestand | Aufdrehender Container beim Scrollen                         | Scroll-Rotation     |
| **Floating Dock**              | [`/components/floating-dock`](https://ui.aceternity.com/components/floating-dock)                           | ⚪ Katalog-Bestand | Dock-Leiste (MobileNav-Ersatz, vgl. Magnetic Dock in 12)     | Magnification-Dock  |
| **Floating Navbar**            | [`/components/floating-navbar`](https://ui.aceternity.com/components/floating-navbar)                       | ⚪ Katalog-Bestand | Schwebende Navigationsleiste                                 | Fixed-Pill-Nav      |
| **Hero Parallax**              | [`/components/hero-parallax`](https://ui.aceternity.com/components/hero-parallax)                           | ⚪ Katalog-Bestand | Parallax-Spalten im Hero                                     | Scroll-Parallax     |
| **Parallax Hero Images**       | [`/components/parallax-hero-images`](https://ui.aceternity.com/components/parallax-hero-images)             | ⚪ Katalog-Bestand | Parallax-Bildstapel                                          | Tiefen-Staffelung   |
| **Parallax Scroll**            | [`/components/parallax-scroll`](https://ui.aceternity.com/components/parallax-scroll)                       | ⚪ Katalog-Bestand | Parallax-Tiefen-Effekt                                       | Scroll-Transform    |
| **Images Slider**              | [`/components/images-slider`](https://ui.aceternity.com/components/images-slider)                           | ⚪ Katalog-Bestand | Hintergrund-Bildslider (Lobby)                               | Slider-Übergänge    |
| **Infinite Moving Cards**      | [`/components/infinite-moving-cards`](https://ui.aceternity.com/components/infinite-moving-cards)           | ⚪ Katalog-Bestand | Endloses Karten-Laufband (Gewinner-Feed)                     | Marquee-Klontechnik |
| **Navbar Menu**                | [`/components/navbar-menu`](https://ui.aceternity.com/components/navbar-menu)                               | ⚪ Katalog-Bestand | Menü mit Hover-Float                                         | Navbar-Pattern      |
| **Resizable Navbar**           | [`/components/resizable-navbar`](https://ui.aceternity.com/components/resizable-navbar)                     | ⚪ Katalog-Bestand | Schrumpfende Navbar beim Scrollen                            | Scroll-Shrink       |
| **Sidebar**                    | [`/components/sidebar`](https://ui.aceternity.com/components/sidebar)                                       | ⚪ Katalog-Bestand | Expandierende Sidebar (Admin)                                | Sidebar-Layout      |
| **Sticky Banner**              | [`/components/sticky-banner`](https://ui.aceternity.com/components/sticky-banner)                           | ⚪ Katalog-Bestand | Fixierte Promo-Banner                                        | Sticky-Position     |
| **Sticky Scroll Reveal**       | [`/components/sticky-scroll-reveal`](https://ui.aceternity.com/components/sticky-scroll-reveal)             | ⚪ Katalog-Bestand | Sticky-Sektionen mit Reveal (vgl. Sticky Scroll Cards in 12) | Sticky + Reveal     |
| **Tracing Beam**               | [`/components/tracing-beam`](https://ui.aceternity.com/components/tracing-beam)                             | ⚪ Katalog-Bestand | Fortschritts-Strahl an Content (Provably-Fair-Story)         | Scroll-Fortschritt  |
| **World Map**                  | [`/components/world-map`](https://ui.aceternity.com/components/world-map)                                   | ⚪ Katalog-Bestand | Weltkarte mit Bögen (Community-Global)                       | SVG-Arc-Animation   |

---

## Kategorie 6: Buttons, Inputs & UI-Primitives

| Komponente                      | Offizieller Link (ui.aceternity.com)                                                                              |     User-Votum     | Casino-Einsatzbereich                             | Technologie            |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------ | :--------------------- |
| **Animated Modal**              | [`/components/animated-modal`](https://ui.aceternity.com/components/animated-modal)                               | ⚪ Katalog-Bestand | Modal mit Ein-/Ausblendung (vgl. AnimatePresence) | Motion-Modal           |
| **Animated Tooltip**            | [`/components/animated-tooltip`](https://ui.aceternity.com/components/animated-tooltip)                           | ⚪ Katalog-Bestand | Springende Tooltips (HUD)                         | Scale-Tooltip          |
| **Code Block**                  | [`/components/code-block`](https://ui.aceternity.com/components/code-block)                                       | ⚪ Katalog-Bestand | Code-Anzeige (Provably-Fair-Snippets)             | Syntax-Highlighting    |
| **File Upload**                 | [`/components/file-upload`](https://ui.aceternity.com/components/file-upload)                                     | ⚪ Katalog-Bestand | Drag-&-Drop-Upload (Support-Formular)             | Dropzone-Pattern       |
| **Following Pointer**           | [`/components/following-pointer`](https://ui.aceternity.com/components/following-pointer)                         | ⚪ Katalog-Bestand | Custom Pointer-Element                            | Pointer-Tracking       |
| **Gooey Input**                 | [`/components/gooey-input`](https://ui.aceternity.com/components/gooey-input)                                     | ⚪ Katalog-Bestand | Verschmelzendes Input-Feld                        | Goo-Filter             |
| **Hover Border Gradient**       | [`/components/hover-border-gradient`](https://ui.aceternity.com/components/hover-border-gradient)                 | ⚪ Katalog-Bestand | Rotierender Gradient-Rand (Goldrand)              | Conic-Border-Animation |
| **Keyboard**                    | [`/components/keyboard`](https://ui.aceternity.com/components/keyboard)                                           | ⚪ Katalog-Bestand | Tastatur-Deko (vgl. Mac Keyboard in 12)           | Keycap-UI              |
| **Link Preview**                | [`/components/link-preview`](https://ui.aceternity.com/components/link-preview)                                   | ⚪ Katalog-Bestand | Hover-Preview-Karten für Links                    | Preview-Popover        |
| **Loader**                      | [`/components/loader`](https://ui.aceternity.com/components/loader)                                               | ⚪ Katalog-Bestand | Ladendreh-Anim (Spin-Optik)                       | Spinner-Pattern        |
| **Magnetic Button**             | [`/components/magnetic-button`](https://ui.aceternity.com/components/magnetic-button)                             | ⚪ Katalog-Bestand | Magnetischer CTA-Button                           | Magnetic-Transform     |
| **Moving Border**               | [`/components/moving-border`](https://ui.aceternity.com/components/moving-border)                                 | ⚪ Katalog-Bestand | Lauffeuer-Rand um Buttons                         | Border-Orbit           |
| **Multi-Step Loader**           | [`/components/multi-step-loader`](https://ui.aceternity.com/components/multi-step-loader)                         | ⚪ Katalog-Bestand | Stufen-Loader (Settlement-Prozess)                | Schritt-Sequenz        |
| **Notch**                       | [`/components/notch`](https://ui.aceternity.com/components/notch)                                                 | ⚪ Katalog-Bestand | Notch-Leiste (iPhone-Optik, HUD-Alerts)           | Notch-Mockup           |
| **Placeholders & Vanish Input** | [`/components/placeholders-and-vanish-input`](https://ui.aceternity.com/components/placeholders-and-vanish-input) | ⚪ Katalog-Bestand | Suchfeld mit verschwindenden Placeholdern         | Placeholder-Rotation   |
| **Pointer Highlight**           | [`/components/pointer-highlight`](https://ui.aceternity.com/components/pointer-highlight)                         | ⚪ Katalog-Bestand | Pointer-Textmarkierung                            | Text-Highlight-Follow  |
| **Scales**                      | [`/components/scales`](https://ui.aceternity.com/components/scales)                                               | ⚪ Katalog-Bestand | Waagen-Deko (Fairness-Metapher)                   | SVG-Animation          |
| **Signup Form**                 | [`/components/signup-form`](https://ui.aceternity.com/components/signup-form)                                     | ⚪ Katalog-Bestand | Mehrschrittiges Formular (Registrierung)          | Formular-Wizard        |
| **Stateful Button**             | [`/components/stateful-button`](https://ui.aceternity.com/components/stateful-button)                             | ⚪ Katalog-Bestand | Button mit Lade-/Erfolgszustand                   | State-Machine-UI       |
| **Tabs**                        | [`/components/tabs`](https://ui.aceternity.com/components/tabs)                                                   | ⚪ Katalog-Bestand | animierte Tabs (Spielmodi)                        | Tab-Indicator          |
| **TailwindCSS Buttons**         | [`/components/tailwindcss-buttons`](https://ui.aceternity.com/components/tailwindcss-buttons)                     | ⚪ Katalog-Bestand | Button-Sammlung (Gradient/Glow)                   | Tailwind-Utilities     |
| **Terminal**                    | [`/components/terminal`](https://ui.aceternity.com/components/terminal)                                           | ⚪ Katalog-Bestand | Terminal-Mockup (Audit-Log-Deko)                  | Terminal-UI            |

---

## Kategorie 7: Guides & Free-Sammlungen

| Komponente                  | Offizieller Link (ui.aceternity.com)                                                              |     User-Votum     | Casino-Einsatzbereich                          | Technologie        |
| :-------------------------- | :------------------------------------------------------------------------------------------------ | :----------------: | :--------------------------------------------- | :----------------- |
| **Home**                    | [`/`](https://ui.aceternity.com/)                                                                 | ⚪ Katalog-Bestand | Einstieg & Live-Demos                          | Produktübersicht   |
| **Install Next.js**         | [`/components/install-nextjs`](https://ui.aceternity.com/components/install-nextjs)               | ⚪ Katalog-Bestand | Setup-Guide für Next.js                        | Integrations-Guide |
| **Install TailwindCSS**     | [`/components/install-tailwindcss`](https://ui.aceternity.com/components/install-tailwindcss)     | ⚪ Katalog-Bestand | Setup-Guide für Tailwind                       | Integrations-Guide |
| **CLI**                     | [`/components/cli`](https://ui.aceternity.com/components/cli)                                     | ⚪ Katalog-Bestand | CLI-Referenz (shadcn-Registry)                 | CLI-Setup          |
| **Cards (Free)**            | [`/components/cards-free`](https://ui.aceternity.com/components/cards-free)                       | ⚪ Katalog-Bestand | Kostenlose Karten-Sammlung                     | Free-Kollektion    |
| **Feature Sections (Free)** | [`/components/feature-sections-free`](https://ui.aceternity.com/components/feature-sections-free) | ⚪ Katalog-Bestand | Kostenlose Feature-Sektionen                   | Free-Kollektion    |
| **Hero Sections (Free)**    | [`/components/hero-sections-free`](https://ui.aceternity.com/components/hero-sections-free)       | ⚪ Katalog-Bestand | Kostenlose Hero-Sektionen                      | Free-Kollektion    |
| **Compare**                 | [`/compare`](https://ui.aceternity.com/compare)                                                   | ⚪ Katalog-Bestand | Vergleichs-Center (vs. shadcn/Chakra/Material) | Vergleichs-Doku    |
