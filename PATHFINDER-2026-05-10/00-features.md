# 🎰 Casino Royale - Feature Inventory & Boundaries

**Analysis Date**: 2026-05-10  
**Project**: Casino Royale (Next.js + Zustand + Web Crypto)  
**Codebase Size**: ~969 LOC per game module (Crash), 11k+ total in src/

---

## 📊 Feature Boundaries

### **FEATURE 1: Game Engine Core**
- **Purpose**: Centralized game logic orchestration
- **Entry Points**: 
  - `src/lib/casino/casino-core.ts:25` — CasinoCore class
  - `src/lib/casino/provably-fair.ts:11` — ProvablyFairEngine class
- **Core Files**:
  - `casino-core.ts` — BetResult interface, GameType union, placeBet() async method
  - `provably-fair.ts` — Server seed generation, SHA-256 hashing, verification
  - `logger.ts` — CasinoLogger service
- **Dependencies**: Web Crypto API, Zustand store (useCasinoStore)
- **Status**: ✅ Centralized (per AGENTS.md directive)

---

### **FEATURE 2: Crash Game**
- **Purpose**: Exponential multiplier game with live feed
- **Entry Points**:
  - `src/app/games/crash/page.tsx:29` — CrashPage component (969 LOC)
- **Core Files**:
  - `crash/page.tsx` — Monolithic page component
- **Responsibilities** (inline):
  - Bet placement & validation (line 43-49)
  - Canvas animation & particle system (line 70-81)
  - Game loop & multiplier calculation (line 88-89)
  - Live bets tracking (line 50)
  - Auto-cashout logic (line 47-49)
  - Auto-bet mode (line 57-63)
  - Audio management (line 92-99)
  - UI rendering & event handlers (entire component)
- **Dependencies**: useCasinoStore, framer-motion, lucide-react icons
- **Problems**: 
  - 🔴 Monolithic: 969 lines, UI + logic mixed
  - 🔴 Duplicated: Bet placement likely duplicated in Dice/Roulette/Slots

---

### **FEATURE 3: Dice Game**
- **Purpose**: Simple binary outcome game (Over/Under target)
- **Entry Points**:
  - `src/app/games/dice/page.tsx` — DicePage component
- **Core Files**:
  - `dice/page.tsx`
- **Responsibilities** (likely duplicated):
  - Bet placement
  - Target/condition selection
  - Result display
- **Dependencies**: useCasinoStore, CasinoCore.placeBet()
- **Status**: 🔴 Unknown structure (not read)

---

### **FEATURE 4: Roulette Game**
- **Purpose**: Multi-bet roulette (STRAIGHT, COLOR, EVEN_ODD, RANGE, DOZEN, COLUMN, FRENCH)
- **Entry Points**:
  - `src/app/games/roulette/page.tsx` — RoulettePage component
- **Core Files**:
  - `roulette/page.tsx`
- **Responsibilities** (likely duplicated):
  - Multi-bet selection
  - Wheel animation
  - Payout calculation
- **Dependencies**: useCasinoStore, CasinoCore.placeBet() with RouletteBet[] param
- **Status**: 🔴 Unknown structure (not read)

---

### **FEATURE 5: Slots Game**
- **Purpose**: Multi-reel game with wild symbols & multipliers
- **Entry Points**:
  - `src/app/games/slots/page.tsx` — SlotsPage component
- **Core Files**:
  - `slots/page.tsx`
- **Responsibilities** (likely duplicated):
  - Reel animation
  - Symbol matching
  - Multiplier & wild logic
- **Dependencies**: useCasinoStore, CasinoCore.placeBet()
- **Status**: 🔴 Unknown structure (not read)

---

### **FEATURE 6: User State & Gamification**
- **Purpose**: Wallet, XP, VIP tiers, achievements, challenges, daily rewards
- **Entry Points**:
  - `src/store/useCasinoStore.ts:1` — Zustand store
- **Core Files**:
  - `useCasinoStore.ts` — Single store file with all state
- **State Slices**:
  - Balance, XP, level, rank (line 54-57)
  - Bets history, crash history (line 58-59)
  - Achievements, challenges (line 60-61)
  - VIP_TIERS enum (line 17-23)
  - Toast notifications (line 46-51)
  - Auto-bet settings per game (implied)
  - Game stats per game (implied)
- **Dependencies**: Zustand + persist middleware
- **Status**: ✅ Centralized in one store

---

### **FEATURE 7: UI Component Library**
- **Purpose**: Reusable design system (HSL-based, Vercel-inspired)
- **Entry Points**:
  - `src/components/ui/` — ShadcN/Radix components
  - `src/app/design-system/` — Design system showcase page
