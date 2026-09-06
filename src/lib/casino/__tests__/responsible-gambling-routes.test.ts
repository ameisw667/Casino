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

      expect(guardBlock).toContain('wellbeingApiError');
      expect(guardBlock).toContain('apiErrorResponse(wellbeingError.code');
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
