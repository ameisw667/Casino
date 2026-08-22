# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Output

- Antworte und beginne mit Kernaussage, Entscheidung oder Status.
- So kurz wie möglich, aber vollständig für Entscheidung, Ausführung oder Prüfung. Nutze Listen oder Tabellen, wenn sie klarer sind.
- Lasse Voraussetzungen, Risiken, offene Punkte und nächste Schritte nicht nur zur Kürzung weg.
- Trenne Fakten, Annahmen und Schlussfolgerungen. Kennzeichne Unsicherheit; stütze überprüfbare Behauptungen auf aktuelle Evidenz und vermeide unbelegte Wertungen.
- Nutzerwunsch zu Sprache, Detailgrad und Format hat Vorrang.

## Klärung offener Punkte
- Ermittle Fakten zuerst aus Nutzerauftrag, Repository und Doku; frage nichts, was dort eindeutig steht.
- Frage nur bei einer nicht durch Kontext klärbaren Entscheidung, wenn Optionen Architektur, Datenmodell, Sicherheit, Migrationsreihenfolge, Scope, Kosten oder sichtbares Verhalten ändern.
- Triff reversible, risikoarme Detailentscheidungen im beauftragten Scope selbst; nenne die Annahme.
- Stelle eine konkrete Frage; nenne bei vorhandenen Optionen deren Auswirkung.
- Setze nach Freigabe im bestätigten Scope um; frage nur erneut bei neuer materieller Unsicherheit oder benötigter Autorität.

## Doku-Aktualität
- Aktualisiere bei Architektur-, API-, Datenmodell- oder Sicherheitsänderungen im selben Schritt die zuständige kanonische Dokumentation.
- `CLAUDE.md` enthält nur Kernregeln und On-Demand-Verweise; Systemdetails gehören in Systemkarte, SOP, Worldmap oder Archiv.
- Kennzeichne Status als lokal, verifiziert oder live. Live-/Prod-Aussagen folgen ausschließlich `worldmap/00_WORLDMAP_STATUS.md`.
- Aktualisiere bei Umbenennung, Verschiebung oder Archivierung alle eingehenden Verweise.
- Ist der Dokumentationsort unklar, prüfe zuerst den Router; erst danach eine kurze Rückfrage.

## Supabase
- Bei Supabase-Aufgaben zuerst `xx_docs/01_supabase_context.md` lesen.
- Bei Schema-, Migrations-, RPC-, RLS-, Service-Role- oder Remote-Änderungen zusätzlich `xx_sop/05_database_supabase.md` lesen.

## Commands
- Vor einem nicht aufgeführten Script sowie vor Remote- oder Schreibaktionen `xx_docs/02_command_reference.md` lesen.
- Auswahl und Reihenfolge der Prüfungen folgen `xx_sop/02_workflow_jan_execution.md`.

```bash
npm run dev        # Next.js auf Port 3015
npm run test       # Vitest
npm run typecheck  # TypeScript ohne Emit
npm run lint       # ESLint
npm run build      # Production-Build
```

### Execution Policy
- Vor Terminal-, Remote- oder Schreibaktionen `xx_docs/03_execution_environment_reference.md` lesen.
- Für Umsetzungsablauf und Verifikation `xx_sop/02_workflow_jan_execution.md` befolgen.
- Nicht-interaktive Flags und Pager-Unterdrückung nur verwenden, wenn der Befehl sie unterstützt.
- Plattformfreigaben ersetzen niemals Nutzerauftrag, Scope oder Autorisierung.
- K4-Externe Änderungen und K5-destruktive/Live-Aktionen erfordern ausdrückliche Freigabe.

## Architecture

### Tech Stack

Next.js 16.3 App Router · React 19.2 · TypeScript 5 · Supabase (Auth, DB, SSR, Realtime) · Zustand 5 (nur UI-Persistenz) · Zod 4 · Framer Motion 12 · Lucide · Recharts · Upstash Redis/Rate Limit · OpenAI Responses API · Trigger.dev 4 · PostHog · Sentry · Web Crypto (Provably Fair)

### Service Layer — `src/lib/casino/`

- Page- und UI-Komponenten bestimmen keine Wett-, Wallet-, RNG- oder Settlement-Ergebnisse.
- Geschäftsregeln und gemeinsame Verträge liegen in `src/lib/casino/`; API-Routen koordinieren Authentifizierung, Request-Validierung und Response-Transport.
- Bei Änderungen an Geschäftsregeln oder Service-Modulen zuerst `xx_docs/05_service_layer_context.md` und `xx_sop/06_service_layer_casino.md` lesen.


