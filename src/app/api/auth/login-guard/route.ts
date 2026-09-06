import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';

// 06_1 Bot-Automation Detection (L1, V2): server-side login attempt ceiling. The existing
// client-side cooldown (login-cooldown.ts) is fully bypassable via storage resets, so this
// preflight route enforces the same 5-per-60s budget per IP before any Supabase auth call.
// IP-based identifier because no user identity exists before successful authentication.
// Known scope limits (security review 2026-09-04, docs/archive/06_1_bot_automation_detection_plan.md):
// 1. Only the app's own form calls this preflight — direct hits on Supabase's auth endpoint
//    bypass it entirely; the endpoint-level boundary remains Supabase Auth's built-in limits.
// 2. The IP identifier trusts proxy headers like every other scope (documented XFF risk).
// 3. Unlike the client cooldown, ALL attempts count — including successful logins — so shared
//    NAT IPs can hit the budget; accepted trade-off for the automation-detection goal.
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 60;

export async function POST(request: Request) {
  try {
    const rate = await enforceRateLimit(
      getClientIdentifier(request),
      'login-attempt',
      LOGIN_ATTEMPT_LIMIT,
      LOGIN_ATTEMPT_WINDOW_SECONDS,
    );

    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' } },
      );
    }

    return apiSuccessResponse({ allowed: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    CasinoLogger.error('API/Auth/LoginGuard', 'POST error', err);
    return apiErrorResponse('INTERNAL_SERVER_ERROR', 'Internal Server Error', 503);
  }
}
