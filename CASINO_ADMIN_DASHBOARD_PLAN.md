# 🛠️ Casino Royale - Admin Dashboard Master Plan

This plan outlines the implementation of a high-fidelity Admin Dashboard for auditing game logic and exploring historical bet data.

## 🎯 Vision
A premium, "Matrix-inspired" command center that gives the operator total visibility into the Casino's mathematical integrity and financial performance.

---

## 📋 Implementation Checklist

### 1. 🏗️ Foundation & Routing
- [ ] Create `src/app/admin` directory structure.
- [ ] Implement `AdminLayout` with a glassmorphism sidebar.
- [ ] Add Route Protection (Admin-only guard).
- [ ] Define shared Admin UI components (Cards, Tables, Modals).

### 2. 📊 Analytics Overview (Dashboard Home)
- [ ] Real-time "Pulse" monitoring: Wagered vs. Paid Out.
- [ ] Active sessions counter.
- [ ] Profit/Loss charts using `recharts`.
- [ ] "Recent Big Wins" live ticker.

### 3. 🧪 Audit Suite (Provably Fair Lab)
- [ ] **Game Selector**: Interactive cards for Dice, Crash, Slots, Roulette.
- [ ] **Simulation Engine**:
    - [ ] Parameter inputs (Number of runs, Seeds, Targets).
    - [ ] Progress bar for large simulations.
    - [ ] Visualization of results (Distribution histograms).
- [ ] **RTP Validator**: Automated check against theoretical Return-to-Player.
- [ ] **Bust-Rate Audit**: Specific for Crash to verify the 3% instant-bust integrity.

### 4. 📜 Historical Data Explorer
- [ ] **Global Bet History**:
    - [ ] Search by Transaction ID.
    - [ ] Filter by Game, User, or Result (Win/Loss).
    - [ ] Export to CSV/JSON functionality.
- [ ] **Detailed Bet Inspector**:
    - [ ] Visual breakdown of the result.
    - [ ] Copyable Seeds (Server Seed, Client Seed, Nonce).
    - [ ] Inline "Verify" button to re-calculate the hash locally.

### 👥 5. User Management (Optional/Future)
- [ ] List of all registered users.
- [ ] Manual balance adjustment (for support/testing).
- [ ] Level/XP override controls.

---

## 🎨 Design System (Vibe-Check)

| Element | Style |
| :--- | :--- |
| **Theme** | Ultra-Dark (Background: `#050505`) |
| **Accents** | Primary: `hsla(var(--primary), 1)` (Emerald), Error: `hsla(var(--destructive), 1)` (Ruby) |
| **Surfaces** | Glassmorphism (Blur: `12px`, Opacity: `0.05`) |
| **Typography** | Inter / Outfit (Monospace for Hashes/Seeds) |
| **Animations** | Framer Motion (Fade-in, Scale-up on hover) |

---

## 🛠️ Technical Components to Build

### `AdminAuditPanel.tsx`
The core component for triggering the Monte Carlo simulations we just ran in the terminal.
```typescript
interface AuditParams {
  game: 'DICE' | 'CRASH' | 'SLOTS' | 'ROULETTE';
  iterations: number;
  clientSeed: string;
}
```

### `BetHistoryTable.tsx`
A high-performance table with virtualization for handling thousands of records.

---

## 🚀 Execution Workflow
1. **Phase 1**: UI Skeleton & Sidebar navigation.
2. **Phase 2**: Integration of the Audit Logic (porting the `.mjs` script logic).
3. **Phase 3**: Historical Data view (mocked or connected to store).
4. **Phase 4**: Polish, Framer Motion transitions, and Mobile optimization.

---

*Plan created by Antigravity - Vibe-Architect*
*Date: 05.05.2026*
