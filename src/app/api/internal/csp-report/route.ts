import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit, getClientIdentifier } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

// M6 (worldmap/00-04-SecurityHardening.md): sink for the browser's own CSP violation reports
// (`report-uri`/`report-to` in src/proxy.ts's Content-Security-Policy). Unauthenticated by design —
// the browser's CSP engine sends these, not a logged-in user — and bypasses the CSRF Origin-Guard
// in src/proxy.ts (browser-internal reports carry no reliable Origin/Sec-Fetch-Site). Always
// responds 204 regardless of outcome: a reporting sink must never make the browser retry or a
// misconfigured limiter surface as a page-visible error.
export async function POST(request: Request): Promise<Response> {
  const identifier = getClientIdentifier(request);
  const decision = await enforceRateLimit(identifier, 'csp-report', 20, 10);
  if (!decision.success) {
    return new Response(null, { status: 204 });
  }

  try {
    const raw: unknown = await request.json();
    if (!raw) return new Response(null, { status: 204 });

    // Two report shapes exist: the legacy single-object `{ "csp-report": {...} }` sent with
    // Content-Type: application/csp-report, and the current Reporting API batch
    // `[{ type, url, body }, ...]` sent with Content-Type: application/reports+json.
    const reports: unknown[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && 'csp-report' in raw
        ? [(raw as Record<string, unknown>)['csp-report']]
        : [raw];

    for (const report of reports.slice(0, 20)) {
      Sentry.captureMessage('CSP violation reported', {
        level: 'warning',
        tags: { source: 'csp-report' },
        extra: { report },
      });
    }
  } catch (error) {
    // A malformed report body or a Sentry SDK failure must never surface to the browser.
    CasinoLogger.error('API/Internal/CspReport', 'Failed to process violation report', error);
  }

  return new Response(null, { status: 204 });
}
