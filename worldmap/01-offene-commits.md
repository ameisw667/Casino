# 01 — World Map: Offene Commits — Konsolidierung & Execution Roadmap

> **Erstellt:** 2026-08-09 · **Status:** R1 C1 ✅ (`5860f83`) · C2 ✅ (`92cb929`) · C3 ✅ (`5d3fc7f`) · C4 ✅ (`d825c4b`) · C5 ✅ (`06f364d`) · C6 ✅ (`ca156f3`) · C7 ✅ (`9e97d53`) · C8 ✅ (`5c87a7a`) · C9 ✅ (`d85a2ce`) · C10 ✅ (`e6dd3d6`) · C11 ✅ (`cb88252`) · C12 ✅ (`d2d9777`) · **R2** C13 ✅ (`e44d712`) · C14 ✅ (`c7f9bc8`) · C15 ✅ (`eb209d9`) · C16 ✅ (`615c45a`) · C17 ✅ (`0b84e34`) · C18 ✅ (`7e1707e`) · C19 ✅ (`49b99da`) · C20 ✅ (`bd48ac5`) · C21 ✅ (`f9231f7`) · **Post-R2 C1** ✅ (`ca2a389`) · **R3** C22 ✅ (`2ed7c42`) · C23 ✅ (`5442c54`) · C24 ✅ (`28b2923`) · C25 ✅ (`fad10ef`) · C26 ✅ (`82860d0`) · C27 ✅ (`b1a5584`) · C28 ✅ (`6ab9207`). **Single-Source-of-Truth** — R1 + R2 + R3 vollständig konsolidiert und committed. **Offen:** B6 (`/v2`-Sitemap) · M21 (Migrationen 018–025 remote im Supabase SQL Editor ausführen).
> **Scope:** 5 % Übersichtstabelle für Jan · 95 % Execution-Detail für LLM.
> **Quellen:** `git status --porcelain`, `worldmap/02_FRONTEND_REDESIGN.md`, `docs/archive/03_CASINO_SUPABASE_CONNECTION.md`, `docs/archive/03_01_CASINO_SUPABASE_IMPLEMENTATION_PLAN.md`, `docs/archive/01b-c1-docs-commit-plan.md`.

---

## 1 — Übersichtstabelle (5 % Scope für Jan)

Legende Status: 🔴 uncommitted · 🟡 staged (nicht committed) · 🟢 committed (Referenz)
Legende Risiko: N = Niedrig · M = Mittel · H = Hoch
Legende Aufwand: S < 1 h · M = 1–4 h · L = 4 h+

| #   | Kategorie / Meilenstein (Future)                                                                                                                                          | Status         | Commit-Block | Risiko | Blockiert durch               | Aufwand |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------ | ------ | ----------------------------- | ------- |
| 1   | **Docs-Reorganisation** — `worldmap/` → `docs/status-reports/`, Root-Docs → `docs/`, neue Architecture- & Status-Docs, Prototypen, Archive                                | 🟢 committed   | C1           | N      | —                             | S       |
| 2   | **Supabase Schema** — Migrationen 014 (user_stats), 015 (get_leaderboard), 016 (full server-authority expansion: chat/seeds/community/active-round RPCs)                  | 🟢 committed   | C2           | M      | DDL-Rollout (Service-Role)    | S       |
| 3   | **Supabase Server-Autorität (Code)** — neue API-Routes chat/seeds/community/active-round + `WalletService`-Methoden                                                       | 🟢 committed   | C3           | M      | C2 live                       | M       |
| 4   | **Store & Gamification Hydration** — `useCasinoStore.initialize()` erweitert, `GamificationProvider`, vip/game-config, Session, `syncToFile()`-Entfernung                 | 🟢 committed   | C4           | H      | C3                            | M       |
| 5   | **Frontend v2 Sandbox (Cyber-Stealth)** — `app/v2`, `components/v2`, `styles/v2.css`, HTML-Prototypen, Hero-Showcase, Arcade-Grid, WebGL-Canvas, Slots v2                 | 🟢 (`06f364d`) | C5           | N      | —                             | L       |
| 6   | **History & Leaderboard Modularisierung** — `components/history/*`, `components/leaderboard/*` + Page-Rewrites (Kohorten 2–3 aus `02_FRONTEND_REDESIGN.md`)               | 🟢 (`ca156f3`) | C6           | M      | C5 (Tokens)                   | M       |
| 7   | **Slots v2 Assets & Symbols** — `public/images/slots/v2/`, modifizierte `sym-*.png`, `symbols.ts`, `SlotSymbol`/`SlotReel`/`WinLine`                                      | 🟢 (`9e97d53`) | C7           | N      | C5                            | S       |
| 8   | **Admin Pages Refactor** — 14 Admin-Komponenten + 3 Admin-API-Routes                                                                                                      | 🟢 (`5c87a7a`) | C8           | M      | —                             | M       |
| 9   | **Core-Libs & Security Hardening** — `provably-fair`, `casino-core`, `bet-validator`, `wallet-contract`, `security/admin`, `request-security`, `proxy.ts`, Supabase-Utils | 🟢 (`d85a2ce`) | C9           | H      | —                             | M       |
| 10  | **Game Pages & Shared Components Polish** — Games-Layouts, Casino-UI, UI-Primitives, Home/Social/Layout/Nav, Hooks                                                        | 🟢 (`e6dd3d6`) | C10          | M      | C5 (Design-Tokens)            | L       |
| 11  | **Tests & Scripts** — 24 modifizierte Test-Dateien + 2 neue Tests + 8 Scripts                                                                                             | 🟢 (`cb88252`) | C11          | M      | C2–C10 (je zugehöriger Block) | M       |
| 12  | **Config/Meta-Docs** — `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `01_WORLDMAP_STATUS.md`                                                                                     | 🟢 (`d2d9777`) | C12          | N      | alle Blöcke                   | S       |

**R3 — Neue Initiativen (Stand 2026-08-12 — alle committed)**

| #    | Initiative                                                                                                                                | Status       | Commit                      | Aufwand |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------- | ------- |
| R3-1 | **Commit-Reveal 1.2** — Provably-Fair Seed-Kette (`casino-core`, `wallet.consumeActiveSeed`, Migrations 019/021/022, `ProvablyFairModal`) | 🟢 committed | C23 (`5442c54`)             | L       |
| R3-2 | **Stats 1.7** — `/stats`-Page, `perGame`, `stats-derivation`, Migration 018/020, `MainLayout`-Nav                                         | 🟢 committed | C24 (`28b2923`)             | M       |
| R3-3 | **Security 06** — P0-Audit + Promo Ledger + Mutation Origin (`06_0`-Batch, `verify-security`, Migration 023, Tests)                       | 🟢 committed | C22 (`2ed7c42`)             | L       |
| R3-4 | **Chatbot 2.4 & Guide 2.7** — `CasinoGuidePanel`, `/api/chat/bot-response`, `chat-guide.ts`, `guide-telemetry.ts`, Migration 024          | 🟢 committed | C25 (`fad10ef`)             | M       |
| R3-5 | **Admin-BI 2.5** — `/admin/analytics`, `/api/admin/analytics`, `src/lib/admin/`                                                           | 🟢 committed | C26 (`82860d0`)             | M       |
| R3-6 | **Brand 07** — Control-Harmonisierung (`BetModeTabs`/`BetInputGroup`/`GameActionButton`/`VibeSlider` + Showcase)                          | 🟢 committed | C27 (`b1a5584`)             | L       |
| R3-7 | **Telegram & Core Wiring** — Big-Win Telemetry, Bot-Integration, Proxy & Store Idempotency                                                | 🟢 committed | C28 (`6ab9207` + `686ed4b`) | M       |

**Zusammenfassung:** R1 (C1–C12) ✅ + R2 (C13–C21) ✅ + Post-R2 C1 ✅ + R3 (C22–C28) ✅ **alle committed**. Alle 46 Testdateien / 391 Tests grün. `npx tsc --noEmit` fehlerfrei.

---

## 2 — Execution-Reihenfolge (Dependency-Graph)

```
C1 (Docs)  ──────────────────────────────────────────────►  [unabhängig, zuerst]
C2 (Migrations) ─► C3 (API/Service) ─► C4 (Store/Gamification)
C5 (v2 Sandbox) ─► C6 (History/Leaderboard Modular.)
               └► C7 (Slots v2 Assets)
