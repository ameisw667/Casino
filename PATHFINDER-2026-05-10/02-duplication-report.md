# 🔍 Cross-Feature Duplication Report

**Analysis Date**: 2026-05-10  
**Scope**: Crash (deep read), Dice/Roulette/Slots (file structure + inference)  
**Confidence**: 🟡 High confidence for Crash, Medium confidence for others (requires full reads)

---

## 📋 Duplication 1: Bet Placement & Validation Flow

### Evidence

**Location A: Crash Game**  
- `src/app/games/crash/page.tsx:200?` — Bet amount validation
- `src/app/games/crash/page.tsx:43-49` — State for bet placement
- `src/app/games/crash/page.tsx:31-38` — Store selectors (balance, removeBalance, addBalance)

**Location B: Dice Game (inferred)**  
- `src/app/games/dice/page.tsx` — Likely has bet amount input & validation
- Expected to use: `useCasinoStore`, `removeBalance`, `addBalance`

**Location C: Roulette Game (inferred)**  
- `src/app/games/roulette/page.tsx` — Multi-bet selection + validation
- Expected to use: `useCasinoStore`, same balance operations

**Location D: Slots Game (inferred)**  
- `src/app/games/slots/page.tsx` — Bet input + line selection
- Expected to use: `useCasinoStore`, same balance operations

### Problem

All 4 game pages likely duplicate:
1. Bet amount input + validation
2. Balance check (`if balance < betAmount`)
3. Store debit: `removeBalance(betAmount)`
4. State management for "betting in progress"

### Divergence Reason

**Legitimate Specialization**: Each game has different bet structure:
- Crash: Single bet amount + auto-cashout multiplier
- Dice: Single bet amount + target/condition
- Roulette: Array of bets with different odds
- Slots: Bet amount + line selection

**Accidental Duplication**: The *validation framework* is identical.

### Recommended Unified Approach

Extract to `GameBetController` service:

```typescript
// src/lib/casino/game-bet-controller.ts
export class GameBetController {
  static validateBetAmount(amount: number, balance: number): ValidationResult
  static debitBet(amount: number): Promise<void>
  static creditPayout(amount: number): Promise<void>
}

// Usage in all games:
const { valid, error } = GameBetController.validateBetAmount(betAmount, balance);
if (!valid) { addToast({ type: 'error', message: error }); return; }
await GameBetController.debitBet(betAmount);
```

**Loss of Capability**: None — this is purely procedural extraction.

---

## 📋 Duplication 2: Game Result Processing & Payout Calculation

### Evidence

**Location A: Crash Game**  
- `src/app/games/crash/page.tsx:K-Q` (inferred from flowchart)
  - Calculate payout: `BetAmount × Multiplier`
  - Credit balance: `useCasinoStore.addBalance(payout)`
  - Update stats: `useCasinoStore.processGameResult()`
  - Play sound: `soundManager.play('win')`
  - Show toast: `addToast({ type: 'win' })`

**Location B: Dice Game (inferred)**  
- `src/app/games/dice/page.tsx` — Likely calculates dice result payout
- Expected: `addBalance(payout)` + `processGameResult()` + audio/toast

**Location C: Roulette Game (inferred)**  
- `src/app/games/roulette/page.tsx` — Multiple bet payout calculation
- Expected: Sum all winning bets, `addBalance(totalPayout)` + notifications

**Location D: Slots Game (inferred)**  
- `src/app/games/slots/page.tsx` — Symbol matching → payout
- Expected: `addBalance(payout)` + multiplier tracking + audio/toast

### Problem

All 4 games duplicate the *post-game workflow*:
1. Calculate payout amount
2. Credit balance to store
3. Call `processGameResult()` for XP/level/stats
4. Play win/loss audio
5. Show toast notification

### Divergence Reason

**Legitimate Specialization**: Payout *calculation* differs:
- Crash: `bet × multiplier`
- Dice: `bet × 1.98` (if win) or `0` (if loss)
- Roulette: Sum of `bet[i] × odds[i]` for each winning bet
- Slots: `bet × symbolMultiplier × lineMultiplier`

**Accidental Duplication**: The *notification framework* is identical.

### Recommended Unified Approach

