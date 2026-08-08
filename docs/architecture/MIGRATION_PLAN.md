# Migration Plan - Casino + casino-platform

Last updated: 2026-05-14

## Goal
Merge strengths from `Casino` and `casino-platform` over time while both projects remain independently runnable.

## Non-Negotiable Rules
- Keep `Casino` runnable (`npm install`, `npm run dev`) after every migration step.
- Keep `casino-platform` runnable independently.
- No big-bang rewrite.
- One scoped migration unit per branch.
- Validate before and after each unit.

## Phase 1: Baseline Freeze
- [ ] Record technical baseline for both repos.
  - [ ] Runtime versions (Node/npm)
  - [ ] Framework versions
  - [ ] Current scripts and expected outputs
- [ ] Confirm both repos boot independently.
  - [ ] `Casino`: install + dev + build
  - [ ] `casino-platform`: install + dev + build
- [ ] Capture known warnings/errors in each repo.

## Phase 2: Feature Mapping
- [ ] Build feature inventory for both repos.
  - [ ] Auth/user flows
  - [ ] Wallet/balance logic
  - [ ] Game modules (slots/roulette/blackjack/poker)
  - [ ] Payments/Stripe
  - [ ] Dashboard/admin
- [ ] Define source of truth per feature.
  - [ ] UI source repo
  - [ ] domain logic source repo
  - [ ] API source repo
- [ ] Assign migration priority (P0/P1/P2).

## Phase 3: Compatibility Layer
- [ ] Define target conventions for merged direction.
  - [ ] Folder layout
  - [ ] naming conventions
  - [ ] shared utility boundaries
- [ ] Decide compatibility strategy for version differences.
  - [ ] Next.js version strategy
  - [ ] React version strategy
  - [ ] test strategy alignment

## Phase 4: Incremental Merge Units
- [ ] Unit 1: Shared UI primitives
  - [ ] Port non-breaking components first
  - [ ] Add regression checks on key pages
- [ ] Unit 2: Navigation/layout structure
  - [ ] Keep legacy routes available
  - [ ] Add route-level smoke checks
- [ ] Unit 3: Domain logic by game
  - [ ] One game at a time
  - [ ] Compare payout and state behavior
- [ ] Unit 4: API/backend integration
  - [ ] Preserve contract compatibility
  - [ ] Add endpoint checks
- [ ] Unit 5: Payments/wallet/auth hardening
  - [ ] Validate edge cases
  - [ ] Validate env variable compatibility

## Step Guardrails (for every unit)
- [ ] Create branch `merge/<unit-name>`.
- [ ] Run install/lint/build/dev before changes.
- [ ] Apply minimal scoped edits.
- [ ] Run install/lint/build/dev after changes.
- [ ] Update STATUS and matrix docs.
- [ ] Commit only if baseline is still healthy.

## Rollback Procedure
- [ ] If baseline breaks, revert current unit commit.
- [ ] Document failure reason in `STATUS.md`.
- [ ] Split unit into smaller parts and retry.

## Exit Criteria
- [ ] Functional parity reached for prioritized features.
- [ ] No regression on legacy critical flows.
- [ ] Agreed target repo chosen for long-term continuity.
