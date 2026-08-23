# 08 — API, Middleware & Backend-Kontext

> **Zweck:** Modulkarte und Sicherheitsarchitektur für alle API-Routen (`src/app/api/`), Middleware (`src/proxy.ts`) und Admin-Routen (`src/app/admin/`). Änderungsablauf: [SOP API Backend Routes](../xx_sop/07_api_backend_routes.md).

---

## 1 — Systemgrenze & Transport-Schicht

* `src/app/api/` ist die exklusive Transport-, Validierungs- und Authentifizierungsschicht zwischen Client und Service-Layer/Supabase.
* **Keine Geschäftslogik in Routen:** API-Handler delegieren Spiel-, RNG- und Settlement-Berechnungen vollständig an `src/lib/casino/` und Supabase-RPCs.
* Alle schreibenden Finanz- und Spieloperationen erzwingen Authentifizierung, Idempotenz (UUIDv4) und Fail-Closed-Verhalten bei DB- oder Netzwerkfehlern (503).

---

## 2 — Middleware & Auth-Protection (`src/proxy.ts`)

* **SSR-Session-Handling:** Cookie-basierte Supabase-Session via `@supabase/ssr` mit automatischem Token-Refresh pro Request.
* **Admin-Schutz (`/admin/**`):**
  * Anonyme Requests $\rightarrow$ Redirect zu `/sign-in`.
  * Authentifizierte Standardnutzer $\rightarrow$ `403 Forbidden`.
  * Admin-Zugriff $\rightarrow$ Erfordert E-Mail in der serverseitigen `SUPABASE_ADMIN_EMAILS`-Allowlist (`isAdminEmail()`).
* **CSRF & Origin-Schutz:** Exakter Vergleich von Mutation-Origin und Host-Header.
* **Cookie-Rotation:** Terminale Antworten (Redirect/403) übertragen zwingend die vom Session-Refresh rotierten Cookies (`withRefreshedCookies()`).

---

## 3 — API-Routen-Kategorien (`src/app/api/`)

* **Gaming & Settlement (User-Auth):**
  * `POST /api/casino/bet`: Serverberechnung für Dice, Slots, Roulette; Crash Start/Cashout/Resolve; atomare RPCs.
  * `POST /api/casino/blackjack`: Versionierte Rundenverwaltung für Deal, Hit, Stand, Double, Split.
  * `POST /api/casino/redeem-code`: Promo-Code-Einlösung mit Redemption-Ledger.
* **User & Progression (User-Auth):**
  * `GET /api/user/balance`: Provisionierung fehlender Profile & typisierter Wallet-Snapshot.
  * `GET /api/analytics/identity`: HMAC-`distinctId` für PostHog.
* **Admin & Operations (Admin-Auth):**
  * `GET/POST /api/admin/overview`, `/games`, `/analytics`, `/users`, `/promo-codes`, `/fraud`: Aggregierte Dashboards und Kontrollmechanismen.
* **Public & Realtime (Read-Only / Secret):**
  * `GET /api/leaderboard`, `/user/history`, `/user/stats`, `/casino/seeds*`, `/casino/active-round`, `/community`: Öffentliche Daten & Raumtakt.
  * `POST /api/chat`, `/api/chat/bot-response`: Casino-Guide & ChatBot.
  * `GET /api/health`, `POST /api/internal/cron-alert`: Liveness-Probe & Cron-Alerting via Shared Secret.

---

## 4 — Deprecated & Deaktivierte Endpunkte

* `POST /api/webhooks/clerk`: `410 Gone` (abgelöst durch nativen Supabase `auth.users`-Trigger, Migration 008).
* `POST /api/casino/session-sync`, `/api/casino/migrate-session`: `410 Gone` (clientseitige Migration deaktiviert).

---

## 5 — Tests & Verifikation

* Security- und Route-Tests liegen unter `src/lib/security/__tests__/` und `src/app/api/**/__tests__/`.
* Prüfungsbefehl: `npm test` und `npm run typecheck`.
