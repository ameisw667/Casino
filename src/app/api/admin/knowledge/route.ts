import { NextResponse } from 'next/server';
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
  slug: z.string().trim().min(2).max(64).regex(/^[a-z0-9_-]+$/i, 'Invalid slug format'),
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
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(10).max(4000),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).default([]),
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
    if (!user && !isDev) return new NextResponse('Unauthorized', { status: 401 });
    if (user && !isAdminEmail(user.email) && !isDev)
      return new NextResponse('Forbidden', { status: 403 });

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-knowledge-read',
      30,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
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

    return NextResponse.json({ documents }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/Knowledge', 'GET failed', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to load knowledge documents' }, { status: 500 });
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
    if (!user && !isDev) return new NextResponse('Unauthorized', { status: 401 });
    if (user && !isAdminEmail(user.email) && !isDev)
      return new NextResponse('Forbidden', { status: 403 });

    const userId = user?.id || 'dev_admin';
    const rate = await enforceRateLimit(
      getClientIdentifier(request, userId),
      'admin-knowledge-write',
      10,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid document payload' },
        { status: 400, headers: rateLimitHeaders(rate) },
      );
    }

    const result = await upsertAdminGuideDocument(parsed.data);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to upsert guide document' },
        { status: 500, headers: rateLimitHeaders(rate) },
      );
    }

    return NextResponse.json({ success: true, id: result.id }, { headers: rateLimitHeaders(rate) });
  } catch (error) {
    CasinoLogger.error('API/Admin/Knowledge', 'POST failed', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    if (!user && !isDev) return new NextResponse('Unauthorized', { status: 401 });
    if (user && !isAdminEmail(user.email) && !isDev)
      return new NextResponse('Forbidden', { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing document id parameter' }, { status: 400 });
    }

    const result = await deleteAdminGuideDocument(id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to delete guide document' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    CasinoLogger.error('API/Admin/Knowledge', 'DELETE failed', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
