import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  RATE_LIMIT_EXEMPT_ROUTES,
  isRateLimitInstrumented,
  isRateLimitRouteCompliant,
} from '../rate-limit-route-inventory';

// 06_6 L3 (E5): the audit found that nothing compared the filesystem route list against
// the rate-limit caller list — which is exactly why guide-persona and telegram/webhook
// were silently unprotected. This test scans every src/app/api/**/route.ts at test time
// and fails when a NEW route is neither instrumented nor on the documented exemption
// allowlist. Adding any new route below means this test forces an explicit decision.
const API_ROOT = resolve(__dirname, '../../../app/api');

// Route paths relative to src/app/api (e.g. 'casino/guide-persona'), separator-normalized
// for Windows.
function collectRoutePaths(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return collectRoutePaths(fullPath);
    if (entry.isFile() && entry.name === 'route.ts') {
      return [
        relative(API_ROOT, fullPath)
          .split(sep)
          .join('/')
          .replace(/\/route\.ts$/, ''),
      ];
    }
    return [];
  });
}

// Pinned counts (06_6 L5): both docs (xx_docs/08_api_backend_context.md and
// docs/observability/05_ratelimit_failclosed_alerting.md §5) must quote these exact
// numbers. The total pins the route inventory itself — any new route fails here until it
// is either instrumented or explicitly exempted, and the docs get the real number.
// 44 = 59 total − 15 documented exemptions (docs/openapi.json stay uninstrumented by
// design; the two former gaps guide-persona/telegram-webhook are instrumented since 06_6;
// 06_3 added two instrumented routes: signup-fingerprint + admin users status).
const EXPECTED_API_ROUTE_COUNT = 59;
const EXPECTED_INSTRUMENTED_ROUTE_COUNT = 44;

describe('rate-limit route completeness (06_6 L3)', () => {
  it('every API route is rate-limit instrumented or on the documented exemption allowlist', () => {
    const routePaths = collectRoutePaths(API_ROOT);
    expect(routePaths).toHaveLength(EXPECTED_API_ROUTE_COUNT);

    const violations: string[] = [];
    let instrumentedCount = 0;
    for (const routePath of routePaths) {
      const source = readFileSync(join(API_ROOT, routePath, 'route.ts'), 'utf8');
      if (isRateLimitRouteCompliant(routePath, source)) {
        if (isRateLimitInstrumented(source)) instrumentedCount += 1;
      } else {
        violations.push(routePath);
      }
    }
    expect(violations).toEqual([]);
    expect(instrumentedCount).toBe(EXPECTED_INSTRUMENTED_ROUTE_COUNT);
  });

  it('every allowlist entry still exists on disk (no dead exemptions)', () => {
    const routePaths = new Set(collectRoutePaths(API_ROOT));
    const deadExemptions = [...RATE_LIMIT_EXEMPT_ROUTES].filter((route) => !routePaths.has(route));
    expect(deadExemptions).toEqual([]);
  });
});

describe('Test des Tests — compliance predicate (negative control, 06_6 L3)', () => {
  it('counts a real enforceRateLimit call as instrumented', () => {
    const source = `import { enforceRateLimit } from '@/lib/security/request-security';
export async function GET(request: Request) {
  const rate = await enforceRateLimit(id, 'scope', 10, 10);
}`;
    expect(isRateLimitInstrumented(source)).toBe(true);
    expect(isRateLimitRouteCompliant('some/route', source)).toBe(true);
  });

  it('counts a real withRateLimit wrapper call as instrumented', () => {
    const source = `export const GET = withRateLimit(handler, { scope: 'x', limit: 10, windowSeconds: 10 });`;
    expect(isRateLimitInstrumented(source)).toBe(true);
  });

  it('counts a generic-instantiation call withRateLimit<T>(...) as instrumented (guide-persona form)', () => {
    const source = `const gate = withRateLimit<{ userId: string }>(
  async (request, context) => handler(request, context),
  { scope: 'x', limit: 10, windowSeconds: 10 },
);`;
    expect(isRateLimitInstrumented(source)).toBe(true);
  });

  it('does NOT count a comment-only mention (the health/cron-alert masquerade case)', () => {
    const source = `// Deliberately NOT the shared Upstash limiter (enforceRateLimit): that one fails CLOSED.
export async function GET() { return new Response('ok'); }`;
    expect(isRateLimitInstrumented(source)).toBe(false);
    expect(isRateLimitRouteCompliant('some/route', source)).toBe(false);
  });

  it('does NOT count withRateLimit( inside block or trailing comments either', () => {
    const blockComment = `/*
 * Future migration plan: switch this route to withRateLimit(handler, { scope: 'x' }).
 */
export async function GET() { return new Response('ok'); }`;
    expect(isRateLimitInstrumented(blockComment)).toBe(false);
    const trailing = `export async function GET() { return ok(); } // uses withRateLimit(handler, ...) later`;
    expect(isRateLimitInstrumented(trailing)).toBe(false);
  });

  it('flags an uninstrumented route that is not on the allowlist', () => {
    expect(isRateLimitRouteCompliant('some/new-route', 'export async function GET() {}')).toBe(
      false,
    );
  });

  it('accepts an uninstrumented route that IS on the allowlist', () => {
    expect(isRateLimitRouteCompliant('casino/config', 'export async function GET() {}')).toBe(
      true,
    );
  });
});