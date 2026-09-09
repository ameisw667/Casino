# shadcn.io/shaders — Vollständiger Shader-Katalog (57 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [shadcn.io/shaders](https://www.shadcn.io/shaders) (React/Next.js WebGL-Shader-Komponenten, 10 gratis / 47 Pro)
**Kanonische Projekt-Ablage:** [`docs/frontend/16_shadcn_io_shaders_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/16_shadcn_io_shaders_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Alle 57 URLs von der offiziellen Übersichtsseite `shadcn.io/shaders` (Stand 6. September 2026). Modell: Copy-Paste-React-Komponenten für Next.js/shadcn/ui mit Live-Preview und Props-Doku.
> **Hinweis:** Alle 57 Shader sind GLSL-WebGL-Fragment-Shader-Komponenten — die Technologie-Spalte differenziert die Shader-Familie.

---

## 1. Quickstart

```bash
# Shader-Komponente per CLI ins Projekt (Next.js + Tailwind):
npx shadcn@latest add "https://www.shadcn.io/r/shaders/aurora.json"
# Free-Tier: 10 Shader dauerhaft kostenlos; 47 Shader mit shadcn.io Pro.
```

---

## 2. Übersicht der 3 Kategorien (57 Einträge)

1. [Kategorie 1: Free-Shader (10)](#kategorie-1-free-shader) _(10 Komponenten)_
2. [Kategorie 2: Pro — Tunnel, Kosmos & Felder](#kategorie-2-pro--tunnel-kosmos--felder) _(23 Komponenten)_
3. [Kategorie 3: Pro — Muster, Noise & Wellen](#kategorie-3-pro--muster-noise--wellen) _(24 Komponenten)_

---

### Legende zum User-Votum

Identisch zur Legende in [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Alle Einträge initial neutral, Votum wird von Jan nach manueller Prüfung nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** _(reserviert)_
- ⭐⭐ **Bestätigt** _(reserviert)_
- ❌ **Abgelehnt** _(reserviert)_
- ⚪ **Katalog-Bestand** (aktueller Status aller Einträge)
- 💰 **Pro** (nur mit shadcn.io-Pro-Abonnement)

---

## Kategorie 1: Free-Shader

| Komponente               | Offizieller Link (shadcn.io)                                            |     User-Votum     | Casino-Einsatzbereich                              | Technologie         |
| :----------------------- | :---------------------------------------------------------------------- | :----------------: | :------------------------------------------------- | :------------------ |
| **Aurora Shader**        | [`/shaders/aurora`](https://www.shadcn.io/shaders/aurora)               | ⚪ Katalog-Bestand | Polarlicht-Hintergrund (vgl. Aurora Flow in 12)    | WebGL-Aurora-Shader |
| **Plasma Shader**        | [`/shaders/plasma`](https://www.shadcn.io/shaders/plasma)               | ⚪ Katalog-Bestand | Plasmafeld (vgl. Closing Plasma in 12)             | WebGL-Plasma        |
| **Nebula Shader**        | [`/shaders/nebula`](https://www.shadcn.io/shaders/nebula)               | ⚪ Katalog-Bestand | Nebel-Atmosphäre für VIP-Lounge                    | WebGL-Nebel         |
| **Matrix Shader**        | [`/shaders/matrix`](https://www.shadcn.io/shaders/matrix)               | ⚪ Katalog-Bestand | Abgewählt in 12 (Matrix Rain) — Vergleichskandidat | WebGL-Digitalstrom  |
| **Gradient Mesh Shader** | [`/shaders/gradient-mesh`](https://www.shadcn.io/shaders/gradient-mesh) | ⚪ Katalog-Bestand | Weiche Verlaufsflächen (CTA-Hintergrund)           | WebGL-Mesh-Gradient |
| **Noise Shader**         | [`/shaders/noise`](https://www.shadcn.io/shaders/noise)                 | ⚪ Katalog-Bestand | Filmkorn-/Noise-Textur (Grain-Pflicht)             | WebGL-Noise         |
| **Waves Shader**         | [`/shaders/waves`](https://www.shadcn.io/shaders/waves)                 | ⚪ Katalog-Bestand | Wellen-Hintergrund (Tisch-Deko)                    | WebGL-Wellen        |
| **Glitch Shader**        | [`/shaders/glitch`](https://www.shadcn.io/shaders/glitch)               | ⚪ Katalog-Bestand | Stör-Effekt bei Fehltransaktionen                  | WebGL-Glitch        |
| **Hologram Shader**      | [`/shaders/hologram`](https://www.shadcn.io/shaders/hologram)           | ⚪ Katalog-Bestand | Hologramm-Look für High-Roller-Deko                | WebGL-Hologramm     |
| **Ripple Shader**        | [`/shaders/ripple`](https://www.shadcn.io/shaders/ripple)               | ⚪ Katalog-Bestand | Klick-Wellen (vgl. Image Ripple in 12)             | WebGL-Ripple        |

---

## Kategorie 2: Pro — Tunnel, Kosmos & Felder

| Komponente                        | Offizieller Link (shadcn.io)                                                                            | User-Votum | Casino-Einsatzbereich                       | Technologie                 |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------ | :--------: | :------------------------------------------ | :-------------------------- |
| **Accretion Shader**              | [`/shaders/accretion`](https://www.shadcn.io/shaders/accretion)                                         |   💰 Pro   | Akkretionsscheibe (Jackpot-Sog)             | Raymarching-Fraktal         |
| **Advanced Tunnel Shader**        | [`/shaders/advanced-tunnel`](https://www.shadcn.io/shaders/advanced-tunnel)                             |   💰 Pro   | Komplexer Tunnel (Crash-Flug)               | Tunnel-Raymarching          |
| **Cosmic Discs Shader**           | [`/shaders/cosmic-discs`](https://www.shadcn.io/shaders/cosmic-discs)                                   |   💰 Pro   | Kosmische Scheiben                          | Feld-Shader                 |
| **Cosmic Waves Shader**           | [`/shaders/cosmic-waves`](https://www.shadcn.io/shaders/cosmic-waves)                                   |   💰 Pro   | Kosmische Wellen                            | Feld-Shader                 |
| **Digital Tunnel Shader**         | [`/shaders/digital-tunnel`](https://www.shadcn.io/shaders/digital-tunnel)                               |   💰 Pro   | Digitaler Tunnel (Cyber-Crash)              | Tunnel-Shader               |
| **Fire 3D Shader**                | [`/shaders/fire-3d`](https://www.shadcn.io/shaders/fire-3d)                                             |   💰 Pro   | 3D-Feuer (Big-Win-Explosion)                | Volumetrisches Feuer        |
| **Fractals Shader**               | [`/shaders/fractals`](https://www.shadcn.io/shaders/fractals)                                           |   💰 Pro   | Fraktal-Deko                                | Fraktal-Iteration           |
| **Kaleidoscope Shader**           | [`/shaders/kaleidoscope`](https://www.shadcn.io/shaders/kaleidoscope)                                   |   💰 Pro   | Kaleidoskop-Symmetrie                       | Spiegel-Iteration           |
| **Mandelbrot Shader**             | [`/shaders/mandelbrot-pattern-decoration`](https://www.shadcn.io/shaders/mandelbrot-pattern-decoration) |   💰 Pro   | Mandelbrot-Menge (Deko)                     | Escape-Time-Fraktal         |
| **Monster Tunnel Shader**         | [`/shaders/monster-tunnel`](https://www.shadcn.io/shaders/monster-tunnel)                               |   💰 Pro   | Organischer Tunnel                          | Fraktal-Tunnel              |
| **Oldschool Tube Shader**         | [`/shaders/oldschool-tube`](https://www.shadcn.io/shaders/oldschool-tube)                               |   💰 Pro   | Retro-Röhren (vgl. CRT-Warp, React Bits)    | Tube-Raymarching            |
| **Poincaré Disc Shader**          | [`/shaders/poincare-disc-animation`](https://www.shadcn.io/shaders/poincare-disc-animation)             |   💰 Pro   | Hyperbolische Scheibe                       | Poincaré-Geometrie          |
| **Raymarching Shader**            | [`/shaders/raymarching`](https://www.shadcn.io/shaders/raymarching)                                     |   💰 Pro   | Referenz-Raymarching-Szene                  | Raymarching-Grundform       |
| **Ripples In Black Shader**       | [`/shaders/ripples-in-black`](https://www.shadcn.io/shaders/ripples-in-black)                           |   💰 Pro   | Dunkle Ringe (Obsidian-Look)                | Ring-Interferenz            |
| **Sea Shader**                    | [`/shaders/sea`](https://www.shadcn.io/shaders/sea)                                                     |   💰 Pro   | Ozean-Oberfläche (Tischfilz-Wasser)         | Wellen-Raymarching          |
| **Singularity Shader**            | [`/shaders/singularity`](https://www.shadcn.io/shaders/singularity)                                     |   💰 Pro   | Schwarzes-Loch-Linse (vgl. Radiant-Galerie) | Gravitations-Linse          |
| **Sphere Field Shader**           | [`/shaders/sphere-field`](https://www.shadcn.io/shaders/sphere-field)                                   |   💰 Pro   | Kugelfeld                                   | SDF-Feld                    |
| **Starry Planes Shader**          | [`/shaders/starry-planes`](https://www.shadcn.io/shaders/starry-planes)                                 |   💰 Pro   | Sternebenen (Tiefen-Parallaxe)              | Ebenen-Sterneo              |
| **Synthwave Canyon Shader**       | [`/shaders/synthwave-canyon`](https://www.shadcn.io/shaders/synthwave-canyon)                           |   💰 Pro   | Synthwave-Schlucht (Retro-Deko)             | Raymarching-Terrain         |
| **Tunnel Shader**                 | [`/shaders/tunnel`](https://www.shadcn.io/shaders/tunnel)                                               |   💰 Pro   | Basistunnel                                 | Tunnel-Raymarching          |
| **Cellular Tiled Tunnel Shader**  | [`/shaders/cellular-tiled-tunnel`](https://www.shadcn.io/shaders/cellular-tiled-tunnel)                 |   💰 Pro   | Zelliger Tunnel                             | Zell-Tunnel                 |
| **Desert Sand Shader**            | [`/shaders/desert-sand`](https://www.shadcn.io/shaders/desert-sand)                                     |   💰 Pro   | Sanddüne-Deko                               | Terrain-Noise               |
| **Extruded Möbius Spiral Shader** | [`/shaders/extruded-mobius-spiral`](https://www.shadcn.io/shaders/extruded-mobius-spiral)               |   💰 Pro   | Möbius-Spirale                              | Extrudierte Spiralgeometrie |

---

## Kategorie 3: Pro — Muster, Noise & Wellen

| Komponente                       | Offizieller Link (shadcn.io)                                                                | User-Votum | Casino-Einsatzbereich         | Technologie              |
| :------------------------------- | :------------------------------------------------------------------------------------------ | :--------: | :---------------------------- | :----------------------- |
| **2D Noise Contours Shader**     | [`/shaders/2d-noise-contours`](https://www.shadcn.io/shaders/2d-noise-contours)             |   💰 Pro   | Noise-Konturlinien            | Iso-Linien von Noise     |
| **Abstract Mod Shader**          | [`/shaders/abstract-mod`](https://www.shadcn.io/shaders/abstract-mod)                       |   💰 Pro   | Abstrakte Modulo-Muster       | Modulo-Tiling            |
| **Binary Shader**                | [`/shaders/binary`](https://www.shadcn.io/shaders/binary)                                   |   💰 Pro   | Binärziffern-Feld (Seed-Deko) | Zeichen-Matrix           |
| **Biomine Shader**               | [`/shaders/biomine`](https://www.shadcn.io/shaders/biomine)                                 |   💰 Pro   | Organisches Geflecht          | Biomorphes Noise         |
| **Grid Subdivision Shader**      | [`/shaders/random-grid-subdivision`](https://www.shadcn.io/shaders/random-grid-subdivision) |   💰 Pro   | Zufällige Raster-Unterteilung | Rekursive Subdivision    |
| **Hexagon Grid Shader**          | [`/shaders/hexagon-grid-pattern`](https://www.shadcn.io/shaders/hexagon-grid-pattern)       |   💰 Pro   | Hexagon-Raster                | Hex-Tiling               |
| **Minimal Jigsaw Shader**        | [`/shaders/minimal-jigsaw`](https://www.shadcn.io/shaders/minimal-jigsaw)                   |   💰 Pro   | Puzzle-Muster                 | Jigsaw-Tiling            |
| **Möbius Sierpinski Shader**     | [`/shaders/mobius-sierpinski`](https://www.shadcn.io/shaders/mobius-sierpinski)             |   💰 Pro   | Sierpinski-Möbius-Kombi       | Fraktal-Geometrie        |
| **Perspex Lattice Shader**       | [`/shaders/perspex-web-lattice`](https://www.shadcn.io/shaders/perspex-web-lattice)         |   💰 Pro   | Gitter-Netzwerk               | Lattice-Rendering        |
| **Pyramid Pattern Shader**       | [`/shaders/pyramid-pattern`](https://www.shadcn.io/shaders/pyramid-pattern)                 |   💰 Pro   | Pyramiden-Muster              | Geometrisches Tiling     |
| **Sigmoids & Sines Shader**      | [`/shaders/sigmoids-sines`](https://www.shadcn.io/shaders/sigmoids-sines)                   |   💰 Pro   | Sigmoid-Wellen                | Funktions-Wellen         |
| **Simplex Truchet Shader**       | [`/shaders/simplex-truchet-weave`](https://www.shadcn.io/shaders/simplex-truchet-weave)     |   💰 Pro   | Truchet-Geflecht              | Truchet-Tiling + Simplex |
| **Smoke Shader**                 | [`/shaders/smoke`](https://www.shadcn.io/shaders/smoke)                                     |   💰 Pro   | Rauch-Atmosphäre              | Noise-Advektion          |
| **Smooth Noise Contours Shader** | [`/shaders/smooth-noise-contours`](https://www.shadcn.io/shaders/smooth-noise-contours)     |   💰 Pro   | Weiche Konturen               | Geglättete Iso-Linien    |
| **Smooth Voronoi Shader**        | [`/shaders/smooth-voronoi-contours`](https://www.shadcn.io/shaders/smooth-voronoi-contours) |   💰 Pro   | Geglättete Voronoi-Zellen     | Voronoi-Kanten           |
| **Soap Bubbles 2D Shader**       | [`/shaders/soap-bubbles-2d`](https://www.shadcn.io/shaders/soap-bubbles-2d)                 |   💰 Pro   | Seifenblasen-Irisieren        | Dünnschicht-Interferenz  |
| **Sparks Drifting Shader**       | [`/shaders/sparks-drifting`](https://www.shadcn.io/shaders/sparks-drifting)                 |   💰 Pro   | Treibende Funken (Goldstaub)  | Partikel-Drift           |
| **Three-Tap Voronoi Shader**     | [`/shaders/three-tap-voronoi`](https://www.shadcn.io/shaders/three-tap-voronoi)             |   💰 Pro   | Optimierte Voronoi-Zellen     | 3-Tap-Voronoi            |
| **Triangle Mesh Shader**         | [`/shaders/triangle-mesh-incircles`](https://www.shadcn.io/shaders/triangle-mesh-incircles) |   💰 Pro   | Dreiecks-Mesh mit Inkreisen   | Geometrie-Konstruktion   |
| **Truchet Shader**               | [`/shaders/truchet`](https://www.shadcn.io/shaders/truchet)                                 |   💰 Pro   | Basistruchet-Muster           | Truchet-Tiling           |
| **Truchet Kaleidoscope Shader**  | [`/shaders/truchet-kaleidoscope`](https://www.shadcn.io/shaders/truchet-kaleidoscope)       |   💰 Pro   | Truchet + Kaleidoskop         | Tiling + Spiegelung      |
| **Warped Noise Shader**          | [`/shaders/warped-noise`](https://www.shadcn.io/shaders/warped-noise)                       |   💰 Pro   | Verzogenes Noise              | Domain-Warping           |
| **Water Shader**                 | [`/shaders/water`](https://www.shadcn.io/shaders/water)                                     |   💰 Pro   | Wasser-Oberfläche             | Wellen-Normalmapping     |
| **Worley Noise Shader**          | [`/shaders/worley-noise`](https://www.shadcn.io/shaders/worley-noise)                       |   💰 Pro   | Zellulares Noise              | Worley-Distanzfunktion   |

---

## 3. Zusammenfassung

- **Free-Tier:** 10 Shader dauerhaft kostenlos — für einen risikolosen Test der Code-Qualität im Casino-Projekt ausreichend (Aurora, Plasma, Noise, Ripple decken die bewährten 12-Componentry-Motive ab).
- **Pro-Tier:** 47 Shader (Abo). Empfehlung für die manuelle Prüfung: mit den 10 Free-Shadern starten; die Pro-Familien (Tunnel/Raymarching für Crash, Voronoi/Truchet für Texturen) erst nach Votum evaluieren.
- **Vergleichskandidaten zu 12-Componentry:** Aurora ↔ Aurora Flow · Plasma ↔ Closing Plasma · Matrix ↔ Matrix Rain · Glitch ↔ fehlerhafte Übergänge · Ripple ↔ Image Ripple Effect.
