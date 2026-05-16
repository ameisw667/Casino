# Batch 1 Execution Plan (REVISED)

**Status**: 2026-05-16 | Execution Phase Started | Security Audit Complete

---

## 🔴 Revised Batch 1 Scope (CRITICAL Issues)

After TDD-Guide + Security-Reviewer audit, Batch 1 has been expanded and reprioritized:

### Original Batch 1 Issues
- #46 JWT Refresh (6h)
- #47 Dice Overflow (4h)
- #48 Crash Network Lag (7h)
- #49 Seed Exposure (2h → **8h** — architectural refactor)
- #50 XP Overflow (4h)
- #51 CSRF Affiliate (5h → **6h** — multi-layer fix + auth + rate limiting)

### New Critical Issues Found in Audit (Must Add)
- **F2 HIGH**: `clientSeed` localStorage persistence (1h)
- **F3 MEDIUM**: Logger sanitization for seed values (1h)
- **F5 MEDIUM**: CSRF origin check refactor (1h)

### Revised Total for Batch 1
**Original**: 28 hours  
**Revised**: 28 + 3 (new audit issues) = **31 hours**

---

## 📊 Execution Schedule (Week 1)

### Day 1 (Today)
**Focus**: Math & Security quick wins (9h)

| Time | Task | Effort | Agent |
|------|------|--------|-------|
| 09:00-13:00 | Fix #50: XP Overflow (BigInt) | 4h | code-reviewer |
| 13:00-15:00 | Fix #47: Dice Overflow (Math precision) | 4h | code-reviewer |
| 15:00-16:00 | Fix F3: Logger Sanitization | 1h | security-reviewer |

**Deliverable**: 3 fixes complete, tests passing, PR ready

---

### Day 2-3 (Wed-Thu)
**Focus**: Security architectural fixes (14h)

| Time | Task | Effort | Agent |
|------|------|--------|-------|
| 09:00-17:00 | Fix #49 Phase A: Remove console/logger from seeds | 4h | tdd-guide + security-reviewer |
| 09:00-17:00 | Fix #49 Phase B: Move seed generation to server API | 6h | architect + code-reviewer |
| 09:00-12:00 | Fix F2: Exclude clientSeed from Zustand persist | 1h | code-reviewer |
| 13:00-15:00 | Fix #51: Auth layer + CSRF setup | 3h | security-reviewer + code-reviewer |

**Deliverable**: Seeds moved to server, CSRF architecture in place, logger sanitized

---

### Day 4-5 (Fri-Mon)
**Focus**: Network resilience + finishing (17h)

| Time | Task | Effort | Agent |
|------|------|--------|-------|
| 09:00-17:00 | Fix #46: JWT Refresh middleware | 6h | architect + code-reviewer |
| 09:00-17:00 | Fix #48: Crash game network resilience | 7h | code-reviewer |
| 13:00-15:00 | Fix F5: CSRF origin validation refactor | 1h | security-reviewer |
| 15:00-16:00 | Complete #51: Rate limiting + full auth | 2h | security-reviewer |
| 16:00-17:00 | Test integration, vibe-check | 1h | — |

**Deliverable**: All Batch 1 fixes complete, integrated tests passing

---

## 🎯 Fix Priority Order (by Dependency)

```
1. #50 (XP Overflow) — independent math fix
2. #47 (Dice Overflow) — independent math fix
3. F3 (Logger Sanitization) — improves #49 security
4. #49 Phase A (Console removal) — quick win, prerequisite for Phase B
5. #49 Phase B (Server seed move) — requires Phase A complete, impacts other fixes
6. F2 (clientSeed exclusion) — must happen before shipping seed changes
7. #51 Auth + CSRF setup — prerequisite for rate limiting
8. #46 (JWT Refresh) — independent middleware, safe to parallelize
9. #48 (Crash Network Lag) — safe to parallelize with #46
10. F5 (Origin validation) — prerequisite for #51 completion
11. #51 Rate Limiting — depends on auth layer complete
```

---

## 🔧 Agent Assignments

### TDD-Guide (Agent: a30e0e88ad2ba84a3)
- **Tasks**: #50, #47, #49 Phase A tests
- **Output**: Test files (provably-fair.test.ts, casino-core.test.ts)
- **Status**: Ready (continuing from previous context)

### Security-Reviewer (Agent: a469f956269752924)
- **Tasks**: F3 sanitization, #49 Phase B design, #51 auth/CSRF architecture, F5 origin validation
- **Output**: Detailed security specs for each fix
- **Status**: Ready (continuing from previous context)

### Code-Reviewer
- **Tasks**: Code quality review after each fix implementation
- **Status**: To be engaged after fixes written

### Architect
- **Tasks**: #49 Phase B server-side architecture, #46 JWT refresh flow
- **Status**: To be engaged for complex refactors

---

## ✅ Testing Requirements for Batch 1

Each fix must have:
1. **Unit test** (failing before fix, passing after)
2. **Integration test** (full flow, end-to-end)
3. **Security test** (for bugs #49, #51, etc.)
4. **Pass `npm run vibe-check`**
5. **Pass `npm run build`**

**Coverage Target**: 80%+ for all modified files

---

## 📋 Dependency Chain

```
#50 (XP Overflow) ✓ independent
#47 (Dice Overflow) ✓ independent
F3 (Logger Sanitization)
  └─ #49 Phase A (Console removal)
     └─ #49 Phase B (Server seed move) ← blocks shipping
        └─ F2 (clientSeed exclusion)
           └─ Ready to test

#51 Auth Layer
  └─ #51 Rate Limiting
     └─ F5 (Origin validation)
        └─ #51 complete

#46 (JWT Refresh) ✓ independent (parallelize)
#48 (Crash Network Lag) ✓ independent (parallelize)
```

---

## 🚨 Blockers & Risks

| Risk | Mitigation |
|------|-----------|
| Seed refactor requires Supabase RLS setup | Verify migration 003 applied, test with server client |
| JWT refresh loop could cause infinite loops | Add backoff, test 1-hour expiry scenario |
| Crash network lag fix is complex state machine | Use deterministic timeout + test framework |
| #51 rate limiting requires external service (Upstash) | Mock in dev, configure env var for API key |

---

## 📝 Approval Checklist

Before starting Day 1:

- [x] Security audit complete (F1-F7 findings documented)
- [x] Batch 1 scope revised (31 hours total)
- [x] Agent assignments clear (TDD, Security, Code-Reviewer)
- [x] Dependency chain mapped
- [x] Testing strategy defined
- [x] Blockers identified

**Ready to Execute**: ✅ YES

---

## 🎬 Next Steps

1. **Immediately** (within 1h):
   - Continue with TDD-Guide on test files (#50, #47)
   - Engage Security-Reviewer on sanitization spec (F3)
   
2. **Within 2h**:
   - Code implementations begin (Day 1 tasks: #50, #47)
   - Security specs finalized for #49 Phase B
   
3. **Day 2**:
   - #49 Phase A/B implementation with architect
   - #51 auth layer design with security-reviewer

4. **Daily**:
   - Code review after each fix
   - Run `npm run vibe-check` + `npm run build`
   - Update this doc with completion status

---

**Execution Status**: 🟢 READY | First fixes queued with TDD-Guide and Security-Reviewer
