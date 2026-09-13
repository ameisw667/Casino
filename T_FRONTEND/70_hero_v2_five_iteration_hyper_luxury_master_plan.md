# 70_HERO_V2_FIVE_ITERATION_HYPER_LUXURY_MASTER_PLAN.md

**Status:** Planungsphase / Genehmigt (Workflow-Jan 1% Masterplan)  
**Route:** `/testing/hero-v2`  
**Ziel:** Transformation von Standard-Dashboard-Kacheln mit Lucide-Icon-Spam zu einer weltklasse, hoch-exklusiven 3D-Bühne (Salon Privé Monaco / Mayfair Club Ästhetik) mit GSAP ScrollTrigger, Componentry-Inspiration und 5 iterativen Optimierungsschleifen.

---

## 1. Ausgangsbasis (Status Quo Bewertung)

Gesamtscore: **4.09 / 10** (Top-90% = deutlich unter Exzellenz-Anspruch)

| # | Subkategorie | Baseline | Kern-Bottleneck |
|---|---|:---:|---|
| 1 | **Iconography & Visual Language** | 3.0 | Generischer Lucide-Icon-Spam (Schild, Stern, Blitz, Geschenk, Krone) erzeugt Billig-Casino-Flair. |
| 2 | **Typography & Hierarchy** | 4.2 | Unbalancierte Skalierung; H1 konkurriert mit grellen Pill-Badges; Standard-Grotesk ohne Haute-Horlogerie-Flair. |
| 3 | **Depth, Lighting & Materiality** | 3.8 | Flache Boxen ohne echte Materialität; kein Brushed Obsidian, kein Goldblatt-Foil, keine Lichtbrechung. |
| 4 | **Spatial Layout & Composition** | 4.0 | Starre Dreiteilung in 3 isolierte Kisten nebeneinander („3-Box Prison“) ohne architektonischen Fluss. |
| 5 | **Motion & Cinematic Impact** | 3.5 | Kein GSAP; keine ScrollTrigger-Verzahnung; einfache Framer-Motion-Fades ohne räumliche Dramaturgie. |
| 6 | **Exclusivity & Brand Perception** | 3.5 | Gelbe CTAs und Rabattcode-Optik („Gutschein einlösen“) statt ultra-diskreter Salon-Privé-Atmosphäre. |
| 7 | **Component Autonomy & Integration** | 4.5 | TextRepel, BonusSplit und OrbitStack wirken wie drei unverbundene Widgets. |
| 8 | **Micro-Interactions & Feedback** | 4.2 | Reine Schwebestatus ohne magnetische Cursor-Führung oder physikalisches Trägheitsgefühl. |
| 9 | **Information Density & Scannability** | 4.0 | Badge-Chaos lenkt vom eigentlichen Wert (Provably Fair, Rakeback, Limits) ab. |
| 10| **Technical Foundation & Extensibility**| 5.5 | Next.js/React 19 sauber, aber ohne GSAP-Lifecycle-Management und GPU-optimierte Shader. |

---

## 2. Die 10 Subkategorien mit Top-5-Aufgabenkatalog (50 Aufgaben)

### Subkategorie 1: Iconography & Visual Language (Haute Horlogerie Standard)
1. **Lucide-Purge:** Vollständiges Entfernen aller generischen bunten Icons (Shield, Star, Zap, Gift, Sparkles, ExternalLink).
2. **Geometrische Mikro-Indikatoren:** Einführung feiner schweizer Mikro-Pips (`◇`, `◆`, `|`, `·`) aus reinem Vektor-/CSS-Code.
3. **Monogram Crest System:** Gestaltung eines exklusiven „Salon Privé Monogramms“ als dezente Vektor-Gravur statt Standard-Kronen-Icon.
4. **Typografische Status-Labels:** Ersetzen von Icon-Badges durch letterspaced Micro-Caps (`01 // VERIFIED ALGORITHM`, `AUTHENTICATED PROTOCOL`).
5. **Hairline Border Accents:** Dezente gravierte Kantenabschlüsse (0.5px Golddraht-Optik) anstelle von dicken Icon-Rahmen.

### Subkategorie 2: Typography & Hierarchy (Monaco Luxury Standard)
1. **High-Contrast Display Skalierung:** Dominante, majestätische Headline-Typografie mit maßgeschneiderten Tracking-Stufen.
2. **Editorial Sub-Heads:** Präzise gesetzte Serif-/Geometric-Headlines, die an Luxusmagazine (Robb Report / Haute Time) erinnern.
3. **Monospace Tabular Figure Alignment:** Alle Zahlenwerte (Wettlimits, Rakeback-Prozente, Multiplikatoren) strikt in Tabular-Figures für perfekte Ausrichtung.
4. **Gold-Foil Typo-Gradient:** Subtiler, echter Metall-Gradient über Textzeichen statt uniformem Gelb (`#D4AF37` zu `#F5E7A1` zu `#AA771C`).
5. **Visuelle Ruhe & Weißraum:** Dramatische Reduktion visueller Textunruhe durch Verdoppelung der vertikalen Atemräume.

