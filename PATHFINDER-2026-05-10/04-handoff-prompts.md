# 📋 Handoff Prompts for `/make-plan`

**Status**: Ready to copy-paste into `/make-plan` skill  
**Reference**: Unified Proposal in `03-unified-proposal.md`  
**Parallel Execution**: Each prompt is independent; can be run in parallel after Sprint 1

---

## 🎬 PROMPT 1: Extract Shared Services (Sprint 1)

```
CONTEXT:
You are refactoring a 4-game casino (Crash, Dice, Roulette, Slots) to eliminate 60% code duplication.
Each game page is currently ~900+ LOC with mixed UI/logic. The goal is to extract shared services.

SCOPE:
Create THREE new service files in `src/lib/casino/`:
1. game-bet-controller.ts — Centralize bet validation + store debit
2. game-result-handler.ts — Centralize post-game workflow (credit, audio, notifications)
3. game-animation-loop.ts — Unified RAF pattern for animation-based games

Also create ONE new hook:
4. src/hooks/useGameState.ts — Unify useState + useRef pattern

REFERENCE:
- See `03-unified-proposal.md` sections 1-3 for interfaces & implementation
- Current code: src/lib/casino/casino-core.ts (entry point structure)
- Current code: src/app/games/crash/page.tsx:29-99 (shows current patterns)
- Current code: src/store/useCasinoStore.ts (shows store integration)

ACCEPTANCE CRITERIA:
1. GameBetController has validateBet() & debitBet() methods
2. GameResultHandler has processResult() method that:
   - Credits payout to store
   - Updates game stats via processGameResult()
   - Plays audio via soundManager
   - Shows toast via addToast
3. GameAnimationLoop has start(), stop(), getElapsedTime() methods
4. useGameState hook syncs useRef + useState with useEffect
5. All types exported; no console errors
6. Zero modifications to existing game files (they're not refactored yet)

ANTI-PATTERNS TO AVOID:
- Do NOT add a Factory or Registry (keep it simple)
- Do NOT parameterize sound files (soundManager already handles that)
- Do NOT add "future game support" logic (we'll extract again when Baccarat is real)
```

---

## 🎮 PROMPT 2: Refactor Crash Game (Sprint 2)

```
CONTEXT:
You are refactoring Crash Game (src/app/games/crash/page.tsx, 969 LOC) to use the new shared services.
Current structure: monolithic page component mixing UI + logic.
Target: 3-4 focused components + 2 custom hooks.

SCOPE:
Refactor `src/app/games/crash/`:

1. **Split page.tsx** (969 LOC) → 350 LOC (keeps layout, calls components)
   - Remove inline logic (move to useCrashLogic hook)
   - Remove canvas code (move to CrashCanvas component)
   - Keep routing & error boundary

2. **Create components/CrashCanvas.tsx** (150 LOC)
   - Receives: multiplier, status, canvasRef
   - Owns: Canvas rendering, particle system, animation
   - No game logic, no store calls

3. **Create components/CrashBetPanel.tsx** (80 LOC)
   - Receives: balance, betAmount, onBetAmountChange, onPlaceBet
   - Owns: Bet input UI, multiplier settings
   - No game logic

4. **Create components/CrashLiveBoard.tsx** (60 LOC)
   - Receives: liveBets
   - Owns: Live bets table/list
   - No game logic

5. **Create hooks/useCrashLogic.ts** (200 LOC)
   - Orchestrates: bet placement flow
   - Uses: GameBetController.validateBet()
   - Uses: GameBetController.debitBet()
   - Uses: CasinoCore.placeBet()
   - Uses: GameResultHandler.processResult()
   - Returns: { betAmount, setBetAmount, placeBet, ... }

6. **Create hooks/useCrashAnimation.ts** (150 LOC)
   - Orchestrates: RAF animation loop
   - Uses: GameAnimationLoop
   - Manages: displayMultiplier, status, canvasRef
   - Returns: { displayMultiplier, canvasRef, status, ... }

REFERENCE:
- See `03-unified-proposal.md` "Refactored Game Page Structure" for component layout
- See `03-unified-proposal.md` "useCrashLogic Hook" example code
- Current code: src/app/games/crash/page.tsx (lines to extract)
- New services: src/lib/casino/game-*.ts (from PROMPT 1)

ACCEPTANCE CRITERIA:
1. page.tsx reduced to ~350 LOC
2. No game logic in components (only UI rendering)
3. placeBet() flow uses GameBetController + GameResultHandler
4. Canvas animation uses GameAnimationLoop
5. All tests from CASINO_MASTER_PLAN still pass
6. No new console errors or warnings
7. Game still fully playable (all features working)

ANTI-PATTERNS TO AVOID:
- Do NOT split the hook into 10 tiny hooks (keep logic together)
- Do NOT put animation logic in the page component
- Do NOT duplicate bet validation (use GameBetController only)
- Do NOT call store methods directly in components (use hooks)

DATA FLOW (for verification):
User clicks Bet → useCrashLogic.placeBet() → GameBetController.validateBet() 
  → GameBetController.debitBet() → CasinoCore.placeBet() → GameResultHandler.processResult()
  → useCrashAnimation updates displayMultiplier → CrashCanvas re-renders
```

