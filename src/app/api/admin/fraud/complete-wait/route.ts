import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { wait } from '@trigger.dev/sdk';
import { createClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/security/admin';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { CasinoLogger } from '@/lib/casino/logger';

const completeWaitSchema = z.object({
  tokenId: z.string().min(1),
  status: z.enum(['reviewed', 'closed']),
  reason: z.string().trim().min(1).max(500),
});

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
      'admin-fraud-complete-wait',
      20,
      60,
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

    const body = await request.json().catch(() => null);
    const parsed = completeWaitSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse(
        'INVALID_PAYLOAD',
        parsed.error.issues[0]?.message ?? 'Invalid waitpoint completion payload',
        400,
      );
    }

    await wait.completeToken(parsed.data.tokenId, {
      status: parsed.data.status,
      reason: parsed.data.reason,
      reviewerId: user.id,
    });

    CasinoLogger.info(
      'API/Admin/Fraud/CompleteWait',
      `Admin ${user.email} completed waitpoint ${parsed.data.tokenId}`,
      { status: parsed.data.status },
    );

    return apiSuccessResponse({ success: true });
  } catch (error) {
    CasinoLogger.error('API/Admin/Fraud/CompleteWait', 'Failed to complete wait token', error);
    return apiErrorResponse('COMPLETE_FAILED', 'Failed to complete waitpoint token', 500);
  }
}
