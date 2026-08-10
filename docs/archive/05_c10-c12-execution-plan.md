# 05 — Execution-Plan C10–C12

> **Erstellt:** 2026-08-09 · **Scope:** Letzte 3 Commit-Blöcke aus `01-offene-commits.md` (Reihe 10/11/12).
> **Modus:** `/goal` autonom · Weltklasse-Plan → Self-Audit → Execute ohne Bestätigung → Execution-Audit → 01-Markdown-Update → je Block 🟢.
> **Scope-Vorgabe (Jan, 2026-08-09):** **Streng nach Plan** — nur die in den Plan-Zeilen 10/11/12 gelisteten Dateien werden committet. Strukturelle Loose-Ends bleiben uncommitted: `app/api` (11 Routes), `lib/meta` (6 Files), `app/backend` (2 DELETED), weitere `docs/*`, EOL-only-Artefakte, Gamification-NEW (`achievements-config-server.ts` + Test), `app/refactoring/` (neue Route).

---

## C10 — Game Pages & Shared Components Polish

### C10.1 — Scope-Realität vs Plan-Zeile

Plan-Zeile 10 (globs) aufgelöst gegen `git status` (2026-08-09):

| Plan-Glob                                                                                                                                               | Modified/Untracked (Realität)                                                                          | Hinweis                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `app/games/{layout,page}.tsx` + je Spiel `{blackjack,crash,dice,roulette,slots}/{layout,page}.tsx` + `roulette/RouletteClient.tsx` + `slots/symbols.ts` | 11 modified (blackjack/crash/dice/roulette je layout+page, games/layout+page, roulette/RouletteClient) | `slots/{layout,page}.tsx`, `slots/symbols.ts` bereits in C7 (`9e97d53`) committed → idempotent, nichts zu stage |
| `app/{page,layout,not-found,error,global-error,globals.css}`                                                                                            | 6 modified                                                                                             | —                                                                                                               |
| `app/{vault,sign-in,sign-up,auth/callback}/*`                                                                                                           | 5 modified (auth/callback/route, sign-in+sign-up page, vault/layout+page)                              | —                                                                                                               |
| `components/casino/{BigWinOverlay…WalletModal}.tsx`                                                                                                     | 11 modified (`SlotSymbol` bereits C7)                                                                  | —                                                                                                               |
| `components/casino/games/{blackjack,roulette,slots}/*`                                                                                                  | 13 modified (blackjack 7 + roulette 6)                                                                 | `slots/*` bereits in C7 committed → idempotent                                                                  |
| `components/home/{HeroSection,HeroSectionV2,HomeClientV2,index}.tsx`                                                                                    | 4 modified (siehe C10.2)                                                                               | —                                                                                                               |
| `components/layout/{AdminLayout…OnboardingFlow}.tsx`                                                                                                    | 6 modified                                                                                             | —                                                                                                               |
| `components/social/{GlobalChat…PlayerProfileModal}.tsx`                                                                                                 | 5 modified                                                                                             | —                                                                                                               |
| `components/navigation/CommandPalette.tsx`                                                                                                              | 1 modified                                                                                             | —                                                                                                               |
| `components/ui/{Magnetic…VibeMotion}.tsx`                                                                                                               | 8 modified                                                                                             | —                                                                                                               |
| `components/auth/{AuthForm,ClientProviders,SupabaseSessionProvider}.tsx`                                                                                | 3 modified (+ 1 NEW, siehe C10.2)                                                                      | —                                                                                                               |
| `hooks/{useDynamicColor…useParallax}.ts`                                                                                                                | 5 modified (+ 2 NEW, siehe C10.2)                                                                      | —                                                                                                               |
| `styles/game-effects.css`                                                                                                                               | 1 modified                                                                                             | —                                                                                                               |

### C10.2 — Plan vs Realität: zwingende Build-Abhängigkeiten (Ausnahme von "Streng nach Plan")

4 Dateien in C10-Dirs sind **nicht** in der Plan-Zeile gelistet, aber **harte Build-Abhängigkeiten** plan-gelisteter Dateien (Import-Graph verifiziert via grep). Ausschluss → unresolved imports → Build-Bruch → verletzt "vollumfänglich abgeschlossen" + DevOps-Slayer Build-Stabilität. Die Plan-Zeile ist leicht veraltet (Helper wurden nach Plan-Schreibung extrahiert); es sind co-evolved Dependencies des Polish-Workstreams, **keine** strukturellen Loose-Ends (app/api/lib/meta/app/backend/docs), die Jans "Streng nach Plan" meint. → **INCLUDE** als technische Notwendigkeit (kein Scope-Urteil):

