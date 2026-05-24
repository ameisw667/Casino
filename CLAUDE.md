# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev          # Start dev server (Next.js, port 3000)
npm run build        # Production build
npm run lint         # ESLint (next lint config)
npm run test         # Vitest (run once)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Vitest with coverage
npm run vibe-check   # Custom audit script: tsx scripts/vibe-check.ts
```

Tests live in `src/lib/casino/__tests__/`. Run `npm run vibe-check` after significant changes. For dev auth bypass, set `ALLOW_DEV_FALLBACK=true` in `.env.local` (the bet API accepts an unauthenticated `dev_user_fallback` userId in dev mode only).

---

## Architecture

### Tech Stack
Next.js 16 App Router · React 19 · TypeScript · Zustand 5 (persist) · Framer Motion 12 · Clerk (auth) · Zod (validation) · Lucide React (icons) · Recharts (charts) · Upstash Redis + Rate Limit · Svix (webhooks) · Web Crypto API (provably fair)

### Service Layer — `src/lib/casino/`

All business logic lives here, never in page components.

| File | Purpose |
|------|---------|
| `casino-core.ts` | `CasinoCore` — single entry point for all bets. `placeBet()` routes by `GameType`, calls `ProvablyFairEngine`, returns `BetResult`. Also exposes `startCrashRound()`, `calculateXpGain()`, `calculateLevel()`. |
| `provably-fair.ts` | `ProvablyFairEngine` — isomorphic, uses Web Crypto API only (no Node crypto). HMAC-SHA256 with format `serverSeed:clientSeed:nonce`. Game-specific helpers: `getDiceRoll()` (0–100), `getCrashMultiplier()` (1% house edge), `getRouletteNumber()` (0–36), `getSlotsResult()` (per-reel indices). |
| `bet-validator.ts` | `validateBet()` — pure function, validates bet range ($0.10–$10,000) and sufficient balance. Call before `placeBet()`. |
| `sound-manager.ts` | `soundManager` singleton — wraps Audio API with volume and mute control. |
| `chat-bot.ts` | `ChatBotService` — command parsing for chat (`/tip`, `/leaderboard` etc.). |
| `logger.ts` | `CasinoLogger` — structured bet logging, dev-only stack traces. |
| `wallet.ts` | `WalletService` — all balance ops via Supabase RPC. |

### State — `src/store/useCasinoStore.ts`

Single Zustand store with `persist` middleware. Holds **all** client state: `balance`, `xp`, `level`, `rank`, `bets`, `achievements`, `challenges`, `rakebackPool`, `provablyFairSettings`, `gameStats`, `analytics`, `responsibleGaming`, `toasts`, and auto-bet settings per game.

**Critical flow — `processGameResult()`**: the only function that should mutate balance. It atomically updates balance, XP, rakeback, achievements/challenge progress, martingale detection, and the community goal counter. Never update balance directly.

VIP tiers are defined as `VIP_TIERS` array exported from the store (Bronze → Silver → Gold → Platinum → Diamond, keyed by XP thresholds and rakeback %).

### API Routes — `src/app/api/`

| Route | Notes |
|-------|-------|
| `POST /api/casino/bet` | Zod-validated (`BetSchema`). Calls `CasinoCore.placeBet()` or `startCrashRound()`. Returns `BetResult`. Balance is **not** updated server-side (no DB yet) — settlement is client-only via the store. |
| `GET /api/user/balance` | Returns hardcoded balance. Placeholder until DB exists. |
| `POST /api/webhooks/clerk` | Svix-verified Clerk webhook handler (user created/updated events). |

### Middleware — `src/middleware.ts`

Runs Clerk auth on all routes. Public routes (games, fairness, leaderboard, vault, affiliate, admin, history) skip auth. Adds HSTS, X-Frame-Options, nosniff headers on every response. CSRF check: rejects non-GET requests from origins that don't match `host`.

### Layout Shell

`src/app/layout.tsx` wraps everything in `ClerkProvider` with custom dark theme variables, then renders `ClientShell`. `ClientShell` mounts `MainLayout`, which contains the sidebar nav, all modal layers (Wallet, Settings, DailyReward, Challenges, RankBenefits, PlayerProfile), `GlobalChat`, `CommandPalette`, and `BigWinOverlay`. Game pages render inside this shell.

### Games — `src/app/games/[game]/page.tsx`

Games: `blackjack`, `crash`, `dice`, `roulette`, `slots`. Each is a self-contained page component. Game-specific sub-components live in `src/components/casino/games/[game]/`. Slots uses `src/components/casino/SlotSymbol.tsx`.

All games call `CasinoCore.placeBet()` (or the `/api/casino/bet` endpoint) and then call `processGameResult()` on the store to settle.

### Admin Pages — `src/app/admin/`

| Route | Notes |
|-------|-------|
| `/admin` | Dashboard overview |
| `/admin/games` | Per-game stats and controls |
| `/admin/users` | User management |
| `/admin/simulation` | Bet simulation tooling |

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
- **Z-Index Architecture**:
  - `z-0` to `z-10`: Page content
  - `z-20`: Header/Nav
  - `z-30`: Dropdowns/Command Palette
  - `z-40`: Overlays/Backdrops
  - `z-50`: Modals
  - `z-100`: Toasts/Live-Win notifications
  - `z-999`: Loading overlays
- Reusable motion primitives: `src/components/ui/VibeMotion.tsx`, `src/components/ui/Magnetic.tsx`
- Every win must trigger a visual reward (BigWinOverlay, confetti, or glow)

### Key Constraints

- **Provably fair is client-generated**: `ProvablyFairEngine.generateServerSeed()` runs client-side. Server seeds are not secret — this must be fixed before production.
- **All routes are effectively public**: The middleware marks games, vault, leaderboard, affiliate, and admin as public routes — Clerk auth is not enforced on them.

### Database Architecture (Supabase)

Balance and XP live in Supabase `users` table — **server-side, not localStorage**.

| File | Purpose |
|------|---------|
| `supabase/migrations/001_users.sql` | users table with Clerk TEXT ID + RLS |
| `supabase/migrations/002_wallet.sql` | wallet_transactions + game_sessions audit tables |
| `supabase/migrations/003_provably_fair.sql` | seeds table + `place_bet()` / `settle_bet()` stored procedures |
| `src/lib/casino/wallet.ts` | WalletService — all balance ops via Supabase RPC |
| `src/utils/supabase/client.ts` | Browser client (anon key, used in client components) |
| `src/utils/supabase/server.ts` | Server client with Clerk JWT for RLS |
| `src/utils/supabase/admin.ts` | Admin client (service role, bypasses RLS — server only) |

**RLS Policy**: `(auth.jwt() ->> 'sub') = user_id` — requires Clerk JWT injected via `getToken({ template: 'supabase' })`.

**Bet flow**: `place_bet()` → atomic debit + audit row → `settle_bet()` → atomic credit + XP + audit row.

**Migrations**: Apply with `supabase migration up` or paste into Supabase SQL editor in order (001 → 002 → 003).

### Applying Migrations

```bash
# Local Supabase CLI
supabase migration up

# Or paste each file in order into Supabase Dashboard → SQL Editor
# 001_users.sql → 002_wallet.sql → 003_provably_fair.sql
```
