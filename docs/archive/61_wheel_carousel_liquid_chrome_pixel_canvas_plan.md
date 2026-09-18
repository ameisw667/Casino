# 61 — Wheel Carousel: Liquid Chrome & Pixel Canvas Hybrid-Hintergrund (Obsidian & 24k Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit, Jan nur bei visueller Endabnahme/Gate) · **Scope:** Ausschließlich `src/components/casino/games-catalog/WheelCarousel.tsx` erhält einen zweischichtigen WebGL-/Canvas-Hintergrund (Liquid Chrome + Pixel Canvas) durch Wiederverwendung zweier bereits produktiv existierender Komponenten. Keine anderen Dateien werden verändert.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Ausführungsnachweis:** L0–L4 vollständig umgesetzt. `npm run typecheck` (0 Fehler), `npm test` (222/222 Dateien, 1698/1698 Tests grün), `npm run lint` (0 neue Errors), `npm run build` (Exit 0), `git status --short` (nur `WheelCarousel.tsx` in diesem Schritt verändert) — alle 5 Stufen grün. Visuelle/Interaktions-Verifikation im Browser: beide Canvas-Layer rendern korrekt gestapelt (Liquid Chrome hinter Pixel Canvas via `isolation: isolate`-Wrapper), Pfeil-/Dot-/PLAY-NOW-Klicks funktionieren ungehindert, Header-Lesbarkeit erhalten.
> **Nachjustierung nach Jans erster visueller Abnahme (2026-09-12):** Liquid-Chrome-Intensität von `0.85` auf `0.4` reduziert (war zu dominant/aggressiv gelb, seitliche Karussell-Karten kaum lesbar) und ein zusätzlicher dunkler Scrim-Layer (`radial-gradient` Obsidian, `zIndex: 2`, `pointerEvents: none`) zwischen den Canvas-Layern und dem Content eingezogen. Erneut mit `typecheck` (0 Fehler) und `build` (Exit 0) verifiziert; visuell im Browser bestätigt: Obsidian dominiert jetzt, Gold nur noch als Schimmer, seitliche Karten wieder klar lesbar.
> **Finale Freigabe:** Jan hat die (in [`T_FRONTEND/67_wheel_carousel_subtle_sheen_retune_plan.md`](./67_wheel_carousel_subtle_sheen_retune_plan.md) weiter verfeinerte) Variante am 2026-09-13 visuell explizit bestätigt ("Finde ich auf jeden Fall schon sehr gut"). Plan endgültig abgeschlossen und nach `docs/archive/` verschoben.

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 65 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Visuelle Tiefe des Hintergrunds | Top 70 % | Reiner statischer CSS `radial-gradient` ohne Bewegtbild (`WheelCarousel.tsx:162`). | 🔴 JA | Liquid Chrome WebGL-Shader (`LiquidGoldChromeCanvas`) als Basis-Layer wiederverwenden. |
| 02 | Tech-/Funkel-Akzent fehlt | Top 65 % | Kein Partikel-/Tech-Layer vorhanden, obwohl von Jan explizit gewünscht (Componentry-Link `pixel-canvas`). | 🔴 JA | `CrashPixelCanvas` (status-neutral als `"IDLE"`) als zweiten Layer darüberlegen. |
| 03 | Layering-Konflikt zwischen beiden Canvas-Layern | Top 90 % (kritisch, unbehandelt bricht die Optik) | `LiquidGoldChromeCanvas` rendert opak (`gl_FragColor = vec4(finalColor, 1.0)`, `alpha:false`) mit hartkodiertem `zIndex:1`; `CrashPixelCanvas` hat hartkodiertes `zIndex:0`. Ohne Gegenmaßnahme würde die opake Liquid-Chrome-Fläche den Pixel-Layer vollständig verdecken. | 🔴 JA | Eigene Stacking-Context-Wrapper pro Layer (`isolation: isolate`) mit definierten z-Index-Werten 0/1, Content-Wrapper darüber auf 2 — innerhalb des erlaubten Bands 0–5 für „Hintergrund & Canvas" gem. `xx_sop/04_design_system_ui.md`. |
| 04 | Mobile-/Low-Power-Gate für Pixel Canvas fehlt | Top 60 % | `LiquidGoldChromeCanvas` deaktiviert sich selbst unter 1023px/`isMobile` (`LiquidGoldChromeCanvas.tsx:154-156,303-308`); `CrashPixelCanvas` hat kein solches Gate, läuft ungebremst auch auf Mobile (`CrashPixelCanvas.tsx:23-198`). | 🔴 JA | Bedingtes Rendering `!isMobile` an der Aufrufstelle in `WheelCarousel.tsx`, keine Änderung an `CrashPixelCanvas.tsx` selbst. |
| 05 | Reduced-Motion-Handling für Pixel Canvas fehlt | Top 55 % | `LiquidGoldChromeCanvas` friert `u_time` bei `prefers-reduced-motion` ein (`:246,252`); `CrashPixelCanvas` prüft das gar nicht. | 🔴 JA | `useReducedMotion()` aus `framer-motion` (bereits Import in `WheelCarousel.tsx:6`) an der Aufrufstelle nutzen, Pixel-Canvas-Rendering davon abhängig machen. |
| 06 | GPU-Kumulationsrisiko | Top 50 % | Die Walze treibt bereits pro Karte `useTransform`-3D-Matrizen mit `willChange: 'transform, opacity'` und `preserve-3d` (`WheelCarousel.tsx:381-423`); zwei zusätzliche rAF-Loops (WebGL + 2D-Canvas) erhöhen die GPU-Last spürbar gegenüber dem bisherigen Lobby-Einsatz (Vollbild, aber statischer restlicher Content). | 🔴 JA | `intensity`-Prop gedämpft auf `0.85` setzen, visuelle Ruckler-Prüfung im Browser-Pane nach Integration (L3). |
| 07 | Lesbarkeit von Header-Label & Ambient Top Glow Bar über neuem Hintergrund | Top 40 % | „FEATURED 3D SPOTLIGHT"-Label und die 1px Gold-Glow-Linie (`WheelCarousel.tsx:170-181`) liegen aktuell auf ruhigem Gradient; unklar, ob sie über bewegtem Shader weiterhin klar lesbar bleiben. | 🔴 JA | Visueller Vorher/Nachher-Vergleich in L3, bei Bedarf Opacity/Intensity nachjustieren. |
| 08 | SSR/Hydration-Sicherheit | Top 25 % | `LiquidGoldChromeCanvas` wird im bestehenden Lobby-Einsatz via `next/dynamic(..., { ssr: false })` geladen (`LobbyAmbientBackground.tsx:10-16`) — etabliertes, funktionierendes Muster. | Nein | Muster 1:1 übernehmen, kein neues Risiko. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Diagnose | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Aktuellen Zustand (Zeilen, Imports) protokolliert, kein Codeschaden — bestätigt |
| **L1** | Layer-Komposition (Liquid Chrome + Pixel Canvas) | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Beide Layer sichtbar, korrekt gestapelt, Interaktion ungestört — im Browser bestätigt (2 Canvas-Elemente, Pfeil-Klick rotiert Walze) |
| **L2** | Mobile-, Reduced-Motion- & Performance-Gates | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | `useReducedMotion` + `!isMobile`-Gate für Pixel-Canvas-Layer ergänzt |
| **L3** | Visuelle Feinabstimmung & Self-Audit | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Screenshot- & Klick-Test grün, Code-Selbstprüfung auf Klammern/Fehler bestanden |
| **L4** | 5-Stufen-Abschlussprüfung & Status-Update | Lokale Test-Suite + diese Datei | 🟢 Executed | LLM | Typecheck 0 Fehler, Test 1698/1698, Lint 0 neue Errors, Build Exit 0, Git-Diff nur diese Datei — alle 5 Stufen grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei (einzige Datei mit Schreibzugriff): [`src/components/casino/games-catalog/WheelCarousel.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games-catalog/WheelCarousel.tsx) — äußerer Container ca. Zeile 155-170, Header-Bar ca. 170-220, 3D-Cylinder-Stage ca. 265-320, Pagination Dots ca. 320-355.
- Wiederverwendete Komponente 1 (nur lesen/importieren, NICHT ändern): [`src/components/home/shaders/LiquidGoldChromeCanvas.tsx`](file:///v:/VibeCoding/Casino/src/components/home/shaders/LiquidGoldChromeCanvas.tsx) — Props: `isMobile?: boolean`, `className?: string`, `intensity?: number` (Default 1.0).
- Wiederverwendete Komponente 2 (nur lesen/importieren, NICHT ändern): [`src/components/casino/games/crash/CrashPixelCanvas.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/crash/CrashPixelCanvas.tsx) — Props: `status: CrashStatus` (aus `./crash-helpers`, Wert `'IDLE'` erzeugt den neutralen, nicht-Crash-spezifischen Zustand: gedämpftes Obsidian-Gold, organische Drift, Maus-Repel), `isMobile: boolean`.
- Referenz-Muster für `next/dynamic`-Einbindung: [`src/components/home/LobbyAmbientBackground.tsx:10-16`](file:///v:/VibeCoding/Casino/src/components/home/LobbyAmbientBackground.tsx) (NICHT verändern, nur als Vorbild lesen).
- Reduced-Motion-Quelle: `useReducedMotion` aus `framer-motion` (Paket bereits in `WheelCarousel.tsx:6` importiert, nur um `useReducedMotion` ergänzen).
- Vorherige Plan-Referenzen (Kontext, bereits „Executed (archiviert)"): [`T_FRONTEND/29_ambient_light_liquid_chrome_plan.md`](./29_ambient_light_liquid_chrome_plan.md), [`T_FRONTEND/32_games_featured_wheel_carousel_plan.md`](./32_games_featured_wheel_carousel_plan.md), [`T_FRONTEND/34_crash_arena_pixel_canvas_backdrop_plan.md`](./34_crash_arena_pixel_canvas_backdrop_plan.md).
- Design-System-Regel: [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) — Z-Index-Band 0-5 reserviert für „Hintergrund & Canvas / Three.js-Szenen".
- Componentry-Katalog-Einträge: [Liquid Chrome](https://componentry.dev/docs/components/liquid-chrome), [Pixel Canvas](https://componentry.dev/docs/components/pixel-canvas) (`docs/frontend/12_componentry_complete_catalog.md:107,128`).

### 3.2 Systemregeln & Invarianten
- **Design-System:** Obsidian (`#0B0E14`), Gold (`#D4AF37`/`#e5c158`), bestehender Rand `1px solid rgba(212, 175, 55, 0.2)` und `boxShadow` der Box bleiben unverändert erhalten.
- **Z-Index-Band:** Neue Canvas-Layer ausschließlich in Band 0-5, Content (Header/Stage/Dots) strikt darüber (z. B. `zIndex: 2`).
- **Zero-Wallet-Autorität:** Reine UI-/Motion-Schicht, keine State- oder Finanzmutationen.
- **Fail-Closed & Stabilität:** Beide Canvas-Komponenten bringen bereits robuste Cleanup-/Context-Loss-Handler mit (nur bei `LiquidGoldChromeCanvas`) bzw. einfache rAF-Cleanup (`CrashPixelCanvas`) — keine Änderung an diesen Mechanismen.
- **Mobile & Reduced-Motion:** Auf Mobile (`isMobile === true`) und bei `prefers-reduced-motion` bleibt ausschließlich der bestehende CSS-`radial-gradient` sichtbar (kein Canvas gerendert).

### 3.3 Nicht-Scope (Ausdrücklich verboten)
- Keine Änderungen an `LiquidGoldChromeCanvas.tsx` oder `CrashPixelCanvas.tsx` selbst — beide werden unverändert wiederverwendet.
- Keine Änderungen an `LobbyAmbientBackground.tsx` oder `CrashStage.tsx` (bestehende Verwender dieser Komponenten dürfen nicht beeinflusst werden).
- Keine Änderungen an anderen Bereichen von `/games` (Header, `ScrollTiltedGamesGrid`, `ElevatedGameCard`, `OriginalsCollectionSurfer`, `LiveWinRibbon`, `Footer`).
- Keine neuen npm-Abhängigkeiten (beide Layer kommen ohne zusätzliche Libraries aus).
- Keine Wett-/Settlement-Logik, keine Supabase-Berührung.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L0: Baseline & Diagnose
- **Ziel:** Aktuellen Zustand von `WheelCarousel.tsx` (Imports, exakte Zeilennummern des äußeren Containers) protokollieren, bevor Schreibaktionen beginnen.
- **Schritte:** Datei vollständig lesen, betroffene Zeilenbereiche (Container-Style, Header-Bar-Öffnung, Content-Ende) exakt bestätigen.
- **Abbruchkriterium:** Datei weicht strukturell so stark von der hier dokumentierten Annahme ab, dass die Meilensteine L1-L3 neu geplant werden müssten.

### Meilenstein L1: Layer-Komposition (Liquid Chrome + Pixel Canvas)
- **Ziel:** Beide Hintergrund-Layer korrekt gestapelt, ohne gegenseitige Verdeckung, in den äußeren WheelCarousel-Container integrieren.
- **Schritte:**
  1. Neue Imports ergänzen: `dynamic` aus `next/dynamic`; `LiquidGoldChromeCanvas` via `dynamic(() => import('@/components/home/shaders/LiquidGoldChromeCanvas').then((m) => m.LiquidGoldChromeCanvas), { ssr: false })` (Muster aus `LobbyAmbientBackground.tsx:10-16`); `CrashPixelCanvas` direkt aus `@/components/casino/games/crash/CrashPixelCanvas`; `useReducedMotion` zusätzlich aus `framer-motion` importieren.
  2. Direkt als erste Kinder im äußeren Container-Div (vor der „Ambient Top Glow Bar") zwei gewrappte Hintergrund-Layer einfügen:
     - Wrapper A: `{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate', pointerEvents: 'none', overflow: 'hidden' }` → enthält `<LiquidGoldChromeCanvas isMobile={isMobile} intensity={0.85} />`.
     - Wrapper B: `{ position: 'absolute', inset: 0, zIndex: 1, isolation: 'isolate' }` → enthält bedingt gerendertes `<CrashPixelCanvas status="IDLE" isMobile={isMobile} />` (Bedingung siehe L2).
  3. Bestehenden Content-Block (Header-Bar, 3D-Cylinder-Stage, Pagination Dots) in einen dritten Wrapper mit `{ position: 'relative', zIndex: 2 }` einfassen, damit er garantiert über beiden Canvas-Layern liegt.
  4. Den bestehenden `background: radial-gradient(...)`-Wert am äußeren Container **nicht entfernen** — bleibt als Mobile-/No-WebGL-Fallback sichtbar.
- **Erwartetes Verhalten:** Auf Desktop mit aktivem WebGL zeigt die Box eine bewegte Gold/Obsidian-Flüssigmetall-Fläche mit darüberliegendem, dezent funkelndem Gold-Pixel-Gitter; Drag-Rotation der Walze, Pfeil-Buttons, Pagination-Dots und der `PLAY NOW`-Link der aktiven Karte bleiben uneingeschränkt klickbar.
- **Abbruchkriterium:** Klicks/Drag auf Karten, Pfeil-Buttons oder Pagination-Dots werden durch einen der beiden Canvas-Layer blockiert.

### Meilenstein L2: Mobile-, Reduced-Motion- & Performance-Gates
- **Ziel:** `CrashPixelCanvas` erhält an der Aufrufstelle dieselbe Sicherheits-Härtung, die `LiquidGoldChromeCanvas` bereits nativ mitbringt — ohne die geteilte Datei selbst zu verändern.
- **Schritte:**
  1. `const prefersReducedMotion = useReducedMotion();` in `WheelCarousel.tsx` ergänzen.
  2. `CrashPixelCanvas` nur rendern, wenn `!isMobile && !prefersReducedMotion`.
  3. `intensity={0.85}` an `LiquidGoldChromeCanvas` wie in L1 festgelegt beibehalten (gedämpfter als der Vollbild-Lobby-Einsatz, da die Box kleiner ist und Content direkt darüber liegt).
- **Erwartetes Verhalten:** Mobile-Nutzer und Nutzer mit `prefers-reduced-motion` sehen ausschließlich den bestehenden statischen CSS-Gradient-Hintergrund, keine zusätzliche Canvas-Last.
- **Abbruchkriterium:** `isMobile`-Prop wird nicht korrekt durchgereicht oder `useReducedMotion` liefert in der Browser-Pane-Prüfung kein plausibles Ergebnis → Gate lokal mit `window.matchMedia('(prefers-reduced-motion: reduce)')` als Fallback nachbauen und das in L3 dokumentieren.

### Meilenstein L3: Visuelle Feinabstimmung & Self-Audit
- **Ziel:** Lesbarkeit/Kontrast/Konsistenz mit dem Obsidian-&-Gold-Design sicherstellen, plus formale Selbstprüfung von Code auf Klammerfehler, ungenutzte Imports und Scope-Treue vor Abschluss.
- **Schritte:**
  1. Screenshot-Vergleich (Browser-Pane, `localhost:3015/games`) vor/nach Integration: Header-Text, „FEATURED 3D SPOTLIGHT"-Label und Ambient Top Glow Bar müssen weiterhin klar lesbar bleiben; bei Bedarf `intensity` oder Wrapper-Opacity nachjustieren.
  2. Klick-/Drag-Interaktions-Test im Browser-Pane: Pfeil-Buttons, Pagination-Dots, Drag-Rotation der Walze, Klick auf `PLAY NOW` der aktiven Karte je einmal ausführen und Funktionsfähigkeit bestätigen.
  3. Code-Selbstprüfung: `WheelCarousel.tsx` vollständig re-lesen auf unausgeglichene JSX-Klammern/Tags, korrekte Einrückung, ungenutzte Imports, TypeScript-Korrektheit der neuen Props und Einhaltung der Nicht-Scope-Grenzen (`git status --short` zeigt ausschließlich diese eine Datei).
- **Abbruchkriterium:** Text/Buttons sind über dem neuen Hintergrund nicht mehr klar lesbar/klickbar, oder ungenutzte Imports/TS-Fehler verbleiben nach der Selbstprüfung.

### Meilenstein L4: 5-Stufen-Abschlussprüfung & Status-Update
- **Ziel:** Formale Verifikation gemäß `xx_sop/02_workflow_jan_execution.md` und Status-Update dieser Planungsdatei.
- **Schritte:** `npm run typecheck` → `npm test` → `npm run lint` → `npm run build` → `git status --short` (nur `WheelCarousel.tsx` modifiziert). Danach Kopfzeile dieser Datei auf `Status: Executed (archiviert)` setzen; Verschiebung nach `docs/archive/` erst nach Jans visueller Endabnahme (Jan bleibt laut SOP alleiniger Gatekeeper für die visuelle Freigabe).
- **Abbruchkriterium:** Eine der 5 Stufen schlägt fehl → nicht als abgeschlossen melden, Ursache beheben, Stufe erneut ausführen.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)
1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — 0 neue ESLint-Fehler/-Warnungen.
4. `npm run build` — Next.js Production Build erfolgreich (Exit 0).
5. `git status --short` — Ausschließlich `src/components/casino/games-catalog/WheelCarousel.tsx` verändert.
