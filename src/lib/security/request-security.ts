import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import * as Sentry from '@sentry/nextjs';
import { CasinoLogger } from '@/lib/casino/logger';
import { apiErrorResponse } from '@/lib/api/response';
import { APP_ERROR_CODES } from '@/lib/security/form-errors';

export interface RateLimitDecision {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  unavailable?: boolean;
}

const localWindows = new Map<string, { count: number; reset: number }>();
const remoteLimiters = new Map<string, Ratelimit>();

// Controlled fail-closed 503s never throw, so they'd otherwise never reach
// Sentry — this is the 1.9 dependency 1.10 (chaos testing) relies on to
// observe simulated Upstash outages (docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md, Abschnitt 3).
function reportRateLimiterUnavailable(scope: string): void {
  try {
    Sentry.captureMessage('Rate limiter unavailable, failing closed', {
      level: 'error',
      tags: { scope },
    });
  } catch {
    // A Sentry SDK failure must never affect the fail-closed rate limit decision.
  }
}

// Dev-only header a local Artillery load test (worldmap/05_Observability_und_Lasttest.md,
// P28/1.16, L4) can set to simulate several distinct players instead of a single
// `dev_user_fallback` — otherwise every request would serialize on the same
// pg_advisory_xact_lock(user_id) and the test would measure lock contention, not
// realistic multi-user concurrency. Only ever consulted from within the existing
// dev-fallback branch below: it can never override a real Supabase session, and every
// existing invariant (NODE_ENV, ALLOW_DEV_FALLBACK, signed-out cookie) applies unchanged.
const LOADTEST_USER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Resolves the dev-only auth fallback userId, or null if none of the dev-fallback
 * conditions apply (in which case the caller must treat the request as unauthenticated).
 */
export function resolveDevFallbackUserId(request: Request, isSignedOut: boolean): string | null {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.ALLOW_DEV_FALLBACK !== 'true' ||
    isSignedOut
  ) {
    return null;
  }
  const loadtestUserId = request.headers.get('x-loadtest-user-id');
  if (loadtestUserId && LOADTEST_USER_ID_PATTERN.test(loadtestUserId)) {
    return `loadtest_${loadtestUserId}`;
  }
  return 'dev_user_fallback';
}

// 06_5 L0: single source of truth for client IP extraction across the repo. Previously
// `src/lib/casino/network-fingerprint.ts` kept its own copy that took the FIRST x-forwarded-for
// entry — the spoofable variant this module's security review (06_1 L3) already removed here.
// Both callers now share this function so the two implementations can never drift apart again.
// Returns null when no IP header is present (callers decide their own fallback semantics).
export function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  // 06_5 L0 (I7): observability only — XFF keeps winning, but a disagreement between the
  // two proxy headers is now visible instead of silently swallowed.
  if (forwarded && realIp && forwarded !== realIp) {
    CasinoLogger.warn('RequestSecurity', 'x-forwarded-for and x-real-ip disagree', {
      forwarded,
      realIp,
    });
  }
  return forwarded || realIp || null;
}

// 06_5 L3 (I6): IPv6 users get /64-sized rate-limit buckets. A typical ISP assigns a /64
// block (2^64 addresses) to one customer, so without prefix collapsing a single user could
// rotate addresses to mint fresh rate-limit buckets. IPv4 addresses are returned unchanged.
export function normalizeIpForRateLimit(ip: string): string {
  if (!ip.includes(':')) return ip;
  const doubleColonIndex = ip.indexOf('::');
  let groups: string[];
  if (doubleColonIndex === -1) {
    groups = ip.split(':');
  } else {
    const head = ip.slice(0, doubleColonIndex).split(':').filter(Boolean);
    const tail = ip.slice(doubleColonIndex + 2).split(':').filter(Boolean);
    const missing = Math.max(0, 8 - head.length - tail.length);
    groups = [...head, ...Array<string>(missing).fill('0'), ...tail];
  }
  const last = groups[groups.length - 1];
  // Dotted embedded forms (::ffff:203.0.113.9, NAT64 64:ff9b::203.0.113.9) are rate-limited
  // on the embedded IPv4 itself — the /64 prefix of a translation/mapping address says
  // nothing about the real client.
  if (last?.includes('.')) return last;
  return groups.slice(0, 4).join(':');
}

