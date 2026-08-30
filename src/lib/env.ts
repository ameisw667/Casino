import 'server-only';
import { z } from 'zod';

// Core env vars every request path depends on, unconditionally — no existing runtime fallback
// covers their absence (worldmap/00-04-SecurityHardening.md, M3). Deliberately excludes vars with
// an already-intentional soft-fail design: SUPABASE_ADMIN_EMAILS (missing = fail-closed "no admins",
// a legitimate state per src/lib/security/admin.ts), UPSTASH_REDIS_REST_URL/_TOKEN (missing = dev
// in-memory fallback, production 503 fail-closed per src/lib/security/request-security.ts), Sentry/
// PostHog keys (both SDKs already no-op cleanly on undefined). Hard-failing boot on those would
// break already-supported deployment shapes (admin-less preview envs, local dev without Upstash).
const coreEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

let validated = false;

/**
 * Fails the server boot with a clear message instead of letting a missing/malformed secret
 * surface later as a cryptic runtime error on the first request that touches it (e.g. an empty
 * Supabase URL silently reaching `createBrowserClient('', ...)`).
 */
export function assertCoreEnv(): void {
  if (validated) return;

  const result = coreEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`[env] Missing or invalid required environment variables — ${issues}`);
  }

  validated = true;
}
