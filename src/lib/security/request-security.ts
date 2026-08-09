import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitDecision {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  unavailable?: boolean;
}

const localWindows = new Map<string, { count: number; reset: number }>();
const remoteLimiters = new Map<string, Ratelimit>();

export function getClientIdentifier(request: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown';
  return `ip:${ip}`;
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
