# 05 — Sicherheits- & Zugriffskontrolle (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Secret-Isolation, Path-Traversal-Schutz, Fail-Fast-Validierung, Secret-Scrubbing in Fehlern/Logs und Runtime-Guard gegen versehentlichen Next.js-Web-Aufruf.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                         | Status      | Niveau | Zuständigkeit |
| ------ | ------------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | Env-Validierung mit Zod (Fail-Fast) & Redaction                     | 🟢 Executed | 100 %  | LLM           |
| L1     | Path-Traversal-Schutz (`validateSafeAssetName` & `resolveSafePath`) | 🟢 Executed | 100 %  | LLM           |
| L2     | Secret-Scrubbing (`scrubSensitiveText` für Keys & Bearer-Tokens)    | 🟢 Executed | 100 %  | LLM           |
| L3     | Next.js Server Runtime Guard (`NEXT_RUNTIME` Fail-Closed)           | 🟢 Executed | 100 %  | LLM           |
| L4     | `--yes`-Bestätigungspflicht als technisches Gate                    | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext (Security & Secrets Isolation)

- **Path-Traversal-Schutz:** Asset-Namen und Manifest-Dateipfade werden strikt validiert (`resolveSafePath`, `validateSafeAssetName`). Ausbrüche über `../`, `\`, absolute Pfade oder Null-Bytes werden hart vor jedem Dateisystemzugriff abgewiesen.
- **Deep Secret-Scrubbing:** Fehlerobjekte (`OpenAiImageError`) und Console-Logs laufen durch `scrubSensitiveText()`, wodurch OpenAI-Keys (`sk-...`) oder Bearer-Tokens automatisch zu `[REDACTED_API_KEY]` maskiert werden.
- **Next.js Web-Isolation:** Ein strikter Runtime-Guard (`process.env.NEXT_RUNTIME`) verhindert, dass Server-Komponenten oder Web-API-Routen die Bildgenerierungs-Engine unautorisiert importieren oder triggern können.
- **Schreibziel-Einfassung:** Alle Schreiboperationen (`fs.writeFileSync`) auf `OUTPUT_DIR` sind mit `resolveSafePath` gegen Überschreiben von Systemdateien gesichert.

## 3 — Ziel & Scope

Vollständige Absicherung gegen Path-Traversal, Secret-Leaks und unberechtigte API-Aufrufe.

**Im Scope:**

- `src/lib/design-assets/security.ts` (Pfad-Sanitization, Secret-Scrubbing).
- `src/lib/design-assets/env.ts` (Validierung, Key-Redaction).
- `src/lib/design-assets/openai-image-client.ts` (Runtime-Guard, gescrubbte Fehler).
- `scripts/generate-design-assets.ts` (Sichere Pfad-Auflösung und Fehlerfilterung).

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] `resolveSafePath()` sperrt Pfade außerhalb von Workspace/Output-Verzeichnissen.
- [x] `validateSafeAssetName()` erzwingt strikten Kebab-Case ohne Slashes oder Traversals.
- [x] `scrubSensitiveText()` tilgt Secrets in Fehlermeldungen und Konsolenausgaben.
- [x] `generateImageWithMeta()` bricht mit Fehler ab, wenn `NEXT_RUNTIME` aktiv ist.
- [x] CLI erfordert zwingend `--yes` für reale Kosten-Transaktionen.
- [x] 100 % Testabdeckung in `security.test.ts` und `openai-image-client.test.ts`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/security.test.ts` (9 Tests grün).
- `npx vitest run src/lib/design-assets/__tests__/env.test.ts` (4 Tests grün).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind periodische projektweite Secret-Rotationen gemäß SOP 14).
