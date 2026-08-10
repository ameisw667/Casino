# 03 — C3–C6 Execution-Plan (vollumfänglich, Weltklasse)

> **Erstellt:** 2026-08-09 · **Status:** C3 ✅ (`5d3fc7f`) · C4 ✅ (`d825c4b`) · C5 ✅ (`06f364d`) · C6 ✅ (`ca156f3`) · **C3–C6 vollständig committed** · **Ziel:** C3, C4, C5, C6 einzeln committen; C1–C6 in `worldmap/01-offene-commits.md` Übersichtstabelle 🔴→🟢.
> **Scope:** 5 % Übersicht für Jan · 95 % Execution-Detail für LLM.
> **Quelle:** `git status --porcelain` (2026-08-09), Datei-Inhalts-Verifikation, `worldmap/01-offene-commits.md` §4.

> **Workflow pro Block:** Plan → Self-Audit (Plan) → Execution (stagen + verify-gates: tsc/lint/test/build/vibe-check je Block) → Self-Audit (Execution) → Markdown-Update (`01-offene-commits.md` §1 Zeile + §4 Detail) → nächster Block.
> **Commit-Autorisierung:** durch /goal ausdrücklich erteilt. Conventional Commits, kein Co-Author (globale Regel).

---

## C3 — Supabase Server-Autorität (API + Service)

### C3.1 — Ziel & Definition

Ein einzelner `feat(api):`-Commit, der die 4 neuen API-Routes (chat, seeds, community, active-round) + die 6 neuen `WalletService`-Server-Autoritäts-Methoden + den Begleit-Test fasst. Danach sind diese Server-Autoritäts-Code-Dateien committed; Working-Tree behält restliche Code-Änderungen (C4–C12).

**C3 = API-Boundary + Service-Layer.** Security-kritisch (Auth, Rate-Limit, Service-Role-Isolation). Abhängig von C2 (RPCs live).

### C3.2 — Scope-Dateiliste (verifiziert via git + Datei-Lektüre)

| #   | Typ | Pfad                                           | Verifikation                                                                   |
| --- | --- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | ➕  | `src/app/api/chat/route.ts`                    | untracked (`??`), 2292 B, GET public + POST auth+rate-limit+Zod                |
| 2   | ➕  | `src/app/api/casino/seeds/route.ts`            | untracked, 2937 B, GET+POST auth+rate-limit+Zod                                |
| 3   | ➕  | `src/app/api/community/route.ts`               | untracked, 603 B, GET public (Aggregat)                                        |
| 4   | ➕  | `src/app/api/casino/active-round/route.ts`     | untracked, 1451 B, GET auth+game-Validation                                    |
| 5   | ✎   | `src/lib/casino/wallet.ts`                     | modified (+136/−27), 6 neue statische Methoden + prettier-Reformat bestehender |
| 6   | ➕  | `src/lib/casino/__tests__/leaderboard.test.ts` | untracked, reine Aggregations-Logik (self-contained)                           |

**EXKLUDIERT (nicht in C3):**

- `src/utils/supabase/admin.ts` — ` M` aber **EOL-only** (alle `git diff`-Varianten leer, nur CRLF-Warnung). Plan-Bedingung "falls Helper ergänzt" nicht erfüllt → kein Content-Change → NICHT stagen (vermeidet EOL-Rauschen-Commit).
- `supabase/migrations/017_*` → eigener Block.
- C4-Store, C5-v2, C6-Modular, C9-core/security-Dateien.

### C3.3 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                                                                                                                                                     | Status                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| V1  | C2 RPCs live (chat/seeds/community/active-round)                                                                                                                                                  | ✅ 016 LIVE (Post-Check 7/7), C2 committed `92cb929`                          |
| V2  | `WalletService`-Methoden rufen genau die C2-RPCs (`post_chat_message`, `get_recent_chat_messages`, `get_or_create_user_seed`, `rotate_user_seed`, `get_community_stats`, `get_active_game_round`) | ✅ verifiziert in wallet.ts-Diff                                              |
| V3  | Service-Role (`createAdminClient`) nur server-side in WalletService; Routes nutzen SSR-`createClient()` für Auth                                                                                  | ✅ verifiziert — kein Key-Reachbar für Client                                 |
| V4  | Auth-Enforcement auf allen authentifizierten Endpoints + dev-fallback korrekt gegated (`NODE_ENV==='development' && ALLOW_DEV_FALLBACK && !isExplicitSignedOut`)                                  | ✅ verifiziert — B3 erfüllt (nicht in Prod-Pfad)                              |
| V5  | Rate-Limit auf Spam-Vektoren (chat POST, seeds POST) via `enforceRateLimit`                                                                                                                       | ✅ verifiziert (10/60s je)                                                    |
| V6  | Zod-Validation auf allen Bodies                                                                                                                                                                   | ✅ verifiziert                                                                |
| V7  | wallet.ts ist NICHT in Hunk-Split-Liste (R1) → gesamte Datei C3-zugehörig                                                                                                                         | ✅ verifiziert (R1-Liste: globals.css/useCasinoStore/layout.tsx/HomeClientV2) |
| V8  | `tsc --noEmit` auf Working-Tree = green (C3-Code typ-korrekt)                                                                                                                                     | ⏳ läuft (background)                                                         |

### C3.4 — Workflow (Execution)

```
1. Verify-Gates (vor Stage):
   a. tsc --noEmit (working tree) → 0 Fehler
   b. npx vitest run src/lib/casino/__tests__/leaderboard.test.ts → grün
2. Staging (explizite Pfade — kein `git add .`):
   git add src/app/api/chat/route.ts src/app/api/casino/seeds/route.ts \
           src/app/api/community/route.ts src/app/api/casino/active-round/route.ts \
           src/lib/casino/wallet.ts src/lib/casino/__tests__/leaderboard.test.ts
   (NICHT stagen: src/utils/supabase/admin.ts)
3. Pre-Commit-Assert (git diff --cached --name-only):
   → assert: genau 6 Dateien gestagt
   → assert: 0 Dateien unter src/utils/supabase/admin.ts
   → assert: 0 Dateien aus C4/C5/C6/C9 (store, v2, history, leaderboard-Pages, core, security)
4. Commit:
   git commit -m "feat(api): server-authority routes for chat, seeds, community, active-round"
5. Post-Commit-Verifikation §C3.6
6. Markdown-Update §C3.7
```

### C3.5 — Mögliche Fehler & Behandlung

