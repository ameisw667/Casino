import { NextResponse } from 'next/server';
import { getClientIdentifier } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

// Public liveness probe for external uptime monitoring (05_1.13). Must stay free of any
// database, wallet, or secret access — this route is intentionally unauthenticated and
// bypasses src/proxy.ts's Supabase session lookup entirely (see the early-return there).
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120; // generous: real uptime-monitor polling intervals stay well under this
const MAX_TRACKED_IDENTIFIERS = 1_000; // crude unbounded-growth guard, not exactness

const hits = new Map<string, { count: number; windowStart: number }>();

// Deliberately NOT the shared Upstash limiter (enforceRateLimit): that one fails CLOSED
// when Redis is unreachable, which would make this liveness check report "down" for an
// unrelated infra hiccup — exactly the false signal a health check must never produce.
// This in-memory limiter fails open by design (any internal error just allows the request).
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
    const limited = existing.count > RATE_LIMIT_MAX;
    // Reported exactly once per window (on the request that first crosses the limit), not on
    // every subsequent 429 — a sustained flood would otherwise spam Sentry. The identifier
    // (IP/user) is deliberately not included in the message to avoid sending PII to Sentry.
    if (limited && existing.count === RATE_LIMIT_MAX + 1) {
      CasinoLogger.warn('HealthCheck', 'In-memory liveness rate limit exceeded');
    }
    return limited;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (isRateLimited(getClientIdentifier(request))) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // Deliberate chaos switch for the 05_1.13 incident-test runbook. No separate staging
  // deployment exists (removed alongside the Uptime-Kuma/VPS rollback, see
  // docs/archive/05_1.13_Uptime-Kuma-Monitoring.md §0) — this flag is safe to set directly
  // against Production for the duration of a deliberate, short-lived test: it touches no
  // DB/wallet/game path, only this one route's own response. Verified end-to-end against
  // Production on 2026-08-16 (docs/observability/06_health_check_uptime_monitoring.md §5).
  // Not a secret — a boolean feature flag with no DB/wallet content.
  if (process.env.HEALTH_FORCE_FAIL === '1') {
    return NextResponse.json(
      { status: 'error', reason: 'forced-failure-for-incident-test' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? 'local',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
