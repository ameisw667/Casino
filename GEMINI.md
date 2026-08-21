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

## Supabase

- **Aktives Projekt (seit 2026-07-28)**: dediziertes Supabase-Projekt ausschließlich für Casino (`hmqwozhdckbwjqzcmire`, siehe `.env.local`). Keine geteilte Master-DB mehr für dieses Projekt — deshalb **kein** `casino_`-Präfix nötig, Tabellen heißen schlicht `users`, `wallet_transactions`, etc.
- **Alte Master-DB (mehrere Vibe-Coding-Projekte, ein Supabase-Account)**: wird noch für den Übergang referenziert. Regel dort weiterhin gültig: nur Tabellen mit `casino_`-Präfix ansehen/anfassen, nie `SELECT *` ohne diesen Filter. Ziel: Daten ins neue Projekt migrieren, danach die alten Casino-Tabellen in der Master-DB löschen.
- `.env.local` enthält 3/3 Supabase-Variablen. Der Live-Status ist wegen DNS-Auflösungsfehler des konfigurierten Hosts unbewiesen. Migration `007_server_authority.sql` muss vor Wallet-Tests mit einem DDL-fähigen Zugang ausgerollt werden.

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

### Auto-Allow & Execution Policy (Antigravity)

- **K1/K2 Auto-Allow**: Read-only (`git status`, `git diff`, `git log`) und CI/Test-Befehle (`npm test`, `npm run lint`, `npx tsc`, `npm run build`, `npm run vibe-check`) werden global auf Auto-Allow gesetzt (Option 4 im Bestätigungsdialog).
- **Non-Interactive Execution**: Befehle immer mit non-interactive Flags ausführen (`--yes`, `-y`, `CI=true`), um CLI-Hangs zu verhindern.
- **No-Pager**: `PAGER=cat` oder `--no-pager` für Git-Befehle nutzen.
- **K5 Block**: Destruktive/Live-Befehle (`git push --force`, `rm -rf`, `supabase db reset`) erfordern immer explizite manuelle Bestätigung.
- **Detail-Plan**: Siehe [docs/archive/01_Antigravity_Workflow_Optimization.md](docs/archive/01_Antigravity_Workflow_Optimization.md).

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

| File               | Purpose                                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `casino-core.ts`   | `CasinoCore` — single entry point for all bets. `placeBet()` routes by `GameType`, calls `ProvablyFairEngine`, returns `BetResult`. Also exposes `startCrashRound()`, `calculateXpGain()`, `calculateLevel()`.                                                                                    |
| `provably-fair.ts` | `ProvablyFairEngine` — isomorphic, uses Web Crypto API only (no Node crypto). HMAC-SHA256 with format `serverSeed:clientSeed:nonce`. Game-specific helpers: `getDiceRoll()` (0–100), `getCrashMultiplier()` (1% house edge), `getRouletteNumber()` (0–36), `getSlotsResult()` (per-reel indices). |
| `bet-validator.ts` | `validateBet()` — pure function, validates bet range ($0.10–$10,000) and sufficient balance. Call before `placeBet()`.                                                                                                                                                                            |
| `sound-manager.ts` | `soundManager` singleton — wraps Audio API with volume and mute control.                                                                                                                                                                                                                          |
| `chat-bot.ts`      | `ChatBotService` — command parsing for chat (`/tip`, `/leaderboard` etc.).                                                                                                                                                                                                                        |
| `logger.ts`        | `CasinoLogger` — structured bet logging, dev-only stack traces.                                                                                                                                                                                                                                   |
| `wallet.ts`        | `WalletService` — all balance ops via Supabase RPC.                                                                                                                                                                                                                                               |

### State — `src/store/useCasinoStore.ts`

Zustand hält UI-, Historien- und Einstellungszustand. `balance`, `xp`, `level` und `rank` werden nicht in localStorage oder die Dev-State-Datei persistiert. Startbalance ist `0`.

- `applyServerWalletSnapshot()` ist die einzige Client-Grenze für Walletwerte und validiert mit Zod.
- `processGameResult()` schreibt nur bestätigte Historie, Statistik und Achievement-Fortschritt; keine Walletwerte.
- Lokale Credits/Debits und anonyme XP-Migration sind fail-closed deaktiviert, bis eigene atomare Serverendpunkte existieren.
- **Feature-Stripdown (2026-08-08)**: Challenges, Daily Reward (Header-Button + Vault-Karte), Rakeback-Auszahlung (`rakebackPool`/`claimRakeback`) und Loot Cases (`inventory`/`openCase`) sind vollständig entfernt (nicht nur ausgeblendet) — waren fail-closed und taten bereits nichts. VIP-Rangsystem (Tiers, `RankBenefitsModal`, "X% Rakeback"-Infoanzeige) und Achievements bleiben unverändert. Auch `HomeClientV2.tsx` verliert dabei `FeaturedOffersV2`/`GoldenPath`/`DailyBonusWeeklyV2` (Homepage-Promo-Widgets) und 7 tote V1-Homepage-Komponenten sind gelöscht.

### API Routes — `src/app/api/`

