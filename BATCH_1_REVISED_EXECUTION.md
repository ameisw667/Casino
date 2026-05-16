# Batch 1 Revised Execution Plan

**Status**: 2026-05-16 | Planning Phase Complete | Implementation Ready  
**Overall Progress**: 11% (Planning done, Implementation 0%)  
**Blocker Status**: 4 critical issues identified + pre-remediation plan documented  
**Next**: Begin implementation phase with Code-Reviewer on Fix #47

---

## 📊 Current Status Summary

```
Planning & Docs:  ████████████████████ 100%
Agent Reviews:    ████████████░░░░░░░░  60%
Code Changes:     ░░░░░░░░░░░░░░░░░░░░   0%
Bug Fixes:        ░░░░░░░░░░░░░░░░░░░░   0%
```

**Critical Findings**:
- Fix #47: Implementation never written (only tests) → 2h to complete
- Bug #49: 10 security findings → 5 pre-blockers (4h) before Phase B
- Pre-blockers: CSRF, Logger sanitization, Zustand, Env validation, Crash settlement

**Ready to Start**: ✅ YES — Implementation phase can begin immediately

---

## 🎯 Revised Priorities (Based on Review Findings)

### Immediate Actions (Next 2 Hours)

#### 1️⃣ Implement Fix #47: Dice Max Bet Overflow (BLOCKED → IMPLEMENTATION PHASE)
**Effort**: 2h (was marked complete, but implementation missing)  
**Blocker Status**: Code-Reviewer found that `calculateDicePayout` + `MAX_BET` export were never written

**Required Actions**:
```
In src/lib/casino/casino-core.ts:

1. Add: export const MAX_BET = 100_000_000;

2. Add function:
   export function calculateDicePayout(
     bet: number, 
     multiplier: number, 
     win: boolean
   ): number {
     // BigInt scaling implementation per test spec
     // Scale by 10k, multiply in BigInt, convert back
   }

3. Update placeBet DICE branch (line 54):
   - Replace: payout = win ? params.amount * (params.multiplier || 0) : 0;
   - With: payout = calculateDicePayout(params.amount, params.multiplier || 0, win);
```

**Agent**: code-reviewer (aefa6ce6588945a2c) — implement from test spec  
**Timeline**: 2h  
**Next**: Run tests, verify all 16 pass

---

#### 2️⃣ Pre-Blockers for Bug #49 Phase B (CRITICAL SECURITY FIXES)
**Effort**: 3h (must complete before Phase B implementation starts)

These 5 items are security-blocking and can be done in parallel:

| Task | Effort | File | Description |
|------|--------|------|-------------|
| **C-2** | 1h | `src/middleware.ts` | Fix CSRF `includes()` → exact-match origin validation |
| **H-4** | 1h | `src/lib/casino/logger.ts` | Sanitize `CasinoLogger.error()` — strip seed/key/token fields |
| **H-5** | 0.5h | `src/store/useCasinoStore.ts` | Add `clientSeed` to Zustand `partialize` exclusion list |
| **C-4** | 0.5h | `next.config.ts` | Add startup validation for `SEED_ENCRYPTION_KEY` + `SEED_REVEAL_HMAC_KEY` |
| **H-6** | 2h | `src/lib/casino/wallet.ts` | Rewrite crash settlement to atomic stored procedure (SELECT FOR UPDATE) |

**Parallel Execution**: Can run TDD-Guide + Security-Reviewer on multiple pre-blockers simultaneously

---

### Phase 1: Day 1 (Today) — 5 Hours

```
09:00-11:00 | Fix #47 Implementation (2h) — from test spec to code
11:00-12:00 | C-2 CSRF Middleware Fix (1h) — tdd-guide
12:00-13:00 | H-4 Logger Sanitization (1h) — tdd-guide
13:00-14:00 | H-5 Zustand clientSeed (0.5h) + C-4 Env Validation (0.5h) — parallel
14:00-16:00 | H-6 Crash Settlement Refactor (2h) — architect + code-reviewer

DELIVERABLE: #47 implementation complete, 4 of 5 pre-blockers done
```

---

### Phase 2: Day 2 (Wed) — Bug #49 Phase A + Remaining Pre-Blockers

```
09:00-11:00 | Complete H-6 Crash Settlement (remaining 1h)
11:00-12:00 | F3 Logger Sanitization (additional seed-specific guards) (1h)
12:00-14:00 | #49 Phase A: Console removal + seed storage guards (2h)
14:00-15:00 | Code review all pre-blockers + Phase A
15:00-16:00 | Security audit pre-blockers for effectiveness

DELIVERABLE: All 5 pre-blockers + Phase A complete, ready for Phase B
```

---

### Phase 3: Day 3-4 (Thu-Fri) — Bug #49 Phase B Implementation

```
Day 3:
09:00-12:00 | API endpoint implementation: /seed/commit + /seed/reveal (3h)
12:00-13:00 | Database migration 004 (encryption schema)
13:00-16:00 | Client-side refactor: placeBet async, Zustand slice (3h)

Day 4:
09:00-11:00 | Key management + startup validation
11:00-12:00 | Rate limiting middleware integration
12:00-14:00 | Testing (unit + integration)
14:00-16:00 | Security review of implementation

DELIVERABLE: Bug #49 Phase B fully implemented + tested
```

---

## 🔴 Critical Path Dependencies