### Analytics — `src/lib/analytics/`

Consent-gesteuerte PostHog-Integration (Detail: `docs/archive/05_2.9_PostHog_Analytics.md`, abgeschlossen).

| File                              | Purpose                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `consent.ts`                      | Consent-Gate (`useSyncExternalStore`), vor jedem Analytics-Call geprüft                        |
| `posthog-client.ts`               | Lazy PostHog-SDK-Init, IP/Autocapture/Session-Recording aus                                    |
| `identity-hmac.ts`, `identify.ts` | HMAC-basierte User-Identity über `/api/analytics/identity` — nie die rohe User-ID im Client    |
| `events.ts`                       | Event-Allowlist (`z.strictObject`), inkl. `passkey_*` und `mfa_totp_enrolled`/`unenrolled`     |
| `posthog-erasure.ts`              | Erasure-Funktion, aktuell unverdrahtet (kein bestehender Nutzerlöschprozess in der App)        |

### State — `src/store/useCasinoStore.ts`

Zustand hält UI-, Historien- und Einstellungszustand. `balance`, `xp`, `level` und `rank` werden nicht in localStorage oder die Dev-State-Datei persistiert. Startbalance ist `0`.

- `applyServerWalletSnapshot()` ist die einzige Client-Grenze für Walletwerte und validiert mit Zod.
- `processGameResult()` schreibt nur bestätigte Historie, Statistik und Achievement-Fortschritt; keine Walletwerte.
- Lokale Credits/Debits und anonyme XP-Migration sind fail-closed deaktiviert, bis eigene atomare Serverendpunkte existieren.
- **Feature-Stripdown (2026-08-08)**: Challenges, Daily Reward (Header-Button + Vault-Karte), Rakeback-Auszahlung (`rakebackPool`/`claimRakeback`) und Loot Cases (`inventory`/`openCase`) sind vollständig entfernt (nicht nur ausgeblendet) — waren fail-closed und taten bereits nichts. VIP-Rangsystem (Tiers, `RankBenefitsModal`, "X% Rakeback"-Infoanzeige) und Achievements bleiben unverändert. Auch `HomeClientV2.tsx` verliert dabei `FeaturedOffersV2`/`GoldenPath`/`DailyBonusWeeklyV2` (Homepage-Promo-Widgets) und 7 tote V1-Homepage-Komponenten sind gelöscht.

### API Routes — `src/app/api/`

