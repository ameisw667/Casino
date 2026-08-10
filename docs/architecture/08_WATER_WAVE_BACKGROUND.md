# 08 — World Map: 3D-Wasser-Wellen-Hintergrund (Cyber-Stealth)

> **Erstellt:** 2026-08-09 · **Status:** `Executed (archiviert)` — Mockup gebaut (`docs/prototypes/water_background_v1.html`), strukturell selbst geprüft (Abschnitt 5 + 7). Kein offener Code-Task mehr; einzig ausstehend ist Jans **visuelle** Freigabe (No-Visual-Check-Regel), danach optional Produktions-Integration (Abschnitt 4.7, eigenes Ticket). Diese Datei ist Dokumentation eines abgeschlossenen Recherche-/Bau-/Audit-Vorgangs, kein offener Plan — deshalb nach `docs/architecture/` archiviert. · **Scope:** Nur der **Hintergrund** der Cyber-Stealth v2 (`docs/prototypes/option1_1_cyber_stealth_v2.html`). · **Ziel:** Der Hintergrund wirkt wie eine tiefe **3D-Wasseroberfläche**; Maus-Bewahrung (Hover) **erzeugt Wellen**, die sich ausbreiten, interferieren und reflektieren — kein Spotlight/Taschenlampe. Inhalt (Glas-Panels, Text) bleibt **scharf** darüber; Wasser liegt **hinter** dem Frosted-Obsidian-Glas (`backdrop-filter: blur` macht das Wasser sichtbar, aber weich). · **Bezug:** `worldmap/02_FRONTEND_REDESIGN.md` Abschnitt 9 verweist hierher.

---

## 1 — Anforderung (verbindlich, aus Jans Feedback)

| #   | Anforderung                                               | Messkriterium (objektiv)                                                                  |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A1  | Hintergrund = 3D-Wasser (Tiefe, nicht flaches Muster)     | Heightmap-basiertes Bump-Lighting + Refraktion                                            |
| A2  | Maus-Bewegung erzeugt **Wellen**, die sich **ausbreiten** | Höhenfeld wird per Maus angeregt, propagiert über Zeit                                    |
| A3  | Wellen **interferieren** + **reflektieren** (an Rändern)  | Wellengleichung, keine lokale-only Verzerrung                                             |
| A4  | **Kein** Spotlight/Taschenlampe-Effekt                    | keine statische Radial-Gradient am Cursor                                                 |
| A5  | Inhalt bleibt scharf (keine Verzerrung von Text/Panels)   | Wasser-Canvas liegt `z-index:0` hinter Glas `z-index:1`; Content unberührt                |
| A6  | Professional/dunkel (Cyber-Stealth, kein Arcade)          | Palette: Charcoal/Slate-Wasser + Platinum-Specular; kein Neon/bunt                        |
| A7  | Performant (Desktop + Mobile)                             | Internes Grid gedeckelt (≤256px), `prefers-reduced-motion`-Fallback, Pause bei Tab-Hidden |
| A8  | Self-contained Mockup (single HTML, kein Build)           | läuft direkt im Browser, nur Google-Fonts extern                                          |

---

## 2 — Recherche: Wie machen das andere im Netz

