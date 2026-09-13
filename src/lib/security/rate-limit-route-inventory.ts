// 06_6 L3 (E5): central route-completeness inventory. The distributed-consistency audit
// (Unterkategorie #8) found that nothing compares the filesystem route list against the
// rate-limit caller list — which is exactly why two real routes (guide-persona,
// telegram/webhook) were silently unprotected. This module is the single source of truth
// the completeness test (rate-limit-route-completeness.test.ts) checks against, so a NEW
// route can no longer ship without either instrumentation or an explicit, documented
// exemption here.

// Detection rule: a route counts as instrumented when its source contains a real CALL of
// `enforceRateLimit(` or `withRateLimit(` (generic instantiation `withRateLimit<T>(...)`
// counts too — guide-persona uses exactly that form). A comment-only mention deliberately
// does NOT count (health and cron-alert both mention the shared limiter's name in comments
// explaining why they do NOT use it — a naive string grep would let that masquerade as
// coverage). Comments are stripped before matching so the call-syntax rule holds by
// construction, not by coincidence of phrasing (security review 06_6, LOW-4); a `//` NOT
// preceded by `:` is treated as a comment start so `https://`-style strings survive.
export function isRateLimitInstrumented(routeSource: string): boolean {
  const codeOnly = routeSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(?<!:)\/\/.*$/gm, '');
  return (
    codeOnly.includes('enforceRateLimit(') ||
    codeOnly.includes('withRateLimit(') ||
    codeOnly.includes('withRateLimit<')
  );
}

// Allowlist of routes deliberately NOT rate-limited via enforceRateLimit/withRateLimit.
// Keys are route paths relative to `src/app/api` (e.g. 'internal/cron-alert'). Every entry
// mirrors the documented "bewusst NICHT instrumentiert" list in
// docs/observability/05_ratelimit_failclosed_alerting.md §5 — adding an entry here without
// updating that doc (or vice versa) should be treated as drift.
export const RATE_LIMIT_EXEMPT_ROUTES: ReadonlySet<string> = new Set([
  // Own fail-open in-memory limiter (docs/observability/06_health_check_uptime_monitoring.md).
  'health',
  // Secret-auth, machine-to-machine, called only by pg_cron (docs/observability/07).
  'internal/cron-alert',
  // Machine-to-machine event consumers, secret-auth, called only by pg_net/pg_cron from
  // inside the database (migrations 036/047). A fail-closed 503 here would stall the
  // settlement/event pipeline on a transient Upstash blip — deliberate exemption.
  'internal/big-win-events',
  'internal/wallet-events',
  // Read-only public GETs answered from small cached queries (private, no-store). Cheap,
  // stateless, no auth surface — documented trade-off, revisit if any grows a mutation.
  'casino/config',
  'casino/jackpot',
  'casino/active-round',
  'community',
  'tournaments/daily-race',
  // Admin route guarded by admin auth + Origin check; single-user POST that only kicks a
  // Trigger.dev task. Deliberately outside the sliding-window scopes (documented).
  'admin/digest-preview/start',
  // Retired endpoints answering a constant 410 with no database or auth work.
  'casino/session-sync',
  'casino/migrate-session',
  'webhooks/clerk',
  // Force-static CDN-cached documentation surfaces (06_6 L2, comments in the route files).
  'docs',
  'openapi.json',
]);

// A route is compliant when it is rate-limit instrumented OR explicitly exempt. Anything
// else is the "forgotten route" case this inventory exists to catch.
export function isRateLimitRouteCompliant(routePath: string, routeSource: string): boolean {
  return isRateLimitInstrumented(routeSource) || RATE_LIMIT_EXEMPT_ROUTES.has(routePath);
}