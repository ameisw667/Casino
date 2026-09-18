import type { CookieOptions } from '@supabase/ssr';

// T_SECURITY_HARDENING/04_csrf_origin_guard.md L3 — SameSite was previously left to the
// @supabase/ssr library default, which is functionally 'lax' but invisible to review and untested.
// Pinning it explicitly keeps the CSRF-relevant cookie attribute regression-protected. 'strict' is
// deliberately NOT used: the Google OAuth redirect flow relies on a cross-site top-level redirect
// handing off into the app, which Lax permits and Strict would break.
export const SESSION_COOKIE_SAME_SITE = 'lax' as const;

export function withExplicitSameSite(options?: CookieOptions): CookieOptions {
  return { ...options, sameSite: SESSION_COOKIE_SAME_SITE };
}
