# 02 — FE-02 Dice V2 Backdrop Artwork & Visual Upgrade

> **Status:** 🟢 Executed (verifiziert) · **Stand:** 2026-09-04 · **Owner:** LLM (100 % Zuständigkeit LLM, 0 % Jan)  
> **Scope:** Erzeugung und Integration des neuen 16:9-Hintergrundbildes `backdrop-dice-quantum-felt` in `/dice/v2` (`/games/dice/v2`), Ablösung des flachen CSS-Farbverlaufs, Wahrung des 100 % Kontrasts für den 3D-Würfel und die Steuerelemente.  
> **Bezug:** [`public/images/21_dice_v2_backdrop_artwork.md`](../../public/images/21_dice_v2_backdrop_artwork.md) · [`worldmap/02_fe02_dice_3d_v2_plan.md`](./02_fe02_dice_3d_v2_plan.md) · [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md) · [`xx_sop/04_design_system_ui.md`](../../xx_sop/04_design_system_ui.md)

---

## 1 — Übersicht für Jan (100 % LLM-Zuständigkeit)

| Nummer | Meilenstein                                                   |   Status    | Nächster Schritt                                                                 | Zuständigkeit |
| :----- | :------------------------------------------------------------ | :---------: | :------------------------------------------------------------------------------- | :-----------: |
| **L0** | Prompt-Design & Safe-Zone-Architektur (Option A)              | 🟢 Executed | Dreistufiger Prompt mit negativen Zonen fertiggestellt                           |      LLM      |
| **L1** | Kosten- & Budget-Validierung vor Ausführung                   | 🟢 Executed | Dry-Run geprüft: ~0.12 USD (0.8 / 20 USD verbraucht)                             |      LLM      |
| **L2** | OpenAI API Bild-Generierung via `generate-design-assets.ts`   | 🟢 Executed | Generiert: `2026-09-04_backdrop-dice-quantum-felt_v001.png` (1.96 MB, ~0.12 USD) |      LLM      |
| **L3** | Frontend-Integration in `DiceCenterStageV2.tsx`               | 🟢 Executed | Eingebettet als Layer-0 mit Vignette und dynamischem Spotlight                   |      LLM      |
| **L4** | Visuelle Prüfung, Typecheck & Responsive-Audit (375px–1440px) | 🟢 Executed | TypeScript, Lint & Browser-Abnahme erfolgreich verifiziert                       |      LLM      |

---

## 2 — Zielbild & Sicherheitsgrenzen

### Zielbild

- Die Spielbühne auf `/dice/v2` erhält eine spektakuläre, tiefenräumliche Textur aus Kaschmir-Filz, Obsidian-Marmor und mikrodünnen Goldlinien.
- Das Zentrum bleibt ruhig und abgedunkelt, sodass der physische 3D-Titanwürfel, die Ziffern und der Slider in voller Brillanz zur Geltung kommen.
- Keine Beeinträchtigung der Hauptvariante `/games/dice` (bleibt 100 % isoliert).

### Nicht-Ziele

- Keine Änderungen an Spielregeln, Wallet oder Backend-APIs.
- Kein Überladen des Zentrums (strikte Safe-Zone-Einhaltung).