| #   | Fehler                                                          | Wkeit        | Auswirkung                               | Umgang                                                                                                                                                    |
| --- | --------------------------------------------------------------- | ------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | `admin.ts` EOL-Artefakt versehentlich gestagt                   | Niedrig      | Mittel — EOL-Rauschen im C3-Commit       | Explizite Pfad-Stage (kein `git add .`); Pre-Assert grep `admin.ts` muss leer sein                                                                        |
| F2  | C4-Store- oder C9-security-Hunk in `wallet.ts` enthalten        | Niedrig      | Hoch — Scope-Leak                        | wallet.ts ist nicht in R1-Hunk-Liste; Diff-Review zeigt nur C3-Methoden + prettier. Pre-Assert: staged enthält keine store/v2/history/core/security-Pfade |
| F3  | lint-staged `prettier --write` verändert C3-Dateien beim Commit | Mittel       | Niedrig — Format-Only                    | Akzeptiert; ggf. Stash-Restore-Nebenwirkung wie C1 (E5) prüfen: post-commit `git status` auf C3-Pfade leer?                                               |
| F4  | `leaderboard.test.ts` schlägt fehl (Aggregations-Logik-Fehler)  | Niedrig      | Mittel — Test-Blocker                    | Verify-Gate vor Stage; falls rot → nicht committen, Bug-Hunter                                                                                            |
| F5  | tsc schlägt fehl (C3-Code typfehlerhaft)                        | Niedrig      | Hoch — Compile-Blocker                   | Verify-Gate vor Stage; tsc working-tree muss grün                                                                                                         |
| F6  | C2-RPC-Signatur-Mismatch (z. B. `p_user_id` vs `user_id`)       | Niedrig      | Hoch — Runtime 500 in prod               | wallet.ts-Diff zeigt korrekte Param-Namen (`p_user_id`, `p_client_seed`, `p_game`, `p_limit`, `p_message`); C2-016-SQL konsistent (verifiziert in C2)     |
| F7  | Community/active-round ohne Rate-Limit → Abuse                  | Niedrig      | Niedrig — Read-Endpoints, Aggregat/State | Akzeptiert (public/low-cost); chat+seeds POST haben Limiter                                                                                               |
| F8  | dev-fallback `dev_user_fallback` in Prod aktiv                  | Sehr niedrig | Hoch                                     | V4: `NODE_ENV==='development'`-Gate verifiziert; B3 = C9-Thema, hier korrekt                                                                              |

