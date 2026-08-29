# 03 — Frontend Lobby Redesign: Editorial Bento Overhaul & Live-Feed-Systemisierung

> **Status:** 🔴 Geplant · **Stand:** 2026-08-29 · **Owner:** Jan + LLM · **Scope:** [`src/app/page.tsx`](../src/app/page.tsx) → [`HomeClientV2.tsx`](../src/components/home/HomeClientV2.tsx) und gesamter Unterbaum (Hero-Showcase, VIP-Teaser, Jackpot-Sektion, Live-Highroller-Ticker, Arcade-Grid, Live-Activity-Feed). Kein anderer Screen (kein Spiel, kein Admin, kein Auth-Flow).
> **Bezug:** [`xx_sop/15_workflow_frontend_taste_qc.md`](../xx_sop/15_workflow_frontend_taste_qc.md) · [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) · [`xx_sop/10_workflow_frontend_revamp.md`](../xx_sop/10_workflow_frontend_revamp.md) · [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md)
> **Ablage-Hinweis:** `xx_sop/10` §7 markiert `T_FRONTEND/` als historischen Ort ("kanonische Ablage heute zentral in `worldmap/` oder `docs/archive/`"). Diese Datei liegt hier auf Jans expliziten Wunsch (exakter Pfad + Dateiname im Auftrag genannt). Bei Bedarf später nach `worldmap/` migrierbar, siehe Abschnitt 10.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                         | Status                        | Nächster Schritt                           | Zuständigkeit |
| ------ | ------------------------------------------------------------------- | ----------------------------- | ------------------------------------------ | ------------- |
| L0     | Visuelles Audit Ist-Zustand (Phase 1, SOP 10)                       | 🟢 Verifiziert                | —                                          | LLM           |
| L1     | Erste 3-Optionen-Matrix (A/B/C, SOP 01)                             | 🟢 Verifiziert                | —                                          | LLM           |
| L2     | Jans Richtungsentscheidung: Hybrid A×B                              | 🟢 Erfasst (dieser Chat)      | —                                          | Jan           |
| L3     | Konzept-Elaboration Editorial Bento (dieses Dokument)               | 🟢 Ausgearbeitet              | Offene Entscheidungen (Abschnitt 7) klären | Jan           |
| L4     | Re-Audit / Selbstprüfung Runde 2                                    | 🟢 Durchgeführt (Abschnitt 6) | —                                          | LLM           |
| L5     | Primitiven-Bau (`GlassSurface`, `springTransition`, `useTiltGlare`) | 🔴 Geplant                    | Nach Freigabe Abschnitt 7                  | LLM           |
| L6     | Section-Migration auf Bento-Struktur                                | 🔴 Geplant                    | Nach L5                                    | LLM           |
| L7     | Responsive-/Motion-Audit & URL-Abnahme (Phase 5, SOP 10)            | 🔴 Geplant                    | Nach L6                                    | Jan + LLM     |

**Kein Code wurde in diesem Schritt verändert.** Dieses Dokument ist reine Planung (Phase 1+2 von `xx_sop/10`, plus Re-Audit).

---

## 2 — Ausgangslage: Audit-Ergebnisse Runde 1 (vollständig, mit Korrektur)

Referenzmuster korrekt umgesetzt (Stärken, beibehalten):

- [`HeroCinematicShowcase.tsx:69-95`](../src/components/home/HeroCinematicShowcase.tsx) — `useMotionValue`/`useSpring`/`useTransform` für Cursor-Parallax, SOP15§2-konform.
- [`LobbyAmbientBackground.tsx:159-280`](../src/components/home/LobbyAmbientBackground.tsx) — Partikel/Scroll komplett außerhalb React-State (reines Canvas/Ref), inkl. `prefers-reduced-motion`-Gate.

Verstöße/Schwächen (Datei-/Zeilenbezug):

