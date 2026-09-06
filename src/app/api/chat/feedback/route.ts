import { z } from 'zod';
import { recordGuideFeedback } from '@/lib/casino/guide-feedback';
import { CasinoLogger } from '@/lib/casino/logger';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';

const feedbackSchema = z.object({
  rating: z.union([z.literal(1), z.literal(-1)]),
  messageId: z.string().max(128).optional(),
  category: z.enum(['helpful', 'accurate', 'inaccurate', 'unhelpful', 'slow', 'other']).optional(),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure)
    return apiErrorResponse(
      'PERMISSION_DENIED',
      'Keine Berechtigung.',
      originFailure.status || 403,
    );

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const clientIdentifier = getClientIdentifier(request, user?.id);
    const rate = await enforceRateLimit(clientIdentifier, 'guide-feedback', 20, 60);
    if (!rate.success) {
      return apiErrorResponse(
        rate.unavailable ? 'RATE_LIMIT_UNAVAILABLE' : 'RATE_LIMIT_EXCEEDED',
        rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests',
        rate.unavailable ? 503 : 429,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return apiErrorResponse(
        'INVALID_FEEDBACK_DATA',
        'Invalid feedback data',
        400,
        parsed.error.issues,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const result = await recordGuideFeedback({
      rating: parsed.data.rating,
      messageId: parsed.data.messageId,
      userId: user?.id || clientIdentifier,
      category: parsed.data.category,
      comment: parsed.data.comment,
    });

    if (!result.success) {
      CasinoLogger.error(
        'API/Chat/Feedback',
        'Feedback insert failed',
        new Error(result.error ?? 'Unknown error'),
      );
      return apiErrorResponse(
        'FEEDBACK_INSERT_FAILED',
        'Failed to record feedback',
        500,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    return apiSuccessResponse(
      { success: true, id: result.id },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (err) {
    CasinoLogger.error(
      'API/Chat/Feedback',
      'Feedback route threw',
      err instanceof Error ? err : undefined,
    );
    return apiErrorResponse('FEEDBACK_FAILED', 'Failed to record feedback', 500);
  }
}
