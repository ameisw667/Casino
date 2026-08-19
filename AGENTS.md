# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Output:

- Der Output soll immer so kurz und knapp wie möglich sein, um trotzdem den selben Mehrwert beizubehalten.
- Alle Adjektive, die nicht mit einer Zahl untermauert werden sollen, werden vollkommen weggelassen werden beim Output.
- Vermeide Fließtexte. Hierzu stattdessen lieber Bullet Points, Tabellen oder ähnliche hochlesbare Darstellungen verwenden.

## Klärung offener Punkte

- Bei offenen/unklaren Punkten nicht selbst bewerten oder entscheiden — immer zuerst nachfragen.
- Gilt für Architektur-Entscheidungen, Scope-Grenzen, Reihenfolge von Migrationen und alles, wo mehrere Lesarten zu unterschiedlicher Arbeit führen würden.

## Doku-Aktualität

- Architektur-Änderungen (neue Services, API-Routes, Admin-Pages, Migrationen) werden im selben Schritt wie der Code auch in diese Datei nachgezogen — betrifft insbesondere die Tabellen Service Layer, API Routes, Admin Pages sowie die Supabase-Sektion.
- Bei Unklarheit, ob eine Änderung dokumentationsrelevant ist: lieber dokumentieren als auslassen — Drift zwischen Code und CLAUDE.md ist die Fehlerquelle, nicht Redundanz.
- Quelle für Live-/Prod-Status bleibt [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md); diese Datei zitiert dort nur, behauptet nichts Abweichendes.

## Supabase

- **Aktives Projekt (seit 2026-07-28)**: dediziertes Supabase-Projekt ausschließlich für Casino (`hmqwozhdckbwjqzcmire`, siehe `.env.local`). Keine geteilte Master-DB mehr für dieses Projekt — deshalb **kein** `casino_`-Präfix nötig, Tabellen heißen schlicht `users`, `wallet_transactions`, etc.
- **Alte Master-DB (mehrere Vibe-Coding-Projekte, ein Supabase-Account)**: Migrations-/Löschstatus der alten `casino_`-Tabellen dort ist **ungeklärt** (Stand 2026-08-17, letzter dokumentierter Stand 2026-07-28 = "offen", weder Repo-Doku noch Jan können den aktuellen Stand bestätigen). Bis zur Klärung: nur Tabellen mit `casino_`-Präfix ansehen/anfassen, nie `SELECT *` ohne diesen Filter — Vorsicht bei jedem Zugriff auf die Master-DB, unabhängig vom tatsächlichen Migrationsstand.
- `.env.local` enthält 3/3 Supabase-Variablen. 30 Migrationen (`001`–`030`, aktuell `030_fraud_signal_detection.sql`) liegen im Repo. Laut [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md) sind alle 12 Kategorien Prod-Ready: Ja, Server-Authority (Migration 007) produktiv. Der frühere DNS-Auflösungsfehler ist laut [docs/status-reports/04_WALLET_ECONOMY.md](docs/status-reports/04_WALLET_ECONOMY.md) live widerlegt.

## Commands

```bash
npm run dev          # Start dev server (Next.js, port 3015)
npm run build        # Production build
npm run lint         # ESLint (next lint config)
npm run test         # Vitest (run once)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Vitest with coverage
npm run vibe-check   # Custom audit script: tsx scripts/vibe-check.ts
```

Tests live in `src/lib/casino/__tests__/` (service layer) and `src/store/__tests__/` (Zustand store). Run `npm run vibe-check` after significant changes — checks balance integrity, RNG distribution, and payout math.

For dev auth bypass, set `ALLOW_DEV_FALLBACK=true` in `.env.local`.

**Required `.env.local` keys:**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_ADMIN_EMAILS=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

---

## Architecture

### Tech Stack

Next.js 16 App Router · React 19 · TypeScript · Zustand 5 (persist) · Framer Motion 12 · Supabase Auth (auth) · Zod (validation) · Lucide React (icons) · Recharts (charts) · Upstash Redis + Rate Limit · Web Crypto API (provably fair)

### Service Layer — `src/lib/casino/`

All business logic lives here, never in page components.

