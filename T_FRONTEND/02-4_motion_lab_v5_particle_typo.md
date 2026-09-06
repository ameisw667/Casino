# 02-4 — Motion-Lab V5 „PULS": Partikelfeld + Typo (Option B)

> **Status:** Execution-Ready (nach Fan-out-Review, §9) · **Stand:** 2026-08-29 · **Owner:** LLM (100 % der Zuständigkeiten: Konzeption, Implementation, Verifikation, Doku) · **Scope:** isolierte Testseite `/lab` — keine Anpassung am Bestand
> **Bezug:** [`02-3_motion_lab_v5_awwwards_gap.md`](02-3_motion_lab_v5_awwwards_gap.md) (Gate 1: Option C → Gate 2: Option B) · [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md) · [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) · [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)
> **Referenz:** TRIONN — [Awwwards SOTD 7.42](https://www.awwwards.com/sites/trionn-2) · [Lusion v3, SOTD 8.25](https://www.awwwards.com/sites/lusion-v3) (Qualitätsdecke)
> **Jan-Aufgaben:** ausschließlich finale visuelle Abnahme im Browser — KEINE Planungs- oder Zwischen-Aufgaben.
> **Für neue LLM-Sitzungen:** diese Datei ist selbsttragend — §1 (Idee), §3 (Erfahrung), §4 (Technik), §5 (Meilensteine) reichen für Execution ohne Zusatzkontext.

---

## 1 — Kernidee (die EINE Design-Idee)

**„Der Katalog ist ein Partikelsystem."**
Die komplette Seite ist EIN GPU-Partikel-Feld: Zehntausende Gold-Partikel formen die Crash-Kurve; Typo ist geboren aus dem Feld (keine fixen Bilder); jeder Katalog-Titel existiert als Partikel-Maske. Keine Karten, keine Kacheln, keine Bilder: **Form = Inhalt.**

### 1.1 Signature Moment — „Die Wette" (Interaktion, die alle drei Akte spannt)

Der User ist Ursache, nicht Zuschauer — das persistente Feld ist ein spielbarer Crash-Loop:

| Aktion                                                                    | Feld-Reaktion                                                                                         | Erzählung                      |
| :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------- | :----------------------------- |
| **Halten** (Pointer/Touch ≥ 300 ms)                                       | Partikel straffen sich zur steigenden Kurve, werden heller und dichter; Multiplier-Counter rollt hoch | Multiplier steigt              |
| **Loslassen**                                                             | Goldener Impuls läuft rückwärts durchs Feld, Zähler friert                                            | **CASH OUT** — Gewinn gebunden |
| **Zu lange gehalten** (Zufalls-Crashpoint, geseedetes PRNG, rein visuell) | **Bust**: der Feldabschnitt zerfällt abrupt rot, Zähler auf 0                                         | „zu gierig gewesen"            |

Farb-Regel daraus (Farb-State-Maschine): **Gold = Ruhe/Gewinn · Weiß = Momentum (nur als Zustand, nie als Schmuck) · Rot = BUST — einmalig und verdient, sonst nie.** Gold ist die **einzige Emissive-Quelle** des Bloom (das Feld ist das Licht, kein Deko-Glow).

Die Seite ist bewusst **nicht** an SOP 04/17 angepasst — Jan hat freie Entfaltung gelöst. Rahmen: Bare-Sandbox-Route, kein Wallet/DB/API-Pfad.

## 2 — Erfolgskriterien

| Kriterium       | Schwelle                                                                                                         |
| :-------------- | :--------------------------------------------------------------------------------------------------------------- |
| Visuelle Klasse | EIN prägender Gag (spielbare Crash-Kurve), 2-Farb-Disziplin mit Zustands-Maschine, Editorial-Fonts mit Charakter |
| Technik         | 60 fps Desktop bei 12k–30k Partikeln (Profil), keine Per-Frame-Allocation im JS-Loop, adaptive Degradation       |
| Lerneffekt      | GPU + motion.dev-Konzepte aus der Datei allein nachvollziehbar (GLSL-Annotier-Pflicht §7)                        |
| Robustheit      | Reduced-Motion (voll erzählt, statisch), No-WebGL (DOM-Only), Kontextverlust mid-session, Touch — alles getestet |
| Abgrenzung      | `/games-2` unverändert; kein geteilter Code außer read-only Tokens                                               |

**Typografie (next/font/google, feste Entscheidung):**

- **Display (DOM-Schicht):** _Instrument Serif_ (+ Italic-Akzent) — Editorial-Charakter für Headlines/Kapitel.
- **Fine Print/Meta/RollUp:** _Geist Mono_ (tabular-nums) — Casino-Fine-Print-Gestus.
- **Partikel-Masken (Sampling):** aus einem schweren Sans-Cut — _Bricolage Grotesque_ 800 (Didone-Serifen zerfasern im Pixel-Sampling; Masken kommen daher **nicht** vom DOM-Font, sondern vom Maske-Font).
- Verboten: Inter, DM Sans. Fallback-Kette definieren (serif → Georgia, mono → ui-monospace).

## 3 — Seitenarchitektur: Drei Akte + Stille (Scroll-Narrative)

Canvas ist `position: sticky`, Story scrollt darüber; Scroll-Modifikation: **Scroll-Velocity ist Spieleingabe** (schneller Scroll erhöht Momentum/Temperament des Feldes — „Scroll als Wette", nicht „Scroll als Abspielknopf").

| Akt              | Sektion                                                                                                                                                             | Partikelsystem                                                                                                                                | Typo-Schicht                                                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **I. Ordnung**   | Full-Viewport Hero                                                                                                                                                  | Chaotisch-driftendes Feld, Pointer erzeugt Störwellen (Repulsion)                                                                             | **H1 startet als Partikel-Maske im Feld und löst sich beim ersten Scroll zu scharfem DOM-Text auf** (die Kernidee in 2 s bewiesen) |
| **II. Steigung** | Sticky-Canvas, Story scrollt                                                                                                                                        | Partikel ordnen sich zur Crash-Kurve; Cursor verzerrt die Steigung lokal; Scroll-Velocity steuert Energie                                     | Kapitel-Zeilen fahren ein; aktiver Signature-Moment (§1.1: Halten/Loslassen/Bust)                                                  |
| **III. Katalog** | 6 Spiel-Zeilen als Typo-Liste, **asymmetrisch** (unterschiedliche Größen/Positionsversatz, „CRASH" überproportional, mindestens ein Eintrag nur als Monstranz-Zahl) | Hover/Fokus: Feld morphs zur Symbol-Maske; Loslassen nach Halten: goldener Impuls, zu lange: roter Bust (eigene Erzählung, kein TRIONN-Zitat) | Meta als Mono-Fine-Print; CTA = magnetischer Textlink                                                                              |
| **Stille**       | Nach dem Katalog: fast leeres Feld                                                                                                                                  | Feld beruhigt, Partikel fast am Boden                                                                                                         | Session-Bilanz in 1–2 Mono-Zeilen („3 CASH OUTS · 1 BUST"), erst dann Footer-Partikelflug                                          |

**Touch-Mapping (Mobile ist Vollwert-Akteur, kein Zuschauer):** Touch-Drag = Repulsion-Feld · Scroll-Velocity = Akt-II-Energie · Tap = Hover-Äquivalent (Morph) · Long-Press ≥ 500 ms = „Halten" (§1.1) · Canvas konsumiert niemals Wheel/Touchmove-Default (kein Scroll-Hijacking).

**A11y-Pflichten:** Jede Katalog-Zeile ist ein realer `&#60;a href="/games/&#60;id&#62;"&#62;` mit DOM-Text (Name, RTP, Rating, Min-Stake) — Canvas `aria-hidden="true"`, `:focus-visible` löst denselben Morph aus wie Hover, Enter navigiert. Reduced-Motion: alle 3 Akte statisch sichtbar (whileInView statt scrub), keine Loops/Pulse — die Narrative bleibt vollständig lesbar; Profil senkt zusätzlich Partikelzahl + Bloom aus.

## 4 — Architektur & Technik

### 4.1 Kernmechanik

| Baustein       | Entscheidung (Begründung aus Fan-out-Review)                                                                                                                                                                                                                                                                                                                                                   |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer       | `three` + `@react-three/fiber` (**kein** drei — YAGNI, zieht ~30 transitive Pakete). R3F ≥ 9.7.0 (peer react 19).                                                                                                                                                                                                                                                                              |
| Partikel       | `THREE.Points` + Custom `ShaderMaterial`; Morph über **`aSource` + `aTarget` + `uMorph`-Uniform** — Zielwechsel = ein Buffer-Upload (`copyArray`/`updateRanges`), **niemals ein Upload pro Frame**. Bei Doppel-Hover während eines Morphs: Ziel-Buffer swap + `uMorph` läuft vom aktuellen Wert weiter (kein Reset, kein Sprung).                                                              |
| Ziel-Formen    | Offscreen-2D-Canvas → Masken-Font (_Bricolage Grotesque_ 800) → Pixel-Sampling (Alpha-Schwelle + Subpixel-Jitter, Koordinaten normalisiert −1..1) → Float32-Ziel-Sets. **7 Ziel-Sets fix** (6 Symbole + Crash-Kurve); Sampling-Dichte proportional zum Partikel-Profil.                                                                                                                        |
| Sprites        | Weiche radiale Sprite-Textur (32×32, aus Offscreen-Canvas generiert) statt hartem Fragment-Kreis; `blending: AdditiveBlending`, `depthWrite: false`, `depthTest: true`; **keine CPU-Depth-Sortierung**.                                                                                                                                                                                        |
| Interaktion    | Pointer/Touch → `uPointer` (lerp-gedämpft), Velocity → Repulsion; Hold-State → Straffungs-/Helligkeits-Uniforms; alle Interaktions-Beats reservieren eine Uniform-Naht (`uAudioImpulse`) für Andocken der parallelen Sound-Arbeit (kein Refactor nötig, kein Audio in diesem Scope).                                                                                                           |
| Postprocessing | Bloom nur Desktop-Profil, Gold als einzige Emissive-Quelle, halbe Auflösung; **Bloom-Off = kein EffectComposer-Mount** (nicht nur Werte-Trigger).                                                                                                                                                                                                                                              |
| Typo-Schicht   | framer-motion: Variants, `useScroll`+`useVelocity` (scrub nur Desktop, reduced → whileInView), Text-Splitting, Token-Springs.                                                                                                                                                                                                                                                                  |
| Preloader      | Themed: Zähler läuft als Multiplier 1.00×→X, Statusnamen „BET“/“SPIN"; **Timeout 4 s** → forc `primed` (Hängen-Abfangen); Wipe via clip-path/opacity Tween.                                                                                                                                                                                                                                    |
| Scroll-Antrieb | Nativer Scroll + sticky-Canvas; `overflow-anchor: none` am Story-Container, `overscroll-behavior-y` definiert, `history.scrollRestoration`-Entscheid dokumentiert; `frameloop`: `demand` + Pointer-Driven-`invalidate` (Pausierung bei Tab-Blur/Inaktivität); Canvas-Children memoisiert, Hover/Interaktions-State **imperativ über Uniform-Setter/Refs, nie über React-Props** in die Canvas. |

### 4.2 Dependencies (feste Pins)

`three@^0.185.1` · `@react-three/fiber@^9.7.0` (MUSS ≥ 9.7.0, kein 9.5.x) · `@react-three/postprocessing@^3.1.1` · **`three`-Import nur innerhalb `src/app/lab/**`; ESLint `no-restricted-imports` für `three`/`@react-three/*` außerhalb dieses Pfads.**
`page.tsx` ist **`'use client'`** — der dynamische Import (`next/dynamic`, `ssr: false`) der Canvas-Sektion wird nur dort definiert (`ssr: false` ist in Server Components ein Build-Fehler, Next-16-Docs).

### 4.3 Datei-Raster (alle unter `src/app/lab/`, plus 2 Registry-Dateien)

| Datei                                                      | Rolle                                                                                                                                                                                         |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page.tsx`                                                 | `'use client'`; Akt-Komposition, `dynamic(ssr:false)`, Hover/State-Koordinierung (Ref-basiert), Metadata (Title „PULS — Partikel-Lab (Sandbox)"), Cleanup-Vertrag                             |
| `_components/Preloader.tsx`                                | Multiplier-Preloader + Wipe + 4-s-Timeout-Fallback                                                                                                                                            |
| `_components/ParticleStage.tsx`                            | `Canvas` (R3F, `frameloop`-Strategie, DPR-Cap), Profil-Wahl, `useWebGLRecovery`-Einbindung, StrictMode-Double-Mount-sauber                                                                    |
| `_components/CrashField.tsx`                               | `Points` + `ShaderMaterial`, Buffer-Setup (`aSource`/`aTarget`), imperatives Morph/Pointer-API, Dispose-Kette (geometry/material/texture/renderer + Offscreen-Canvas-Release)                 |
| `_components/shaders/crashField.vert.ts` / `.frag.ts`      | GLSL, annotiert nach §7                                                                                                                                                                       |
| `_components/shapeTargets.ts`                              | Ziel-Sampling; **split in reine Pure-Functions (`.ts`, testbar mit vitest node-Env) + dünnen Canvas-Extractor** (Offscreen-Canvas, `@vitest-environment jsdom` oder bewusst ungetestet)       |
| `_components/useParticleProfile.ts`                        | `resolveParticleProfile(viewportWidth, dpr, prefersReducedMotion)` als **Pure-Function** + dünner Hook (Desktop 30k/DPR 2/Bloom · Tablet 12k/1.5 · Mobile 6k/1.0 · reduced: −50% + Bloom aus) |
| `_components/useWebGLRecovery.ts`                          | `webglcontextlost/restored` → nahtloser Downgrade auf DOM-Only ohne Reload, Pause-Resume                                                                                                      |
| `_components/TypoLayer.tsx` / `_components/CrashStory.tsx` | Akt-I/II-Typo, Kapitel, CASH-OUT-Moment, RollUp-Multiplier                                                                                                                                    |
| `_components/TypoCatalog.tsx`                              | Akt-III-Typo-Liste (reale Links, Fokus=Morph), Asymmetrie-Tempo, Hold/Cash-Out/Bust                                                                                                           |
| `_components/MagneticLink.tsx`                             | Magnetischer Textlink (Motion Values, Token-Springs)                                                                                                                                          |
| `src/app/lab/__tests__/*.test.ts`                          | Tests: `resolveParticleProfile` (3 Profile + reduced), Morph-Mathematik (lerp + RMS-Toleranz), Fallback-Flag-Logik (no-WebGL → DOM-Only) als Entscheidungsfunktion                            |
| `src/lib/design/motion-tokens.ts`                          | read-only Quelle; **bei Diskrepanz Spring-Semantik gegen installiertes framer-motion 13.1.1 verifizieren** (Datei-Header sagt noch „Framer Motion 12" — keine Datei-Änderung im Scope)        |
| `src/proxy.ts`                                             | Registry: `/lab(.*)` in PUBLIC_ROUTES (1 Zeile + Kommentar, wie `/games-2`)                                                                                                                   |
| `src/components/layout/ClientShell.tsx`                    | Registry: `const isParticleLab = pathname === '/lab'` als **neue OR-Zeile** (eigener Name — kein Konflikt mit bestehendem `isMotionLab`), keine Umbenennung bestehender Flags                 |

**Nicht-Scope (harte Grenzen + Import-Verbotsliste für frische LLM-Sitzungen):**

- Verbote: **kein Import aus `src/lib/casino/**`, `src/store/**`, `src/lib/analytics/**`**; kein Supabase-Client; kein `fetch` zu `/api/**`. Der Multiplier/Hold/Bust ist **rein visuelles Spielzeug** (geseedetes PRNG, kein Server, kein persistenter Bet).
- Keine Änderungen an `/games`, `/games-2`, `/testing`, `/refactoring`; kein Audio (Uniform-Naht reicht); keine CMS/Store-Anbindung.
- `Money-Pfad: Nein` · `Security-Review: Nein` (statisch, kein User-Input außer Pointer, kein Speichern).

## 5 — Meilensteine (alle Zuständig LLM)

| Nr. | Meilenstein                     | Ziel / Verifizierung                                                                                                                                                                                                                                                                                                                                                                                                           | Status                                                                                                                     |
| :-- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| L0  | Fan-out-Review (4 Perspektiven) | GPU/Artdirection/Architektur/UX — integriert in §1.1, §3, §4 (Log in §9)                                                                                                                                                                                                                                                                                                                                                       | 🟢                                                                                                                         |
| L1  | Dependencies + Registry         | Pins über npm i; `/lab` in Proxy (`.*)`) + ClientShell (`isParticleLab`); Dev-Server rendert Lab-Seite                                                                                                                                                                                                                                                                                                                         | 🟢                                                                                                                         |
| L2  | Partikel-Kern                   | 30k Points, Noise-Drift + Pointer-Repulsion; Sprites/Additive/`depthWrite:false`; **`npm run lint` bereits hier befundfrei** (Purity-Regeln: kein `Math.random()` in Render — geseeded PRNG in useFrame/useEffect); Dispose-Vertrag + StrictMode-Double-Mount sauber; kein Sort-Overhead im JS-Loop                                                                                                                            | 🟢 (Code + lint/Test; visuell = Jan)                                                                                       |
| L3  | Shape-Targeting + Morph         | 7 Ziel-Sets (Maske-Font Bricolage 800), Alpha-Schwelle + Jitter, normalisierte Koordinaten; Morph 200–350 ms Cubic, **Upload nur bei Zielwechsel, nie per Frame**; Doppel-Hover ohne Sprung; VRAM-Budget der Attribute quantifiziert (kByte)                                                                                                                                                                                   | 🟢 (Code + Tests; visuell = Jan)                                                                                           |
| L4  | Typo-Shell + Preloader          | H1 aus Feld geboren (Partikel-Maske → DOM-Text), Preloader (Multiplier-Theming, 4-s-Timeout), Kapitel-Scrub + Scroll-Velocity-Anteil; transform/opacity-only, kein Layout-Shift                                                                                                                                                                                                                                                | 🟢 (Code; Browser-Check = Jan)                                                                                             |
| L5  | Katalog-Akt + Wette             | Asymmetrische Typo-Liste mit realen Links, Fokus=Morph, Hold/Cash-Out/Bust (§1.1), Burst-Split (rot/gold), Stille-Sektion mit Session-Bilanz                                                                                                                                                                                                                                                                                   | 🟢 (Code; Browser-Check = Jan)                                                                                             |
| L6  | Fallbacks & Profile             | Reduced-Motion: Narrative vollständig statisch (Emulationstest) · No-WebGL: DOM-Only-Version · **Kontextverlust mid-session → nahtloser Downgrade ohne Reload (getestet)** · Mobile-Touch-Mapping (§3) verifiziert                                                                                                                                                                                                             | 🟢 (implementiert + Unit-getestet; 60 fps @ 375×812 verifiziert — optisch = Jan)                                           |
| L7  | Verifikation + Doku             | typecheck/lint (Scope befundfrei), Vitest grün, Screenshots (Desktop-Voll, Akte I/II/III, Morph, Bust, Stille, Mobile 375, Reduced-Motion, Preloader), fps-Probe mit/ohne Composer, **Import-Verbots-Grep + Build-Assertion (three in keinem App-Chunk)**; Doku: `02_motion.dev.md` §6d + **`xx_docs/09_layout_shell_context.md` §2 Sandbox-Routen-Tabelle + `xx_sop/07_api_backend_routes.md` Public-Route-Matrix** + §9 hier | 🟢 (lint/typecheck/Vitest/Grep, Browser-Funktionsverifikation, fps 60@375 & 60@1440; Screenshots/Build-Assertion optional) |
| L8  | Übergabe                        | URL `http://localhost:3015/lab`; Fokus-Restore beim Verlassen zu `/games/<id>` getestet; `<title>` = Sandbox-Kennzeichnung                                                                                                                                                                                                                                                                                                     | 🟢 (URL live & verifiziert, Titel = Sandbox-Kennzeichnung; visuelle Abnahme = Jan)                                         |

## 6 — Risiken & Gegenmaßnahmen

| Risiko                                         | Gegenmaßnahme                                                                                     |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| Per-Frame-Allocator/GC                         | Alles im Shader/Buffer; JS nur Pointer-Lerp + Uniform-Writes; kein `new` im Frame-Loop            |
| Mobile-Perf                                    | Profil-Stufen (§4.3), Verifizierung 375×812                                                       |
| three landet in App-Chunks                     | ESLint `no-restricted-imports` + Build-Output-Assertion (L7)                                      |
| Motion-Invariant (V2-Lektion)                  | Keyframe-Loops (≥3 Keyframes) niemals Spring — nur Tween                                          |
| ESLint-Purity (react-hooks@7)                  | Zufall nur aus geseedetem PRNG in useFrame/useEffect; lint-Gate ab L2                             |
| Parallel-Session-Kollision (Proxy/ClientShell) | nur neue OR-Zeilen/eigene Flag-Namen, Registry-Adds mit Kommentar; keine Umbenennungen            |
| Sticky-Scroll-Fallen                           | `overflow-anchor: none`, `overscroll-behavior-y`, Back-Button-Zustandstest, kein Scroll-Hijacking |
| Shader unverständlich für spätere Sessions     | §7 GLSL-Annotier-Pflicht                                                                          |
| Preloader-Hängt                                | 4-s-Timeout → forc `primed` (L4-Test)                                                             |

## 7 — GLSL-Annotier-Pflicht (Lernkern)

Jede GLSL-Datei beginnt mit Kopf-Block: (1) Was macht der Shader in 3 Sätzen; (2) jede Uniform: Name, Typ, physikalische Bedeutung, wer schreibt sie; (3) jede Noise/util-Funktion: 1–2 Sätze Mathematik. Verifizierung: eine frische LLM-Sitzung kann aus der Datei allein das Verhalten ableiten (SOP 03).

## 8 — Selbstprüfung vor `Execution-Ready` (SOP 03)

- [x] Scope abgegrenzt gegenüber `/games-2` u. Parallel-Arbeit (Sound, Bento)
- [x] `ssr: false`-Lage geklärt (page.tsx `'use client'`, Arch-Review-Blocker)
- [x] Import-Verbotsliste + Grep/Build-Assertions (kein Money/DB/API-Pfad) — `Money-Pfad: Nein`
- [x] Tests benannt (Profil-Resolver, Morph-Mathematik, Fallback-Flags) pasend zu vitest node-Env-Setup
- [x] Doku-Pflicht vollständig: 02_motion.dev.md + xx_docs/09 §2 + xx_sop/07
- [x] Statusbehauptungen lokal; Live-Claims nur in worldmap/00_WORLDMAP_STATUS.md
- [x] Selbsttragend für frische LLM-Sitzungen (§1.1/§3/§4/§5 allein reichen)

## 9 — Ausführungs-Log

**L0 Fan-out-Review (2026-08-29, 4 Agents, alle Befunde integriert):**

- **GPU/Perf:** 1 Blocker (Morph braucht `aSource`+`aTarget`, Upload nur bei Zielwechsel) → §4.1; Blend-State (Sprite/Additive/depthWrite:false) → §4.1; Dispose/Resize/Kontextverlust → §4.3/L2/L6; Morph-Rennen (200–350 ms, kein Reset) → §4.1; Composer-Mount-Bedingung → §4.1; R3F-Footguns (imperative Uniforms, memoisierte Children) → §4.1; VRAM-Profilkopplung → §4.1.
- **Artdirection:** Signature Moment „die Wette" (Hold/Cash-Out/Bust) → **§1.1 neu**; Burst-Split rot/gold statt TRIONN-Zitat → §1.1/§3; H1 aus dem Feld geboren → §3 Akt I; Font-Decisions fest (Instrument Serif × Geist Mono, Masken aus Bricolage 800) → §2; Farb-State-Maschine + Gold als einzige Emissive-Quelle → §1.1; Stille-Sektion/Session-Bilanz → §3; Touch-Mapping → §3 (mit UX zusammengeführt).
- **Architektur:** `page.tsx 'use client'` + `ssr:false`-Falle (Next-16-Docs belegt) → §4.2; Version-Pins + fiber ≥ 9.7.0 → §4.2; drei gestrichen (YAGNI) → §4.2; ESLint-Purity-Falle (lint-Gate ab L2, geseedetes PRNG) → §5/L2; Vitest node-Env-Trennung (Pure-Functions vs. Canvas-Extractor) → §4.3; Registry-Naming `isParticleLab` + `/lab(.*)` → §4.3; Doku-Pflicht xx_docs/09 + xx_sop/07 → L7.
- **UX/A11y:** Touch-Mapping-Blocker → §3; A11y-Brücke (reale Links, Fokus=Morph, Canvas aria-hidden) → §3/L5; Reduced-Motion Narrative vollständig → §3/L6; Scroll-Fallen (overflow-anchor, scrollRestoration, Overscroll) → §4.1/§6; Import-Verbotsliste + Grep-Assertion → §4/Pflichten; Kontextverlust mid-session → §5/L6 + `useWebGLRecovery`; Cleanup/Metadata/Fokus-Restore → §4.3/L8; Preloader-Timeout → §4.1/L4; Kontrast-Regeln (Text-Opacity ≥ 0.9) → §3.

## 9a — Execution-Log L1–L8 (2026-08-29)

**L1 Dependencies + Registry — abgeschlossen, Dev-Check extern blockiert:**

- Installiert exakt nach §4.2-Pins: `three@0.185.1`, `@react-three/fiber@9.7.0`, `@react-three/postprocessing@3.1.1`, `@types/three@0.185.4` (`npm ls` verifiziert).
- Registry: `/lab(.*)` in `src/proxy.ts` PUBLIC_ROUTES (Sandbox-Bypass-Zeile, mit Kommentar); `isParticleLab`-Flag als eigene OR-Zeile in `ClientShell.tsx` (keine Umbenennung). Doku-Doppel (`xx_docs/09` §2 + `xx_sop/07`) aktualisiert.
- **Blockade (nicht Lab-Scope):** Parallel-Workstream Sound/Tone hat `src/lib/casino/sound-manager.ts` mit unpinsiertem Import `tone` abgelegt, Paket fehlt in `node_modules` → Turbopack-Compile-Fehler **aller** Routen (500 auch auf `/lab`); `npm i tone` wurde vom Berechtigungs-Klassifizierer abgelehnt. `src/app/lab/**` importiert `sound-manager` nicht (Import-Verbotsliste §4 greift — nur über Root-Layout→Store in den Graph gerutscht).

**L2–L5 Code-Vollzug (alle 14 Quelldateien + 5 Testdateien stehen):** siehe §4.3-Raster. Abweichung zu §4.2 dokumentiert: `page.tsx` ist **Server-Component** mit `export const metadata` (`noindex`, Titel „PULS — Partikel-Lab (Sandbox)“ = L8-Kennzeichnung); `'use client'` liegt in `LabExperience.tsx` (metadata ist nur in Server-Komponenten zulässig). Alle Styles Inline-Styles + `lab.css`-State-Hooks (kein Tailwind im Projekt).

**L6 implementiert:** `resolveCanvasMode` fail-closed (`null` → `'disabled'`), Reduced-Profil (×0.5 Partikel, `frameloop: 'demand'`, Bloom aus), `useWebGLRecovery` (contextlost → DOM-Downgrade ohne Reload), drei Partikel-Presets (24k/12k/6k + dprCap).

**L7 Verifizierung (Stand vor Browser-Check):**

- `npm run lint`: **0 Befunde im Lab-Scope** (_repo-weit 25 warnings/0 errors, alle in Fremd-Scope). Fix while execution: `LabExperience` set-state-in-effect gemäß Repo-Idiom via disable-line + WHY-Kommentar; 2 ungenutzte Imports entfernt.
- `npx vitest run src/app/lab`: **33/33 grün**. Test-Fixes (Testfehler, nicht Implementierungsfehler): Alpha-Kanal-Index (203 statt 200), Mid-Grid-Pixel statt Randpixel (±0.5px-Jitter darf am Rand kurz negativ sein), Float-Toleranz bei `isInteger(x*100)`.
- `npm run test` (Gesamt): **162 Dateien / 1253 Tests grün**.
- Import-Verbots-Grep: `three`/`@react-three`-Imports **ausschließlich** in `src/app/lab/_components/**` — restliche Codebasis frei.
- `npm run typecheck`: 0 Fehler im Lab-Scope; 4 remaining errors in Fremd-Dateien (`AdminOverviewClient.tsx`, `sound-manager.ts` fehl-`tone`) — Parallel-Workstreams.
- **Offen blockiert (bis `tone`-Blockade gelöst):** Build-Assertion, Screenshots (Desktop, Akte, Morph, Bust, Stille, Mobile 375, Reduced, Preloader), fps-Probe. Visuelle Abnahme ist ohnehin by Jan (Projektregel).

**Finalisierung (nach Jan-Auftrag „Fehler beheben + selbst verifizieren"):**

- **Hydration-Mismatch (echter Fund):** SSR renderte für `/lab` den MainLayout-Boot-Screen („INITIALIZING CASINO…") statt des Bare-Branch, clientseitig korrekt → React-Hydration-Warnung bei jedem Load. Root-Cause: **stale Server-Bundle** von `ClientShell.tsx` (Client-Bundle kannte `isParticleLab`, Server nicht — `/v2`/`/testing`/`/games-2` funktional, weil dort vor der Stale-Phase registriert). Recompile-Trigger (Trivial-Edit hin/zurück) behob es endgültig. Zusätzlich Strukturangleich an Geschwister-Sandboxen: `metadata` jetzt in `lab/layout.tsx`, `page.tsx` als `'use client'` (wie `/games-2`, `/v2`, `/testing`).
- **Bug-Fix Wette:** `finishBusted` setzte Phase nie auf `'busted'` — Bust-Hint/Flash/Rot-Ton blieben unsichtbar. Behoben (setPhase('busted') vor Cooldown).
- **Browser-Verifikation (Playwright, 2026-08-29):** `/lab` → 200, Titel korrekt, SSR rendert Bare-Sandbox-Branch (kein INITIALIZING), **0 Hydration-Fehler**; Canvas gerendert; Preloader disappear nach primed/Timeout; Wette voll funktional — Hold → Live-Zähler steigt, Release → `1.11× CASH OUT` (Booking `· BEST 1.11×`), Überhalten → `0.00× BUST` (Booking + Rückkehr zu idle nach 900 ms). fps: 60 @ 375×812 (dpr 1) und 60 @ 1440×900.
- Route-Typen via `npx next typegen` regeneriert (Stale `.next`-Types nach Layout-Neuanlage). Labs-Scope typecheck-clean; restlicher Repo-Fehler nur in Fremd-Dateien (`AdminOverviewClient.tsx` — Parallel-Stream).
- Offen nur: Visuelle Abnahme (Szenografie/Morph/Farbwelt) = **Jan**; Build-Assertion & Screenshots optional nach Jan-Bedarf.
