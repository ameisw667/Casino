# 07 — OpenAPI 3.1 & Universal Typed API Client Suite

> **Status:** 🟢 Verifiziert (100% Abgeschlossen) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Bereitstellung von OpenAPI 3.1 Schemas, interaktiver `/api/docs`-Dokumentation (Scalar UI), End-to-End Typed API Client (`src/lib/api/client.ts`) und Aufschlüsselung der 10 API-Unterkategorien in `t_api/01_api.md`.
> **Money-Pfad:** Nein (Doku, Client & Schemas) · **Security-Review:** Bestanden

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                              |     Status     | Nächster Schritt                                                                      | Zuständigkeit |
| :----- | :----------------------------------------------------------------------- | :------------: | :------------------------------------------------------------------------------------ | :-----------: |
| **M1** | **OpenAPI 3.1 Generator & Schema-Registry** (`src/lib/api/openapi.ts`)   | 🟢 Verifiziert | OpenAPI 3.1 Spezifikation für alle 6 Cluster definiert + 4/4 Tests grün               |      LLM      |
| **M2** | **Interaktive Dokumentations-Route** (`/api/openapi.json` & `/api/docs`) | 🟢 Verifiziert | JSON-Endpunkt und Scalar-UI-Dokumentationsseite live                                  |      LLM      |
| **M3** | **Universal Typed API Client** (`src/lib/api/client.ts`)                 | 🟢 Verifiziert | Typed RPC Client `apiClient` mit automatischer Envelope-Entpackung etabliert          |      LLM      |
| **M4** | **Frontend Consumer Type-Safety Audit & Tests**                          | 🟢 Verifiziert | Client-Testsuite (7/7 Tests) & Store-Integration verifiziert                          |      LLM      |
| **M5** | **10-Punkte Unterkategorien-Aufschlüsselung** (`t_api/01_api.md`)        | 🟢 Verifiziert | Detaillierte Einstufung, Bottlenecks & Roadmap in `01_api.md` integriert              |      LLM      |
| **M6** | **Vollsuite-Verifikation, Status-Sync & Master-Archivierung**            | 🟢 Verifiziert | 154/154 Testdateien (1.185 Tests grün), 0 TS-Fehler, 0 Lint-Fehler, Build erfolgreich |      LLM      |

---

## 2 — Architektur & Komponenten-Spezifikation

### 2.1 OpenAPI 3.1 Schema (`src/lib/api/openapi.ts`)

- Vollständiges OpenAPI 3.1 Dokument mit `CookieAuth`, `IdempotencyKey` und Schemas für alle 49 Endpunkte.
- Standardisierte Envelope-Definitionen (`ApiSuccessEnvelope`, `ApiErrorEnvelope`, `WalletSnapshot`, `BetResult`).

### 2.2 Interaktive Scalar-Dokumentation (`/api/docs` & `/api/openapi.json`)

- `/api/openapi.json`: Liefert die JSON-Spezifikation (Static Cache 1h).
- `/api/docs`: Rendert eine interaktive Scalar API Reference im Dark-Theme für Entwickler und QA.

### 2.3 Universal Typed API Client (`src/lib/api/client.ts`)

- `apiClient`: Typsicherer RPC-Client mit Autovervollständigung für alle Casino-, User-, Admin- und Community-Routen.
- Automatischer `Idempotency-Key`-Support für schreibende Mutationen.
- Automatische Typ-Inferenz und Entpackung des Response-Envelopes.

---

## 3 — Verifikations-Ergebnisse (M6)

1. **Vitest Testsuite:** **154/154 Testdateien bestanden (1.185 Tests grün)**.
2. **TypeScript:** **0 Fehler (`tsc --noEmit`)**.
3. **ESLint:** **0 Fehler (`eslint`)**.
4. **Production Build:** **54/54 statische & dynamische Routen erfolgreich kompiliert**.
