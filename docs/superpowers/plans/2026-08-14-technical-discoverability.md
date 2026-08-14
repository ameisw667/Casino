# Technical Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish reliable, canonical `robots.txt` and `sitemap.xml` endpoints for the public Casino Royale surface without exposing authenticated, administrative, test, or API routes to crawlers.

**Architecture:** Use Next.js 16 App Router Metadata Routes in `src/app/robots.ts` and `src/app/sitemap.ts`. Both routes consume one validated site-origin helper so the sitemap URL, robots sitemap directive, and document metadata cannot drift. The proxy explicitly allows the two endpoints to reach anonymous crawlers; the sitemap contains only intentionally indexable public routes.

**Tech Stack:** Next.js 16.3 App Router, TypeScript, Vitest, existing proxy middleware, `NEXT_PUBLIC_SITE_URL` with the repository's current canonical fallback.

**Spec:** `worldmap/elv_jan_instagram.md`

## Global Constraints

- Use the Next.js 16 file conventions documented in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` and `sitemap.md`.
- Keep `robots.txt` and `sitemap.xml` as separate, independently testable implementations.
- The canonical site origin is `NEXT_PUBLIC_SITE_URL` when it is a valid absolute HTTP(S) origin; otherwise use the existing `https://casino-royale.vibe` fallback.
- Never put authenticated, admin, API, callback, testing, prototype, or user-specific routes in the sitemap.
- Robots exclusions are crawler guidance, not an authorization boundary; existing proxy/authentication remains authoritative.
- Do not invent `lastModified` timestamps when the project has no content revision source for these static pages.
- Preserve unrelated working-tree changes.

## File Map

- Create: `src/lib/site-url.ts` — canonical origin validation and absolute URL construction.
- Create: `src/app/robots.ts` — crawler rules and sitemap declaration.
- Create: `src/app/sitemap.ts` — allowlisted public sitemap entries.
- Create: `src/lib/casino/__tests__/seo-routes.test.ts` — unit contracts for URL normalization and both metadata routes (placed in the existing test tree because the workspace denied creating a new test directory under `src/app`).
- Modify: `src/app/layout.tsx` — reuse the canonical origin for metadata base and Open Graph URL.
- Modify: `src/proxy.ts` — allow anonymous access to `/robots.txt` and `/sitemap.xml`.
- Modify: `worldmap/elv_jan_instagram.md` — inventory, plan self-review, execution evidence, and updated statuses.

## Section A — `robots.txt`

### Task A1: Define the failing contract

- [ ] Add a test that imports the `robots` metadata function and asserts one wildcard rule allows `/`, while the rule disallows `/admin`, `/api`, `/auth`, `/history`, `/stats`, `/vault`, `/testing`, `/refactoring`, `/sign-in`, `/sign-up`, and `/v2`.
- [ ] Assert the returned `sitemap` is the canonical absolute `/sitemap.xml` URL.
- [ ] Assert the proxy source lists `/robots.txt` as a public route.
- [ ] Run the focused test and confirm it fails because the route and public-route entry do not exist.

### Task A2: Implement the route minimally

- [ ] Create `src/app/robots.ts` with `MetadataRoute.Robots` and a single wildcard rule.
- [ ] Use explicit path-prefix exclusions for non-indexable surfaces; do not add non-standard directives or bot-specific exceptions without a requirement.
- [ ] Use the shared absolute URL helper for the sitemap directive.

### Task A3: Verify the robots contract

- [ ] Run the focused Vitest test and confirm the route contract passes.
- [ ] Run a production build later to confirm Next serializes the metadata route as `/robots.txt` with the expected content type.

## Section B — `sitemap.xml`

### Task B1: Define the failing contract

- [ ] Add a test that imports the `sitemap` metadata function and asserts the exact allowlist: `/`, `/games`, `/games/blackjack`, `/games/crash`, `/games/dice`, `/games/roulette`, `/games/slots`, `/leaderboard`.
- [ ] Assert every URL is absolute, uses the canonical origin, has no query/hash, and excludes admin, API, authentication, user-specific, testing, prototype, and duplicate variant paths.
- [ ] Run the focused test and confirm it fails because the route does not exist.

### Task B2: Implement the route minimally

- [ ] Create `src/app/sitemap.ts` returning `MetadataRoute.Sitemap` from a static allowlist.
- [ ] Use stable `changeFrequency` and priority hints only where they communicate the current product hierarchy; omit fabricated `lastModified` values.
- [ ] Keep the route synchronous and data-free so it remains cacheable and cannot leak private database state.

### Task B3: Verify the sitemap contract

- [ ] Run the focused Vitest test and confirm the exact allowlist and URL invariants pass.
- [ ] Run a production build and request the generated route in a local production server, verifying valid XML, `<urlset>` namespace, eight `<loc>` nodes, canonical URLs, and `application/xml` content type.

## Section C — Shared dependency and integration

### Task C1: Centralize the site origin

- [ ] Write tests for a valid configured origin, trailing-slash normalization, and invalid/non-HTTP configuration fallback.
- [ ] Create `src/lib/seo/site-url.ts` with a pure resolver plus exported runtime origin and absolute-path helper.
- [ ] Update root metadata to consume the same origin for `metadataBase` and `openGraph.url`; keep titles, descriptions, and copy unchanged.

### Task C2: Keep crawler endpoints public

- [ ] Add `/robots.txt` and `/sitemap.xml` to `PUBLIC_ROUTES` in `src/proxy.ts`.
- [ ] Keep `/admin`, `/api`, auth callbacks, user-specific surfaces, and testing/prototype routes protected or excluded as they are today.
- [ ] Add a source-level regression assertion so a future proxy change cannot turn either SEO endpoint into an anonymous sign-in redirect.

## Section D — Documentation and release checks

### Task D1: Update the world map

- [ ] Add the explicit fast-track classification for all nine Instagram points, including which are autonomous and which require product, legal, analytics, or device input.
- [ ] Record the two independent implementation sections, their self-review corrections, and the final route/test/build evidence.
- [ ] Change points 7 and 8 from `❌ Neu` to `✅ Vorhanden` only after the verification commands pass.

### Task D2: Run the full verification gate

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Re-read the plan and check every requirement against the diff and command output before claiming completion.

## Plan Self-Review Before Execution

- **Coverage:** Both endpoints have their own test-first implementation section; shared URL configuration, proxy reachability, metadata consistency, route allowlisting, XML serialization, and documentation are covered.
- **Critical gap found and fixed:** The initial two-file idea omitted `src/proxy.ts`; anonymous crawlers would otherwise be redirected to `/sign-in`. Task C2 now makes public reachability an explicit dependency and regression check.
- **Canonicality gap found and fixed:** Hard-coding the origin in three places would permit drift. Task C1 centralizes `NEXT_PUBLIC_SITE_URL` with the existing domain fallback and reuses it in root metadata.
- **Security gap checked:** The sitemap is a strict public allowlist and robots exclusions are explicitly documented as non-security controls.
- **Freshness gap checked:** No fake `lastModified` timestamp is emitted; a future CMS/content revision source can add it deliberately.
- **Scope check:** No database migration, analytics vendor, consent flow, or redesign is required for this first autonomous execution. Points 2 and 18 remain intentionally outside this task because they need measurement/product/legal decisions.
- **Placeholder scan:** No `TBD`, `TODO`, or unspecified validation step remains in the plan.
