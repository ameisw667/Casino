import type { ErrorEvent, EventHint } from '@sentry/nextjs';

// Substring match (not anchored) so prefixed real-world names like
// SUPABASE_SERVICE_ROLE_KEY or UPSTASH_REDIS_REST_TOKEN still match. serverSeed
// is excluded specifically when followed by "hash" — serverSeedHash is the
// deliberately disclosable half of the seed pair (see bet/route.ts:141-145).
const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|password|token|secret|api[-_]?key|service[-_]?role[-_]?key|session|server[-_]?seed(?!_?hash))/i;

const MAX_SCRUB_DEPTH = 6;

function scrubValue(value: unknown, depth: number): unknown {
  if (depth > MAX_SCRUB_DEPTH || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[Redacted]' : scrubValue(val, depth + 1);
    }
    return result;
  }
  return value;
}

// Global beforeSend filter for all three Sentry runtimes (server/edge/client). Deletes
// request headers/cookies wholesale rather than allowlisting individual header names —
// an allowlist silently under-redacts the day someone adds a new sensitive header.
export function scrubSentryEvent(event: ErrorEvent, _hint: EventHint): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event };

  if (scrubbed.request) {
    const { cookies: _cookies, headers: _headers, ...restRequest } = scrubbed.request;
    scrubbed.request = restRequest;
  }

  if (scrubbed.user) {
    const { ip_address: _ip, email: _email, ...restUser } = scrubbed.user;
    scrubbed.user = restUser;
  }

  if (scrubbed.extra) {
    scrubbed.extra = scrubValue(scrubbed.extra, 0) as typeof scrubbed.extra;
  }

  if (scrubbed.contexts) {
    scrubbed.contexts = scrubValue(scrubbed.contexts, 0) as typeof scrubbed.contexts;
  }

  if (scrubbed.breadcrumbs) {
    scrubbed.breadcrumbs = scrubbed.breadcrumbs.map((crumb) => ({
      ...crumb,
      data: crumb.data ? (scrubValue(crumb.data, 0) as typeof crumb.data) : crumb.data,
    }));
  }

  return scrubbed;
}