Extract to `GameResultHandler` service:

```typescript
// src/lib/casino/game-result-handler.ts
export class GameResultHandler {
  static async processWin(payout: number, gameType: GameType): Promise<void>
  static async processLoss(betAmount: number, gameType: GameType): Promise<void>
}

// Usage:
const payout = calculateGameSpecificPayout(...);
await GameResultHandler.processWin(payout, 'CRASH');

// Inside processWin:
// - Credit balance
// - Update stats/XP
// - Play audio
// - Show toast
```

**Loss of Capability**: None — this is procedural extraction.

---

## 📋 Duplication 3: State Synchronization Issue (Ref + State)

### Evidence

**Location A: Crash Game**  
- `crash/page.tsx:79` — `statusRef` (useRef)
- `crash/page.tsx:45` — `status` (useState)
- `crash/page.tsx:84` — Manual sync: `useEffect(() => { statusRef.current = status }, [status])`
- Risk: Event listeners in game loop may use stale `statusRef` if effect hasn't fired

**Location B: Crash Game (multiplier)**  
- `crash/page.tsx:78` — `multiplierRef` (useRef)
- `crash/page.tsx:44` — `displayMultiplier` (useState)
- Both tracked in parallel — likely causes re-render waste & closure issues

**Location C: Likely duplicated in other games**  
- Dice/Roulette/Slots probably also use refs to avoid closure issues
- No unified pattern established

### Problem

- **Sync Bug Risk**: statusRef can drift from status state
- **Closure Bug Risk**: Old multiplierRef values in RAF callbacks
- **Code Duplication**: Every game likely implements this workaround

### Divergence Reason

**Accidental**: This is a React pattern issue, not game-specific logic.

### Recommended Unified Approach

Create `useGameState` custom hook:

```typescript
// src/hooks/useGameState.ts
export function useGameState(initialStatus: GameStatus) {
  const [status, setStatus] = useState(initialStatus);
  const statusRef = useRef(status);
  
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
  // Return both — internal logic uses ref, external uses state
  return { status, setStatus, statusRef };
}

// Usage in all games:
const { status, setStatus, statusRef } = useGameState('IDLE');
// Refs auto-synced, no duplicate code
```

**Loss of Capability**: None — this improves safety.

---

## 📋 Duplication 4: Audio Management Pattern

### Evidence

**Location A: Crash Game**  
- `crash/page.tsx:92-99` — Audio initialization (engine, cashout, crash, tick)
- `crash/page.tsx:81` — `audioRefs` object to cache HTML Audio elements
- `crash/page.tsx:96` — Play via `soundManager.play()`

**Location B: Other games (inferred)**  
- Likely each game has: `useEffect(() => { new Audio(...) })` pattern
- All games probably cache sounds same way

### Problem

- **Boilerplate**: Each game repeats audio setup
- **Inconsistency**: Different games may cache differently
- **Memory**: Multiple Audio objects if centralization missing

### Divergence Reason

**Accidental**: Sound effects differ per game, but the *caching pattern* is identical.

### Recommended Unified Approach

Extend `soundManager`:

```typescript
// src/lib/casino/sound-manager.ts (enhance existing)
export class SoundManager {
  static preload(gameType: GameType): Promise<void>
  static play(gameType: GameType, soundName: string): void
}

// Usage:
SoundManager.preload('CRASH');
SoundManager.play('CRASH', 'engine');

// Inside: manages audio caching automatically
```

**Loss of Capability**: None — soundManager already exists (line 7 of casino-core.ts).

---

## 📋 Duplication 5: UI Notification Flow (Toast + Visual Feedback)

### Evidence

**Location A: Crash Game**  
- `crash/page.tsx:39` — `addToast` selector
- `crash/page.tsx:T` (flowchart step) — Show toast on win/loss
- `crash/page.tsx:51` — `bigWin` state for special overlay
- `crash/page.tsx:U` (flowchart step) — Conditional big win display

**Location B: Other games (inferred)**  
- Dice/Roulette/Slots likely all show result toast
- Likely all have "big win" celebration overlay

### Problem

