---
name: Casino (Parallel Version)
status: active
priority: P3
tech: [Next.js, TypeScript, Clerk, Supabase, Redis, Upstash]
path: D:\ZZ - VibeCoding\Casino
---

# 🎰 Casino (Clerk Version)

Parallel casino platform using Clerk for auth (vs. Supabase auth in [[casino-platform]]). Includes more features and extensive planning documentation.

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, React 18
- **Auth:** Clerk (vs. Supabase in casino-platform)
- **Backend:** Supabase PostgreSQL
- **Caching/Realtime:** Upstash Redis
- **Payments:** Stripe
- **Documentation:** Extensive planning docs

## Current Status

### ✅ Complete
- Large planning documentation (CASINO_ULTIMATE_MASTER_PLAN.md)
- Feature matrix + roadmap
- Tech stack selection
- Clerk integration setup

### ⏳ In Progress
- Game implementations
- Database schema refinement
- API endpoints

### 🔴 Not Started
- Full game logic
- UI components
- Deployment

## Key Difference from casino-platform

| Aspect | casino-platform | Casino |
|--------|-----------------|--------|
| Auth | Supabase Auth | Clerk |
| Approach | Standalone baseline | Feature-rich variant |
| Docs | CLAUDE.md + basics | Extensive planning |
| Redis | No | Yes (Upstash) |

## Current Activity

This is the **more feature-complete** version with extensive planning.

- `CASINO_ULTIMATE_MASTER_PLAN.md` — Comprehensive roadmap
- Multiple game-specific docs
- Feature checklists
- Migration plans

## Next Steps

- [ ] Review CASINO_ULTIMATE_MASTER_PLAN.md
- [ ] Align with casino-platform design decisions
- [ ] Begin game implementations
- [ ] Coordinate deployment strategy

## Decision Point

**Question:** Should we unify or keep both?
- **Unify:** Pick one (casino-platform or Casino) and abandon the other
- **Parallel:** Keep both as separate experiments, merge best features later

## Status

🟢 Active, waiting on design decision

## Links

- [[casino-platform]] — Supabase version
- [[Q2-Roadmap]] — Master roadmap
- [[HOME]] — Back to home
