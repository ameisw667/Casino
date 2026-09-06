import { timingSafeEqual } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { getClientIdentifier } from '@/lib/security/request-security';

// Deliberately NOT the shared Upstash limiter (enforceRateLimit): that one fails CLOSED when
// Redis is unreachable, which could suppress a genuine cron-failure alert exactly when
// broader infra trouble makes it most needed — same reasoning as the health-check's own
// in-memory limiter (docs/observability/06_health_check_uptime_monitoring.md §4). This route
// is already secret-protected, so a trip here means either a misconfigured caller with a
// valid secret or an attacker with a leaked one — a silent 429 is sufficient, no extra
// Sentry noise needed (unlike the public, unauthenticated health-check route).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20; // generous: legitimate traffic is at most one alert per failed cron run
const MAX_TRACKED_IDENTIFIERS = 1_000;
const hits = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(identifier: string): boolean {
  try {
    if (hits.size > MAX_TRACKED_IDENTIFIERS) hits.clear();
    const now = Date.now();
    const existing = hits.get(identifier);
    if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
      hits.set(identifier, { count: 1, windowStart: now });
      return false;
    }
    existing.count += 1;
    return existing.count > RATE_LIMIT_MAX;
  } catch {
    return false; // fail-open by design
  }
}

// Called only by the pg_net POST inside public.run_guide_telemetry_purge_job() (see migration
// 027_guide_telemetry_purge_cron.sql) when the scheduled purge fails. Authenticates via a shared
// secret instead of a Supabase session — pg_net does not send browser Origin headers or cookies,
// same exemption pattern as /api/telegram/webhook.
function hasValidAlertSecret(request: Request): boolean {
  const expected = process.env.CRON_ALERT_SECRET;
  const provided = request.headers.get('x-cron-alert-secret');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

const alertSchema = z.object({
  job: z.string().min(1).max(128),
  error: z.string().max(500),
});

export async function POST(request: Request) {
  if (!hasValidAlertSecret(request)) {
    return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  // Rate-limited only after the secret check succeeds — an unauthenticated flood without the
  // secret is rejected above regardless of volume, and never consumes a legitimate caller's
  // budget below.
  if (isRateLimited(getClientIdentifier(request))) {
    return apiErrorResponse('RATE_LIMIT_EXCEEDED', 'Too Many Requests', 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) {
    return apiSuccessResponse({ ok: true });
  }

  Sentry.captureMessage(`Cron job failed: ${parsed.data.job}`, {
    level: 'error',
    extra: { error: parsed.data.error },
    tags: { job: parsed.data.job },
  });

  return apiSuccessResponse({ ok: true });
}
