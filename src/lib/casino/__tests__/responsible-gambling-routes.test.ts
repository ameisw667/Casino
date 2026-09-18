import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 06_2 L1 verification (static-assertion pattern, see to04-critical-fixes.test.ts):
 * this repo has no live-Postgres integration harness and the money routes are only
 * reachable through a real Supabase stack — so the self-exclusion guard is pinned as
 * a static assertion against the calling TypeScript. What these tests CANNOT prove:
 * live runtime ordering — they pin presence, shape and insertion position of the
 * guard, not its live behaviour.
 */

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const MONEY_ROUTES = [
  'src/app/api/casino/bet/route.ts',
  'src/app/api/casino/blackjack/route.ts',
  'src/app/api/casino/bet-crash-multiplayer/route.ts',
  'src/app/api/casino/redeem-code/route.ts',
] as const;

describe('06_2 L1: self-exclusion guard on all four money routes', () => {
  it.each(MONEY_ROUTES)('%s calls the guard after auth and after the rate limit', (routePath) => {
    const route = read(routePath);

    expect(route).toContain('checkWellbeingGuard');
    expect(route).toContain('wellbeingApiError(wellbeing)');

    // Call sites only — the import statements also contain these identifiers.
    // Order: auth resolve → rate limit → guard (security review: the remote limiter
    // must shed load before any DB query runs on the money path).
    const authIndex = route.indexOf('AUTHENTICATION_REQUIRED');
    const guardIndex = route.indexOf('checkWellbeingGuard(userId)');
    const rateLimitIndex = route.indexOf('enforceRateLimit(');
    expect(authIndex).toBeGreaterThan(-1);
    expect(rateLimitIndex).toBeGreaterThan(authIndex);
    expect(guardIndex).toBeGreaterThan(rateLimitIndex);
  });

  it.each(MONEY_ROUTES)(
    '%s answers every blocked state through the shared error mapping',
    (routePath) => {
      const route = read(routePath);
      const guardBlock = route.slice(route.indexOf('checkWellbeingGuard(userId)'));
      // Prettier may wrap the call across lines — strip all whitespace so the
      // assertion pins the call shape, not the formatting.
      const normalizedGuardBlock = guardBlock.replace(/\s+/g, '');

      expect(normalizedGuardBlock).toContain('wellbeingApiError');
      expect(normalizedGuardBlock).toContain('apiErrorResponse(wellbeingError.code');
    },
  );
});

