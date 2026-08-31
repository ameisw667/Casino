import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { createGuideActorHash } from './guide-telemetry';

export type GuideFeedbackRating = 1 | -1;

export type GuideFeedbackCategory =
  'helpful' | 'accurate' | 'inaccurate' | 'unhelpful' | 'slow' | 'other';

export type GuideFeedbackItem = {
  id: string;
  createdAt: string;
  rating: GuideFeedbackRating;
  messageId?: string | null;
  userId?: string | null;
  category?: GuideFeedbackCategory | null;
  comment?: string | null;
};

export type GuideFeedbackSummary = {
  totalRatings: number;
  positiveRatings: number;
  negativeRatings: number;
  satisfactionRate: number;
  recentFeedback: GuideFeedbackItem[];
};

// In-Memory Fallback Store
const memoryFeedbackStore: GuideFeedbackItem[] = [];

/**
 * Records a user feedback rating (thumbs up / down) for an AI guide response.
 */
export async function recordGuideFeedback(input: {
  rating: GuideFeedbackRating;
  messageId?: string;
  userId?: string;
  category?: GuideFeedbackCategory;
  comment?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const id = crypto.randomUUID();
  // Never persist the raw Supabase user id / IP-derived identifier — this table
  // (`guide_feedback.user_id`) is documented as pseudonymized, matching the same
  // HMAC actor-hash convention already used for guide telemetry (guide-telemetry.ts).
  // No hash if the secret is unconfigured or userId is empty (fail closed: the
  // feedback itself is still worth recording anonymously, but never with a raw id).
  const actorHash = input.userId ? createGuideActorHash(input.userId) : null;
  const item: GuideFeedbackItem = {
    id,
    createdAt: new Date().toISOString(),
    rating: input.rating,
    messageId: input.messageId?.slice(0, 128) || null,
    userId: actorHash?.hash ?? null,
    category: input.category || null,
    comment: input.comment?.slice(0, 1000) || null,
  };

  // Always keep in memory store
  memoryFeedbackStore.unshift(item);
  if (memoryFeedbackStore.length > 100) {
    memoryFeedbackStore.pop();
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('guide_feedback').insert({
      id: item.id,
      created_at: item.createdAt,
      rating: item.rating,
      message_id: item.messageId,
      user_id: item.userId,
      category: item.category,
      comment: item.comment,
    });

    if (error) {
      CasinoLogger.error(
        'GuideFeedback',
        'Supabase feedback insert failed, not persisted',
        new Error(error.message),
      );
      return { success: false, id, error: error.message };
    }

    return { success: true, id };
  } catch (err) {
    CasinoLogger.error(
      'GuideFeedback',
      'Supabase feedback insert exception, not persisted',
      err instanceof Error ? err : undefined,
    );
    return {
      success: false,
      id,
      error: err instanceof Error ? err.message : 'Unknown database error',
    };
  }
}

/**
 * Retrieves the 7-day feedback satisfaction summary and recent feedback items.
 */
export async function getGuideFeedbackSummary(
  asOf: Date = new Date(),
): Promise<GuideFeedbackSummary> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('get_guide_feedback_summary', {
      p_as_of: asOf.toISOString(),
    });

    if (!error && data && typeof data === 'object') {
      const parsed = data as {
        totalRatings?: number;
        positiveRatings?: number;
        negativeRatings?: number;
        satisfactionRate?: number;
        recentFeedback?: GuideFeedbackItem[];
      };

      return {
        totalRatings: parsed.totalRatings ?? 0,
        positiveRatings: parsed.positiveRatings ?? 0,
        negativeRatings: parsed.negativeRatings ?? 0,
        satisfactionRate: parsed.satisfactionRate ?? 100.0,
        recentFeedback: Array.isArray(parsed.recentFeedback) ? parsed.recentFeedback : [],
      };
    }
  } catch {
    // Fallback to in-memory store
  }

  // Calculate from in-memory fallback
  const totalRatings = memoryFeedbackStore.length;
  const positiveRatings = memoryFeedbackStore.filter((f) => f.rating === 1).length;
  const negativeRatings = memoryFeedbackStore.filter((f) => f.rating === -1).length;
  const satisfactionRate =
    totalRatings === 0 ? 100.0 : Math.round((positiveRatings / totalRatings) * 1000) / 10;

  return {
    totalRatings,
    positiveRatings,
    negativeRatings,
    satisfactionRate,
    recentFeedback: memoryFeedbackStore.slice(0, 20),
  };
}
