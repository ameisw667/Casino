# 21 — Dice V2 Stage Backdrop Artwork (Option A: Obsidian Felt & Quantum Grid)

> **Status:** 🟢 Executed (verifiziert) · **Stand:** 2026-09-04 · **Owner:** LLM (100 % Zuständigkeit LLM, 0 % Jan)  
> **Scope:** Erzeugung und Integration eines hochauflösenden 16:9 Hintergrund-Artworks (`1536x1024`) für die Dice V2-Bühne (`/dice/v2` bzw. `/games/dice/v2`). Subtiler High-Roller-Hintergrund, der den flachen CSS-Farbverlauf ablöst, ohne das Spielgeschehen zu überlagern.  
> **Bezug:** [`docs/archive/02_fe02_dice_3d_v2_plan.md`](../../docs/archive/02_fe02_dice_3d_v2_plan.md) · [`public/images/00_IMAGES_OVERVIEW.md`](./00_IMAGES_OVERVIEW.md) · [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md)

---

## 1 — Übersicht für Jan (100 % LLM-Zuständigkeit)

| Nummer | Meilenstein                                       |   Status    | Nächster Schritt                                                                                                 | Zuständigkeit |
| :----- | :------------------------------------------------ | :---------: | :--------------------------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Konzept-Iteration & Prompt-Engineering (Option A) | 🟢 Executed | Dreistufiger Prompt mit negativen Safe-Zones & Exclusions fertig                                                 |      LLM      |
| **L1** | Kosten-Governance & Dry-Run-Validierung           | 🟢 Executed | Dry-Run erfolgreich geprüft (~0.12 USD; Monatsbudget 0.8/20 USD)                                                 |      LLM      |
| **L2** | OpenAI API Bild-Generierung (`1536x1024`, Medium) | 🟢 Executed | Erfolgreich generiert: `2026-09-04_backdrop-dice-quantum-felt_v001.png` (1.96 MB, sha256: `cefda66f`, ~0.12 USD) |      LLM      |
| **L3** | Frontend-Integration in `DiceCenterStageV2.tsx`   | 🟢 Executed | Eingebettet als Layer-0 Backdrop mit abdunkelnder Luxus-Vignette                                                 |      LLM      |
| **L4** | E2E- & Responsive-Verifikation im Browser         | 🟢 Executed | TypeScript, Lint & Browser-Visualisierung verifiziert                                                            |      LLM      |

---

## 2 — Drei Iterationsstufen (Workflow-Jan Iteration 1–3)

### Iteration 1: Grundlagen-Entwurf (Baseline)

- **Fokus:** Smaragdgrüner Kaschmir-Filz mit Goldkante.
- **Entwurf:** `Green casino poker table surface with gold borders and soft lighting`.
- **Kritik / Schwachstelle:** Zu brav und altmodisch; wirkt wie ein Standard-Pokertisch aus den 90er Jahren; fehlt der futuristische Quantum-Gold-Vibe von `/games`.

### Iteration 2: Quantum-Grid & Material-Tiefe

- **Fokus:** Einarbeitung des Obsidian & Gold Design-Systems (`#0B0E14`, `#D4AF37`), Übergang von Kaschmir in Obsidian-Marmor.
- **Entwurf:** `Luxury casino game stage, deep dark emerald green cashmere felt table surface fading into polished black obsidian marble at edges, fine champagne gold grid lines (#D4AF37)`.
- **Kritik / Schwachstelle:** Gefahr, dass das Bildzentrum zu hell oder unruhig wird und mit dem 3D-Würfel und den Ziffern konkurriert.

### Iteration 3: Finaler Meister-Prompt (Backdrop Safe-Zone)

- **Fokus:** Maximale Ruhe im Zentrum (negativer Raum), cinematische 16:9-Winkelung, zarter Goldstaub und bernsteinfarbener Bokeh in der oberen Peripherie, tiefe dunkle Vignette an den Rändern und unten für die Bedienelemente.
- **Finaler Prompt:**
  > `Atmospheric luxury casino game background stage, cinematic wide angle 16:9, deep dark obsidian emerald green cashmere felt table surface fading into polished black obsidian marble at the edges, ultra fine elegant champagne gold perspective grid lines (#D4AF37) subtly etched into the floor, empty calm center stage designed as negative space for floating objects, soft volumetric amber spotlight beaming down from above, floating microscopic golden dust motes and soft warm bokeh in the upper periphery, deep dark vignette at borders and bottom, clean minimalist luxury composition, photorealistic 8k render, masterpiece`

---

## 3 — Ziel & Technische Spezifikation

- **Asset-Name:** `backdrop-dice-quantum-felt`
- **Kategorie:** `background`
- **Format:** `1536x1024` (16:9 Widescreen)
- **Qualität:** `medium`
- **Kosten:** ~0.12 USD (voll gedeckt durch Monatslimit)
- **Money-Pfad:** Nein
- **Security-Review:** Nein
