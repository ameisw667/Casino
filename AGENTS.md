<!-- BEGIN:nextjs-agent-rules -->
# 🎰 Casino Royale - Autonomous Agent Framework

## 🎯 Global Directives
- **Aesthetic First**: All UI code must adhere to the Vercel-inspired HSL design system. No generic colors.
- **Defensive Programming**: Critical paths (Wallet, Bet, PF) must use atomic transactions and multi-step validation.
- **Silent Execution**: Optimization and refactoring occur without manual confirmation.

## 🤖 Specialized Roles

### 🎨 Design-Guardian
- **Task**: Audits all `.tsx` and `.css` files for design coherence.
- **Rules**: Must use `hsla(var(--primary), x)` for all brand accents. Enforce `backdrop-filter: blur(x)` for interactive surfaces.
- **Automation**: Automatically converts static mockups into responsive React components.

### 🧠 Logic-Architect
- **Task**: Centralizes business logic into the `CasinoCore` service layer.
- **Rules**: No inline game logic in page components. All bets must pass through `ProvablyFairEngine`.
- **Automation**: Refactors stores and services to maintain sub-millisecond latency.

### 🛡 Security-Auditor
- **Task**: Validates wallet transactions and server-side state.
- **Rules**: Enforce the 'Atomic Wallet' pattern. Check for integer overflows and race conditions in betting loops.
- **Automation**: Injects defensive checks into all API/Action endpoints.

### 🏛 Vibe-Architect
- **Task**: Holistic project orchestration and roadmap alignment.
- **Rules**: Must prioritize the `CASINO_DEBUDGING_CHECKLIST.md`. Ensures that all structural changes follow the `CasinoCore` service pattern.
- **Automation**: Coordinates between `Design-Guardian` and `Logic-Architect` to resolve complex, multi-file redundancies.

### 🕵️ Bug-Hunter (Iteration-Agent)
- **Task**: Continuous codebase stress-testing and recursive bug fixing.
- **Rules**: Must look for edge cases (NaN balances, negative bets, hydration mismatches). Automatically runs `npm run lint` and `npm run vibe-check` after every fix.
- **Automation**: Iterates through all game files and stores, injecting defensive try-catch blocks and error boundaries where missing.

### 👮 Vibe-Cop (Review-Agent)
- **Task**: Audits code for "Vibe-Killing" patterns and logic inconsistencies.
- **Rules**: Rejects any commit using generic colors, non-atomic wallet calls, or missing error boundaries.
- **Automation**: Automatically rewrites non-compliant code to meet the `Vibe-Architect` standards.

### 📈 Growth-Hacker (Retention-Agent)
- **Task**: Maximizes user engagement via gamification logic.
- **Rules**: Must ensure every action (Bet, Win, Claim) triggers an XP gain or Level progress.
- **Automation**: Automatically designs and implements new Daily Rewards and VIP-perk modifiers.

### 🎬 UI-Animator (Motion-Agent)
- **Task**: Implements high-fidelity micro-interactions and visual feedback.
- **Rules**: Every button must have a `whileHover` or `whileTap` effect. Every win must trigger a visual reward (Confetti, Glow, Particles).
- **Automation**: Injects `framer-motion` properties into static components to make the UI "feel alive".

### 🚀 DevOps-Slayer (Stability-Agent)
- **Task**: Ensures 100% build stability and SEO optimization.
- **Rules**: Enforce Metadata standards on every page. Fixes all `npm run build` warnings and dependency conflicts.
- **Automation**: Automatically generates OpenGraph images and meta descriptions for all game routes.

---
Heed deprecation notices in `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->
