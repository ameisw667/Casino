# 10 — Production Bug Hunting & Verification Master Blueprint

> **Status:** 🟢 Master-Dashboard für QA & Bug-Hunting · **Stand:** 2026-08-20  
> **Projekt:** Casino (Next.js 16 App Router · Supabase · Zustand · Upstash · Sentry · Playwright)  
> **Zweck:** Einheitliche Übersicht aller Testdisziplinen und der 17 Anwendungsrouten auf localhost und in Produktion.

---

## 1 — Zentrales QA-System-Dashboard

|   #   | Prüf-Bereich                  | Was wird geprüft?                                    | Werkzeuge                          | Reale Menge im Repo  |     Status     |
| :---: | :---------------------------- | :--------------------------------------------------- | :--------------------------------- | :------------------: | :------------: |
| **1** | **Code & Typen**              | TypeScript Strict Check, ESLint Regeln, Build        | `tsc`, `eslint`, `next build`      | 36 Seiten / 0 Fehler | ✅ Verifiziert |
| **2** | **Service & Mathematik**      | Payouts, RNG, Provably Fair HMAC-SHA256, XP          | Vitest, `npm run vibe-check`       | 671 Tests (80 Files) | ✅ Verifiziert |
| **3** | **State & Snapshot**          | Client-Store Schranke, Zero-Storage für Geld         | Zustand Store Tests                |       71 Tests       | ✅ Verifiziert |
| **4** | **API & Server-Locks**        | Zod-Payloads, UUID-Idempotenz, DB-Locks              | Vitest Authority Tests             |  13 Tests (5 Files)  | ✅ Verifiziert |
| **5** | **E2E Browser-Flows**         | Vollständige Nutzer- und Spielpfade im DOM           | Playwright (Chromium)              | 39 Tests (16 Specs)  | ✅ Verifiziert |
| **6** | **Konsolen- & Runtime-Audit** | 0 Console Errors, Hydration-Guards, Leaks            | Chrome DevTools / Playwright Spy   | 17 Routen (0 Fehler) | ✅ Verifiziert |
| **7** | **Security & Auth**           | Cookie-Rotation (`withRefreshedCookies`), 503 Limits | Proxy- & Security-Tests            |  22 Tests (3 Files)  | ✅ Verifiziert |
| **8** | **Resilienz & Concurrency**   | Multi-Tab Race Conditions, Double-Spend Block        | Postgres `pg_advisory_xact_lock`   |   Migration `007`    | ✅ Verifiziert |
| **9** | **Live-Observability**        | Sentry EU Error-Tracking mit PII-Scrubbing           | Sentry SDK, PostHog, `/api/health` |  51 Tests (6 Files)  | ✅ Verifiziert |

---

## 2 — Seiten- & Interaktions-Matrix (17 Routen)

| Kategorie          | Route               | Beschreibung            | 1. Unit-Test |       2. E2E Browser-Test       | 3. Button- & Konsolen-Vollprüfung | Detailplan                                                 |
| :----------------- | :------------------ | :---------------------- | :----------: | :-----------------------------: | :-------------------------------: | :--------------------------------------------------------- |
| **Lobby & Spiele** | `/`                 | Hauptseite / Lobby      |    ✅ Ja     |   ✅ Ja (`e2e-lobby.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_01_lobby.md`](E2E_01_lobby.md)                       |
| **Lobby & Spiele** | `/games`            | Spiele-Übersicht        |    ✅ Ja     |   ✅ Ja (`e2e-games.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_02_games.md`](E2E_02_games.md)                       |
| **Lobby & Spiele** | `/games/dice`       | Dice (Würfelspiel)      |    ✅ Ja     |   ✅ Ja (`e2e-dice.spec.ts`)    |            ✅ 0 Fehler            | [`E2E_03_dice.md`](E2E_03_dice.md)                         |
| **Lobby & Spiele** | `/games/crash`      | Crash (Multiplier)      |    ✅ Ja     |   ✅ Ja (`crash-e2e.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_04_crash.md`](E2E_04_crash.md)                       |
| **Lobby & Spiele** | `/games/roulette`   | European Roulette       |    ✅ Ja     | ✅ Ja (`roulette-e2e.spec.ts`)  |            ✅ 0 Fehler            | [`E2E_05_roulette.md`](E2E_05_roulette.md)                 |
| **Lobby & Spiele** | `/games/slots`      | Slot Machine            |    ✅ Ja     |   ✅ Ja (`slots-e2e.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_06_slots.md`](E2E_06_slots.md)                       |
| **Lobby & Spiele** | `/games/blackjack`  | Blackjack Table         |    ✅ Ja     | ✅ Ja (`e2e-blackjack.spec.ts`) |            ✅ 0 Fehler            | [`E2E_07_blackjack.md`](E2E_07_blackjack.md)               |
| **Nutzerbereich**  | `/leaderboard`      | Globales Ranking        |    ✅ Ja     | ✅ Ja (`e2e-user-area.spec.ts`) |            ✅ 0 Fehler            | [`E2E_08_leaderboard.md`](E2E_08_leaderboard.md)           |
| **Nutzerbereich**  | `/history`          | Wetthistorie (My Bets)  |    ✅ Ja     | ✅ Ja (`e2e-user-area.spec.ts`) |            ✅ 0 Fehler            | [`E2E_09_history.md`](E2E_09_history.md)                   |
| **Nutzerbereich**  | `/vault`            | VIP Vault & Progression |    ✅ Ja     | ✅ Ja (`e2e-user-area.spec.ts`) |            ✅ 0 Fehler            | [`E2E_10_vault.md`](E2E_10_vault.md)                       |
| **Auth**           | `/sign-in`          | Anmeldeseite            |    ✅ Ja     |   ✅ Ja (`e2e-auth.spec.ts`)    |            ✅ 0 Fehler            | [`E2E_11_signin.md`](E2E_11_signin.md)                     |
| **Auth**           | `/sign-up`          | Registrierung           |    ✅ Ja     |   ✅ Ja (`e2e-auth.spec.ts`)    |            ✅ 0 Fehler            | [`E2E_12_signup.md`](E2E_12_signup.md)                     |
| **Admin**          | `/admin`            | Admin Dashboard         |    ✅ Ja     |   ✅ Ja (`e2e-admin.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_13_admin_overview.md`](E2E_13_admin_overview.md)     |
| **Admin**          | `/admin/games`      | Per-Game Statistics     |    ✅ Ja     |   ✅ Ja (`e2e-admin.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_14_admin_games.md`](E2E_14_admin_games.md)           |
| **Admin**          | `/admin/analytics`  | Cohort & Retention BI   |    ✅ Ja     |   ✅ Ja (`e2e-admin.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_15_admin_analytics.md`](E2E_15_admin_analytics.md)   |
| **Admin**          | `/admin/users`      | User & Wallet Admin     |    ✅ Ja     |   ✅ Ja (`e2e-admin.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_16_admin_users.md`](E2E_16_admin_users.md)           |
| **Admin**          | `/admin/simulation` | Bet Simulation Tool     |    ✅ Ja     |   ✅ Ja (`e2e-admin.spec.ts`)   |            ✅ 0 Fehler            | [`E2E_17_admin_simulation.md`](E2E_17_admin_simulation.md) |

---

## 3 — Schnell-Befehlsreferenz

- **Statik & Typen:** `npm run typecheck` · `npm run lint` · `npm run build`
- **Logik & Mathematik:** `npm run test` (Vitest) · `npm run vibe-check`
- **Browser E2E:** `npx playwright test`
- **Sicherheit & Scans:** `npx vitest run src/lib/casino/__tests__/security-surface.test.ts`
