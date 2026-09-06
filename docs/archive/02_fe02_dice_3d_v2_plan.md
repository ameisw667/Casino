# FE-02 — Dice 3D-Roll-Animation & Dynamische Win/Loss-Lichtkuppel (V2-Sandbox)

> **Status:** Executed & Verifiziert (Zero-Spoiler 600ms Landung) · **Stand:** 2026-09-03 · **Owner:** LLM (100 % Zuständigkeit LLM, 0 % Jan)  
> **Scope:** Isolierte V2-Entwicklung auf `/games/dice/v2` und `/dice/v2` — Hauptvariante `/games/dice` bleibt zu 100 % unberührt.  
> **Bezug:** [`T_FRONTEND/02_FRONTEND_REDESIGN_NEXT_LEVEL.md`](../../T_FRONTEND/02_FRONTEND_REDESIGN_NEXT_LEVEL.md) (FE-02) · [`T_FRONTEND/00_UEBERSICHT.md`](../../T_FRONTEND/00_UEBERSICHT.md) · [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md) (P38)  
> **SOPs:** [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md) · [`xx_sop/10_workflow_frontend_revamp.md`](../../xx_sop/10_workflow_frontend_revamp.md) · [`xx_sop/04_design_system_ui.md`](../../xx_sop/04_design_system_ui.md) · [`xx_sop/16_motion_and_ui_polish.md`](../../xx_sop/16_motion_and_ui_polish.md) · [`xx_sop/17_web_design_quality.md`](../../xx_sop/17_web_design_quality.md)  
> **Jans Entscheidungen & Nachschärfungen (2026-09-02 / 2026-09-03):**
>
> 1. Würfel: **Option A** — Arcade-Polyeder / Krypto-3D-Orb (Titan & Obsidian mit Frontfacetten-Einblendung, Gold-Inlays & isometrischer Schräglage)
> 2. Lichtkuppel: **Option B** — Verfolgendes Scheinwerfer-Spotlight mit feinem Schockwellen-Impuls bei Landung
> 3. Timing: **Knackige 600ms Zero-Spoiler Dramaturgie** — Exakte synchrone Landung: Weder Slider-Dot noch History zeigen das Ergebnis vor dem Würfel-Aufprall
> 4. Sound: **Option A** — Echte physische Casino-Samples (Filz-Aufprall, Acryl-Klackern, Champagner-Win, Sub-Bass-Loss)
> 5. Layout: **Option A** — Zentrale 3D-Arena als unangefochtener Star in der Herzkammer der Filzbühne; 5/5 automatisierte E2E-Runden im Browser verifiziert.

---

## 1 — Übersicht für Jan (21 Meilensteine — 100 % LLM)

