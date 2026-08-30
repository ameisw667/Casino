import { randomUUID } from 'node:crypto';
import { assertSafePhase1Target } from './target-guard';

const targets = [
  { path: '/api/casino/bet', limit: 30 },
  { path: '/api/casino/blackjack', limit: 20 },
] as const;

async function runTarget(target: (typeof targets)[number], cookie: string, origin: string) {
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

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_AUTH_COOKIE?.trim();
  if (!cookie) throw new Error('RED_TEAM_AUTH_COOKIE is required');
  const results = await Promise.all(targets.map((entry) => runTarget(entry, cookie, target.url)));
  console.log(`P1.4 rate-limit probes passed: ${results.map((result) => result.path).join(', ')}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 rate-limit probe failed');
  process.exitCode = 1;
});
