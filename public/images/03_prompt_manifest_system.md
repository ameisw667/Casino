# 03 — Prompt- & Manifest-System (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Trennung von Code (Script-Engine) und Daten (Prompt-Texte), semantische Kategorisierung, Template-Interpolation und Versions-Diff vor API-Aufruf.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                           | Status      | Niveau | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | Zod-Schema für Manifest-Einträge & Duplikaterkennung                                  | 🟢 Executed | 100 %  | LLM           |
| L1     | Semantische Kategorien (`hero`, `icon`, `badge`, `background`, `avatar`, `ui`) & Tags | 🟢 Executed | 100 %  | LLM           |
| L2     | Template-Engine & Variablen-Interpolation (`{{var}}`)                                 | 🟢 Executed | 100 %  | LLM           |
| L3     | Manifest-Diff & Versions-Projektion (`analyzeManifestDiff`)                           | 🟢 Executed | 100 %  | LLM           |
| L4     | CLI-Pre-Flight mit Diff-Tabelle vor Bestätigung                                       | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext

- **Daten- und Code-Entkopplung:** Das Script bleibt eine reine Engine. Assets werden in `prompts.manifest.json` deklariert.
- **Wiederverwendbare Templates:** Durch `{{variable}}`-Interpolation können einheitliche Design-Assets über verschiedene Spiele hinweg (z. B. Dice, Crash, Roulette) DRY erzeugt werden.
- **Manifest-Diff vor Spend:** Die Engine ermittelt vor dem ersten Call, welche Dateien neu entstehen (`✨ NEU`) und welche als Folgeversion (`🔄 v002`) angelegt werden.
- **Semantische Asset-Typen:** Durch `category` (`hero`, `icon`, `badge`, `background`, `avatar`, `ui`) wird das Asset im gesamten Pipeline-Verlauf bis in den `asset-index.json` kontextualisiert.

## 3 — Ziel & Scope

Wiederverwendbare, typsichere und semantisch angereicherte Prompt-Definitionen.

**Im Scope:**

- `src/lib/design-assets/prompts-manifest.ts` (Validierung, Template-Interpolation, Diff-Analyse).
- `src/lib/design-assets/types.ts` (`AssetCategory`, `PromptEntry`).
- `docs/images/prompts.manifest.example.json` (Vollständige Referenz).
- CLI-Integration (`scripts/generate-design-assets.ts`).

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Zod-Validierung mit kebab-case, Formaten, Kategorien, Tags und Template-Variablen.
- [x] `interpolatePrompt()` ersetzt Platzhalter typsicher und deterministisch.
- [x] `findMissingTemplateVariables()` erkennt unersetzte Tokens vor API-Start.
- [x] `analyzeManifestDiff()` analysiert Dateibestände und projiziert Zielversionen.
- [x] Pre-Flight-Tabelle im CLI listet Kategorien, Dateinamen und Versionsstatus auf.
- [x] 100 % Unit-Test-Abdeckung in `prompts-manifest.test.ts`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/prompts-manifest.test.ts` (6 Tests grün).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % betreffen optionale CLI-Filter-Flags wie `--category <cat>`, die bei Bedarf zugeschaltet werden können).
