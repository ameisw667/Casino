import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';
import { CasinoLogger } from '@/lib/casino/logger';
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
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

const CursorPayloadSchema = z.object({
  // offset: true — PostgREST serialisiert TIMESTAMPTZ als +00:00, nicht als Z-Suffix
  createdAt: z.string().datetime({ offset: true }),
  id: z.string().uuid(),
});

function decodeCursor(raw: string): { createdAt: string; id: string } | null {
  try {
    if (raw.length > 256) return null;
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const result = CursorPayloadSchema.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');
}

type HistoryRpcRow = {
  id: string;
  game: string | null;
  type: string;
  amount: number | string;
  balance_after: number | string;
  created_at: string;
};

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

    // Query-Parameter parsen (cursor/limit sind rein additive, optionale Parameter)
    const url = new URL(request.url);
    const rawCursor = url.searchParams.get('cursor');
    const rawLimit = url.searchParams.get('limit');

    const cursor = rawCursor ? decodeCursor(rawCursor) : null;
    if (rawCursor && !cursor) {
      return apiErrorResponse('INVALID_CURSOR', 'Invalid cursor', 400);
    }

    const limitSchema = z.coerce.number().int().min(1).max(100);
    const limitParseResult = rawLimit ? limitSchema.safeParse(rawLimit) : null;
    if (rawLimit && !limitParseResult?.success) {
      return apiErrorResponse('INVALID_REQUEST', 'Invalid limit', 400);
    }
    const limit = limitParseResult?.success ? limitParseResult.data : cursor ? 20 : 100;

    // Query via service-role RPC (bypasses RLS; API itself enforces auth)
    const adminSupabase = createAdminClient();

    // Migration 061 behandelt NULL als "erste Seite" (p_cursor_created_at IS NULL),
    // ohne SQL-Defaults — der generierte Arg-Typ bildet das NULL-Handling daher
    // nicht ab (string statt string | null). Der Cast dokumentiert diese bekannte
    // Typegen-Lücke exakt an der Aufrufstelle.
    type GetHistoryArgs = Database['public']['Functions']['get_user_history_page']['Args'];
    const historyArgs = {
      p_user_id: userId,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_limit: limit + 1, // +1 = Standard-Trick, um hasMore ohne zweite COUNT-Query zu bestimmen
    } as GetHistoryArgs;
    const { data, error } = await adminSupabase.rpc('get_user_history_page', historyArgs);

    if (error) {
      CasinoLogger.error('API/User/History', 'History query failed', error);
      return apiErrorResponse('HISTORY_UNAVAILABLE', 'History unavailable', 503);
    }

    const allRows = (data ?? []) as HistoryRpcRow[];
    const hasMore = allRows.length > limit;
    const pageRows = hasMore ? allRows.slice(0, limit) : allRows;

    const rows = pageRows.map((row) => ({
      id: String(row.id),
      game: row.game ?? null,
      type: String(row.type ?? ''),
      amount: Number(row.amount ?? 0),
      balance_after: Number(row.balance_after ?? 0),
      created_at: String(row.created_at ?? ''),
    }));

    const lastRow = pageRows[pageRows.length - 1];
    const nextCursor = hasMore && lastRow ? encodeCursor(lastRow.created_at, lastRow.id) : null;

    const parsed = HistoryResponseSchema.parse({ rows, nextCursor, hasMore });

    return apiSuccessResponse(parsed, {
      headers: {
        'Cache-Control': 'private, no-store',
        ...rateLimitHeaders(rate),
      },
    });
  } catch (err) {
    CasinoLogger.error('API/User/History', 'History route error', err);
    return apiErrorResponse('HISTORY_UNAVAILABLE', 'History unavailable', 503);
  }
}