### C3.6 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 6 Dateien, nur C3-Pfade
2. git log -1 --format=%s → "feat(api): server-authority routes for chat, seeds, community, active-round"
3. git diff --cached --stat → leer
4. assert: git show --stat HEAD | grep -E 'store/|/v2/|history/|leaderboard/page|lib/security/|supabase/admin' → 0
5. assert: git show --stat HEAD | grep 'utils/supabase/admin' → 0
6. admin.ts bleibt unstaged (EOL-Artefakt erhalten)
7. leaderboard.test.ts in HEAD enthalten
8. lint-staged-Nebenwirkung: git status --short auf 6 C3-Pfade → leer (sonst restore)
```

### C3.7 — Doku-Update (post-Commit)

- `worldmap/01-offene-commits.md`:
  - §1 Übersichtstabelle Zeile 3 (C3): Status 🔴 → 🟢 committed
  - Header-Status-Zeile: "C3 ✅ (<hash>)" ergänzen
  - §4 C3-Detail: "✅ Committed <hash>" + Scope-Realität (6 Dateien, admin.ts exkludiert als EOL-Artefakt)
- `worldmap/03_c3-c6-execution-plan.md` (diese Datei): Status-Zeile + §C3 Execution-Self-Audit (C3.8)

### C3.8 — Execution-Self-Audit (post-Execution, 2026-08-09)

**Ergebnis:** ✅ C3 committed als `5d3fc7f`, 6 Dateien, +562/−27. Punkt 3 in `01-offene-commits.md` = 🟢.

**Verifizierte Post-Commit-Asserts:**

- HEAD-Subject: `feat(api): server-authority routes for chat, seeds, community, active-round` ✓
- Cross-Block-Leak (store/v2/history/leaderboard/security/core/proxy/admin): **0** ✓
- `admin.ts` bleibt unstaged (EOL-Artefakt erhalten) ✓
- C3-Pfade post-commit sauber (keine lint-staged-Stash-Nebenwirkung, kein C1-E5-Analogon) ✓
- lint-staged eslint + typecheck + prettier alle grün (Modifikationen clean angewendet) ✓

**Was lief anders als geplant:** nichts wesentlich. admin.ts-Exklusion (EOL-Artefakt) wie im Plan entschieden; wallet.ts-prettier-Reformat wie erwartet mit-committet (kohäsiv).

**Offene Folge-Items (kein C3-Blocker):**

- O1 — C3 importiert C9-Code (`request-security`, `supabase/server`); tsc working-tree grün, aber C3-in-isolation nicht bisect-kompilierbar bis C9 committed. Akzeptiert (interleaved-C11-Strategie).
- O2 — community-GET/active-round-GET ohne Rate-Limit (public/low-cost Read). Akzeptiert.
- O3 — `leaderboard.test.ts` testet inline re-implementierte Logik (Legacy). Nicht C3-Aufgabe; C11/ Folge-Pass.

**Fazit:** C3 sauber isoliert, Security-Gate bestanden, Verify-Gates grün. Punkt 3 = 🟢 committed.

### C3-Plan-Self-Audit (vor Execution)

**F-Plan1 — `wallet.ts` prettier-Reformat (10000.00→10000.0, Wrapping) ist nicht funktional C3.** → Entscheidung: gesamte Datei in C3 (kohäsiv: Wallet-Service-Home; R1-Hunk-Split nicht gelistet; prettier-Noise harmlos). Beibehalten.
**F-Plan2 — `leaderboard.test.ts` testet inline re-implementierte Logik, nicht die echte `get_leaderboard`-RPC.** → Legacy-Test, plan-listed für C3. Beibehalten (nicht C3-Aufgabe zu refaktorisieren); nur committen.
**F-Plan3 — C3 importiert C9-Code (`@/lib/security/request-security`, `@/utils/supabase/server`).** → Cross-Block-Dep; tsc working-tree bestätigt Typ-Korrektheit. Bisect-ability sekundär (01-offene-commits.md akzeptiert interleaved C11). Kein Blocker.
**F-Plan4 — community GET ohne Auth/Rate-Limit.** → Bewusst public (Aggregat); V7/Akzeptanz. Kein Fix nötig.
**P-Plan1 — `getClientIdentifier`/`rateLimitHeaders` existieren in HEAD?** → tsc working-tree grün → Symbole resolve. OK.
**P-Plan2 — Post-commit lint-staged Nebenwirkung (C1 E5-Analogon)?** → C3.6 assert 8 prüft C3-Pfade leer; ggf. restore.
**A-Plan1 — Rollback-Notiz.** → Routes additiv; `git revert <hash>` löscht Routes + wallet-Methoden.
**A-Plan2 — Security-Gate dokumentiert.** → §C3.3 V3–V6 + inline Review-Notiz oben.

**Audit-Ergebnis:** Plan nach F-Plan1–4, P-Plan1–2, A-Plan1–2 auf Next-Level. C3 ausführbar.

---

## C4 — Store & Gamification Hydration

### C4.1 — Ziel & Definition

Ein `feat(store):`-Commit, der die Supabase-Hydration im Store (`initialize()` zieht Seeds/Community/Chat parallel zu Wallet/Stats), `syncToFile()`-No-Op, LocalStorage-`partialize` auf UI-Prefs, Gamification-Refactor (achievements-config) und die Provider/Config-Dateien fasst. H-Risiko (Wallet-Mutationen-Grenze, Hydration-Mismatch). Abhängig von C3 (Routes).

### C4.2 — Scope-Dateiliste (verifiziert via git + Diff-Analyse)

| #   | Typ | Pfad                                         | Verifikation                                                                                                                                                                      |
| --- | --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ✎   | `src/store/useCasinoStore.ts`                | +404/−297, 21 Hunks — **ganze Datei C4** (s. C4.3-Entscheidung)                                                                                                                   |
| 2   | ➕  | `src/lib/casino/achievements-config.ts`      | **untracked**, 6793 B — useCasinoStore-Dependency (Hunk 1-2 importiert `mergeAchievementsWithConfig`/`DEFAULT_ACHIEVEMENT_CONFIGS`/`applyAchievementProgress`/Typen) → MUSS in C4 |
| 3   | ✎   | `src/providers/GamificationProvider.tsx`     | M, 1492 B                                                                                                                                                                         |
| 4   | ✎   | `src/lib/casino/vip-config.ts`               | M, 2803 B                                                                                                                                                                         |
| 5   | ✎   | `src/lib/casino/vip-config-server.ts`        | M, 2761 B                                                                                                                                                                         |
| 6   | ✎   | `src/lib/casino/game-config.ts`              | M, 5275 B                                                                                                                                                                         |
| 7   | ✎   | `src/lib/casino/game-config-server.ts`       | M, 4877 B                                                                                                                                                                         |
| 8   | ✎   | `src/lib/casino/session.ts`                  | M, 972 B                                                                                                                                                                          |
| 9   | ✎   | `src/lib/casino/chat-bot.ts`                 | M                                                                                                                                                                                 |
| 10  | ✎   | `src/store/__tests__/useCasinoStore.test.ts` | M — Begleit-Test                                                                                                                                                                  |

**EXKLUDIERT:** C5 (`app/v2`, `components/v2`, `styles/v2`), C6 (history/leaderboard-Pages+Komponenten), C9 (security/core/proxy), C10 (games/casino-ui/layout/home). `src/utils/supabase/admin.ts` (EOL-Artefakt, C3-Entscheidung fortgeführt).

### C4.3 — Hunk-Split-Entscheidung (Verifikation schlägt Plan-Annahme)

`01-offene-commits.md` §4 C4 + R1 markierten `useCasinoStore.ts` als "⚠ Hunk-Split nötig (Redesign-Hunke → C10, Hydration-Hunke → C4)". **Diff-Analyse der 21 Hunks ergibt: diese Annahme trifft NICHT zu.**

- Der Diff ist ~80 % prettier-Reformatierung (Line-Wrapping, Trailing-Commas, `10000.00`→`10000.0`, `2.00`→`2.0`, `8420.50`→`8420.5`) — file-weit, nicht block-zurechenbar.
- Die funktionalen Änderungen sind **alle C4**:
  - Hunk 1-2: achievements-config-Import-Refactor (Achievement-Interface → `achievements-config.ts`)
  - Hunk 3: neue State-Felder `achievementConfigs`/`currentWinStreak` (Gamification)
  - Hunk 11: `syncToFile: () => {}` No-Op (B5 ✓) + `processGameResult`-Reformatierung
  - Hunk 14-16: `addBet`/`addCrashHistory` veraltete Duplikat-Achievement-Logik entfernt (→ `processGameResult`, Ref `06_ACHIEVEMENTS_CONDITION_ENGINE.md` F4/F5)
  - Hunk 15: `initialize()` erweitert — parallel-fetch `/api/casino/seeds`+`/api/community`+`/api/chat` (C3-Routes) + HTML-Response-Guards (C4-Hydration ✓, B4 via `communityRes` → `communityWagered` from RPC)
  - Hunk 19: `partialize` exkludiert `achievementConfigs` (C4-Partialize ✓)
- Es existiert **kein C10-visueller-Redesign-Content** in einem Zustands-Store (Store trägt keine visuellen Hunke). Neue Felder sind Gamification (C4), nicht C10-UI.

**Entscheidung:** Ganze `useCasinoStore.ts` in C4 (kein `git add -p`-Split). Begründet durch verifizierte Realität, nicht Plan-Annahme. Reduziert H-Risiko (kein Hunk-Misclassification-Fehler in nicht-interaktiver Umgebung). C10 committet später seine eigenen Dateien; useCasinoStore dort schlicht nicht mehr berührt.

### C4.4 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                                                                                                             | Status                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| V1  | C3 Routes live/committed (`/api/casino/seeds`, `/api/community`, `/api/chat`)                                                             | ✅ C3 `5d3fc7f`                                                    |
| V2  | `achievements-config.ts` existiert + useCasinoStore-Importe resolve                                                                       | ✅ untracked im Working-Tree, tsc grün                             |
| V3  | `syncToFile` → No-Op, kein `/api/local/state`-Fetch mehr                                                                                  | ✅ Hunk 11 verifiziert                                             |
| V4  | `partialize` persistiert nur UI-Prefs (balance/xp/level/rank/achievements ausgeschlossen)                                                 | ✅ Hunk 19 verifiziert (achievementConfigs ergänzt)                |
| V5  | `communityWagered` via RPC (B4) — Initial-Default `8420.5` bleibt als Pre-Hydration-Platzhalter, `initialize()` überschreibt mit RPC-Wert | ✅ Hunk 15 verifiziert (funktional erfüllt)                        |
| V6  | Balance-Mutation nur via `processGameResult`/RPC (kein direkter `addBalance`/`removeBalance`-Write in prod)                               | ✅ `addBalance`/`removeBalance` = toast/return-false (fail-closed) |
| V7  | tsc working-tree grün + store-Test grün                                                                                                   | ⏳ Verify-Gate                                                     |
| V8  | C4-Dateien nicht in R1-Hunk-Split-Liste (außer useCasinoStore → C4.3 gelöst)                                                              | ✅                                                                 |

### C4.5 — Workflow (Execution)

```
1. Verify-Gates:
   a. tsc --noEmit → 0 Fehler (working tree incl. achievements-config.ts)
   b. npx vitest run src/store/__tests__/useCasinoStore.test.ts → grün
   c. npm run vibe-check → Balance-Integrität ok
2. Staging (explizite Pfade, kein `git add .`):
   git add src/store/useCasinoStore.ts src/lib/casino/achievements-config.ts \
           src/providers/GamificationProvider.tsx \
           src/lib/casino/vip-config.ts src/lib/casino/vip-config-server.ts \
           src/lib/casino/game-config.ts src/lib/casino/game-config-server.ts \
           src/lib/casino/session.ts src/lib/casino/chat-bot.ts \
           src/store/__tests__/useCasinoStore.test.ts
3. Pre-Commit-Assert:
   → 10 Dateien gestagt
   → 0 C5/C6/C9/C10-Pfade (v2, history, leaderboard-Pages, security, core, games, casino-ui, layout, home, globals.css)
   → admin.ts NICHT gestagt
4. Commit:
   git commit -m "feat(store): supabase hydration for seeds, community, chat; remove syncToFile; refactor achievements-config"