// 06_5 L4 (I10): fallback when no IP header survives. A UA+Accept-Language hash is NOT a
// real identifier — this is a deliberately weak, documented fallback for a rare case
// (proxies/tests without any IP header), only meant to avoid one global `ip:unknown`
// bucket that every such request would share. The 5-minute time slice keeps buckets from
// being stable enough to brute-force, while staying stable within typical request bursts.
// Accepted trade-off (security review 2026-09-06, MEDIUM): both headers are attacker-
// controlled, so in a header-less environment buckets can be rotated. On Vercel production
// the platform always sets x-forwarded-for, making this path unreachable; the once-per-
// process warn below surfaces a misconfigured/self-hosted deployment instead. The old
// single shared bucket was evasion-proof but let one actor exhaust the bucket for every
// such client (cross-client DoS) — the de-sharing is intentional.
// Non-crypto FNV-1a on purpose: this file must stay Edge-runtime-safe (no node:crypto).
const FALLBACK_WINDOW_MS = 5 * 60 * 1000;
let fallbackBucketWarned = false;

function fallbackBucketIdentifier(request: Request): string {
  const timeSlice = Math.floor(Date.now() / FALLBACK_WINDOW_MS);
  const input = `${request.headers.get('user-agent') ?? ''}|${request.headers.get('accept-language') ?? ''}|${timeSlice}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  if (process.env.NODE_ENV === 'production' && !fallbackBucketWarned) {
    fallbackBucketWarned = true;
    CasinoLogger.warn(
      'RequestSecurity',
      'Rate limit identifier fell back to UA bucket (no IP headers present) — deployment likely misconfigured',
    );
  }
  return `ua-${hash.toString(16)}`;
}

// Trusted-proxy decision (06_5 L2, documented 2026-09-06): we deliberately stay on the
// generic `x-forwarded-for` / `x-real-ip` headers. On Vercel's Edge network every request
// passes exactly one platform proxy hop whose value we cannot hop-count-verify, and Vercel
// does not set a distinct trusted client-IP header beyond the standard forwarded headers
// for this project (verified against Vercel docs 2026-09-06). Switching to a
// `x-vercel-forwarded-for`-style header would break local dev and non-Vercel deployments
// without adding verifiable trust, so the last-XFF-entry rule plus IPv6 /64 normalization
// (above) is the accepted, documented state. Revisit if the deployment platform changes.
export function getClientIdentifier(request: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  // Last XFF entry, not the first: the platform proxy (Vercel) appends the real client IP
  // at the end, while the first entry stays client-controlled. Taking the first entry let
  // an attacker mint unlimited rate-limit buckets by sending a spoofed XFF value
  // (security review 2026-09-04, docs/archive/06_1_bot_automation_detection_plan.md L3).
  const ip = extractClientIp(request);
  if (ip) return `ip:${normalizeIpForRateLimit(ip)}`;
  return `ip:${fallbackBucketIdentifier(request)}`;
}

export function validateMutationOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  if (!origin) return new Response('Origin required', { status: 403 });

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return new Response('Invalid origin', { status: 403 });
  }

  if (parsedOrigin.origin !== origin) {
    return new Response('Invalid origin', { status: 403 });
  }

  const configuredOriginsValue = process.env.APP_ORIGINS;
  const hasConfiguredOrigins =
    typeof configuredOriginsValue === 'string' && configuredOriginsValue.trim() !== '';
  const configuredOrigins = hasConfiguredOrigins
    ? configuredOriginsValue
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .flatMap((value) => {
          try {
            const configured = new URL(value);
            return configured.origin === value ? [configured.origin] : [];
          } catch {
            return [];
          }
        })
    : [];

  let allowedOrigins = configuredOrigins;
  if (!hasConfiguredOrigins && process.env.NODE_ENV !== 'production') {
    allowedOrigins = [new URL(request.url).origin];
  }

  if (!allowedOrigins.includes(parsedOrigin.origin)) {
    return new Response('Cross-site mutation rejected', { status: 403 });
  }
  return null;
}

export async function enforceRateLimit(
  identifier: string,
  scope: string,
  limit = 10,
  windowSeconds = 10,
): Promise<RateLimitDecision> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const limiterKey = [url, token, scope, String(limit), String(windowSeconds)].join(
        String.fromCharCode(0),
      );
      let remoteLimiter = remoteLimiters.get(limiterKey);
      if (!remoteLimiter) {
        remoteLimiter = new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
          analytics: true,
          prefix: '@upstash/ratelimit/casino/' + scope,
        });
        remoteLimiters.set(limiterKey, remoteLimiter);
      }
      const result = await remoteLimiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch {
      reportRateLimiterUnavailable(scope);
      return {
        success: false,
        unavailable: true,
        limit,
        remaining: 0,
        reset: Date.now() + windowSeconds * 1000,
      };
    }
  }
  if (process.env.NODE_ENV === 'production') {
    reportRateLimiterUnavailable(scope);
    return {
      success: false,
      unavailable: true,
      limit,
      remaining: 0,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  const key = `${scope}:${identifier}`;
  const now = Date.now();
  const current = localWindows.get(key);
  const bucket =
    !current || current.reset <= now ? { count: 0, reset: now + windowSeconds * 1000 } : current;
  bucket.count += 1;
  localWindows.set(key, bucket);
  return {
    success: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.reset,
  };
}

export function rateLimitHeaders(result: RateLimitDecision): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
    ...(result.success
      ? {}
      : { 'Retry-After': String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))) }),
  };
}

export function resetLocalRateLimitsForTests(): void {
  localWindows.clear();
  remoteLimiters.clear();
}

// 06_6 L4 (E6): higher-order wrapper that makes the rate-limit check structurally
// impossible to forget for routes built on it — the decision runs BEFORE the handler and
// cannot be silently skipped. Deliberately ADDITIVE (plan decision): the ~55 existing
// manually-instrumented routes keep their working boilerplate; only new routes (and the
// two reference implementations rebuilt here — guide-persona, telegram/webhook) use this
// wrapper. Not a mass-migration plan.
//
// The optional `resolve` hook lets a route run its own auth/secret gate BEFORE the limit
// decision (e.g. user-based buckets, or secret-first ordering so floods of unauthenticated
// requests cannot exhaust the bucket for the legitimate caller — the telegram-webhook
// pattern). Its `data` payload is passed through to the handler so auth work is not
// duplicated. Without `resolve`, buckets are IP-based via getClientIdentifier().
export interface WithRateLimitContext<T> {
  decision: RateLimitDecision;
  data: T;
}

type WithRateLimitResolution<T> = { identifier: string; data: T } | { earlyResponse: Response };

export function withRateLimit<T = undefined>(
  handler: (request: Request, context: WithRateLimitContext<T>) => Promise<Response>,
  options: {
    scope: string;
    limit: number;
    windowSeconds: number;
    // Security contract (review 06_6, MEDIUM-2): the wrapper trusts `identifier`
    // unconditionally — it MUST be derived via getClientIdentifier(request[, userId]) or
    // another server-verified, per-client-stable value. A constant identifier merges every
    // caller into one bucket (cross-client DoS); a per-request random value silently
    // disables the limit. Never hand-roll either.
    resolve?: (request: Request) => Promise<WithRateLimitResolution<T>>;
  },
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    let identifier: string;
    let data: T;
    if (options.resolve) {
      const resolution = await options.resolve(request);
      if ('earlyResponse' in resolution) return resolution.earlyResponse;
      identifier = resolution.identifier;
      data = resolution.data;
    } else {
      identifier = getClientIdentifier(request);
      data = undefined as T;
    }

    const decision = await enforceRateLimit(
      identifier,
      options.scope,
      options.limit,
      options.windowSeconds,
    );
    if (!decision.success) {
      return apiErrorResponse(
        decision.unavailable ? APP_ERROR_CODES.SERVICE_UNAVAILABLE : APP_ERROR_CODES.RATE_LIMITED,
        decision.unavailable
          ? 'Rate limit service temporarily unavailable.'
          : 'Too many requests. Please try again shortly.',
        decision.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(decision) },
      );
    }
    return handler(request, { decision, data });
  };
}
