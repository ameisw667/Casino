# Project Status - Casino

Last updated: 2026-05-14

## Current State
- Project type: Next.js app (legacy/main working base)
- Expected run commands:
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run start`
- Important scripts:
  - `npm run vibe-check`

## Stability Objective
- This repository must stay runnable at all times during migration.
- No direct destructive merge from `casino-platform` into this codebase.
- All imports from external migration steps must be incremental and reversible.

## Known Constraints
- Uses newer major versions (Next 16, React 19) than `casino-platform`.
- Likely API/component incompatibilities if code is copied blindly.

## Next Action
- Build a feature-level mapping against `casino-platform` before any code transfer.
