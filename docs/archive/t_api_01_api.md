# 01 — API — Integrations-Lernlandkarte

> Stand: **2026-08-27** — abgespalten aus der bisherigen gemeinsamen Datei `01_API_MCP_CLI.md` (Aufteilung nach Interface-Typ auf Jans Wunsch). Die alte Datei ist archiviert.
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**
> Zweck: Lern- und Entscheidungsgrundlage für externe APIs/SDKs, die die App selbst aufruft — nicht die App-eigenen `src/app/api/**`-Routen (die sind Kategorie 01 „API" in `00_WORLDMAP_STATUS.md`, siehe dort für Contract-/Idempotenz-Messung). Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.
> Abgrenzung: MCP-Server-Nutzung → [02_mcp.md](../worldmap/Tooling/01_mcp.md). CLI-Tool-Nutzung → [03_cli.md](../worldmap/Tooling/02_cli.md).

## Übersicht für Jan

### Kompaktübersicht (nach Kategorie, sortiert nach bestem Niveau)

| Kategorie      | Status | Niveau-Spanne | Erledigt/Gesamt | Namen                                                                         |
| -------------- | ------ | ------------- | --------------- | ----------------------------------------------------------------------------- |
| Anwendung      | ✅     | Top 10–15%    | 4/4             | Supabase SDK/REST, OpenAI Responses API, Telegram Bot API, Upstash Redis REST |
| Observability  | ✅     | Top 10%       | 1/1             | Sentry Next.js SDK                                                            |
| Produktanalyse | ✅     | Top 15%       | 1/1             | PostHog API/SDK (Privacy-Gate, HMAC distinctId, 16 Zod Events)                |
| Betrieb        | 🟢/⬜  | Top 20–85%    | 2/3             | `/api/health` + UptimeRobot, Telegram-Ops-Alerts, Synthetic API-Check         |

> **Skalen:** Niveau = Top 1 % (Referenzniveau, kaum verbesserbar) bis Top 100 % (nicht gestartet). Bewertung = R (Risiko) · I (Impact) · L (Lerneffekt) · A (Aufwand), jeweils Niedrig/Mittel/Hoch. Alle Werte sind eine LLM-Einschätzung auf Basis der verlinkten `docs/archive/`-Detailpläne, keine Messung.

### Detailtabellen

#### Anwendung

| Nr. | Meilenstein                                                 | Status       | Niveau  | Bewertung                                         |
| --- | ----------------------------------------------------------- | ------------ | ------- | ------------------------------------------------- |
| 1   | Supabase im Frontend, Server und Admin-Kontext per SDK/REST | ✅ Vorhanden | Top 10% | R: Mittel · I: Hoch · L: Niedrig · A: Niedrig     |
| 2   | OpenAI Responses API für den Casino-Guide                   | ✅ Vorhanden | Top 15% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig  |
| 3   | Telegram Bot API für opt-in Big-Win-Benachrichtigungen      | ✅ Vorhanden | Top 10% | R: Niedrig · I: Niedrig · L: Niedrig · A: Niedrig |
| 4   | Upstash Redis/Rate Limiting über REST-SDK                   | ✅ Vorhanden | Top 10% | R: Mittel · I: Hoch · L: Niedrig · A: Niedrig     |

#### Observability

| Nr. | Meilenstein                                                 | Status       | Niveau  | Bewertung                                      |
| --- | ----------------------------------------------------------- | ------------ | ------- | ---------------------------------------------- |
| 5   | Sentry Next.js SDK inklusive Redaction und Error Boundaries | ✅ Vorhanden | Top 10% | R: Niedrig · I: Hoch · L: Niedrig · A: Niedrig |

> CLI-/MCP-Pendants (Sentry CLI, Sentry MCP) siehe [03_cli.md](../worldmap/Tooling/02_cli.md) bzw. [02_mcp.md](../worldmap/Tooling/01_mcp.md).

#### Produktanalyse

| Nr. | Meilenstein     | Status                                                                              | Niveau  | Bewertung                                   |
| --- | --------------- | ----------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| 15  | PostHog API/SDK | ✅ Abgeschlossen und live (2026-08-28) — Details: `xx_docs/06_analytics_context.md` | Top 15% | R: Niedrig · I: Hoch · L: Hoch · A: Niedrig |

#### Betrieb

| Nr. | Meilenstein                                                                | Status                                                                                              | Niveau  | Bewertung                                        |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| 16  | Production-Monitoring: `/api/health` + externer Free-Checker (UptimeRobot) | 🟢 Verifiziert (2026-08-16), Rest offen — Details: `docs/archive/05_1.13_Uptime-Kuma-Monitoring.md` | Top 20% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig |
| 24  | Telegram statt/zusätzlich zu E-Mail als Alarmkanal                         | ⬜ Vorschlag, noch nicht eingerichtet                                                               | Top 80% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig  |
| 26  | Synthetic Check auf echten API-Endpunkt statt nur `/api/health`            | ⬜ Vorschlag, baut auf Automation-Vorschlag in [03_cli.md](../worldmap/Tooling/02_cli.md) auf       | Top 85% | R: Niedrig · I: Mittel · L: Mittel · A: Mittel   |

---

## Inspiration für Jan

> Strategische Lern- und Architektur-Hebel, um das API-Niveau von **Top 65 % auf Top 5–10 %** zu heben und gleichzeitig hochkarätige, wiederverwendbare Blueprints für das Obsidian `_Brain` (`/VibeCoding/_Brain`) zu schaffen.

### 1. Generelle Optimierungen & Architektur-Muster (Blueprint für `_Brain`)

1. **Standardisierter Response-Envelope (`{ data, error, meta }`):**
   - _Problem:_ Bestandsrouten geben teils rohe Arrays, flache Objekte oder inkonsistente Fehler-Formate zurück.
   - _Lösung:_ Ein universeller TypeScript-Envelope-Helper `apiSuccess<T>(data, meta?)` und `apiError(code, message, details?)`, der HTTP-Status, Fehlercodes und Metadaten (z. B. `timestamp`, `requestId`) standardisiert.
   - _\_Brain-Wert:_ Universal-Pattern für alle zukünftigen Next.js- und Node-Projekte.

2. **Contract-First mit Zod & Automatische OpenAPI/Swagger-Generierung:**
   - _Problem:_ API-Routen sind oft nur im Code lesbar; es gibt keine visuelle interaktive Dokumentation (Swagger UI / Scalar).
   - _Lösung:_ Request- und Response-Schemas mit `zod` definieren und via `next-swagger-doc` oder `@asteasolutions/zod-to-openapi` automatisch eine live `/api/docs`-UI generieren.
   - _\_Brain-Wert:_ Schnelles Erstellen interaktiver, selbst-dokumentierender APIs ohne manuelles JSON-Schreiben.

3. **End-to-End Type Safety & Typed Fetch Client (RPC-Pattern):**
   - _Problem:_ Frontend-Aufrufe nutzen `fetch('/api/...')` mit manuellen `as MyType`-Casts, die bei Backend-Änderungen stillschweigend brechen.
   - _Lösung:_ Ein typsicherer Client (z. B. via Zodios, tRPC oder typed `createApiClient<AppRouter>()`), der Route-URLs, Query-Params und Payload-Typen im Frontend zur Compile-Zeit erzwingt.
   - _\_Brain-Wert:_ Maximaler Schutz vor Runtime-Fehlern bei Frontend/Backend-Refactorings.

4. **Idempotenz & Distributed Request Tracing (`X-Request-ID`):**
   - _Problem:_ Fehlgeschlagene oder wiederholte Requests (z. B. schlechtes Mobile-Netz) können Duplikate erzeugen oder sind in Sentry schwer über Client-Server-Grenzen hinweg nachzuvollziehen.
   - _Lösung:_ Standard-Middleware für `Idempotency-Key` (Upstash Lock) auf allen schreibenden Mutationen + automatische Weiterleitung von `X-Request-ID` in Logger, Sentry und Response-Header.
   - _\_Brain-Wert:_ Enterprise-Standard für Finanz-, Checkout- und State-kritische Web-Apps.

5. **Webhook-Architektur mit HMAC-Signatur-Verifikation:**
   - _Problem:_ Eingehende Webhooks (z. B. Zahlungsanbieter, Auth-Provider, Trigger.dev) erfordern robuste Replay-Schutz- und Signatur-Checks.
   - _Lösung:_ Generischer Middleware-Helper zur Rohdaten-Validierung (`crypto.timingSafeEqual`, Timestamp-Toleranz-Fenster).
   - _\_Brain-Wert:_ Sicherheits-Must-Have für jedes SaaS-/Payment-Projekt.

6. **Cursor-basierte Keyset-Pagination für Großdatenmengen:**
   - _Problem:_ Klassisches `OFFSET`-Paging in SQL wird bei großen Tabellen (`bets`, `audit_logs`) mit steigender Seitenzahl extrem langsam und instabil bei parallelen Inserts.
   - _Lösung:_ Standardisiertes Cursor-Paging (`limit`, `cursor`, `hasMore`, `nextCursor`) mit deterministischer Sortierung (`created_at`, `id`).
   - _\_Brain-Wert:_ Performanter Standard-Algorithmus für Feeds, Listen und Tabellen in allen zukünftigen Web-Apps.

7. **Conditional Requests mit HTTP-ETags & 304 Not Modified:**
   - _Problem:_ Lese-Routen (z. B. `/api/games`, Ranglisten, Configs) belasten bei jedem Reload unnötig Datenbank und Bandbreite, selbst wenn sich nichts geändert hat.
   - _Lösung:_ Schnelles SHA-256-Hashing des Response-Bodys für `ETag`-Header und automatische `304 Not Modified`-Rückgabe bei übereinstimmendem `If-None-Match`.
   - _\_Brain-Wert:_ Sofortige Ladezeit-Optimierung und DB-Entlastung bei hohem Traffic.

8. **Resilienz durch Circuit Breaker & Exponential Backoff:**
   - _Problem:_ Ausfälle externer APIs (z. B. OpenAI, Telegram) führen zu Timeouts, hängenden Serverless-Funktionen und schlechter User Experience.
   - _Lösung:_ Universeller Resilience-Wrapper mit Circuit-Breaker-Zuständen (`CLOSED`, `OPEN`, `HALF_OPEN`), konfigurierbarem Fallback und Jittered Backoff.
   - _\_Brain-Wert:_ Hochverfügbarkeits-Muster für alle externen API- und Cloud-Integrationen.

---

### 2. Die 10 Unterkategorien der API-Architektur & Reifegrad-Messung

Hier ist die detaillierte Aufschlüsselung der 10 Disziplinen, die zusammen das Gesamtniveau der API-Landschaft bestimmen:

| #      | Unterkategorie                       | Was dort gebaut ist                                                                                                                                                                                          |   Reifegrad    | Aktuelles Niveau | Bottleneck / Nächster Schritt                                                                                                                                     |
| :----- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01** | **Response-Envelope & Contracts**    | Universeller `{ data: T }` / `{ error: ... }`-Envelope auf allen 49 Next.js Route Handlers                                                                                                                   | 🟢 Vollständig |   **Top 1 %**    | Keine — 100 % der Routen vereinheitlicht                                                                                                                          |
| **02** | **Schema-Validierung & Parsing**     | Strikte Zod-Schemas für Request-Bodies und URL-Parameter mit Form-Error-Mapping                                                                                                                              | 🟢 Vollständig |   **Top 5 %**    | Zod-Output-Sanitization weiter vertiefen                                                                                                                          |
| **03** | **Idempotenz & Replay-Schutz**       | Upstash- & DB-basierter `Idempotency-Key` auf allen geld- und transaktionsrelevanten Routen                                                                                                                  | 🟢 Vollständig |   **Top 5 %**    | Optional: Replay-Header für Lese-Caches                                                                                                                           |
| **04** | **Perimeter- & Auth-Guards**         | Cookie-basierte Supabase Session-Prüfung in `src/proxy.ts` und Admin-Allowlists                                                                                                                              | 🟢 Vollständig |   **Top 5 %**    | Fine-Grained RBAC Permission Checks                                                                                                                               |
| **05** | **OpenAPI 3.1 & Interaktive Doku**   | `/api/openapi.json` Spezifikation & `/api/docs` Scalar-UI im Dark-Theme                                                                                                                                      | 🟢 Vollständig |   **Top 5 %**    | Kontinuierliche Schema-Erweiterung für neue Endpunkte                                                                                                             |
| **06** | **End-to-End Typed API Client**      | `apiClient` (`src/lib/api/client.ts`) mit automatischer Envelope-Entpackung & RPC-Namespaces                                                                                                                 | 🟢 Vollständig |   **Top 5 %**    | Schrittweise Umstellung verbliebener Raw-Fetches                                                                                                                  |
| **07** | **Observability & Request-Tracing**  | Sentry Tracing, strukturierte Logs via `CasinoLogger`, `requestId`-Propagation                                                                                                                               | 🟢 Vollständig |   **Top 10 %**   | Einheitlicher `X-Request-ID` Header im Client-Response                                                                                                            |
| **08** | **Rate Limiting & Abuse Prevention** | Upstash Redis Token-Bucket mit striktem HTTP 503 Fail-Closed-Schutz                                                                                                                                          | 🟢 Vollständig |   **Top 10 %**   | User-spezifische dynamische Tiers                                                                                                                                 |
| **09** | **Keyset-Cursor-Pagination**         | Keyset-Cursor für `/api/user/history` (RPC `get_user_history_page`, Composite-Index, `nextCursor`/`hasMore`, „Mehr laden"-UI) — Migration 061 remote gepusht, Cursor-Roundtrip live verifiziert (2026-09-04) | 🟢 Vollständig |   **Top 20 %**   | Rest: `/api/leaderboard` bewusst ausgenommen (Top-50-Aggregation, kein chronologischer Feed — siehe `09_api_history_keyset_pagination.md` §0, selbes Verzeichnis) |
| **10** | **Resilience & Synthetic Checks**    | `/api/health`-Endpunkt mit DB-Ping und UptimeRobot                                                                                                                                                           | 🟡 Ausbaufähig |   **Top 45 %**   | **Bottleneck:** Nur passiver Ping, kein aktiver E2E Synthetic Runner                                                                                              |

> 🎯 **Rechnerischer Schnitt über alle 10 Disziplinen:** **Top 11,1 % (Top 10 % Gesamtniveau)** — vorher Top 12,6 %, gesunken durch #09 (Keyset-Cursor-Pagination) Top 35 % → Top 20 % (2026-09-04, siehe Zeile 118).  
> Der Kernbereich **App-interne Schnittstellen & Developer Experience** rangiert jetzt stabil bei **Top 5 %**.

---

### 3. Explizite Empfehlungen & Maßnahmen (Roadmap)

| #      | Themenfeld / Technik                     | Konkreter Hebel (Casino & _Brain)                                                                                                                                                                                  | Lerneffekt für Jan                                            | Aufwand | Ziel-Niveau  |                                       Status                                       |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | :-----: | :----------: | :--------------------------------------------------------------------------------: |
| **01** | **Response-Envelope Rollout**            | Umstellung aller 49 Bestandsrouten auf das einheitliche Schema.                                                                                                                                                    | Saubere Schnittstellendisziplin & Fehler-Hierarchien.         | Mittel  | **Top 1 %**  |                                  🟢 Abgeschlossen                                  |
| **02** | **OpenAPI & Scalar / Swagger UI**        | Automatische Dokumentations-Route (`/api/docs` + `/api/openapi.json`).                                                                                                                                             | API-Dokumentations-Standards (OpenAPI 3.1) & Scalar-UI.       | Niedrig | **Top 5 %**  |                                  🟢 Abgeschlossen                                  |
| **03** | **Universal Typed Client**               | Typisierter RPC Client `apiClient` für Frontend-Calls ohne manuelle Casts.                                                                                                                                         | Fortgeschrittene TypeScript-Generics & RPC-Architekturen.     | Mittel  | **Top 5 %**  |                                  🟢 Abgeschlossen                                  |
| **04** | **Cursor-Based Pagination**              | Keyset-Cursor für `/api/user/history` umgesetzt (Migration 061: Composite-Index + Read-RPC; Route, `apiClient`, „Mehr laden"-UI). `/api/leaderboard` bewusst ausgenommen — Top-50-Aggregation ohne Feed-Charakter. | SQL-Indexierung, O(1)-Query-Performance bei Millionen Zeilen. | Mittel  | **Top 20 %** | 🟢 Abgeschlossen (2026-09-04, Migration remote live, Cursor-Roundtrip verifiziert) |
| **05** | **ETag & HTTP Caching Middleware**       | Conditional Request Handling (`304 Not Modified`) für statische Get-Endpunkte.                                                                                                                                     | HTTP-Caching-Header (`Cache-Control`, `ETag`).                | Niedrig | **Top 5 %**  |                              🟢 Prio 3 (Performance)                               |
| **06** | **Server-Sent Events (SSE) / Streaming** | Einheitliches SSE-Streaming-Muster für KI-Guide und Live-Ticker.                                                                                                                                                   | HTTP/2 Streaming, ReadableStream & Reconnect-Strategien.      | Mittel  | **Top 5 %**  |                               🟢 Prio 3 (Vertiefung)                               |
| **07** | **Circuit Breaker & Backoff SDK**        | Resilienz-Wrapper für Upstream-Services (OpenAI, Telegram, PostHog).                                                                                                                                               | Fault Tolerance, Graceful Degradation & Distributed Systems.  | Mittel  | **Top 5 %**  |                               🟢 Prio 3 (Vertiefung)                               |
| **08** | **Synthetic API Health Runner**          | Automatisierter cron-basierter Integrations-Check gegen Staging/Prod.                                                                                                                                              | Synthetic Monitoring, Proactive Reliability Engineering.      | Niedrig | **Top 10 %** |                               🟢 Prio 3 (Vertiefung)                               |
| **09** | **Contract Testing mit MSW**             | API-Mocks für Vitest & Playwright basierend auf Zod-Contracts.                                                                                                                                                     | Test-Isolation & deterministisches Frontend-Testing.          | Mittel  | **Top 5 %**  |                               🟢 Prio 3 (Vertiefung)                               |

---

## Empfohlene Phasen-Historie

| Phase  | Lern-/Integrationsschritt            | Nachweis für den Abschluss                                                                                                    |                   Status                   |
| :----: | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------: |
| **P1** | **API-Envelope-Standardisierung**    | Alle 49 Routen nutzen `{ data: T }`, 100 % Tests grün                                                                         |              🟢 Abgeschlossen              |
| **P2** | **OpenAPI 3.1 & Docs UI**            | `/api/docs` (Scalar) & `/api/openapi.json` live                                                                               |              🟢 Abgeschlossen              |
| **P3** | **Universal Typed Client**           | `src/lib/api/client.ts` mit RPC-Namespaces etabliert                                                                          |              🟢 Abgeschlossen              |
| **P4** | **Performance & Keyset-Cursor**      | Keyset-Cursor für `/api/user/history` (Migration 061 + Route + `apiClient` + UI); `/api/leaderboard` dokumentiert ausgenommen | 🟢 Abgeschlossen (2026-09-04, remote live) |
| **P5** | **Resilienz & Synthetic Monitoring** | Circuit Breaker & Synthetic Health Runner                                                                                     |                 🟢 Prio 3                  |
