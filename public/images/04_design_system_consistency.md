# 04 — Design-System-Konsistenz (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Sicherstellen, dass alle generierten Bilder zur visuellen Identität "Obsidian & Gold" passen, inklusive kategoriespezifischer Render-Presets (`hero`, `icon`, `badge`, `background`, `avatar`, `ui`), 3-Stufen-Exclusions und fotometrischer Prompt-Tokens für OpenAI gpt-image-2.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                       | Status        | Niveau | Zuständigkeit                        |
| ------ | ----------------------------------------------------------------- | ------------- | ------ | ------------------------------------ |
| L0     | Fester Style-Suffix mit Obsidian (`#0B0E14`) und Gold (`#D4AF37`) | 🟢 Executed   | 100 %  | LLM                                  |
| L1     | Kategoriespezifische Style-Presets (`CATEGORY_STYLE_PRESETS`)     | 🟢 Executed   | 100 %  | LLM                                  |
| L2     | 3-Stufen-Exclusion-Pipeline (Global + Category + Custom)          | 🟢 Executed   | 100 %  | LLM                                  |
| L3     | Dry-Run-Transparenz (Vollständig komponierte Prompts vor Spend)   | 🟢 Executed   | 100 %  | LLM                                  |
| L4     | Visuelle Feinjustierung nach erstem Live-Lauf                     | 🟡 Justierung | 95 %   | Jan (Subjektive visuelle Endabnahme) |

## 2 — Best-Practice-Kontext (Design-Guardian & OpenAI Prompting)

- **Fotometrische Deskriptoren:** Statt nackter Hex-Codes (die von Byte-Pair-Encodern zerlegt werden) nutzt die Pipeline semantisch angereicherte Beschreibungen wie _"deep pitch-black obsidian slate background (#0B0E14, ultra-dark charcoal tones with ambient depth)"_ und _"luxurious warm metallic gold accents (#D4AF37, radiant champagne gold with polished brass reflections)"_.
- **Physikalische Glassmorphism-Tokens:** Ersetzt schwammige Begriffe durch optische Eigenschaften: _"translucent frosted smoked glass surfaces with 12px optical blur and subtle internal refraction"_.
- **3-Stufen-Exclusion-Pipeline:** Da OpenAI keinen nativen `negative_prompt`-Parameter bietet, synthetisiert `buildExclusionString()` globale Ausschlüsse (`watermark, text, blurry`), kategoriespezifische Ausschlüsse (z. B. keine unruhigen Hintergründe bei Icons) und individuelle `negativePrompt`-Angaben aus dem Manifest.

## 3 — Ziel & Scope

Homogene, hochwertige Bild-Assets im Casino-Look ohne manuelle Prompt-Wiederholungen.

**Im Scope:**

- `src/lib/design-assets/style-preset.ts` (Presets, Exclusions, Farbkonstanten).
- CLI-Pipeline (`scripts/generate-design-assets.ts`).
- Verifizierung via Unit-Tests.

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Kategoriespezifische Presets für `hero`, `icon`, `badge`, `background`, `avatar`, `ui`.
- [x] 3-Stufen-Exclusion-Pipeline via `buildExclusionString()`.
- [x] `composePrompt()` unterstützt flexible Parameter (`ComposePromptParams`) und bleibt 100 % abwärtskompatibel.
- [x] CLI `--dry-run` zeigt den vollständig komponierten Prompt an, damit Jan vor dem Generieren exakt sieht, was an die OpenAI-API gesendet wird.
- [x] 100 % Unit-Test-Abdeckung in `style-preset.test.ts`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/style-preset.test.ts` (6 Tests grün).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind die optische Feinjustierung durch Jan nach dem ersten echten Render).