describe('06_2 L1: self-exclusion endpoint contract', () => {
  const route = read('src/app/api/user/self-exclusion/route.ts');

  it('validates durationDays as an integer between 1 and 365', () => {
    expect(route).toContain('durationDays: z');
    expect(route).toMatch(/\.int\(/);
    expect(route).toMatch(/\.min\(1/);
    expect(route).toMatch(/\.max\(365/);
  });

  it('uses validateMutationOrigin + auth resolve + rate limit before activation', () => {
    const postBlock = route.slice(route.indexOf('export async function POST'));
    expect(postBlock).toContain('validateMutationOrigin');
    expect(postBlock.indexOf('validateMutationOrigin')).toBeLessThan(
      postBlock.indexOf('AUTHENTICATION_REQUIRED'),
    );
    expect(postBlock.indexOf('enforceRateLimit')).toBeGreaterThan(
      postBlock.indexOf('AUTHENTICATION_REQUIRED'),
    );
    expect(postBlock.indexOf('setSelfExclusion')).toBeGreaterThan(
      postBlock.indexOf('enforceRateLimit'),
    );
  });

  it('has no deactivation endpoint (Q3a: fixed duration, no early lift)', () => {
    expect(route).not.toContain('DELETE');
    expect(route).not.toContain('setSelfExclusion(userId, 0)');
    expect(route).not.toContain('self_excluded_until: null');
  });

  it('maps a failed activation to 503 (fail-closed, no silent success)', () => {
    const postBlock = route.slice(route.indexOf('export async function POST'));
    expect(postBlock).toContain('503');
  });
});

describe('06_4 L3: guard stacking — self-exclusion × daily loss limit × bet velocity', () => {
  const route = read('src/app/api/casino/bet/route.ts');
  const guard = read('src/lib/casino/responsible-gambling.ts');

  it('produces exactly one rejection: the wellbeing guard, before validation', () => {
    // Actual route order (route.ts POST): origin → auth → rate limit → wellbeing guard →
    // Zod validation → settlement. With self-exclusion AND loss limit AND bet velocity
    // simultaneously active, the user therefore receives exactly one specific error — the
    // wellbeing one. Why this order is right: validation errors (400) must not leak to a
    // blocked user before the wellbeing decision, and the limiter must shed load before
    // the guard's DB query (06_2 security review).
    expect(route.indexOf('checkWellbeingGuard(userId)')).toBeGreaterThan(
      route.indexOf('enforceRateLimit('),
    );
    expect(route.indexOf('requestSchema.safeParse')).toBeGreaterThan(
      route.indexOf('checkWellbeingGuard(userId)'),
    );
  });

  it('bet velocity is a deferred observability signal, never a response-producing guard', () => {
    // Both call sites of recordBetPlacedBestEffort sit inside after() AFTER a successful
    // settlement (06_1 L5 realtime hint, fail-open) — a request rejected by the wellbeing
    // guard never reaches them, so no fraud signal is written for a request that was
    // already going to be rejected. Pinned as a static assertion: if someone ever promotes
    // bet velocity to a blocking guard or moves it before settlement, this test fails and
    // the change must be re-reviewed.
    expect(route.split('after(() => recordBetPlacedBestEffort(userId))').length - 1).toBe(2);
  });

  it('self-exclusion wins inside the wellbeing guard (evaluated before the loss limit)', () => {
    // checkWellbeingGuard reads self_excluded_until first and only a not-self-excluded
    // user can reach the loss-limit branch. Rationale: a self-excluded person must not
    // receive a loss-limit message at all — the hard lock has absolute priority, so the
    // response always carries exactly one unambiguous code (SELF_EXCLUDED, 403).
    expect(guard.indexOf("{ state: 'self-excluded', until }")).toBeGreaterThan(-1);
    expect(guard.indexOf("{ state: 'self-excluded', until }")).toBeLessThan(
      guard.indexOf("{ state: 'loss-limit-reached', limitCents"),
    );
  });
});

describe('06_2 L3: daily loss limit endpoint contract', () => {
  const route = read('src/app/api/user/self-exclusion/route.ts');

  it('accepts the limit as integer cents with a hard cap and allows clearing via null', () => {
    const schema = route.slice(route.indexOf('const dailyLossLimitSchema'));
    const putBlock = route.slice(route.indexOf('export async function PUT'));
    expect(putBlock).toContain('dailyLossLimitCents');
    expect(schema).toMatch(/\.int\(/);
    expect(schema).toMatch(/\.max\(/);
    expect(schema).toMatch(/\.nullable\(\)/);
  });

  it('uses the same origin/auth/rate-limit guard chain as the activation endpoint', () => {
    const putBlock = route.slice(route.indexOf('export async function PUT'));
    expect(putBlock.indexOf('validateMutationOrigin')).toBeGreaterThan(-1);
    expect(putBlock.indexOf('validateMutationOrigin')).toBeLessThan(
      putBlock.indexOf('AUTHENTICATION_REQUIRED'),
    );
    expect(putBlock.indexOf('enforceRateLimit')).toBeGreaterThan(
      putBlock.indexOf('AUTHENTICATION_REQUIRED'),
    );
    expect(putBlock.indexOf('setDailyLossLimit')).toBeGreaterThan(
      putBlock.indexOf('enforceRateLimit'),
    );
  });

  it('maps a failed limit update to 503 (fail-closed, no silent success)', () => {
    const putBlock = route.slice(route.indexOf('export async function PUT'));
    expect(putBlock).toContain('503');
  });
});