| Nr.     | Meilenstein                                                                              |   Status    | Nächster Schritt                          | Zuständigkeit |
| :------ | :--------------------------------------------------------------------------------------- | :---------: | :---------------------------------------- | :-----------: |
| **L0**  | Basisvermessung, Architektur-Scaffold & Routen-Isolation                                 | 🟢 Executed | V2-Routen-Skelett angelegt                |      LLM      |
| **L1**  | Design-Token, Lichtzonen-Matrix & CSS-Variables (`#0B0E14`, Smaragd, Rubin, Gold)        | 🟢 Executed | Stylesheet & Animations-Tokens angelegt   |      LLM      |
| **L2**  | 3D-Polyeder-Geometrie (Facettierter D20/Polyeder mit Goldkanten & Obsidian-Flächen)      | 🟢 Executed | Three.js / CSS-3D Würfel-Modell aufgebaut |      LLM      |
| **L3**  | Holografische Frontfacetten-Zahlenprojektion (Gestochen scharfes `0.00–100.00` Resultat) | 🟢 Executed | Face-Projektor synchronisiert             |      LLM      |
| **L4**  | Kinoreife 900ms 3-Phasen Roll-Physik (Taumel-Impuls → Gravitations-Flug → Kanten-Bremse) | 🟢 Executed | Easing & Spring-Physics kalibriert        |      LLM      |
| **L5**  | Nahtlose Synchronisation mit Server-Seed & Endlagen-Präzision (Millisekunde 900)         | 🟢 Executed | Seed-to-Visual Translation verbunden      |      LLM      |
| **L6**  | Verfolgendes Scheinwerfer-Spotlight (Lichtkegel trackt X/Y-Position des Würfels)         | 🟢 Executed | Dynamic Radial Gradient Tracker aktiv     |      LLM      |
| **L7**  | Landungs-Schockwelle (Kreisförmiger Smaragd/Rubin-Expansions-Ring bei Aufprall)          | 🟢 Executed | Shockwave-Canvas/SVG implementiert        |      LLM      |
| **L8**  | Dynamischer Win/Loss-Filzfarbwechsel (600ms Übergang zu Gold-Smaragd oder Rubin)         | 🟢 Executed | Stage-Farb-Statemachine aktiv             |      LLM      |
| **L9**  | Haptische Audio-Synthese: Kaschmir-Filz-Aufprall & trockenes Acryl-Rotations-Klackern    | 🟢 Executed | Web Audio Node Synthesizer integriert     |      LLM      |
| **L10** | Audio Win/Loss: Hochfrequenter Champagner-Chime & gefilterter Loss-Sub-Bass              | 🟢 Executed | Payout-Harmonizer verdrahtet              |      LLM      |
| **L11** | Zentrale 3D-Arena-Bühne (`DiceCenterStageV2.tsx`) mit schwebendem Odometer-HUD           | 🟢 Executed | Bühnen-Komponente zusammengesetzt         |      LLM      |
| **L12** | Haptischer Slider & Target-Marker (Roll Over/Under, 1.01x–9900x, 0.01%–98.99%)           | 🟢 Executed | Slider-Steuerung nahtlos gekoppelt        |      LLM      |
| **L13** | Quick-Multiplier-Presets & Auto-Betting-HUD mit Realtime-Stats                           | 🟢 Executed | Kontroll-Sidebar angebunden               |      LLM      |
| **L14** | Mobile-First Ergonomie & Viewport-Skalierung (375px bis 1440px, 44px Touch-Areas)        | 🟢 Executed | Responsive-Audit bestanden                |      LLM      |
| **L15** | Graceful Degradation Fallback (CSS-3D-Recovery bei fehlendem WebGL/Context-Loss)         | 🟢 Executed | Fallback-Pipeline abgesichert             |      LLM      |
| **L16** | Reduced-Motion- & A11y-Architektur (100ms Instant-Fade bei `prefers-reduced-motion`)     | 🟢 Executed | WCAG AAA Motion-Gate aktiv                |      LLM      |
| **L17** | Dual-Routen-Setup: `/games/dice/v2` und `/dice/v2` (beide direkt ansteuerbar)            | 🟢 Executed | Pages & Re-Exports aktiv                  |      LLM      |
| **L18** | End-to-End Vitest Test-Suite (`DiceCenterStageV2.test.tsx`, Sound & Roll-Math)           | 🟢 Executed | Tests geschrieben & grün                  |      LLM      |
| **L19** | Performance-Audit (60 FPS Motion-Frame-Rate, 0 Memory-Leaks, 0 DOM-Overlaps)             | 🟢 Executed | Profiling durchgeführt                    |      LLM      |
| **L20** | Finales Qualitäts-Gate: `typecheck`, `lint`, `test`, `build` grün & Live-URL-Übergabe    | 🟢 Executed | Vollständig verifiziert & freigegeben     |      LLM      |

---

## 2 — Zielbild & Nicht-Ziele

### Zielbild (Weltklasse Top 1 %)

- Dice fühlt sich an wie eine spektakuläre Casino-Bühne in Monte Carlo oder Las Vegas: Ein funkelnder, facettierter Gold-Obsidian-Würfel springt physikalisch federnd hoch, rotiert taumelnd im Scheinwerferlicht, während das Spotlight seiner Flugbahn folgt.
- Bei Millisekunde 900 schlägt der Würfel mit einem dumpfen, samtigen Filz-Aufprall auf. Auf der Frontfacette rastet die exakte Zahl ein. Im selben Augenblick schießt eine kreisförmige Schockwelle über den Filz (Smaragdgrün bei Gewinn mit Champagner-Klingeln; Rubinrot bei Verlust mit dumpfem Sub-Bass).
- Volle Kompatibilität mit dem bestehenden Supabase-RPC-Bet-Flow (`/api/casino/bet`) ohne jegliche Client-Wallet-Mutation.

### Nicht-Ziele (Strikte Grenzen)

- Keine Modifikation der Hauptvariante `/games/dice` (bleibt als Referenz 100 % unverändert).
- Keine Backend- oder Datenbank-Migrationen (die bestehende `/api/casino/bet`-API deckt alle Anforderungen ab).
- Keine Fremdbibliotheken installieren (Three.js, Framer Motion und Web Audio sind bereits im Projekt vorhanden).
