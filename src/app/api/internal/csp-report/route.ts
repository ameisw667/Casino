import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit, getClientIdentifier } from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

// M6 (worldmap/00-04-SecurityHardening.md): sink for the browser's own CSP violation reports
// (`report-uri`/`report-to` in src/proxy.ts's Content-Security-Policy). Unauthenticated by design —
// the browser's CSP engine sends these, not a logged-in user — and bypasses the CSRF Origin-Guard
// in src/proxy.ts (browser-internal reports carry no reliable Origin/Sec-Fetch-Site). Always
// responds 204 regardless of outcome: a reporting sink must never make the browser retry or a
// misconfigured limiter surface as a page-visible error.

// L1 (T_SECURITY_HARDENING/06_csp_violation_reporting.md): the per-IP limit alone scales with the
// attacker's IP count — a botnet with N IPs can push N × 120 reports/min through the per-IP guard
// and each accepted report becomes one Sentry event (Denial-of-Wallet against the Sentry quota).
// The global scope is keyed on ONE fixed identifier so every request shares a single distributed
// bucket, independent of the client IP the per-IP limit derives.
// Threshold rationale: legitimate CSP violations only fire on a misconfiguration/deploy
// regression — a normal deployment produces single-digit reports per minute, so 120/min (~2/s)
// keeps ~30x headroom above realistic baseline traffic while still capping a botnet's marginal
// value per IP. On overrun the sink stays silent (204) and simply stops forwarding.
export const CSP_REPORT_GLOBAL_SCOPE = 'csp-report-global';
export const CSP_REPORT_GLOBAL_REQUEST_LIMIT = 120;
export const CSP_REPORT_GLOBAL_WINDOW_SECONDS = 60;

export async function POST(request: Request): Promise<Response> {
  const identifier = getClientIdentifier(request);
  const decision = await enforceRateLimit(identifier, 'csp-report', 20, 10);
  if (!decision.success) {
    return new Response(null, { status: 204 });
  }

  const globalDecision = await enforceRateLimit(
    'global',
    CSP_REPORT_GLOBAL_SCOPE,
    CSP_REPORT_GLOBAL_REQUEST_LIMIT,
    CSP_REPORT_GLOBAL_WINDOW_SECONDS,
  );
  if (!globalDecision.success) {
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
