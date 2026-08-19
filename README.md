# Casino

Casino is a Next.js 16 application with Supabase-backed authentication and game data, Sentry error reporting, and automated quality checks.

## Local setup

Node.js 22.16.0 is the project baseline (.nvmrc). The committed lockfile is package-lock.json, so use npm for installs and scripts.

    npm ci
    if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
    npm run dev

Complete the required values in .env.local; it is intentionally local and never committed. The development server runs at http://localhost:3015.

## Quality checks

    npm run format:check
    npm run lint
    npm run typecheck
    npm test
    npm run build

## Project map

- src/ — application code, API routes, UI, domain logic, and unit tests
- tests/ — Playwright end-to-end tests
- supabase/ — database migrations and Supabase CLI configuration
- scripts/ — repeatable maintenance and verification scripts
- docs/ — architecture, status reports, and retained project decisions
- worldmap/ — learning roadmap and integration inventory

The root intentionally contains only project entry points and tool configuration. Keep package.json, next.config.ts, tsconfig.json, the lint/test/format configuration, and the Sentry configuration at the root so their tools discover them without custom paths.
