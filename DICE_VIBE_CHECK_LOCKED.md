# 🎲 Dice Game - Final Specification & Visual Lock

> [!IMPORTANT]
> **STATUS: VISUAL & FUNCTIONAL LOCK (VIBE-READY)**
> As of May 7, 2026, the Dice game has reached its final "world-class" state. No further visual adjustments, layout shifts, or functional refactors are permitted without explicit architectural review.

## 🎨 Visual Identity (Design-Guardian Approved)
The Dice game adheres to the premium **Casino Royale Obsidian/Gold** design system.

- **Holographic Results**: Radial success/loss glows with spring-animated result badges.
- **Magnetic Slider**: Thick, glossy track with `linear-gradient(hsla(var(--success)))` win-zones and a pointer-based magnetic thumb.
- **Glassmorphic Controls**: "Cockpit-style" input grid using `backdrop-filter: blur(10px)` and `hsla(var(--surface-raised), 0.5)`.
- **Responsive Layout**: Full mobile optimization with `order`-based stacking (Main area -> Sidebar).
- **Subtle Motion**: Every interaction (Bet, Tab Switch, Slider Drag) uses `framer-motion` with `cubic-bezier(0.16, 1, 0.3, 1)` easing.

## ⚙️ Core Functionality (Logic-Architect Verified)
- **Manual Mode**: Precise slider-based target selection (Roll Over/Under).
- **Advanced Auto-Mode**:
  - **Custom Interval**: User-defined delay (seconds) between bets.
  - **Risk Management**: "On Win" / "On Loss" percentage modifiers.
  - **Safety Limits**: Automatic stops for Profit, Loss, and total Number of Bets.
- **Instant Settlement**: Direct balance integration with sub-millisecond updates.
- **Live Activity**: Real-time sidebar feed with success-glows for winning bets.

## 🛡 Security & Fairness (Security-Auditor Verified)
- **Provably Fair**: Full integration with the `ProvablyFairEngine` using SHA-256 server/client seed handshakes.
- **Atomic Transactions**: Betting logic is protected against race conditions and balance overflows.
- **Safety Caps**: $10,000 max bet limit and 500-bet auto-mode safety cutoff.

## 📝 Change Log (Recent Modernization)
- [x] Refactored legacy slider to "Magnetic Glow" system.
- [x] Replaced standard result text with "Holographic" animated badge.
- [x] Implemented "Bet Interval" logic for Auto-mode.
- [x] Fixed sidebar overflow bug to prevent "Bet" button disappearance.
- [x] Standardized all colors to `hsl(var(--primary))` and `hsla(var(--glass-border))`.

---
*Created by Antigravity on behalf of the User.*
*This document serves as the ground truth for the Dice module. Any deviation from these specs is considered a 'Vibe-Kill'.*
