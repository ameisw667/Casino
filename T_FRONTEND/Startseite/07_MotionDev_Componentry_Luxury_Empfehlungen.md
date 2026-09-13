# 07 — Startseite: MotionDev & Componentry Luxury-Empfehlungen

> **Status:** Geplant · **Stand:** 08.09.2026 · **Owner:** LLM · **Execution:** Nicht gestartet / nicht beauftragt
> **Scope:** Konkrete Motion- und Componentry-Empfehlungen für die Lobby-Startseite inklusive Vorher-/Nachher-Belegen und Rücknahmevertrag.
> **Navigation:** [Scorecard](../Startseite.md) · [Motion-Basisplan](06_Motion_Interaktion/Plan.md) · [Responsive-Plan](05_Responsive_Design/Plan.md).

## 1 — Designentscheidung

Die Startseite erhält keine Sammlung isolierter Wow-Effekte. Das Zielbild ist eine kontrollierte Choreografie: **ein bewegtes Featured-Game, ein ruhiger Ambient-Akzent und eindeutige, steuerbare Zustandswechsel**. Motion for React ist die technische Engine; Componentry liefert ausschließlich visuelle Referenzen. Keine Komponente wird blind kopiert, keine Premium-Lizenz vorausgesetzt.

**Versionshinweis:** [package.json](../../package.json) führt `framer-motion ^13.1.1`; ältere Projektdokumente nennen teilweise v12. Vor späterer Execution wird die aufgelöste Version verifiziert. Dieser Plan autorisiert weder eine Paketmigration zu `motion/react` noch die Installation von Componentry.

## 2 — Eingefrorener Status quo

| Viewport | Gesamtansicht | Zugehöriger Crop | Zweck | Status |
| --- | --- | --- | --- | --- |
| Desktop 1440 × 1024 | [Status quo Desktop](Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) | [Hero Crop Desktop](Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) | Hero-Dichte, Showcase-Kante, Bento-Gewichtung | Eingefroren |
| Mobile 390 × 844 | [Status quo Mobile](Beweise/2026-09-08/00_status-quo_mobile_390x844.png) | [Hero Crop Mobile](Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png) | Claim, Bonus, Featured und Dock im ersten Viewport | Eingefroren |

Die Bilder stammen von `http://localhost:3015/` am 08.09.2026. Sie belegen den sichtbaren lokalen Zustand, nicht Datenwahrheit, Performancewerte oder einen Produktionszustand.

## 3 — Empfehlungstabelle für die Startseite

