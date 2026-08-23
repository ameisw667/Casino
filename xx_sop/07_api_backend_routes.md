# SOP: API Backend Routes, Middleware & Admin

> **Zweck:** Vollständige Spezifikation aller Server-Endpunkte in `src/app/api/`, der Auth-Middleware `src/proxy.ts` und der Admin-Routen in `src/app/admin/`. Kontext: [API, Middleware & Backend-Kontext](../xx_docs/08_api_backend_context.md).

---

## 1 — Middleware & Auth-Protection (`src/proxy.ts`)

* **SSR-Session-Management:** Cookie-basierte Supabase-Session via `@supabase/ssr` mit automatischem Token-Refresh pro Request.
* **Admin-Routenschutz (`/admin/**`):**
  * Anonyme Nutzer $\rightarrow$ Redirect zu `/sign-in`.
  * Authentifizierte Standard-Nutzer $\rightarrow$ `403 Forbidden`.
  * Admin-Zugriff $\rightarrow$ Erfordert E-Mail in der serverseitigen `SUPABASE_ADMIN_EMAILS`-Allowlist (`isAdminEmail()`).
* **Origin- & Host-Check:** Exakter Vergleich von Mutation-Origin und Host-Header gegen CSRF.
* **Cookie-Rotation:** Terminale Antworten (Redirect/403) übertragen zwingend die vom Session-Refresh rotierten Cookies (`withRefreshedCookies()`), um Session-Verlust zu verhindern.

---

## 2 — API Routes Matrix (`src/app/api/`)

| Route | Methode | Authentifizierung | Zweck & Verhalten |
| :--- | :---: | :---: | :--- |
| `/api/casino/bet` | `POST` | User | Server-Settlement für Dice/Slots/Roulette; Crash Start/Cashout/Resolve; UUID-Idempotenz; atomare RPCs. Liefert seit Multiplayer-Crash keinen Direkt-`crashPoint` mehr, sondern `crashRoundId`. |
| `/api/casino/blackjack` | `POST` | User | Server-Zustand für Deal/Hit/Stand/Double/Split; versionierte Runde; Client sendet keine Auszahlungen. |
| `/api/user/balance` | `GET` | User | Provisioniert fehlende Supabase-User automatisch und liefert typisierten Wallet-Snapshot; DB-Fehler $\rightarrow$ `503`. |
| `/api/webhooks/clerk` | `POST` | Public | `410 Gone` — Altes Clerk-Provisioning wurde durch nativen `auth.users`-Trigger (Migration 008) abgelöst. |
| `/api/casino/session-sync`, `migrate-session` | `POST` | Public | `410 Gone` — Clientseitige Progressionsmigration wurde aus Sicherheitsgründen entfernt. |
| `/api/analytics/identity` | `GET` | User | Liefert HMAC-`distinctId` für PostHog-`identify()`; nie die rohe User-ID. |
| `/api/admin/fraud`, `/scan` | `GET/POST` | Admin | Fraud-Signal-Übersicht und manueller Scan-Trigger. |
| `/api/admin/promo-codes` | `GET/POST` | Admin | Promo-Code-Verwaltung: Erstellung, Deaktivierung, Status (Migration 021). |
| `/api/casino/redeem-code` | `POST` | User | Promo-Code-Einlösung durch Nutzer; schreibt in `promo_redemptions`-Ledger. |
| `/api/admin/overview`, `/games`, `/analytics`, `/users` | `GET` | Admin | Admin-Dashboard-Datenquellen: DB-Aggregate für Overview, Games, Cohort-Analytics, User-Management. |
| `/api/telegram/link`, `/unlink`, `/toggle`, `/status`, `/webhook` | `POST/GET` | User / Secret | Telegram-Opt-in-Flow + Bot-Webhook (Shared-Secret statt Origin-Check). |
| `/api/chat`, `/api/chat/bot-response` | `POST` | User / Public | Casino-Guide-Chat (OpenAI) & ChatBot-Kommandos (`/tip`, `/leaderboard`). |
| `/api/leaderboard`, `/user/history`, `/user/stats`, `/casino/seeds*`, `/casino/active-round` | `GET` | User / Public | Read-Only Endpunkte: Ranking, Historie, Stats, Seed-Reveal, Crash-Raumstatus (`sharedRound`). |
| `/api/health`, `/api/internal/cron-alert` | `GET/POST` | Public / Secret | Liveness-Probe (ohne DB) und interner Cron-Failure-Alert (`pg_net` aus Migration 027). |

---

## 3 — Admin Pages (`src/app/admin/`)

| Route | Zweck | Datenquelle |
| :--- | :--- | :--- |
| `/admin` | Dashboard-Übersicht (GGR, aktive Spieler, Umsatz) | `/api/admin/overview` |
| `/admin/games` | Spielstatistiken & House-Edge-Kontrollen | `/api/admin/games` |
| `/admin/users` | Benutzer- und Wallet-Verwaltung | `/api/admin/users` |
| `/admin/simulation` | Monte-Carlo-Wettsimulation für Spiel-Balancing | Client/Server-Simulations-Engine |
| `/admin/fraud` | Signal-Dashboard & Anomalie-Erkennung | `/api/admin/fraud` |
| `/admin/promo-codes` | Kampagnen- und Gutschein-Management | `/api/admin/promo-codes` |
| `/admin/analytics` | Cohort/Retention/VIP-BI-Dashboard | `/api/admin/analytics` |
| `/admin/knowledge` | KI-Wissensdokumente & pgvector-Synchronisation | `/api/admin/knowledge` |
| `/admin/evals` | Guide-Qualitäts- & Intent-Evaluationen | `/api/admin/evals` |

---

## 4 — Layout Shell & Sandbox-Routing

* `src/app/layout.tsx` kapselt die App in `ClientProviders` (`SupabaseSessionProvider`) und rendert `ClientShell`.
* `ClientShell` unterscheidet strikt:
  * `/admin/**` $\rightarrow$ `AdminLayout`
  * Standard-Routen $\rightarrow$ `MainLayout` (Sidebar, Header, Modals, GlobalChat)
  * `/v2` Design-Sandbox $\rightarrow$ Bare Page (ohne Shell, isolierte Entwicklung)
