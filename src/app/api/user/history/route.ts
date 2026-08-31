import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import { z } from 'zod';

const HistoryRowSchema = z.object({
  id: z.string().uuid(),
  game: z.string().nullable(),
  type: z.string(),
  amount: z.number(),
  balance_after: z.number(),
  created_at: z.string(),
});

const HistoryResponseSchema = z.object({
  rows: z.array(HistoryRowSchema),
  count: z.number(),
});

export async function GET(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    let userId = authUser?.id;
    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');

    if (
      !userId &&
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_FALLBACK === 'true' &&
      !isExplicitSignedOut
    ) {
      userId = 'dev_user_fallback';
    }
    if (!userId) {
      return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    }

    // Rate limit
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'history-read',
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

    // Query via service-role (bypasses RLS; API itself enforces auth)
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('wallet_transactions')
      .select('id, game, type, amount, balance_after, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('History query failed:', error);
      return apiErrorResponse('HISTORY_UNAVAILABLE', 'History unavailable', 503);
    }

    const rows = (data ?? []).map((row) => ({
      id: String(row.id),
      game: row.game ?? null,
      type: String(row.type ?? ''),
      amount: Number(row.amount ?? 0),
      balance_after: Number(row.balance_after ?? 0),
      created_at: String(row.created_at ?? ''),
    }));

    const parsed = HistoryResponseSchema.parse({ rows, count: rows.length });

    return apiSuccessResponse(parsed, {
      headers: {
        'Cache-Control': 'private, no-store',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (err) {
    console.error('History route error:', err);
    return apiErrorResponse('HISTORY_UNAVAILABLE', 'History unavailable', 503);
  }
}
