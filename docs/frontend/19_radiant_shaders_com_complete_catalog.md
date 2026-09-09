# Radiant (radiant-shaders.com) — Vollständiger WebGL-Shader-Galerie-Katalog (60 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [radiant-shaders.com](https://radiant-shaders.com/gallery/technique/webgl) (Paul Bakaus — 60 Live-WebGL-Shader, Open Source/MIT)
**Kanonische Projekt-Ablage:** [`docs/frontend/19_radiant_shaders_com_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/19_radiant_shaders_com_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Alle 60 Shader-Namen, Pfade und Technikbeschreibungen 1:1 von der offiziellen Galerie-Seite (Stand 6. September 2026); die Galerie wurde live verifiziert (HTTP 200). Jeder Eintrag ist ein **live laufender Shader** mit Quellcode — primär Inspirations- und Referenz-Pool (Portierung eigener Shader-Umsetzung nötig).
> **Hinweis:** Die Technik-Spalte übernimmt die offizielle Kurzbeschreibung der Galerie (Fachbegriff der Shader-Technik).

---

## 1. Quickstart

Radiant ist eine **Galerie/Referenz**, keine Komponenten-Library: Shader live ansehen → Quellcode studieren → Technik für eigene WebGL-/OGL-Umsetzung im Casino-Projekt nutzen. Einträge mit „Deep Dive" bieten ausführliche Erklärungen.

---

## 2. Übersicht (60 Einträge, 1 Tabelle)

Alle 60 WebGL-Shader der Galerie in alphabetischer Reihenfolge der Galerie-Auflistung:

| Komponente              | Offizieller Link (radiant-shaders.com)                                                  |     User-Votum     | Casino-Einsatzbereich                                                          | Technologie                   |
| :---------------------- | :-------------------------------------------------------------------------------------- | :----------------: | :----------------------------------------------------------------------------- | :---------------------------- |
| **Fluid Amber**         | [`/shader/fluid-amber`](https://radiant-shaders.com/shader/fluid-amber)                 | ⚪ Katalog-Bestand | Organisch fließender Bernstein-Hintergrund (Gold-Nähe)                         | Domain-warped Simplex Noise   |
| **Sugar Glass**         | [`/shader/sugar-glass`](https://radiant-shaders.com/shader/sugar-glass)                 | ⚪ Katalog-Bestand | Zuckerglas-Bruchmuster (Karten-Backdrop)                                       | Voronoi-Fraktur               |
| **Chladni Resonance**   | [`/shader/chladni-resonance`](https://radiant-shaders.com/shader/chladni-resonance)     | ⚪ Katalog-Bestand | Schwingende Sandmuster (Sound-/Win-Deko)                                       | Harmonische Moden             |
| **Strobe Geometry**     | [`/shader/strobe-geometry`](https://radiant-shaders.com/shader/strobe-geometry)         | ⚪ Katalog-Bestand | Neonformen mit Nachglühen (Jackpot-Blitz)                                      | Afterglow-Decay               |
| **Laser Labyrinth**     | [`/shader/laser-labyrinth`](https://radiant-shaders.com/shader/laser-labyrinth)         | ⚪ Katalog-Bestand | Goldlaser-Labyrinth (Provably-Fair-Deko)                                       | Volumetrische Laserstrahlen   |
| **Bass Ripple**         | [`/shader/bass-ripple`](https://radiant-shaders.com/shader/bass-ripple)                 | ⚪ Katalog-Bestand | Beat-synchrone Wellen (Lounge-Audio-Kopplung)                                  | Schwingendes Mesh             |
| **Ink Dissolve**        | [`/shader/ink-dissolve`](https://radiant-shaders.com/shader/ink-dissolve)               | ⚪ Katalog-Bestand | Tinten-Auflösung (Rundenübergang)                                              | Reaction-Diffusion            |
| **Sequin Wave**         | [`/shader/sequin-wave`](https://radiant-shaders.com/shader/sequin-wave)                 | ⚪ Katalog-Bestand | Pailletten-Wellen (Glamour-Backdrop)                                           | Metallische Lichtsweep        |
| **Gilt Mosaic**         | [`/shader/gilt-mosaic`](https://radiant-shaders.com/shader/gilt-mosaic)                 | ⚪ Katalog-Bestand | **Goldmosaik** — direkter Obsidian-&-Gold-Kandidat                             | Byzantinisches Schimmermosaik |
| **Gilded Fracture**     | [`/shader/gilded-fracture`](https://radiant-shaders.com/shader/gilded-fracture)         | ⚪ Katalog-Bestand | **Kintsugi-Goldriss auf Schwarz** — Signatur-Shader-Kandidat                   | Goldene Riss-Linien           |
| **Radiant Geometry**    | [`/shader/radiant-geometry`](https://radiant-shaders.com/shader/radiant-geometry)       | ⚪ Katalog-Bestand | Goldene Stern-Ornamente (Wappen-Deko)                                          | Islamische Geometrie          |
| **Golden Throne**       | [`/shader/golden-throne`](https://radiant-shaders.com/shader/golden-throne)             | ⚪ Katalog-Bestand | Mandala mit Goldem-Schnitt-Spiralen (VIP-Emblem)                               | Sacred-Geometry-Mandala       |
| **Sacred Strange**      | [`/shader/sacred-strange`](https://radiant-shaders.com/shader/sacred-strange)           | ⚪ Katalog-Bestand | Fraktale Goldgeometrie (Vault-Hintergrund)                                     | Dimensionale Fraktale         |
| **Tropical Heat**       | [`/shader/tropical-heat`](https://radiant-shaders.com/shader/tropical-heat)             | ⚪ Katalog-Bestand | Hitzeflimmern (Sommer-Event-Deko)                                              | Chromatic Aberration          |
| **Neon Drip**           | [`/shader/neon-drip`](https://radiant-shaders.com/shader/neon-drip)                     | ⚪ Katalog-Bestand | Tropfende Metaballs (Deko)                                                     | Metaball-Blobs                |
| **Voltage Arc**         | [`/shader/voltage-arc`](https://radiant-shaders.com/shader/voltage-arc)                 | ⚪ Katalog-Bestand | Plasmabögen (Big-Win-Blitz)                                                    | Plasmabogen-Simulation        |
| **Moonlit Ripple**      | [`/shader/moonlit-ripple`](https://radiant-shaders.com/shader/moonlit-ripple)           | ⚪ Katalog-Bestand | Mondspiegelung auf Wasser (Lounge)                                             | Fresnel-Reflexion             |
| **Eclipse Glow**        | [`/shader/eclipse-glow`](https://radiant-shaders.com/shader/eclipse-glow)               | ⚪ Katalog-Bestand | Korona-Effekt (Jackpot-Reveal)                                                 | Diamond-Ring-Korona           |
| **Diamond Caustics**    | [`/shader/diamond-caustics`](https://radiant-shaders.com/shader/diamond-caustics)       | ⚪ Katalog-Bestand | **Diamant-Kaustik** — High-Roller-Deko (vgl. Prism Gradient in 12)             | Rotierende Kaustik            |
| **Rain on Glass**       | [`/shader/rain-on-glass`](https://radiant-shaders.com/shader/rain-on-glass)             | ⚪ Katalog-Bestand | Regentropfen mit Stadtlicht (Atmosphäre) · **Deep Dive verfügbar**             | Refraktionstropfen            |
| **Rain on Umbrella**    | [`/shader/rain-umbrella`](https://radiant-shaders.com/shader/rain-umbrella)             | ⚪ Katalog-Bestand | Tropfen auf transluzenter Fläche                                               | Refraktive Tropfen            |
| **Metamorphosis**       | [`/shader/metamorphosis`](https://radiant-shaders.com/shader/metamorphosis)             | ⚪ Katalog-Bestand | Verschmelzende Blobs (Morph-Übergänge)                                         | Raymarched Metaballs          |
| **Artpop Iridescence**  | [`/shader/artpop-iridescence`](https://radiant-shaders.com/shader/artpop-iridescence)   | ⚪ Katalog-Bestand | Holographische Membran (Iridescence-Vergleich)                                 | Dünnschicht-Interferenz       |
| **Silk Groove**         | [`/shader/silk-groove`](https://radiant-shaders.com/shader/silk-groove)                 | ⚪ Katalog-Bestand | Fließende Seidenbänder (vgl. Silk Aurora in 12)                                | Specular-Seidenbänder         |
| **Gilt Thread**         | [`/shader/gilt-thread`](https://radiant-shaders.com/shader/gilt-thread)                 | ⚪ Katalog-Bestand | **Goldfäden auf Kurven** — Obsidian-&-Gold-Kandidat                            | Parametrische Goldfäden       |
| **Event Horizon**       | [`/shader/event-horizon`](https://radiant-shaders.com/shader/event-horizon)             | ⚪ Katalog-Bestand | Schwarzes Loch mit Linse (Crash-Deko) · **Deep Dive verfügbar**                | Gravitationslinse             |
| **Burning Film**        | [`/shader/burning-film`](https://radiant-shaders.com/shader/burning-film)               | ⚪ Katalog-Bestand | Abbrennender Film (Rundungsende-Deko)                                          | Glut-Feld                     |
| **Vertigo**             | [`/shader/vertigo`](https://radiant-shaders.com/shader/vertigo)                         | ⚪ Katalog-Bestand | Hypnotischer Tunnel (Crash-Flug)                                               | Ringsegment-Tunnel            |
| **Stardust Veil**       | [`/shader/stardust-veil`](https://radiant-shaders.com/shader/stardust-veil)             | ⚪ Katalog-Bestand | Sternenstaub mit Aurora-Bändern (Big-Win-Goldstaub)                            | Kosmischer Stardust           |
| **Silk Cascade**        | [`/shader/silk-cascade`](https://radiant-shaders.com/shader/silk-cascade)               | ⚪ Katalog-Bestand | Gefallene Seide (VIP-Lounge)                                                   | Anisotrope Glanzlichter       |
| **Smolder**             | [`/shader/smolder`](https://radiant-shaders.com/shader/smolder)                         | ⚪ Katalog-Bestand | Radiale Glut (Loss-Deko)                                                       | Hitze-Flimmern + Glut         |
| **Signal Decay**        | [`/shader/signal-decay`](https://radiant-shaders.com/shader/signal-decay)               | ⚪ Katalog-Bestand | Verfallende Wellenform (Crash-Kurve-Deko)                                      | Noise-Degradation             |
| **Neon Revival**        | [`/shader/neon-revival`](https://radiant-shaders.com/shader/neon-revival)               | ⚪ Katalog-Bestand | Flackerndes Neonschild (Casino-Fassade-Deko)                                   | Neon-Buzz + Tropfen           |
| **Lipstick Smear**      | [`/shader/lipstick-smear`](https://radiant-shaders.com/shader/lipstick-smear)           | ⚪ Katalog-Bestand | Viskose Flüssigkeit (Rubin-Rot-Palette)                                        | Fluid-Simulation              |
| **Magma Core**          | [`/shader/magma-core`](https://radiant-shaders.com/shader/magma-core)                   | ⚪ Katalog-Bestand | Magma-Ausbruch (Big-Win-Explosion)                                             | Lava-Partikelphysik           |
| **Edge of Chaos**       | [`/shader/edge-of-chaos`](https://radiant-shaders.com/shader/edge-of-chaos)             | ⚪ Katalog-Bestand | Reaction-Diffusion-Labyrinth mit Goldglow                                      | Chaos-Rand-Muster             |
| **Shifting Veils**      | [`/shader/shifting-veils`](https://radiant-shaders.com/shader/shifting-veils)           | ⚪ Katalog-Bestand | Transluzente Vorhänge (Modal-Backdrop)                                         | Morphende Noise-Vorhänge      |
| **Crystal Lattice**     | [`/shader/crystal-lattice`](https://radiant-shaders.com/shader/crystal-lattice)         | ⚪ Katalog-Bestand | Kristallwachstum (Diamond-Deko)                                                | Facettiertes Licht            |
| **Kaleidoscope Runway** | [`/shader/kaleidoscope-runway`](https://radiant-shaders.com/shader/kaleidoscope-runway) | ⚪ Katalog-Bestand | Gespiegelte Tessellation (Spielauswahl-Deko)                                   | Mirrored Tessellation         |
| **Neon Drive**          | [`/shader/neon-drive`](https://radiant-shaders.com/shader/neon-drive)                   | ⚪ Katalog-Bestand | Neonstraße im Regen (Retro-Crash-Deko)                                         | Regenreflexion                |
| **Liquid Gold**         | [`/shader/liquid-gold`](https://radiant-shaders.com/shader/liquid-gold)                 | ⚪ Katalog-Bestand | **Geschmolzenes Gold mit PBR** — direkter Liquid-Chrome-Vergleich (12-Favorit) | PBR-Metallfluss               |
| **Aurora Veil**         | [`/shader/aurora-veil`](https://radiant-shaders.com/shader/aurora-veil)                 | ⚪ Katalog-Bestand | Polarlicht über Eis (vgl. Aurora Flow in 12)                                   | Eis-Kristall-Aurora           |
| **Bioluminescence**     | [`/shader/bioluminescence`](https://radiant-shaders.com/shader/bioluminescence)         | ⚪ Katalog-Bestand | Tiefsee-Leuchten (Deko)                                                        | Quallen-Plankton              |
| **Gothic Filigree**     | [`/shader/gothic-filigree`](https://radiant-shaders.com/shader/gothic-filigree)         | ⚪ Katalog-Bestand | Gotisches Fraktal-Ornament (Wappen-Deko)                                       | Fraktal-Spitzen               |
| **Thunder Sermon**      | [`/shader/thunder-sermon`](https://radiant-shaders.com/shader/thunder-sermon)           | ⚪ Katalog-Bestand | Fraktal-Blitze (Big-Win)                                                       | Schockwellen-Blitze           |
| **Vinyl Grooves**       | [`/shader/vinyl-grooves`](https://radiant-shaders.com/shader/vinyl-grooves)             | ⚪ Katalog-Bestand | Abgewählt in 12 (Music Player) — Vergleichskandidat                            | Platten-Rillen                |
| **Torn Paper**          | [`/shader/torn-paper`](https://radiant-shaders.com/shader/torn-paper)                   | ⚪ Katalog-Bestand | Aufreißendes Papier (Bonus-Enthüllung)                                         | Volumetrisches Licht          |
| **Polaroid Burn**       | [`/shader/polaroid-burn`](https://radiant-shaders.com/shader/polaroid-burn)             | ⚪ Katalog-Bestand | Überbelichtetes Foto (Gewinn-Screenshot-Deko)                                  | Entwicklungs-Brenneffekt      |
| **Scream Wave**         | [`/shader/scream-wave`](https://radiant-shaders.com/shader/scream-wave)                 | ⚪ Katalog-Bestand | Verzerrte Wellenform (Audio-Deko)                                              | Sine-zu-Distortion            |
| **Moiré Interference**  | [`/shader/moire-interference`](https://radiant-shaders.com/shader/moire-interference)   | ⚪ Katalog-Bestand | Moiré-Ringe (Deko-Muster)                                                      | Konzentrische Interferenz     |
| **Magnetic Field**      | [`/shader/magnetic-field`](https://radiant-shaders.com/shader/magnetic-field)           | ⚪ Katalog-Bestand | Dipolfeld-Linien (vgl. Magnet Lines in 12)                                     | Dipolfeld-Visualisierung      |
| **Aurora Curtain**      | [`/shader/aurora-curtain`](https://radiant-shaders.com/shader/aurora-curtain)           | ⚪ Katalog-Bestand | Schwankende Lichtvorhänge (Lobby)                                              | Luminöse Fäden                |
| **Vortex**              | [`/shader/vortex`](https://radiant-shaders.com/shader/vortex)                           | ⚪ Katalog-Bestand | Logarithmische Spiralarme (Jackpot-Sog)                                        | Spiral-Glow                   |
| **Chromatic Bloom**     | [`/shader/chromatic-bloom`](https://radiant-shaders.com/shader/chromatic-bloom)         | ⚪ Katalog-Bestand | Leuchtende Farb-Orbs (Deko)                                                    | Glow-Orbs                     |
| **Lens Whisper**        | [`/shader/lens-whisper`](https://radiant-shaders.com/shader/lens-whisper)               | ⚪ Katalog-Bestand | Anamorphe Lens-Flares (Cinematic-Look)                                         | Flares + Bokeh + Grain        |
| **Hologram Glitch**     | [`/shader/hologram-glitch`](https://radiant-shaders.com/shader/hologram-glitch)         | ⚪ Katalog-Bestand | Hologramm mit Scanlines (Cyber-Crash-Deko)                                     | Scanline + Glitch             |
| **Shattered Plains**    | [`/shader/shattered-plains`](https://radiant-shaders.com/shader/shattered-plains)       | ⚪ Katalog-Bestand | Sturmzerrissene Plateaus (Terra-Deko)                                          | Terrain-Chasms                |
| **Painted Strata**      | [`/shader/painted-strata`](https://radiant-shaders.com/shader/painted-strata)           | ⚪ Katalog-Bestand | Washi-Papier-Schichten (Textur-Pflicht)                                        | Tektonisches Falten           |
| **Feedback Loop**       | [`/shader/feedback-loop`](https://radiant-shaders.com/shader/feedback-loop)             | ⚪ Katalog-Bestand | Rekursiver Video-Feedback-Tunnel (Easter-Egg)                                  | Rekursive Rückkopplung        |
| **Dither Gradient**     | [`/shader/dither-gradient`](https://radiant-shaders.com/shader/dither-gradient)         | ⚪ Katalog-Bestand | Abgewählt in 12 (Dither Gradient) — Vergleichskandidat                         | Ordered Dithering             |

---

## 3. Zusammenfassung

- **Obsidian-&-Gold-Kurzliste für die manuelle Prüfung:** Liquid Gold, Gilt Mosaic, Gilded Fracture, Gilt Thread, Diamond Caustics, Golden Throne, Laser Labyrinth, Stardust Veil — diese acht decken das Gold/Luxus-Motiv der Componentry-Favoriten ab.
- **Vergleichskandidaten zu 12-Componentry:** Liquid Gold ↔ Liquid Chrome · Silk Groove/Cascade ↔ Silk Aurora · Magnetic Field ↔ Magnet Lines · Dither Gradient ↔ Dither Gradient (identischer Name) · Vinyl Grooves ↔ Music Player (beide abgewählt).
- **Deep Dives:** nur „Rain on Glass" und „Event Horizon" bieten ausführliche Write-ups — guter Einstieg in die Shader-Technik.