| File                                                                                               | Purpose                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `casino-core.ts`                                                                                   | `CasinoCore` — single entry point for all bets. `placeBet()` routes by `GameType`, calls `ProvablyFairEngine`, returns `BetResult`. Also exposes `startCrashRound()`, `calculateXpGain()`, `calculateLevel()`.                                                                                    |
| `provably-fair.ts`                                                                                 | `ProvablyFairEngine` — isomorphic, uses Web Crypto API only (no Node crypto). HMAC-SHA256 with format `serverSeed:clientSeed:nonce`. Game-specific helpers: `getDiceRoll()` (0–100), `getCrashMultiplier()` (1% house edge), `getRouletteNumber()` (0–36), `getSlotsResult()` (per-reel indices). |
| `bet-validator.ts`                                                                                 | `validateBet()` — pure function, validates bet range ($0.10–$10,000) and sufficient balance. Call before `placeBet()`.                                                                                                                                                                            |
| `sound-manager.ts`                                                                                 | `soundManager` singleton — wraps Audio API with volume and mute control.                                                                                                                                                                                                                          |
| `chat-bot.ts`                                                                                      | `ChatBotService` — command parsing for chat (`/tip`, `/leaderboard` etc.).                                                                                                                                                                                                                        |
| `logger.ts`                                                                                        | `CasinoLogger` — structured bet logging, dev-only stack traces.                                                                                                                                                                                                                                   |
| `wallet.ts`                                                                                        | `WalletService` — all balance ops via Supabase RPC. Zusätzlich `isFirstEverBet()`/`isFirstBetSignal()` (additives PostHog-Erstwett-Signal, ändert nie das Settlement).                                                                                                                            |
| `fraud-detection.ts`                                                                               | Fraud-Signal-Scoring (Bet-Velocity, Multi-Account-Cluster, Win-Rate-Anomalie) für `/api/admin/fraud`. Thresholds sind unkalibrierte Erstwerte (R11, `worldmap/05_ZUKUNFTSPLANUNG.md`).                                                                                                            |
| `risk-signals.ts`, `risk-event-store.ts`, `network-fingerprint.ts`                                 | Risk-Event-Typen, Persistenz (`risk_events`-Tabelle, Migration 029) und Netzwerk-Fingerprinting als Fraud-Detection-Bausteine.                                                                                                                                                                    |
| `game-config(.ts/-server.ts)`, `vip-config(.ts/-server.ts)`, `achievements-config(.ts/-server.ts)` | Config-Layer-Pattern: `*.ts` = Typen + Hardcoded-Defaults (client-safe), `*-server.ts` = Supabase-Cache-Loader (5-Min-TTL) mit Fallback auf die Defaults. Kategorie-12-Outsourcing: "Parameter raus, Algorithmus bleibt".                                                                         |
| `telegram-api.ts`, `telegram-notifier.ts`, `telegram-link.ts`                                      | Opt-in Big-Win-Benachrichtigungen: Bot-API-Wrapper, Notify-Trigger (`isBigWin()`-Threshold), Link-/Opt-in-Status. Migration 025.                                                                                                                                                                  |
| `chat-guide.ts`, `guide-telemetry.ts`                                                              | OpenAI-Responses-API-Casino-Guide (`gpt-4o-mini`) + Telemetry (Kosten/Latenz/Outcome); Purge-Cron Migration 027.                                                                                                                                                                                  |
| `sentry-scrub.ts`, `perf-monitor.ts`                                                               | Sentry-PII-Redaction (entfernt Secrets/Tokens vor Versand) und client-seitiges Performance-Marking.                                                                                                                                                                                               |
| `stats-derivation.ts`, `seed-history-verification.ts`                                              | Client-seitige Ableitung von Profit-Verlauf/Session-Länge aus History-Zeilen; Provably-Fair-Nachverifikation gespeicherter Seeds.                                                                                                                                                                 |
| `session.ts`, `big-win.ts`, `wallet-contract.ts`                                                   | Anonyme Browser-Session-ID, geteilter Big-Win-Threshold (Client+Server), Zod-Schemas für Wallet-/Settlement-Contracts.                                                                                                                                                                            |

### Analytics — `src/lib/analytics/`

Consent-gesteuerte PostHog-Integration (Detail: `docs/archive/05_2.9_PostHog_Analytics.md`, abgeschlossen).