| Datei                                         | Status        | Importiert von (plan-gelistet)                    |
| --------------------------------------------- | ------------- | ------------------------------------------------- |
| `hooks/useMounted.ts`                         | NEW untracked | `MainLayout.tsx`, `ClientShell.tsx`               |
| `hooks/useIsNarrowViewport.ts`                | NEW untracked | `home/HeroCinematicShowcase.tsx` (transitive Dep) |
| `components/auth/AuthCinematicBackground.tsx` | NEW untracked | `sign-in/page.tsx`, `sign-up/page.tsx`            |
| `components/home/HeroCinematicShowcase.tsx`   | modified      | `HomeClientV2.tsx`                                |

**Exkludierte untracked-Dateien in C10-Dirs** (keine C10-Import-Abhängigkeit, verifiziert):

- `app/refactoring/{layout,page}.tsx` — neue Route; `ClientShell.tsx` referenziert `/refactoring` nur als Pathname-String (Route-Detection wie `/v2`/`/admin`), **kein** Modul-Import → kein Build-Bruch.
- `lib/casino/achievements-config-server.ts` + `__tests__/achievements-config-server.test.ts` — Gamification-NEW; einziger Consumer `app/api/casino/config/route.ts` (app/api = Loose-End).

### C10.3 — Cross-Block-Abhängigkeits-Analyse (Build-Konsistenz des committed tree)

C10-Dateien importieren aus `@/lib/casino/*`, `@/lib/games/blackjack`, `@/utils/supabase/*`. Verify, dass jede Import-Auflösung gegen **committed** HEAD erfolgt (kein Konsum uncommitted Loose-End-Symbole):

