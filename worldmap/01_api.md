# 01 — API — Integrations-Lernlandkarte

> Stand: **2026-08-27** — abgespalten aus der bisherigen gemeinsamen Datei `01_API_MCP_CLI.md` (Aufteilung nach Interface-Typ auf Jans Wunsch). Die alte Datei ist archiviert.
> Projekt: **Casino / Next.js 16.3 / Supabase / Sentry**
> Zweck: Lern- und Entscheidungsgrundlage für externe APIs/SDKs, die die App selbst aufruft — nicht die App-eigenen `src/app/api/**`-Routen (die sind Kategorie 01 „API" in `00_WORLDMAP_STATUS.md`, siehe dort für Contract-/Idempotenz-Messung). Diese Datei ist zunächst eine Analyse und Roadmap; sie führt keine neue Integration automatisch aus.
> Abgrenzung: MCP-Server-Nutzung → [02_mcp.md](02_mcp.md). CLI-Tool-Nutzung → [03_cli.md](03_cli.md).

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

> CLI-/MCP-Pendants (Sentry CLI, Sentry MCP) siehe [03_cli.md](03_cli.md) bzw. [02_mcp.md](02_mcp.md).

#### Produktanalyse

| Nr. | Meilenstein     | Status                                                                              | Niveau  | Bewertung                                   |
| --- | --------------- | ----------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| 15  | PostHog API/SDK | ✅ Abgeschlossen und live (2026-08-28) — Details: `xx_docs/06_analytics_context.md` | Top 15% | R: Niedrig · I: Hoch · L: Hoch · A: Niedrig |

#### Betrieb

| Nr. | Meilenstein                                                                | Status                                                                                              | Niveau  | Bewertung                                        |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| 16  | Production-Monitoring: `/api/health` + externer Free-Checker (UptimeRobot) | 🟢 Verifiziert (2026-08-16), Rest offen — Details: `docs/archive/05_1.13_Uptime-Kuma-Monitoring.md` | Top 20% | R: Niedrig · I: Mittel · L: Niedrig · A: Niedrig |
| 24  | Telegram statt/zusätzlich zu E-Mail als Alarmkanal                         | ⬜ Vorschlag, noch nicht eingerichtet                                                               | Top 80% | R: Niedrig · I: Mittel · L: Mittel · A: Niedrig  |
| 26  | Synthetic Check auf echten API-Endpunkt statt nur `/api/health`            | ⬜ Vorschlag, baut auf Automation-Vorschlag in [03_cli.md](03_cli.md) auf                           | Top 85% | R: Niedrig · I: Mittel · L: Mittel · A: Mittel   |

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

### 2. Explizite Empfehlungen & Maßnahmen (Tabelle)

| #      | Themenfeld / Technik                               | Konkreter Hebel (Casino & _Brain)                                                                                           | Lerneffekt für Jan                                                       | Aufwand | Ziel-Niveau  |        Priorität        |
| ------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | :-----: | :----------: | :---------------------: |
| **01** | **Response-Envelope Rollout**                      | Umstellung aller 42 Bestandsrouten auf das einheitliche `{ data: T }` / `{ error: ... }`-Schema.                            | Saubere Schnittstellendisziplin & Fehler-Hierarchien.                    | Mittel  | **Top 15 %** |   🔴 Prio 1 (Sofort)    |
| **02** | **OpenAPI & Scalar / Swagger UI**                  | Automatische Dokumentations-Route (`/api/docs`) aus bestehenden Zod-Schemas generieren.                                     | API-Dokumentations-Standards (OpenAPI 3.1) & UI-Integration.             | Niedrig | **Top 10 %** | 🟡 Prio 2 (Hoher Wert)  |
| **03** | **Universal Typed Client**                         | Generischer, strikt typisierter Client für Frontend-Calls ohne manuelle Type-Casts (`api.games.bet.post(...)`).             | Fortgeschrittene TypeScript-Generics & RPC-Architekturen.                | Mittel  | **Top 5 %**  | 🟡 Prio 2 (Hoher Wert)  |
| **04** | **Cursor-Based Pagination**                        | Vereinheitlichung aller listenbasierten APIs (`/api/history`, `/api/leaderboard`, `/api/admin/users`) auf Keyset-Cursor.    | SQL-Indexierung, O(1)-Query-Performance bei Millionen Zeilen.            | Mittel  | **Top 10 %** | 🟡 Prio 2 (Hoher Wert)  |
| **05** | **ETag & HTTP Caching Middleware**                 | Conditional Request Handling (`304 Not Modified`) für statische/halb-statische Get-Endpunkte.                               | HTTP-Caching-Header (`Cache-Control`, `ETag`, `Stale-While-Revalidate`). | Niedrig | **Top 10 %** | 🟢 Prio 3 (Performance) |
| **06** | **Server-Sent Events (SSE) / Streaming**           | Einheitliches SSE-Streaming-Muster (z. B. für KI-Guide-Streaming, Live-Jackpot-Ticker oder Long-Polling-Ersatz).            | HTTP/2 Streaming, ReadableStream & Reconnect-Strategien.                 | Mittel  | **Top 10 %** | 🟢 Prio 3 (Vertiefung)  |
| **07** | **Circuit Breaker & Backoff SDK**                  | Resilienz-Wrapper für Upstream-Services (OpenAI, Telegram, PostHog), der Kaskadenausfälle verhindert.                       | Fault Tolerance, Graceful Degradation & Distributed Systems.             | Mittel  | **Top 5 %**  | 🟢 Prio 3 (Vertiefung)  |
| **08** | **Synthetic API Health Runner**                    | Automatisierter cron-basierter Integrations-Check, der kritische API-Pfade mit Dummy-User testet und bei Ausfall alarmiert. | Synthetic Monitoring, Proactive Reliability Engineering.                 | Niedrig | **Top 15 %** | 🟢 Prio 3 (Vertiefung)  |
| **09** | **Contract Testing mit MSW (Mock Service Worker)** | API-Mocks für Vitest & Playwright, die direkt auf denselben Zod-Contracts basieren.                                         | Test-Isolation & deterministisches Frontend-Testing.                     | Mittel  | **Top 10 %** | 🟢 Prio 3 (Vertiefung)  |
| **10** | **API Versioning & Deprecation Strategy**          | Header- & URL-Versionierungs-Muster (`/api/v1` vs `/api/v2`) inkl. RFC-8594-Deprecation-Headern.                            | API-Lebenszyklus-Management & abwärtskompatible Evolution.               | Niedrig | **Top 10 %** |  🔵 Blueprint-Transfer  |
| **11** | **Fine-Grained RBAC & Policy-Guards**              | Deklarative `withPermission('users:manage')` Wrapper für Next.js Route-Handler.                                             | Autorisierungs-Muster, Policy-as-Code & Security-Architektur.            | Niedrig | **Top 5 %**  |  🔵 Blueprint-Transfer  |
| **12** | **Payload Sanitization & Anti-Injection**          | Rekursive Deep-Sanitization-Middleware (Trim, NoSQL-/XSS-Stripping) vor Schema-Parsing.                                     | Defensive Programmierung & Payload-Validierung.                          | Niedrig | **Top 10 %** |  🔵 Blueprint-Transfer  |
| **13** | **BFF Aggregation Pattern**                        | Optimierte Aggregator-Endpunkte für Dashboard-Views, die Mehrfach-Roundtrips vermeiden.                                     | Backend-for-Frontend Pattern & Network Overhead Reduction.               | Mittel  | **Top 15 %** |  🔵 Blueprint-Transfer  |
| **14** | **Webhook Handler Blueprint**                      | Isolierter, wiederverwendbarer Webhook-Verifizierungs- & Verarbeitungs-Boilerplate für externe Events.                      | Kryptografische Sicherheit (HMAC-SHA256) & Idempotenz.                   | Niedrig | **Top 5 %**  |  🔵 Blueprint-Transfer  |

---

## Empfohlene Reihenfolge

| Phase  | Lern-/Integrationsschritt                | Nachweis für den Abschluss                                                                |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| **P1** | **API-Envelope-Standardisierung**        | Alle 49 Routen nutzen `{ data: T }`, 100 % Tests grün, Envelope-Guide in `_Brain`.        |
| **P2** | **OpenAPI / Swagger-Generierung & Docs** | `/api/docs` ist live erreichbar und rendert interaktive Docs aller Routen.                |
| **P3** | **Performance & Cursor-Pagination**      | Keyset-Cursor für `/api/history` & `/api/leaderboard` aktiv + ETag-Caching etabliert.     |
| **P4** | **Typed Client & Contract Testing**      | Frontend-Calls sind 100 % typsicher ohne `as`-Casts; MSW-Mocks für Tests etabliert.       |
| **P5** | **Resilienz & Synthetic Monitoring**     | Circuit Breaker für OpenAI/Telegram aktiv; Synthetic Health Check alarmiert via Telegram. |
