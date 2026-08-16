// No `server-only` marker: this module is only ever imported from
// src/app/api/analytics/identity/route.ts, an App Router route handler — those are never
// bundled into the client by construction (same convention as wallet.ts, which handles
// comparably sensitive server-only logic without the marker either).
import { createHmac } from 'node:crypto';

const MIN_HMAC_SECRET_BYTES = 32;

// Deliberately its own secret, not GUIDE_TELEMETRY_HMAC_SECRET (2.7) — separate purposes get
// separate secrets so rotating one never touches the other (05_2.9_PostHog_Analytics.md §3.3).
function readHmacSecret(): string | null {
  const secret = process.env.POSTHOG_DISTINCT_ID_HMAC_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < MIN_HMAC_SECRET_BYTES) return null;
  return secret;
}

/**
 * HMAC-SHA256(secret, userId) — never the raw Supabase user id. Returns null if the secret is
 * missing/too short or userId is empty, so callers fail closed instead of sending something
 * derived from an unconfigured secret.
 */
export function createAnalyticsDistinctId(userId: string): string | null {
  const secret = readHmacSecret();
  if (!secret || !userId) return null;
  return createHmac('sha256', secret).update(userId, 'utf8').digest('hex');
}
