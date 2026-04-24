# Mobile Responsiveness Implementation Plan

The goal is to transform the current desktop-centric Casino platform into a fully responsive, high-fidelity mobile experience. This plan addresses layout structure, interaction models, and styling systems.

## Phase 1: Core Systems & Layout
- [x] **Define Responsive Breakpoints & Tokens**: Add standard breakpoints (`--sm`, `--md`, `--lg`) and responsive spacing variables to `globals.css`.
- [x] **Implement Responsive MainLayout**: Update `MainLayout.tsx` to use a flexible grid/flex layout that hides the sidebar on mobile and introduces a mobile-first container.
- [x] **Mobile-First Sidebar (Drawer)**: Convert the desktop sidebar into a slide-out drawer for mobile users.
- [x] **Responsive Topbar Optimization**: Adjust the topbar to prioritize essential info (Balance, Level) and hide labels on mobile.
- [x] **Bottom Navigation Bar**: Add a `MobileNav` component for quick access to Lobby, Games, Chat, and Profile on small screens.
- [x] **Mobile Chat Implementation**: Transition the chat sidebar into a full-screen or half-screen overlay for mobile.

## Phase 2: Page & Component Polish
- [x] **Fluid Typography System**: Replace fixed font sizes with `clamp()` or media queries in `globals.css` for all headings and body text.
- [x] **Hero Section Overhaul**: Update `page.tsx` hero section to stack content vertically and adjust image positioning for mobile.
- [x] **Games Grid Refinement**: Optimize the auto-fit grid to handle single-column layouts on mobile with proper card scaling.
- [x] **Responsive Banner Components**: Update promotional and secondary banners to handle text wrapping and image aspect ratios on mobile.
- [x] **Stats & Ticker Optimization**: Stack stats cards and ensure tickers don't break horizontal layouts.
- [x] **Table Responsiveness (Global)**: Implement a `.responsive-table` utility that handles horizontal scrolling and maintains readability.

## Phase 3: Interactive Elements & Modals
- [x] **Touch-Friendly Inputs**: Scale buttons and inputs to meet minimum touch target sizes (44px) on mobile.
- [x] **Responsive Modals**: Update all modals to use 95% width and appropriate heights on mobile devices.
- [x] **Toast Notification Scaling**: Adjust toast positioning and width for mobile viewports.

## Phase 4: Game-Specific Mobile Optimization
- [x] **Dice Game Mobile Polish**: Refine the sidebar/main area stacking and control sizing for mobile dice players.
- [x] **Crash Game Mobile Polish**: Ensure the rocket graph and betting controls are accessible on small screens.
- [x] **Roulette Mobile Polish**: Optimize the betting grid for touch interactions and center the 3D wheel on mobile.

## Phase 5: Finalization
- [x] **Global CSS Utility Audit**: Move inline responsive styles to `globals.css` utility classes for maintainability. (Note: Most are implemented as isMobile for dynamic React logic).
- [ ] **Final Visual Audit & Bug Squashing**: Test all transitions, overlays, and edge cases on various mobile viewport sizes.

*Created by Antigravity*