| # | Touchpoint | Aktueller Zustand | Was verändert sich | Visueller Beweis vorher | Visueller Beweis nachher | Komponente | Referenz | Planungsverteilung | Execution-Typ | Score-Hebel | Betroffene Dateien |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M-01 | Motion-Policy | Dauerpartikel, Canvas, Pointerdrift und lokale Guards reagieren nicht einheitlich auf Präferenzwechsel. | Lokaler Vertrag für Reduced Motion, Pointerfähigkeit, Sichtbarkeit und Pausegründe. Bereits laufende Dekoration endet sauber; Inhalt bleibt sichtbar. | [Desktop](Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) | Ausstehend: gleiche Matrix, zusätzlich Reduce an/aus während Interaktion. | `MotionConfig`, `useReducedMotion`, bestehendes `useSafeMotion`. | [MotionConfig](https://motion.dev/docs/react-motion-config) · [A11y](https://motion.dev/docs/react-accessibility) | Fundament für MI-02/03/05; keine neue Markenanimation. | K2 lokal; globaler Provider nur mit K3-Review. | Motion hoch · Responsive mittel. | [Hero](../../src/components/home/HeroCinematicShowcase.tsx), [Ambient](../../src/components/home/LobbyAmbientBackground.tsx), [SafeMotion](../../src/hooks/useSafeMotion.ts) |
| M-02 | Hero-Eintritt | Partikel, Tilt, Scroll-Tilt und große Claim-/CTA-Zone konkurrieren im ersten Eindruck. | Ein kurzer Gruppen-Reveal von Claim, Bonus und Featured. Die H1 bleibt stabil; kein Letter-Scatter, keine Dauerbewegung. | [Hero Desktop](Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) | Ausstehend: Hero direkt nach Load und nach Ruhe. | Motion Variants + `useInView`; Componentry `kinetic-text-reveal` nur als Timing-Idee. | [useInView](https://motion.dev/docs/react-use-in-view) · [Componentry](https://componentry.dev/docs) | MI-01, IH-01/02, KR-04. | K1/K2, lokaler Hero. | Informationshierarchie mittel · Motion mittel. | [Hero](../../src/components/home/HeroCinematicShowcase.tsx), [Headline](../../src/components/home/hero-cinematic/HeroHeadlineColumn.tsx) |
| M-03 | Showcase-Tabwechsel | Fünf Spieltabs wechseln Inhalt; die Hero-Choreografie für Exit, Fokus und Unterbrechung ist nicht definiert. | Bild und Metadaten wechseln sequenziell, kurz und unterbrechbar. Aktiver Tab bleibt verständlich; Motion suggeriert keine Live-Runde. | [Hero Desktop](Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) | Ausstehend: Crash → Blackjack → Crash per Maus und Tastatur. | `AnimatePresence mode="wait"`, stabile Keys, vorhandene Tokens. | [AnimatePresence](https://motion.dev/docs/react-animate-presence) | MI-08/09, IH-10. | K2, lokaler Showcase. | Motion hoch · Informationshierarchie mittel. | [Showcase](../../src/components/home/hero-cinematic/GameShowcaseCard.tsx), [Config](../../src/components/home/hero-cinematic/config.ts) |
| M-04 | Featured-Crash-Card | Tilt, Ken-Burns, Glare, Scale und iconhaltiger Play-Pill liegen in einer dominanten Card. | Richtungsgebundener Goldreflex nur auf der Bildlage. Text, Fokusrahmen und Text-CTA bleiben geometrisch stabil. Bei Touch/Reduce keine Pointerillusion. | [Desktop](Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) | Ausstehend: vier Hoverrichtungen, Keyboard, Touch und Reduce. | MotionValues + `useMotionTemplate`; adaptiertes `HoverTransition`-Prinzip ohne Standardfarben/Icons. | [Hover Transition](https://componentry.dev/docs/components/hover-transition) | MI-03/07/10, KR-08, RD-06. | K2, nur Featured-Artwork. | Motion hoch · Komposition/Responsive mittel. | [BentoArcadeCells](../../src/components/home/bento/BentoArcadeCells.tsx), [Tilt](../../src/hooks/useTiltGlare.ts) |
| M-05 | Bento-Szenenfolge | Einzelkarten revealen unterschiedlich; der erste Fold besitzt mehrere gleich laute Bewegungen. | Featured zuerst, danach Satelliten; einmalig, ohne visuelle Umordnung der DOM-Folge und ohne Dauerbewegung unterhalb des Folds. | [Desktop](Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) | Ausstehend: Desktop-/Mobile-Bildfolge beim Eintritt, danach Ruhe. | Stagger-Variants, `useInView`, bei echtem Reflow optional `LayoutGroup`. | [Layout animations](https://motion.dev/docs/react-layout-animations) | MI-01, IH-06/07, KR-03/04. | K2, lokaler Bento-Abschnitt. | Komposition/Motion mittel. | [BentoLobbyHome](../../src/components/home/BentoLobbyHome.tsx), [Arcade](../../src/components/home/bento/BentoArcadeCells.tsx) |
| M-06 | Jackpot als Ereignis | Jackpot, RTP und Payout stehen im Hero nebeneinander; ein ewiger Zähler würde die Signalflut verstärken. | Zahlen bewegen sich nur bei belegter Wertänderung, sonst Ruhe. Monospace/tabular und Demo-Kennzeichnung bleiben. | [Hero Desktop](Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) | Ausstehend: Änderung, Ruhe, Reduce und lange Zahl im selben Crop. | `useSpring` + `useTransform`; kein Motion+-`AnimateNumber` vorausgesetzt. | [MotionValue](https://motion.dev/docs/react-motion-value) · [Premium-Katalog](../../docs/frontend/13_motion_dev_complete_catalog.md) | MI-09, IH-05, KR-07. | K2, nur mit belegtem Datenvertrag. | Premium-Ton/Motion mittel. | [Jackpot](../../src/components/home/hero-cinematic/JackpotPulseCard.tsx), [Hook](../../src/hooks/useProgressiveJackpot.ts) |
| M-07 | Live-Stream | Auto-Rotation, per `width` animierter Fortschritt, gemischte Pausen und kuratierte Einträge stehen nebeneinander. | Ruhige Liste als Standard; Rotation nur mit Textsteuerung „Pausieren/Fortsetzen“, logisch getrennten Pausegründen und transformbasiertem Fortschritt. | [Desktop](Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) | Ausstehend: Nebenfokus, Mouseleave, Modal, Tabwechsel und Text-Pause. | `AnimatePresence`, `useReducedMotion`, `usePageInView` oder lokale Visibility-Beobachtung. | [Motion A11y](https://motion.dev/docs/react-accessibility) · [W3C Pause](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | MI-05/06/08/10, IH-10. | K2, lokaler Stream. | Motion hoch · Glaubwürdigkeit mittel. | [Stream](../../src/components/home/bento/LiveHighlightStream.tsx), [Modal](../../src/components/home/HighrollerWinDetailModal.tsx) |
| M-08 | Ambient-Spike | Canvas, Parallax und Lichtlagen sind bereits aktiv; ein Vollseiten-Shader würde die Komplexität erhöhen. | Nur Hero-gebundener, gedrosselter Obsidian-/Gold-Ambient mit statischem Poster-Fallback – erst nach GPU-/A11y-Budget. | [Hero Desktop](Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) | Ausstehend: Normal, Reduce, Mobile und Profilertrace. | Componentry `liquid-chrome` nur als Stilreferenz. | [Componentry docs](https://componentry.dev/docs) · [Motion performance](https://motion.dev/docs/react) | MI-01/02/05/10, KR-09. | Separater K2-Spike; keine Lizenz-/Paketannahme. | Bildsprache potenziell mittel · Motion-Risiko hoch. | [Ambient](../../src/components/home/LobbyAmbientBackground.tsx), [Parallax](../../src/components/home/ParallaxImageBackground.tsx) |
| M-09 | Dialogwechsel | Der Highroller-Dialog besitzt Exit-Props, wird jedoch vor der eigenen Presence-Grenze bedingt entfernt. | Schließen beendet sichtbar, ohne Fokusverlust oder unsichtbare Klickebene; Fokus kehrt zum auslösenden Textcontrol zurück. | Kein simuliertes Gewinn-Modal für den Beleg öffnen. | Ausstehend: neutraler Fixture-Beleg mit Öffnen/Schließen. | `AnimatePresence`, stabile Keys, Modal-Varianten. | [AnimatePresence](https://motion.dev/docs/react-animate-presence) | MI-08, RD-06/07. | K2, lokale Modalgrenze. | Motion mittel · Fokus hoch. | [Modal](../../src/components/home/HighrollerWinDetailModal.tsx), [Stream](../../src/components/home/bento/LiveHighlightStream.tsx) |

## 4 — Bewusst ausgeschlossen

| Idee | Grund |
| --- | --- |
| `text-repel` auf der Hero-H1 | Cursorverdrängte Buchstaben schwächen den Claim und sind mit Reduced Motion unvereinbar. |
| Magnetic Dock | Die aktuelle Regel verlangt iconfreie berührte Casino-Flächen; ein Icon-Dock würde Kategorie 9 vorwegnehmen. |
| Endlos-Ticker oder permanenter Scramble | Mehr Bewegung ohne bessere Orientierung; widerspricht M-07. |
| Fullscreen Liquid-Chrome | Kein GPU-/A11y-Nachweis; die Lobby hat bereits mehrere Hintergrundebenen. |
| Motion+ Premium als Standard | Kein Kauf, keine Lizenz und keine neue Abhängigkeit sind mit diesem Plan autorisiert. |

## 5 — Reihenfolge, Nachweis und Rücknahme

1. **M-01 zuerst:** Ohne verlässliche Policy keine neue sichtbare Bewegung.
2. **M-03–M-05:** Eine Hero-/Bento-Iteration erst nach Layoutfreigabe aus Plan04/05.
3. **M-06, M-07, M-09:** Nur mit wahrheitsgemäßen Zuständen und Fokus-/Pausebelegen.
4. **M-08 zuletzt:** Ausschließlich als gemessener Spike.

Vor jeder Execution kopiert das LLM die Vorher-Matrix. Danach speichert es neue Dateien unter `T_Frontend/Startseite/Beweise/YYYY-MM-DD/neuer-status-…`, verlinkt sie in der Scorecard und bewertet erst dann betroffene Scores neu. Bei negativer visueller Abnahme wird nur der zugehörige, abgegrenzte Execution-Diff zurückgenommen; Status-quo-Bilder und dieser Plan bleiben erhalten.

## 6 — Harte Grenzen und Abnahme

Nicht Scope: neue Icons, Navigation, Auth/Wallet/RNG, Componentry-Installation, Motion+-Kauf, neue Assets oder globale Shell-/Scroll-Umbauten.

Eine Empfehlung gilt erst nach späterer Execution als umgesetzt, wenn Normal, Reduced Motion, Keyboard, Touch und Tab-Inaktivität geprüft sind; Nachherbilder im identischen Viewport/Crop vorliegen; keine simulierte Auszahlung oder Live-Aussage durch Motion missverständlich wird; und `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` plus `git diff --check` dokumentiert sind.

Die 90+-Ziele der vier bestehenden Teilpläne bleiben Ziele nach Execution. Diese Datei erhöht keinen Score, solange Nachher-Belege und technische Abnahme fehlen.