| File                              | Purpose                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `consent.ts`                      | Consent-Gate (`useSyncExternalStore`), vor jedem Analytics-Call geprüft                     |
| `posthog-client.ts`               | Lazy PostHog-SDK-Init, IP/Autocapture/Session-Recording aus                                 |
| `identity-hmac.ts`, `identify.ts` | HMAC-basierte User-Identity über `/api/analytics/identity` — nie die rohe User-ID im Client |
| `events.ts`                       | Event-Allowlist (`z.strictObject`)                                                          |
| `posthog-erasure.ts`              | Erasure-Funktion, aktuell unverdrahtet (kein bestehender Nutzerlöschprozess in der App)     |

### State — `src/store/useCasinoStore.ts`

Zustand hält UI-, Historien- und Einstellungszustand. `balance`, `xp`, `level` und `rank` werden nicht in localStorage oder die Dev-State-Datei persistiert. Startbalance ist `0`.

- `applyServerWalletSnapshot()` ist die einzige Client-Grenze für Walletwerte und validiert mit Zod.
- `processGameResult()` schreibt nur bestätigte Historie, Statistik und Achievement-Fortschritt; keine Walletwerte.
- Lokale Credits/Debits und anonyme XP-Migration sind fail-closed deaktiviert, bis eigene atomare Serverendpunkte existieren.
- **Feature-Stripdown (2026-08-08)**: Challenges, Daily Reward (Header-Button + Vault-Karte), Rakeback-Auszahlung (`rakebackPool`/`claimRakeback`) und Loot Cases (`inventory`/`openCase`) sind vollständig entfernt (nicht nur ausgeblendet) — waren fail-closed und taten bereits nichts. VIP-Rangsystem (Tiers, `RankBenefitsModal`, "X% Rakeback"-Infoanzeige) und Achievements bleiben unverändert. Auch `HomeClientV2.tsx` verliert dabei `FeaturedOffersV2`/`GoldenPath`/`DailyBonusWeeklyV2` (Homepage-Promo-Widgets) und 7 tote V1-Homepage-Komponenten sind gelöscht.

### API Routes — `src/app/api/`