| Route                                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/casino/bet`                                                                                                                     | Serverberechnung für Dice/Slots/Roulette sowie Crash Start/Cashout/Resolve; UUID-Idempotenz; atomare RPCs; kein Client-Fallback. Crash-Start liefert seit Multiplayer-Crash (worldmap/05_multiplayercrash.md) keinen `crashPoint` mehr direkt zurück — nur `crashRoundId`/`bettingEndsAt`; Cashout/Resolve lösen gegen die geteilte `crash_rounds`-Runde auf. |
| `POST /api/casino/blackjack`                                                                                                               | Serverzustand für Deal/Hit/Stand/Double/Split; versionierte, idempotente Runde; Client sendet keine Auszahlung.                                                                                                                                                                                                                                               |
| `GET /api/user/balance`                                                                                                                    | Provisioniert fehlenden Supabase-User und liefert typisierten Snapshot; DB-Fehler ergeben 503.                                                                                                                                                                                                                                                                |
| `POST /api/webhooks/clerk`                                                                                                                 | 410; Clerk-User-Provisioning wurde durch den nativen `auth.users`-Trigger (Migration 008) ersetzt.                                                                                                                                                                                                                                                            |
| `POST /api/casino/session-sync`, `migrate-session`                                                                                         | 410; clientseitige Progressionsmigration wurde entfernt.                                                                                                                                                                                                                                                                                                      |
| `GET /api/analytics/identity`                                                                                                              | Liefert HMAC-`distinctId` für PostHog-`identify()`; nie die rohe User-ID.                                                                                                                                                                                                                                                                                     |
| `GET/POST /api/admin/fraud`, `POST /api/admin/fraud/scan`                                                                                  | Fraud-Signal-Übersicht und manueller Scan-Trigger (Admin-only).                                                                                                                                                                                                                                                                                               |
| `GET/POST /api/admin/promo-codes`                                                                                                          | Promo-Code-Verwaltung: Erstellung, Status (Admin-only, Migration 021).                                                                                                                                                                                                                                                                                        |
| `POST /api/casino/redeem-code`                                                                                                             | Promo-Code-Einlösung durch Nutzer, schreibt Redemption-Ledger (Migration 023).                                                                                                                                                                                                                                                                                |
| `GET /api/admin/overview`, `/games`, `/analytics`, `/users`                                                                                | Admin-Dashboard-Datenquellen: DB-Aggregate für Overview/Games/Cohort-Analytics; User-/Wallet-Management (Admin-only).                                                                                                                                                                                                                                         |
| `/api/telegram/link`, `/unlink`, `/toggle`, `/status`, `/webhook`                                                                          | Telegram-Opt-in-Flow + eingehender Bot-Webhook (Shared-Secret statt Origin-Check, wie `/api/internal/cron-alert`).                                                                                                                                                                                                                                            |
| `POST /api/chat`, `/api/chat/bot-response`                                                                                                 | Casino-Guide-Chat (OpenAI) und GlobalChat-Bot-Kommandos (`/tip`, `/leaderboard`).                                                                                                                                                                                                                                                                             |
| `GET /api/leaderboard`, `/user/history`, `/user/stats`, `/casino/seeds(+/history)`, `/casino/active-round`, `/casino/config`, `/community` | Read-only: Ranking, Wetthistorie, Stats-Ableitung, Seed-Reveal/-Historie, aktive Crash-/Blackjack-Runde, Client-Config (VIP/Game/Achievements), Community-Wagered-Ziel. `/casino/active-round?game=CRASH` liefert seit Multiplayer-Crash zusätzlich `sharedRound` (maskierter Raumstatus, REST-Fallback zum Realtime-Broadcast).                              |
| `GET /api/health`, `POST /api/internal/cron-alert`                                                                                         | Öffentlicher Liveness-Probe (kein DB-Zugriff) und interner Cron-Failure-Alert (Shared-Secret-Auth, `pg_net`-Aufrufer aus Migration 027).                                                                                                                                                                                                                      |

### Middleware — `src/proxy.ts`

Supabase-Session (via `@supabase/ssr`, Cookie-basiert, Refresh pro Request) schützt nicht-öffentliche Routen. `/admin` ist nicht public: anonym → Sign-in, normaler User → 403, Admin → Zugriff per `SUPABASE_ADMIN_EMAILS`-Allowlist (`isAdminEmail()`). Mutation-Origin und Host werden exakt verglichen; Clerk-Webhook-Route bleibt wegen Svix vom Browser-Origin-Check ausgenommen (jetzt 410, siehe oben). Casino-/Wallet-API-Handler erzwingen Auth selbst und liefern JSON statt HTML-Redirects. Terminale Antworten (Redirect/403) übertragen die vom Session-Refresh rotierten Cookies explizit (`withRefreshedCookies()`) — sonst geht der rotierte Token verloren und der nächste Request scheitert am Refresh.

### Layout Shell

`src/app/layout.tsx` wraps everything in `ClientProviders` (mountet `SupabaseSessionProvider`, einen React-Context um `supabase.auth.onAuthStateChange`) mit custom dark theme variables, then renders `ClientShell`. `ClientShell` mounts `MainLayout` for normal routes, `AdminLayout` for `/admin/**`, and renders the `/v2` design-sandbox bare (no `MainLayout`/`AdminLayout` shell — intentional, WIP). `MainLayout` contains the sidebar nav, all modal layers (Wallet, Settings, RankBenefits, PlayerProfile), `GlobalChat`, `CommandPalette`, and `BigWinOverlay` (`DailyReward` und `Challenges` wurden beim Feature-Stripdown 2026-08-08 entfernt). Game pages render inside this shell.

> `/backend` (ehemalige Supabase-Auth-Sandbox) wurde gelöscht; die Haupt-App nutzt native Supabase Auth über `/sign-in`, `/sign-up` und `SupabaseSessionProvider` (siehe `docs/architecture/02_CLERK_SUPABASE.md`).

### Games — `src/app/games/[game]/page.tsx`

Games: `blackjack`, `crash`, `dice`, `roulette`, `slots`. Each is a self-contained page component. Game-specific sub-components live in `src/components/casino/games/[game]/`. Slots uses `src/components/casino/SlotSymbol.tsx`.

Dice, Slots und Roulette nutzen `/api/casino/bet`; Crash nutzt persistente Serverrunden plus eine geteilte `crash_rounds`-Raum-Uhr (Multiplayer-Crash, worldmap/05_multiplayercrash.md); Blackjack nutzt `/api/casino/blackjack`. Jede erfolgreiche Antwort liefert einen Wallet-Snapshot vor der nicht-finanziellen Historie.

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

| Datei                                                    | Zweck                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_users.sql` – `006_game_configs.sql`                 | Basistabellen und bestehende Konfiguration                                                                                                                                                                                                                                                                                                                                                                  |
| `007_server_authority.sql`                               | Idempotente Standard-Settlements, Crash-/Blackjack-Runden, atomare Aktions-RPCs                                                                                                                                                                                                                                                                                                                             |
| `008`–`020`                                              | Auth-Bridge, Meta-Features, Welcome-Bonus, Achievements, Leaderboard-RPC — Details: [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md)                                                                                                                                                                                                                                                                 |
| `021_promo_codes.sql`, `023_promo_redemption_ledger.sql` | Promo-Code-Erstellung und -Einlösung (Ledger)                                                                                                                                                                                                                                                                                                                                                               |
| `024`–`029`                                              | Guide-Telemetry, Telegram-Link, Wallet-Ledger-Invarianten, Risk-Events                                                                                                                                                                                                                                                                                                                                      |
| `030_fraud_signal_detection.sql`                         | Fraud-Signal-Persistenz für `/api/admin/fraud`                                                                                                                                                                                                                                                                                                                                                              |
| `031`–`036`                                              | Promo-Code-Seed, Progressive-Jackpot-Pool/-Contribution/-Trigger/-Public-Read, Wallet-Events-Outbox                                                                                                                                                                                                                                                                                                         |
| `037_multiplayer_crash_rounds.sql`                       | Multiplayer-Crash-Raumtakt: `crash_rounds`-Tabelle, `sync_crash_round`/`set_crash_round_point`-RPCs, additive `game_rounds.crash_round_id`-FK. Redefiniert zusätzlich `start_game_round` (CREATE OR REPLACE auf Basis des seit 007 unveränderten Bodys) um einen CRASH-spezifischen Race-Guard im bestehenden Advisory-Lock (L6-Security-Fund, worldmap/05_multiplayercrash.md §17). Nur lokal, siehe oben. |
| `src/lib/casino/wallet.ts`                               | Strikt validierter Service-Role-Zugriff; keine Hardcoded-Fallbacks                                                                                                                                                                                                                                                                                                                                          |
| `src/utils/supabase/admin.ts`                            | Server-only Service-Role-Client                                                                                                                                                                                                                                                                                                                                                                             |

Remote-Status: siehe Supabase-Sektion oben — laut [00_WORLDMAP_STATUS.md](worldmap/00_WORLDMAP_STATUS.md) alle 12 Kategorien Prod-Ready: Ja, Migrationen `001`–`030` live. `031`–`037` sind lokal vorhanden; ihr Remote-Status ist in dieser Datei nicht verifiziert (nicht Teil dieser Initiative, außer `037` selbst — siehe L7).

## Workflows & SOPs (On-Demand Router)

Vor dem Ausführen strukturierter Aufgaben liest das LLM die entsprechende SOP via File-Read-Tool ein:

| Trigger / Aufgabe | SOP-Datei | Wann einlesen |
| :--- | :--- | :--- |
| **Workflow-Jan Option-Gate** | [`xx_sop/01_workflow_jan_option_gate.md`](xx_sop/01_workflow_jan_option_gate.md) | Vor Architektur-, Design- & Scope-Entscheidungen (3 Optionen nach Jan-Schema). |
| **Workflow-Jan Execution** | [`xx_sop/02_workflow_jan_execution.md`](xx_sop/02_workflow_jan_execution.md) | Bei Aufgaben-Umsetzung & 5-Stufen-Selbstprüfung. |
| **Workflow-Jan Planungsdateien** | [`xx_sop/03_workflow_jan_planungsdateien.md`](xx_sop/03_workflow_jan_planungsdateien.md) | Vor dem Anlegen/Pflegen von Meilenstein-Dateien in `worldmap/`. |
| **Workflow-Jan Frontend-Revamp** | [`xx_sop/10_workflow_frontend_revamp.md`](xx_sop/10_workflow_frontend_revamp.md) | Bei UI/UX-Umbauten, Screenshots oder Redesigns (3-Optionen-Design-Schema & URL-Abnahme). |