| Route                                              | Notes                                                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/casino/bet`                             | Serverberechnung für Dice/Slots/Roulette sowie Crash Start/Cashout/Resolve; UUID-Idempotenz; atomare RPCs; kein Client-Fallback. |
| `POST /api/casino/blackjack`                       | Serverzustand für Deal/Hit/Stand/Double/Split; versionierte, idempotente Runde; Client sendet keine Auszahlung.                  |
| `GET /api/user/balance`                            | Provisioniert fehlenden Supabase-User und liefert typisierten Snapshot; DB-Fehler ergeben 503.                                   |
| `POST /api/webhooks/clerk`                         | 410; Clerk-User-Provisioning wurde durch den nativen `auth.users`-Trigger (Migration 008) ersetzt.                               |
| `POST /api/casino/session-sync`, `migrate-session` | 410; clientseitige Progressionsmigration wurde entfernt.                                                                         |

### Middleware — `src/proxy.ts`

Supabase-Session (via `@supabase/ssr`, Cookie-basiert, Refresh pro Request) schützt nicht-öffentliche Routen. `/admin` ist nicht public: anonym → Sign-in, normaler User → 403, Admin → Zugriff per `SUPABASE_ADMIN_EMAILS`-Allowlist (`isAdminEmail()`). Mutation-Origin und Host werden exakt verglichen; Clerk-Webhook-Route bleibt wegen Svix vom Browser-Origin-Check ausgenommen (jetzt 410, siehe oben). Casino-/Wallet-API-Handler erzwingen Auth selbst und liefern JSON statt HTML-Redirects. Terminale Antworten (Redirect/403) übertragen die vom Session-Refresh rotierten Cookies explizit (`withRefreshedCookies()`) — sonst geht der rotierte Token verloren und der nächste Request scheitert am Refresh.

### Layout Shell

`src/app/layout.tsx` wraps everything in `ClientProviders` (mountet `SupabaseSessionProvider`, einen React-Context um `supabase.auth.onAuthStateChange`) mit custom dark theme variables, then renders `ClientShell`. `ClientShell` mounts `MainLayout` for normal routes, `AdminLayout` for `/admin/**`, and renders `/backend/**` with **no shell at all** (bare page, no sidebar/nav/modals — intentional, see below). `MainLayout` contains the sidebar nav, all modal layers (Wallet, Settings, DailyReward, Challenges, RankBenefits, PlayerProfile), `GlobalChat`, `CommandPalette`, and `BigWinOverlay`. Game pages render inside this shell.

### `/backend` — Supabase-Auth sandbox (Vorstufe der Haupt-Migration)

Functionality-only test route, deliberately outside the premium design system (no Design-Guardian rules apply here — it will never go live with real users). Above-the-fold, no scroll: header with email/password sign-in form (top-right), sidebar linking to every real page/game, main area showing session state. War der erste Baustein der Auth-Migration; die Haupt-App nutzt inzwischen dieselbe Supabase-Auth über `/sign-in`, `/sign-up` und `SupabaseSessionProvider` (siehe `docs/architecture/02_CLERK_SUPABASE.md`).

- `src/app/backend/page.tsx` — the page itself
- `src/utils/supabase/client.ts` — native Supabase Auth browser client (`createBrowserClient` from `@supabase/ssr`), gemeinsam genutzt von `/backend`, `/sign-in`, `/sign-up` und `SupabaseSessionProvider`
- Public route: added to `isPublicRoute` in `src/proxy.ts`
- Bypasses `MainLayout`/`AdminLayout` via a dedicated branch in `ClientShell.tsx`

### Games — `src/app/games/[game]/page.tsx`

Games: `blackjack`, `crash`, `dice`, `roulette`, `slots`. Each is a self-contained page component. Game-specific sub-components live in `src/components/casino/games/[game]/`. Slots uses `src/components/casino/SlotSymbol.tsx`.

Dice, Slots und Roulette nutzen `/api/casino/bet`; Crash nutzt persistente Serverrunden; Blackjack nutzt `/api/casino/blackjack`. Jede erfolgreiche Antwort liefert einen Wallet-Snapshot vor der nicht-finanziellen Historie.

### Admin Pages — `src/app/admin/`

| Route               | Notes                       |
| ------------------- | --------------------------- |
| `/admin`            | Dashboard overview          |
| `/admin/games`      | Per-game stats and controls |
| `/admin/users`      | User management             |
| `/admin/simulation` | Bet simulation tooling      |

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

| Datei                                    | Zweck                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `001_users.sql` – `006_game_configs.sql` | Basistabellen und bestehende Konfiguration                                      |
| `007_server_authority.sql`               | Idempotente Standard-Settlements, Crash-/Blackjack-Runden, atomare Aktions-RPCs |
| `src/lib/casino/wallet.ts`               | Strikt validierter Service-Role-Zugriff; keine Hardcoded-Fallbacks              |
| `src/utils/supabase/admin.ts`            | Server-only Service-Role-Client                                                 |

Remote-Status: 3/3 Supabase-ENV-Werte konfiguriert; Live-GET am 2026-08-05 wegen DNS-Auflösungsfehler nicht möglich. Daher weder 8/8 Tabellen noch Migration 007 als live behaupten.
