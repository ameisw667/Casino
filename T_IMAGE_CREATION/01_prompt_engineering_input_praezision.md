# 01 — Prompt-Engineering & Input-Präzision (Neue Bilder)

> **Status:** 🟢 Abgeschlossen (Top 1 % — Weltklasse) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Etablierung einer modularen 5-Komponenten-Prompt-Grammatik und Anti-Rewrite-Compiler in `src/lib/design-assets/style-preset.ts`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 01

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                          | Scope (Dateien)                                        | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                               |
| :----- | :----------------------------------- | :----------------------------------------------------- | :---------: | :--------------: | :-----------: | :----------------------------------------------------------------------------------------- |
| **L0** | **Baseline & Prompt-Drift-Diagnose** | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Analyse der bestehenden Prompt-Templates & DALL-E-3 Revision-Logs                          |
| **L1** | **5-Komponenten-Grammatik-Compiler** | `src/lib/design-assets/style-preset.ts`, `types.ts`    | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Modularer Prompt-Builder mit strikter Trennung (Subjekt, Framing, Licht, Material, Engine) |
| **L2** | **Anti-Rewrite- & Anti-Text-Guards** | `src/lib/design-assets/style-preset.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Direktiven gegen DALL-E-3-Umdichtungen & Verbot typographischer KI-Artefakte verankert     |
| **L3** | **Unit-Testabdeckung & Validierung** | `src/lib/design-assets/__tests__/style-preset.test.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | `npm test` für deterministische Prompt-Generierung aller Kategorien grün (8/8 Tests)       |
| **L4** | **Prompt-Manifest-Registry & Audit** | `public/images/top10_all_missing.manifest.json`        | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Dry-Run aller 10 Manifest-Prompts mit 0 USD Kosten erfolgreich validiert                   |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Prompt-Compiler:** [`src/lib/design-assets/style-preset.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/style-preset.ts)
- **Typen & Schnittstellen:** [`src/lib/design-assets/types.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/types.ts)
- **Test-Suite:** [`src/lib/design-assets/__tests__/style-preset.test.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/__tests__/style-preset.test.ts)
- **Design-System SOP:** [`xx_sop/04_design_system_ui.md`](file:///v:/VibeCoding/Casino/xx_sop/04_design_system_ui.md) (Obsidian `#0B0E14`, Champagne Gold `#D4AF37`)

### 2.2 Systemregeln & Invarianten

- **Keine Typographie im Bild:** KI-Modelle erzeugen unleserlichen Textmatsch. Alle Zahlen, Ränge und Beschriftungen werden grundsätzlich als SVG/CSS-Overlay im Next.js-Frontend gerendert.
- **Anti-Rewrite-Direktive:** DALL-E 3 darf den Prompt nicht ausschmücken (`"Do not expand or embellish. Render strictly the described subject without narrative background"`).
- **Fotometrische Farbtokens:** Niemals vages „gold“ verwenden, sondern immer `"champagne gold #D4AF37 with warm specular highlights and brushed satin reflection"`.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & Diagnose

- **Ziel:** Identifikation aller Schwachstellen in den aktuellen String-Templates von `style-preset.ts`.
- **Aktion:** Prüfung, welche Prompts bisher zu DALL-E-3 `revised_prompt`-Drift geführt haben (z. B. barocke Klischee-Zimmer statt minimalistischer Spielbühnen).
- **Verifikation:** Check der bestehenden Testfälle in `src/lib/design-assets/__tests__/style-preset.test.ts`.

### L1 — 5-Komponenten-Grammatik-Compiler

- **Ziel:** Ersetzung statischer String-Aneinanderreihung durch eine strukturierte Template-Engine:
  $$\text{Prompt} = \text{[Subjekt]} + \text{[Komposition/Kamera]} + \text{[Beleuchtung]} + \text{[Material/Farbe]} + \text{[Render-Engine]}$$
- **Spezifikation:**
  - `Subject`: Das Kernobjekt (z. B. "futuristic supersonic aerodynamic quantum jet").
  - `Framing`: "Centered isometric 30-degree orthographic view, 20% safe margin, zero edge clipping".
  - `Lighting`: "Key light 45 degrees top-left, subtle amber rim light, dark studio environment".
  - `Materials`: "Deep obsidian black #0B0E14, brushed champagne gold #D4AF37, frosted glass 12px blur".
  - `Engine`: "3D high-end commercial product render, Octane render, raytraced subsurface scattering".
- **Verifikation:** `npm run typecheck` Exit 0.

### L2 — Anti-Rewrite- & Anti-Text-Guards

- **Ziel:** Harte Prompt-Sperren gegen KI-Halluzinationen.
- **Spezifikation:**
  - Jedes Preset erhält zwingend: `"Strictly plain background, absolute zero text, no letters, no numerals, no watermarks, no typography."`
  - Schlusssatz: `"Render strictly as specified. Do not add narrative environment or surrounding rooms."`
- **Verifikation:** Manuelle und automatisierte Assertions in den Tests.

### L3 — Unit-Testabdeckung & Validierung

- **Ziel:** 100 % deterministische Tests für alle Kategorien (`hero`, `icon`, `badge`, `avatar`, `backdrop`).
- **Testfälle:**
  1. `composePrompt` generiert für Kategorie `icon` zwingend die Anti-Text-Klausel.
  2. Alle injizierten Farbcodes matchen die Design-Tokens (`#0B0E14`, `#D4AF37`).
  3. Benutzerdefinierte `customPrompt`-Anteile überschreiben niemals die Sicherheits- und Style-Injektionen.
- **Verifikationsbefehl:** `npm test` (Suite `style-preset.test.ts` grün).

### L4 — Prompt-Manifest-Registry & Audit

- **Ziel:** Aktualisierung aller bestehenden Manifest-Dateien (`public/images/*.manifest.json`) auf den neuen Standard.
- **Verifikation:** `npx tsx scripts/generate-design-assets.ts --dry-run` läuft ohne Schema-Fehler durch.

---

## 4 — Expliziter Nicht-Scope

- **Keine Live-API-Calls:** Dieser Plan verändert ausschließlich den Prompt-Compiler und Tests; es wird kein echtes Geld bei OpenAI ausgegeben (`--dry-run`-Zwang).
- **Keine Änderung an Bilddateien:** Bestehende PNGs in `public/images/` bleiben unangetastet.

---

## 5 — Fail-Closed & Rollback

- **Abbruchkriterium:** Schlägt ein Unit-Test in `style-preset.test.ts` fehl oder weichen generierte Prompts vom Token-Standard ab, wird der Meilenstein sofort gestoppt.
- **Rollback:** `git checkout src/lib/design-assets/style-preset.ts`.

---

## 6 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Inpainting-Plan: [`02_bild_editing_inpainting_modifikation.md`](./02_bild_editing_inpainting_modifikation.md)
- Design-System SOP: [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md)