5. Post-Commit-Verifikation §C4.7
6. Markdown-Update §C4.8
```

### C4.6 — Mögliche Fehler & Behandlung

| #   | Fehler                                                                                             | Wkeit   | Auswirkung        | Umgang                                                                                             |
| --- | -------------------------------------------------------------------------------------------------- | ------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| F1  | `achievements-config.ts` vergessen → C4-in-isolation tsc-Bruch                                     | Mittel  | Hoch              | C4.2-Liste enthält es explizit; Pre-Assert grep `achievements-config` in staged                    |
| F2  | C10-Hunk (z. B. HomeClientV2/layout/globals.css) versehentlich gestagt                             | Niedrig | Hoch — Scope-Leak | Explizite Pfad-Stage; Pre-Assert grep Cross-Block-Pfade                                            |
| F3  | lint-staged `prettier --write` auf 10 Dateien → Format-Shift + Stash-Nebenwirkung (C1-E5-Analogon) | Mittel  | Niedrig-Mittel    | Pre-Assert + post-commit `git status` auf C4-Pfade leer; ggf. restore                              |
| F4  | store-Test rot (Hydration-Mock kaputt)                                                             | Mittel  | Hoch              | Verify-Gate vor Stage; falls rot → Bug-Hunter, nicht committen                                     |
| F5  | GamificationProvider importiert C5/C10-Komponente (Cross-Dep)                                      | Niedrig | Niedrig (bisect)  | tsc working-tree grün → resolve; akzeptiert (interleaved-Strategie)                                |
| F6  | `communityWagered: 8420.5`-Default bleibt (B4-Streit)                                              | —       | Niedrig           | Funktional erfüllt (RPC überschreibt in initialize); Default-Cleanup = Folge-Pass, kein C4-Blocker |
| F7  | `Math.random` in `startActivitySimulator`/`addChatMessage` (AGENTS-Regel: nur ProvablyFairEngine)  | —       | Niedrig           | Simulatoren/UI-IDs, keine Spiellogik → akzeptiert (nicht C4-Thema, nicht RNG-Spielentscheidung)    |
| F8  | tsc schlägt fehl (z. B. achievements-config-Typ-Mismatch)                                          | Niedrig | Hoch              | Verify-Gate; working-tree-tsc muss grün                                                            |

### C4.7 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 10 Dateien, nur C4-Pfade
2. git log -1 --format=%s → "feat(store): supabase hydration ...; remove syncToFile; refactor achievements-config"
3. assert: git show --name-only HEAD | grep -E '/v2/|app/history/|app/leaderboard/|components/history/|components/leaderboard/|lib/security/|provably-fair|casino-core|proxy.ts|games/|casino/|layout|home/|globals.css|utils/supabase/admin' → 0
4. assert: achievements-config.ts in HEAD
5. admin.ts bleibt unstaged
6. C4-Pfade post-commit sauber (lint-staged-Nebenwirkung?)
```

### C4.8 — Doku-Update (post-Commit)

- `worldmap/01-offene-commits.md` §1 Zeile 4 (C4): 🔴 → 🟢 committed; Header-Status "C4 ✅ (<hash>)"
- `01-offene-commits.md` §4 C4-Detail: "✅ Committed <hash>" + Scope-Realität (10 Dateien, achievements-config-Entdeckung, Hunk-Split-Override C4.3)
- `worldmap/03_c3-c6-execution-plan.md` Status-Zeile + §C4.9 Execution-Self-Audit

### C4.9 — Execution-Self-Audit (post-Execution, 2026-08-09)

**Ergebnis:** ✅ C4 committed als `d825c4b`, 9 Dateien, +1045/−438. Punkt 4 in `01-offene-commits.md` = 🟢.

**Verifizierte Post-Commit-Asserts:**

- HEAD-Subject: `feat(store): supabase hydration …; remove syncToFile; refactor achievements-config` ✓
- Cross-Block-Leak (v2/history/leaderboard/security/core/proxy/games/casino-ui/layout/home/globals/admin/session): **0** ✓
- `achievements-config.ts` in HEAD (create mode) ✓
- C4-Pfade post-commit sauber (keine lint-staged-Nebenwirkung) ✓
- lint-staged eslint + typecheck + prettier grün ✓
- `admin.ts`/`session.ts` EOL-Artefakte nicht committet ✓

**Was lief anders als geplant:**

- E1 — `session.ts` ebenfalls EOL/stat-only-Artefakt (wie `admin.ts`) → exkludiert; Plan hatte 10 Dateien, committed 9.
- E2 — Index enthielt pre-stagte Docs (`worldmap/05_1.1`, `05_ZUKUNFTSPLANUNG`, `06_…` D, `docs/archive/DB_ROLLOUT_PLAN`) aus früherer Session → via `git reset` sauber unstaged, isoliert C4. Pre-Assert fing DB_ROLLOUT_PLAN auf.
- E3 — `achievements-config.ts` als C4-Pflicht-Datei entdeckt (nicht im Original-Plan) → C4.3/§4-Doku ergänzt.
- E4 — Hunk-Split-Annahme (R1) für useCasinoStore widerlegt (C4.3) → ganze Datei C4 statt `git add -p`.

**Offene Folge-Items (kein C4-Blocker):**

- O1 — `communityWagered: 8420.5`-Default-Cleanup (funktional durch RPC überschrieben) → Folge-Pass.
- O2 — `Math.random` in `startActivitySimulator`/`addChatMessage`-IDs (UI/Simulator, keine Spiellogik) → akzeptiert, nicht C4.
- O3 — C4 importiert C5/C10 uncommitted Code ggf. (GamificationProvider) → tsc working-tree grün; bisect sekundär (interleaved-Strategie).

**Fazit:** C4 sauber isoliert (9 Dateien), H-Risiko beherrscht (Hunk-Split-Annahme verifiziert widerlegt → whole-file statt riskantem Split), Security-Gate bestanden (keine direkten Wallet-Writes), Verify-Gates grün. Punkt 4 = 🟢 committed.

### C4-Plan-Self-Audit (vor Execution)

**F-Plan1 — achievements-config.ts im 017-Block statt C4?** → useCasinoStore importiert/es nutzt es LIVE (nicht hinter Feature-Flag); 017 = DB-Migration (SQL) für DB-driven Definitions, TS-Config = aktuelle Implementierung → C4. Beibehalten.
**F-Plan2 — Ganze useCasinoStore-Datei statt Hunk-Split — verletzt Block-Isolation?** → C4.3: verifiziert kein C10-Content im Store; prettier-Noise nicht block-zurechenbar. Split in nicht-interaktiv unmöglich ohne hohes Misclassification-Risiko. Whole-file ist die korrekte, risikoärmere Entscheidung.
**F-Plan3 — GamificationProvider/Config-Dateien könnten C10-Content mischen?** → R1 listet nur 4 Hunk-Split-Dateien, keine C4-Datei außer useCasinoStore. Diff-stat-Check folgt in Verify. Vertraue R1 + tsc.
**F-Plan4 — `8420.5`-Default verletzt B4 wörtlich ("Hardcode entfernen")?** → Funktional: initialize() setzt RPC-Wert; Default = transienter Platzhalter. Wörtlich: Default nicht entfernt. Entscheidung: funktional erfüllt, Default-Cleanup als O-Item notiert (kein Blocker, da RPC autoritativ).
**P-Plan1 — Vibe-Check für C4?** → Plan §C4 Verifizierung listet es; C4 touchiert keine Auszahlungsmathematik, aber Store-Hooks → laufen für Safety.
**P-Plan2 — Full test suite vs nur store-Test?** → Store-Test + tsc + vibe-check als Gate; full suite optional (C11-Strategie interleaved).
**A-Plan1 — Rollback-Notiz.** → `git revert <hash>`; Store fällt auf lokalen Zustand (fail-closed), achievements-config.ts wird gelöscht (Revert) → useCasinoStore-Import bricht → Revert muss ganze C4 erfassen (tut es, da ein Commit).
**A-Plan2 — Security-Gate inline.** → V6: addBalance/removeBalance fail-closed; keine direkten Wallet-Writes; initialize() liest nur (GET-Routes); community/chat-POST außerhalb Store. Keine Wallet-Mutation im Store-Code. Kein CRITICAL/HIGH.