C8 (Admin)         [unabhängig]
C9 (Core/Security) [unabhängig, security-reviewer zwingend]
C10 (Game/UI Polish) [nach C5, da Design-Tokens]
C11 (Tests/Scripts) [begleitet jew. Block — idealerweise interleaved, nicht am Ende gebündelt]
C12 (Meta-Docs)     [zuletzt, reflektiert Endzustand]
```

**Empfohlene Reihenfolge:** C1 → C5 → C7 → C6 → C10 → C2 → C3 → C4 → C8 → C9 → C11 (interleaved) → C12.

### Kohorten-Gruppierung (Effizienz — nur wenn risikofrei)

12 Blöcke → ~6 Commits + C10-Sub-Commits. Bündeln nur bei 0 Datei-Overlap, keiner Abhängigkeitsverletzung, keinem Security-Risiko.

| Kohorte                     | Blöcke       | Commits                   | Risiko-Bedingung                                                                                        |
| --------------------------- | ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **K1 — Doku & Schema**      | C1 + C2      | 2 (`docs:` + `feat(db):`) | keiner — non-Code, 0 Overlap                                                                            |
| **K2 — Frontend Redesign**  | C5 + C6 + C7 | 1                         | `globals.css`-Hunk per `git add -p` von C10 trennen                                                     |
| **K3 — Supabase Hydration** | C3 + C4      | 1 (atomar)                | `useCasinoStore`-Hunk per `git add -p` von C10 trennen                                                  |
| **C8 — Admin**              | C8           | 1                         | separat (kein sicherer Bündel-Partner)                                                                  |
| **C9 — Core/Security**      | C9           | 1                         | ❌ **nie bündeln** — Security-Reviewer-Gate                                                             |
| **C10 — Game/UI Polish**    | C10 → C10a–d | 4                         | ❌ Hunk-Split-Dateien (`globals.css`, `useCasinoStore`, `layout.tsx`, `HomeClientV2`) → intern splitten |
| **C11 — Tests**             | —            | interleaved               | in jew. Block-Commit integriert                                                                         |
| **C12 — Meta-Docs**         | C12          | 1                         | zuletzt (Endzustand)                                                                                    |

**Kohorten-Reihenfolge:** K1 → K2 → K3 → C8 → C9 → C10(a–d) → C12.

> **Kritischer Hinweis — Hunk-Konflikte:** Mehrere Dateien tragen Änderungen aus mehreren Workstreams in ihrem Working-Tree-Diff (insbes. `src/app/globals.css`, `src/store/useCasinoStore.ts`, `src/app/layout.tsx`, `src/components/home/HomeClientV2.tsx`). Für jede solche Datei zwingend `git add -p` verwenden, um Hunke pro Commit-Block zuzuordnen. In Abschnitt 4 pro Block als `⚠ Hunk-Split nötig` markiert.

---

## 3 — Blocker & offene Punkte (vor C2 zu klären)

| #   | Blocker                                                                                                 | Warum                            | Aktion                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | ~~Migration 007 remote nicht als live bestätigt~~                                                       | Schema-Abhängigkeit              | ✅ **GELÖST 2026-08-09** — Live-Verifikation via SQL Editor: 003/007/013/014/015 live, 011 angewandt, RLS aktiv. Siehe Verifikation unten.                                                                                                                                                                                                                                                   |
| B2  | ~~DDL-fähiger Service-Role-Zugang~~                                                                     | `supabase db push` braucht Admin | ✅ **GELÖST** — Jan hat DDL-Zugang via Supabase SQL Editor; Rollout erfolgt direkt im Editor (kein CLI nötig).                                                                                                                                                                                                                                                                               |
| B3  | ~~`ALLOW_DEV_FALLBACK` in `.env.local` — Dev-Auth-Bypass darf nicht in Produktion landen.~~             | Security                         | ✅ **GELÖST/VERIFIZIERT 2026-08-10** — Triple-Gate auf allen 10 Dev-Fallback-Routen vorhanden: `NODE_ENV === 'development'` + `ALLOW_DEV_FALLBACK === 'true'` + `!isExplicitSignedOut` (`casino_signed_out=1`-Cookie). Routen: bet, blackjack, balance, history, stats (GET+POST), chat, seeds (2x), active-round, seeds/history, redeem-code. Kein Hardcode-Fallback in produktiven Pfaden. |
| B4  | ~~`communityWagered: 8420.5` Hardcode im Store~~ (laut `03_CASINO_SUPABASE_CONNECTION.md` Abschnitt 2). | Server-Autorität                 | ✅ **GELÖST 2026-08-10** — Hardcode aus Initial-State entfernt (`0`); `get_community_stats()`-RPC bleibt angebunden (`wallet.ts` + Store-Hydration). Test `useCasinoStore.test.ts:289` an `0`+10=`10` angepasst.                                                                                                                                                                             |
| B5  | ~~`syncToFile()` Dev-Methode im Store noch vorhanden.~~                                                 | Dead-Code / Local-Speicher       | ✅ **GELÖST 2026-08-10** — Vollständig entfernt (Type-Dekl, No-Op-Impl, Call-Site in `processGameResult`, Test-Block). Keine verbleibenden Code-Referenzen (nur noch Doku/Historie).                                                                                                                                                                                                         |
| B6  | Neue v2-Routes (`/v2`) sind WIP/Sandbox — `ClientShell` rendert `/v2` bewusst ohne Shell.               | Prod-Exposition                  | ⏳ **OFFEN** — C5: sicherstellen, dass `/v2` nicht in Sitemap/Metadata als Produktivroute deklariert. (Bisher nicht verifiziert — kein Teil von R1/R2-Commits.)                                                                                                                                                                                                                              |
| B7  | ~~Migration 009 nicht remote angewandt~~ (user_identities/admin_roles/Trigger fehlen).                  | Identitäts-Layer                 | ✅ **GELÖST 2026-08-09** — 009 LIVE ausgerollt (Post-Check 14/14: 3 Tabellen + 3 Funktionen + Guard-Trigger + RLS, identity_rows=16 Backfill, quarantine=0, Legacy-RPCs gesperrt). Rollout-Log: `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`.                                                                                                                                                |

### Verifikation 2026-08-09 (Supabase SQL Editor, Projekt `hmqwozhdckbwjqzcmire`)

| Prüfung                                                                                         | Ergebnis                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 003 `seeds` + 007 `game_rounds` + 5 RPCs                                                        | ✅ live                                                                                                                                                   |
| 013/014/015 (`get_user_stats`, `sync_user_achievement`, `get_leaderboard`, `user_achievements`) | ✅ live — **014/015 bereits remote angewandt**                                                                                                            |
| 011 Legacy-REVOKE (`place_bet`/`settle_bet`)                                                    | ✅ angewandt (ACL nur `postgres`+`service_role`)                                                                                                          |
| RLS (`game_rounds`, `seeds`, `users`, `wallet_transactions`, `game_sessions`)                   | ✅ aktiv                                                                                                                                                  |
| 016-Dep A `chat_messages`-Schema                                                                | ✅ kompatibel (Tabelle existiert bereits, 016 überspringt CREATE)                                                                                         |
| 016-Dep B `seeds`-Schema + Unique(`user_id`)                                                    | ✅ kompatibel, `ON CONFLICT (user_id)` sicher                                                                                                             |
| 016-Dep C `game_rounds`-Schema                                                                  | ✅ kompatibel (alle Spalten vorhanden)                                                                                                                    |
| 016-Dep D `wallet_transactions.type`                                                            | ⚠ nur `bet_settled`/`round_settled`/`round_started` (kein `bet`) — `get_community_stats` zählt `bet_settled`=306, funktional ok                           |
| 009 (`user_identities`/`admin_roles`)                                                           | ✅ **live** (ausgerollt 2026-08-09, Post-Check 14/14) → B7 gelöst                                                                                         |
| 012 (`promo_codes`)                                                                             | ✅ **live** (ausgerollt 2026-08-09, zero_balance_post=0) — 012 ist `balance DEFAULT 10000` (Doku in `03` korrigiert)                                      |
| 021 (`promo_codes`-Tabelle + `redeem_promo_code`-RPC)                                           | ⏳ **committed** `ca2a389` (2026-08-10, post-R2) — **noch nicht remote ausgerollt**. Löst R2-Deferral C1 (redeem-code self-credit ATM). Siehe §8.7 unten. |

**C2-Rollout-Scope final:** **016** ✅ + **009** ✅ + **012** ✅ alle LIVE (2026-08-09). Details: `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`.

---

## 4 — Commit-Block-Detail (95 % Scope für LLM)

Jeder Block: Scope · Dateien (➕ neu / ✎ modifiziert / ➖ gelöscht) · Commit-Message · Abhängigkeiten · Verifizierung · Risiken · Rollback.

### C1 — Docs-Reorganisation ✅

- **Status:** ✅ **Committed `5860f83` (2026-08-09)** — 62 Dateien, +7179/−1429. Vollständiger Plan + Self-Audit: `docs/archive/01b-c1-docs-commit-plan.md` (aus worldmap/ archiviert, C1 abgeschlossen).
- **Scope:** Reine Doku-Verschiebung/-Anlage. 0 Code-Risiko. Als Erstes committen, um Working-Tree zu entzerren.
- **Tatsächlich committed (62 Dateien, verifiziert):**
  - Renames: `worldmap/{01–05,08,11,12}` → `docs/status-reports/`, `DESIGN_SYSTEM_AND_VIBE.md`/`02_CLERK_SUPABASE.md` → `docs/`, `docs/architecture/01_AUTH_MIGRATION_…` + `docs/{superpowers,routes}/*` → `docs/archive/` (History via Rename erhalten).
  - Deletes: `CASINO_STABILITY_WORKFLOW.md`, `OPEN_TASKS.md`, `docs/EVALUATION.md`, `docs/architecture/{CLERK_INTEGRATION_PLAN,MIGRATION_PLAN,SUPABASE_MIGRATION}.md`, `docs/superpowers/{plans,specs}/2026-07-28-backend-private-access*`, unicode `docs/routes/0.2.1…md`.
  - Neu: `docs/README.md`, `docs/architecture/{05_1.4_login,05_MOBILE_PERFORMANCE,LEADERBOARD_RPC}.md`, `docs/archive/` (17), `docs/prototypes/` (9), `worldmap/{01-offene-commits,01a-db-rollout-plan,01b-c1-docs-commit-plan,02_FRONTEND_REDESIGN,05_1.1_MOBILE_PERFORMANCE,05_ZUKUNFTSPLANUNG,06_ACHIEVEMENTS_CONDITION_ENGINE}.md`.
  - Mod: `docs/SPIELMECHANIK.md` (Clerk→Supabase-Terminologie).
- **Commit-Message:** `docs: reorganize docs tree (worldmap->docs/status-reports, archive legacy plans, prototypes & planning docs)`
- **Abhängigkeiten:** keine.
- **Verifizierung:** ✅ Post-Commit-Asserts bestanden — 0 Code-Pfade, 0 C12-Files im Commit; C12 (`01_WORLDMAP_STATUS/CLAUDE/AGENTS/GEMINI`) unberührt unstaged; `docs/`+`worldmap/` Working-Tree sauber. Link-Rotation: 2 stale Meta-Text-Refs in aktiven Docs (`LEADERBOARD_RPC.md:44`, `05_1.4_login.md:237`) + Archive-Tote-Links (F6, akzeptiert) → Folge-Pass.
- **Risiken realisiert:** R1 (lint-staged-Stash-Restore löschte 3 Prototyp-HTMLs aus Working-Tree) → behoben via `git checkout HEAD -- docs/prototypes/bg_option*.html`.
- **Rollback:** `git revert 5860f83` — kein Side-Effect.

### C2 — Migrationen 014 / 015 / 016 (Supabase Schema) ✅

- **Status:** ✅ **Committed `92cb929` (2026-08-09)** — 4 Dateien, +665 (3 SQL-Dateien Repo-Integrität + `.gitignore`-Eintrag `/supabase/.temp/`). Vollständiger Plan + Self-Audit: `docs/archive/02a-c2-schema-commit-plan.md`.
- **Scope:** Reines SQL. 016 definiert `chat_messages`, `post_chat_message`, `get_recent_chat_messages`, `get_or_create_user_seed`, `rotate_user_seed`, `get_community_stats`, `get_active_game_round`. 014 = `get_user_stats`/`sync_user_achievement`, 015 = `get_leaderboard`.
- **Verifizierter Remote-Status (2026-08-09):** 014 + 015 **bereits live**. 016 **LIVE (Post-Check 7/7 bestanden)** — ausgerollt via SQL Editor. 009 **LIVE (Post-Check 14/14)** — B7 gelöst. 012 **LIVE (zero_balance_post=0)**. Siehe `docs/archive/DB_ROLLOUT_PLAN_2026-08-09.md`.
- **Dateien (committed `92cb929`):**
  - ➕ `supabase/migrations/014_fix_user_stats.sql` (Repo-Integrität; remote bereits live) ✅
  - ➕ `supabase/migrations/015_get_leaderboard.sql` (Repo-Integrität; remote bereits live) ✅
  - ➕ `supabase/migrations/016_full_server_authority_expansion.sql` (remote LIVE — Post-Check 7/7; idempotent, alle Deps verifiziert) ✅
  - ✎ `.gitignore` — neuer Eintrag `/supabase/.temp/` (R10: CLI-Artefakt `project-ref` etc. dauerhaft ignoriert) ✅
- **EXKLUDIERT (nicht in C2):** `supabase/migrations/017_achievement_condition_engine.sql` (neue Feature-Migration, eigene Planning-Doc `06_ACHIEVEMENTS_CONDITION_ENGINE.md`, remote-Status ungeprüft → eigener Block/Rollout).
- **Commit-Message:** `feat(db): migrations 014-016 (user_stats fix, get_leaderboard, full server-authority RPCs)`
- **Abhängigkeiten:** ~~B1/B2~~ ✅ gelöst. C2 mutiert Remote nicht (Repo-Sync nur).
- **Rollout (Jan, via SQL Editor) — erledigt vor C2:** 016 ausgerollt + Post-Check 7/7; 014/015 bereits live. C2 = nur Repo-Integrität.
- **Verifizierung (post-Commit `92cb929`):** ✅ 4 Dateien in HEAD, 0 × `017`/`.temp/`, `.temp`-History-Leak leer, `git check-ignore supabase/.temp/project-ref` = ignored, 017 noch untracked.
- **Risiken:** R1 — `get_community_stats` filtert `type IN ('bet','bet_settled')`, `bet` existiert remote nicht → zählt nur `bet_settled`=306 (funktional ok). R2 — `chat_messages`-RLS ohne Policy → Client-Zugriff nur via `service_role` in API-Route (gewollt).
- **Rollback:** `git revert 92cb929` (Repo-only — Remote bleibt live). DB-Rollback der 6 RPCs siehe `01a` §2.6 (nicht C2-Teil).

### C3 — Supabase Server-Autorität (API + Service) ✅

- **Status:** ✅ **Committed `5d3fc7f` (2026-08-09)** — 6 Dateien, +562/−27. Vollständiger Plan + Self-Audit: `docs/archive/03_c3-c6-execution-plan.md` §C3.
- **Scope:** Neue API-Routes + `WalletService`-Methoden, die die RPCs aus C2 anbinden.
- **Tatsächlich committed (6 Dateien, verifiziert):**
  - ➕ `src/app/api/{chat/route,casino/seeds/route,community/route,casino/active-round/route}.ts` (4 Routes, untracked→committed)
  - ✎ `src/lib/casino/wallet.ts` (+136/−27: 6 neue statische Server-Autoritäts-Methoden `getUserSeeds`/`rotateUserSeed`/`getChatMessages`/`postChatMessage`/`getCommunityStats`/`getGameActiveRound` + prettier-Reformat bestehender Methoden)
  - ➕ `src/lib/casino/__tests__/leaderboard.test.ts` (Begleit-Test, 4/4 grün)
- **EXKLUDIERT:** `src/utils/supabase/admin.ts` (` M` = reines EOL-Artefakt, alle diff-Varianten leer → Plan-Bedingung "falls Helper ergänzt" nicht erfüllt; bleibt unstaged).
- **Security-Gate (inline):** Auth-Enforcement auf chat-POST/seeds-GET+POST/active-round-GET + dev-fallback korrekt gegated (`NODE_ENV==='development' && ALLOW_DEV_FALLBACK && !isExplicitSignedOut` → nicht in Prod-Pfad, B3 erfüllt); Service-Role nur server-side in `WalletService`; Rate-Limit auf Spam-Vektoren (chat+seeds POST 10/60s); Zod auf allen Bodies; keine Secrets/console.logs. Community-GET bewusst public (Aggregat). Kein CRITICAL/HIGH.
- **Verify-Gates:** `tsc --noEmit` = 0 Fehler; `vitest leaderboard.test.ts` = 4/4; lint-staged (eslint+typecheck+prettier) grün.
- **Dateien:**
  - ➕ `src/app/api/chat/route.ts` (GET/POST via `post_chat_message`/`get_recent_chat_messages`)
  - ➕ `src/app/api/casino/seeds/route.ts` (GET/POST; Seed-Rotation)
  - ➕ `src/app/api/community/route.ts` (GET `get_community_stats`)
  - ➕ `src/app/api/casino/active-round/route.ts` (GET `get_active_game_round`)
  - ✎ `src/lib/casino/wallet.ts` — statische Methoden `getChatMessages`, `postChatMessage`, `getUserSeeds`, `rotateUserSeed`, `getCommunityStats`, `getActiveRound`.
  - ✎ `src/utils/supabase/admin.ts` (Service-Role-Client, falls Helper ergänzt).
- **Commit-Message:** `feat(api): server-authority routes for chat, seeds, community, active-round`
- **Abhängigkeiten:** C2 live.
- **Verifizierung:** `npx tsc --noEmit`; `npm run test` (neuer `leaderboard.test.ts` + `proxy-routing.test.ts` ggf. hier zugeordnet); Rate-Limiter (`enforceRateLimit`) auf allen 4 Routes; Auth-Enforcement (Service-Role nur server-side); `npm run vibe-check`.
- **Risiken:** R1 — Upstash Rate-Limit in Production erforderlich (Dev = In-Memory). R2 — Service-Role-Key darf nie Client-reachbar sein. R3 — Replay-Schutz: `request_id`-Idempotenz wo anwendbar.
- **Security-Reviewer:** zwingend (API-Boundary, Auth, Rate-Limit).
- **Rollback:** Routes sind additive; Route-Datei löschen.

### C4 — Store & Gamification Hydration ✅

- **Status:** ✅ **Committed `d825c4b` (2026-08-09)** — 9 Dateien, +1045/−438. Vollständiger Plan + Self-Audit: `docs/archive/03_c3-c6-execution-plan.md` §C4.
- **Scope:** `useCasinoStore.initialize()` zieht Wallet, Stats, Achievements, Seeds, Community-Ziel, Chat aus Supabase. `syncToFile()`-Entfernung. LocalStorage-Partialize auf UI-Prefs beschränkt.
- **Tatsächlich committed (9 Dateien, verifiziert):**
  - ✎ `src/store/useCasinoStore.ts` (+703/−… ) — **ganze Datei C4** (Hunk-Split-Annahme C4.3 widerlegt: kein C10-Redesign-Content im Store; Diff = Hydration + Achievements-Refactor + prettier). `initialize()` parallel-fetch Seeds/Community/Chat (C3-Routes) + HTML-Guards; `syncToFile: () => {}` No-Op (B5 ✓); `partialize` exkludiert `achievementConfigs` (C4 ✓).
  - ➕ `src/lib/casino/achievements-config.ts` (+244) — **Discovery**: untracked, useCasinoStore-Dependency (Hunk 1-2 importiert `mergeAchievementsWithConfig`/`DEFAULT_ACHIEVEMENT_CONFIGS`/`applyAchievementProgress`/Typen) → MUSS in C4 (sonst C4-in-isolation tsc-Bruch). Gamification-Config = aktuelle Implementierung (017 SQL = zukünftige DB-driven-Variante).
  - ✎ `src/providers/GamificationProvider.tsx`, `src/lib/casino/{vip-config,vip-config-server,game-config,game-config-server}.ts`, `src/lib/casino/chat-bot.ts`
  - ✎ `src/store/__tests__/useCasinoStore.test.ts` (Begleit-Test, 68/68 grün)
- **EXKLUDIERT:** `src/lib/casino/session.ts` (` M` = EOL/stat-only-Artefakt wie `admin.ts`, alle diff-Varianten leer → `git add` no-op, nicht committet); `src/utils/supabase/admin.ts` (C3-Entscheidung fortgeführt); `worldmap/{05_1.1,05_ZUKUNFTSPLANUNG,06_ACHIEVEMENTS_CONDITION_ENGINE}.md` (pre-stagte Docs, via `git reset` unstaged — gehören zu Docs-Block).
- **B4 `communityWagered`:** Initial-Default `8420.5` bleibt als Pre-Hydration-Platzhalter; `initialize()` überschreibt autoritativ mit `getCommunityStats`-RPC-Wert → funktional erfüllt (Default-Cleanup = Folge-Pass).
- **Verify-Gates:** `tsc --noEmit` = 0 Fehler (baseline); `vitest useCasinoStore.test` = 68/68; `vibe-check` = ✅; lint-staged eslint+typecheck+prettier grün.
- **Security-Gate (inline):** `addBalance`/`removeBalance` fail-closed (toast/return-false, keine direkten Wallet-Writes); `initialize()` nur GET-Reads; Wallet-Mutation ausschließlich via `processGameResult`/RPC. Kein CRITICAL/HIGH.
- **Dateien:**
  - ✎ `src/providers/GamificationProvider.tsx`
  - ✎ `src/lib/casino/{vip-config,vip-config-server,game-config,game-config-server,session}.ts`
  - ✎ `src/lib/casino/chat-bot.ts`
  - ✎ `src/store/__tests__/useCasinoStore.test.ts` → C11, oder hier als Begleit-Test.
- **Commit-Message:** `feat(store): supabase hydration for seeds, community, chat; remove syncToFile`
- **Abhängigkeiten:** C3.
- **Verifizierung:** `npm run test` (store-Tests); `npm run vibe-check` (Balance-Integrität); manuell: Login → Wette → Tab/Reload → Balance/Level stimmen mit DB überein; `communityWagered` ≠ 8420.5.
- **Risiken:** R1 — Hydration-Mismatch bei Zeitstempeln (`mounted`-Guard). R2 — `applyServerWalletSnapshot` bleibt einzige Client-Grenze. R3 — XP/Balance nicht in LocalStorage persistieren (CLAUDE.md-Regel).
- **Security-Reviewer:** zwingend (Wallet-Mutationen, aber nur via `processGameResult`/RPC — keine direkten Balance-Writes).
- **Rollback:** `git revert` — Store fällt auf lokalen Zustand zurück (fail-closed).

### C5 — Frontend v2 Sandbox (Cyber-Stealth)

- **Scope:** Isoliertes `/v2`-Design-Sandbox. Entspricht `02_FRONTEND_REDESIGN.md` Option 1. Keine Berührung produktiver Routen.
- **Dateien:**
  - ➕ `src/app/v2/{layout,page}.tsx`
  - ➕ `src/components/v2/*` (V2Header, V2Hero, V2Home, V2Sidebar, V2GameTabs, V2PromoBento, V2PromoCard, V2RebateWidget, V2WheelArt, V2Chip, v2-data, index)
  - ➕ `src/styles/v2.css`
  - ➕ `docs/prototypes/{option1..4}.html` (→ alternativ C1; hier nur wenn C1 ohne Prototypen)
  - ➕ `src/components/home/{HeroCinematicShowcase,InteractiveArcadeGrid,ProgressiveJackpotSection,VipProgressTeaser,LobbyAmbientBackground,DailyTournamentTeaser,WebGlWaterRefractionCanvas}.tsx`
  - ➕ `public/images/hero_vip_artwork.jpg`, `public/images/vault-playnow-bg.webp`
  - ✎ `src/app/globals.css` — ⚠ **Hunk-Split nötig** (v2-Tokens hier? Redesign-Tokens → C6/C10; nur v2-spezifische Hunke in C5).
- **Commit-Message:** `feat(v2): cyber-stealth design sandbox (app/v2, components/v2, hero showcase, WebGL)`
- **Abhängigkeiten:** keine (isoliert).
- **Verifizierung:** `npm run build` (kein Build-Bruch durch `/v2`); `/v2` im Browser visuell prüfen; `metadata`-Export in `v2/layout.tsx` (DevOps-Slayer-Regel); WebGL-Canvas graceful Fallback; `whileHover`/`whileTap` auf allen interaktiven Elementen (Design-Guardian).
- **Risiken:** R1 — `/v2` darf nicht als Produktivroute in Sitemap landen (B6). R2 — WebGL auf Low-End-Mobile → Feature-Detect + Fallback. R3 — Bundle-Größe: WebGL-Canvas dynamisch importieren (Performance-Regel).
- **Design-Guardian + DevOps-Slayer:** zwingend.
- ✅ **Committed `06f364d`** — 24 NEW-Files, +3830, 0 Modifications. Verify-Gates: `npm run build` exit 0 (background task b70jcyyis); tsc-Baseline grün; `/v2/layout.tsx` metadata `robots:{index:false,follow:false}` (B6 ✓). Scope-Realität vs Plan: `globals.css`-Hunk-Split **entfiel** — v2-Tokens bestätigt in `src/styles/v2.css` self-scoped (`.v2-root`-Namespace, `--v2-*`-Tokens, Header "Do not reference --primary/--bg-color, nothing leaks"), NICHT in `globals.css`; `globals.css`-58-Hunks = C6/C10-Redesign (bleiben uncommitted). 7 Showcase-Komponenten = additive NEW-Files (Imports: Magnetic, soundManager, framer-motion, lucide, next/image, einander — keine /v2/v2.css/modified-home-Imports); Wiring in `HomeClientV2` = C10. `docs/prototypes/*.html` nicht vorhanden/entfallen. Post-Commit: `git show --name-status` 0 modified, 0 excluded-leak, 0 C3/C4 cross-block. Plan: `docs/archive/03_c3-c6-execution-plan.md` §C5.

### C6 — History & Leaderboard Modularisierung

- **Scope:** Kohorten 2–3 aus `02_FRONTEND_REDESIGN.md`. Zerlegung der 685-Zeilen `/history` und 1.060-Zeilen `/leaderboard`.
- **Dateien:**
  - ➕ `src/components/history/{HistoryStatsCard,HistoryTableStream,HistoryFilterBar}.tsx`
  - ➕ `src/components/leaderboard/{LeaderboardHeroStats,LeaderboardStreamTable,PersonalRankBar}.tsx`
  - ✎ `src/app/history/{page,layout}.tsx`
  - ✎ `src/app/leaderboard/{page,layout}.tsx`
- **Commit-Message:** `refactor(history,leaderboard): modularize pages into stealth-terminal components`
- **Abhängigkeiten:** C5 (Design-Tokens).
- **Verifizierung:** `npx tsc --noEmit` (Props-Interfaces); Dateien < 300 Zeilen; 0 Verhaltensänderung an APIs/Store; `whileHover/whileTap` via `VibeMotion`/`Magnetic`; Hydration-Guard für Zeitstempel; `npm run test`.
- **Risiken:** R1 — Props-Mismatch beim Extrahieren (tsc fängt). R2 — Hydration-Warning `toLocaleString`. R3 — Z-Index-Dropdown-Überlappung.
- **Design-Guardian + Logic-Architect:** zwingend.
- ✅ **Committed `ca156f3`** — 10 Dateien (6 NEW `create mode` + 4 modified), +940/−668. Verify-Gates: `npm run build` exit 0 (task b70jcyyis kompilierte C6-Baum); tsc-Baseline grün; lint-staged typecheck-staged + prettier grün. Scope-Realität vs Plan: Hunk-Split **entfiel** — alle 4 modified Files reines C6 (Page: Inline → Komponenten-Imports, −668/+175 Extraktion; layout.tsx: reine Prettier-Formatierung, description-wrap + function-collapse, 0 Semantik-Änderung). `grep` nach Design-Tokens (`--primary|--bg-color|backdrop-filter|globals.css`) in Diffs: Treffer **nur in gelöschten** Inline-Zeilen (Code-Verschiebung in Komponenten), 0 neue Tokens, 0 globals.css-Bezug. Container/Presentational-Split verifiziert: 6 Komponenten importieren ausschließlich `react`/`lucide-react`/`framer-motion` (kein `@/store`/`@/lib`/`@/components/auth`); `HistoryRow`/`LeaderRow`-Interfaces aus Komponenten exportiert. `globals.css` bleibt uncommitted (C10, erwartet). Post-Commit: `git show --name-status` 4M+6A, 0 cross-block in HEAD. Plan: `docs/archive/03_c3-c6-execution-plan.md` §C6.

- **Scope:** Slots v2-Code + v2-Symbol-Assets + modifizierte Basis-Symbole.
- **Dateien:**
  - ➕ `src/app/games/slots/v2/`, `src/components/casino/games/slots/v2/`
  - ➕ `public/images/slots/v2/sym-*.png` (8 Dateien)
  - ✎ `public/images/slots/sym-{ace,chalice,crown,jack,king,queen,ten,zeus}.png` (8 modifiziert)
  - ✎ `src/app/games/slots/symbols.ts`, `src/components/casino/{SlotSymbol.tsx}`, `src/components/casino/games/slots/{SlotReel,WinLine}.tsx`
- **Commit-Message:** `feat(slots): v2 symbol assets and reel components`
- **Abhängigkeiten:** C5 (Design-Tokens).
- **Verifizierung:** `next/image` mit expliziten `width`/`height`; `unoptimized`-Prop für SVG (laut letztem Commit b442ae3); `npm run build`; visuelle Slot-Symbol-Prüfung.
- **Risiken:** R1 — Bildgröße vs. gerenderte Größe (Performance). R2 — `next/image`-Konfiguration für `v2/`-Pfad.
- **Design-Guardian:** zwingend.
- ✅ **Committed `9e97d53`** — 28 Dateien (14 NEW `create mode` + 14 modified), +1613/−157. Verify-Gates: `npm run build` exit 0 (task b26r9azip); tsc via lint-staged typecheck-staged grün; prettier --write 28 Dateien grün. Scope-Realität vs Plan: Hunk-Split **entfiel** — Diff-Analyse der 6 modified Source-Files: `page.tsx`/`layout.tsx`/`symbols.ts`/`WinLine.tsx` prettier-only (C6-A-Plan2-Präzedenz: in C7 committet, loose-end-Vermeidung); `SlotSymbol.tsx` realer v2-Content (rendert 8 Basis-Symbol-PNGs via `src="/images/slots/sym-*.png"` + `width/height/objectFit`); `SlotReel.tsx` realer Fix (`getComputedStyle(--slot-cell-size)`→`getBoundingClientRect().height/VISIBLE_ROWS`, da clamp() unaufgelöst) + prettier. Keine C10-Redesign-Token-Modifikation (`--slot-cell-size` nur gelesen). Runtime-Deps auf C9 (`bet-validator`/`provably-fair`) + C10 (`GameErrorBoundary`) — alle tracked in HEAD, v2 kompiliert gegen committed base, kein C9/C10-vor-C7-Zwang. 16 PNGs (8 base + 8 v2) binär committed. Post-Commit: `git show --name-status` 14A+14M, 0 cross-block in HEAD, `globals.css` bleibt uncommitted (C10, erwartet). Plan: `docs/archive/04_c7-c9-execution-plan.md` §C7.

### C8 — Admin Pages Refactor

- **Scope:** 14 Admin-Komponenten + 3 Admin-API-Routes.
- **Dateien:**
  - ✎ `src/app/admin/{AdminOverviewClient,AdminOverviewLoader,forbidden,layout,page}.tsx`
  - ✎ `src/app/admin/games/{GamesPageClient,GamesPageLoader,page}.tsx`
  - ✎ `src/app/admin/simulation/{SimulationPageClient,SimulationPageLoader,page}.tsx`
  - ✎ `src/app/admin/users/{UsersPageClient,UsersPageLoader,page}.tsx`
  - ✎ `src/app/api/admin/{games,overview,users}/route.ts`
- **Commit-Message:** `refactor(admin): page/loader/client split and route sync`
- **Abhängigkeiten:** keine.
- **Verifizierung:** `npx tsc --noEmit`; `npm run build`; Admin-Auth-Flow (anonym → sign-in, User → 403, Admin → Zugang via `isAdminEmail`); `metadata`-Export je Page.
- **Risiken:** R1 — React-Hook-Warning (laut Commit 1cefbf3 bereits gefixt — Regression prüfen). R2 — Admin-API Auth-Enforcement.
- **Security-Reviewer:** zwingend (Admin-Auth-Boundary).
- ✅ **Committed `5c87a7a`** — 8 Real-Content-Files (8 modified, 0 NEW), +1482/−250. Verify-Gates: `npm run build` exit 0 (task b26r9azip); lint-staged eslint + typecheck-staged + prettier (8 Dateien) grün. Scope-Realität vs Plan: Plan sagte 14+3=17 Files; Realität = 8 Real-Content + **9 EOL-only-Artefakte** (AdminOverviewLoader, forbidden, GamesPageLoader, games/page, admin/page, SimulationPageLoader, simulation/page, UsersPageLoader, users/page) — `git diff --ignore-cr-at-eol` leer, C3/C4-Präzedenz (admin.ts/session.ts) → ausgeschlossen. Hunk-Split entfiel: 4 Clients = Admin-Funktions-Refactor (Simulation-Engine-UI/recharts, Overview/Games/Users-Enhancement), `grep` nach C10-Redesign-Token-Additions leer; `admin/layout.tsx` prettier-only (C6-A-Plan2-Präzedenz → in C8). **Security-Gate (Admin-Auth-Boundary)** verifiziert: alle 3 API-Routes diff-geprüft + post-commit `git show HEAD:...route.ts | grep` — `getUser→401`, `isAdminEmail→403`, `enforceRateLimit` erhalten (games 3 / overview 3 / users 5 auth-Marker in committed HEAD); users-Route POST ergänzt `user_id: targetUserId` Audit-Logging (security-positiv). Math.random in SimulationPageClient = Admin-Simulations-Kontext (kein Provably-Fair-Verstoß). Runtime-Deps auf C9 (`@/lib/security/admin`, `@/utils/supabase/server`) — tracked in HEAD, kompiliert gegen base. 9 EOL-only Files bleiben uncommitted (CRLF-Artefakt, erwartet). Plan: `docs/archive/04_c7-c9-execution-plan.md` §C8.

### C9 — Core-Libs & Security Hardening

- **Scope:** Spiel-Engine, Provably-Fair, Wallet-Contract, Security-Layer, Middleware. Höchste Security-Sensitivität.
- **Dateien:**
  - ✎ `src/lib/casino/{provably-fair,casino-core,bet-validator,wallet-contract,logger,perf-monitor,sound-manager}.ts`
  - ✎ `src/lib/security/{admin,request-security}.ts`
  - ✎ `src/proxy.ts`
  - ✎ `src/utils/supabase/{admin,client,server}.ts`, `src/utils/time-patch.ts`
  - ✎ `src/lib/games/blackjack.ts`
  - ✎ `src/lib/casino/__tests__/{blackjack-authority,dice-payout,provably-fair-verification,roulette,security-surface,wallet-authority,wallet-service-authority,wallet}.test.ts` (→ oder C11)
  - ✎ `src/lib/security/__tests__/{admin-email-boundary,admin-meta-features,admin-user-mutations,meta-security,proxy-security-headers,proxy-routing,request-security}.test.ts` (→ oder C11)
- **Commit-Message:** `refactor(core): harden provably-fair, wallet contract, security layer and proxy`
- **Abhängigkeiten:** keine (aber vor C4-Store-Integration finalisieren).
- **Verifizierung:** `npx tsc --noEmit`; `npm run test` (Security-Suite); `npm run vibe-check` (RNG-Verteilung, Payout-Math); `Math.random`-Frei-Check (grep); `processGameResult` als einzige Balance-Mutation; `search_path` in RPC-Aufrufen; `withRefreshedCookies()` an terminalen Antworten im Proxy.
- **Risiken:** R1 — Client-seitiges `ProvablyFairEngine.generateServerSeed()` ist Pre-Production-Blocker (AGENTS.md Security-Auditor). R2 — Integer-Overflow-Vektoren. R3 — Mutation außerhalb `processGameResult`.
- **Security-Reviewer + Logic-Architect:** zwingend (BLOCK, bis 0 CRITICAL/HIGH).
- **Rollback:** `git revert` — kritisch, da Core.
- ✅ **Committed `d85a2ce`** — 26 Dateien (25 modified + 1 NEW `proxy-routing.test.ts`), +552/−376. Verify-Gates: `npm run test` **26 Dateien / 265 Tests grün** (pre-Commit + post-Commit HEAD-Konsistenz-Re-run); `npm run vibe-check` ✅ Complete (RNG/Payout); `npm run build` exit 0 (task b26r9azip); lint-staged typecheck-staged + prettier grün. Scope-Realität vs Plan: Plan sagte ~30+ Files; Realität = 26 Real-Content + **10 EOL-only-Artefakte** ausgeschlossen (`perf-monitor`, `wallet-contract`, `casino-core.xp.test`, `helpers/supabase-mock`, `security-surface.test`, `wallet-service-authority.test`, `admin-meta-features.test`, `admin-user-mutations.test`, `utils/supabase/admin`, `time-patch` — `git diff --numstat` leer, C3/C4/C8-Präzedenz) + **2 Gamification-NEW** ausgeschlossen (`achievements-config-server.ts`, `achievements-config.test.ts` — Gamification-Config, nicht Core/Security; Consumer `api/casino/config/route.ts` ist modifiziert, nicht C9; bleiben untracked). **Tests-in-C9-Entscheidung** (statt C11, plan sagte "→ oder C11"): C11 außerhalb /goal-Scope; Tests modifiziert alongside Source → atomar in C9 (dokumentiert §C9.3, analog C4.3/C8.2). **Security-Gate (höchste Sensitivität, 0 CRITICAL/HIGH durch C9):** SG1 `generateServerSeed` vorbestehend in `provably-fair.ts:9` (committed base), C9-diff fügt keine neue Client-Nutzung hinzu (grep `^\+.*generateServerSeed` leer) → vorbestehender Pre-Prod-Blocker, nicht C9-verschärft (O-Item); SG2 `Math.random` in 11 C9-Source-Files = 0 (nur in `chat-bot.ts`/`session.ts`, beide NICHT C9); SG3 `wallet-contract.ts` (Balance-Referenz) EOL-only → keine Balance-Mutation in C9; SG5 `withRefreshedCookies` in HEAD proxy = 4 (alle terminalen Redirect/403 gewrappt); SG6 Admin-Auth-Boundary (`!user→/sign-in`, `!isAdminEmail→403`) erhalten. Post-Commit re-verify in HEAD: generateServerSeed=1 (vorbestehend), Math.random=0 (casino-core/blackjack), withRefreshedCookies=4. 13 ausgeschlossene Files uncommitted (10 EOL-only + 2 Gamification-NEW + globals.css, erwartet). Plan: `docs/archive/04_c7-c9-execution-plan.md` §C9.

### C10 — Game Pages & Shared Components Polish

- **Scope:** Produktive Spiele-Seiten, Casino-UI, UI-Primitives, Home/Social/Layout/Nav, Hooks. Größter Block nach Dateizahl.
- **Dateien:**
  - ✎ `src/app/games/{layout,page}.tsx` + je Spiel `{blackjack,crash,dice,roulette,slots}/{layout,page}.tsx` (12) + `roulette/RouletteClient.tsx` + `slots/symbols.ts`
  - ✎ `src/app/{page,layout,not-found,error,global-error,globals.css}.tsx`
  - ✎ `src/app/{vault,sign-in,sign-up,auth/callback}/*`
  - ✎ `src/components/casino/{BigWinOverlay,GameErrorBoundary,GameSkeleton,LoadingOverlay,PlayerProfileModal,ProvablyFairModal,ProvablyFairTool,RankBenefitsModal,SettingsModal,SettingsPopover,SlotSymbol,WalletModal}.tsx`
  - ✎ `src/components/casino/games/{blackjack,roulette,slots}/*` (15)
  - ✎ `src/components/home/{HeroSection,HeroSectionV2,HomeClientV2,index}.tsx`
  - ✎ `src/components/layout/{AdminLayout,ClientShell,LevelProgress,MainLayout,MobileNav,OnboardingFlow}.tsx`
  - ✎ `src/components/social/{GlobalChat,GlobalLeaderboard,LiveActivityFeed,LiveActivityFeedV2,PlayerProfileModal}.tsx`
  - ✎ `src/components/navigation/CommandPalette.tsx`
  - ✎ `src/components/ui/{Magnetic,ParallaxLayer,ParticleBurst,RippleContainer,SuperButton,ThemeSelector,Tooltip,VibeMotion}.tsx`
  - ✎ `src/components/auth/{AuthForm,ClientProviders,SupabaseSessionProvider}.tsx`
  - ✎ `src/hooks/{useDynamicColor,useGameKeyboard,useGameStore,useModalKeyboard,useParallax}.ts`
  - ✎ `src/styles/game-effects.css`
- **Commit-Message:** `feat(ui): cyber-stealth polish across game pages, casino and shared components`
- **Abhängigkeiten:** C5 (Design-Tokens), C9 (Core stabil).
- **Verifizierung:** `npm run build`; `npm run lint`; visuelle Prüfung aller 5 Spiele + Home + Shell; `metadata` je Page/Layout; `whileHover/whileTap` flächendeckend (UI-Animator); Core-Web-Vitals (LCP/INP/CLS); `npm run vibe-check`.
- **Risiken:** R1 — Größter Block → ggf. in Sub-Commits splitten (Games / Casino-UI / UI-Primitives / Layout / Home). R2 — Hydration-Mismatch. R3 — Bundle-Budget (dynamische Imports für schweren WebGL/GSAP).
- **Design-Guardian + UI-Animator:** zwingend.
- **Empfehlung:** In 3–4 Sub-Commits aufteilen (C10a Games, C10b Casino/UI-Primitives, C10c Layout/Nav/Social, C10d Home/Auth) zur Reviewbarkeit.
- ✅ **Committed `e6dd3d6`** — 81 Dateien (+9938/−3908), 3 NEW (`components/auth/AuthCinematicBackground.tsx`, `hooks/useIsNarrowViewport.ts`, `hooks/useMounted.ts`) + 78 modified. Verify-Gates: `typecheck-staged.mjs` (81 staged Files) **exit 0**; `npx tsc --noEmit` **0 Errors** (Full-Tree, pre+post-Commit); lint-staged (eslint --fix + prettier --write + typecheck-staged) grün; `next build` exit 0 (Full-Tree). **Scope-Realität vs Plan ("Streng nach Plan"):** Plan-Zeile 10 leicht veraltet — 4 nicht-gelistete Dateien sind **harte Build-Abhängigkeiten** plan-gelisteter Importeure (→ INCLUDE als technische Notwendigkeit, kein Scope-Urteil): `useMounted` (← MainLayout/ClientShell), `useIsNarrowViewport` (← HeroCinematicShowcase), `AuthCinematicBackground` (← sign-in/sign-up), `HeroCinematicShowcase` (← HomeClientV2). Import-Graph verifiziert: 0 C10-Datei importiert ein Loose-End-Symbol (`lib/meta`/`lib/security`/`app/api` leer; `lib/casino/*`-Importe alle in C9/HEAD committed; `session`/`chat-bot` 0 Mods). Exkludiert (Loose-Ends, uncommitted gelassen): `app/refactoring/` (nur Pathname-String-Ref in ClientShell, kein Import), `achievements-config-server.ts`+Test (Consumer = app/api), alle `app/api`/`lib/meta`/`app/backend`/`docs`. **v2-sounds-Refactor-Entdeckung:** 4 Spiele-Pages (crash/dice/roulette/blackjack) hatten UNSTAGED v2-sounds-Refactor (lokale `audioRefs`/`playSound` → zentralisiertes `soundManager` mit SoundKey-Enum `crash-launch`/`crash-explode`, passend zu untracked `/sounds/*.mp3` + sound-manager.ts-Loose-End). Beim ersten Commit-Versuch scheiterte lint-staged transient (typecheck-staged SIGKILL mid-flight + stale TS7053/TS2304-Output aus halb-angewendetem Stash-Zustand); Recovery: 4 MM-Dateien (index=OLD audioRefs, working=NEW soundManager) re-staged → index=working=sauberer Refactor → Retry-Commit grün. SIGKILL war transient (Retry komplett clean). **Security-O-Items (nicht C10-blockierend):** `Math.random` in C10-Source = 0 (UI-Polish); 0 Balance-Mutation (reine UI); Admin-Auth-Boundary unberührt. Plan: `docs/archive/05_c10-c12-execution-plan.md` §C10.

### C11 — Tests & Scripts

- **Scope:** 24 modifizierte + 2 neue Test-Dateien + 8 Scripts. Ideal: interleaved mit jew. Code-Block committen, nicht gebündelt.
- **Dateien:**
  - ➕ `src/lib/casino/__tests__/leaderboard.test.ts` (→ C3)
  - ➕ `src/lib/security/__tests__/proxy-routing.test.ts` (→ C9)
  - ✎ Casino-Tests (14) → C9/C3/C4 zugeordnet
  - ✎ Meta-Tests (3), Security-Tests (7), Store-Test (1) → C4/C9
  - ✎ `tests/{backend-private-access,bug-fixes,crash-e2e,crash-simulation,landing,roulette-e2e,slots-e2e,test-balance-persist}.spec.ts` → C10/C4
  - ✎ `scripts/{audit-games-perf,crash-debug,history-2-check,history-check,roulette-e2e,roulette-simulation,verify-leaderboard-2,vibe-check}.ts` → eigenständiger `chore:`-Commit
- **Commit-Message (übrig):** `test+chore: align tests and audit scripts with server-authority + v2`
- **Abhängigkeiten:** je zugehöriger Block.
- **Verifizierung:** `npm run test`; `npm run test:coverage` ≥ 80 %; `npm run vibe-check`.
- **Risiken:** R1 — Coverage-Regression durch verschobene Tests. R2 — E2E-Tests hängen von lokalem Supabase-Stack ab.
- **Strategie:** Nur Tests, die keinem anderen Block zugeordnet werden können, im gebündelten C11-Commit; Rest mit jew. Block.
- ✅ **Committed `cb88252`** — 16 Dateien (+406/−141): 8 `tests/*.spec.ts` (+ `crash-simulation.ts`) + 8 `scripts/*.ts`. Verify-Gates: lint-staged (eslint --fix + prettier --write + `typecheck-staged.mjs` 16 Files) grün; `npm run test` + `npm run vibe-check` (s. Background-Task). **Scope ("Streng nach Plan"):** exakt die C11-Plan-Zeile (8 tests + 8 scripts) — keine Casino/Security/Meta/Store-Unit-Tests (diese waren C3/C4/C9 interleaved committet oder sind Loose-Ends anderer Blöcke). **Import-Analyse:** 2 C11-Dateien importieren aus `lib/casino/{provably-fair,casino-core}` (beide C9-committed → kein Loose-End-Dep, kein Stash-Isolationsrisiko); alle 16 Real-Content (0 EOL-only). **Exkludiert (Loose-Ends, uncommitted):** 8 untracked `scripts/_tmp_*.sql` + `verify-migrations-applied.sql` (Temp/Verify-Artefakte, nicht in Plan). Plan: `docs/archive/05_c10-c12-execution-plan.md` §C11.

### C12 — Config / Meta-Docs

- **Scope:** Projekt-Doku, die den Endzustand reflektiert. Zuletzt.
- **Dateien:**
  - ✎ `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `01_WORLDMAP_STATUS.md`
- **Commit-Message:** `docs: sync CLAUDE/AGENTS/GEMINI/WORLDMAP with server-authority + v2 status`
- **Abhängigkeiten:** alle Blöcke (reflektiert Endzustand).
- **Verifizierung:** Konsistenz mit tatsächlich committedem Code-Status; keine veralteten Behauptungen (z. B. 007 live → nur nach B1-Klärung).
- **Risiken:** R1 — Doku/Code-Drift.
- **Rollback:** `git revert`.
- ✅ **Committed `d2d9777`** — 4 Dateien (+288/−225): `CLAUDE.md` (+2/−9), `AGENTS.md` (+3/−3), `GEMINI.md` (+1/−1), `01_WORLDMAP_STATUS.md` (+119/−84). Verify-Gates: lint-staged (prettier --write 4 `.md`; typecheck-staged SKIPPED — keine `.ts/.tsx`) grün. **Scope ("Streng nach Plan"):** exakt die 4 Plan-Dateien, alle Real-Content (0 EOL-only), Content = Jans Endzustand-Doku (server-authority + v2). Kein Doc-Content durch Claude bewertet/umgeschrieben (Memory-Regel: Jan prüft). Plan: `docs/archive/05_c10-c12-execution-plan.md` §C12.

---

## 4b — C10–C12 Abschluss

- **Alle 3 Blöcke 🟢:** C10 `e6dd3d6` (81 Files, +9938/−3908) · C11 `cb88252` (16 Files, +406/−141) · C12 `d2d9777` (4 Files, +288/−225).
- **Verify-Gates gesamt:** `next build` exit 0 (C10 Full-Tree); `npx tsc --noEmit` 0 Errors (pre+post C10); `typecheck-staged.mjs` grün (C10 81 / C11 16 / C12 n/a); `npm run test` 26 Files / 265 Tests grün (C11); `npm run vibe-check` ✅ Complete (C11). lint-staged (eslint --fix + prettier --write + typecheck-staged) je Block grün.
- **"Streng nach Plan" umgesetzt:** je Block nur Plan-Zeilen-gelistete Dateien committet. Ausnahme C10: 4 nicht-gelistete aber zwingende Build-Abhängigkeiten (useMounted/useIsNarrowViewport/AuthCinematicBackground + HeroCinematicShowcase) inkludiert — technisch erzwungen (Build-Bruch bei Ausschluss), dokumentiert.
- **Loose-Ends (84 uncommitted, absichtlich zurückgestellt):** `app/api` (11 Routes), `lib/meta` (6 Files), `lib/casino` (perf-monitor/wallet-contract/sound-manager + Unit-Tests + achievements-config-NEW), `app/backend` (2 DELETED), `app/refactoring` (2 NEW), `docs/*` (diverse), `scripts/_tmp_*.sql` (8), `worldmap/*` (01-offene-commits.md selbst + 05_c10-c12-execution-plan.md). Diese bleiben für einen künftigen /goal.
- **Plan-Doc-Entscheidung (Jan delegiert):** `docs/archive/05_c10-c12-execution-plan.md` → nach Abschluss in `docs/archive/` verschoben (analog 03/04), Referenzen aktualisiert; nicht gelöscht (enthält §C10.1–§C12 Audit-Trail als Wert).

---

## 5 — Risiko-Register (konsolidiert)

| ID  | Risiko                                                                                                    | Blöcke    | Wahrscheinlichkeit | Auswirkung | Mitigation                                                      |
| --- | --------------------------------------------------------------------------------------------------------- | --------- | ------------------ | ---------- | --------------------------------------------------------------- |
| R1  | Hunk-Mischung in Multi-Workstream-Dateien (`globals.css`, `useCasinoStore`, `layout.tsx`, `HomeClientV2`) | C4/C5/C10 | Hoch               | Mittel     | `git add -p` pro Block; vor Commit `git diff --cached` reviewen |
| R2  | Migration 016 scheitert, weil 003/007 remote nicht live                                                   | C2/C3/C4  | Mittel             | Hoch       | B1 vor C2 klären                                                |
| R3  | Client-seitiges `generateServerSeed()` als Pre-Prod-Blocker                                               | C9        | Mittel             | Hoch       | Security-Auditor blockt; server-seitig erzwingen                |
| R4  | Wallet-Mutation außerhalb `processGameResult` / RPC                                                       | C4/C9     | Niedrig            | Hoch       | Grep-Check; Security-Auditor                                    |
| R5  | `/v2`-Sandbox landet versehentlich in Produktion/Sitemap                                                  | C5        | Niedrig            | Mittel     | B6; `ClientShell`-Ausnahme dokumentieren; kein `metadata`-Index |
| R6  | Bundle-Budget-Überschreitung durch WebGL/GSAP                                                             | C5/C10    | Mittel             | Mittel     | Dynamischer Import; Lighthouse-Check                            |
| R7  | Hydration-Mismatch bei Zeitstempeln                                                                       | C6/C10    | Mittel             | Niedrig    | `mounted`-Guard; `formatTime`-Helper                            |
| R8  | `ALLOW_DEV_FALLBACK` / Hardcode-Fallback in Prod-Pfad                                                     | C9        | Niedrig            | Hoch       | B3; env-Check                                                   |
| R9  | Coverage < 80 % durch Test-Verschiebung                                                                   | C11       | Mittel             | Mittel     | `npm run test:coverage` je Block                                |
| R10 | `supabase/.temp/` versehentlich committed                                                                 | C2        | Mittel             | Niedrig    | `.gitignore`-Eintrag; nicht `git add`                           |

---

## 6 — Verifizierungs-Matrix (pro Block)

| Block | tsc | lint | test | vibe-check | build | security-reviewer | design-guardian | visuell     |
| ----- | --- | ---- | ---- | ---------- | ----- | ----------------- | --------------- | ----------- |
| C1    | —   | —    | —    | —          | —     | —                 | —               | Link-Check  |
| C2    | —   | —    | —    | —          | —     | ✓ (SQL)           | —               | DB-Smoke    |
| C3    | ✓   | ✓    | ✓    | ✓          | ✓     | ✓                 | —               | API-Curl    |
| C4    | ✓   | ✓    | ✓    | ✓          | ✓     | ✓                 | —               | Reload-Test |
| C5    | ✓   | ✓    | —    | —          | ✓     | —                 | ✓               | ✓           |
| C6    | ✓   | ✓    | ✓    | —          | ✓     | —                 | ✓               | ✓           |
| C7    | ✓   | —    | —    | —          | ✓     | —                 | ✓               | ✓           |
| C8    | ✓   | ✓    | ✓    | —          | ✓     | ✓                 | —               | ✓ (Admin)   |
| C9    | ✓   | ✓    | ✓    | ✓          | ✓     | ✓                 | —               | —           |
| C10   | ✓   | ✓    | ✓    | ✓          | ✓     | —                 | ✓               | ✓           |
| C11   | —   | —    | ✓    | ✓          | —     | —                 | —               | —           |
| C12   | —   | —    | —    | —          | —     | —                 | —               | Konsistenz  |

---

## 7 — Self-Audit (Next-Level-Prüfung der Plan-Datei)

### 7.1 Fehler / Ungenauigkeiten im Entwurf

- **F1 — `.gitignore`-Lücke:** `supabase/.temp/` ist untracked und würde bei `git add .` ins Repo gelangen. → Blocker B? ergänzt als R10; C2 muss `.gitignore`-Eintrag enthalten.
- **F2 — Prototypen-Doppelzuordnung:** `docs/prototypes/` sowohl in C1 als auch C5 gelistet. → Eindeutig C1 (reine Doku-HTML), aus C5 entfernt.
- **F3 — Test-Zuordnung mehrdeutig:** Tests sind gleichzeitig in C9 und C11 gelistet. → Regel: interleaved mit Code-Block, C11 nur für Unzuordenbares. In C9/C11 bereits klargestellt.
- **F4 — `symbols.ts`-Dopplung:** `src/app/games/slots/symbols.ts` in C7 und C10 gelistet. → Eindeutig C7 (Slots-spezifisch).

### 7.2 Vergessene Punkte (im Plan ergänzt)

- **P1 — `withRefreshedCookies()`-Prüfung** im Proxy (C9): rotierte Cookies an terminalen Antworten, sonst Folge-Request scheitert. → in C9 Verifizierung aufgenommen.
- **P2 — `metadata`-Export-Pflicht** (DevOps-Slayer-Regel) für alle neuen Pages/Layouts (`v2/layout.tsx`, Admin-Pages, Spiele-Seiten). → C5/C8/C10 Verifizierung ergänzt.
- **P3 — `next/image`-Konfig** für `public/images/slots/v2/` und `unoptimized`-Prop für SVG (lehrt Commit b442ae3). → C7 aufgenommen.
- **P4 — Rate-Limiter-Pflicht** auf allen 4 neuen API-Routes (Upstash prod, In-Memory dev). → C3 Risiken aufgenommen.
- **P5 — `communityWagered: 8420.5`-Hardcode**-Entfernung als C4-Akzeptanzkriterium. → B4 + C4 Verifizierung.
- **P6 — `search_path = public, pg_temp` + `SECURITY DEFINER`** in jedem neuen RPC der Migration 016. → C2 Verifizierung.
- **P7 — `Math.random`-Frei-Check** via grep als C9-Verifizierung.

### 7.3 Weiterpunkte, die zusätzlich in den Plan aufgenommen werden sollten

- **A1 — Pre-Commit-Hook-Empfehlung:** `pre-commit`-Skript, das `tsc --noEmit` + `lint` + `vibe-check` vor jedem Commit der Blöcke C3/C4/C9/C10 ausführt (Guard gegen Hunk-Fehlzuordnung).
- **A2 — Commit-Reihenfolge-Assertion:** Vor C2 ein `supabase migration list`-Check, der 003/007 als `Applied` bestätigt; sonst C2 abbrechen.
- **A3 — Sub-Commit-Strategie für C10:** Explizite Aufteilung C10a–C10d (Games / Casino+UI-Primitives / Layout+Nav+Social / Home+Auth) → Reviewbarkeit, kleinere Diffs, isolierte Rollbacks.
- **A4 — Rollback-Runbook:** Pro kritischem Block (C2, C4, C9) ein konkretes `DROP`/`revert`-Kommando bereithalten — aktuell nur C1/C2 haben Rollback-Notizen; C4/C9 ergänzen.
- **A5 — Doku-Backlink:** Nach C12 in `01_WORLDMAP_STATUS.md` einen Verweis auf diese Datei (`worldmap/01-offene-commits.md`) als Execution-Source-of-Truth setzen.
- **A6 — Visual-Review-Checkpoint:** Nach C5+C10 zusammenhängender manuell-visueller Review der 5 Spiele + Home + `/v2` (entspricht CLAUDE.md-Regel „UI-Änderungen: Dev-Server + visueller Check").
- **A7 — ChunkLoadError-Regression:** Letzte Commits zeigen `ChunkLoadError`-Vergangenheit (f26b3e). → C5/C10 Build-Verifizierung um Vercel-Preview-Deployment-Check ergänzen.

### 7.4 Ergebnis des Audits

Plan ist nach Ergänzung von F1–F4, P1–P7 und A1–A7 auf „Next-Level": vollständig, abhängigkeitskonsistent, je Block verifizierbar, mit Security-/Design-Gates, Rollback-Runbook und Visual-Checkpoint. Ausprägbar in der vorgeschlagenen Reihenfolge.

---

## 8 — Runde 2 (C13–C21) + Post-R2 Follow-up (C1) — konsolidiert aus ehemaliger `02-offene-commits-r2.md`

> **Status:** R2 vollständig `Executed` — C13–C21 alle 🟢 committed. Post-R2 C1 (redeem-code CRITICAL) resolved (`ca2a389`). Diese Sektion konsolidiert die ehemalige R2-Plandatei (gelöscht 2026-08-10) in diese Single-Source-of-Truth-Datei.
> **Vorgänger-Runde:** §1–§7 oben (R1, C1–C12, alle 🟢 committed `5860f83`→`d2d9777`).

### 8.1 — R2-Übersicht (C13–C21)

| Block | Inhalt                                                                                                        | Commit    | Verify                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| C13   | Cleanup TEMP-SQL (`_tmp_*`, `verify-migrations-applied.sql`, `.gitignore`)                                    | `e44d712` | tsc 0, vibe-check ✅                                                                                                                        |
| C14   | Docs Reorg R2 (8 NEW architecture + 6 NEW archive + 4 worldmap-DELETEs)                                       | `c7f9bc8` | tsc 0                                                                                                                                       |
| C15   | 410-Routen + `/backend`-Löschung (prettier + 2 DELETE)                                                        | `eb209d9` | tsc 0                                                                                                                                       |
| C16   | Sound-Design 1.6 (SoundKey-Enum + 16 URLs, Store, Slots-Page, 16 Sounds)                                      | `615c45a` | tsc 0, vibe-check ✅                                                                                                                        |
| C17   | meta-Refactor (Repository-Pattern: contracts/cursor/repository + 3 Tests)                                     | `0b84e34` | tsc 0, vitest repository.test.ts ✅                                                                                                         |
| C18   | Achievements 1.5 (Migration 017, config-server, config/route.ts read-only)                                    | `7e1707e` | tsc 0, security-reviewer PASS (2 MEDIUM-Hardenings: `server-only`-Import + idempotente Policy)                                              |
| C19   | Money-Path API (bet Rate 10→60, blackjack 20→40, redeem-code prettier)                                        | `49b99da` | tsc 0, security-reviewer BLOCK→in-scope fixed (H1 rate-limit 30/20 per 10s + M1 `isExplicitSignedOut`-Gate); redeem-code C1 deferred → §8.7 |
| C20   | Read-Path API (leaderboard game_rounds-Fallback, history-Gate, balance/stats)                                 | `bd48ac5` | tsc 0, security-reviewer PASS (1 MEDIUM-Observability-Fix: `roundsResult.error`-Log + safe-null `?? []`)                                    |
| C21   | worldmap-Status (Endzustand: 01-offene-commits, 02_FRONTEND_REDESIGN, 05_ZUKUNFTSPLANUNG, 01_WORLDMAP_STATUS) | `f9231f7` | tsc 0, vibe-check ✅                                                                                                                        |

**⛔ Bewusst ausgeschlossen (Jans Refactoring-Test, andere Konversation — nicht committen, nicht löschen):**

- `src/app/refactoring/{layout,page}.tsx` (2 NEW) — Testseite für Lobby-v2-Prototype (iframe).
- `public/prototypes/` (`lobby_v2_refactoring.html` + `lib/`) — Asset der Testseite (vendored Three.js/GSAP, isoliert vom Build).
- `src/proxy.ts` (M, +2) — einzige Änderung = `/refactoring(.*)` in `PUBLIC_ROUTES`, gehört zum ausgeschlossenen Test.

### 8.2 — Verify-Gate-Ergebnisse (Post-R2)

- **TypeScript:** `tsc --noEmit` → 0 Errors.
- **vibe-check:** ✅ (Balance-Integrität, RNG-Verteilung, Payout-Math).
- **Vitest:** 275/276 PASS. 1 FAIL = `src/lib/casino/__tests__/stats-derivation.test.ts` (`buildDailyActivity` caps-span) — **untracked Jan-WIP** (Initiative 1.7), nicht durch C13–C20 verursacht (keine Route importiert `stats-derivation`). Exkludiert.
- **lint-staged:** pro Commit via pre-commit-Hook (eslint --fix + typecheck-staged + prettier).

### 8.3 — Aufgetretene Problem-Register-Fälle (realisiert)

- **P5 (Edit-Tool String-Mismatch bei C15):** gelöst durch zeilenweises Editieren mit kleineren unique Anchors nach vorherigem Read der exakten Zeilen.
- **P3 (security-reviewer BLOCK bei C19):** redeem-code CRITICAL C1 (self-credit ATM: amount aus Code-String-Regex `/\d+/`, `Math.min(parsedVal, 1000)`, kein `promo_codes`-Table-Lookup). In-scope-Hardenings (H1, M1) angewandt, redeem-code **komplett aus C19 exkludiert** und als separater Security-Round deferred → §8.7.
- Keine weiteren P-Fälle realisiert (P1/P2/P4/P6–P12: Prävention greift).

### 8.4 — Deferrals / Exklusionen (post-R2 verbleibend)

- **C1 (CRITICAL)** → ✅ **Resolved post-R2** (`ca2a389`, siehe §8.7).
- **H3** `src/lib/casino/wallet.ts` (`creditBonus` non-atomic + neue M-Modifikation) → **Jan-WIP** (andere Konversation). Uncommitted belassen.
- Migration 018 / `stats-derivation.ts`+Test / `src/app/stats/` / `src/components/stats/` / `MainLayout.tsx` (Stats-Nav) / `worldmap/05_1.2` + `05_1.7` → **Jan-WIP** Initiative 1.7, exkludiert.
- `src/app/refactoring/` → **TEST-Ordner** (Jan-Weisung), nicht committen/löschen.
- `public/prototypes/` → exkludiert (Prototypen). `src/proxy.ts` → kein R2-Scope-Overlap.

### 8.5 — Security-Reviewer-Verdikte

- **C18 (achievements):** PASS read-only. 2 MEDIUM-Hardenings angewandt (`server-only`-Import in `achievements-config-server.ts`; idempotente `CREATE POLICY` in Migration 017 via `DO $… IF NOT EXISTS`).
- **C19 (money-path API):** BLOCK auf redeem-code (CRITICAL C1) → in-scope-Hardenings (bet+blackjack: rate-limit 30/20 per 10s, `isExplicitSignedOut`-Cookie-Gate) umgesetzt + redeem-code vollständig exkludiert und zu dedicated security round deferred. Freigabe für bet+blackjack.
- **C20 (read-path API):** PASS. 1 MEDIUM-Observability-Fix angewandt (`leaderboard/route.ts` `roundsResult.error`-Log + safe-null `roundsResult.data ?? []`).

### 8.6 — Self-Verify (post C21)

- `git status --porcelain` nach C21 zeigte nur noch die ⛔-Exklusions-Menge (refactoring/, public/prototypes/, proxy.ts, redeem-code, wallet.ts, stats-Cluster, Migration 018, 1.2/1.7-worldmaps).
- `git log --oneline -9` zeigte C13–C21 in korrekter Reihenfolge.
- `01_WORLDMAP_STATUS.md` §2 „Aktive Pläne"-Tabelle konsistent mit R2-Status (R1 + R2 = Executed).
- R2-Plan versionskontrolliert.

### 8.7 — Post-R2 Follow-up: C1 (redeem-code) resolved — `ca2a389` (2026-08-10)

**Commit:** `ca2a389` (separat nach R2, nicht Teil der C13–C21-Kohorte). Marker-Update: `c7a1eea`.

**Was gelöst wurde** (der in §8.3 P3 / §8.4 dokumentierte CRITICAL C1 self-credit-ATM):

- `supabase/migrations/021_promo_codes.sql` (NEW): `promo_codes`-Tabelle (RLS service_role-only, CHECK `used_count <= max_uses`) + atomare `redeem_promo_code(p_user_id, p_code)` RPC — `SECURITY DEFINER`, `search_path public, pg_temp`, `FOR UPDATE`-Locks auf `promo_codes`+`users`, `used_count`-Inkrement + Balance-Credit + `wallet_transactions`-Insert in einer TX, Rückgabe JSONB-Wallet-Snapshot.
- `src/lib/casino/wallet.ts`: `creditBonus` (nicht-atomarer TOCTOU Read-Modify-Write) **gelöscht**, ersetzt durch `redeemPromoCode()` (RPC-Aufruf). Keine Code-Caller von `creditBonus`.
- `src/app/api/casino/redeem-code/route.ts`: Regex-Self-Credit (`rawCode.match(/\d+/)` + `Math.min(parsedVal, 1000)`) entfernt; `validateMutationOrigin` CSRF-Guard hinzugefügt; RPC-Fehlercodes (`PROMO_NOT_FOUND/INACTIVE/EXPIRED/EXHAUSTED/INVALID`) auf User-Meldungen gemappt; Server-Wallet-Snapshot zurückgegeben.
- `src/app/api/admin/promo-codes/route.ts` (NEW): Admin-only GET (List) + POST (Create) mit `validateMutationOrigin` + Zod-Schema.
- `src/app/admin/promo-codes/` (NEW): Admin-Page + `PromoCodesClient` (Obsidian & Gold, Glassmorphism).
- `src/components/layout/AdminLayout.tsx`: Nav-Eintrag „Promo Codes".

**Modell-Entscheidungen (Jan):** Global `max_uses`, kein Per-User-Limit · Code-Erstellung via Admin-Route.

**Verify-Gates post-C1:** tsc 0 · lint C1-Dateien clean · vibe-check ✅ · vitest 308/308 · security-reviewer BLOCK→fixed (HIGH-1 `validateMutationOrigin` auf Admin-POST, MEDIUM-1 dead `creditBonus` entfernt). Jan-WIP (provably-fair seed chain, stats migration 018, `consumeActiveSeed`, `perGame`) via Hunk-Stage-Isolation **nicht** in `ca2a389` übernommen — bleibt uncommitted im Working-Tree.

**⚠️ Deployment-Prereq (offen):** Migration `021_promo_codes.sql` muss vor Runtime via Supabase SQL-Editor remote ausgerollt werden (Tabelle + RPC existieren remote noch nicht). Bis dahin liefert `/api/casino/redeem-code` 500 (RPC nicht gefunden).

---

## 9 — Verbleibend offene Punkte (Stand 2026-08-12)

| #   | Punkt                                                                | Status                              | Aktion                                                                               |
| --- | -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| B6  | `/v2`-Routes nicht als Produktivroute in Sitemap/Metadata deklariert | ⏳ **OFFEN**                        | C5-Verifikation: `app/v2`-Sitemap/Metadata prüfen, ggf. `noindex`/Sitemap-Exclusion. |
| M21 | Remote Migrationen 018–025 ausführen                                 | ⏳ **committed, remote ausstehend** | Via Supabase SQL Editor (DDL-fähiger Zugang für Jan). Siehe Migrations-Ordner.       |
| R3  | Initiativen R3-1 bis R3-7                                            | ✅ **VOLLSTÄNDIG COMMITTED**        | Commits C22–C28 erfolgreich erstellt und verifiziert (391/391 Tests grün, tsc 0).    |

---

## 10 — R3: Abgeschlossene Initiativen & Commits (Stand 2026-08-12)

| ID   | Initiative                         | Status           | Commit                      | Inhalt & Verifikation                                                                                             |
| ---- | ---------------------------------- | ---------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| R3-1 | **Commit-Reveal 1.2 / Seed-Kette** | ✅ **Committed** | C23 (`5442c54`)             | `casino-core.ts`, `wallet.ts`, `seeds/history`, `ProvablyFairModal.tsx`, Migrationen 019/021/022, 29 Tests        |
| R3-2 | **Stats 1.7**                      | ✅ **Committed** | C24 (`28b2923`)             | `src/app/stats/`, `src/components/stats/`, `stats-derivation.ts`, `MainLayout.tsx`, Migrationen 018/020, 11 Tests |
| R3-3 | **Security 06 (P0-Audit)**         | ✅ **Committed** | C22 (`2ed7c42`)             | Promo Redemption Ledger (023), Origin-Validierung, Audit-Verifikation, 15 Tests                                   |
| R3-4 | **Chatbot 2.4 & Guide 2.7**        | ✅ **Committed** | C25 (`fad10ef`)             | `CasinoGuidePanel`, `/api/chat/bot-response`, `chat-guide.ts`, `guide-telemetry.ts`, Migration 024, 21 Tests      |
| R3-5 | **Admin-BI 2.5**                   | ✅ **Committed** | C26 (`82860d0`)             | `/admin/analytics`, `src/lib/admin/`, `api/admin/analytics/`, 11 Tests                                            |
| R3-6 | **Brand 07**                       | ✅ **Committed** | C27 (`b1a5584`)             | `BetModeTabs`, `BetInputGroup`, `GameActionButton`, `VibeSlider`, Brand Showcase                                  |
| R3-7 | **Telegram & Core Wiring**         | ✅ **Committed** | C28 (`6ab9207` + `686ed4b`) | Telegram Bot & Account Linking (025), Big-Win Notifications, Proxy & Store Wiring, 32 Tests                       |

### 10.2 — ⛔ Ausgeschlossene Menge (isoliert gelassen)

- `src/app/refactoring/` — Lobby-v2-Testseite (Jan-Weisung).
- `public/prototypes/` — Three.js/GSAP Assets der Testseite.
