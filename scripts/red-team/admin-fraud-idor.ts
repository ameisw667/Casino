import { randomUUID } from 'node:crypto';
import { assertSafePhase1Target } from './target-guard';

// 06_7 L3 (R5): IDOR analogon to admin-idor.ts, but for risk-event review status instead
// of wallet balance. A non-admin cookie attempts PATCH /api/admin/fraud on a fabricated
// event id — the route's auth/isAdminEmail gate must reject BEFORE any rate limit or RPC,
// so 401/403/404 is the only acceptable family (mirroring admin-idor.ts).
//
// Note: a fabricated UUID cannot collide with a real risk_events row, so even a
// hypothetically broken auth check would fail with 404 rather than mutate anything.

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_NON_ADMIN_COOKIE?.trim();
  if (!cookie) throw new Error('RED_TEAM_NON_ADMIN_COOKIE is required');

  const response = await fetch(new URL('/api/admin/fraud', target.url), {
    method: 'PATCH',
    headers: {
      origin: target.url,
      cookie,
      'content-type': 'application/json',
      'Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify({
      eventId: randomUUID(),
      status: 'reviewed',
      reason: 'P1.4 synthetic unauthorized review probe',
    }),
  });

  if (![401, 403, 404].includes(response.status)) {
    throw new Error(
      `P1.4 admin-fraud IDOR contract failed: unexpected status ${response.status}`,
    );
  }
  console.log(`P1.4 admin-fraud IDOR probe passed with status ${response.status}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 admin-fraud IDOR probe failed');
  process.exitCode = 1;
});