---

## 🎲 PROMPT 3: Refactor Dice Game (Sprint 3, Parallelizable)

```
CONTEXT:
You are refactoring Dice Game (src/app/games/dice/page.tsx) using the same pattern as Crash.
Apply the pattern from PROMPT 2 (Crash refactor) but adapted to Dice rules.

SCOPE:
Refactor `src/app/games/dice/`:

1. **Split page.tsx** → 300-350 LOC (same pattern as Crash)
   - Remove game logic
   - Keep layout/routing

2. **Create components/DiceRoller.tsx** (120 LOC)
   - Receives: roll result, status
   - Owns: Dice display + roll animation

3. **Create components/DiceBetPanel.tsx** (100 LOC)
   - Receives: balance, betAmount, target, condition
   - Owns: Bet input, target/condition selection UI
   - No logic

4. **Create hooks/useDiceLogic.ts** (180 LOC)
   - Orchestrates: target selection → bet → roll → payout
   - Uses: GameBetController
   - Uses: CasinoCore.placeBet() with { target, condition } params
   - Uses: GameResultHandler.processResult()
   - Game-specific: Dice payout = bet × 1.98 (if win)

5. **Create hooks/useDiceAnimation.ts** (80 LOC)
   - Orchestrates: Dice roll animation
   - Returns: { roll, displayRoll, status, ... }

REFERENCE:
- Template: PROMPT 2 (Crash refactor) — apply same structure
- Current code: src/app/games/dice/page.tsx (structure unknown, infer from Crash pattern)
- See `02-duplication-report.md` "Duplication 2" for payout logic
- See casino-core.ts:48-50 for Dice payout calculation

ACCEPTANCE CRITERIA:
- Same as PROMPT 2, but for Dice game
- Payout logic: bet × 1.98 (or 0 if loss)
- All Dice-specific rules preserved
- Game fully playable

ANTI-PATTERNS:
- Do NOT duplicate bet validation (GameBetController)
- Do NOT duplicate result processing (GameResultHandler)
- Do NOT put animation in the page component
```

---

## 🎰 PROMPT 4: Refactor Roulette Game (Sprint 3, Parallelizable)

```
CONTEXT:
You are refactoring Roulette Game (src/app/games/roulette/page.tsx) using the same pattern as Crash.
Roulette has additional complexity: multiple bet types (STRAIGHT, COLOR, EVEN_ODD, etc.)

SCOPE:
Refactor `src/app/games/roulette/`:

1. **Split page.tsx** → 350-400 LOC (handles multi-bet complexity)
   - Remove game logic
   - Keep layout

2. **Create components/RouletteWheel.tsx** (200 LOC)
   - Receives: spinResult, status
   - Owns: 3D wheel animation, ball bounce

3. **Create components/RouletteBetTable.tsx** (150 LOC)
   - Receives: bets (array), onAddBet, onRemoveBet
   - Owns: Bet type selection UI (STRAIGHT, COLOR, etc.)
   - No validation logic

4. **Create hooks/useRouletteLogic.ts** (220 LOC)
   - Orchestrates: multi-bet selection → spin → payout calculation
   - Uses: GameBetController (validates TOTAL of all bets)
   - Uses: CasinoCore.placeBet() with { bets: RouletteBet[] } param
   - Uses: GameResultHandler.processResult()
   - Game-specific: Calculate sum of winning bet payouts

5. **Create hooks/useRouletteAnimation.ts** (120 LOC)
   - Orchestrates: Wheel spin animation
   - Uses: GameAnimationLoop for wheel rotation

REFERENCE:
- Template: PROMPT 2 (Crash)
- Current code: src/lib/casino/casino-core.ts:15-23 (RouletteBet types)
- See `02-duplication-report.md` "Duplication 2" for payout complexity

ACCEPTANCE CRITERIA:
- Same as PROMPT 2
- Multi-bet logic preserved (all bet types: STRAIGHT, COLOR, etc.)
- Payout calculation: sum of all winning bet payouts
- Game fully playable

ANTI-PATTERNS:
- Do NOT duplicate bet validation
- Do NOT put bet type logic in components (keep in hook)
```

---

## 🎪 PROMPT 5: Refactor Slots Game (Sprint 3, Parallelizable)

