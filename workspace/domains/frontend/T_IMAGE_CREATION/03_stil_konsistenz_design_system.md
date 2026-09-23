# 03 — Stil-Konsistenz & Design-System-Harmonisierung

> **Status:** 🟢 Solide Basis (Top 30 %) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Härtung der fotometrischen Farbtokens (#0B0E14, #D4AF37) und Style-Presets. Nächster Schritt für Top 1–5 %: 3D-LUT Farb-Grading zur Überwindung von Diffusions-Farbdrift.
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 03

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                             | Scope (Dateien)                                        | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                                           |
| :----- | :-------------------------------------- | :----------------------------------------------------- | :---------: | :--------------: | :-----------: | :----------------------------------------------------------------------------------------------------- |
| **L0** | **Baseline & Farb-Drift-Audit**         | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Farbschwankungen eliminiert durch Härtung der Champagner-Gold-Tokens (`#D4AF37`)                       |
| **L1** | **Fotometrische Material-Token-Engine** | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Injektion exakter Hex-Werte (`#0B0E14`, `#D4AF37`, `#10B981`, `#EF4444`) und Studio-Licht-Parameter    |
| **L2** | **Kategoriespezifische Style-Sheets**   | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Differenzierung für `hero`, `icon`, `badge`, `backdrop`, `avatar`, `ui` umgesetzt                      |
| **L3** | **Blacklist & Negativ-Filterung**       | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Strikte Ausschlussliste (`shiny plastic`, `neon yellow`, `garish yellow`, `cheap stock render`)        |
| **L4** | **Multi-Asset-Konsistenz-Test**         | `src/lib/design-assets/__tests__/style-preset.test.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Unit-Tests prüfen Einhaltung aller Farb- und Material-Tokens über alle 6 Kategorien (10/10 Tests grün) |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Style-Presets:** [`src/lib/design-assets/style-preset.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/style-preset.ts)
- **Design-System SOP:** [`xx_sop/04_design_system_ui.md`](file:///v:/VibeCoding/Casino/xx_sop/04_design_system_ui.md) (Obsidian & Gold Standard)
- **Test-Suite:** [`src/lib/design-assets/__tests__/style-preset.test.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/__tests__/style-preset.test.ts)

### 2.2 Systemregeln & Invarianten

- **Gold-Invariante:** Strikte Verwendung von `"Champagne gold #D4AF37, brushed satin texture, warm amber highlights, strictly no neon yellow"`.
- **Obsidian-Invariante:** Hintergründe müssen `"Deep luxury obsidian black #0B0E14 with subtle vignette"` sein; kein flaches Grau.
- **Lichtquellen-Invariante:** Fester Lichteinfall: `"Key light from 45 degrees top-left, soft rim lighting"`.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & Farb-Drift-Audit

- **Ziel:** Identifikation aller Stellen, an denen unpräzise Vokabeln („gold“, „bright“, „shiny“) verwendet werden.
- **Verifikation:** Audit-Report der aktuellen String-Tokens in `CATEGORY_STYLE_PRESETS`.

### L1 — Fotometrische Material-Token-Engine

- **Ziel:** Einheitliche physikalische Materialeigenschaften für alle gerenderten Oberflächen.
- **Spezifikation:**
  - Metall: Anodisiertes gebürstetes Messing und poliertes Champagner-Gold.
  - Glas: Frosted Obsidian Glass mit 12px Unschärfe und subtilen Glanzkanten.
  - Stoff: Schwer gewebter Casinotisch-Filz (`felt-table-weave`).
- **Verifikation:** `npm run typecheck` Exit 0.

### L2 — Kategoriespezifische Style-Sheets

- **Ziel:** Jede Asset-Klasse erhält ihren maßgeschneiderten Render-Deskriptor:
  - `hero`: 16:9 Widescreen, cinematische Weite, Partikelstaub, Tiefenunschärfe.
  - `icon`: Isometrisch, kräftige Kanten, silhouette-optimiert für 16px–32px.
  - `badge`: 3D-Relief, facettierte Kanten, Medaillon-Einfassung.
  - `backdrop`: Nahtlos kachelbare oder weich verlaufende Texturen.
- **Verifikation:** Assertions in Unit-Tests.

### L3 — Blacklist & Negativ-Filterung

- **Ziel:** Automatisches Ausfiltern unerwünschter Stil-Elemente.
- **Spezifikation:**
  - Global Exclusions: `"cartoon, anime, 2d flat vector, low-poly, cheap plastic, oversaturated yellow, neon glow, watermark, signature, blurry"`.
- **Verifikation:** Unit-Test belegt Vorhandensein in allen zusammengesetzten Prompts.

### L4 — Multi-Asset-Konsistenz-Test

- **Ziel:** 100 % Testabdeckung für die Style-Engine.
- **Testfälle:**
  1. Alle 5 Kategorien (`hero`, `icon`, `badge`, `backdrop`, `avatar`) binden `#0B0E14` und `#D4AF37` ein.
  2. Ausschlussliste wird vollständig an den Prompt angehängt.
  3. Benutzerdefinierte Prompts werden nicht von Presets verstümmelt.
- **Verifikationsbefehl:** `npm test src/lib/design-assets/__tests__/style-preset.test.ts`.

---

## 4 — Expliziter Nicht-Scope

- **Keine Änderung an UI-Komponenten:** Die CSS-Variablen in Tailwind bleiben unverändert; dieser Plan steuert ausschließlich den Bild-Prompt-Compiler.

---

## 5 — Fail-Closed & Rollback

- **Abbruchkriterium:** Werden in generierten Prompts verbotene Begriffe der Blacklist gefunden, schlägt der Test fehl.
- **Rollback:** `git checkout src/lib/design-assets/style-preset.ts`.

---

## 6 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Prompt-Engineering: [`01_prompt_engineering_input_praezision.md`](./01_prompt_engineering_input_praezision.md)
- Design-System SOP: [`xx_sop/04_design_system_ui.md`](../../../../xx_sop/04_design_system_ui.md)