### Subkategorie 3: Depth, Lighting & Materiality (Brushed Obsidian & Gold Foil)
1. **Multi-Layered Radial Vignette:** Tiefschwarzer Obsidian-Hintergrund mit volumetrischem goldenem Umgebungslicht (Rim Lighting).
2. **Holographic Foil Card Surface:** Physikalischer Schimmer auf den VIP-Pässen, der den Einfallswinkel des Betrachters reflektiert.
3. **Frosted Obsidian Glassmorphism:** Schweres Kristallglas (`backdrop-blur: 24px`, Kantenlicht mit 1px goldenem Gradient).
4. **Embossed Card Texture:** Mikroskopische Rillen- und Bürststrukturen auf den VIP-Pässen (Brushed Metal Shader).
5. **Dynamic Light Sweep:** Ein kontinuierlicher, subtiler Lichtstrahl (Prismen-Effekt), der über die Kanten der Hauptelemente gleitet.

### Subkategorie 4: Spatial Layout & Composition (Architektonisches Amphitheater)
1. **Sprengung des 3-Kasten-Rasters:** Auflösung der starren 3 Boxen in eine dreidimensional gestaffelte, fließende Luxus-Bühne.
2. **Z-Layering & Asymmetrie:** Der VIP-Kartenfächer ragt organisch über die Grenzen des Tresors hinaus; die Headline verankert das Ensemble.
3. **Podium / Pedestal Foundation:** Eine perspektivische Grundfläche (schwebendes Kristallpodest), auf der die Elemente ruhen.
4. **Cinematic Hero Framing:** Subtile goldene Koordinaten und Vermessungs-Marken (`LAT 43.7384° N, LON 7.4246° E // MONACO`), die Exklusivität verankern.
5. **Adaptive Breitwand-Gestaltung:** Nahtlose Skalierung von 1440px bis 4K ohne Leerräume oder zentriertes Kasten-Gefühl.

### Subkategorie 5: Motion & Cinematic Impact (GSAP ScrollTrigger Choreography)
1. **GSAP + ScrollTrigger Setup:** Einbindung von GSAP Timeline und ScrollTrigger zur scroll-gesteuerten Szenen-Choreografie.
2. **Orchestrierter Staggered Reveal:** Kinetischer Aufbau: 1. Goldener Lichtstrahl -> 2. Headline entfaltet sich -> 3. VIP-Pässe fächern auf -> 4. Tresor verriegelt sich.
3. **Scroll-Driven Parallax Depth:** Unterschiedliche Bewegungsebenen beim Scrollen (Hintergrund 0.2x, Podest 0.5x, Pässe 1.0x, Typo 0.8x).
4. **3D Mouse-Tilt Physics:** Weiche Trägheits-Verkippung der gesamten Bühne basierend auf dem Maus-Vektor mit GSAP `quickTo`.
5. **GPU-beschleunigte Transform-Pipelines:** Ausschließliche Verwendung von `transform3d` und `will-change` für kompromisslose 60 FPS.

### Subkategorie 6: Exclusivity & Brand Perception (Salon Privé Mayfair)
1. **Eliminierung von Billig-CTA-Design:** Weg mit dem gelben "Gutschein aktivieren"-Button; hin zu einer diskreten, schweren Messing-Plakette.
2. **Champagner- und Antikgold-Palette:** Ersetzung des grellen Neongelbs durch gediegenes Champagner-Gold (`#E2C974`), Bronze und Platin.
3. **Vault Mechanism Visuals:** Der Bonus-Tresor wirkt wie ein echter Schweizer Banktresor mit mechanischem Verriegelungs-Code.
4. **Haute Horlogerie Tiers:** Pässe benannt nach historischer Handwerkskunst (*Sovereign Gold*, *Centurion Platinum*, *Obsidian Imperial*).
5. **Mitgliedschafts-Metriken:** Ausweisung echter High-Roller-Kennzahlen (Diskreter Telegram Concierge, Dedizierte Liquiditätspools).

