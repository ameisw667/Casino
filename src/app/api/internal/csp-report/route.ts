import * as Sentry from '@sentry/nextjs';
import { enforceRateLimit, getClientIdentifier } from '@/lib/security/request-security';
import {
  CSP_REPORT_BATCH_LIMIT,
  aggregateCspViolations,
  getCspReportSampler,
  normalizeCspReports,
  parseCspReports,
} from '@/lib/security/csp-report';
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

    // L3: every report is validated against the Zod schemas in csp-report.ts before anything is
    // forwarded — malformed or unrecognised payloads never reach Sentry verbatim; the browser
    // still gets its unconditional 204.
    const normalization = normalizeCspReports(parseCspReports(raw).slice(0, CSP_REPORT_BATCH_LIMIT));
    if (normalization.malformedCount > 0) {
      // One generic warning per request (never per entry, and never the raw payload) — an attacker
      // must still spend a rate-limited request per malformed event.
      Sentry.captureMessage('Malformed CSP report discarded', {
        level: 'warning',
        tags: { source: 'csp-report', quality: 'malformed' },
        extra: { count: normalization.malformedCount },
      });
    }

    // L4: identical directive+blocked-uri combinations inside one batch collapse into a single
    // Sentry event that carries the repeat count, instead of N identical events.
    for (const violation of aggregateCspViolations(normalization.violations)) {
      // L2: @sentry/nextjs 10.x has no per-capture sampling hook, so sampling is decided here in
      // the route — deterministic, in-memory, per warm instance. The distributed guarantee is L1's
      // Upstash global cap; this is the second line that bounds a single instance's event output.
      const sampling = getCspReportSampler().decide(Date.now());
      if (!sampling.forward) {
        CasinoLogger.info('API/Internal/CspReport', 'CSP report dropped by sampling', {
          forwarded: getCspReportSampler().stats().forwarded,
          dropped: getCspReportSampler().stats().dropped,
        });
        if (sampling.notifyDrop) {
          // One aggregated counter event per window instead of one event per dropped report —
          // otherwise the drop bookkeeping would itself recreate the cost it prevents.
          Sentry.captureMessage('CSP report sampling suppressed reports', {
            level: 'warning',
            tags: { source: 'csp-report', sampling: 'active' },
            extra: { ...getCspReportSampler().stats() },
          });
        }
        continue;
      }

      Sentry.captureMessage('CSP violation reported', {
        level: 'warning',
        tags: { source: 'csp-report' },
        extra: { report: violation.report, count: violation.count },
      });
    }
  } catch (error) {
    // A malformed report body or a Sentry SDK failure must never surface to the browser.
    CasinoLogger.error('API/Internal/CspReport', 'Failed to process violation report', error);
  }

  return new Response(null, { status: 204 });
}