| Import-Target                                                               | Status                                                            | C10-Importer                                                                                                                                        |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/casino/{casino-core,provably-fair,bet-validator,logger,sound-manager}` | ✅ committed C9 (`d85a2ce`)                                       | RouletteClient, dice/crash/roulette pages, GameErrorBoundary, ProvablyFairModal/Tool, RouletteBoard, MainLayout, SuperButton, HeroCinematicShowcase |
| `lib/casino/{session,chat-bot}`                                             | ✅ committed in HEAD, 0 aktuelle Mods (`git diff --numstat` leer) | MainLayout (`getOrCreateSessionId`), GlobalChat (`ChatBotService`)                                                                                  |
| `lib/games/blackjack`                                                       | ✅ committed C9                                                   | blackjack/page (`BlackjackGameState`)                                                                                                               |
| `utils/supabase/{client,server}`                                            | ✅ committed C9                                                   | layout, AuthForm, SupabaseSessionProvider                                                                                                           |
| `lib/meta`, `lib/security`, `app/api`                                       | —                                                                 | **0 C10-Datei importiert daraus** (grep verifiziert)                                                                                                |

**Ergebnis:** Keine C10-Datei konsumiert ein uncommitted Loose-End-Symbol. Der committed C10-Tree (HEAD ∪ C10-Staging-Set) ist self-consistent und buildable — vorausgesetzt der Full-Tree-Build (loose-ends im Working-Tree präsent) ist grün (C10.5).

### C10.4 — Commit-Strategie

**Ein Commit** `feat(ui): cyber-stealth polish across game pages, casino and shared components` — **nicht** die vom Plan empfohlenen 3–4 Sub-Commits (C10a–d). Begründung: `/goal`-Vorgabe "dasselbe Prinzip" wie C4–C9 (ein Commit je Block). Sub-Commits wären Reviewbarkeit-günstig, widerspräche aber dem etablierten 1-Block-1-Commit-Rhythmus und der "vollumfänglich abgeschlossen je Block"-Definition. Transparenz: große Diff-Größe dokumentiert.

### C10.5 — Verify-Gates

1. **Build:** `npm run build` exit 0 (background task, Full-Tree).
2. **Lint:** `lint-staged` Pre-Commit-Hook (eslint --fix + typecheck-staged.mjs + prettier --write auf staged C10-Set).
3. **Import-Graph:** C10.3 (keine Loose-End-Symbol-Abhängigkeit).
4. **Pre-Commit-Assert:** staged-Set == C10-Plan-Dateien + 4 Build-Dependencies; 0 out-of-scope (`app/api`/`lib/meta`/`app/backend`/`docs`/`worldmap`/`tests`/`scripts`/`lib/casino`-non-C10/`lib/security`/`app/refactoring`/Gamification-NEW).
5. **Post-Commit-Assert:** Commit enthält nur C10-Dateien; Loose-Ends bleiben unstaged in Working-Tree.
6. **Security-Auditor (O-Items, nicht C10-blockierend):** `Math.random` in C10-Source-Files = 0 (UI-Polish berührt keine RNG-Logik); keine Balance-Mutation in C10 (reine UI); Admin-Auth-Boundary unberührt (Admin-Komponenten sind Layout/Shell, nicht API-Route). `HeroCinematicShowcase`/WebGL/GSAP via dynamische Imports? → Bundle-Budget-Beobachtung (R3).

### C10.6 — Risiken

- **R1 — Größter Block:** 1 Commit (C10.4) — Diff-Größe dokumentiert.
- **R2 — Hydration-Mismatch:** `useMounted` (neu) in `MainLayout`/`ClientShell` → SSR/Client-Konsistenz prüfen via Build + `useMounted`-Idiom (boolean after mount).
- **R3 — Bundle-Budget:** `HeroCinematicShowcase` (gsap/three via `public/prototypes/lib`, Script-Tags nicht Imports) + `AuthCinematicBackground` → Build-Warnung auf Bundle-Größe beobachten.
- **R4 — `globals.css` / `layout.tsx` multi-workstream:** Hunk-Isolation nicht nötig (globals.css eine Änderung = v2-Tokens/polish; layout.tsx C10-scope). Verifiziert via diff-Block-Review.

### C10.7 — Self-Audit (F-Plan / P-Plan / A-Plan)

- **F (Fehler im Plan):** Plan-Zeile veraltet (4 Helper fehlen) → C10.2 korrigiert. Plan "slots/* (15)" überschätzt (C7 vorab committed) → C10.1 korrigiert.
- **P (Prüfungen vollständig):** Build, Lint, Import-Graph, Pre/Post-Assert, Security-O-Items. Visuelle Prüfung **nicht** durch Claude (Memory-Regel: Jan prüft visuell).
- **A (Aufgabe erfüllt):** 1 sauberer Commit, nur C10-Scope, Working-Tree bleibt kohärent (loose-ends present), 01-Markdown Reihe 10 → 🟢.

### C10.8 — Execution-Checklist

- [ ] Build grün (background)
- [ ] C10-Dateien + 4 Deps stage (explizite Pfade, kein `git add .`)
- [ ] Pre-Commit-Assert (0 out-of-scope)
- [ ] Commit `feat(ui): cyber-stealth polish across game pages, casino and shared components`
- [ ] Post-Commit-Assert
- [ ] 01-offene-commits.md: Header + Reihe 10 → 🟢 + §4 C10-Detail
- [ ] §C10 Execution-Audit ergänzen

---

## C11 — Tests & Scripts

### C11.1 — Scope-Realität

16 Plan-Dateien (8 `tests/*.spec.ts` + `crash-simulation.ts` + 8 `scripts/*.ts`), alle Real-Content (0 EOL-only), alle C11-Plan-gelistet. Exkludiert: 8 untracked `scripts/_tmp_*.sql` + `verify-migrations-applied.sql` (Temp-Artefakte, nicht in Plan).

### C11.2 — Import-Analyse

2 C11-Dateien importieren aus `lib/casino/{provably-fair,casino-core}` → beide C9-committed → kein Loose-End-Dep, kein Stash-Isolationsrisiko. 0 C11-Datei importiert `lib/meta`/`lib/security`/`app/api`/`utils`/`store`.

### C11.3 — Execution

- Stage (globs schließen untracked `.sql` aus) → 16 staged, 0 leak.
- Commit `cb88252` (+406/−141). lint-staged (eslint + prettier + typecheck-staged 16 Files) grün.

### C11.4 — Verify-Gates

`npm run test` → 26 Files / 265 Tests grün. `npm run vibe-check` → ✅ Complete.

---

## C12 — Config / Meta-Docs

### C12.1 — Scope-Realität

4 Plan-Dateien (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `01_WORLDMAP_STATUS.md`), alle Real-Content, Content = Jans Endzustand-Doku. 0 EOL-only.

### C12.2 — Execution

- Stage 4 → 0 leak. Commit `d2d9777` (+288/−225). lint-staged (prettier 4 `.md`; typecheck-staged SKIPPED — keine `.ts/.tsx`) grün.

### C12.3 — Verify

Konsistenz mit committedem Code-Status = Jans Doku-Content (nicht durch Claude bewertet — Memory-Regel).

---

## Abschluss (C10–C12)

Alle 3 Blöcke 🟢 in `01-offene-commits.md` Übersichtstabelle. Verify-Gates gesamt grün (s. `01-offene-commits.md` §4b). 84 Loose-Ends absichtlich uncommitted ("Streng nach Plan"). Plan-Doc nach Abschluss → `docs/archive/05_c10-c12-execution-plan.md` verschoben (nicht gelöscht — §C10–§C12 Audit-Trail als Wert).