|  #  | Befund                                                                                                   | Fundstelle                                                                                                                                                                                                                                                                                                                                             | SOP-Bezug                                                                                                |
| :-: | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
|  1  | `useState` statt `useMotionValue` bei kontinuierlichem Pointer-Tracking (`rotateX`/`rotateY`/`glare`)    | [InteractiveArcadeGrid.tsx:339-360](../src/components/home/InteractiveArcadeGrid.tsx) (`ArcadeGameCard`)                                                                                                                                                                                                                                               | SOP15 §2, harter Verstoß                                                                                 |
|  2  | Spring-Physik-Fragmentierung — 04§4 schreibt `400/25/bounce:0.4` vor                                     | [InteractiveArcadeGrid.tsx:425](../src/components/home/InteractiveArcadeGrid.tsx) (`350/25`), [ProgressiveJackpotSection.tsx:271](../src/components/home/ProgressiveJackpotSection.tsx) (`450/28`), [VipLiveStreamRail.tsx:181](../src/components/home/VipLiveStreamRail.tsx) (`220/25`)                                                               | 04 §4                                                                                                    |
| 2b  | **Neu in Runde 2 gefunden:** ein 4. abweichender Spring-Wert                                             | [LiveActivityFeedV2.tsx:189](../src/components/social/LiveActivityFeedV2.tsx) und `:318` (`type:'spring', damping:25, stiffness:300`)                                                                                                                                                                                                                  | 04 §4 (Runde 1 hat diese Datei nicht vollständig gelesen — siehe Abschnitt 6)                            |
|  3  | `tabular-nums` fehlt vollständig (0 Treffer im `home/`-Baum), stattdessen rohes `fontFamily:'monospace'` | [LiveHighrollerTickerBar.tsx:219](../src/components/home/LiveHighrollerTickerBar.tsx), [DailyTournamentTeaser.tsx:115/260/289](../src/components/home/DailyTournamentTeaser.tsx), [VipProgressTeaser.tsx:381](../src/components/home/VipProgressTeaser.tsx), [VipLiveStreamRail.tsx:328/353](../src/components/home/VipLiveStreamRail.tsx)             | 04 §3                                                                                                    |
|  4  | Glassmorphism weicht in 4 Varianten von der exakten 04§2-Spezifikation ab                                | [LiveHighrollerTickerBar.tsx:122-131](../src/components/home/LiveHighrollerTickerBar.tsx), [InteractiveArcadeGrid.tsx:126-133](../src/components/home/InteractiveArcadeGrid.tsx), [DailyTournamentTeaser.tsx:99-104](../src/components/home/DailyTournamentTeaser.tsx), [VipLiveStreamRail.tsx:138-149](../src/components/home/VipLiveStreamRail.tsx)  | 04 §2                                                                                                    |
|  5  | **Korrigiert in Runde 2:** ursprünglich als "3 redundante Live-Feeds" gewertet — siehe Korrektur unten   | —                                                                                                                                                                                                                                                                                                                                                      | siehe Abschnitt 5.4                                                                                      |
|  6  | Sechsfache Wiederholung "Eyebrow + H2 + Glass-Grid"                                                      | [InteractiveArcadeGrid.tsx:217-243](../src/components/home/InteractiveArcadeGrid.tsx), [ProgressiveJackpotSection.tsx:97-119](../src/components/home/ProgressiveJackpotSection.tsx), [DailyTournamentTeaser.tsx:63-91](../src/components/home/DailyTournamentTeaser.tsx), [VipProgressTeaser.tsx:85-113](../src/components/home/VipProgressTeaser.tsx) | `design-taste-frontend` §4.7 "Eyebrow Restraint" + "Section-Layout-Repetition Ban" (siehe Abschnitt 5.2) |
|  7  | ~15+ hartcodierte `#D4AF37`-Literale statt CSS-Custom-Properties                                         | Alle 8 gelesenen Dateien                                                                                                                                                                                                                                                                                                                               | `web/coding-style.md` CSS Custom Properties                                                              |

