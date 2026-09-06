# 01 — Script-Engine & API-Client (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-08-31 · **Owner:** LLM · **Scope:** Technisches Fundament der Bildgenerierung — OpenAI-API-Client, CLI-Orchestrierung, Fehler-/Retry-Handling mit Circuit Breaker, Aspect-Ratio-Matrix und vollständiger Header-Telemetrie.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                 | Status      | Niveau | Zuständigkeit |
| ------ | --------------------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | API-Client mit Retry/Backoff + Jitter                                       | 🟢 Executed | 100 %  | LLM           |
| L1     | Format-Matrix (1024x1024, 1536x1024, 1024x1536, 1792x1024, 1024x1792)       | 🟢 Executed | 100 %  | LLM           |
| L2     | Telemetrie & Header-Extraktion (`requestId`, `durationMs`, `revisedPrompt`) | 🟢 Executed | 98 %   | LLM           |
| L3     | Strukturierte Fehlerprüfung & Circuit Breaker (Quota/Auth Fail-Fast)        | 🟢 Executed | 100 %  | LLM           |
| L4     | Unit-Tests (mocked fetch, Error-Payloads, Quota, Timeout)                   | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext (Web-Recherche, Stand 2026-08-31)

- **Modellwahl:** Standardmodell ist **`gpt-image-2`** (Launch 21.04.2026). Unterstützt flexible Dimensionen (Quadrat, 16:9 Landscape, 9:16 Portrait) und liefert `revised_prompt` zurück.
- **Retry- & Jitter-Strategie:** Exponentielles Backoff mit 50 % Random-Jitter für Status 429 (Rate Limit) und 503 (Server Error).
- **Circuit Breaker:** Unwiederbringliche Fehler (401 Bad Key, 403 Forbidden, 429 `insufficient_quota`) stoppen den Batch-Lauf sofort, um unnötige Fehlversuche und CLI-Hangs zu verhindern.
- **Strukturierte Fehleranalyse:** Zod-gestütztes Parsen von OpenAI-Fehlerbodies (`code`, `type`, `message`) zur präzisen Fehlerdiagnose.

## 3 — Ziel & Scope

Eine hochresiliente, deterministische Engine zur Generierung von Design-Assets mit lückenloser Rückverfolgbarkeit (Dauer, Request-ID, Prompt-Revision).

**Im Scope:**

- API-Client (`src/lib/design-assets/openai-image-client.ts`) mit `generateImageWithMeta()` und `generateImage()`.
- Typen & Formate (`types.ts`).
- CLI-Orchestrierung mit Circuit-Breaker (`scripts/generate-design-assets.ts`).

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] Erweiterte Bildauflösungen: `1024x1024`, `1536x1024`, `1024x1536`, `1792x1024`, `1024x1792`.
- [x] `GenerationResponsePayload` mit `meta` (`durationMs`, `requestId`, `attemptsMade`, `revisedPrompt`, Rate-Limits).
- [x] `OpenAiImageError` mit Helfern `isAuthError()`, `isQuotaExceeded()`, `isRateLimit()`, `isFatal()`.
- [x] Network/Timeout-Handling mit automatischem Retry.
- [x] Circuit Breaker im CLI-Orchestrator bei fatalen Fehlern.
- [x] 100 % Testabdeckung für reguläre, transiente und fatale Fehlerpfade.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets` → 7 Testdateien, 31 Tests, alle grün.
- Smoke-Test: Dry-Run validiert alle Formate und Optionen ohne API-Aufruf.
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind der erste reale Live-Call mit Jans eigenem API-Key).
