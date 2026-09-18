import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertSafePhase1Target, reportCliFailure } from './target-guard';

// 06_4 (T5/L1): runAdminIdorProbe is exported so the non-admin IDOR contract (401/403/404
// against /api/admin/users with a foreign user id) is unit-testable directly (src/lib/
// security/__tests__/red-team-script-logic.test.ts). The CLI entry is guarded by the same
// fileURLToPath idiom as target-guard.ts so importing this module stays side-effect free.

export async function runAdminIdorProbe(
  target: { url: string },
  cookie: string,
  foreignUserId: string,
): Promise<number> {
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
  return response.status;
}

export async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = process.env.RED_TEAM_NON_ADMIN_COOKIE?.trim();
  const foreignUserId = process.env.RED_TEAM_FOREIGN_USER_ID?.trim();
  if (!cookie) throw new Error('RED_TEAM_NON_ADMIN_COOKIE is required');
  if (!foreignUserId) throw new Error('RED_TEAM_FOREIGN_USER_ID is required');

  const status = await runAdminIdorProbe(target, cookie, foreignUserId);
  console.log(`P1.4 admin IDOR probe passed with status ${status}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(reportCliFailure);
}