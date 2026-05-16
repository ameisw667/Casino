# Bug Iteration & Fix Plan

**Status**: 2026-05-16 | Iteration 2 Complete | Documentation Phase Complete

---

## 📊 Current State

| Metric | Value |
|--------|-------|
| Total Bugs Found | 70 |
| CRITICAL | 6 |
| HIGH | 18 |
| MEDIUM | 32 |
| LOW | 14 |
| Estimated Fix Time | 40-50 hours |

**Bugs Documented**:
- Iteration 1 (User Scenarios): 17 bugs (#29-45)
- Iteration 2 (Edge Cases & Security): 25 bugs (#46-70)

---

## 🎯 Next Iterations (Planning Phase)

### Iteration 3: Stress Testing & Multi-User Scenarios
**Timeline**: When Iteration 2 fixes are complete  
**Focus**: Concurrent users, load testing, network failure modes

**Scenarios to Test**:
- 10 concurrent users placing bets in same game (race conditions)
- Network split-brain (user in 2 regions simultaneously)
- Server crash recovery (bets mid-flight)
- Cross-browser sync (Dice in Chrome + Firefox at same time)
- High-frequency auto-bet (100 bets/minute)
- Malformed API responses (invalid JSON, truncated data)
- Clock skew (server time != client time by 24 hours)
- Wallet service timeout (API unreachable for 30s)

**Expected New Bugs**: 15-20
**Estimated Time**: 3-4 hours testing + documentation

---

### Iteration 4: Device & Display Testing
**Timeline**: After Iteration 3  
**Focus**: Mobile, tablets, unusual screen sizes, accessibility

**Scenarios to Test**:
- iOS Safari (touch, orientation, notch handling)
- Android Chrome (memory pressure, low battery mode)
- iPad landscape (large viewport, multi-touch)
- Old devices (iPhone SE, Samsung A10)
- Tablet split-view (50% screen width)
- Screen reader (NVDA, JAWS, VoiceOver)
- High contrast mode (Windows 11)
- Keyboard-only navigation (Tab, Enter, Arrow keys)
- Reduced motion (prefers-reduced-motion CSS media query)

**Expected New Bugs**: 12-18
**Estimated Time**: 4-5 hours testing + documentation

---

### Iteration 5: Advanced Security & Compliance
**Timeline**: After Iteration 4  
**Focus**: Attack vectors, regulatory requirements, data privacy

**Scenarios to Test**:
- CSRF attack (cross-site form submission)
- XSS injection (malicious game name, username, chat message)
- JWT tampering (modify token in DevTools)
- SQL injection (try SQL syntax in username/chat)
- Path traversal (try `../` in API paths)
- Rate limit bypass (rapid API calls, burst requests)
- PII leakage (check error messages for user data)
- Session fixation (reuse old session ID)
- Missing HSTS header (force insecure connection)
- Crypto API misuse (weak random, insufficient entropy)

**Expected New Bugs**: 8-12
**Estimated Time**: 3-4 hours testing + documentation

---

## 🔧 Fix Implementation Plan

### Batch 1: CRITICAL Fixes (6 issues)
**Target**: Start immediately after Iteration 2 plan approval  
**Issues**: #1-3, #29-30, #46-51

| Issue | File | Effort | Priority |
|-------|------|--------|----------|
| #46 JWT Refresh | middleware.ts | 6h | P0 |
| #47 Dice Overflow | casino-core.ts | 4h | P0 |
| #48 Crash Network Lag | crash/page.tsx | 7h | P0 |
| #49 Seed Exposure | provably-fair.ts | 2h | P0 |
| #50 XP Overflow | casino-core.ts | 4h | P0 |
| #51 CSRF on Affiliate | affiliate/route.ts | 5h | P0 |

**Estimated Total**: 28 hours
**Milestones**:
- Day 1: Fix #49 (2h), #50 (4h), #47 (4h) — math & security low-hanging fruit
- Day 2-3: Fix #46 (6h), #51 (5h) — auth & CSRF
- Day 4: Fix #48 (7h) — network resilience

**Testing**:
- Each fix must have unit test
- Run `npm run vibe-check` after each fix
- Manual test in dev environment

---

### Batch 2: HIGH Fixes (18 issues)
**Target**: Start after Batch 1 complete  
**Issues**: #31-39, #52-61

**Effort Distribution**:
- #52-61: 10 issues × 4-6h avg = 50 hours
- #31-39: 9 issues × 3-5h avg = 36 hours
- **Subtotal**: ~86 hours

**Parallelizable Fixes** (can run in parallel):
- #52 (Roulette desync) + #55 (Race condition) — both state management
- #53 (Slots OOB) + #68 (Symbol null) — both error handling
- #58 (Toast queue) + #59 (Unicode chat) — independent features

**Recommended Approach**:
1. Group by file/system (3 teams / 3 weeks)
2. Team A: State management (#52, #55, #66, #67)
3. Team B: Game logic (#54, #57, #61, #62, #65)
4. Team C: UX/Compliance (#56, #58, #59, #60, #63, #64)

---

### Batch 3: MEDIUM Fixes (32 issues)
**Target**: After Batch 2  
**Issues**: #40-45, #62-70, [17 additional MEDIUM]

**Effort**: ~70 hours
**Approach**: 
- Prioritize by impact score
- Combine related fixes (e.g., all toast issues together)
- Defer cosmetic issues (#64, #70) to Batch 4 if time-constrained

---

### Batch 4: LOW Fixes (14 issues)
**Target**: Backlog / Polish phase  
**Issues**: #22-28, miscellaneous LOW

**Effort**: ~20 hours
**Approach**:
- Bundle into single PR
- Combine multiple fixes per commit
- Schedule for "cleanup week"

---

## 📋 Documentation During Fix Phase

### After Each Batch Completes:
1. **Update BUG.md**:
   - Add `[FIXED - Batch N]` marker to each resolved issue
   - Update total count (e.g., "70 → 64 remaining")
   
2. **Create Fix Summary Doc**:
   - File: `BUG_FIXES_BATCH_[N].md`
   - Content: Each fix commit message, code changes, test coverage

3. **Update Test Coverage**:
   - File: `TEST_COVERAGE.md`
   - Track coverage % per batch
   - Document new test cases

---

## 🚀 Execution Phase (Not Started)

**Status**: `PLANNING ONLY — NO EXECUTION`

When user approves, execution will follow:

```
Phase 1: Batch 1 Fixes (28h)
  ├─ Day 1-4: Implement fixes #1-3, #46-51
  ├─ Run tests after each fix
  └─ Commit to `fix/critical-batch-1` branch

Phase 2: Batch 2 Fixes (86h)
  ├─ Week 1-2: Teams A/B/C work in parallel
  ├─ Daily code reviews
  └─ Merge to main after QA

Phase 3: Batch 3 Fixes (70h)
  ├─ Week 3-4: MEDIUM priority issues
  └─ Combine with Iteration 3 testing

Phase 4: Batch 4 Fixes (20h)
  ├─ Week 5: Polish & low-priority
  └─ Final testing & release
```

---

## 📌 Iteration 3 Testing Plan (Detailed)

### Concurrent User Simulation
```
Test Setup:
  - 10 API endpoints calling placeBet simultaneously
  - Same user ID (to test race conditions)
  - Bet amounts: [10, 20, 50] spread across calls
  
Expected Behavior:
  - Each bet succeeds or fails atomically
  - Balance decrements by sum of successful bets
  - No negative balance
  - No duplicate payouts
  
Failure Indicators:
  - Balance goes negative
  - One bet deducted twice
  - Payout credited twice
```

### Network Split-Brain
```
Test Setup:
  - User logged in on phone (Tab A)
  - Same user opens app on browser (Tab B)
  - Bet in Tab A, then place second bet in Tab B
  
Expected Behavior:
  - Both bets process correctly
  - Balances sync between tabs
  - No race conditions
  
Failure Indicators:
  - Balance desync between tabs
  - One tab shows wrong balance
  - Bets not credited to correct user
```

---

## 🎓 Knowledge Base Updates Required

After fixes complete, update:
- `_knowledge/casino-architecture.md` — Add atomic transaction patterns
- `_knowledge/state-management.md` — Zustand persist best practices
- `_brain/Patterns.md` — Add "Provably Fair" pattern guide
- CLAUDE.md — Update known issues section

---

## ⏰ Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| Iteration 1 (User Scenarios) | 2h | Day 1 | Day 1 | ✅ Complete |
| Iteration 2 (Edge Cases) | 3h | Day 1 | Day 1 | ✅ Complete |
| Iteration 3 (Stress Test) | 4h | TBD | TBD | 📋 Planned |
| Iteration 4 (Device/A11y) | 5h | TBD | TBD | 📋 Planned |
| Iteration 5 (Security) | 4h | TBD | TBD | 📋 Planned |
| **Batch 1 Fixes** | 28h | TBD | TBD | 📋 Planned |
| **Batch 2 Fixes** | 86h | TBD | TBD | 📋 Planned |
| **Batch 3 Fixes** | 70h | TBD | TBD | 📋 Planned |
| **Batch 4 Fixes** | 20h | TBD | TBD | 📋 Planned |
| **Total Testing** | 16h | — | — | 📋 Planned |
| **Total Fixes** | 204h | — | — | 📋 Planned |

---

## ✅ Approval Gate

**Required Before Execution**:
- [ ] User confirms fix priority order
- [ ] User approves Batch 1 scope (#1-3, #46-51)
- [ ] User approves parallel team structure for Batch 2
- [ ] Resource allocation confirmed (dev time available)

**Sign-Off**:
Once approved, execution phase begins with Batch 1 fixes.

---

**Document Status**: Planning Phase Complete | Awaiting Approval for Execution