### Subkategorie 7: Component Autonomy & Integration (Symbiotisches System)
1. **Interaktions-Kopplung:** Auswahl eines VIP-Passes im Orbit aktualisiert in Echtzeit die Konditionen im Bonus-Tresor.
2. **Fließender Energie-Austausch:** Partikel aus der Headline wandern subtil zur fokussierten VIP-Karte herüber.
3. **Einheitliche Typo-DNA:** Alle 3 Komponenten nutzen identische mathematische Proportions- und Rhythmus-Regeln.
4. **Gemeinsamer Licht-Fokus:** Ein virtueller Lichtscheinpunkt beleuchtet Headline, Tresor und Karten synchron.
5. **Nahtlose Zustands-Synchronisation:** Zentralisierter UI-State ohne Flackern oder Inkonsistenzen.

### Subkategorie 8: Micro-Interactions & Feedback (Haptik & Physik)
1. **Magnetische Cursor-Anziehung:** Interaktive Elemente (Aktivierungs-Button, Pässe) ziehen den Cursor bei Annäherung elastisch an.
2. **Audio-Feedback-Design:** Maßgeschneiderte, ultra-subtile Audiosignale (metallisches Einrasten beim Kartenwechsel, schwerer Tresorklick).
3. **Dynamic Foil Glare Angle:** Reflektierter Schimmer auf Karten reagiert winkelgenau auf die Cursor-Distanz.
4. **Elastic Spring Fächerung:** Das Auseinandergleiten der Tresor-Sektionen erfolgt mit realistischer Massen-Trägheit.
5. **Haptisches Copy-Feedback:** Beim Kopieren des VIP-Codes wechselt die Beschriftung mit mechanischem Flip-Effekt.

### Subkategorie 9: Information Density & Scannability (Kuratierte Eleganz)
1. **Zero-Noise-Prinzip:** Entfernung redundanter Textblöcke und Selbstbeweihräucherung („Beste Seite 2026“).
2. **3-Sekunden-Wertversprechen:** Betrachter erfasst sofort: Exklusiver Eintritt, Reale Werte, Mathematische Fairness.
3. **Hierarchische Zahlenkontraste:** Große, schlanke Zahlen (`15%`, `$50,000`, `0.00%`) mit winzigen, präzisen Labels darunter.
4. **Elegante Fußnoten:** Technische Details (Provably Fair Seed Hash) als diskrete Gravurzeile am Fuß der Bühne.
5. **Kuratierte Status-Pille:** Eine einzige, perfekte Statusanzeige (`● SALON PRIVÉ STATUS: ACTIVE`).

### Subkategorie 10: Technical Foundation & Extensibility (1% Code Architecture)
1. **GSAP + React 19 Hydration Safety:** Sauberes `gsap.context()` bzw. `useGSAP()` Lifecycle-Management ohne SSR-Memory-Leaks.
2. **Modularer Komponenten-Split:** Isolierte, hochgradig typisierte Module (`StageAmphitheater`, `LuxuryPassStack`, `VaultMechanism`).
3. **Dynamic Code-Splitting:** Lazy-Loading schwerer 3D- und Shader-Effekte für blitzschnelle First-Contentful-Paint.
4. **Accessibility & Reduced Motion:** Respektierung von `prefers-reduced-motion` mit eleganter statischer Fallback-Komposition.
5. **100% Test- & Build-Garantie:** Vollständiges Bestehen von `npm run typecheck`, `npm test`, `npm run lint` und `npm run build` nach jedem Zyklus.

---

## 3. Der 5-Stufige Iterationsplan

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  DIE 5 ITERATIONS-STUFEN (Von 4.09 Baseline zu 9.85 Weltklasse)                                       │
├──────────────────┬──────────────────────────────────────────┬────────────────────────┬─────────────────┤
│  ITERATION       │  FOKUS-THEMEN                            │  ZIEL-SCORE            │  VERIFIKATION   │
├──────────────────┼──────────────────────────────────────────┼────────────────────────┼─────────────────┤
│  Iteration 1     │  Icon-Purge & Swiss Typography Overhaul  │  6.20 / 10 (+2.11)     │  Screenshot 70-1│
│  Iteration 2     │  Spatial Monolith & Stage Amphitheater   │  7.45 / 10 (+1.25)     │  Screenshot 70-2│
│  Iteration 3     │  GSAP ScrollTrigger & Kinematics         │  8.40 / 10 (+0.95)     │  Screenshot 70-3│
│  Iteration 4     │  Metallic Foils & Material Shaders       │  9.25 / 10 (+0.85)     │  Screenshot 70-4│
│  Iteration 5     │  Hyper-Luxury Polish & Audio Finishing   │  9.85 / 10 (+0.60)     │  Screenshot 70-5│
└──────────────────┴──────────────────────────────────────────┴────────────────────────┴─────────────────┘
```