- **Core Files**: Multiple UI component files (not enumerated)
- **Dependencies**: Radix UI, TailwindCSS, HSL color system
- **Status**: ✅ Modular

---

### **FEATURE 8: Game History & Analytics**
- **Purpose**: Track past bets, wins/losses, statistics
- **Entry Points**:
  - `src/app/history/page.tsx` — History page
- **Dependencies**: useCasinoStore.bets history
- **Status**: 🔴 Unknown implementation

---

### **FEATURE 9: Leaderboard & Ranking**
- **Purpose**: Global rank tracking, seasonal competition
- **Entry Points**:
  - `src/app/leaderboard/page.tsx` — Leaderboard page
- **Dependencies**: useCasinoStore.rank, game stats
- **Status**: 🔴 Unknown implementation

---

### **FEATURE 10: Admin Dashboard**
- **Purpose**: Moderation, server seed management, user suspension
- **Entry Points**:
  - `src/app/admin/page.tsx`
- **Status**: 🔴 Unknown scope

---

### **FEATURE 11: Affiliate Program**
- **Purpose**: Referral tracking and rewards
- **Entry Points**:
  - `src/app/affiliate/page.tsx`
- **Status**: 🔴 Unknown scope

---

### **FEATURE 12: Vault (Security & Fairness)**
- **Purpose**: Display server seed hash, allow verification
- **Entry Points**:
  - `src/app/vault/page.tsx`
- **Dependencies**: ProvablyFairEngine.verifyHash()
- **Status**: 🔴 Unknown implementation

---

### **FEATURE 13: Authentication & Onboarding**
- **Purpose**: Sign-up, sign-in, profile management
- **Entry Points**:
  - `src/app/sign-in/page.tsx`
  - `src/app/sign-up/page.tsx`
  - Clerk integration (via @clerk/nextjs)
- **Status**: ✅ Delegated to Clerk

---

## 🎯 Feature Boundaries Summary

| Feature | Type | Status | LOC Est. | Risk |
|---------|------|--------|----------|------|
| Game Engine (Core + PF) | Service | ✅ Centralized | ~200 | 🟡 Critical |
| Crash Game | Page | 🔴 Monolithic | 969 | 🔴 High |
| Dice Game | Page | ❓ Unknown | ~600? | 🔴 High |
| Roulette Game | Page | ❓ Unknown | ~800? | 🔴 High |
| Slots Game | Page | ❓ Unknown | ~700? | 🔴 High |
| State/Gamification | Store | ✅ Centralized | ~300 | 🟡 Medium |
| UI Components | Library | ✅ Modular | ~2k | 🟢 Low |
| History | Page | ❓ Unknown | ~300? | 🟢 Low |
| Leaderboard | Page | ❓ Unknown | ~300? | 🟢 Low |
| Admin | Page | ❓ Unknown | ~400? | 🔴 High |
| Affiliate | Page | ❓ Unknown | ~300? | 🟢 Low |
| Vault | Page | ❓ Unknown | ~200? | 🟢 Low |
| Auth | Delegated | ✅ Clerk | 0 | 🟢 Low |

---

## 🚨 Observed Issues in Feature Boundaries

1. **Monolithic Game Pages**: Each game page (Crash: 969 LOC) mixes:
   - Bet placement logic
   - Canvas/animation logic
   - Audio management
   - Store interaction
   - UI rendering
   
   → Should be split into: GameLogic → GameCanvas → GameUI

2. **Duplicated Bet Flow**: All games likely implement:
   - Bet validation
   - Store debit/credit
   - CasinoCore.placeBet() call
   - Result processing & payout
   
   → Should be extracted to shared GameBetController

3. **State Management**: Single massive useCasinoStore with all slices
   - 👍 Good: Centralized
   - 👎 Bad: All games subscribe to all state changes (re-render waste)
   - → Should use Zustand selectors (already done per line 31-41, but verify consistency)

4. **No Explicit API Boundary**: `src/app/api/` exists but not explored
   - Unknown if games call API or use client-side only
   - Per MASTER_PLAN: "Server-Side State Transition" is TODO (line 1.4)
   - **Risk**: Wallet balance manipulable via browser console

---

## ✅ Feature Boundary Approval

- **Status**: Ready for Phase 1 (Per-Feature Flowcharts)
- **Notes**: 
  - 4 game pages (Crash, Dice, Roulette, Slots) are primary risk areas
  - Core services (CasinoCore, ProvablyFairEngine) are well-isolated
  - Need to read Dice/Roulette/Slots pages to confirm duplication suspicion