```
CONTEXT:
You are refactoring Slots Game (src/app/games/slots/page.tsx) using the same pattern as Crash.
Slots has: Reel animation, Symbol matching, Multipliers, Wild symbols.

SCOPE:
Refactor `src/app/games/slots/`:

1. **Split page.tsx** → 350-400 LOC
   - Remove game logic
   - Keep layout

2. **Create components/SlotsReels.tsx** (200 LOC)
   - Receives: reels (symbol arrays), status
   - Owns: Reel animation, symbol display

3. **Create components/SlotsBetPanel.tsx** (100 LOC)
   - Receives: balance, betAmount, lineSelection
   - Owns: Bet + line selection UI

4. **Create hooks/useSlotsLogic.ts** (220 LOC)
   - Orchestrates: line selection → spin → symbol match → payout
   - Uses: GameBetController
   - Uses: CasinoCore.placeBet() (game result includes matched symbols)
   - Uses: GameResultHandler.processResult()
   - Game-specific: Symbol matching + multiplier calculation

5. **Create hooks/useSlotsAnimation.ts** (150 LOC)
   - Orchestrates: Reel spin animation
   - Uses: GameAnimationLoop for reel scrolling

REFERENCE:
- Template: PROMPT 2 (Crash)
- See CASINO_MASTER_PLAN.md line 29: "Slots Reel Desync — Fix: Animations must exakt with PF-Ergebnis"

ACCEPTANCE CRITERIA:
- Same as PROMPT 2
- Symbol matching logic preserved
- Wild symbol substitution working
- Multipliers calculated correctly
- Game fully playable
- Animations sync with game result

ANTI-PATTERNS:
- Do NOT duplicate bet validation
- Do NOT put symbol matching logic in components
- Do NOT let animations diverge from game result
```

---

## 🧹 PROMPT 6: Cleanup & Testing (Sprint 4-5)

```
CONTEXT:
All 4 games have been refactored. Now clean up old code, verify tests, update docs.

SCOPE:

1. **Delete monolithic old files** (if not already replaced):
   - Old src/app/games/crash/page.tsx backup (if exists)
   - Old src/app/games/dice/page.tsx backup (if exists)
   - Old src/app/games/roulette/page.tsx backup (if exists)
   - Old src/app/games/slots/page.tsx backup (if exists)

2. **Run test suite**:
   - Run: npm run test (or jest)
   - All tests from CASINO_MASTER_PLAN still passing
   - No new console warnings

3. **Run build**:
   - npm run build
   - No TypeScript errors
   - No bundle warnings

4. **Update AGENTS.md**:
   - Update Logic-Architect section:
     "All game logic centralized in CasinoCore + shared services (GameBetController, GameResultHandler, GameAnimationLoop)"
   - Update Vibe-Architect section:
     "Game pages are now 350-400 LOC (down from 900+). Clear separation: components ≤200 LOC, hooks ≤250 LOC, services ≤300 LOC"

5. **Update CLAUDE.md** (if needed):
   - Document new folder structure

6. **Code review checklist**:
   - [ ] No game logic in components
   - [ ] All bet flow uses GameBetController
   - [ ] All results use GameResultHandler
   - [ ] All animations use GameAnimationLoop
   - [ ] No ref+state sync issues (using useGameState hook)
   - [ ] No duplication of validation/notification code
   - [ ] Game fully playable (all features tested manually)

ACCEPTANCE CRITERIA:
- npm run build: success (0 errors, 0 warnings)
- npm run test: success (all tests pass)
- All 4 games playable end-to-end
- Code duplication reduced from ~60% to ~15%
- AGENTS.md updated
- No old files left

ANTI-PATTERNS:
- Do NOT keep old code "just in case"
- Do NOT leave console.logs for debugging
- Do NOT merge without running full build
```

---

## 📊 Execution Timeline

```
Sprint 1 (Week 1):
└─ PROMPT 1: Extract Services (all sequential)

Sprint 2 (Week 2):
└─ PROMPT 2: Refactor Crash (sequential, depends on PROMPT 1)

Sprint 3 (Week 3-4):
├─ PROMPT 3: Refactor Dice (parallel, depends on PROMPT 1)
├─ PROMPT 4: Refactor Roulette (parallel, depends on PROMPT 1)
└─ PROMPT 5: Refactor Slots (parallel, depends on PROMPT 1)

Sprint 4-5 (Week 5):
└─ PROMPT 6: Cleanup & Testing (sequential, depends on 2-5)
```

---

## ✅ Quality Gates

Each prompt completion requires:

1. **Code Quality**:
   - Linter: 0 errors
   - Type checking: 0 errors
   - Test coverage: ≥80% (for new services)

2. **Functional Correctness**:
   - Game plays end-to-end
   - All game mechanics work
   - No console errors/warnings

3. **Architecture Compliance**:
   - No logic in components
   - No code duplication between games
   - All games use shared services

---

## 🚀 Next Steps

1. Run PROMPT 1 first (unblock all other work)
2. Run PROMPT 2 while others wait
3. Run PROMPTS 3-5 in parallel
4. Run PROMPT 6 to finalize

Use `/do` skill to execute all prompts in sequence or parallel.

---

**End of Handoff Prompts**
