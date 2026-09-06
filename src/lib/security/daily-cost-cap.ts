import 'server-only';

import { Redis } from '@upstash/redis';
import * as Sentry from '@sentry/nextjs';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';
import type { RiskSignalType } from '@/lib/casino/risk-signals';

// 06_1 Bot-Automation Detection (L2, V4): hard per-user daily ceiling for the paid
// OpenAI-backed routes. The sliding-window rate limits alone still allow ~43k calls/day
// per user, which is a real money risk — this counter is the day-scale backstop.
// Unlike the sliding window it uses a fixed 24h TTL from the first request (INCR + EXPIRE
// on first use), so the budget cannot be stretched by spreading calls.

export type DailyCostCapRoute = 'guide-chat' | 'voice-synthesize' | 'voice-transcribe';

// Assumption (2026-04-09, documented in docs/archive/06_1_bot_automation_detection_plan.md L2):
// generous for real users (heavy guide use is a few hundred messages/day), but two orders
// of magnitude below the ~43k/day the rate limit alone permitted.
export const DAILY_COST_CAPS: Record<DailyCostCapRoute, number> = {
  'guide-chat': 400,
  'voice-synthesize': 200,
  'voice-transcribe': 100,
};

const DAILY_TTL_SECONDS = 86_400;
const KEY_PREFIX = 'casino:daily-cost';

export interface DailyCostCapDecision {
  allowed: boolean;
  used: number;
  cap: number;
  unavailable?: boolean;
}

const localCounters = new Map<string, { count: number; resetAt: number }>();

function reportCounterUnavailable(route: DailyCostCapRoute): void {
  try {
    Sentry.captureMessage('Daily cost counter unavailable, failing closed', {
      level: 'error',
      tags: { scope: `daily-cost-cap:${route}` },
    });
  } catch {
    // A Sentry SDK failure must never affect the fail-closed cost cap decision.
  }
}

/**
 * Records the block as a risk signal. windowStart is the UTC calendar day so repeated
 * blocks on the same day produce the same fingerprint (dedup via occurrences) instead of
 * one row per blocked request. Evidence intentionally omits the running counter value.
 */
async function recordCapReachedSignal(
  userId: string,
  route: DailyCostCapRoute,
  cap: number,
): Promise<void> {
  await recordRiskEventBestEffort({
    subjectUserId: userId,
    signalType: 'cost_cap_reached' satisfies RiskSignalType,
    severity: 'low',
    windowStart: new Date().toISOString().slice(0, 10),
    evidence: { route, cap },
  });
}

export async function enforceDailyCostCap(
  userId: string,
  route: DailyCostCapRoute,
): Promise<DailyCostCapDecision> {
  const cap = DAILY_COST_CAPS[route];
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      const key = `${KEY_PREFIX}:${userId}:${route}`;
      const used = await redis.incr(key);
      // NX on every call, not only on used === 1: if the process dies between INCR and a
      // first-use EXPIRE, the key would otherwise persist without a TTL and block the user
      // forever. NX is idempotent and never stretches an existing TTL.
      await redis.expire(key, DAILY_TTL_SECONDS, 'NX');
      if (used > cap) {
        await recordCapReachedSignal(userId, route, cap);
        return { allowed: false, used, cap };
      }
      return { allowed: true, used, cap };
    } catch {
      reportCounterUnavailable(route);
      return { allowed: false, used: 0, cap, unavailable: true };
    }
  }

  if (process.env.NODE_ENV === 'production') {
    reportCounterUnavailable(route);
    return { allowed: false, used: 0, cap, unavailable: true };
  }

  const key = `${route}:${userId}`;
  const now = Date.now();
  const current = localCounters.get(key);
  const bucket =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + DAILY_TTL_SECONDS * 1000 }
      : current;
  bucket.count += 1;
  localCounters.set(key, bucket);

  if (bucket.count > cap) {
    await recordCapReachedSignal(userId, route, cap);
    return { allowed: false, used: bucket.count, cap };
  }
  return { allowed: true, used: bucket.count, cap };
}

export function resetLocalDailyCostCapsForTests(): void {
  localCounters.clear();
}