**Korrektur aus Runde 2 (wichtig):** [LiveActivityFeedV2.tsx](../src/components/social/LiveActivityFeedV2.tsx) wurde in Runde 1 nur oberflächlich gegrept, nicht vollständig gelesen. Bei vollständiger Prüfung zeigt sich: es ist **kein** drittes dekoratives Live-Ticker-Duplikat, sondern eine funktional eigenständige Komponente — throttled echte Store-Daten (`allBets`, max. 1 Refresh/60s), 3 echte Filter-Tabs (`ALL`/`BIG`/`MINE`), Klick-Drilldown zu `PlayerProfileModal`, Desktop-Tabelle + Mobile-Liste. Das ist näher an "Operate" (verifizierbare, echte Nutzerdaten) als an "Persuade"-Ambiente. Die ursprüngliche Einordnung als eines von "3 redundanten Feeds" war zu grob — siehe korrigierten Konsolidierungs-Scope in Abschnitt 5.4.

---

## 3 — Ursprüngliche Options-Matrix (Referenz, Runde 1)

| Option                              | Konzept                                                                                                                   | Score (gewichtet) |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :---------------- |
| A — Konsolidierung & Systemisierung | Live-Feeds auf klare Rollen reduzieren, `GlassSurface`/`springTransition`-Primitive extrahieren, Perf-Fix, `tabular-nums` | 4.10 / 5          |
| B — Editorial Bento Overhaul        | Sektionen zu echtem Bento-/Editorial-Grid umbauen (`design-taste-frontend` 4.3/4.7)                                       | 3.10 / 5          |
| C — Signal-Hierarchy Pass           | Nur Perf-Fix + Feed-Priorisierung, Rest unverändert                                                                       | 3.75 / 5          |

Empfehlung war A (höchster Score); B hatte den niedrigsten Score primär wegen Aufwand/Risiko, nicht wegen mangelndem Lerneffekt (Lerneffekt-Einzelscore von B war mit 5/5 sogar der höchste aller drei Optionen).

---

## 4 — Jans Richtungsentscheidung: Hybrid "Konsolidierung × Editorial Bento Overhaul"

Jan wählt **nicht** eine der drei Optionen isoliert, sondern eine Synthese:

- Die **strukturelle Zielform ist Option B** (Editorial Bento Overhaul — echter Bento-Umbau, nicht nur Politur).
- Die **Bauqualität/Disziplin folgt Option A** (Live-Feed-Konsolidierung, gemeinsame Primitiven, Motion-/Token-Fixes werden _während_ des Bento-Umbaus mit erledigt, nicht separat davor oder danach).
- **Harte Zusatzanforderung von Jan:** Das Ergebnis darf **nicht wie ein statisches Bento-Grid** wirken (fixe Kachelgrößen, einmaliges Fade-in, dann totes Layout). Das treibt den Motion-Anspruch über das hinaus, was ein "normales" Bento-Redesign bräuchte — siehe Dial-Rechnung in 5.1.

Das ist konsistent mit `design-taste-frontend` 11.A: **"Redesign — Overhaul"** (neue visuelle Sprache über bestehendem Content, IA/Routen/Nav bleiben stabil), kombiniert mit den in SOP15§1 explizit erlaubten tokenunabhängigen Skill-Beiträgen (Bento-Zellenregeln, Anti-Zickzack, Eyebrow-Restraint).

---

## 5 — Elaboriertes Konzept

### 5.1 Dial-Werte (Ist-Lesung vs. Ziel)

`design-taste-frontend` §1.B: Baseline `8/6/4` (Variance/Motion/Density), Modifier für "Redesign – Overhaul": **Variance +2, Motion +2, Density match** — angewendet auf die Ist-Lesung, nicht auf die Baseline.

| Dial               | Ist-Lesung Lobby (Audit) | Begründung Ist-Lesung                                                                                                                                                                                                                                                                      | Ziel (Ist +2 wo zutreffend) |
| :----------------- | :----------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------: |
| `DESIGN_VARIANCE`  |            ~5            | Jede Sektion ist einzeln unterschiedlich (3-Spalten-Hero, 5-Spalten-Grid, 3er-Podium, 5-Node-Timeline), aber _innerhalb_ jeder Sektion streng uniform/symmetrisch — daher mittel, nicht niedrig                                                                                            |            **7**            |
| `MOTION_INTENSITY` |            ~6            | Bereits reichhaltig (Cursor-Parallax, Partikel-Canvas, Spring-Hovers, Live-Ticker), aber fast ausschließlich "Erscheinen"-Animationen (`whileInView` einmalig), kaum kontinuierliche/wiederkehrende Bewegung nach dem ersten Reveal — das _ist_ der "wirkt statisch"-Effekt, den Jan meint |            **8**            |
| `VISUAL_DENSITY`   |            ~5            | Dicht mit Cards/Badges/Stats, aber mit Atem durch Glass-Sections                                                                                                                                                                                                                           |        **5 (match)**        |