**Audit-Ergebnis:** Plan nach F-Plan1–4, P-Plan1–2, A-Plan1–2 auf Next-Level. C4 ausführbar.

---

## C5 — Frontend v2 Sandbox (Cyber-Stealth)

### C5.1 — Ziel & Definition

Ein `feat(v2):`-Commit für das isolierte `/v2`-Design-Sandbox (`app/v2`, `components/v2`, `styles/v2.css`) + 7 additive Main-Lobby-Showcase-Komponenten + 2 Bilder. N-Risiko, isoliert (keine produktiven Routen-Modifikationen). Wiring der Showcase-Komponenten in `HomeClientV2` = C10 (nicht C5).

### C5.2 — Scope-Dateiliste (verifiziert, 24 Dateien, alle untracked)

| Gruppe        | Pfad                                                                                                                                                                                        | Count |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `/v2` routes  | `src/app/v2/{layout,page}.tsx`                                                                                                                                                              | 2     |
| v2 components | `src/components/v2/{index,v2-data,V2Chip,V2GameTabs,V2Header,V2Hero,V2Home,V2PromoBento,V2PromoCard,V2RebateWidget,V2Sidebar,V2WheelArt}.tsx(.ts)`                                          | 12    |
| v2 stylesheet | `src/styles/v2.css`                                                                                                                                                                         | 1     |
| showcase      | `src/components/home/{HeroCinematicShowcase,InteractiveArcadeGrid,ProgressiveJackpotSection,VipProgressTeaser,LobbyAmbientBackground,DailyTournamentTeaser,WebGlWaterRefractionCanvas}.tsx` | 7     |
| images        | `public/images/{hero_vip_artwork.jpg,vault-playnow-bg.webp}`                                                                                                                                | 2     |

**EXKLUDIERT:**

- `src/app/globals.css` (58 Hunks = C6/C10-Redesign-Tokens; **v2-Tokens bestätigt NICHT in globals.css** — `styles/v2.css` ist self-scoped unter `.v2-root` mit `--v2-*`-Tokens, Header: "Do not reference --primary/--bg-color, nothing leaks into live system") → C5 berührt globals.css **nicht**, Hunk-Split erübrigt sich.
- `src/components/home/{HeroSection,HeroSectionV2,HomeClientV2,index}.tsx` (modified → C10, das Wiring der Showcase-Komponenten).
- C4/C6/C9-Dateien.

### C5.3 — Hunk-Split-Entscheidung (erübrigt)

Plan §C5 markierte `globals.css` als "⚠ Hunk-Split nötig (v2-Tokens hier?)". **Verifiktion: v2-Tokens sind in `src/styles/v2.css` self-scoped (`.v2-root`-Namespace, `--v2-*`), NICHT in `globals.css`.** v2-Components/Routes importieren globals.css nicht. → C5 = ausschließlich untracked NEW-Files, **0 Hunk-Split, 0 Modifications**. Sauberster Block der Serie.

### C5.4 — Showcase-Komponenten: C5 vs C10 (Klärung)

7 Showcase-Komponenten klingen nach Main-Lobby (Jackpot/VIP/Tournament/Arcade), nicht /v2. Import-Analyse: nutzen nur committed Deps (`@/components/ui/Magnetic`, `@/lib/casino/sound-manager`, framer-motion, lucide, next/image) + einander (HeroCinematicShowcase→WebGlWaterRefractionCanvas). KEINE /v2- oder v2.css-Imports, KEINE modified-main-home-Imports. → **Additive NEW-Files**, productive-Routen-Modifikation (Wiring) erfolgt in C10 (`HomeClientV2`-Mod). Plan §C5 listet sie unter C5 → hier committet. Begründet: als reine NEW-Files clean in C5, kein Loose-End.

### C5.5 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                      | Status                                                                                                                                   |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | `/v2` nicht in Sitemap/Produktion deklariert (B6)  | ✅ `v2/layout.tsx` metadata `robots: {index:false, follow:false}` + ClientShell rendert /v2 ohne Shell (WIP)                             |
| V2  | v2.css self-scoped, kein Leak in Live-System       | ✅ Header-Kommentar + `.v2-root`-Namespace + `--v2-*`-Tokens                                                                             |
| V3  | metadata-Export in `v2/layout.tsx` (DevOps-Slayer) | ✅ verifiziert                                                                                                                           |
| V4  | WebGL-Canvas graceful Fallback (R2)                | ⏳ visuell (Jan) — Code: WebGlWaterRefractionCanvas nutzt `useRef`/`useEffect`, Feature-Detect in Component                              |
| V5  | Bundle: WebGL dynamisch importieren (R3)           | VipProgressTeaser nutzt `next/dynamic` ✅; WebGlWaterRefractionCanvas direkt importiert (HeroCinematicShowcase) — ggf. Folge-Optimierung |
| V6  | tsc + build grün                                   | ⏳ build läuft (background), tsc-Baseline grün                                                                                           |

### C5.6 — Workflow (Execution)

```
1. Verify-Gates:
   a. tsc --noEmit → 0 Fehler (baseline, /v2 inkludiert)
   b. npm run build → kein Build-Bruch durch /v2 (metadata, RSC, Routen)
2. Staging (explizite Pfade/Dirs, kein `git add .`):
   git add src/app/v2/ src/components/v2/ src/styles/v2.css \
           src/components/home/HeroCinematicShowcase.tsx src/components/home/InteractiveArcadeGrid.tsx \
           src/components/home/ProgressiveJackpotSection.tsx src/components/home/VipProgressTeaser.tsx \
           src/components/home/LobbyAmbientBackground.tsx src/components/home/DailyTournamentTeaser.tsx \
           src/components/home/WebGlWaterRefractionCanvas.tsx \
           public/images/hero_vip_artwork.jpg public/images/vault-playnow-bg.webp
3. Pre-Commit-Assert:
   → 24 Dateien gestagt
   → 0 Modified-Files (alle untracked neu)
   → globals.css NICHT gestagt
   → 4 modified home-Files (HeroSection/HeroSectionV2/HomeClientV2/index) NICHT gestagt
   → 0 C4/C6/C9-Pfade
4. Commit:
   git commit -m "feat(v2): cyber-stealth design sandbox (app/v2, components/v2, hero showcase, WebGL)"
5. Post-Commit-Verifikation §C5.8
6. Markdown-Update §C5.9
```

### C5.7 — Mögliche Fehler & Behandlung

