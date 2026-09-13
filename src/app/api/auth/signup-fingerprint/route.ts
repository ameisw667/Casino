import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { CasinoLogger } from '@/lib/casino/logger';
import { recordBetNetworkFingerprintBestEffort } from '@/lib/casino/network-fingerprint';
import { checkKnownClusterBeforeGrant } from '@/lib/casino/fraud-detection';
import { APP_ERROR_CODES } from '@/lib/security/form-errors';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

// 06_3 L0 (Multi-Account-Abuse-Prevention): closes the fingerprint gap at account creation —
// until now only the three bet routes recorded network fingerprints, so a farmer who only
// created accounts and redeemed promo codes without ever betting was invisible to cluster
// detection. Modeled on /api/auth/signup-suspicion (06_1): fire-and-forget from the client,
// IP rate limit, session-attributed, fail-open — never blocks the (already completed)
// signup flow. The route also runs the 06_3 L1 pre-grant cluster check, so a known cluster
// produces its high-severity signal BEFORE the new account's start balance is provisioned
// on first wallet read.
const FINGERPRINT_LIMIT = 10;
const FINGERPRINT_WINDOW_SECONDS = 60;

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) {
    return apiErrorResponse(
      APP_ERROR_CODES.PERMISSION_DENIED,
      'Keine Berechtigung.',
      originFailure.status || 403,
    );
  }

  try {
    const rate = await enforceRateLimit(
      getClientIdentifier(request),
      'signup-fingerprint',
      FINGERPRINT_LIMIT,
      FINGERPRINT_WINDOW_SECONDS,
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

    // Cheap pre-check (same pattern as signup-suspicion): skip the Supabase Auth round
    // trip entirely when the request carries no plausible Supabase auth cookie.
    const cookieHeader = request.headers.get('cookie');
    const hasAuthCookie = cookieHeader?.includes('auth-token') ?? false;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = hasAuthCookie ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
      // Freshly created sessions may not yet be visible server-side — fail-open with a
      // no-op result instead of an error (identical contract to signup-suspicion).
      return apiSuccessResponse({ recorded: false }, { headers: { 'Cache-Control': 'no-store' } });
    }

    await recordBetNetworkFingerprintBestEffort(user.id, request);
    await checkKnownClusterBeforeGrant(user.id);

    return apiSuccessResponse({ recorded: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    CasinoLogger.error('API/Auth/SignupFingerprint', 'POST error', err);
    // Observability receiver: never block the (already completed) signup flow.
    return apiSuccessResponse({ recorded: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}