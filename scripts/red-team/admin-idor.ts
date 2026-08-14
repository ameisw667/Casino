import { randomUUID } from 'node:crypto';
import { assertSafePhase1Target } from './target-guard';

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_NON_ADMIN_COOKIE?.trim();
  const foreignUserId = process.env.RED_TEAM_FOREIGN_USER_ID?.trim();
  if (!cookie) throw new Error('RED_TEAM_NON_ADMIN_COOKIE is required');
  if (!foreignUserId) throw new Error('RED_TEAM_FOREIGN_USER_ID is required');

  const response = await fetch(new URL('/api/admin/users', target.url), {
    method: 'PATCH',
    headers: {
      origin: target.url,
      cookie,
      'content-type': 'application/json',
      'Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify({
      targetUserId: foreignUserId,
      balance: 10001,
      reason: 'P1.4 synthetic unauthorized-object probe',
    }),
  });

  if (![401, 403, 404].includes(response.status)) {
    throw new Error('P1.4 admin IDOR contract failed');
  }
  console.log(`P1.4 admin IDOR probe passed with status ${response.status}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 admin IDOR probe failed');
  process.exitCode = 1;
});
