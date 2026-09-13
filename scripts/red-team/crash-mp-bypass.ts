import { randomUUID } from 'node:crypto';
import { assertSafePhase1Target } from './target-guard';

// 06_7 L3 (R5): crash-multiplayer rides a separate transport layer (/api/casino/
// bet-crash-multiplayer) that rate-limit-bypass.ts never touched. Same contract as
// rate-limit-bypass.ts: CASINO_BET_CRASH_MP_LIMIT (30/10s) parallel requests with an
// authenticated cookie, expecting at least one 429 and no more accepted requests than
// the configured limit. The invalid `{}` body stops at route validation (400) BEFORE any
// wallet/round operation, so no money can move while still exercising the auth/rate-limit
// boundary.

const CRASH_MP_LIMIT = 30;

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_AUTH_COOKIE?.trim();
  if (!cookie) throw new Error('RED_TEAM_AUTH_COOKIE is required');

  const statuses = await Promise.all(
    Array.from({ length: CRASH_MP_LIMIT + 2 }, (_, index) =>
      fetch(new URL('/api/casino/bet-crash-multiplayer', target.url), {
        method: 'POST',
        headers: {
          origin: target.url,
          cookie,
          'content-type': 'application/json',
          // user-scoped bucket (getClientIdentifier(request, userId)) — XFF variation is
          // irrelevant here, the Idempotency-Key mirrors rate-limit-bypass.ts's partial-key
          // coverage.
          'x-forwarded-for': `203.0.113.${(index % 10) + 1}`,
          ...(index % 3 !== 2 ? { 'Idempotency-Key': randomUUID() } : {}),
        },
        body: '{}',
      }).then((response) => response.status),
    ),
  );

  const accepted = statuses.filter((status) => status !== 429).length;
  const allExpected = statuses.every((status) => status === 400 || status === 429);
  if (!statuses.includes(429) || accepted > CRASH_MP_LIMIT || !allExpected) {
    throw new Error(
      `P1.4 crash-mp rate-limit contract failed: statuses=${JSON.stringify(statuses)}`,
    );
  }
  console.log(
    `P1.4 crash-mp probe passed: total=${statuses.length} throttled=${statuses.length - accepted}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 crash-mp probe failed');
  process.exitCode = 1;
});