**Governance-Spannung (an Jan zu bestätigen):** Ziel-Motion 8 ("Cinematic") trifft auf die harte Systemgrenze aus SOP15§2: kein GSAP ohne Freigabe, `gsap` ist keine Dependency. Das ist lösbar — "nicht-statisch" wird ausschließlich über **kontinuierliche** `framer-motion`-Primitive erreicht (`useScroll`+`useTransform` für Scroll-gekoppelte Bewegung, laufend aktualisierte Zell-Inhalte, `useMotionValue`-Cursor-Reaktivität pro Zelle), nicht über GSAP-Pinning/Sticky-Stacks. Siehe 5.6.

### 5.2 Bento-Hard-Rules-Mapping (`design-taste-frontend` §4.7)

| Regel (§4.7)                                                           | Ist-Zustand-Verstoß                                                                                   | Wie die neue Struktur sie erfüllt                                                                                                                  |
| :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow Restraint (max. 1 pro 3 Sektionen)                             | 6 von 7 Sektionen haben ein Eyebrow → 6 Verstöße                                                      | Eyebrow nur noch am Hero + max. 1 weiterer im gesamten Bento-Mosaik → ≤ 2 auf der Seite                                                            |
| Section-Layout-Repetition Ban                                          | "Eyebrow+H2+Grid"-Familie 4× wiederholt                                                               | Jede Layout-Familie erscheint genau einmal (siehe Zellinventar 5.3)                                                                                |
| Bento Cell Count Rule                                                  | Arcade-Grid nutzt 5 gleich große Spalten für 5 Items ohne Hierarchie                                  | 5 Items → 5 Zellen, aber asymmetrisch (Hero-Zelle + 4, siehe 5.3)                                                                                  |
| Bento Background Diversity (≥ 2-3 Zellen mit echter visueller Varianz) | Alle Zellen sind uniforme dunkle Glass-Cards mit Text                                                 | Arcade-Hero-Zelle (Spielbild), Jackpot-Zelle (Liquid-Gold-Gradient), Tournament-Zelle (Avatar-Renders) erfüllen das bereits mit vorhandenen Assets |
| Zigzag Alternation Cap                                                 | Nicht anwendbar (kein Bild+Text-Zickzack im Ist), aber Prinzip gilt fürs neue Layout                  | Max. 2 strukturell ähnliche Zellen in Folge, danach Musterbruch (Vollbreite-Streifen: VIP-Timeline)                                                |
| Shape Consistency Lock                                                 | Radien variieren bereits leicht (`12px`/`14px`/`16px`/`18px`/`20px`/`24px`) ohne dokumentierte Regel  | Eine Radius-Skala festlegen (z. B. Cards `16px`, Pills `full`, Modals unverändert) und in `GlassSurface` zentral erzwingen                         |
| Mobile collapse explicit per section                                   | Größtenteils vorhanden (`isMobile`-Branches), aber nicht für neue asymmetrische Bento-Spans definiert | Jede Zelle bekommt einen expliziten Mobile-Stack-Rang (siehe 5.3-Tabelle, Spalte "Mobile-Reihenfolge")                                             |

### 5.3 Neue Sektions-/Zellstruktur (Vorschlag, nicht final — siehe offene Entscheidungen)

Hero (`HeroCinematicShowcase`) bleibt strukturell unverändert (3-Spalten-Architektur ist bereits asymmetrisch/distinct) — Bento-Umbau betrifft ausschließlich den Bereich **unterhalb** des Heroes.

