import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';
import {
  deleteAdminGuideDocument,
  listAdminGuideDocuments,
  upsertAdminGuideDocument,
} from '@/lib/casino/guide-knowledge/pgvector-store';
import { GUIDE_KNOWLEDGE_SOURCES } from '@/lib/casino/guide-knowledge/registry';

const documentSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(1, 'Slug erforderlich').max(64),
  topic: z.enum([
    'blackjack',
    'crash',
    'dice',
    'roulette',
    'slots',
    'navigation',
    'commands',
    'economy',
    'vip_stats',
    'other',
  ]),
  title: z.string().trim().min(1, 'Titel erforderlich').max(120),
  content: z.string().trim().min(1, 'Inhalt erforderlich').max(10000),
  tags: z.array(z.string().trim().min(1).max(50)).max(25).default([]),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDev =
      process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true';
    if (!user && !isDev) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (user && !isAdminEmail(user.email) && !isDev)
      return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-knowledge-read',
      30,
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

    const dbDocs = await listAdminGuideDocuments();

    // If DB is not yet populated, return mapped default static sources
    const documents =
      dbDocs.length > 0
        ? dbDocs
        : GUIDE_KNOWLEDGE_SOURCES.map((s) => ({
            id: s.id,
            slug: s.id.replace(/^guide-/, ''),
            topic: s.topic,
            title: s.title,
            content: s.content,
            tags: s.tags,
            version: s.version,
            embedding: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

    return apiSuccessResponse({ documents }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error(
      'API/Admin/Knowledge',
      'GET failed',
      error instanceof Error ? error : undefined,
    );
    return apiErrorResponse('LOAD_FAILED', 'Failed to load knowledge documents', 500);
  }
}

export async function POST(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDev =
      process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true';
    if (!user && !isDev) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (user && !isAdminEmail(user.email) && !isDev)
      return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-knowledge-write',
      10,
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
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse(
        'INVALID_DOCUMENT_PAYLOAD',
        parsed.error.issues[0]?.message ?? 'Invalid document payload',
        400,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    const result = await upsertAdminGuideDocument(parsed.data);
    if (!result.success) {
      return apiErrorResponse(
        'UPSERT_FAILED',
        result.error ?? 'Failed to upsert guide document',
        500,
        undefined,
        { headers: rateLimitHeaders(rate) },
      );
    }

    return apiSuccessResponse(
      { success: true, id: result.id },
      { headers: rateLimitHeaders(rate) },
    );
  } catch (error) {
    CasinoLogger.error(
      'API/Admin/Knowledge',
      'POST failed',
      error instanceof Error ? error : undefined,
    );
    return apiErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500);
  }
}

export async function DELETE(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDev =
      process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_FALLBACK === 'true';
    if (!user && !isDev) return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
    if (user && !isAdminEmail(user.email) && !isDev)
      return apiErrorResponse('FORBIDDEN', 'Forbidden', 403);

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-knowledge-write',
      10,
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiErrorResponse(
        'MISSING_DOCUMENT_ID',
        'Missing document id parameter',
        400,
        undefined,
        {
          headers: rateLimitHeaders(rate),
        },
      );
    }

    const result = await deleteAdminGuideDocument(id);
    if (!result.success) {
      return apiErrorResponse(
        'DELETE_FAILED',
        result.error ?? 'Failed to delete guide document',
        500,
        undefined,
        {
          headers: rateLimitHeaders(rate),
        },
      );
    }

    return apiSuccessResponse({ success: true }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error(
      'API/Admin/Knowledge',
      'DELETE failed',
      error instanceof Error ? error : undefined,
    );
    return apiErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500);
  }
}
