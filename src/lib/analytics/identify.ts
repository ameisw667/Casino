'use client';

// Bootstraps posthog.identify() once per session, after consent (getAnalyticsClient() already
// gates on that) and once a logged-in user is known. Fetches the HMAC distinct_id from
// /api/analytics/identity (M8) — never computes or receives the raw user id client-side.
import { getAnalyticsClient } from './posthog-client';

let identifyPromise: Promise<void> | null = null;

async function fetchAndIdentify(): Promise<void> {
  try {
    const client = await getAnalyticsClient();
    if (!client) return;
    const response = await fetch('/api/analytics/identity');
    if (!response.ok) return;
    const body: unknown = await response.json();
    const distinctId =
      typeof body === 'object' && body !== null && 'distinctId' in body
        ? (body as { distinctId: unknown }).distinctId
        : undefined;
    if (typeof distinctId === 'string' && distinctId.length > 0) {
      client.identify(distinctId);
    }
  } catch {
    // Best-effort — identification failing must never surface to the caller.
  }
}

/** Idempotent: repeated calls within a session return the same in-flight/resolved promise. */
export function ensureIdentified(): Promise<void> {
  if (!identifyPromise) identifyPromise = fetchAndIdentify();
  return identifyPromise;
}

/** Test-only: resets the module-level cache so a fresh identify() attempt can be observed. */
export function resetIdentifyCacheForTests(): void {
  identifyPromise = null;
}
