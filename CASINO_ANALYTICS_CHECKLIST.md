# 📊 Casino Royale - Behavioral Analytics & Retention Checklist

This document outlines the implementation plan for the advanced behavioral analytics and user behavior tracking system requested for the `My Bets` (Earning History) module.

## 🎯 Primary Objectives
- [ ] **Quantify Engagement**: Track how often a user plays vs. wins.
- [ ] **Visualize Habits**: Identify "Favorite Games" and peak activity times.
- [ ] **Gamify Retention**: Link analytics to the XP/Leveling system.
- [ ] **Defensive Analysis**: Detect potentially problematic betting patterns early.

---

## 🛠 Phase 1: Data Architecture Updates
*Extend the `useCasinoStore` to track granular metrics.*

- [x] **Game-Specific Metrics**:
  - [x] `totalSpins`: Count of every action taken.
  - [x] `averageBetSize`: Calculated per game and globally.
  - [x] `peakWinMultiplier`: The highest multiplier hit per game.
- [x] **Temporal Tracking**:
  - [x] `sessionDuration`: Time spent active in a single visit.
  - [x] `activityHeatmap`: Track bet counts per hour of the day.

- [x] **Transaction Categorization**:
  - [x] Support for `BONUS` types (Daily Reward, Promo Codes, Rakeback).
  - [x] Support for `WITHDRAWAL` / `CASHOUT` events in the history array.


---

## 📈 Phase 2: UI/UX Analytics Dashboard
*Transform the current history page into a full performance hub.*

- [x] **"Your Top Game" Integration**: 
  - [x] Identified and highlighted the top game module.
  - [x] Implemented a dedicated "Game Performance Breakdown" table.
- [x] **Elevated Visuals**: 
  - [x] Reorganized layout to put Behavioral Badges in a high-visibility top section.
  - [x] Compacted main stats overview for a professional, dashboard-like feel.
- [x] **Streak Tracker**:
  - [x] Display current "Winning Streaks" in a dedicated card.
- [x] **Behavioral Badges**:
  - [x] "Early Bird": Most bets placed before 9 AM.
  - [x] "High Roller": Average bet exceeds $100.
  - [x] "Precision Striker": Highest win rate in a single session.



---

## 🛡 Phase 3: Security & Responsible Gaming
*Use analytics for user protection.*

- [x] **Loss Limit Alerts**: Notify user when session losses exceed a predefined threshold.
- [x] **Pattern Recognition**: Detect if a user is increasing bets exponentially after losses (Martingale detection).
- [x] **Cool-down Suggestion**: Automated advice to take a break after high-intensity sessions.


---

## 🚀 Implementation Priority
1. **Infrastructure**: Update `CasinoState` interface and `processGameResult` logic.
2. **Persistence**: Ensure metrics are saved to `localStorage` and synced with DB.
3. **Visualization**: Build the interactive charts in `src/app/history/page.tsx`.
4. **Feedback Loop**: Link metrics to **Daily Missions** and **XP Multipliers**.

---

> [!NOTE]
> Use `date-fns` for complex temporal analysis and `framer-motion` for smooth, alive-feeling chart transitions.

> [!IMPORTANT]
> All behavioral data must be anonymized before being sent to external tracking services (if any).