```
Fix #50 (XP Overflow)
  └─ APPROVED ✅ — can merge anytime

Fix #47 (Dice Overflow)
  ├─ IMPLEMENT calculateDicePayout() [2h] ← BLOCKS Phase 1
  └─ MERGE after tests pass

Pre-Blockers (5 items)
  ├─ C-2: CSRF fix [1h]
  ├─ H-4: Logger sanitization [1h]
  ├─ H-5: Zustand exclusion [0.5h]
  ├─ C-4: Env validation [0.5h]
  └─ H-6: Crash settlement [2h] ← BLOCKS Phase B
  
Bug #49 Phase A (Console removal)
  ├─ Depends on: H-4 + H-5 complete
  └─ 2h effort

Bug #49 Phase B (Server seed move)
  ├─ Depends on: All 5 pre-blockers + Phase A complete
  └─ 6h effort (split across 2 days)

Bug #46 (JWT Refresh) — can parallelize with Phase 2-3 [6h]
Bug #48 (Crash Network Lag) — can parallelize with Phase 2-3 [7h]
Bug #51 (CSRF Affiliate) — depends on C-2 fix, then 5h effort
```

---

## 📊 Updated Time Estimation

| Task | Original | Blocked | Actual | Effort |
|------|----------|---------|--------|--------|
| #50 XP Overflow | 4h | No | ✅ 4h | Complete |
| #47 Dice Overflow | 4h | Yes (impl missing) | 2h | Implement now |
| Pre-Blockers (5) | 0h | New | 3-4h | Must do first |
| F3 Logger Sanitization | 1h | Partial | 1.5h | Enhanced for seeds |
| #49 Phase A | 2h | Dep: Pre-blockers | 2h | After pre-blockers |
| #49 Phase B | 6h | Dep: Pre-blockers | 6h | After all pre-blockers |
| #46 JWT Refresh | 6h | No | 6h | Parallelize Phase 2-3 |
| #48 Crash Network | 7h | No | 7h | Parallelize Phase 2-3 |
| #51 CSRF/Auth | 5h | Dep: C-2 | 5h | After C-2 |
| F5 Origin validation | 1h | No | 1h | Part of #51 |

**Revised Total**: 31h + 4h (pre-blockers) = **35 hours** for full Batch 1

---

## 🎯 Agent Assignments (Revised)

### Day 1 Focus

| Agent | Tasks | Effort |
|-------|-------|--------|
| **Code-Reviewer** | Implement #47 from test spec | 2h |
| **TDD-Guide** | C-2 CSRF fix + H-4 Logger + H-5 Zustand | 2.5h |
| **Architect** | H-6 Crash settlement refactor | 2h |

### Day 2 Focus

| Agent | Tasks | Effort |
|-------|-------|--------|
| **Security-Reviewer** | Audit pre-blockers + Phase A | 2h |
| **TDD-Guide** | #49 Phase A console removal | 2h |
| **Code-Reviewer** | Review all Day 1-2 outputs | 2h |

### Day 3-4 Focus

| Agent | Tasks | Effort |
|-------|-------|--------|
| **Architect** | #49 Phase B server seed architecture | 3h |
| **Code-Reviewer** | Implementation quality review | 2h |
| **Security-Reviewer** | Pen-test Phase B implementation | 1h |
| **TDD-Guide** | Integration + E2E tests | 2h |

---

## 🚨 Blocker Remediation

### Blocker 1: Fix #47 Implementation Missing
**Root Cause**: TDD-Guide completed tests but stopped before GREEN (implementation)  
**Fix**: Have Code-Reviewer implement `calculateDicePayout` directly from test spec (2h)  
**Prevention**: In future TDD cycles, ensure GREEN phase includes actual code changes

### Blocker 2: Bug #49 Security Findings (10 total)
**Root Cause**: Architecture designed without security validation pass  
**Fix**: Implement 5 pre-blockers before Phase B starts (3-4h)  
**Prevention**: Always pair architect with security-reviewer early

### Blocker 3: H-6 Crash Settlement Atomic Operation
**Root Cause**: TOCTOU vulnerability in existing code exposed by audit  
**Fix**: Rewrite settlement query as single stored procedure (2h)  
**Impact**: Affects Bug #49 seed reveal atomicity

---

## ✅ Success Criteria for Batch 1

- [ ] Fix #50 merged (XP Overflow)
- [ ] Fix #47 fully implemented + tested (Dice Overflow)
- [ ] All 5 pre-blockers fixed + tested
- [ ] Fix #49 Phase A complete (console removal)
- [ ] Fix #49 Phase B fully implemented + security tested
- [ ] Fix #46 complete (JWT Refresh)
- [ ] Fix #48 complete (Crash Network Lag)
- [ ] Fix #51 complete (CSRF/Auth/Rate Limiting)
- [ ] All fixes pass `npm run vibe-check`
- [ ] All fixes pass `npm run build`
- [ ] Coverage ≥80% per file
- [ ] Code-Reviewer approval on all
- [ ] Security-Reviewer approval on all (#49-#51)

---

## 📝 Execution Checkpoints

**Checkpoint 1 (End of Day 1)**: 
- [ ] Fix #47 implementation complete + tests passing
- [ ] C-2, H-4, H-5, C-4 complete + tested
- [ ] H-6 75% complete

**Checkpoint 2 (End of Day 2)**:
- [ ] All 5 pre-blockers complete + security reviewed
- [ ] Fix #49 Phase A complete
- [ ] Fix #46 started

**Checkpoint 3 (End of Day 4)**:
- [ ] Bug #49 Phase B fully implemented
- [ ] Fix #48 + #51 complete
- [ ] All tests passing
- [ ] Ready for Batch 2

---

**Document Status**: Revised execution plan | Ready to resume implementation
