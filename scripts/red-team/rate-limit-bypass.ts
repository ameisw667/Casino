import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertSafePhase1Target, reportCliFailure } from './target-guard';

// 06_4 (T5/L1): runRateLimitTarget and RATE_LIMIT_TARGETS are exported so the counting/
// evaluation contract is unit-testable directly (src/lib/security/__tests__/
// red-team-script-logic.test.ts) instead of only via string assertions. The CLI entry below
// is guarded by the same fileURLToPath idiom as target-guard.ts so importing this module
// stays side-effect free.

export const RATE_LIMIT_TARGETS = [
  { path: '/api/casino/bet', limit: 30 },
  { path: '/api/casino/blackjack', limit: 20 },
] as const;

export async function runRateLimitTarget(
  target: (typeof RATE_LIMIT_TARGETS)[number],
  cookie: string,
  origin: string,
): Promise<{ path: string; total: number; throttled: number }> {
  const statuses = await Promise.all(
    Array.from({ length: target.limit + 2 }, (_, index) => {
      const headers = new Headers({
        origin,
        cookie,
        'content-type': 'application/json',
        'x-forwarded-for': `203.0.113.${(index % 10) + 1}`,
      });
      if (index % 3 !== 2) headers.set('Idempotency-Key', randomUUID());
      return fetch(new URL(target.path, origin), {
        method: 'POST',
        headers,
        // Invalid input stops before the money operation while still exercising
        // the route's authentication/rate-limit boundary.
        body: '{}',
      }).then((response) => response.status);
    }),
  );

  const accepted = statuses.filter((status) => status !== 429).length;
  if (!statuses.includes(429) || accepted > target.limit) {
    throw new Error(
      `P1.4 rate-limit contract failed for ${target.path}: statuses=${JSON.stringify(statuses)}`,
    );
  }
  return { path: target.path, total: statuses.length, throttled: statuses.length - accepted };
}

export async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_AUTH_COOKIE?.trim();
  if (!cookie) throw new Error('RED_TEAM_AUTH_COOKIE is required');
  const results = await Promise.all(
    RATE_LIMIT_TARGETS.map((entry) => runRateLimitTarget(entry, cookie, target.url)),
  );
  console.log(`P1.4 rate-limit probes passed: ${results.map((result) => result.path).join(', ')}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(reportCliFailure);
}