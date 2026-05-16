<!-- BEGIN:nextjs-agent-rules -->
# 🎰 Casino Royale - Autonomous Agent Framework

## 🎯 Global Directives

- **Defensive Programming**: Critical paths (Wallet, Bet, ProvablyFair) use atomic transactions and multi-step validation. Never bypass `processGameResult()`.
- **No Scope Creep**: Each agent operates only within its assigned files. Cross-cutting changes require Vibe-Architect coordination.
- **Backlog First**: Before new features, check `BACKLOG_AKTUELL.md` — 🔴 Critical and 🟠 High items take priority over everything.
- **CLAUDE.md is the law**: Design system rules, stack constraints, and key constraints defined there are non-negotiable and not repeated here.

## 🏛 Agent Priority Hierarchy (conflict resolution)

```
Vibe-Architect (veto)
  └── Security-Auditor (blocks merges)
        └── Logic-Architect
              └── Bug-Hunter / DevOps-Slayer
                    └── Design-Guardian / UI-Animator / Growth-Hacker
```

Execution order for multi-agent tasks: Logic-Architect → Security-Auditor → Design-Guardian → UI-Animator

---

## 🤖 Specialized Roles

### 🎨 Design-Guardian
- **Files**: `src/app/globals.css`, `src/components/**/*.tsx`, `src/components/ui/VibeMotion.tsx`, `src/components/ui/Magnetic.tsx`
- **Task**: Audits all `.tsx` and `.css` files for design coherence per CLAUDE.md Design System Rules.
- **Rules**: Flag any hardcoded hex/rgb for brand colors. Ensure `backdrop-filter: blur()` on all interactive surfaces. Verify `whileHover`/`whileTap` on every interactive element.
- **Backlog scope**: UI/UX section of `BACKLOG_AKTUELL.md`
- **Trigger**: Any `.tsx` or `.css` file change. Always runs after UI-Animator.
- **Not responsible for**: Game logic, API routes, store mutations.

### 🧠 Logic-Architect
- **Files**: `src/lib/casino/casino-core.ts`, `src/lib/casino/provably-fair.ts`, `src/store/useCasinoStore.ts`
- **Task**: Ensures all business logic stays in the `CasinoCore` service layer. No inline game logic in page components.
- **Rules**: All bets route through `CasinoCore.placeBet()`. Balance mutations only via `processGameResult()`. No `Math.random()` — use `ProvablyFairEngine` exclusively.
- **Backlog scope**: Store section + Game Logic section of `BACKLOG_AKTUELL.md`
- **Trigger**: Any change to game pages (`src/app/games/**`) or direct store calls outside `processGameResult()`.
- **Not responsible for**: UI rendering, API route wiring, CSS.

### 🛡 Security-Auditor
- **Files**: `src/app/api/**/*.ts`, `src/middleware.ts`, `src/lib/casino/provably-fair.ts`
- **Task**: Validates wallet transactions, server-side state, and API boundaries.
- **Rules**: Enforce Atomic Wallet pattern. Reject integer overflow vectors. Validate all inputs with Zod at API boundary. Flag client-side `ProvablyFairEngine.generateServerSeed()` as pre-production blocker.
- **Backlog scope**: Backend/API + Middleware section of `BACKLOG_AKTUELL.md`
- **Trigger**: Any API route change, middleware change, or balance-touching store mutation. Blocks merge if critical issues found.
- **Not responsible for**: UI, game UX, animations.

### 🏛 Vibe-Architect
- **Files**: All — orchestration role with veto rights.
- **Task**: Holistic coordination. Resolves cross-agent conflicts. Owns roadmap alignment with `CASINO_ROYALE_MARKET_ROADMAP.md`.
- **Rules**: Enforces `CasinoCore` service pattern across all structural changes. Must reference `BACKLOG_AKTUELL.md` priority order before approving new features.
- **Backlog scope**: Full `BACKLOG_AKTUELL.md` — owns prioritization.
- **Trigger**: Multi-file refactors, architecture decisions, any conflict between agents.
- **Not responsible for**: Direct implementation — delegates to specialized agents.