| Route                                                                                                                                      | Notes                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/casino/bet`                                                                                                                     | Serverberechnung für Dice/Slots/Roulette sowie Crash Start/Cashout/Resolve; UUID-Idempotenz; atomare RPCs; kein Client-Fallback.                                        |
| `POST /api/casino/blackjack`                                                                                                               | Serverzustand für Deal/Hit/Stand/Double/Split; versionierte, idempotente Runde; Client sendet keine Auszahlung.                                                         |
| `GET /api/user/balance`                                                                                                                    | Provisioniert fehlenden Supabase-User und liefert typisierten Snapshot; DB-Fehler ergeben 503.                                                                          |
| `POST /api/webhooks/clerk`                                                                                                                 | 410; Clerk-User-Provisioning wurde durch den nativen `auth.users`-Trigger (Migration 008) ersetzt.                                                                      |
| `POST /api/casino/session-sync`, `migrate-session`                                                                                         | 410; clientseitige Progressionsmigration wurde entfernt.                                                                                                                |
| `GET /api/analytics/identity`                                                                                                              | Liefert HMAC-`distinctId` für PostHog-`identify()`; nie die rohe User-ID.                                                                                               |
| `GET/POST /api/admin/fraud`, `POST /api/admin/fraud/scan`                                                                                  | Fraud-Signal-Übersicht und manueller Scan-Trigger (Admin-only).                                                                                                         |
| `GET/POST /api/admin/promo-codes`                                                                                                          | Promo-Code-Verwaltung: Erstellung, Status (Admin-only, Migration 021).                                                                                                  |
| `POST /api/casino/redeem-code`                                                                                                             | Promo-Code-Einlösung durch Nutzer, schreibt Redemption-Ledger (Migration 023).                                                                                          |
| `GET /api/admin/overview`, `/games`, `/analytics`, `/users`                                                                                | Admin-Dashboard-Datenquellen: DB-Aggregate für Overview/Games/Cohort-Analytics; User-/Wallet-Management (Admin-only).                                                   |
| `/api/telegram/link`, `/unlink`, `/toggle`, `/status`, `/webhook`                                                                          | Telegram-Opt-in-Flow + eingehender Bot-Webhook (Shared-Secret statt Origin-Check, wie `/api/internal/cron-alert`).                                                      |
| `POST /api/chat`, `/api/chat/bot-response`                                                                                                 | Casino-Guide-Chat (OpenAI) und GlobalChat-Bot-Kommandos (`/tip`, `/leaderboard`).                                                                                       |
| `GET /api/leaderboard`, `/user/history`, `/user/stats`, `/casino/seeds(+/history)`, `/casino/active-round`, `/casino/config`, `/community` | Read-only: Ranking, Wetthistorie, Stats-Ableitung, Seed-Reveal/-Historie, aktive Crash-/Blackjack-Runde, Client-Config (VIP/Game/Achievements), Community-Wagered-Ziel. |
| `GET /api/health`, `POST /api/internal/cron-alert`                                                                                         | Öffentlicher Liveness-Probe (kein DB-Zugriff) und interner Cron-Failure-Alert (Shared-Secret-Auth, `pg_net`-Aufrufer aus Migration 027).                                |

### Middleware — `src/proxy.ts`

Supabase-Session (via `@supabase/ssr`, Cookie-basiert, Refresh pro Request) schützt nicht-öffentliche Routen. `/admin` ist nicht public: anonym → Sign-in, normaler User → 403, Admin → Zugriff per `SUPABASE_ADMIN_EMAILS`-Allowlist (`isAdminEmail()`). Mutation-Origin und Host werden exakt verglichen; Clerk-Webhook-Route bleibt wegen Svix vom Browser-Origin-Check ausgenommen (jetzt 410, siehe oben). Casino-/Wallet-API-Handler erzwingen Auth selbst und liefern JSON statt HTML-Redirects. Terminale Antworten (Redirect/403) übertragen die vom Session-Refresh rotierten Cookies explizit (`withRefreshedCookies()`) — sonst geht der rotierte Token verloren und der nächste Request scheitert am Refresh.

### Layout Shell

`src/app/layout.tsx` wraps everything in `ClientProviders` (mountet `SupabaseSessionProvider`, einen React-Context um `supabase.auth.onAuthStateChange`) mit custom dark theme variables, then renders `ClientShell`. `ClientShell` mounts `MainLayout` for normal routes, `AdminLayout` for `/admin/**`, and renders the `/v2` design-sandbox bare (no `MainLayout`/`AdminLayout` shell — intentional, WIP). `MainLayout` contains the sidebar nav, all modal layers (Wallet, Settings, RankBenefits, PlayerProfile), `GlobalChat`, `CommandPalette`, and `BigWinOverlay` (`DailyReward` und `Challenges` wurden beim Feature-Stripdown 2026-08-08 entfernt). Game pages render inside this shell.

> `/backend` (ehemalige Supabase-Auth-Sandbox) wurde gelöscht; die Haupt-App nutzt native Supabase Auth über `/sign-in`, `/sign-up` und `SupabaseSessionProvider` (siehe `docs/architecture/02_CLERK_SUPABASE.md`).

### Games — `src/app/games/[game]/page.tsx`

Games: `blackjack`, `crash`, `dice`, `roulette`, `slots`. Each is a self-contained page component. Game-specific sub-components live in `src/components/casino/games/[game]/`. Slots uses `src/components/casino/SlotSymbol.tsx`.

Dice, Slots und Roulette nutzen `/api/casino/bet`; Crash nutzt persistente Serverrunden; Blackjack nutzt `/api/casino/blackjack`. Jede erfolgreiche Antwort liefert einen Wallet-Snapshot vor der nicht-finanziellen Historie.

### Admin Pages — `src/app/admin/`

| Route                | Notes                                        |
| -------------------- | -------------------------------------------- |
| `/admin`             | Dashboard overview                           |
| `/admin/games`       | Per-game stats and controls                  |
| `/admin/users`       | User management                              |
| `/admin/simulation`  | Bet simulation tooling                       |
| `/admin/fraud`       | Fraud-Signal-Dashboard & manueller Scan      |
| `/admin/promo-codes` | Promo-Code-Verwaltung                        |
| `/admin/analytics`   | Cohort/Retention/Funnel/GGR/VIP-BI-Dashboard |

### Design System Rules (enforced by Design-Guardian)

- **Visual Identity**: "Obsidian & Gold (Premium)" luxurious VIP aesthetic.
- **Colors**:
  - Backgrounds: Obsidian (dark/black, no pure gray).
  - Accents: Gold (`#D4AF37` or gold gradients) for CTAs and wins.
  - Success/Win: Emerald Green; Error/Loss: Ruby Red.
- **Glassmorphism**: Mandatory for Modals, Nav, and Dropdowns. Use `backdrop-filter: blur(12px)` + semi-transparent backgrounds (e.g., `bg-black/40`).
- **Typography**:
  - UI/Text: Modern Sans-Serif.
  - Dynamic Values: Monospace (Balance, Multipliers, Leaderboards) to prevent layout flicker.
- **Motion (Bouncy & Playful)**:
  - Use `framer-motion` with Spring physics (`type: "spring", bounce: 0.4`).
  - Interactive elements must have `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.95 }}`.
- **Z-Index**: page(0–10) → nav(20) → dropdowns(30) → overlays(40) → modals(50) → toasts(100) → loading(999)
- Reusable primitives: `src/components/ui/VibeMotion.tsx`, `src/components/ui/Magnetic.tsx`
- Every win must trigger BigWinOverlay, confetti, or glow

### Key Constraints

- Browserwerte sind keine Wallet-Autorität; DB-, Rate-Limit- oder Auth-Fehler schließen produktiv mit 4xx/503.
- Upstash ist in Production erforderlich; Development nutzt einen In-Memory-Limiter.
- `SUPABASE_ADMIN_EMAILS` und `SUPABASE_SERVICE_ROLE_KEY` sind server-only.
- Die sichtbare Fairness-Seite ist entfernt; `/fairness` liefert 404 ohne Redirect. Die interne Provably-Fair-Engine bleibt erhalten.
- Migration 007 ist additiv und nutzt Advisory Locks, `(user_id, request_id)`-Idempotenz, `game_rounds`, festes `search_path` und nur `service_role`-Execute.
- Die alte `place_bet()`/`settle_bet()`-Kette darf von neuem Spielcode nicht verwendet werden.

### Database Architecture (Supabase)

| Datei                                                    | Zweck                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_users.sql` – `006_game_configs.sql`                 | Basistabellen und bestehende Konfiguration                                                                                                  |
| `007_server_authority.sql`                               | Idempotente Standard-Settlements, Crash-/Blackjack-Runden, atomare Aktions-RPCs                                                             |
| `008`–`020`                                              | Auth-Bridge, Meta-Features, Welcome-Bonus, Achievements, Leaderboard-RPC — Details: [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md) |
| `021_promo_codes.sql`, `023_promo_redemption_ledger.sql` | Promo-Code-Erstellung und -Einlösung (Ledger)                                                                                               |
| `024`–`029`                                              | Guide-Telemetry, Telegram-Link, Wallet-Ledger-Invarianten, Risk-Events                                                                      |
| `030_fraud_signal_detection.sql`                         | Fraud-Signal-Persistenz für `/api/admin/fraud`                                                                                              |
| `src/lib/casino/wallet.ts`                               | Strikt validierter Service-Role-Zugriff; keine Hardcoded-Fallbacks                                                                          |
| `src/utils/supabase/admin.ts`                            | Server-only Service-Role-Client                                                                                                             |

Remote-Status: siehe Supabase-Sektion oben — laut [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md) alle 12 Kategorien Prod-Ready: Ja, Migrationen `001`–`030` live.

## Workflow: Jan-Execution

### 1 — Planung

Implementationsplan aus 2 Perspektiven prüfen (je nach Kontext wählen, z. B. Architektur vs. Security,
oder Business-Logik vs. UX). Pflichtpunkte je Perspektive:

- Abhängigkeiten
- Alle Anforderungen (vollständig)
- Aufgabenverteilung (Jan oder LLM?) -> So viel wie möglich soll von den LLM verarbeitet werden, damit Jan möglichst wenig hat.
- Fehler-/Problemfälle + Umgang damit, wenn diese auftreten

### 2 — Plan-Selbstprüfung

Gesamten Plan gegen Schritt 1 nochmal selbst prüfen: Fehler, Lücken, Verbesserungen.

- Ziel der Plan-Selbstprüfung ist, den Implementationsplan einfach noch mal auf das nächste Level anzuheben.

### 3 — Execution

Ausführen ohne Rückfrage — **außer** bei:

- Architektur-Entscheidungen, Scope-Grenzen, Migrationsreihenfolge (siehe "Klärung offener Punkte")
- destruktiven/schwer umkehrbaren Aktionen (siehe globale Safety-Regeln)

Bei Auth-/DB-/Payment-/User-Input-Code: zusätzlich `security-reviewer`-Agent.

### 4 — Execution-Selbstprüfung

Tests, Build, Lint laufen lassen + Diff gegen Plan review. Nicht nur lesen.

### 5 — Doku-Update + Abschluss

Implementationsdatei aktualisieren (Kopftabelle-Status + Detailabschnitt, siehe Markdown-Planungsdateien-Regel):

- Plan fertig (Schritt 2) → 🟡 Execution-Ready
- Execution läuft (Schritt 3) → 🟡 In Execution
- Execution geprüft (Schritt 4 grün) → 🟢 Executed

Erst nach aktualisierter Datei + grüner Prüfung: Aufgabe abgeschlossen, dann Bescheid geben.

## Markdown-Planungsdateien: Jan-Planungs-Schemata

**Ablage:** Aktive Planungsdateien liegen in `worldmap/`. Eine Marker-Datei enthält nur Status, Reihenfolge und Verweise; ein fachlich eigenständiger Plan erhält eine eigene Datei.

**Status und Archivierung:** Jede neue Datei trägt in der Kopfzeile genau einen Status aus `Geplant`, `Execution-Ready`, `In Execution` oder `Executed (archiviert)`. Nach `Executed` wird sie standardmäßig nach `docs/archive/` verschoben; Löschen nur bei einem nachweislich wertlosen Gerüst ohne Entscheidungs- oder Verifikationswert.

### Kopfbereich (Pflicht, zuerst, für Jan)

```markdown
# NN — <Thema>

> **Status:** Geplant · **Stand:** YYYY-MM-DD · **Owner:** Jan/LLM · **Scope:** <klare Grenze>

## 1 — Übersicht für Jan

| Nummer | Kategorie/Meilenstein | Status      | Nächster Schritt | Zuständigkeit |
| ------ | --------------------- | ----------- | ---------------- | ------------- |
| L0     | ...                   | 🟢 Executed | ...              | LLM           |
| L1     | ...                   | 🔴 Geplant  | ...              | Jan + LLM     |
```

**Ampel-Definition:** 🔴 Geplant = nicht gestartet; 🟡 In Execution = gestartet, nicht verifiziert; 🟢 Executed = verifiziert abgeschlossen. Die sichtbare Ampel ergänzt, ersetzt aber nicht den festen Kopfstatus.

**Update-Pflicht:** Kopfstatus, Jan-Tabelle und zugehöriger Detailabschnitt werden im selben Edit aktualisiert. Eine Marker-Datei und ihr Detailplan erhalten im selben Edit konsistente Verweise.

### Detailbereich (ab zweiter Überschrift, für LLM)

Jeder Meilenstein enthält mindestens Ziel, Nutzen, Scope (bestehende und geplante Dateien), Datenklassen, Abhängigkeiten, Freigabe-Gate, Verifizierung und Overengineering-/Nicht-Scope-Grenze.

Bei LLM-, Live-Daten- oder Retrieval-Plänen zusätzlich:

- erlaubte und verbotene Datenklassen;
- serverseitige Allowlist und read-only-Grenze;
- Positiv- und Negativtests pro Datenklasse;
- Ausfall-/Fallback-Verhalten und sichtbare Aktualitätsregel;
- Security-Review vor Live-Daten, Retrieval oder jedem neuen API-Boundary;
- keine freie Datenbanksuche, keine privaten Nutzerkontexte und keine Schreibtools, solange dies nicht als separates Projekt freigegeben wurde.

Bei Wallet-/Auth-/DB-Schreibpfaden zusätzlich: `Money-Pfad: Ja/Nein` und `Security-Review: Pflicht/Nein`.

### Plan-Selbstprüfung (Pflicht vor `Execution-Ready`)

- Alle Levels sind in Reihenfolge und mit Abhängigkeiten beschrieben.
- Jeder Datenzugriff besitzt eine explizite Allowlist und einen Negativtest.
- Ausgeschlossene spätere Funktionen sind als solche markiert, nicht als impliziter Folgeschritt.
- Die Marker-Datei enthält keine widersprüchliche Reihenfolge oder Scope-Aussage.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