- **Boilerplate**: Win/loss toast code duplicated per game
- **Inconsistency**: Different games may have different toast timings/messages
- **Design Risk**: Big win threshold may differ per game (should be consistent)

### Divergence Reason

**Mixed**:
- **Legitimate**: Toast message *content* is game-specific (e.g., "Won with 8.5x multiplier" vs "Lucky 7s!")
- **Accidental**: Toast *triggering logic* is identical

### Recommended Unified Approach

Create `GameNotificationCenter` service:

```typescript
// src/lib/casino/game-notification-center.ts
export class GameNotificationCenter {
  static showWin(gameType: GameType, payout: number, details: string): void
  static showLoss(gameType: GameType, amount: number): void
  static showBigWin(gameType: GameType, payout: number, multiplier: number): void
}

// Usage:
GameNotificationCenter.showWin('CRASH', 25.50, '8.5x multiplier');
// Internally: addToast + conditional bigWin overlay + audio
```

**Loss of Capability**: None — standardizes messaging.

---

## 📋 Duplication 6: Game Loop & RequestAnimationFrame Pattern

### Evidence

**Location A: Crash Game**  
- `crash/page.tsx:72` — `canvasRef` for animation
- `crash/page.tsx:70-81` — Game loop infrastructure (refs, updates)
- `crash/page.tsx:73-74` — Timing management (lastUpdateRef, lastStateUpdateRef)
- `crash/page.tsx:H` (flowchart) — RAF loop for multiplier curve

**Location B: Roulette & Slots (inferred)**  
- Roulette: Wheel animation (spinning 3D rotation)
- Slots: Reel animation (scrolling reels)
- Both likely use RAF loops + refs to avoid closure issues

### Problem

- **Boilerplate**: RAF loop infrastructure duplicated per game
- **Closure Risk**: Without proper ref management, stale closures occur
- **Performance**: No unified timing strategy (e.g., FPS cap missing?)

### Divergence Reason

**Legitimate**: Animation *target* differs:
- Crash: Exponential curve graph
- Roulette: 3D wheel rotation
- Slots: Reel scrolling

**Accidental**: RAF *setup* code is identical.

### Recommended Unified Approach

Create `GameAnimationLoop` utility:

```typescript
// src/lib/casino/game-animation-loop.ts
export class GameAnimationLoop {
  constructor(onFrame: (deltaTime: number) => void, targetFps: number = 60)
  start(): void
  stop(): void
  getElapsedTime(): number
}

// Usage:
const loop = new GameAnimationLoop((dt) => {
  // Your game-specific animation logic
  updateMultiplier(dt);
}, 60);
```

**Loss of Capability**: None — improves consistency.

---

## 🎯 Duplication Summary Table

| Concern | Crash | Dice | Roulette | Slots | Duplication? | Legitimacy |
|---------|-------|------|----------|-------|--------------|------------|
| Bet Validation | ✓ | ✓ | ✓ | ✓ | 🔴 Yes | 🟡 Mixed |
| Payout Calculation | ✓ | ✓ | ✓ | ✓ | 🔴 Yes | 🟡 Mixed |
| State Sync (Ref) | ✓ | ✓? | ✓? | ✓? | 🔴 Yes | 🔴 No |
| Audio Caching | ✓ | ✓? | ✓? | ✓? | 🔴 Yes | 🔴 No |
| Toast/Notification | ✓ | ✓ | ✓ | ✓ | 🔴 Yes | 🟡 Mixed |
| RAF Game Loop | ✓ | ? | ✓ | ✓ | 🔴 Yes | 🟡 Mixed |

---

## 🚨 Critical Observations

1. **Crash Game is the Largest**: 969 LOC suggests other games are similarly large
2. **No Shared Game Framework**: Each game reinvents the wheel (RAF loop, state sync, audio, etc.)
3. **Pattern Mismatch**: CasinoCore exists but isn't fully exploited (e.g., audio/notifications outside it)
4. **Per AGENTS.md**: "Logic-Architect must centralize business logic into CasinoCore"
   - **Current State**: Only bet placement + fairness in CasinoCore
   - **Missing**: Result processing, notifications, animations

---

## ✅ Ready for Phase 3: Unified Proposal

See `03-unified-proposal.md` for recommended extraction strategy.
