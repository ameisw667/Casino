import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordGuideFeedback } from '@/lib/casino/guide-feedback';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const feedbackSchema = z.object({
  rating: z.union([z.literal(1), z.literal(-1)]),
  messageId: z.string().max(128).optional(),
  category: z
    .enum(['helpful', 'accurate', 'inaccurate', 'unhelpful', 'slow', 'other'])
    .optional(),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const clientIdentifier = getClientIdentifier(request, user?.id);
    const rate = await enforceRateLimit(clientIdentifier, 'guide-feedback', 20, 60);
    if (!rate.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: rateLimitHeaders(rate),
      });
    }

    const json = await request.json().catch(() => null);
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: parsed.error.issues },
        { status: 400, headers: rateLimitHeaders(rate) },
      );
    }

    const result = await recordGuideFeedback({
      rating: parsed.data.rating,
      messageId: parsed.data.messageId,
      userId: user?.id || clientIdentifier,
      category: parsed.data.category,
      comment: parsed.data.comment,
    });

    return NextResponse.json(
      { success: true, id: result.id },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to record feedback', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
