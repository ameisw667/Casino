import { NextResponse } from 'next/server';
import { getClientIdentifier } from '@/lib/security/request-security';

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
    return existing.count > RATE_LIMIT_MAX;
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

  // Deliberate chaos switch for the 05_1.13 incident-test runbook (section 5.7). Set only
  // on the staging Vercel environment for the duration of a planned test, never in
  // Production. Not a secret — a boolean feature flag with no DB/wallet content.
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
