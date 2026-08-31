import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { runFraudSignalScan } from '@/lib/casino/fraud-detection';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const SCAN_RATE_LIMIT = 1;
const SCAN_RATE_WINDOW_SECONDS = 300;

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (!isAdminEmail(user.email)) return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-fraud-scan',
      SCAN_RATE_LIMIT,
      SCAN_RATE_WINDOW_SECONDS,
    );
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const admin = createAdminClient();
    const { data: acquired, error: lockError } = await admin.rpc('try_acquire_fraud_scan_lock', {
      p_locked_by: user.id,
    });
    if (lockError) {
      CasinoLogger.error('API/Admin/FraudScan', 'Lock acquisition failed', lockError);
      return apiErrorResponse('LOCK_UNAVAILABLE', 'Scan lock unavailable', 503);
    }
    if (!acquired) {
      return apiErrorResponse('SCAN_RUNNING', 'Scan already running', 409);
    }

    try {
      const summary = await runFraudSignalScan();
      CasinoLogger.info('API/Admin/FraudScan', `Admin ${user.email} ran a fraud scan`, summary);
      return apiSuccessResponse(summary, { headers: rateLimitHeaders(rate) });
    } finally {
      const { error: unlockError } = await admin.rpc('release_fraud_scan_lock');
      if (unlockError) {
        CasinoLogger.error('API/Admin/FraudScan', 'Lock release failed', unlockError);
      }
    }
  } catch (error) {
    CasinoLogger.error('API/Admin/FraudScan', 'Scan unexpected failure', error);
    return apiErrorResponse('SCAN_UNAVAILABLE', 'Fraud scan unavailable', 503);
  }
}