| Zelle                                             | Inhalt                                                            | Layout-Familie                                                                                                                     | Größe (Desktop-Grid) | Bento-Background-Diversity        | Mobile-Reihenfolge |
| :------------------------------------------------ | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------- | :-------------------------------- | :----------------- |
| **Arcade-Hero-Zelle**                             | Crash (aktuell `isFeatured`)                                      | Großformat-Showcase mit Bewegtbild-Loop-Hintergrund                                                                                | 2×2 (dominant)       | ✅ Spielbild/Loop                 | 1                  |
| **Arcade-Satelliten-Zellen ×4**                   | Blackjack, Dice, Roulette, Slots                                  | Kompakte Tilt-Cards (bestehendes `ArcadeGameCard`-Muster, motion-korrigiert)                                                       | 1×1 je Zelle         | teilweise (Spielbilder vorhanden) | 2                  |
| **Live-Highlight-Zelle** (konsolidiert)           | Fusion aus `LiveHighrollerTickerBar` + `VipLiveStreamRail`-Inhalt | Auto-rotierender Kompakt-Stream, kein Vollbreite-Balken mehr                                                                       | 1×2 (hochkant)       | dezent (Rang-/Typ-Farbcodierung)  | 3                  |
| **Jackpot-Zelle**                                 | Progressive-Jackpot-Rollup                                        | Großformat-Typografie-Moment, Liquid-Gold-Gradient                                                                                 | 2×1                  | ✅ Gradient                       | 4                  |
| **Tournament-Podium-Streifen**                    | Daily-Race-Podium                                                 | Vollbreite, eigene 3-Spalten-Mikro-Komposition (bleibt strukturell wie heute, wird aber Teil des Mosaiks statt eigene Vollsektion) | Full-width Streifen  | ✅ Avatare                        | 5                  |
| **VIP-Timeline-Streifen**                         | 5-Tier-Roadmap                                                    | Vollbreite horizontale Timeline (bricht das Grid-Muster bewusst, §4.7 Zigzag-Cap)                                                  | Full-width Streifen  | teilweise                         | 6                  |
| **Live-Activity-Feed** (unverändert eigenständig) | `LiveActivityFeedV2` (echte Store-Daten, Filter, Drilldown)       | Eigene Vollbreite-Sektion **außerhalb** des Bento-Mosaiks (siehe 5.4-Korrektur — bleibt funktional distinct)                       | Full-width           | n/a (Datentabelle)                | 7                  |

Eyebrow-Budget bei dieser Struktur: 1× Hero + höchstens 1× am gesamten Bento-Mosaik (z. B. nur vor der Arcade-Hero-Zelle) = 2 auf der ganzen Seite, statt bisher 6.

### 5.4 Live-Feed-Konsolidierung (korrigierter Scope)

- **Zusammenführen:** [LiveHighrollerTickerBar.tsx](../src/components/home/LiveHighrollerTickerBar.tsx) und [VipLiveStreamRail.tsx](../src/components/home/VipLiveStreamRail.tsx) — beide zeigen simulierte/hardcodierte Daten (`DEFAULT_WINS` bzw. `Math.random()`-Generator), beide sind reines Ambiente ohne echte Store-Anbindung, beide konkurrieren aktuell um dieselbe Aufmerksamkeit (Top-Balken vs. Side-Drawer). Werden zu **einer** `LiveHighlightStream`-Komponente (neue Datei, z. B. `src/components/home/LiveHighlightStream.tsx`) mit einer Datenquelle und einem Darstellungsort (Bento-Zelle statt Balken + Drawer).
- **Nicht anfassen (strukturell):** [LiveActivityFeedV2.tsx](../src/components/social/LiveActivityFeedV2.tsx) bleibt eigenständig — echte Daten, Filter, Drilldown sind ein anderes Feature als Ambiente-Ticker (siehe Korrektur Abschnitt 2). Optional: visuelles Facelift (Glass-/Radius-Token-Angleichung), aber keine Fusion.
- **Offene Frage an Jan:** Sollen `LiveHighrollerTickerBar`/`VipLiveStreamRail` auf echte `allBets`-Daten umgestellt werden (wie `LiveActivityFeedV2` es bereits tut), statt weiter mit `DEFAULT_WINS`/`Math.random()` zu simulieren? Das ist eine Trust/Fairness-Marketing-Frage (Provably-Fair-Positionierung), keine reine Design-Frage — siehe Abschnitt 7, Punkt 3.