| Technik                                 | Kern                                                                                                  | Realismus                                    | Aufwand                                 | Referenz                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WebGL GPGPU Heightmap**               | Wellengleichung auf GPU (Ping-Pong Float-Textures), Vertex-Displacement + Normalen + Phong/Refraktion | Sehr hoch (echtes 3D, Refraktion, Specular)  | Hoch (WebGL-Boilerplate, Float-Targets) | [three.js `webgl_gpgpu_water`](https://github.com/mrdoob/three.js/blob/master/examples/webgl_gpgpu_water.html), [DCtheTall/webgl-ripple](https://github.com/DCtheTall/webgl-ripple), [cortiz2894/mouse-effects](https://github.com/cortiz2894/mouse-effects)                                                                                                                                                        |
| **WebGL UV-Distortion Post-Processing** | Versteckter Displacement-Canvas → Fragment-Shader verschiebt UVs (`vUv + (disp.rg-0.5)*k`)            | Hoch (Chromatic Aberration, Specular)        | Mittel                                  | [JS Monkey R3F Tutorial](https://jsmonkey.net/building-that-liquid-ripple-shader-in-react-three-fiber/)                                                                                                                                                                                                                                                                                                             |
| **Canvas 2D Hugo-Elias-Heightmap**      | 2 Puffer, 4-Nachbar-Smoothing + Dämpfung, Render per Heightmap-Gradient (Bump-Light + Refraktion)     | Hoch (echte Wellenausbreitung, 3D-Bump-Look) | Niedrig (rein JS, kein WebGL)           | [Hugo Elias (archiviert)](https://web.archive.org/web/20160325174539/http:/freespace.virgin.net/hugo.elias/graphics/x_water.htm), [Canena](https://www.canena.de/posts/2019-06-08-tales-from-the-code-crypt-book1-water/), [Almer Thie](https://code.almeros.com/code-examples/water-effect-canvas/), [PixelEuphoria](https://pixeleuphoria.com/blog/index.php/2021/01/19/playing-around-with-a-2d-wave-algorithm/) |

**Erkenntnis:** Echte, sich ausbreitende Wellen brauchen ein **Höhenfeld (Heightmap) mit Zustand** — keine rein lokale Shader-Verzerrung am Cursor (das ergibt genau das von Jan abgelehnte Spotlight-Gefühl). Die Wellengleichung (Laplace-Operator + Verlet/Eigen-Dämpfung) ist der Standard. Canvas 2D liefert das ohne WebGL-Abhängigkeit und mit browserbreiter Kompatibilität; WebGL GPGPU ist der Realismus-/Performance-Pfad für die Produktion.

---

## 3 — Entscheidungsfindung

### Mockup (Execution hier, self-contained HTML)

**Canvas 2D Hugo-Elias-Heightmap** — weil:

- Single-HTML, kein Build/WebGL-Boilerplate, robust in jedem Browser.
- Echte Wellenausbreitung/Interferenz/Reflexion (erfüllt A2/A3).
- Heightmap-Gradient-Shading = 3D-Bump-Look mit Platinum-Specular (A1/A6).
- Performant über niedriges internes Grid + Upscale (A7).
- Keine lokale-only Verzerrung → kein Spotlight (A4).

### Produktion (Next.js-Integration, später)

**WebGL GPGPU Heightmap** (Progressive Enhancement) — weil:

- GPU-beschleunigt, höhere Auflösung, echte Refraktion + Phong-Licht.
- Passt zu React-Stack (React Three Fiber / Raw-WebGL-Component).
- **Fallback:** Canvas-2D-Heightmap für Geräte ohne WebGL2/low-power (Feature-Detect).
- **Voll-Fallback:** statische Wasser-Gradient bei `prefers-reduced-motion` / extrem low-end.

> **Mockup ist die Referenz** für die Produktion. Die Produktions-Integration ist **out-of-scope** für diese Aufgabe (nur Hintergrund-Skizze + Plan).

---

## 4 — Weltklasse-Implementationsplan (Mockup)

### 4.1 Architektur / Layering

```
z-index 0: <canvas id="water">          (3D-Wasser, fullscreen, fixed)
z-index 1: .wrap > .glass panels          (Frosted Obsidian, backdrop-blur)
           └ Content (Text/Tables) scharf
```

- Wasser-Canvas **nur** Hintergrund. `backdrop-filter: blur(18px)` der Glas-Panels weicht das Wasser dahinter weich → Tiefe.
- Kein `mix-blend-mode` auf Content. Content unberührt.

### 4.2 Höhenfeld-Simulation (Hugo Elias)

- **Grid:** intern `GW × GH`, gedeckelt: `GW = min(256, floor(screenW / 4))`, `GH = floor(GW * screenH/screenW)`. Mobile: `GW ≤ 160`.
- **Puffer:** `Float32Array` `curr`, `prev` (Größe `GW*GH`).
- **Schritt (pro Frame):**
  ```
  for i in [1..GW-2] × [1..GH-2]:
    n = (curr[i-1] + curr[i+1] + curr[i-GW] + curr[i+GW]) * 0.5 - prev[i]
    n *= damping          // damping ~ 0.985–0.992
    prev[i] = n
  swap(curr, prev)       // curr = neuer Zustand (gerendert), prev = alter Zustand (vorheriger Frame)
  ```
  - **Nach Swap ist `curr` der neue Zustand → Render liest `curr`.** (vorheriger Frame = `prev`, beim nächsten Schritt als `- prev[i]` verwendet.)
  - Rand: Border-Zellen werden nicht upgedatet (bleiben 0) → **absorptiver** Rand (keine Wand-Reflexion-Artefakte).
- **Anregung (Maus):** `mousemove`/`touchmove` → Grid-Koordinate, injectiere Gauß-Bump (`amplitude * exp(-r²/σ²)`, Radius ~2–3 Zellen, amplitude moderat). Throttle: nur injectieren, wenn Maus ≥ 1 Grid-Zelle seit letzter Injektion bewegt. → Bewegung zieht Ripple-Spur, die interferiert.
- **Click/Splash:** größere Amplitude + größerer Radius (optional, dezenter "Tropfen").
- **Damping:** so gewählt, dass Wellen ~3–6s sichtbar, dann ruht das Wasser (nicht endlos flackern).

### 4.3 Rendering (3D-Bump-Look + Refraktion)

Pro Grid-Zelle `i`:

```
dx = prev[i-1] - prev[i+1]
dy = prev[i-GW] - prev[i+GW]
// Refraktion: Hintergrund an verschobener Koordinate sampeln
// Bump-Light: Specular aus Gradient · Lichtrichtung
shade = clamp(dx*lx + dy*ly, -1, 1)      // lx,ly = Licht von oben-rechts
spec = pow(max(shade,0), k)              // enger Platinum-Glanz auf Kämmen
base = mix(deepCharcoal, slate, height)  // Höhen-tiefe
color = base + spec * platinumHighlight
```

- **Farben:** `deep = #0b0e14`, `slate = #141a28`, Specular = `#cbd5e1` (Platinum). Optional minimales Emerald in Wellentälern (`#00e676` bei ≤ 2% — content-aware zum Crash-Panel, nicht bunt).
- **Output:** `ImageData` auf Offscreen-Canvas `GW×GH` → `putImageData` → `drawImage` upgescaled auf fullscreen mit `imageSmoothingEnabled=true` (weiche Wasser-Optik, billig).
- **DPR:** Canvas-CSS = `100vw×100vh`; interne Pixel = `GW×GH` (unabhängig von DPR, gerade weil GPU-light gewollt).

### 4.4 Performance & Robustheit

| Maßnahme                                                                                | Warum                                                     |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `GW ≤ 256` (Mobile ≤ 160)                                                               | CPU-Simulation billig (≤ ~65k Zellen/Frame)               |
| Offscreen-Grid + Upscale                                                                | Fullscreen-PutImageData vermieden                         |
| `requestAnimationFrame` + `document.hidden`-Pause                                       | kein Rechenverbrauch im Hintergrund-Tab                   |
| `IntersectionObserver`/Visibility                                                       | (Canvas ist fixed fullscreen → `visibilitychange` reicht) |
| Maus-Throttle (≥1 Grid-Zelle)                                                           | verhindert Ripple-Überinjektion bei schnellem Zeigen      |
| `prefers-reduced-motion: reduce` → **Simulation aus**, statischer Wasser-Gradient (CSS) | A11y                                                      |
| Damping hoch genug                                                                      | Wasser ruht nach ~5s, kein Dauerflackern                  |
| Feature-Detect `Float32Array`/Canvas                                                    | uralte Browser → CSS-Gradient-Fallback                    |
| Touch-Handler passiv                                                                    | Mobile-Scroll nicht blockieren                            |

### 4.5 A11y / Reduced-Motion

- `@media (prefers-reduced-motion: reduce)`: Canvas nicht animieren → statischer Tiefen-Gradient (Charcoal→Slate) + dezentes festes Specular-Muster. Maus-Anregung deaktiviert.
- Wasser ist rein **dekorativ** (`aria-hidden="true"`, `pointer-events: none` auf Canvas); Inhalte bleiben voll bedienbar.
- Kontrast: Wasser dunkel hinter dunklem Glas → Text-Kontrast (Platinum/Weiß auf Charcoal) bleibt AA/AAA.

### 4.6 Datei-Layout (Mockup)

`docs/prototypes/water_background_v1.html` — single HTML:

- `<head>`: Tokens + Frosted-Obsidian-Glas + Content-Shell (wie v2, kompakt: Header, Metrics, Panel, Crash, Featured).
- `<body>`: `<canvas id="water" aria-hidden="true">` + `.wrap` (Glas-Content) + `<script>` (Simulation + Render).
- Keine externen Assets außer Google Fonts.

### 4.7 Integration in v2 (später, nach visueller Freigabe)

Nach Jans visueller Freigabe des Mockups:

1. Wasser-Canvas + Simulation als isoliertes Modul extrahieren (`src/components/background/WaterBackground.tsx`).
2. In v2-Shell einsetzen: ersetzt `.bg-grid` + `.blob` Layer.
3. `prefers-reduced-motion` + `visibilitychange` + Feature-Detect in React-Lifecycle (`useEffect` Cleanup = `cancelAnimationFrame`).
4. Produktionspfad WebGL GPGPU als Folge-Task (eigenes Ticket) — Mockup gilt als visuelle Referenz.

---

## 5 — Self-Audit des Plans (vor Execution)

| #   | Risiko / Lücke                                                                      | Maßnahme im Plan verankert                                                                                                                    |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Canvas-2D `putImageData` + `drawImage`-Upscale könnte grob/pixelig wirken           | `imageSmoothingEnabled=true` (bilinear) → weiche Wasser-Optik; gewollt                                                                        |
| S2  | 4-Nachbar-Kernel → Wellen eher quadratisch (Canena-Beobachtung)                     | Akzeptiert; Damping + Upscale-Weichzeichner mildern; optional 8-Nachbar als Level-Up (§6)                                                     |
| S3  | Maus injiziert pro `mousemove` zu oft → chaotisches Dauer-Rauschen                  | Throttle (≥1 Grid-Zelle) + moderat Amplitude (§4.2)                                                                                           |
| S4  | `requestAnimationFrame` ohne Delta-Time → Framerate-abhängige Wellengeschwindigkeit | Akzeptiert für Mockup (Canena-Note); Produktion: fixed timestep (§6)                                                                          |
| S5  | `prev`/`curr` Swap-Semantik fehleranfällig (klassischer Bug)                        | Explizit dokumentiert: Schritt schreibt `prev[i]=nv`, dann Swap → `curr`=neu (gerendert), `prev`=alt (vorheriger Frame)                       |
| S6  | Wasser zu hell/bunt → bricht Cyber-Stealth                                          | Palette fest: Charcoal/Slate/Platinum-Specular, Emerald ≤2% (§4.3)                                                                            |
| S7  | Text-Kontrast durch Wasser hinter Glas gefährdet                                    | Wasser dunkel + Glas-Blur + Frosted-Obsidian-Surface (rgba 0.55) → Kontrast erhalten; Content z-index:1                                       |
| S8  | Mobile: Maus fehlt → kein Effekt                                                    | `touchmove` zusätzlich (§4.2); reduced-motion auf Mobile optional                                                                             |
| S9  | Tab im Hintergrund → CPU-Verbrauch                                                  | `document.hidden`-Pause (§4.4)                                                                                                                |
| S10 | reduced-motion-Nutzer bekommen flache Seite                                         | Statischer Tiefen-Gradient als Fallback (§4.5), kein totaler Verlust                                                                          |
| S11 | Canvas z-index vs Glas: Wasser nicht sichtbar durch Glas?                           | Glas `backdrop-filter: blur` sieht **durch** sich selbst zum Canvas (z-index:0) → ja sichtbar; v2 bewies das mit Blobs                        |
| S12 | Initiale Leere: Wasser ist flach bis erste Maus-Bewegung                            | Auto-Seed: ein bis zwei dezente initiale Tropfen + sehr langsame Eigen-Störung (§6 Level-Up) ODER ruhiges Wasser ist okay (Terminal-Ästhetik) |
| S13 | `drawImage`-Upscale bei DPR > 2 → Browser rendert intern groß?                      | Intern `GW×GH` klein, CSS fullscreen; Browser upsamplet bilinear → billig                                                                     |
| S14 | Mehrere `mousemove`-Listener (Scroll/Throttle) → Memory                             | ein Listener, `passive:true` für touch                                                                                                        |

**Plan-Level-Ups aus Audit:** Throttle, Swap-Semantik dokumentiert, Palette-Schutz, Reduced-Motion-Fallback, Tab-Pause, initialer Auto-Seed. → in §4 integriert / §6 als Level-Ups.

---

## 6 — Level-Ups (optional, nächste Iteration)

- **8-Nachbar-Kernel** (Diagonalen mitgewichtet) → rundere Wellen.
- **Fixed timestep** Simulation (Akkumulator) → Framerate-unabhängige Wellengeschwindigkeit.
- **Echte Refraktion** über Hintergrundbild-Sampling (z. B. dezentes Logo/Grid hinter Wasser gebrochen) → mehr "Wasser"-Glaubwürdigkeit.
- **Auto-Seed / Ambient-Ripples**: seltene, leichte, zufällige Tropfen bei Inaktivität → Wasser "lebt" ohne Maus.
- **WebGL GPGPU** für Produktion (§3) — echtes 3D, Refraktion, Phong.
- **Mausrad / Pinch** → Wellen-Amplitude steuern (Spieler-Feedback).
- **Crash-Panel-Kopplung**: Crash-Bust injiziert einen starken Tropfen ins Höhenfeld → content-aware Wasser.

---

## 7 — Execution-Audit (nach Bau des Mockups)

**Datei:** `docs/prototypes/water_background_v1.html` (375 Zeilen, self-contained, nur Google-Fonts extern).

### Strukturelle Verifikation (objektiv, kein visuelles Urteil)

| Check                                                          | Methode                                         | Ergebnis                                                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Self-contained (keine externen Assets außer Google Fonts)      | grep externe `src`/`href`                       | ✓                                                                                                           |
| Canvas dekorativ (`aria-hidden` + `pointer-events:none`)       | grep                                            | ✓ → Content bleibt bedienbar                                                                                |
| `prefers-reduced-motion`-Ast + CSS-Fallback-Gradient           | grep `prefers-reduced-motion`/`#water-fallback` | ✓                                                                                                           |
| `visibilitychange`-Pause (Tab-Hidden → `cancelAnimationFrame`) | grep                                            | ✓                                                                                                           |
| Maus + Touch + Click-Injection (Wellen + Splash)               | grep `mousemove`/`touchmove`/`click`            | ✓                                                                                                           |
| Hugo-Elias-Schritt + korrekte Swap-Semantik                    | Code-Zeile 262–268                              | ✓ `prev[i]=nv` dann `tmp=curr; curr=prev; prev=tmp` → `curr`=neu (gerendert), `prev`=alt (vorheriger Frame) |
| Grid-Cap (Desktop ≤256, Mobile ≤160)                           | grep `MAX_GRID`/`MOBILE_GRID`                   | ✓                                                                                                           |
| Auto-Seed (Wasser nicht flach am Start)                        | grep `drop(Math.floor`                          | ✓ 2 initiale Tropfen (auch im reduced-motion-Ast)                                                           |
| Resize-Debounce (Puffer-Reallokation)                          | grep `setTimeout`                               | ✓ 180ms                                                                                                     |
| Licht/Palette-Konstanten benannt (keine Magic Numbers)         | Code                                            | ✓ `LIGHT_X/Y`, `SPEC_POWER`, `BASE_*`, `SLATE_*`, `SPEC_*`, `DAMPING`, `DROP_*`                             |
| Refraktion/Bump-Shading aus Höhengradient                      | Code                                            | ✓ `gx=curr[il]-curr[ir]`, `gy=curr[iu]-curr[id]`, `shade=gx*LIGHT_X+gy*LIGHT_Y`                             |
| Offscreen-Grid + bilineares Upscale                            | Code                                            | ✓ `putImageData` → `drawImage` fullscreen, `imageSmoothingEnabled=true`                                     |
| Z-Layering: Wasser `z-index:0`, Glas-Content `z-index:1`       | CSS                                             | ✓ → Wasser sichtbar hinter Frosted-Obsidian, Inhalt scharf                                                  |

### Doc-Korrektur (Self-Audit §S5)

- §4.2 formulierte fälschlich "Render liest `prev`". **Korrekt:** nach `step()`+Swap ist `curr` der neue Zustand → **Render liest `curr`**. Code ist korrekt; nur Plan-Text war missverständlich. (Hiermit korrigiert.)

### Algorithmus-Korrektheit (Verifikation)

- Zeit-Semantik: `curr`=H_t, `prev`=H_{t-1}. Schritt schreibt `prev[i]=avg4(curr)*… - prev[i]` (= H_{t+1}) in das vormals `prev`-Array, swappt → `curr`=H_{t+1}, `prev`=H_t. Nächster Schritt: `avg4(H_{t+1}) - H_t` = H_{t+2}. ✓ korrekte Wellengleichung.
- Rand: Border-Zellen werden nicht upgedatet (bleiben 0) → absorptiver Rand (keine Wand-Reflexion-Artefakte). Bewusst gewählt (sauberer als Reflexion bei diesem Look).
- Damping 0.988 → Wellen ~5s sichtbar, dann ruht das Wasser (kein Dauerflackern).

### Gegen-Check vs. Plan (A1–A8)

- A1 (3D-Wasser) ✓ Bump-Shading + Specular aus Heightmap-Gradient.
- A2 (Maus→Wellen) ✓ `drop()` bei `mousemove`/`touchmove`, propagiert via `step()`.
- A3 (Interferenz/Reflexion) ✓ Wellengleichung superponiert; Rand absorptiv (Reflexion bewusst nicht, siehe oben).
- A4 (kein Spotlight) ✓ kein Radial-Gradient am Cursor; Wellen entstehen aus Heightmap-Status, breiten sich aus.
- A5 (Inhalt scharf) ✓ Canvas `z-index:0` + `pointer-events:none`; Content `z-index:1` unberührt.
- A6 (dunkel/professional) ✓ Palette Charcoal/Slate/Platinum-Specular; kein Neon.
- A7 (performant) ✓ Grid ≤256, Offscreen+Upscale, Tab-Pause, reduced-motion-Fallback.
- A8 (self-contained) ✓ nur Google-Fonts extern.

### Bekannte Grenzen (bewusst, nicht visuell behandelbar)

- Wellen-Optik, Specular-Intensität, Damping-Gefühl, Farbe, "Wasser vs. Plasma"-Wirkung, Mobile-Performance → **Jans visuelle QA** (No-Visual-Check-Regel).
- 4-Nachbar-Kernel → Wellen tendenziell leicht quadratisch (Canena-Note); durch Damping + bilinearen Upscale-Weichzeichner gemildert. Level-Up 8-Nachbar (§6) bei Bedarf.
- Kein fixed timestep (§6 Level-Up) → Wellengeschwindigkeit Framerate-abhängig. Für Mockup akzeptiert.

**Ergebnis:** Mockup erfüllt A1–A8 strukturell. Algorithmus korrekt. Visuelle Freigabe → Jan.

---

## 8 — Wiederverwendung (projektübergreifend, 2026-08-09)

Die Technik wurde als wiedervernutzbares Muster extrahiert und in ein zweites Projekt überführt:

- **Kanonisches Playbook (Root-Ordner):** [`../../../_Brain/30_Playbooks/water-ripple-background`](../../../_Brain/30_Playbooks/water-ripple-background.md) — Hugo-Elias + WebGL-GPGPU-Upgrade-Pfad, projektübergreifend.
- **ReactLandingpages-Integration:** Subprojekt [`../../../ReactLandingpages/water-ripple/`](../../../ReactLandingpages/water-ripple/) — React-Komponente `WaterBackground`, Sim/Render DOM-frei + testbar (16 Vitest-Tests grün, `tsc`/`vite build` sauber). Plan mit 17 Pitfalls + Two-Perspective-Review: [`../../../ReactLandingpages/water-ripple/IMPLEMENTATION_PLAN.md`](../../../ReactLandingpages/water-ripple/IMPLEMENTATION_PLAN.md). Doku wo es Sinn macht: [`../../../ReactLandingpages/docs/05_WATER_RIPPLE_BACKGROUND.md`](../../../ReactLandingpages/docs/05_WATER_RIPPLE_BACKGROUND.md).
- **MOC-Backlink:** [[_Brain/40_Projects/ReactLandingpages-MOC]].

> Casino-Produktionsintegration (§4.7) kann die React-Komponente aus `water-ripple/` übernehmen (Sim/Render sind framework-agnostisch) statt neu zu bauen.
