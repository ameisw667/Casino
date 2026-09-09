# Motion.dev — Vollständiger API- & Feature-Katalog (55 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX- & Animations-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [motion.dev](https://motion.dev/) (Matt Perry — Motion for React, Nachfolger von Framer Motion)
**Kanonische Projekt-Ablage:** [`docs/frontend/13_motion_dev_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/13_motion_dev_complete_catalog.md)
**Analog-Katalog (Componentry):** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)
**Projekt-Doku Motion/Springs:** [`docs/frontend/04_motion_spring_physics.md`](file:///v:/VibeCoding/Casino/docs/frontend/04_motion_spring_physics.md) · [`xx_sop/04_design_system_ui.md`](file:///v:/VibeCoding/Casino/xx_sop/04_design_system_ui.md)

> **Projekt-Basis:** `framer-motion@^13.1.1` ([`package.json`](file:///v:/VibeCoding/Casino/package.json)) — dieselbe Engine wie `motion/react` (Umbenennung ab v11+); alle Links unten funktionieren 1:1 mit der im Projekt installierten Version.
> **Link-Basis:** Alle URLs stammen aus der offiziellen Sitemap (`motion.dev/sitemap.xml`) und wurden stichprobenartig verifiziert. ⚠️ Alte API-Links im Format `motion.dev/react/<api>` sind **tot (404)** — kanonisch ist ausschließlich `motion.dev/docs/react-<api>`.

---

## 1. Quickstart & Projekt-Integration

Im Casino-Projekt ist Framer Motion (v13) bereits installiert. Der moderne Import-Pfad ist `motion/react`; das Projekt nutzt das gleichwertige `framer-motion`-Paket:

```bash
# Bereits installiert im Projekt (package.json): framer-motion ^13.1.1
npm install framer-motion
# bzw. das umbenannte Paket (identische API):
npm install motion
```

```tsx
// Komponenten & Hooks (Projekt-Standard)
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
// identisch zu: import { ... } from "motion/react";
```

---

## 2. Übersicht der 6 Kategorien (48 Einträge)

Klicke auf eine Kategorie, um direkt zur jeweiligen Tabelle zu springen:

1. [Kategorie 1: Guides & Grundlagen](#kategorie-1-guides--grundlagen) _(15 Einträge)_
2. [Kategorie 2: Kern-Komponenten (Open Source)](#kategorie-2-kern-komponenten-open-source) _(7 Einträge)_
3. [Kategorie 3: Fertige UI-Komponenten (Motion+ Premium)](#kategorie-3-fertige-ui-komponenten-motion-premium) _(7 Einträge)_
4. [Kategorie 4: Hooks — Scroll & Sichtbarkeit](#kategorie-4-hooks--scroll--sichtbarkeit) _(4 Einträge)_
5. [Kategorie 5: Hooks — Animation & MotionValues](#kategorie-5-hooks--animation--motionvalues) _(10 Einträge)_
6. [Kategorie 6: Motion+ Ökosystem & Vergleiche](#kategorie-6-motion-ökosystem--vergleiche) _(6 Einträge)_
7. [Kategorie 7: Hybrid-/Vanilla-APIs (auch in React nutzbar)](#kategorie-7-hybrid-vanilla-apis-auch-in-react-nutzbar) _(6 Einträge)_

---

### Legende zum User-Votum

Die Votum-Spalte ist strukturell identisch zu [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Da Jan für Motion.dev noch kein Votum abgegeben hat, ist jeder Eintrag initial neutral markiert und wird nach Begutachtung wie folgt nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** (Reserviert — explizite Priorisierung durch Jan)
- ⭐⭐ **Bestätigt** (Reserviert — positiv bewertet und für den Einbau freigegeben)
- ❌ **Abgelehnt** (Reserviert — nicht für Rollout vorgesehen)
- ⚪ **Katalog-Bestand** (Vollständiger Motion-Eintrag zum Durchklicken und Inspirieren — _aktueller Status aller Einträge_)
- 💰 **Motion+ Premium** (Nur mit kostenpflichtiger Motion+-Mitgliedschaft nutzbar — Einmalkauf)

---

## Kategorie 1: Guides & Grundlagen

| Komponente                    | Offizieller Link (motion.dev)                                                        |     User-Votum     | Casino-Einsatzbereich                                                                                                                               | Technologie                                   |
| :---------------------------- | :----------------------------------------------------------------------------------- | :----------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| **Get Started (React)**       | [`/docs/react`](https://motion.dev/docs/react)                                       | ⚪ Katalog-Bestand | Einstiegspunkt für alle React-Integrationsfragen                                                                                                    | Motion for React Übersicht                    |
| **Installation**              | [`/docs/react-installation`](https://motion.dev/docs/react-installation)             | ⚪ Katalog-Bestand | Referenz für `framer-motion`/`motion`-Setup ([`package.json`](file:///v:/VibeCoding/Casino/package.json))                                           | npm/Paket-Setup                               |
| **Animation (Guide)**         | [`/docs/react-animation`](https://motion.dev/docs/react-animation)                   | ⚪ Katalog-Bestand | Basis für sämtliche Spiel- & UI-Animationen                                                                                                         | `animate`-Prop, Targets & Keyframes           |
| **Gestures (Guide)**          | [`/docs/react-gestures`](https://motion.dev/docs/react-gestures)                     | ⚪ Katalog-Bestand | Hover-/Tap-Feedback auf Aktionsbuttons ([`GameActionButton.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/GameActionButton.tsx)) | `whileHover` / `whileTap` / `whileFocus`      |
| **Hover Animation (Guide)**   | [`/docs/react-hover-animation`](https://motion.dev/docs/react-hover-animation)       | ⚪ Katalog-Bestand | Richtungs-Glanzkanten & Karten-Lift ([`ElevatedGameCard.tsx`](file:///v:/VibeCoding/Casino/src/app/games/_components/ElevatedGameCard.tsx))         | `whileHover` + `AnimatePresence`-Varianten    |
| **Drag (Guide)**              | [`/docs/react-drag`](https://motion.dev/docs/react-drag)                             | ⚪ Katalog-Bestand | Ziehbare Elemente (z. B. Karten, Picker, Bounds)                                                                                                    | `drag`-Prop + Constraints + Momentum          |
| **Scroll Animations (Guide)** | [`/docs/react-scroll-animations`](https://motion.dev/docs/react-scroll-animations)   | ⚪ Katalog-Bestand | Scroll-Choreografien (Onboarding, Provably-Fair Story)                                                                                              | Scroll-Linked `useScroll` + `useTransform`    |
| **Layout Animations (Guide)** | [`/docs/react-layout-animations`](https://motion.dev/docs/react-layout-animations)   | ⚪ Katalog-Bestand | Verschiebungen ohne Layout-Shift (Sortierung, Grid-Reflows)                                                                                         | `layout`-Prop + FLIP-Technik                  |
| **SVG Animation (Guide)**     | [`/docs/react-svg-animation`](https://motion.dev/docs/react-svg-animation)           | ⚪ Katalog-Bestand | Signatur-/Pfad-Animationen, Icon-Draw-Effekte                                                                                                       | SVG `pathLength` / `strokeDashoffset`         |
| **Transitions (Prop)**        | [`/docs/react-transitions`](https://motion.dev/docs/react-transitions)               | ⚪ Katalog-Bestand | Spring-Physik-Vorgabe des Design-Systems (`bounce: 0.4`)                                                                                            | `transition`-Prop (Spring/Tween/Inertia)      |
| **Easing Functions**          | [`/docs/easing-functions`](https://motion.dev/docs/easing-functions)                 | ⚪ Katalog-Bestand | Kurvenwahl für Gold-Reveals & Overlays                                                                                                              | Bezier/Spring-Easing-Referenz                 |
| **Tailwind Integration**      | [`/docs/react-tailwind`](https://motion.dev/docs/react-tailwind)                     | ⚪ Katalog-Bestand | Kombination mit projekt-weitem Tailwind-Setup                                                                                                       | Tailwind + Motion-Variants                    |
| **Accessibility**             | [`/docs/react-accessibility`](https://motion.dev/docs/react-accessibility)           | ⚪ Katalog-Bestand | Pflicht-Reduzierung bei `prefers-reduced-motion`                                                                                                    | `useReducedMotion` / `MotionConfig`           |
| **Reduce Bundle Size**        | [`/docs/react-reduce-bundle-size`](https://motion.dev/docs/react-reduce-bundle-size) | ⚪ Katalog-Bestand | Bundle-Budget (JS gzipped < 300 kb App-Page)                                                                                                        | `LazyMotion` + `domAnimation`-Feature-Bundles |
| **Upgrade Guide**             | [`/docs/react-upgrade-guide`](https://motion.dev/docs/react-upgrade-guide)           | ⚪ Katalog-Bestand | Migrationsreferenz für künftige Major-Sprünge (v12 → v13)                                                                                           | Breaking-Changes-Mapping                      |

---

## Kategorie 2: Kern-Komponenten (Open Source)

| Komponente                | Offizieller Link (motion.dev)                                                    |     User-Votum     | Casino-Einsatzbereich                                                                                                                  | Technologie                            |
| :------------------------ | :------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| **`<motion />`**          | [`/docs/react-motion-component`](https://motion.dev/docs/react-motion-component) | ⚪ Katalog-Bestand | Fundament aller animierten Elemente (Buttons, Karten, HUD)                                                                             | Declarative `animate`-Rendering-Engine |
| **`<AnimatePresence />`** | [`/docs/react-animate-presence`](https://motion.dev/docs/react-animate-presence) | ⚪ Katalog-Bestand | Modals, Toasts, Big-Win- & Game-Overlays ([`BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)) | Exit-Animationen beim Unmount          |
| **`<LayoutGroup />`**     | [`/docs/react-layout-group`](https://motion.dev/docs/react-layout-group)         | ⚪ Katalog-Bestand | Gemeinsame Layout-Animationen über Komponentengrenzen                                                                                  | Shared FLIP-Gruppierung                |
| **`<MotionConfig />`**    | [`/docs/react-motion-config`](https://motion.dev/docs/react-motion-config)       | ⚪ Katalog-Bestand | Globale Spring-Defaults & `reducedMotion="user"` im Shell-Layout                                                                       | Context-basierte Config-Weitergabe     |
| **`<LazyMotion />`**      | [`/docs/react-lazy-motion`](https://motion.dev/docs/react-lazy-motion)           | ⚪ Katalog-Bestand | Bundle-Schonung auf Spielseiten (`m`-Komponenten statt `motion`)                                                                       | Feature-Bundle Lazy-Loading            |
| **`MotionValue`**         | [`/docs/react-motion-value`](https://motion.dev/docs/react-motion-value)         | ⚪ Katalog-Bestand | Re-Render-freie dynamische Zahlen (Multiplikatoren, Wallet-Lerp)                                                                       | Externer reaktiver Wert-Container      |
| **`<Reorder />`**         | [`/docs/react-reorder`](https://motion.dev/docs/react-reorder)                   | ⚪ Katalog-Bestand | Sortierbare Listen (z. B. Admin-Verwaltung, Favoriten)                                                                                 | Drag-Sortierung + Layout-Animation     |

---

## Kategorie 3: Fertige UI-Komponenten (Motion+ Premium)

| Komponente                | Offizieller Link (motion.dev)                                                    |             User-Votum              | Casino-Einsatzbereich                                                                    | Technologie                                 |
| :------------------------ | :------------------------------------------------------------------------------- | :---------------------------------: | :--------------------------------------------------------------------------------------- | :------------------------------------------ |
| **`<Ticker />`**          | [`/docs/react-ticker`](https://motion.dev/docs/react-ticker)                     |         💰 Motion+ Premium          | Endlos-Laufband für Gewinner-/Sponsor-Leisten (~2.1 kb)                                  | Zeit-, Drag- & Scroll-getriebenes Marquee   |
| **`<Typewriter />`**      | [`/docs/react-typewriter`](https://motion.dev/docs/react-typewriter)             |         💰 Motion+ Premium          | KI-Guide-Ausgaben, Live-Status-Texte                                                     | Zeichenweise Typewriter-Engine              |
| **`<ScrambleText />`**    | [`/docs/react-scramble-text`](https://motion.dev/docs/react-scramble-text)       |         💰 Motion+ Premium          | Jackpot-/Multiplikator-Entrauschen als Deko-Effekt                                       | Zeichen-Scramble-Algorithmus                |
| **`<Carousel />`**        | [`/docs/react-carousel`](https://motion.dev/docs/react-carousel)                 |         💰 Motion+ Premium          | Spielauswahl-Karussell ([`/games`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)) | Physikbasierte Karussell-Stage              |
| **`<AnimateNumber />`**   | [`/docs/react-animate-number`](https://motion.dev/docs/react-animate-number)     |         💰 Motion+ Premium          | Live-Counter mit Locale-Formatierung (~2.5 kb): Wallet-Balance, Jackpot, Countdowns      | Animierte Zahlenwerte mit Formatierung      |
| **`<AnimateActivity />`** | [`/docs/react-animate-activity`](https://motion.dev/docs/react-animate-activity) | 💰 Motion+ Premium _(Early Access)_ | Spiel-Tabs mit State-Erhaltung (Hide statt Unmount)                                      | React `<Activity>` + Enter/Exit-Animationen |
| **`<AnimateView />`**     | [`/docs/react-animate-view`](https://motion.dev/docs/react-animate-view)         | 💰 Motion+ Premium _(Early Access)_ | Page-/Route-Übergänge (~3 kb)                                                            | Native View Transition API + Mini-`animate` |

---

## Kategorie 4: Hooks — Scroll & Sichtbarkeit

| Komponente             | Offizieller Link (motion.dev)                                                        |     User-Votum     | Casino-Einsatzbereich                                                                                                                       | Technologie                       |
| :--------------------- | :----------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------- |
| **`useScroll`**        | [`/docs/react-use-scroll`](https://motion.dev/docs/react-use-scroll)                 | ⚪ Katalog-Bestand | Lobby-Parallax, Sticky-VIP-Sektionen, Scroll-Progress-HUD                                                                                   | Scroll-Progress als `MotionValue` |
| **`useInView`**        | [`/docs/react-use-in-view`](https://motion.dev/docs/react-use-in-view)               | ⚪ Katalog-Bestand | Reveal-Animationen in Bento-Kacheln ([`BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)) | IntersectionObserver-Wrapper      |
| **`usePageInView`**    | [`/docs/react-use-page-in-view`](https://motion.dev/docs/react-use-page-in-view)     | ⚪ Katalog-Bestand | Pausieren von Loops/Sound bei Tab-Wechsel (SSR-safe)                                                                                        | Document-Visibility-Tracking      |
| **`useReducedMotion`** | [`/docs/react-use-reduced-motion`](https://motion.dev/docs/react-use-reduced-motion) | ⚪ Katalog-Bestand | A11y-Pflicht: Motion-Reduktion bei Nutzerpräferenz                                                                                          | Media-Query-Reaktivität           |

---

## Kategorie 5: Hooks — Animation & MotionValues

| Komponente                | Offizieller Link (motion.dev)                                                                |     User-Votum     | Casino-Einsatzbereich                                            | Technologie                            |
| :------------------------ | :------------------------------------------------------------------------------------------- | :----------------: | :--------------------------------------------------------------- | :------------------------------------- |
| **`useAnimate`**          | [`/docs/react-use-animate`](https://motion.dev/docs/react-use-animate)                       | ⚪ Katalog-Bestand | Imperative Win-Sequenzen (Big-Win-Choreografie)                  | Scoped imperatives `animate()`         |
| **`useSpring`**           | [`/docs/react-use-spring`](https://motion.dev/docs/react-use-spring)                         | ⚪ Katalog-Bestand | Weiches Nachziehen von Zählern (Gold-Balance, Multiplikator)     | Spring-Simulation auf `MotionValue`    |
| **`useTransform`**        | [`/docs/react-use-transform`](https://motion.dev/docs/react-use-transform)                   | ⚪ Katalog-Bestand | Mapping von Scroll-/Wert-Inputs auf Transform-Outputs            | Wert-Mapping & Komposition             |
| **`useMotionTemplate`**   | [`/docs/react-use-motion-template`](https://motion.dev/docs/react-use-motion-template)       | ⚪ Katalog-Bestand | Dynamische CSS-Strings (z. B. Glanz-Position `translate(x, y)`)  | Template-Literal für `MotionValues`    |
| **`useMotionValueEvent`** | [`/docs/react-use-motion-value-event`](https://motion.dev/docs/react-use-motion-value-event) | ⚪ Katalog-Bestand | Re-Render-freie Reaktion auf Scroll-/Wert-Grenzwerte             | Event-Subscription auf `MotionValue`   |
| **`useVelocity`**         | [`/docs/react-use-velocity`](https://motion.dev/docs/react-use-velocity)                     | ⚪ Katalog-Bestand | Geschwindigkeitsabhängige Effekte (Motion-Blur-Gefühl)           | Velocity-Ableitung aus `MotionValue`   |
| **`useTime`**             | [`/docs/react-use-time`](https://motion.dev/docs/react-use-time)                             | ⚪ Katalog-Bestand | Endlos-Loops (Gold-Glimmer, shaderähnliche CSS-Rotationen)       | Zeit-Progress als `MotionValue`        |
| **`useAnimationFrame`**   | [`/docs/react-use-animation-frame`](https://motion.dev/docs/react-use-animation-frame)       | ⚪ Katalog-Bestand | Partikel-/Canvas-Loops (Goldstaub im Big-Win-Overlay)            | `requestAnimationFrame`-Hook           |
| **`useDragControls`**     | [`/docs/react-use-drag-controls`](https://motion.dev/docs/react-use-drag-controls)           | ⚪ Katalog-Bestand | Drag-Start von definierten Handles (z. B. ziehbare Modals)       | Imperative Drag-Steuerung              |
| **`useCurtains`**         | [`/docs/react-use-curtains`](https://motion.dev/docs/react-use-curtains)                     | 💰 Motion+ Premium | Runden-/Routenübergänge „Cover-then-Reveal" (Wipe, Iris, Pixels) | Overlay-Transition hinter State-Update |

---

## Kategorie 6: Motion+ Ökosystem & Vergleiche

| Komponente                 | Offizieller Link (motion.dev)                                                                    |     User-Votum     | Casino-Einsatzbereich                                      | Technologie                 |
| :------------------------- | :----------------------------------------------------------------------------------------------- | :----------------: | :--------------------------------------------------------- | :-------------------------- |
| **Motion+ Installation**   | [`/docs/react-motion-plus-installation`](https://motion.dev/docs/react-motion-plus-installation) | ⚪ Katalog-Bestand | Setup-Referenz, falls Premium-Komponenten evaluiert werden | Motion+-Token & Paket-Setup |
| **Motion+ (Produktseite)** | [`/plus`](https://motion.dev/plus)                                                               | ⚪ Katalog-Bestand | Kauf-Entscheidung: 430+ Premium-Beispiele, AI Kit          | Einmalkauf-Mitgliedschaft   |
| **Courses**                | [`/docs/react-courses`](https://motion.dev/docs/react-courses)                                   | ⚪ Katalog-Bestand | Lerneffekt für Jan (primäres Projektziel)                  | Video-/Tutorial-Kurse       |
| **Examples**               | [`/examples`](https://motion.dev/examples)                                                       | ⚪ Katalog-Bestand | Inspirations-Pool (Filter: `platform=react`)               | Live-Beispiel-Sammlung      |
| **GSAP vs Motion**         | [`/docs/gsap-vs-motion`](https://motion.dev/docs/gsap-vs-motion)                                 | ⚪ Katalog-Bestand | Technologie-Begründung für Verbleib bei Motion             | Vergleich: GSAP vs. Motion  |
| **Landing Page**           | [`/`](https://motion.dev/)                                                                       | ⚪ Katalog-Bestand | Live-Demos & Framework-Auswahl                             | Produktübersicht            |

---

## Kategorie 7: Hybrid-/Vanilla-APIs (auch in React nutzbar)

Diese Funktionen stammen aus der Vanilla-Doku von motion.dev, sind aber Teil desselben Pakets, das `framer-motion`/`motion/react` re-exportiert — im React-Projekt direkt importierbar:

| Komponente                        | Offizieller Link (motion.dev)                      |     User-Votum     | Casino-Einsatzbereich                                                     | Technologie                                       |
| :-------------------------------- | :------------------------------------------------- | :----------------: | :------------------------------------------------------------------------ | :------------------------------------------------ |
| **`animate()`**                   | [`/docs/animate`](https://motion.dev/docs/animate) | ⚪ Katalog-Bestand | Imperative Einzelanimationen & Sequenzen (auch außerhalb von Komponenten) | WAAPI-basierte Hybrid-Engine mit Playback-Control |
| **`stagger()`**                   | [`/docs/stagger`](https://motion.dev/docs/stagger) | ⚪ Katalog-Bestand | Kaskadierende Reveals (Karten-Grids, Listen)                              | Verzögerungs-Verteilung für `animate()`           |
| **`spring()`**                    | [`/docs/spring`](https://motion.dev/docs/spring)   | ⚪ Katalog-Bestand | Spring-Generator für Visualizer & CSS-Ausgabe                             | Generator-basierte Spring-Simulation              |
| **`inView()`**                    | [`/docs/inview`](https://motion.dev/docs/inview)   | ⚪ Katalog-Bestand | Viewport-Trigger außerhalb von React-Renderzyklen                         | Imperativer IntersectionObserver                  |
| **`frame` / `cancelFrame`**       | [`/docs/frame`](https://motion.dev/docs/frame)     | ⚪ Katalog-Bestand | Hochfrequente Canvas-/Partikel-Loops mit Batch-Scheduling                 | `requestAnimationFrame`-Pipeline                  |
| **Motion CSS (`spring()` → CSS)** | [`/docs/css`](https://motion.dev/docs/css)         | ⚪ Katalog-Bestand | Spring-Animationen als reines CSS (RSC-kompatibel, kein JS-Bundle)        | `linear()`-Easing-Kompilierung                    |

_Bewusst ausgeschlossen: 27 Vue-Dokuseiten sowie Plattform-Guides (Webflow, Squarespace, WordPress, Figma) — für dieses React/Next-Projekt irrelevant._

---

## 3. Zusammenfassung: Die Motion-API im Casino-Kontext

```mermaid
graph TD
    subgraph Fundament [Überall im Einsatz]
        M["motion &lt;/&gt; (Basis-Elemente)"]
        AP["AnimatePresence (Modals & Overlays)"]
        MC["MotionConfig (Spring-Defaults & reducedMotion)"]
        LM["LazyMotion (Bundle-Budget)"]
    end
    subgraph Dynamische Zahlen [Wallet & Multiplikatoren]
        MV["MotionValue (Re-Render-frei)"]
        US["useSpring (Zähler-Lerp)"]
        UT["useTransform + useMotionTemplate"]
    end
    subgraph Scroll-Choreografie [Lobby & Onboarding]
        US2["useScroll (Parallax & Progress)"]
        UIV["useInView (Bento-Reveals)"]
        URM["useReducedMotion (A11y-Pflicht)"]
    end
    subgraph Premium [Motion+ (nur mit Mitgliedschaft)]
        TK["Ticker (Gewinner-Laufband)"]
        AV["AnimateView (Route-Übergänge)"]
        UC["useCurtains (Runden-Reveal)"]
    end
```

**Faktencheck zur Discrepanz:** `CLAUDE.md` nennt „Framer Motion 12", [`package.json`](file:///v:/VibeCoding/Casino/package.json) löst `framer-motion@^13.1.1` auf — der Katalog folgt der installierten Version.