| #   | Fehler                                              | Wkeit          | Auswirkung                 | Umgang                                                                      |
| --- | --------------------------------------------------- | -------------- | -------------------------- | --------------------------------------------------------------------------- |
| F1  | globals.css versehentlich gestagt (58 Hunks)        | Niedrig        | Hoch — C6/C10-Tokens in C5 | Explizite Pfad-Stage (kein `git add .`); Pre-Assert grep `globals.css` leer |
| F2  | 4 modified home-Files (C10) versehentlich gestagt   | Niedrig        | Hoch — C10-Mod in C5       | Explizite Stage nur der 7 NEW-Komponenten; Pre-Assert grep `HeroSection     | HomeClientV2 | home/index` leer |
| F3  | Build bricht durch /v2 (metadata/RSC/Fehler)        | Niedrig-Mittel | Hoch — Build-Blocker       | Verify-Gate build vor Commit; tsc-Baseline schon grün                       |
| F4  | lint-staged prettier auf 24 Dateien → Format-Shift  | Mittel         | Niedrig                    | Pre/post `git status` C5-Pfade; ggf. restore                                |
| F5  | `next/dynamic`-Import inkorrekt (VipProgressTeaser) | Niedrig        | Mittel                     | tsc/build fängt                                                             |
| F6  | Bildgröße vs. gerenderte Größe (Performance R1)     | Niedrig        | Niedrig                    | Akzeptiert für Showcase; Jan visuell                                        |
| F7  | `/v2` route fälschlich indexiert                    | Sehr niedrig   | Mittel                     | V1: robots noindex verifiziert                                              |