### 5.5 Neue Primitiven (Bau-Reihenfolge für L5)

1. **`springTransition`-Export** in [VibeMotion.tsx](../src/components/ui/VibeMotion.tsx) oder neue `src/lib/casino/motion-tokens.ts` — einzige Quelle für `{stiffness:400, damping:25, bounce:0.4}` gemäß 04§4. Bestehende Diskrepanz (`VibeMotion.tsx` nutzt aktuell `300/30/mass:1`, siehe SOP15§2) wird hier von Jan final entschieden (Abschnitt 7, Punkt 1), nicht von der LLM.
2. **`GlassSurface`**-Komponente (`src/components/ui/GlassSurface.tsx`) — kapselt die exakte 04§2-Spezifikation + zentrale Radius-Skala (Shape Consistency Lock), ersetzt die 4 abweichenden Ad-hoc-Varianten aus Audit-Punkt 4.
3. **`useTiltGlare`-Hook** (`src/hooks/useTiltGlare.ts`) — verallgemeinert die bestehende (aktuell `useState`-basierte, siehe Audit-Punkt 1) Tilt/Glare-Logik aus `ArcadeGameCard` auf `useMotionValue`/`useTransform`, wiederverwendbar für alle Bento-Zellen mit Hover-Tilt (Arcade-Satelliten, Jackpot-Zelle, Tournament-Zelle).
4. **`LiveHighlightStream`**-Komponente (siehe 5.4).

### 5.6 Motion-Spezifikation je Zellentyp (Anti-Static, SOP15§2-konform)

| Zellentyp                | Continuous-Motion-Mechanik                                                                                                                 | Primitive                                                                        |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| Arcade-Hero + Satelliten | Cursor-Tilt + Glare bei Hover                                                                                                              | `useTiltGlare` (neu, ersetzt `useState`)                                         |
| Live-Highlight-Zelle     | Laufend rotierender Inhalt (nicht nur Erscheinen), Fortschrittsindikator zwischen Einträgen                                                | `useMotionValue` + Intervall-Trigger, kein `useState`-Re-Render der ganzen Zelle |
| Jackpot-Zelle            | Rollender Ziffern-Ticker (bereits vorhanden, `RollingJackpotDisplay`) + leichte `useScroll`-gekoppelte Parallax der Hintergrund-Glow-Ebene | bestehend + `useScroll`/`useTransform` neu                                       |
| Tournament-/VIP-Streifen | `whileInView`-Reveal bleibt (kein Dauerloop nötig, Ranking ändert sich nicht pro Sekunde), aber Hover-`y`-Lift auf Spring vereinheitlicht  | `springTransition`-Konstante                                                     |
| Live-Activity-Feed       | unverändert (`useInView`, throttled Store-Update)                                                                                          | bestehend                                                                        |

Kein Einsatz von GSAP. Alle neuen/geänderten Komponenten bleiben isolierte `'use client'`-Leaves.

### 5.7 Token-Disziplin

Alle in Audit-Punkt 7 gefundenen `#D4AF37`-Literale (und die übrigen Kernfarben aus 04§1) wandern in CSS-Custom-Properties (z. B. `--gold-primary`, `--gold-secondary`, `--emerald-win`, `--ruby-loss`), referenziert statt hartcodiert — macht künftige Palette-Änderungen (04§1) an einer Stelle steuerbar.

---

## 6 — Re-Audit / Selbstprüfung Runde 2 (was in Runde 1 gefehlt hat)

