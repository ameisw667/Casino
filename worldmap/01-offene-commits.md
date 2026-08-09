# 01 — World Map: Offene Commits — Konsolidierung & Execution Roadmap

> **Erstellt:** 2026-08-09 · **Status:** Geplant · **Ziel:** Vollumfängliche, geordnete Commit-Reihenfolge für sämtliche uncommitted-Arbeit (196 modified · 36 untracked · 12 staged).
> **Scope:** 5 % Übersichtstabelle für Jan · 95 % Execution-Detail für LLM.
> **Quellen:** `git status --porcelain` (2026-08-09 11:2x), `worldmap/02_FRONTEND_REDESIGN.md`, `worldmap/03_CASINO_SUPABASE_CONNECTION.md`, `worldmap/03_01_CASINO_SUPABASE_IMPLEMENTATION_PLAN.md`.

---

## 1 — Übersichtstabelle (5 % Scope für Jan)

Legende Status: 🔴 uncommitted · 🟡 staged (nicht committed) · 🟢 committed (Referenz)
Legende Risiko: N = Niedrig · M = Mittel · H = Hoch
Legende Aufwand: S < 1 h · M = 1–4 h · L = 4 h+

| #   | Kategorie / Meilenstein (Future)                                                                                                                                          | Status       | Commit-Block | Risiko | Blockiert durch               | Aufwand |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------ | ------ | ----------------------------- | ------- |
| 1   | **Docs-Reorganisation** — `worldmap/` → `docs/status-reports/`, Root-Docs → `docs/`, neue Architecture- & Status-Docs, Prototypen, Archive                                | 🟢 committed | C1           | N      | —                             | S       |
| 2   | **Supabase Schema** — Migrationen 014 (user_stats), 015 (get_leaderboard), 016 (full server-authority expansion: chat/seeds/community/active-round RPCs)                  | 🔴           | C2           | M      | DDL-Rollout (Service-Role)    | S       |
| 3   | **Supabase Server-Autorität (Code)** — neue API-Routes chat/seeds/community/active-round + `WalletService`-Methoden                                                       | 🔴           | C3           | M      | C2 live                       | M       |
| 4   | **Store & Gamification Hydration** — `useCasinoStore.initialize()` erweitert, `GamificationProvider`, vip/game-config, Session, `syncToFile()`-Entfernung                 | 🔴           | C4           | H      | C3                            | M       |
| 5   | **Frontend v2 Sandbox (Cyber-Stealth)** — `app/v2`, `components/v2`, `styles/v2.css`, HTML-Prototypen, Hero-Showcase, Arcade-Grid, WebGL-Canvas, Slots v2                 | 🔴           | C5           | N      | —                             | L       |
| 6   | **History & Leaderboard Modularisierung** — `components/history/*`, `components/leaderboard/*` + Page-Rewrites (Kohorten 2–3 aus `02_FRONTEND_REDESIGN.md`)               | 🔴           | C6           | M      | C5 (Tokens)                   | M       |
| 7   | **Slots v2 Assets & Symbols** — `public/images/slots/v2/`, modifizierte `sym-*.png`, `symbols.ts`, `SlotSymbol`/`SlotReel`/`WinLine`                                      | 🔴           | C7           | N      | C5                            | S       |
| 8   | **Admin Pages Refactor** — 14 Admin-Komponenten + 3 Admin-API-Routes                                                                                                      | 🔴           | C8           | M      | —                             | M       |
| 9   | **Core-Libs & Security Hardening** — `provably-fair`, `casino-core`, `bet-validator`, `wallet-contract`, `security/admin`, `request-security`, `proxy.ts`, Supabase-Utils | 🔴           | C9           | H      | —                             | M       |
| 10  | **Game Pages & Shared Components Polish** — Games-Layouts, Casino-UI, UI-Primitives, Home/Social/Layout/Nav, Hooks                                                        | 🔴           | C10          | M      | C5 (Design-Tokens)            | L       |
| 11  | **Tests & Scripts** — 24 modifizierte Test-Dateien + 2 neue Tests + 8 Scripts                                                                                             | 🔴           | C11          | M      | C2–C10 (je zugehöriger Block) | M       |
| 12  | **Config/Meta-Docs** — `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `01_WORLDMAP_STATUS.md`                                                                                     | 🔴           | C12          | N      | alle Blöcke                   | S       |

**Zusammenfassung:** 12 Commit-Blöcke · 3 kritische Pfade (C2→C3→C4 Supabase-Kette; C9 Security; C4 Wallet-Mutationen) · 2 isolierte Pfad (C1 Docs, C5 v2-Sandbox).

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

| #   | Blocker                                                                                             | Warum                            | Aktion                                                                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | ~~Migration 007 remote nicht als live bestätigt~~                                                   | Schema-Abhängigkeit              | ✅ **GELÖST 2026-08-09** — Live-Verifikation via SQL Editor: 003/007/013/014/015 live, 011 angewandt, RLS aktiv. Siehe Verifikation unten.                                                                                                   |
| B2  | ~~DDL-fähiger Service-Role-Zugang~~                                                                 | `supabase db push` braucht Admin | ✅ **GELÖST** — Jan hat DDL-Zugang via Supabase SQL Editor; Rollout erfolgt direkt im Editor (kein CLI nötig).                                                                                                                               |
| B3  | `ALLOW_DEV_FALLBACK` in `.env.local` — Dev-Auth-Bypass darf nicht in Produktion landen.             | Security                         | Vor C9-Commit prüfen, dass kein Hardcode-Fallback in produktiven Pfaden.                                                                                                                                                                     |
| B4  | `communityWagered: 8420.5` Hardcode im Store (laut `03_CASINO_SUPABASE_CONNECTION.md` Abschnitt 2). | Server-Autorität                 | C4 muss `get_community_stats()`-RPC anbinden, Hardcode entfernen.                                                                                                                                                                            |
| B5  | `syncToFile()` Dev-Methode im Store noch vorhanden.                                                 | Dead-Code / Local-Speicher       | C4 entfernt; prüfen, dass kein Aufruf mehr referenziert.                                                                                                                                                                                     |
| B6  | Neue v2-Routes (`/v2`) sind WIP/Sandbox — `ClientShell` rendert `/v2` bewusst ohne Shell.           | Prod-Exposition                  | C5: sicherstellen, dass `/v2` nicht in Sitemap/Metadata als Produktivroute deklariert.                                                                                                                                                       |
| B7  | **Migration 009 nicht remote angewandt** (user_identities/admin_roles/Trigger fehlen).              | Identitäts-Layer                 | **DEFERRED** — `admin.ts` hat Fallback (Email-Allowlist autoritativ); 009 höheres Risiko (Trigger blockiert Sign-ups, Backfill kann aborten). Aktivierung nur nach §3.2-Bedingungen in `worldmap/01a-db-rollout-plan.md`. Nicht Teil von C2. |

### Verifikation 2026-08-09 (Supabase SQL Editor, Projekt `hmqwozhdckbwjqzcmire`)

| Prüfung                                                                                         | Ergebnis                                                                                                                        |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 003 `seeds` + 007 `game_rounds` + 5 RPCs                                                        | ✅ live                                                                                                                         |
| 013/014/015 (`get_user_stats`, `sync_user_achievement`, `get_leaderboard`, `user_achievements`) | ✅ live — **014/015 bereits remote angewandt**                                                                                  |
| 011 Legacy-REVOKE (`place_bet`/`settle_bet`)                                                    | ✅ angewandt (ACL nur `postgres`+`service_role`)                                                                                |
| RLS (`game_rounds`, `seeds`, `users`, `wallet_transactions`, `game_sessions`)                   | ✅ aktiv                                                                                                                        |
| 016-Dep A `chat_messages`-Schema                                                                | ✅ kompatibel (Tabelle existiert bereits, 016 überspringt CREATE)                                                               |
| 016-Dep B `seeds`-Schema + Unique(`user_id`)                                                    | ✅ kompatibel, `ON CONFLICT (user_id)` sicher                                                                                   |
| 016-Dep C `game_rounds`-Schema                                                                  | ✅ kompatibel (alle Spalten vorhanden)                                                                                          |
| 016-Dep D `wallet_transactions.type`                                                            | ⚠ nur `bet_settled`/`round_settled`/`round_started` (kein `bet`) — `get_community_stats` zählt `bet_settled`=306, funktional ok |
| 009 (`user_identities`/`admin_roles`)                                                           | ❌ nicht live → B7 (DEFERRED)                                                                                                   |
| 012 (`promo_codes`)                                                                             | ❌ Phantom — kein Code fragt `promo_codes` ab; 012 ist `balance DEFAULT 10000` (Doku in `03` korrigiert)                        |

**C2-Rollout-Scope final:** nur **016** ausrollen (GO) + optional **012**; **009** deferred. Details: `worldmap/01a-db-rollout-plan.md`.

---

## 4 — Commit-Block-Detail (95 % Scope für LLM)

Jeder Block: Scope · Dateien (➕ neu / ✎ modifiziert / ➖ gelöscht) · Commit-Message · Abhängigkeiten · Verifizierung · Risiken · Rollback.

### C1 — Docs-Reorganisation

- **Scope:** Reine Doku-Verschiebung/-Anlage. 0 Code-Risiko. Als Erstes committen, um Working-Tree zu entzerren.
- **Dateien:**
  - ✎ staged (12): `worldmap/* → docs/status-reports/*` (01–08, 11, 12), `02_CLERK_SUPABASE.md → docs/architecture/`, `DESIGN_SYSTEM_AND_VIBE.md → docs/`, `01_AUTH_WELCOME_BONUS.md → 06_AUTH_WELCOME_BONUS.md`, `11_PERF_MOBILE.md` (RM).
  - ➖ staged: `CASINO_STABILITY_WORKFLOW.md`.
  - ➖ unstaged: `CASINO_ROYALE_MARKET_ROADMAP.md` (verschoben nach `docs/`), `OPEN_TASKS.md`.
  - ➕ neu: `docs/CASINO_ROYALE_MARKET_ROADMAP.md`, `docs/architecture/{03_LEADERBOARD_STATS,05_MOBILE_PERFORMANCE,13_LEADERBOARD_BOT_SIMULATION}.md`, `docs/status-reports/02_STATUS_QUO_KOHORTEN.md`, `docs/crash-visual-tension-plan.md`, `docs/prototypes/` (4 HTML), `docs/archive/04_FRONTEND_REFACTOR.md`.
- **Commit-Message:** `docs: reorganize worldmap into docs/ (status-reports, architecture, prototypes)`
- **Abhängigkeiten:** keine.
- **Verifizierung:** `git status` leer für Docs-Pfade; Markdown-Links intakt (relative Pfade `../docs/...` in `worldmap/02`+`03` prüfen).
- **Risiken:** R1 — relative Links in bestehenden `worldmap/*.md` zeigen nach Verschiebung ins Leere (insbes. `../docs/prototypes/...`). → Nach Commit Links validieren.
- **Rollback:** `git revert <hash>` — kein Side-Effect.

### C2 — Migrationen 014 / 015 / 016 (Supabase Schema)

- **Scope:** Reines SQL. 016 definiert `chat_messages`, `post_chat_message`, `get_recent_chat_messages`, `get_or_create_user_seed`, `rotate_user_seed`, `get_community_stats`, `get_active_game_round`. 014 = `get_user_stats`/`sync_user_achievement`, 015 = `get_leaderboard`.
- **Verifizierter Remote-Status (2026-08-09):** 014 + 015 **bereits live**. 016 **LIVE (Post-Check 7/7 bestanden)** — ausgerollt via SQL Editor. 009 **deferred** (B7). 012 optional. Siehe `worldmap/01a-db-rollout-plan.md`.
- **Dateien:**
  - ➕ `supabase/migrations/014_fix_user_stats.sql` (Repo-Integrität; remote bereits live)
  - ➕ `supabase/migrations/015_get_leaderboard.sql` (Repo-Integrität; remote bereits live)
  - ➕ `supabase/migrations/016_full_server_authority_expansion.sql` (**ausrollen** — GO, idempotent, alle Deps verifiziert)
  - ➕ (verwerfen) `supabase/.temp/` — Supabase-CLI-Artefakt → `.gitignore`-Eintrag, nicht committen.
- **Commit-Message:** `feat(db): migrations 014–016 (user_stats, get_leaderboard, full server-authority RPCs)`
- **Abhängigkeiten:** ~~B1/B2~~ ✅ gelöst.
- **Rollout (Jan, via SQL Editor):**
  1. `supabase/migrations/016_full_server_authority_expansion.sql` → SQL Editor → Run.
  2. `scripts/_tmp_verify_016_post.sql` → Run → Output pasten (LLM bewertet GO/Revert).
  3. (Optional) `supabase/migrations/012_welcome_bonus.sql` → Run.
- **Verifizierung:** Post-Check via `_tmp_verify_016_post.sql` (6 RPCs = true, chat_messages RLS = true) + Smoke `get_recent_chat_messages(5)`, `get_community_stats()`; `search_path = public, pg_temp` + `SECURITY DEFINER` in jedem RPC bestätigt (Code-Review 016).
- **Risiken:** R1 — `get_community_stats` filtert `type IN ('bet','bet_settled')`, `bet` existiert remote nicht → zählt nur `bet_settled`=306 (funktional ok). R2 — `chat_messages`-RLS ohne Policy → Client-Zugriff nur via `service_role` in API-Route (gewollt). Keine R1/R2 aus Vorversion (Deps verifiziert).
- **Rollback:** `DROP FUNCTION` der 6 neuen RPCs (siehe `01a` §2.6); `chat_messages`-Tabelle **nicht** droppen (existierte vor 016).

### C3 — Supabase Server-Autorität (API + Service)

- **Scope:** Neue API-Routes + `WalletService`-Methoden, die die RPCs aus C2 anbinden.
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

### C4 — Store & Gamification Hydration

- **Scope:** `useCasinoStore.initialize()` zieht Wallet, Stats, Achievements, Seeds, Community-Ziel, Chat aus Supabase. `syncToFile()`-Entfernung. LocalStorage-Partialize auf UI-Prefs beschränkt.
- **Dateien:**
  - ✎ `src/store/useCasinoStore.ts` — ⚠ **Hunk-Split nötig** (Redesign-Hunke → C10, Hydration-Hunke → C4).
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

### C7 — Slots v2 Assets & Symbols

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

### C12 — Config / Meta-Docs

- **Scope:** Projekt-Doku, die den Endzustand reflektiert. Zuletzt.
- **Dateien:**
  - ✎ `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `01_WORLDMAP_STATUS.md`
- **Commit-Message:** `docs: sync CLAUDE/AGENTS/GEMINI/WORLDMAP with server-authority + v2 status`
- **Abhängigkeiten:** alle Blöcke (reflektiert Endzustand).
- **Verifizierung:** Konsistenz mit tatsächlich committedem Code-Status; keine veralteten Behauptungen (z. B. 007 live → nur nach B1-Klärung).
- **Risiken:** R1 — Doku/Code-Drift.
- **Rollback:** `git revert`.

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
