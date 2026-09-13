import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { assertSafePhase1Target } from './target-guard';

// 06_7 L2 (R6, original-author TODO dated 2026-09-04 in docs/security-hardening/
// 09_red_team_probes.md §6): live attack simulation for the 06_1 anti-automation guards.
// Unlike rate-limit-bypass.ts (which expects 429s), the bot guards are deliberately
// fail-open/observability-only: the probe expects the REQUESTS to succeed (or be rejected
// only by the separate transport-layer rate limit) and then verifies the SIGNAL CHAIN —
// a matching risk_events row written by the app — via a direct service-role query against
// the ephemeral test DB.
//
// Flow 2 note: login-guard (06_1 L1/V2) is NOT fail-open — it is a hard 5/60s preflight
// ceiling, so this probe expects 5×200 then 429. The `bot_signal_login_flood` signal type
// exists in the enum but currently has NO producer (verified 2026-09-06 across src/) —
// documented in the 06_7 Ausführungsprotokoll §8.5, not asserted here.

const GUESS_CODE = 'RETEAM7X0BYPASS';
const LOGIN_ATTEMPT_LIMIT = 5;
const WALLET_REDEEM_LIMIT = 10;

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

async function signupHoneypotFlow(
  target: { url: string },
  cookie: string,
  userId: string,
): Promise<void> {
  const response = await fetch(new URL('/api/auth/signup-suspicion', target.url), {
    method: 'POST',
    headers: { origin: target.url, cookie, 'content-type': 'application/json' },
    body: JSON.stringify({ reason: 'honeypot' }),
  });
  if (response.status !== 200) {
    throw new Error(`bot-bypass signup-suspicion expected 200, got ${response.status}`);
  }
  const body = (await response.json()) as { data?: { recorded?: boolean } };
  if (body.data?.recorded !== true) {
    throw new Error(`bot-bypass signup-suspicion expected recorded=true, got ${JSON.stringify(body)}`);
  }

  const admin = createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin
    .from('risk_events')
    .select('id, signal_type')
    .eq('subject_user_id', userId)
    .eq('signal_type', 'bot_signal_honeypot')
    .limit(1);
  if (error || !data || data.length === 0) {
    throw new Error(
      `bot-bypass bot_signal_honeypot event missing for ${userId}: ${error?.message ?? 'no row'}`,
    );
  }
}

async function loginFloodFlow(target: { url: string }): Promise<void> {
  // Same fixed IP on every request so all attempts land in ONE login-attempt bucket
  // ( getClientIdentifier(request) is IP-based pre-auth; varying XFF would mint separate
  // buckets and defeat the flood ).
  const statuses: number[] = [];
  for (let index = 0; index < LOGIN_ATTEMPT_LIMIT + 2; index += 1) {
    const response = await fetch(new URL('/api/auth/login-guard', target.url), {
      method: 'POST',
      headers: { origin: target.url, 'x-forwarded-for': '198.51.100.23' },
    });
    statuses.push(response.status);
  }
  const firstFiveOk = statuses.slice(0, LOGIN_ATTEMPT_LIMIT).every((status) => status === 200);
  const restThrottled = statuses
    .slice(LOGIN_ATTEMPT_LIMIT)
    .every((status) => status === 429);
  if (!firstFiveOk || !restThrottled) {
    throw new Error(
      `bot-bypass login-guard flood contract failed: expected ${LOGIN_ATTEMPT_LIMIT}x200 then 429s, got ${JSON.stringify(statuses)}`,
    );
  }
}

async function promoGuessFlow(target: { url: string }, cookie: string): Promise<void> {
  // 10 failed redemptions of the SAME code: all fail-open (400 PROMO_INVALID — the guess
  // guard never blocks), the 10th failure crosses PROMO_GUESS_FAILURE_THRESHOLD and must
  // write a voucher_velocity event. The 11th request exercises the separate
  // wallet-redeem transport backstop (10/60s) → 429.
  const statuses: number[] = [];
  for (let index = 0; index < WALLET_REDEEM_LIMIT + 1; index += 1) {
    const response = await fetch(new URL('/api/casino/redeem-code', target.url), {
      method: 'POST',
      headers: {
        origin: target.url,
        cookie,
        'content-type': 'application/json',
        'Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify({ code: GUESS_CODE }),
    });
    statuses.push(response.status);
  }
  const firstTenInvalid = statuses.slice(0, WALLET_REDEEM_LIMIT).every((status) => status === 400);
  const throttled = statuses[WALLET_REDEEM_LIMIT] === 429;
  if (!firstTenInvalid || !throttled) {
    throw new Error(
      `bot-bypass promo-guess contract failed: expected ${WALLET_REDEEM_LIMIT}x400 then 429, got ${JSON.stringify(statuses)}`,
    );
  }

  const admin = createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await admin
    .from('risk_events')
    .select('id, signal_type, evidence')
    .eq('signal_type', 'voucher_velocity')
    .eq('evidence->>outcome', 'guess_threshold')
    .eq('evidence->>code', GUESS_CODE)
    .limit(1);
  if (error || !data || data.length === 0) {
    throw new Error(
      `bot-bypass voucher_velocity guess_threshold event missing for code ${GUESS_CODE}: ${error?.message ?? 'no row'}`,
    );
  }
}

async function main(): Promise<void> {
  const target = assertSafePhase1Target();
  const cookie = requiredEnv('RED_TEAM_NON_ADMIN_COOKIE');
  const userId = requiredEnv('RED_TEAM_NON_ADMIN_USER_ID');

  await signupHoneypotFlow(target, cookie, userId);
  await loginFloodFlow(target);
  await promoGuessFlow(target, cookie);
  console.log('P1.4 bot-bypass probes passed: signup-suspicion signal, login-guard flood, promo-guess signal');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'P1.4 bot-bypass probe failed');
  process.exitCode = 1;
});