1. **`LiveActivityFeedV2.tsx` wurde in Runde 1 nur gegreppt, nicht vollständig gelesen** — führte zu einer zu groben Einordnung als "3. redundanter Feed". Korrigiert in Abschnitt 2 und 5.4.
2. **4. abweichender Spring-Wert übersehen:** [LiveActivityFeedV2.tsx:189/318](../src/components/social/LiveActivityFeedV2.tsx) (`stiffness:300, damping:25`) — Audit-Punkt 2b ergänzt.
3. **Z-Index-Zone für neue Hover-erhöhte Bento-Zellen fehlt in 04§5:** Die Tabelle definiert Zonen für Background (0-5), Game-Stage (10-35), Nav (40-50), Modals (1000+) — aber keine Zone für "Content-Section-Zellen, die bei Hover über Nachbarn angehoben werden" (aktuell nutzt z. B. `InteractiveArcadeGrid` bereits `zIndex:5`, `VipLiveStreamRail` `zIndex:45/48` im Nav-Bereich ohne das dort zu dokumentieren). **Offene Entscheidung Abschnitt 7, Punkt 2.**
4. **`prefers-reduced-motion` wird nur in `LobbyAmbientBackground` behandelt**, nicht in `ArcadeGameCard`, `LiveHighrollerTickerBar`, `VipLiveStreamRail`. Bei erhöhtem `MOTION_INTENSITY`-Ziel (8, siehe 5.1) wird das a11y-relevanter — muss beim Primitiven-Bau (`useTiltGlare`, `LiveHighlightStream`) verpflichtend mitgebaut werden, nicht optional.
5. **Mobile-Collapse für asymmetrische Bento-Spans war in der ursprünglichen Options-Matrix nicht spezifiziert** — jetzt in 5.3-Tabelle (Spalte "Mobile-Reihenfolge") nachgetragen, aber die exakten Breakpoint-Spans (2×2 → wie viele Spalten bei 375px?) sind noch nicht final — **offene Entscheidung Abschnitt 7, Punkt 4**.
6. **Analytics-Event-Kontinuität nicht geprüft:** `trackAllowedEvent({name:'landing_viewed'})` in `HomeClientV2.tsx:58` muss die Restrukturierung überleben (impeccable 11.A: "Respect existing analytics events"). Kein neuer Check nötig, da Event auf Seitenebene sitzt, nicht auf Sektionsebene — aber explizit zu verifizieren beim Umbau, nicht stillschweigend anzunehmen.
7. **GSAP-Grenze erneut bestätigt:** Ziel-Motion-Intensität (8/10, "cinematic") könnte fälschlich als Trigger für GSAP-Pinning gelesen werden. Bestätigt: nicht nötig, alle in 5.6 beschriebenen Effekte sind mit `framer-motion` (bereits Dependency) erreichbar.
8. **Bento Cell Count Rule (§4.7) auf Arcade-Grid geprüft:** 5 Spiele → 5 Zellen, keine leere Füllzelle nötig (aktuell existiert bereits ein "Span-2 bei ungerader Anzahl"-Sonderfall in `InteractiveArcadeGrid.tsx:307-308` — dieser Mechanismus entfällt mit der neuen 1-Hero+4-Satelliten-Struktur, da 5 immer 5 bleibt, nicht mehr gefiltert wird).

---

## 7 — Offene Entscheidungen für Jan (vor Execution-Ready)

1. **Spring-Kanon:** Wird `stiffness:400, damping:25, bounce:0.4` (04§4-Text) oder `stiffness:300, damping:30, mass:1` (aktueller `VibeMotion.tsx`-Code) die verbindliche Konstante? (Bestehende Diskrepanz, SOP15§2 Fußnote — muss vor L5 geklärt sein, sonst wird `springTransition` auf Basis einer falschen Annahme gebaut.)
2. **Z-Index-Zone für Bento-Hover-Zellen:** Neue Zone in 04§5 ergänzen (z. B. `6-9` für "Content-Zellen mit Hover-Elevation") oder bestehende Werte (`zIndex:5`) beibehalten und Hover-Elevation nur über Schatten/Scale simulieren, ohne Stacking-Context zu wechseln?
3. **Live-Highlight-Datenquelle:** `LiveHighlightStream` weiter mit simulierten Daten (`DEFAULT_WINS`/`Math.random()`, wie heute) oder auf echte `allBets`-Store-Daten umstellen (wie `LiveActivityFeedV2`)? Trust/Fairness-Marketing-Implikation, keine reine Layout-Frage.
4. **Mobile-Breakpoint-Spans:** Exakte Grid-Template-Definition für die Arcade-Hero+4-Satelliten-Struktur bei 375px/768px (z. B. Hero volle Breite, Satelliten 2×2 darunter?) — wird beim Scaffolding (L6) mit Referenz auf `fast-responsive-audit.mjs` konkretisiert, außer Jan hat hier bereits eine Präferenz.
5. **Ablageort dieses Dokuments:** In `T_FRONTEND/` belassen oder nach `worldmap/` migrieren (SOP-kanonischer Ort laut `xx_sop/03`/`xx_sop/10§7`)? Reine Governance-Frage, keine inhaltliche.

