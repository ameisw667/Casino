# 02 — Motion.dev (Motion for React): Lern-Konsolidierung & Testing-Ground

> **Status:** 🟢 Runde 1 + 2 + V2 + V3 + V4 „Living Hero" ausgeführt & verifiziert · **Stand:** 2026-08-29 · **Owner:** Jan + LLM · **Testing-URL:** `http://localhost:3015/games-2`
> **Bezug:** [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) · [`xx_sop/15_workflow_frontend_taste_qc.md`](../xx_sop/15_workflow_frontend_taste_qc.md) · [`xx_sop/10_workflow_frontend_revamp.md`](../xx_sop/10_workflow_frontend_revamp.md) · [motion.dev/docs](https://motion.dev/docs)
> **Ablage-Hinweis:** Jans expliziter Wunsch — Hauptdatei für das Thema Motion im `T_FRONTEND/`-Ordner. Hier wird alles konsolidiert (Kategorien, Niveau-Selbstevaluierung, Empfehlungen, Testing-Kandidat).

---

### 0 — Element-Mapping `/games-2` (Stand V4) & `/lab` (Stand V5, auf einen Blick)

| Element auf `/games-2`                         | Motion.dev-Konzept(e)                                                                                            |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| Headline „Der Katalog als / Motion-Übungsfeld" | **B — KineticHeadline**: Per-Wort-Magnet-Anziehung auf Pointer-Nähe (Motion Values + Springs, 0 Re-Render/Frame) |
| Marquee-Band unter dem Hero                    | **D — CategoryMarquee**: `useAnimationFrame` + Speed-MotionValue als Spring (Hover deceleriert sichtbar auf 0)   |
| Crash-Spotlight im Hero rechts                 | **F — HeroSpotlight**: Puls-Glow/LIVE-Chip/Multiplier-Loops (Tween, reduced-motion-Gate), Tilt/Glare             |
| Quick-View (Klick auf Tile oder Spotlight)     | `layoutId`-Shared Element (Flug Tile→Dialog→zurück)                                                              |
| Bento-Katalog (5 Tiles)                        | `layout` + `AnimatePresence popLayout` (Refilter formt Grid live um)                                             |
| Tiles                                          | Gestures (Tilt/Glare), Gold-Ring-Flash, Entrance-Stagger                                                         |
| Topbar-Indikator, Orbs, Rollup-Stats           | Motion Values, Tween-Loops, `counterRoll`-Spring                                                                 |
| Mobile                                         | Alle Loops/Gates hinter `useReducedMotion`/`useIsMobile`                                                         |

**Ergänzung `/lab` (V5):** WebGL-Partikel (three `Points` + ShaderMaterial, `aSource`/`aTarget`/`uMorph`), Typo-als-Partikelmaske (Offscreen-Canvas-Sampling), Wette-Hold-Loop (`useWagerRound`), Scroll-Velocity als Feld-Energie (`useScroll`+`useVelocity`→Uniform), WebGL-Downgrade (`useWebGLRecovery`/`resolveCanvasMode`). Details: §6d und [`02-4_motion_lab_v5_particle_typo.md`](./02-4_motion_lab_v5_particle_typo.md).

---

## 1 — Übersicht für Jan (Skill-Ladder Motion)

**Zweck dieser Tabelle:** Jan evaluiert selbst, auf welchem Niveau er sich je Unterkategorie befindet, um Bottlenecks zu identifizieren. Aktuell alles leer — bewusster Soll-Zustand, da noch nichts von Motion (bewusst) im Einsatz ist.

| #   | Unterkategorie                           | Kernfrage „kann ich …?"                                                                                | Doku                                                               | Niveau (Selbst-Eval) |
| :-- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- | :------------------- |
| 1   | **Motion Components & Basics**           | … `motion.`-Komponenten mit `initial`/`animate`/`whileHover` und korrekter `transition` nutzen?        | [react-motion](https://motion.dev/docs/react-motion-component)     | ∅                    |
| 2   | **Transitions, Easing & Spring-Physik**  | … Tween vs. Spring bewusst wählen und Springs `stiffness`/`damping`-basiert tunen (statt copy-paste)?  | [transitions](https://motion.dev/docs/react-transitions)           | ∅                    |
| 3   | **Gestures**                             | … `useMotionValue`/`useSpring` an Pointer/Gestures koppeln (Drag, Hover-Glaren, Tilt ohne Re-Render)?  | [gestures](https://motion.dev/docs/react-gestures)                 | ∅                    |
| 4   | **Scroll-Animationen**                   | … `whileInView`, `useScroll`, `useTransform` für Trigger- vs. Scroll-Linked-Animationen unterscheiden? | [scroll](https://motion.dev/docs/react-scroll-animations)          | ∅                    |
| 5   | **Layout-Animationen**                   | … `layout`, `layoutId` (Shared Element), `LayoutGroup` + Scale-Correction korrekt einsetzen?           | [layout](https://motion.dev/docs/react-layout-animations)          | ∅                    |
| 6   | **Exit-Animationen**                     | … `AnimatePresence` inkl. `mode="popLayout"`/`"wait"` und Exit-Pitfalls beherrschen?                   | [animate-presence](https://motion.dev/docs/react-animate-presence) | ∅                    |
| 7   | **Motion Values & Derivation**           | … Werte außerhalb React-State ableiten (`useTransform`, `useMotionValueEvent`, `useVelocity`)?         | [motion-value](https://motion.dev/docs/react-motion-value)         | ∅                    |
| 8   | **Independent Transforms & Performance** | … nur kompositorfreundliche Props animieren, Werte koppeln statt Re-Render, Budget beachten?           | [performance](https://motion.dev/docs/react-motion-component)      | ∅                    |
| 9   | **Reduced Motion & Accessibility**       | … `useReducedMotion`/`reducedMotion="user"` sauber gaten (SOP 15 §4)?                                  | [reduced-motion](https://motion.dev/docs/react-use-reduced-motion) | ∅                    |
| 10  | **Integration & Architektur**            | … Motion in Next.js/SSR, Bundle-Budget, Design-Tokens (SOP 04 Springs) und Store-Grenzen integrieren?  | [integration](https://motion.dev/docs/react-integration)           | ∅                    |

**Niveau-Skala-Vorschlag:** ∅ nicht bewertet · L1 gelesen · L2 Mini-Demo gebaut · L3 produktiv eingesetzt · L4 kann andere einweisen.

---

## 2 — Ist-Zustand & Rebrand-Fakten

**Fakten (verifiziert):**

- Motion for React ist der **Rebrand von Framer Motion** — dieselbe Library, neuer Name. Neues Paket: `motion`, Import: `import { motion } from "motion/react"`. Das Paket `framer-motion` existiert weiter (Legacy-Name, identische Library).
- Dieses Repo: `framer-motion` `^13.1.1` ([package.json:65](../package.json)). D. h. technisch arbeitet das Projekt **bereits auf der Motion-Library** — es fehlt nur der bewusste Skill-Aufbau und ggf. später die Paket-Umstellung `framer-motion` → `motion` (kosmetisch, jederzeit machbar, kein Druck).
- Import-Pfad im Code aktuell überall `from 'framer-motion'` — funktional identisch, muss nicht sofort migriert werden.

**Wo Motion-Anteile bereits implizit benutzt werden (Referenz-Muster im Repo):**

| Fundstelle                                                                                | Muster                                                                                          |
| :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| [`src/app/games/page.tsx:198-214`](../src/app/games/page.tsx)                             | `motion.div layout` + `AnimatePresence mode="popLayout"` beim Refiltern des Game-Grids          |
| [`HeroCinematicShowcase.tsx:69-95`](../src/components/home/herocinematicshowcase.tsx)     | `useMotionValue`/`useSpring`/`useTransform` Cursor-Parallax (Kategorie 3+7)                     |
| [`LobbyAmbientBackground.tsx:159-280`](../src/components/home/lobbyambientbackground.tsx) | `prefers-reduced-motion`-Gate (Kategorie 9)                                                     |
| Audit-Befunde in `03-frontend-lobby.md`                                                   | Spring-Fragmentierung (350/25, 450/28 statt SOP-04-Standard) — zeigt: Werte wild, Konzept fehlt |

**Interpretation:** Die Kategorien 1/5/6 sind im Projekt bereits „versehentlich" vorhanden; die Lücke ist Wissen, nicht Code. Die Tiefen-Kategorien (3, 4, 7, 8) sind noch praktisch unberührt.

---

## 3 — Kernkonzepte je Unterkategorie (Kurz-Fibel)

> Nur das Entscheidende pro Kategorie — für Tiefe gilt der Doku-Link in Abschnitt 1.

1. **Motion Components & Basics** — `motion.`-Prefix statt HTML-Tag, dann `initial`/`animate`. Key-Insight: Animationswerte gehören in Props, nicht in CSS-Transitions.
2. **Transitions & Springs** — Zwei Familien: `tween` (deterministisch, Dauer) und `spring` (physikalisch, `stiffness`/`damping`). Casino-Standard laut SOP 04 §4: `spring` mit `400/25`, `bounce: 0.4` für Win-Overlays; abweichende Werte sind Befund, nicht Stil.
3. **Gestures** — Pointer-basierte Interaktionen binden Werte an `useMotionValue` + `useSpring`, nie an `useState` (Re-Render pro Frame = Befundmuster aus dem Lobby-Audit, Befund 1).
4. **Scroll-Animationen** — Zwei Typen mit Trennschärfe: _scroll-triggered_ (`whileInView`, `viewport={{ once: true }}`) vs. _scroll-linked_ (`useScroll` → `scrollYProgress` → `useTransform`). Parallax = mehrere Layer mit unterschiedlichen Multiplikatoren.
5. **Layout-Animationen** — Ein `layout`-Prop animiert jedes Layout-Change aus jedem Render. `layoutId` verbindet über Komponentengrenzen (Tab-Indikator → Modal). Pitfalls: Layout-Änderungen über `style`/`className`, nie `whileHover`; `layoutScroll`/`layoutRoot` bei Containern.
6. **Exit-Animationen** — `AnimatePresence` hält Elemente im DOM bis Exit fertig. Modi: sync (default), `popLayout` (Listeneinträge entfernen sich, Rest rückt springend nach), `wait` (Sequenzen).
7. **Motion Values & Derivation** — `useTransform(mv, [in], [out])`, mehrere Quellen kombinieren, `useMotionValueEvent` für Aktionen bei Wertgrenzen (z. B. Scroll-Richtung). Kernidee: Animation läuft komplett außerm State.
8. **Independent Transforms & Performance** — Nur `transform`/`opacity`/`filter` animieren; `will-change` sparsam; `MotionScore`-Tooling existiert. Layout-Props in `animate` sind der klassische ADR-Fehler.
9. **Reduced Motion** — Projekt-Muster existiert (`LobbyAmbientBackground`); Standardisierung über `useReducedMotion` statt handgestricktes MatchMedia.
10. **Integration** — `'use client'`-Grenzen (Next.js App Router), Bundle ~12–18 kb Gzip (im App-Seiten-Budget von 300 kb), Import-Pfad-Frage `framer-motion` vs. `motion/react` als bewusste Ablage-Entscheidung.

---

## 4 — Testing-Ground: Seitenwahl

| Kandidat                                                                        | Eignung als Motion-Testfeld                                                                                                                                                                                                    | Bewertung      |
| :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| **`/games`** ([`src/app/games/page.tsx`](../src/app/games/page.tsx))            | Bietet alle Übungsfelder in einer Page: Kategorie-Tabs (→ `layoutId`), Grid-Refilter (→ Exit + `popLayout`), Cards (→ Hover-Springs/Gestures), Ribbon (→ Motion Values), alles isoliert, kein Datenrisiko, kein Wallet-Kontakt | (**gewählt**)  |
| Leaderboard ([`src/app/leaderboard/page.tsx`](../src/app/leaderboard/page.tsx)) | Podium + Stream-Table attraktiv für Zahlen-Motion, aber live-datengetrieben und Bestandteil laufender Doku-Ablage                                                                                                              | zurückgestellt |
| „My Bets"                                                                       | Existiert als eigene Seite **nicht** — Bets-UI verteilt sich auf Store-Feed/`LiveActivityFeedV2`                                                                                                                               | kein Ziel      |

**Begründung:** `/games` ist die einzige Kandidatin, die ohne Datenmodell-Änderung, ohne Wallet-Berührung und ohne Doku-Refaktor jede der 10 Unterkategorien üben lässt — und Motion-Anteile sind dort bereits gerahmt (Grid + AnimatePresence), d. h. wir verbreitern statt zu verankern.

---

## 5 — Fünf Einführungs-Empfehlungen (auf `/games`)

Reihenfolge = sinnvoller Lernpfad (einfach → komplex); jeweils mit Unterkategorie-Link aus Abschnitt 1.

1. **Tab-Indikator mit `layoutId` (Kategorie 5):** Die aktive Filter-Pill bekommt ein `motion.rect`-Underlay mit `layoutId="activeFilter"` — ein Mount, alle Tabs shared-animiert. Kleinster saubere Shared-Element-Übergang.
2. **Grid-Refilter mit Exit-Animationen (Kategorie 6):** Die bestehende `AnimatePresence mode="popLayout"`-Struktur gezielt nutzen: entfernte Cards mit definiertem `exit` (scale + fade, `stiffness`-getuned gegen SOP 04), verbleibende mit `layout`-Spring nachrücken lassen. Lerneffekt: `popLayout`-Mechanik wirklich verstehen statt „funktioniert".
3. **Scroll-Triggered Entrance-Stagger (Kategorie 4):** `whileInView` + `viewport={{ once: true }}` auf den Cards, Kinder-Stagger via `transition.staggerChildren` — Mobile-Benefit: kein „Alles springt beim Mount" mehr.
4. **Card Hover: Gestures + Independent Transforms (Kategorien 3 + 8):** Der 3D-Tilt/Speccular der `ElevatedGameCard` auf `useMotionValue` + `useSpring` umstellen (Pointer-Tracking ohne Re-Render) und Tilt-X/Y separat transformieren. Direkter Lern-Transfer zum Lobby-Revamp (dort ist derselbe Befund dokumentiert).
5. **Live-Win-Ribbon als Scroll-Kontext (Kategorie 7):** Ribbon/Progressive-Wert an ein `useTransform` koppeln — z. B. Ribbon-Slide beim Kategorienwechsel oder Scroll-Highlight — um Motion Values in einer **keine Re-Render erzeugenden** Pipeline zu üben, bevor sie an Echtzeit-Daten im Feed landen.

**Bewusst nicht in v1:** Drag-Gestures mit echtem Drag (Mobile-Zielkonflikt mit Scroll), Text-Animation (Motion+-Doku) und View-Transitions-API-Themen — später nach Level-Aufbau.

---

## 6 — Ausgeführter Stand (2026-08-29, `/games-2` Motion-Lab)

**Route:** `src/app/games-2/page.tsx` (+ `_components/`), isolierte Bare-Sandbox per `ClientShell` + Public-Route in `src/proxy.ts` (kein Auth/Shell, siehe `xx_docs/09` §2).

**Runde 1 — die 5 ursprünglichen Empfehlungen:**

| #   | Umsetzung                                                                                    | Datei                                            | Verifikation                                                                      |
| :-- | :------------------------------------------------------------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------- |
| 1   | Tab-Pill als `layoutId="games2-active-tab"` Shared Element                                   | `MotionFilterTabs.tsx`                           | Tab-Klick → Pill wandert (Screenshot)                                             |
| 2   | Grid-Refilter mit definiertem `exit` + `AnimatePresence mode="popLayout"`                    | `page.tsx` + `TiltGameCard.tsx`                  | Filter „TABLE" → nur Roulette/Blackjack                                           |
| 3   | `whileInView`-Entrance + Index-Stagger, `viewport once`                                      | `TiltGameCard.tsx`                               | Cards staffeln beim ersten Sichtkontakt                                           |
| 4   | Tilt/Glare voll über `useMotionValue`/`useSpring`/`useMotionTemplate`, 0 Re-Render pro Frame | `TiltGameCard.tsx`                               | Hover: Overlay + Tilt sichtbar                                                    |
| 5   | Scroll-Progress-Aura (`useScroll`→`useSpring`→`scaleX`) + Header-Parallax                    | `ScrollProgressAura.tsx`, `ScrollReactiveHeader` | matrix gemessen: 0.4576 bei Fortschritt 0.4525; Header −6.25 px bei 100 px Scroll |

**Runde 2 — fünf weitere Potenziale (nach SOP 02):**

| #   | Potenzial                                                                                                                       | Datei                                           | Verifikation                                                    |
| :-- | :------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------- | :-------------------------------------------------------------- |
| 6   | Zahlen-Rollup via Motion-Value-Kind (`springs.counterRoll`)                                                                     | `RollUpNumber.tsx`                              | „YOUR ROUNDS" tickt ohne Re-Render                              |
| 7   | Header-Entrance-Choreografie (`staggerVariants` aus Tokens)                                                                     | `page.tsx`                                      | Badge → H1 → Untertitel staffeln                                |
| 8   | Scroll-Parallax-Orbs, 2 Layer mit gegenläufigen Multiplikatoren (`clamp: false`)                                                | `ParallaxOrbs.tsx`                              | matrix −19.32 / +9.66 bei Scroll 207                            |
| 9   | Magnetischer CTA mit Motion Values (Bewusst anders als `ui/Magnetic.tsx`, das useState je Mousemove nutzt — Audit-Befundmuster) | `MagneticCta.tsx`                               | matrix (3.79, 2.66) gegen Soll (3.96, 2.8)                      |
| 10  | Keyboard-Quick-Launch-Gold-Flash vor Navigation                                                                                 | `TiltGameCard.tsx` (Flash-Overlay) + `page.tsx` | Taste „1" → Flash-Fade (Opacity 0.24 gemessen) → `/games/crash` |

**Visuelle/codeseitige Befunde & Fixes in diesem Schritt:**

| Befund                                                                                                                  | Fix                                                                              |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| Inaktive Tabs ohne Hintergrund → Browser-Default weiß, Text unlesbar                                                    | Explizites Glass-Background `rgba(255,255,255,0.03)` + Border                    |
| `isMobile` bleibt in Bare-Sandbox immer `false` (Store-Wert wird nur in `MainLayout` gesetzt) → Desktop-Grid auf Mobile | Lokaler `matchMedia`-Hook `(max-width: 1023.98px)` identisch zu `MainLayout.tsx` |
| Roll-up ohne Reduced-Motion-Gate                                                                                        | `useReducedMotion` → statischer Wert                                             |
| Ungenutzte Imports (2×)                                                                                                 | Entfernt                                                                         |

**Verifikation gesamt:** typecheck ✅ · lint ✅ (0 Errors; 18 Alt-Warnungen, keine in `games-2`) · Tests 154 Dateien / 1185 bestanden ✅ · Screenshots Desktop 1440 (Voll + Sektions-Cuts), Mobile 375, Hover-, Scroll- und Keyboard-Zustände ✅.

---

## 6a — V2-Rebuild „Editorial Cinematic Lab" (2026-08-29, nach Jans Feedback)

**Anlass:** Jans Befunde zu Runde 1+2: (1) zu marginal gegenüber `/games`, (2) Spielname „eingeklemmt" zwischen Bild und Preiszeile, (3) zu starke Orientierung am Bestand → freier Entwurf gefordert. Kausalanalyse + Meilensteine: `02-1_motion_lab_games2_v2.md`.

**Neue Komposition:** eigene fixe Topbar („MOTION LAB", %SCROLLED, integrierter Gold-Progressstrich) · cinematischer Hero (Display-Typo `clamp(2.6rem, 6.5vw, 4.6rem)`, zweizeilig, Gradient-Zeile, Scroll-Parallax, Rollup-Stats) · asymmetrisches 6-Spalten-Bento (Featured 4×2, gestapelte Seiten-Tiles, Refilter formt das Bento live um) · **Quick-View-Modal als layoutId-Shared-Element** (Medienrahmen fliegt Tile→Dialog→zurück, ESC/Backdrop schließt, CTA navigiert; Keyboard 1–6 öffnet den Quick-View mit Gold-Flash statt direkt zu navigieren) · fixierter Spacing-Rhythmus auf der Kachel: **18 px Card-Padding · 12 px Medien→Titel · 10 px Titel→Meta** (Titel hat eigene Zeile mit Mindesthöhe 26/34 px).

**Unterkategorien ↔ Einbauort in V2:**

| #   | Unterkategorie                       | Einbauort V2 (Datei)                                                                                                                                    |
| :-- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Motion Components & Basics           | Hero-Staffelung `staggerVariants` (`MotionHero.tsx`), Tile-Entrance `whileInView` (`BentoTile.tsx`)                                                     |
| 2   | Transitions & Springs                | Alle Interaktions-Federn aus `motion-tokens.ts` (`springs.standard/gentle/counterRoll`, `MotionLabTopbar.tsx`, `QuickViewPanel.tsx`)                    |
| 3   | Gestures                             | Tile-Tilt/Glare via Pointer-Motion-Values (`BentoTile.tsx`), magnetischer CTA (`MagneticCta.tsx` in QuickViewPanel)                                     |
| 4   | Scroll-Animationen                   | Topbar-Progress + %Text (`MotionLabTopbar.tsx`), Hero-Parallax (`MotionHero.tsx`), Orbs 2-Layer (`ParallaxOrbs.tsx`)                                    |
| 5   | Layout-Animationen                   | `layoutId="g2-media-{id}"` Tile→QuickView (`BentoTile.tsx` ↔ `QuickViewPanel.tsx`), Bento-Refilter `layout`, Tab-Pill (`MotionFilterTabs.tsx`)          |
| 6   | Exit-Animationen                     | `popLayout` beim Grid, Backdrop/Panel-Exit (`QuickViewPanel.tsx` + `QuickViewLayer`)                                                                    |
| 7   | Motion Values & Derivation           | Counter-Rollup (`RollUpNumber.tsx`), `percentText = useTransform(progress)` als Text-Kind (`MotionLabTopbar.tsx`), Glare-Template (`useMotionTemplate`) |
| 8   | Independent Transforms & Performance | Tilt ohne Re-Render pro Frame, transform-only Orbs/Parallax, Zahlen `tabular-nums`                                                                      |
| 9   | Reduced Motion & A11y                | Gates in Tilt, Magnet, Orbs, Rollup, Scroll-Cue; Dialog `role="dialog"` + `aria-modal`, ESC-Close; Button-Focus-Ring wiederhergestellt                  |
| 10  | Integration & Architektur            | Bare-Sandbox-Kette (`ClientShell` + `src/proxy.ts` PUBLIC_ROUTES), Token-Quelle `motion-tokens.ts` als einzige Spring-Autorität                         |

**Gefundene & behobene Befunde in V2:**

| Befund                                                                                                                                                               | Fix                                                                             |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Motion-Invariant-Crash:** 3-Keyframe-Loop (`y: [0,6,0]`) mit Spring-Transition wirft „Only two keyframes currently supported with spring" → Render-Tree bricht ein | Tween statt Spring für Keyframe-Loops (`MotionHero.tsx` Scroll-Cue)             |
| Featured/Seiten-Tiles shrink-to-fit (179–292 px statt Soll-Breite) — `motion.article` ohne `width`                                                                   | `width: '100%'` am Article + Span-Wrapper                                       |
| Featured-Tile: ungenutzter Leerraum unten (fixe Aspect-Ratio)                                                                                                        | Medienrahmen bei Featured `flex: 1` statt `aspectRatio`                         |
| Quick-Launch navigierte sofort weg (V1)                                                                                                                              | Taste 1–6 öffnet jetzt bewusst erst den Quick-View; Navigation via CTA im Panel |

**Verifikation V2:** typecheck ✅ · lint 0 Errors ✅ · Tests 154 Dateien / 1186 bestanden ✅ · Spacing deterministisch gemessen (media→title 12 px, title→meta 10 px, Button-Padding 18/18/16, alle 6 Kacheln) ✅ · Bento-Geometrie (Featured 874 px = 4/6×2 Zeilen; Seiten-Tiles 428 px = 2/6) ✅ · QuickView open/ESC-close/Keyboard-1–6 ✅ · Filter (SLOTS → 1 Tile) ✅ · Mobile 375 ohne `overflowX` ✅ · Progress-Binding (scaleX 0→0.9901, „99% SCROLLED" synchron) ✅ · Hero-Parallax exakt Soll (54.30 px bei scrollY 300 = 72×300/400) ✅ · Differenz-Check gegen Befund (1): eigene Topbar + Hero + asymmetrisches Bento + Quick-View = 4 klar sichtbare Neuerungen ✅.

**Wichtigste Motion-Lektion aus V2 (durable):** Spring-Transitions vertragen **nur 2 Keyframes** — Loops wie `animate={{ y: [0, 6, 0] }}` gehören immer auf Tween/Ease. Zweitens: bei `layoutId`-Shared-Elements bleibt die Quell-Kopie im DOM gemountet; Framer Motion macht sie beim Crossfade automatisch unsichtbar und nutzt sie als Rückkehr-Ziel — sie nicht bedingt abzweigen.

---

## 6b — V3: Full-Viewport-Komposition (2026-08-29, nach Jans Feedback zu V2)

**Feedback:** Featured-Tile prominent aber „zu groß" · Hero-Parallax ließ Headline über die Subline driften · **Kernanforderung: komplette Seite above the fold, kein Scrollen**.

**Umsetzung:**

| Änderung                          | Details                                                                                                                                                                                                                |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 100-dvh-Komposition               | Root `height: 100dvh` + `overflow: hidden` (Desktop); Flex-Stack Topbar → Hero → Ribbon → Filter → Bento; Bento `flex: 1` + `gridTemplateRows: repeat(3, 1fr)` — **kein Scroll: scrollH 900 = clientH 900 (gemessen)** |
| Parallax entfernt                 | Hero ohne `useScroll`-Kopplung — die Überlappungsquelle ist eliminiert, Entrance-Choreografie (Variants) bleibt                                                                                                        |
| Scroll-Progress → Titel-Indikator | Topbar zeigt `{n} TITEL · {KATEGORIE}` (animierter Key-Wechsel statt %SCROLLED)                                                                                                                                        |
| Featured verkleinert              | Crash 4×2 → **3×2** (660 px statt 874 px), gestapelte 3×1-Tiles daneben, untere Reihe drei 3er-Slots — prominent, aber zurückhaltend                                                                                   |
| Fluid-Medien                      | Medienrahmen füllt bei **allen** Kacheln die Grid-Resthöhe (`flex: 1`), keine festen Aspect-Ratios                                                                                                                     |
| Orbs                              | Scroll-Drift → autonome Tween-Loops (`repeat: Infinity, ease: 'easeInOut'`)                                                                                                                                            |
| Mobile                            | Scrollt weiter (6 Kacheln in 100 dvh nicht darstellbar); kein OverflowX gemessen                                                                                                                                       |

**Verifikation V3:** Desktop 1440×900: `scrollHeight 900 = clientHeight 900` ✅ · keine Headline-Überlappung (kein Transform mehr am H1) ✅ · Grid-Geometrie (Featured 660×260 = 3×2; untere Reihe 3×435 px) ✅ · QuickView open/ESC ✅ · Mobile 375: scrollt, `overflowX false` ✅ · lint/typecheck: `games-2`-Scope 0 Befunde ✅ (restliche Repo-Fehler stammen aus einer parallelen Sound-/Bento-Arbeit, nicht aus diesem Task).

**Lektion (durable):** „Above the fold"-Kompositionen machen Scroll-gekoppelte Motion (Progress, Parallax, Orbs) obsolet — Motion verlagert sich dann vollständig auf Entrance (Variants), Gestures (Tilt/Magnet), Layout-Animationen (layoutId, popLayout) und Motion Values (Rollups, Indikator-Wechsel).

---

## 6c — V4 „Living Hero" (2026-08-29, aus 6 Optionen gewählt: B + D + F)

**Feedback:** Hero „zu statisch/langweilig", Header-Darstellung verbesserungswürdig. Aus 6 vorgestellten Optionen wählte Jan **B (Pointer-reaktive Headline) + D (Kinetic Marquee) + F (Hero-Kachel-Spotlight)**; Planung: `02-2_motion_lab_v4_living_hero.md`.

**Umsetzung (alle `src/app/games-2/_components/`):**

| Option      | Datei                        | Mechanik                                                                                                                                                                                                                                                                                       |
| :---------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B           | `KineticHeadline.tsx` (neu)  | Geteilte Pointer-Motion Values (Viewport-Koordinaten) → pro Wort `useTransform` (Rect-Zentrum, Distanz-Falloff r=200 px, max ±9 px + scale-Lift 1.04) → per-Wort-Springs 300/22/mass 0.5. **0 Re-Render pro Frame.** Zweizeilig, `clamp(2rem, 4.2vw, 3.4rem)`, Gradient-Wort bleibt Clip-Text. |
| D           | `CategoryMarquee.tsx` (neu)  | `useAnimationFrame` treibt x-MotionValue (~28 px/s); die **Geschwindigkeit selbst ist ein Spring** (90/18) — Hover deceleriert sichtbar auf 0, Verlassen beschleunigt zurück. Wrap via `x % -halfWidth` (Content doppelt gerendert), Mask-Fades an den Rändern.                                |
| F           | `HeroSpotlight.tsx` (neu)    | Crash verlässt das Grid: Karte im Hero rechts mit Puls-Glow (scale/opacity-Tween-Loop), LIVE-Chip (Opacity-Loop), MULTIPLIER-WINDOW-Progress (linear Loop), Tilt/Glare. Medienrahmen `layoutId="g2-media-crash"` — Quick-View fliegt vom Spotlight auf und kehrt zurück.                       |
| Komposition | `page.tsx`, `MotionHero.tsx` | Hero-Row: Headline links, Spotlight rechts (340 px). Bento: **5 Tiles, 2 Zeilen** ([0][1] span 3, [2][3][4] span 2), dadurch mehr Höhe für Hero. Marquee zwischen Hero und Ribbon. Stats als kompakter Strip unter der Subline.                                                                |

**Verifikation V4 (gemessen):** Kein Scroll: 1440×900 `scrollH 900 = clientH 900` ✅ · **1366×768 ebenfalls 768=768** ✅ · Marquee läuft ~29 px/s (Δ−14,5 px/500 ms), Hover-Deceleration 28 → 3,3 px/s, Resume ~29 px/s ✅ · Headline-Magnet: Gradient-Wort hebt sich bei Pointer-Nähe (y −2,44 px), kehrt exakt auf 0 zurück ✅ · Puls-Glow-Loop (scale 1,005 → 1,036 → 1,031) ✅ · QuickView vom Spotlight öffnet („Crash Quick-View"), ESC kehrt ins Spotlight zurück ✅ · Grid-Geometrie: Spotlight 340×241, Zeile 1 zwei 660er, Zeile 2 drei 435er ✅ · Mobile 375: Spotlight unter der Headline, kein OverflowX, scrollt (V3-Entscheid) ✅ · typecheck/lint clean, **156 Testdateien / 1203 Tests grün** ✅

**Befunde während V4, direkt gefixt:**

1. React-Style-Warnung (shorthand/non-shorthand-Konflikt `overflow` + `overflowX` am Root) → ersetzt durch `overflowX` + `overflowY` ohne Shorthand.
2. Synthetischer `pointerenter`-Dispatch triggert Reacts delegierte Handler nicht — Verifikation via `pointerover` (React leitet enter/leave von over/out ab), kein Code-Fix nötig.

**Lektion (durable):** Bewegte Geschwindigkeit als Spring statt hartem State-Toggle (`hover ? 0 : SPEED`) — die De-/Akzeleration _ist_ die Animation und transportiert Physik, die ein CSS-Keyframe-Marquee nicht kann. Zweite Lektion: Shared Elements (`layoutId`) funktionieren auch von außerhalb des Grids (Hero ↔ Dialog), solange Quelle und Ziel zur selben Layout-Tree-Sitzung gemountet sind.

---

## 6d — V5 „PULS": Partikelfeld + Typo (2026-08-29, isolierte Sandbox `/lab`)

**Auslöser:** Awwwards-Gap-Analyse (B1 „keine tragende Design-Idee" als Kernbefund), dann zweistufiges Option-Gate → Gate 1: Option C „WebGL-Hero + Motion-Shell" → Gate 2: Variante B „Partikelfeld + Typo" (Vorbild TRIONN). Planung (Execution-Ready, mit 4-Perspektiven-Fan-out-Review): [`02-3_motion_lab_v5_awwwards_gap.md`](./02-3_motion_lab_v5_awwwards_gap.md) → [`02-4_motion_lab_v5_particle_typo.md`](./02-4_motion_lab_v5_particle_typo.md).

**Abgrenzung zu allem Vorherigen:** `/lab` ist eine **eigene Bare-Sandbox** (`ClientShell`: `isParticleLab`, `proxy.ts`: `/lab(.*)`), bewusst NICHT an SOP 04/17 angepasst. Kernidee: **„Der Katalog ist ein Partikelsystem"** — die Seite besteht aus EINEM GPU-Partikel-Feld (three.js `THREE.Points` + Custom ShaderMaterial), Typo wird aus dem Feld geboren, Katalog-Titel sind Partikel-Masken. Signature Moment „Die Wette": Halten = Multiplier steigt (Feld strafft sich), Loslassen = CASH OUT (goldener Impuls), zu lange = BUST (roter Zerfall; Rot existiert nur dafür).

**Neue Technik-Dimensionen (gegenüber /games-2):**

- **WebGL via three + @react-three/fiber** (kein drei): `Points` statt Mesh, weiche Sprites, `AdditiveBlending`, `depthWrite: false`, keine CPU-Sortierung.
- Morph-Architektur: `aSource`/`aTarget`-Attribute + `uMorph`-Uniform — Zielwechsel = **einmalige** Buffer-Uploads (`MorphField.beginMorphTo` berechnet auf CPU die Zwischenposition → Kontinuität ohne Sprung), niemals Uploads pro Frame.
- Typo-als-Maske: Offscreen-2D-Canvas rendert Maskentext (Bricolage Grotesque 800), Pixel-Sampling (Alpha-Schwelle + Jitter) → normalisierte Weltebene (`_lib/shapeTargets.ts`, pure).
- Farbwelten als State-Maschine im Fragment-Shader: Gold=Ruhe/Gewinn, Weiß=Momentum, Rot=nur BUST; Gold ist einzige Bloom-Emissive.
- WebGL-Recovery: `webglcontextlost/restored` → nahtloser DOM-Only-Downgrade (`useWebGLRecovery`), `resolveCanvasMode` fail-closed (unbekannte Lage → DOM-Only).
- ESLint-Import-Grenze: `three`/`@react-three/*` nur in `src/app/lab/**` (`no-restricted-imports` Override).

---

## 7 — Offene Punkte & Nächste Schritte

1. **Fakten-Abgleich Paket:** framer-motion@13.1.1 ist laut motion.dev der Legacy-Kanal derselben Library; ob wir in einem Schritt auf `motion`-Import migrieren, ist eine Ablage-Entscheidung — kein technischer Zwang.
2. **Jan-Wünsche:** Niveau-Selbstevaluierung (Abschnitt 1) einmal ehrlich füllen → Bottleneck-Kategorie wählen.
3. **Startpunkt-Empfehlung:** Empfehlung 1 (Tab-Indikator) als erste Übung — klein, sichtbar, `layoutId`-Konzept direkt übertragbar auf Modals.
4. **Bezug Lobby-Revamp:** Empfehlung 2 und 4 beheben parallel dokumentierte Befunde aus `03-frontend-lobby.md` (Spring-Fragmentierung, useState-Tilt) — Doppel-Effekt Lernen + Befundabbau.
