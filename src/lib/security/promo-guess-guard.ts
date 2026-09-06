import 'server-only';

import { Redis } from '@upstash/redis';
import { recordRiskEventBestEffort } from '@/lib/casino/risk-event-store';

// 06_1 Bot-Automation Detection (L4, V3): server-side guess counter per promo code. Brute
// forcing a short code is purely a redemption-path problem — every failed attempt (unknown,
// inactive, expired, exhausted, already redeemed) increments a per-code counter and the
// threshold crossing records a voucher_velocity signal (existing type, no new signal_type).
// The counter is keyed per code (catches guessing spread across several accounts) while the
// signal is attributed to the user who crossed the threshold — risk_events.subject_user_id
// has a FK to users(id), so a code can never be the subject. Observability-only by design:
// the counter never blocks a redemption; the wallet RPC and the per-user wallet-redeem rate
// limit remain the actual enforcement boundaries.

export const PROMO_GUESS_FAILURE_THRESHOLD = 10;
export const PROMO_GUESS_WINDOW_SECONDS = 3600;

const KEY_PREFIX = 'casino:promo-guess';

interface LocalBucket {
  count: number;
  resetAt: number;
}

const localCounters = new Map<string, LocalBucket>();

export async function recordPromoGuessFailure(userId: string, code: string): Promise<void> {
  const key = `${KEY_PREFIX}:${code}`;
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    let attempts: number;
    if (url && token) {
      const redis = new Redis({ url, token });
      attempts = await redis.incr(key);
      // NX on every call (same rationale as daily-cost-cap.ts): a lost TTL must not make
      // the per-code window permanent. Swallowed separately so an EXPIRE failure can never
      // drop the threshold signal below (security review finding #4).
      await redis.expire(key, PROMO_GUESS_WINDOW_SECONDS, 'NX').catch(() => {});
    } else if (process.env.NODE_ENV === 'production') {
      // Counter backend unavailable in production: fail open — the same outage already
      // fires a Sentry report from the rate limiter, and a broken counter must never
      // affect redemptions.
      return;
    } else {
      const now = Date.now();
      const current = localCounters.get(key);
      const bucket =
        !current || current.resetAt <= now
          ? { count: 0, resetAt: now + PROMO_GUESS_WINDOW_SECONDS * 1000 }
          : current;
      bucket.count += 1;
      localCounters.set(key, bucket);
      attempts = bucket.count;
    }

    // Signal only at the exact crossing: repeated attempts within the window dedup into the
    // same occurrences count instead of one row per failing request.
    if (attempts === PROMO_GUESS_FAILURE_THRESHOLD) {
      await recordRiskEventBestEffort({
        subjectUserId: userId,
        signalType: 'voucher_velocity',
        severity: 'medium',
        windowStart: new Date().toISOString().slice(0, 10),
        evidence: {
          outcome: 'guess_threshold',
          scope: 'wallet-redeem',
          threshold: PROMO_GUESS_FAILURE_THRESHOLD,
          // Code correlation so the admin can see which code was probed (security review
          // finding #2); failed guesses are not secrets and 'code' passes the evidence
          // sanitizer. Different codes produce different fingerprints — one row per code/day.
          code,
        },
      });
    }
  } catch {
    // Best effort by contract (risk-event-store): a broken counter must never fail a
    // redemption or throw out of this function.
  }
}

export function resetLocalPromoGuessesForTests(): void {
  localCounters.clear();
}
