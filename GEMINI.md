# Casino Royale Project Instructions

## Project Overview
Casino Royale is a premium, high-fidelity Next.js-based crypto casino prototype. It currently operates as a fully playable frontend demo featuring four original games (Crash, Dice, Roulette, Slots), a Provably Fair engine, a VIP system, and gamification mechanics. The project relies on robust client-side state management (Zustand) to simulate a real-time multiplayer casino environment without a production backend.

The project emphasizes a "Vibe-Coding" aesthetic, utilizing glassmorphism, fluid animations (Framer Motion), and a premium neon-gold color palette.

## Building and Running

The project is bootstrapped with `create-next-app` and uses standard Next.js commands:

- **Start Development Server:**
  ```bash
  npm run dev
  ```
  Open `http://localhost:3000` in your browser.

- **Static Analysis (Linting):**
  ```bash
  npm run lint
  ```
  Ensures code quality, finds syntax errors, and checks for TypeScript conflicts.

- **Production Build:**
  ```bash
  npm run build
  ```
  Validates Next.js optimizations and ensures all dynamic routes generate correctly.

- **Dependency Audit:**
  ```bash
  npm audit
  ```

## Development Conventions & Standards

### Architecture & State Management
- **State Management:** The centralized source of truth is `useCasinoStore` (`src/store/useCasinoStore.ts`), powered by Zustand. All simulated backend logic, balances, XP, bets, and UI states (like `isMobile`) live here.
- **Type Safety:** Strict TypeScript adherence is required. No `any` types in critical paths (Wallet, Bets, Game Logic).
- **Component Integrity:** Prefer atomic layouts and explicit composition. Avoid disabling linters or bypassing the type system.

### Mobile-First Design & Layout Stability
- **Mobile-First:** Design for the iPhone 15 baseline (393px width) first, then scale up.
- **Responsive Logic:** Use the `isMobile` boolean from `useCasinoStore` for conditional rendering and complex layout switches.
- **Fluid Typography:** Use CSS `clamp()` for typography and spacing rather than fixed pixel values.
- **Touch Targets:** All interactive elements must be at least 44px x 44px.
- **Persistent UI:** Account for the `MobileNav` height (`72px`) when positioning fixed or sticky elements on mobile (e.g., `bottom: 72px`). Always respect `env(safe-area-inset-bottom)`.
- **Layout Stability:** Avoid dynamic CSS functions like `repeat(auto-fill, ...)` if they cause layout jumps during re-renders. Use fixed column layouts on desktop (`repeat(4, 1fr)`) and force scrollbars (`overflow-y: scroll`) to prevent horizontal shifting. Use `tabular-nums` for rapidly updating numbers (e.g., live feeds, balances).

### Styling & Aesthetics
- **Theme System:** The project uses CSS custom properties defined in `globals.css` (e.g., `var(--primary)`, `var(--bg-color)` using HSL values).
- **Glassmorphism:** Use the `.glass` and `.glass-card` classes for the signature casino aesthetic. Be mindful of performance; use `backdrop-filter` sparingly on complex mobile views.
- **Animations:** Use `framer-motion` for smooth layout transitions. Ensure animations do not cause parent containers to collapse or shift (e.g., avoid `mode="wait"` in `AnimatePresence` if it causes vertical jitter).
- **Font Rendering:** Always use `-webkit-font-smoothing: antialiased` for premium text readability.

### Code Organization
- **Pages:** Located in `src/app/`.
- **Components:** Organized by domain in `src/components/` (e.g., `casino`, `home`, `layout`, `social`, `ui`).
- **Game Logic:** Core engine logic and utilities live in `src/lib/casino/`.
- **Documentation:** Specific domains have their own markdown documentation (e.g., `CASINO_GAMES_PAGE.md` for the `/games` route, `CASINO_MOBILE_STANDARDS.md` for responsive design). Always keep documentation updated alongside code changes.