---

## 8 — Betroffene Dateien (Gesamtüberblick, für spätere Execution-Phase)

**Neu:**

- `src/components/ui/GlassSurface.tsx`
- `src/hooks/useTiltGlare.ts`
- `src/components/home/LiveHighlightStream.tsx`
- ggf. `src/lib/casino/motion-tokens.ts`

**Modify:**

- [HomeClientV2.tsx](../src/components/home/HomeClientV2.tsx) — Sektionsreihenfolge/-komposition
- [InteractiveArcadeGrid.tsx](../src/components/home/InteractiveArcadeGrid.tsx) — Hero+4-Struktur, `useTiltGlare`-Migration
- [ProgressiveJackpotSection.tsx](../src/components/home/ProgressiveJackpotSection.tsx) — Bento-Zelle statt Vollsektion
- [DailyTournamentTeaser.tsx](../src/components/home/DailyTournamentTeaser.tsx) — Streifen-Integration
- [VipProgressTeaser.tsx](../src/components/home/VipProgressTeaser.tsx) — Streifen-Integration
- [LiveActivityFeedV2.tsx](../src/components/social/LiveActivityFeedV2.tsx) — optional Token-Facelift, strukturell unverändert
- [VibeMotion.tsx](../src/components/ui/VibeMotion.tsx) — `springTransition`-Export

**Entfällt (durch Konsolidierung ersetzt):**

- [LiveHighrollerTickerBar.tsx](../src/components/home/LiveHighrollerTickerBar.tsx)
- [VipLiveStreamRail.tsx](../src/components/home/VipLiveStreamRail.tsx)

---

## 9 — Verwandte Artefakte

| Bedarf                                | Datei                                                                                       |
| :------------------------------------ | :------------------------------------------------------------------------------------------ |
| Design System & Tokens                | [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md)                         |
| Frontend-Revamp-Lebenszyklus          | [`xx_sop/10_workflow_frontend_revamp.md`](../xx_sop/10_workflow_frontend_revamp.md)         |
| Skill-Routing                         | [`xx_sop/15_workflow_frontend_taste_qc.md`](../xx_sop/15_workflow_frontend_taste_qc.md)     |
| Option-Gate-Format                    | [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md)         |
| Planungsdatei-Konventionen            | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
| Bento-Hard-Rules-Quelle               | `C:\Users\hambu\.claude\skills\design-taste-frontend\SKILL.md` §4.3/§4.7                    |
| Sibling-Planungsdatei (Formatvorbild) | [`T_FRONTEND/02_FRONTEND_REDESIGN_NEXT_LEVEL.md`](02_FRONTEND_REDESIGN_NEXT_LEVEL.md)       |

---

## 10 — Hinweis zur Ablage

`xx_sop/10_workflow_frontend_revamp.md` §7 kennzeichnet `T_FRONTEND/` explizit als historischen Ablageort: _"Frühere Entwürfe nutzten temporäre Plandateien in T_FRONTEND/. Die kanonische Ablage für Planungsdokumente erfolgt heute zentral in worldmap/ oder docs/archive/."_ Diese Datei wurde dennoch hier angelegt, da Jan Pfad und Dateinamen explizit so vorgegeben hat. Punkt 5 in Abschnitt 7 hält das als offene Governance-Frage fest — keine Aktion ohne Jans Entscheidung.