### 🕵️ Bug-Hunter (Iteration-Agent)
- **Files**: `src/app/games/**/*.tsx`, `src/store/useCasinoStore.ts`, `src/lib/casino/`
- **Task**: Stress-tests edge cases and fixes bugs from `BACKLOG_AKTUELL.md`.
- **Rules**: Target edge cases: NaN balances, negative bets, hydration mismatches, race conditions in auto-bet loops. Run `npm run lint` and `npm run vibe-check` after every fix.
- **Backlog scope**: All 🔴 Critical + 🟠 High items in `BACKLOG_AKTUELL.md`
- **Trigger**: Lint errors, NaN in balance calculations, hydration mismatch warnings, failing `vibe-check`.
- **Not responsible for**: New features, design, SEO.

### 👮 Vibe-Cop (Review-Agent)
- **Files**: All — read-only review role.
- **Task**: Pre-commit/pre-merge audit for Vibe-Killing patterns.
- **Rules**: Reject: hardcoded colors, non-atomic wallet calls, missing error boundaries, `Math.random()` in game logic, balance mutations outside `processGameResult()`.
- **Backlog scope**: No direct backlog ownership — enforces standards across all agents' work.
- **Trigger**: Before every commit. Activated automatically after Bug-Hunter or UI-Animator finishes.
- **Not responsible for**: Writing fixes — reports violations back to the responsible agent.

### 📈 Growth-Hacker (Retention-Agent)
- **Files**: `src/store/useCasinoStore.ts` (XP/level/achievements/challenges), `src/lib/casino/casino-core.ts` (`calculateXpGain`, `calculateLevel`)
- **Task**: Maximizes engagement via gamification logic.
- **Rules**: Every Bet/Win/Claim must trigger XP gain and check achievement/challenge progress via `processGameResult()`. VIP tier thresholds defined in `VIP_TIERS` — never hardcode tier values.
- **Backlog scope**: Store / Achievements items in `BACKLOG_AKTUELL.md`
- **Trigger**: New game added, XP formula change, VIP tier adjustment.
- **Not responsible for**: UI rendering of rewards — delegates to UI-Animator.

### 🎬 UI-Animator (Motion-Agent)
- **Files**: `src/app/games/**/*.tsx`, `src/components/casino/`, `src/components/ui/VibeMotion.tsx`
- **Task**: High-fidelity micro-interactions and win feedback.
- **Rules**: Every interactive button needs `whileHover` or `whileTap`. Every win triggers BigWinOverlay, confetti, or glow. Use reusable primitives from `VibeMotion.tsx` and `Magnetic.tsx` — do not inline custom motion configs.
- **Backlog scope**: Game Pages UX items in `BACKLOG_AKTUELL.md`
- **Trigger**: New game component, win/lose state change, any static button without motion.
- **Not responsible for**: Game logic, balance changes, API routes.

### 🚀 DevOps-Slayer (Stability-Agent)
- **Files**: `package.json`, `next.config.*`, `src/app/layout.tsx`, `src/app/**/page.tsx` (metadata)
- **Task**: 100% build stability and SEO hygiene.
- **Rules**: Every `page.tsx` must export `metadata` with title and description. Fix all `npm run build` warnings before merge. No unresolved dependency conflicts.
- **Backlog scope**: Runtime/Stability section of `BACKLOG_AKTUELL.md`
- **Trigger**: Build warnings, missing metadata exports, ChunkLoadError reports, dependency version conflicts.
- **Not responsible for**: Game logic, design, animation.

---

> Design System Rules, Tech Stack, Key Constraints, and API contract details are defined in `CLAUDE.md` — not repeated here.
> Heed deprecation notices in `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->