### C5.8 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 24 Dateien, nur C5-Pfade
2. git log -1 --format=%s → "feat(v2): cyber-stealth design sandbox ..."
3. assert: 0 modified-Files in HEAD (alle create mode) — C5 = reine NEW-Files
4. assert: globals.css NOT in HEAD; 4 modified home-Files NOT in HEAD
5. assert: 0 C4/C6/C9 cross-block
6. C5-Pfade post-commit sauber
```

### C5.9 — Doku-Update (post-Commit)

- `01-offene-commits.md` §1 Zeile 5 (C5): 🔴 → 🟢; Header "C5 ✅ (<hash>)"
- `01-offene-commits.md` §4 C5-Detail: "✅ Committed <hash>" + Scope-Realität (24 NEW-Files, globals.css-v2-Tokens-Discovery C5.3, Showcase-C5-vs-C10-Klärung C5.4)
- `worldmap/03_c3-c6-execution-plan.md` Status-Zeile + §C5.10 Execution-Self-Audit

### C5.10 — Execution-Self-Audit (post-Execution)

_wird nach Execution ausgefüllt_

### C5-Plan-Self-Audit (vor Execution)

**F-Plan1 — 7 Showcase-Komponenten eher C10 als C5?** → C5.4: Import-Analyse zeigt keine /v2-Deps, additive NEW-Files. Plan listet sie in C5. Als NEW-Files clean; Wiring = C10. Beibehalten in C5 (vermeidet Loose-End, folgt Plan).
**F-Plan2 — `WebGlWaterRefractionCanvas` direkt importiert (nicht dynamic) — V5/R3-Verletzung?** → HeroCinematicShowcase importiert es direkt. Performance-Regel empfiehlt dynamic für schweres WebGL. Entscheidung: akzeptiert für C5 (Sandbox/Showcase, nicht produktive kritische Path); dynamischer Import = Folge-Optimierung (O-Item). Kein C5-Blocker.
**F-Plan3 — globals.css wirklich frei von v2-Tokens?** → C5.2/C5.3: v2.css-Header + `.v2-root`-Namespace + `--v2-*`-Prefixe verifiziert; v2-Components importieren globals.css nicht (grep leer). robust.
**F-Plan4 — Build als Gate nötig (tsc schon grün)?** → Build fängt Next.js-spezifische (metadata-Validierung, RSC-Boundary, Routen-Kompilierung), die tsc übersieht. Weltklasse → build als C5-Gate.
**P-Plan1 — whileHover/whileTap (Design-Guardian) auf v2/Showcase?** → Visuell/Design-Guardian-Gate; nicht tsc-prüfbar. Jan prüft visuell (Memory-Regel: Claude bewertet nicht visuell). Code-Review: V2-/Showcase-Komponenten nutzen framer-motion `motion.*` → whileHover/whileTap prüfbar via grep im Folge-Pass.
**P-Plan2 — `v2-data.ts` (Komponenten-Daten) — C5-sauber?** → untracked NEW-File unter components/v2 → C5. Ja.
**A-Plan1 — Rollback.** → `git revert <hash>`; alle 24 NEW-Files werden gelöscht (Revert); keine produktive Route berührt → sicher.
**A-Plan2 — `/v2` WIP-Status dokumentieren.** → B6: ClientShell rendert /v2 ohne Shell (intentional WIP); robots noindex. In §4-Doku festhalten.

**Audit-Ergebnis:** Plan nach F-Plan1–4, P-Plan1–2, A-Plan1–2 auf Next-Level. C5 ausführbar (sauberster Block: 24 NEW-Files, 0 Hunk-Split).

### C5.10 — Execution-Self-Audit (post-Execution)

**Verify-Gates:**

- `npm run build` → exit 0 (background task `b70jcyyis`), kein Build-Bruch durch `/v2`. ✅
- tsc-Baseline → grün (vor C5 schon bestätigt, /v2 inkludiert). ✅
- `/v2/layout.tsx` metadata `robots:{index:false,follow:false}` (B6). ✅

**Staging-Assert:**

- 24 Dateien gestagt, `git diff --cached --name-only | wc -l` = 24. ✅
- 0 excluded: grep `globals.css|HeroSection|HeroSectionV2|HomeClientV2|home/index` leer. ✅
- 0 cross-block: grep `lib/casino/wallet|useCasinoStore|api/casino|api/chat|api/community|Gamification` leer. ✅

**Commit:** `06f364d` — `feat(v2): cyber-stealth design sandbox (...)`, 24 files changed, +3830 insertions, alle `create mode 100644`.

**Post-Commit-Verifikation:**

- `git show --name-status HEAD` → 0 `M`-Zeilen (alle NEW-Files, keine Modification). ✅
- `git show --name-only HEAD | grep globals.css|HeroSection|HomeClientV2|home/index` → leer. ✅
- HEAD `git log -1 --format=%s` = erwartete Message. ✅

**Abweichungen Plan ↔ Execution:**

- `globals.css`-Hunk-Split entfiel (Plan §C5.2/C5.3 vorausgesehen, verifiziert): v2-Tokens in `src/styles/v2.css` self-scoped, nicht in `globals.css`. → sauberster möglicher Block (0 Hunk-Split, 0 Modifications).
- `docs/prototypes/*.html` (Plan §C5.2 als optional gelistet) nicht vorhanden → entfallen, kein Effekt.
- 7 Showcase-Komponenten wie geplant in C5 (additive NEW-Files, kein Loose-End).

**Next-Level-Verbleib (kein C5-Blocker, Folge-Items):**

- O1 — `WebGlWaterRefractionCanvas` direkt importiert in `HeroCinematicShowcase` (V5/R3): dynamischer Import = Folge-Optimierung (Showcase/Sandbox, nicht kritischer produktiver Path).
- O2 — whileHover/whileTap-Design-Guardian-Grep über v2/Showcase-Komponenten (visuell Jan, Code-Review-Folge-Pass).

**Audit-Ergebnis Execution:** C5 vollumfänglich committed & verifiziert. Sauberster Block der C3–C6-Serie. Keine offenen C5-Blocker. → C6 starten.

---

## C6 — History & Leaderboard Modularisierung

### C6.1 — Ziel & Definition

Ein `refactor(history,leaderboard):`-Commit, der die 685-Zeilen-`/history`- und 1.060-Zeilen-`/leaderboard`-Pages in presentationale Komponenten zerlegt (Kohorten 2–3 aus `02_FRONTEND_REDESIGN.md`). Container (`page.tsx`) lädt Daten + reicht Props; Komponenten rendern rein. Keine Logik-Veränderung, keine Design-Token-Änderung, kein globals.css-Kontakt.

### C6.2 — Scope-Dateiliste (verifiziert, 10 Dateien)

| Gruppe                 | Pfad                                                                                           | Status        | Diff                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------- |
| history components     | `src/components/history/{HistoryStatsCard,HistoryFilterBar,HistoryTableStream}.tsx`            | untracked NEW | ➕                                                    |
| leaderboard components | `src/components/leaderboard/{LeaderboardHeroStats,LeaderboardStreamTable,PersonalRankBar}.tsx` | untracked NEW | ➕                                                    |
| history page           | `src/app/history/page.tsx`                                                                     | modified      | −267/+99 (Inline → Komponenten-Imports)               |
| history layout         | `src/app/history/layout.tsx`                                                                   | modified      | −3/+3 (Prettier: description-wrap, function-collapse) |
| leaderboard page       | `src/app/leaderboard/page.tsx`                                                                 | modified      | −401/+76 (Inline → Komponenten-Imports)               |
| leaderboard layout     | `src/app/leaderboard/layout.tsx`                                                               | modified      | −3/+3 (Prettier)                                      |

**EXKLUDIERT:** `globals.css` (C6/C10-Redesign-Tokens, uncommitted), C7 Slots-Assets, C9 Security, C10 Game-UI-Polish. Keine C6-Datei berührt diese.

### C6.3 — Hunk-Split-Entscheidung (entfällt)

Plan §C6 markierte `page.tsx`-Rews als potentielles Hunk-Split-Risiko (R1). **Verifiktion:** Sämtliche Hunke der 4 modified Files sind reines C6 (Komponenten-Extraktion) bzw. Prettier-Formatierung. `grep` nach `--primary|--bg-color|backdrop-filter|globals.css` in den Diffs: Treffer ausschließlich in **gelöschten** Inline-Zeilen (Code, der in die neuen Komponenten verschoben wird) — keine **neuen** Tokens, kein globals.css-Bezug. → **0 Hunk-Split**; ganze Dateien committbar.

### C6.4 — Container/Presentational-Split (verifiziert)

- **Container** (`page.tsx`): importiert `useCasinoStore`, `useSupabaseSession` (leaderboard), lädt Daten, reicht Props.
- **Presentational** (6 Komponenten): importieren **nur** `react`, `lucide-react`, `framer-motion`. Kein `@/store`, kein `@/components/auth`, kein `@/lib`. → Clean Split per Web-Patterns-Regel.
- **Export-Vertrag:** `HistoryRow` (Interface, aus `HistoryTableStream`), `LeaderRow` (aus `LeaderboardStreamTable`), 6 Komponenten — matching den Page-Imports.

### C6.5 — Abhängigkeiten & Voraussetzungen

| #   | Voraussetzung                                   | Status                                                                        |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| V1  | Komponenten kompilieren (tsc)                   | ✅ tsc-Baseline grün (C5-Gate inkludierte C6-Baum)                            |
| V2  | Build grün (Refactored Pages kompilieren)       | ✅ `npm run build` exit 0 (task b70jcyyis) — C6-Dateien waren im Working-Tree |
| V3  | Kein C10/Token-Leak in modified Files           | ✅ C6.3 grep verifiziert (nur Deletes)                                        |
| V4  | Keine Logik-Veränderung (reine Extraktion)      | ✅ Diff: große Deletes, kleine Adds = Extraktion                              |
| V5  | metadata in layout.tsx erhalten (DevOps-Slayer) | ✅ description in beiden layouts vorhanden (nur formatiert)                   |

### C6.6 — Workflow (Execution)

```
1. Verify-Gates (bereits erfüllt durch C5-Build, der C6-Baum kompilierte):
   a. tsc-Baseline grün
   b. npm run build exit 0
2. Staging (explizite Pfade, kein `git add .`):
   git add src/components/history/ src/components/leaderboard/ \
           src/app/history/page.tsx src/app/history/layout.tsx \
           src/app/leaderboard/page.tsx src/app/leaderboard/layout.tsx
3. Pre-Commit-Assert:
   → 10 Dateien gestagt
   → 6 NEW (create mode) + 4 modified
   → globals.css NICHT gestagt
   → 0 C3/C4/C5/C7/C9/C10 cross-block
   → keine pre-staged docs/ (C4-Lektion)
4. Commit:
   git commit -m "refactor(history,leaderboard): modularize pages into presentational components"
5. Post-Commit-Verifikation §C6.8
6. Markdown-Update §C6.9
```

### C6.7 — Mögliche Fehler & Behandlung

| #   | Fehler                                               | Wkeit        | Auswirkung             | Umgang                                                                                                     |
| --- | ---------------------------------------------------- | ------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| F1  | globals.css versehentlich gestagt                    | Sehr niedrig | Hoch — C10-Token in C6 | Explizite Pfad-Stage; Pre-Assert grep `globals.css` leer                                                   |
| F2  | C7/C9/C10-Dateien im Stage landen                    | Niedrig      | Hoch — cross-block     | Explizite Stage nur 10 C6-Pfade; Pre-Assert cross-block grep                                               |
| F3  | Refactor bricht Page (Runtime-Prop-Mismatch)         | Niedrig      | Hoch                   | Build-Gate (V2) kompiliert Refactored Pages; tsc fängt Typ-Bruch                                           |
| F4  | lint-staged Prettier auf 10 Dateien → Format-Shift   | Mittel       | Niedrig                | Pre/post `git status` C6-Pfade; ggf. restore                                                               |
| F5  | pre-staged docs/worldmap aus Vor-Session im Index    | Niedrig      | Mittel                 | Pre-Assert: `git diff --cached --name-only` auf unerwartete Pfade; `git reset` wie C4-Lektion              |
| F6  | Visuelle Regression (Komponenten-Rendering ≠ Inline) | Mittel       | Mittel                 | Memory-Regel: Jan prüft visuell, Claude nicht. Code-Äquivalenz via Diff (Extraktion, keine Logik-Änderung) |

### C6.8 — Post-Commit-Verifikation

```
1. git show --stat HEAD → 10 Dateien (6 create + 4 modify), nur C6-Pfade
2. git log -1 --format=%s → "refactor(history,leaderboard): modularize ..."
3. assert: globals.css NOT in HEAD
4. assert: 0 C3/C4/C5/C7/C9/C10 cross-block in HEAD
5. C6-Pfade post-commit sauber (keine Rest-Änderungen außer prettier-shift)
6. git status → globals.css + C7/C10-Dateien weiterhin uncommitted (erwartet)
```

### C6.9 — Doku-Update (post-Commit)

- `01-offene-commits.md` §1 Zeile 6 (C6): 🔴 → 🟢; Header "C6 ✅ (<hash>)"
- `01-offene-commits.md` §4 C6-Detail: "✅ Committed <hash>" + Scope-Realität (10 Dateien, Hunk-Split entfällt C6.3, Container/Presentational-Split C6.4, build-Gate via C5-Build erfüllt)
- `worldmap/03_c3-c6-execution-plan.md` Status-Zeile + §C6.10 Execution-Self-Audit

### C6.10 — Execution-Self-Audit (post-Execution)

_wird nach Execution ausgefüllt_

### C6-Plan-Self-Audit (vor Execution)

**F-Plan1 — Sind die 4 modified app-Files wirklich C6-only (kein C10-Redesign versteckt)?** → C6.3: grep auf Design-Tokens in Diffs trifft nur gelöschte Inline-Zeilen (Code-Verschiebung in Komponenten). Diff-Stat (−668/+175 über 2 Pages) = Extraktion, nicht Redesign. Keine Additions mit neuen Tokens. robust.
**F-Plan2 — layout.tsx-Diffs (9 Zeilen) = C6 oder Prettier-Artefakt?** → C6.2/C6.3: reine Prettier-Formatierung (description-Zeilenumbruch, Function-Signatur-Kollaps). Keine Semantik-Änderung. Als C6-Begleiter committbar (gehört zum Modularisierungs-Commit-Kontext). Alternativ: ausschließen → würde isolierte EOL/prettier-Änderung hinterlassen (Loose-End). Entscheidung: in C6 committen (zusammenhängend).
**F-Plan3 — Komponenten importieren keine uncommitteden Deps (C7/C9/C10)?** → C6.4: nur `react`, `lucide-react`, `framer-motion` — alle committed. Kein `@/store`/`@/lib`/`@/components/auth` in Komponenten. robust.
**F-Plan4 — Build-Gate "via C5-Build erfüllt" — valide Annahme?** → C5-Build (b70jcyyis, exit 0) kompilierte den vollen Working-Tree inkl. der 6 untracked C6-Komponenten + 4 modified Pages. Next.js kompiliert untracked .tsx in src/. → C6-Baum build-verifiziert. Zusätzlich tsc-Baseline grün. Weltklasse-Gate erfüllt.
**F-Plan5 — `HistoryRow`/`LeaderRow` Interface-Export — C6-sauber?** → aus `HistoryTableStream`/`LeaderboardStreamTable` exportiert, von Pages importiert. Interface = reine Typ-Definition (kein Runtime-Code). C6. ✓.
**P-Plan1 — whileHover/whileTap in Komponenten?** → Komponenten nutzen `framer-motion` (`motion.*`). Visuell/Design-Guardian-Gate; Jan prüft visuell (Memory-Regel). Code-Review-Folge-Pass (wie C5 O2).
**P-Plan2 — metadata erhalten (DevOps-Slayer)?** → C6.5 V5: description in beiden layouts vorhanden (nur formatiert, nicht entfernt). ✓.
**A-Plan1 — Rollback.** → `git revert <hash>`; 6 NEW-Files gelöscht, 4 Pages auf Inline zurückgesetzt. Keine produktive Logik/DB/Wallet-Berührung → sicher.
**A-Plan2 — Loose-End-Vermeidung.** → layout.tsx-Prettier in C6 (nicht isoliert) vermeidet EOL-Artefakt-Loose-End (C3/C4-Lektion: admin.ts/session.ts EOL-only ausgeschlossen).

**Audit-Ergebnis:** Plan nach F-Plan1–5, P-Plan1–2, A-Plan1–2 auf Next-Level. C6 ausführbar (10 Dateien, 0 Hunk-Split, 0 Cross-Block, Build-Gate via C5 erfüllt). Sauberster Modularisierungs-Block.

### C6.10 — Execution-Self-Audit (post-Execution)

**Verify-Gates:**

- `npm run build` → exit 0 (task `b70jcyyis` kompilierte C6-Baum: 6 untracked Komponenten + 4 modified Pages). ✅
- tsc-Baseline → grün. ✅
- lint-staged: eslint --fix ✓, typecheck-staged.mjs ✓, prettier --write (10 Dateien) ✓. ✅

**Staging-Assert:**

- 10 Dateien gestagt (`wc -l` = 10). ✅
- 0 cross-block: grep `globals.css|components/casino|lib/casino|store/|api/casino|app/v2|components/v2|styles/v2|components/home/` leer. ✅
- 0 docs/worldmap sneak-in: grep `^docs/|^worldmap/|^supabase/` leer (C4-Lektion beherzigt). ✅

**Commit:** `ca156f3` — `refactor(history,leaderboard): modularize pages into presentational components`, 10 files, +940/−668, 6 `create mode 100644` + 4 `M`.

**Post-Commit-Verifikation:**

- `git show --name-status HEAD` → 4 `M` (history/layout, history/page, leaderboard/layout, leaderboard/page) + 6 `A` (Komponenten). ✅
- `git show --name-only HEAD | grep globals.css|cross-block` → leer. ✅
- `git status` → `globals.css` weiterhin ` M` uncommitted (C10, erwartet). ✅
- HEAD-Message = erwartete. ✅

**Abweichungen Plan ↔ Execution:**

- Hunk-Split entfiel wie in C6.3 vorhergesehen (verifiziert, nicht nur angenommen).
- layout.tsx-Prettier-Änderungen in C6 committet (A-Plan2: Loose-End-Vermeidung), nicht isoliert.
- Commit-Message im Plan hieß `"...stealth-terminal components"`, committed als `"...presentational components"` — semantisch präziser (Container/Presentational-Pattern, nicht "stealth-terminal" was C5/Cyber-Stealth-Vokabular ist). Keine Scope-Abweichung.

**Next-Level-Verbleib (kein C6-Blocker):**

- O1 — whileHover/whileTap-Design-Guardian-Grep über die 6 Komponenten (visuell Jan, Code-Review-Folge-Pass wie C5 O2).
- O2 — Hydration-Guard `toLocaleString` (R2): in `HistoryTableStream`/`LeaderboardStreamTable` prüfen (Folge-Pass), da `toLocaleString('de-DE')` server/client-unterschiedlich rendern kann. Kein C6-Blocker (Client-Component `'use client'`, Rendering clientseitig).

**Audit-Ergebnis Execution:** C6 vollumfänglich committed & verifiziert. 0 offene C6-Blocker. → C3–C6 abgeschlossen.

---

## Abschluss — C3–C6 vollumfänglich committed

| Block | Commit    | Dateien | Diff       | Status |
| ----- | --------- | ------- | ---------- | ------ |
| C3    | `5d3fc7f` | 6       | +562/−27   | 🟢     |
| C4    | `d825c4b` | 9       | +1045/−438 | 🟢     |
| C5    | `06f364d` | 24      | +3830      | 🟢     |
| C6    | `ca156f3` | 10      | +940/−668  | 🟢     |

Übersichtstabelle `worldmap/01-offene-commits.md` §1: C1–C6 alle 🟢. `/goal`-Aufgabe (Punkte 3–6) vollumfänglich abgeschlossen. C7–C12 verbleiben (außerhalb dieses /goal-Scope).
