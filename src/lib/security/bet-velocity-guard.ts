import 'server-only';

import { Redis } from '@upstash/redis';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';
import { BET_VELOCITY_MIN_BETS, BET_VELOCITY_WINDOW_MINUTES } from '@/lib/casino/fraud-detection';

// 06_1 Bot-Automation Detection (L5, V5): realtime in-request bet-velocity hint that
// complements (never replaces) the periodic batch scan in fraud-detection.ts — the batch
// scan only runs on admin/scan schedule, so a 30-bets-in-10-minutes automation burst is
// now visible immediately instead of at the next scan. Same threshold and window as the
// batch scan (imported from fraud-detection.ts so the two can never drift apart).
// Observability-only by design: the counter never blocks a bet; the settlement RPCs and
// the per-user casino-bet rate limits remain the enforcement boundaries.

export const BET_VELOCITY_THRESHOLD = BET_VELOCITY_MIN_BETS;
export const BET_VELOCITY_WINDOW_SECONDS = BET_VELOCITY_WINDOW_MINUTES * 60;

const KEY_PREFIX = 'casino:bet-velocity';

interface LocalBucket {
  count: number;
  resetAt: number;
}

const localCounters = new Map<string, LocalBucket>();

export async function recordBetPlacedBestEffort(userId: string): Promise<void> {
  const key = `${KEY_PREFIX}:${userId}`;
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    let count: number;
    if (url && token) {
      const redis = new Redis({ url, token });
      count = await redis.incr(key);
      // NX on every call (same rationale as daily-cost-cap.ts); swallowed separately so an
      // EXPIRE failure can never drop the threshold signal below.
      await redis.expire(key, BET_VELOCITY_WINDOW_SECONDS, 'NX').catch(() => {});
    } else if (process.env.NODE_ENV === 'production') {
      // Counter backend unavailable in production: fail open — the same outage already
      // fires a Sentry report from the rate limiter, and detection must never touch the
      // money path.
      return;
    } else {
      const now = Date.now();
      const current = localCounters.get(key);
      const bucket =
        !current || current.resetAt <= now
          ? { count: 0, resetAt: now + BET_VELOCITY_WINDOW_SECONDS * 1000 }
          : current;
      bucket.count += 1;
      localCounters.set(key, bucket);
      count = bucket.count;
    }

    // Signal only at the exact crossing (atomic INCR — exactly one caller sees it): one
    // realtime bet_velocity row per user/day with a fingerprint-stable evidence object.
    // Severity stays 'low' here; the batch scan remains the authority for medium/high bands.
    if (count === BET_VELOCITY_THRESHOLD) {
      await recordRiskEventBestEffort({
        subjectUserId: userId,
        signalType: 'bet_velocity',
        severity: 'low',
        windowStart: new Date().toISOString().slice(0, 10),
        evidence: {
          source: 'realtime',
          windowMinutes: BET_VELOCITY_WINDOW_MINUTES,
          threshold: BET_VELOCITY_THRESHOLD,
        },
      });
    }
  } catch {
    // Best effort by contract (risk-event-store): a broken counter must never fail a bet.
  }
}

export function resetLocalBetVelocityForTests(): void {
  localCounters.clear();
}
