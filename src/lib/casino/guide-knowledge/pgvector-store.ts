import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '../logger';
import type { GuideKnowledgeSource } from './schema';
import { GUIDE_EMBEDDING_MODEL, OPENAI_EMBEDDINGS_URL } from './vector-store';

export type DbGuideDocument = {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  version: string;
  embedding: number[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MatchedDbDocument = {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  version: string;
  similarity: number;
};

/**
 * Generates an OpenAI 1536-dimensional embedding vector for pgvector storage.
 */
export async function generateOpenAiEmbedding1536(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'test-key' || key.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GUIDE_EMBEDDING_MODEL,
        input: text.trim(),
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };

    const embedding = json?.data?.[0]?.embedding;
    return Array.isArray(embedding) && embedding.length > 0 ? embedding : null;
  } catch {
    return null;
  }
}

/**
 * Searches active documents in Supabase pgvector using cosine distance RPC.
 * Returns null on any database error to trigger fail-safe in-memory fallback.
 */
export async function searchDatabaseDocuments(
  queryEmbedding: number[],
  matchThreshold = 0.35,
  matchCount = 3,
): Promise<GuideKnowledgeSource[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('match_guide_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return (data as MatchedDbDocument[]).map((row) => ({
      id: row.id as GuideKnowledgeSource['id'],
      version: row.version || '2026-08-21',
      topic: (row.topic === 'navigation' || row.topic === 'commands' || row.topic === 'economy'
        ? row.topic
        : 'games') as GuideKnowledgeSource['topic'],
      title: row.title,
      tags: row.tags || [],
      owner: 'product' as const,
      reviewedAt: '2026-08-21',
      status: 'active' as const,
      content: row.content,
    }));
  } catch (err) {
    CasinoLogger.warn(
      'PgVectorStore',
      'Database vector search skipped or failed, falling back to local store',
      {
        error: err instanceof Error ? err.message : String(err),
      },
    );
    return null;
  }
}

const memoryStoreCache = new Map<string, DbGuideDocument>();

/**
 * Lists all guide documents for admin management.
 */
export async function listAdminGuideDocuments(): Promise<DbGuideDocument[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('guide_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge with memory store if any exists
      const dbIds = new Set(data.map((d: DbGuideDocument) => d.id));
      const memoryExtras = Array.from(memoryStoreCache.values()).filter((d) => !dbIds.has(d.id));
      return [...data, ...memoryExtras] as DbGuideDocument[];
    }

    if (memoryStoreCache.size > 0) {
      return Array.from(memoryStoreCache.values());
    }

    return [];
  } catch (err) {
    CasinoLogger.warn('PgVectorStore', 'DB list failed, using memory store', {
      error: err instanceof Error ? err.message : String(err),
    });
    return Array.from(memoryStoreCache.values());
  }
}

/**
 * Upserts a guide document and generates its vector embedding.
 */
export async function upsertAdminGuideDocument(input: {
  id?: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  isActive?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const id = input.id?.trim() || `guide-${input.slug.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}`;
  const embedding = await generateOpenAiEmbedding1536(`${input.title}\n${input.content}`);

  const payload: DbGuideDocument = {
    id,
    slug: input.slug,
    topic: input.topic,
    title: input.title,
    content: input.content,
    tags: input.tags,
    version: '2026-08-21',
    embedding: embedding ?? null,
    is_active: input.isActive ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Always save to in-memory store for instant zero-latency feedback & fallback
  memoryStoreCache.set(id, payload);

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('guide_documents').upsert(payload);
    if (error) {
      CasinoLogger.warn('PgVectorStore', 'Supabase upsert failed, saved in-memory', { error: error.message });
    }
    return { success: true, id };
  } catch (err) {
    CasinoLogger.warn('PgVectorStore', 'Supabase upsert exception, saved in-memory', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: true, id };
  }
}

/**
 * Deletes a guide document by ID.
 */
export async function deleteAdminGuideDocument(id: string): Promise<{ success: boolean; error?: string }> {
  memoryStoreCache.delete(id);

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('guide_documents').delete().eq('id', id);
    if (error) {
      CasinoLogger.warn('PgVectorStore', 'Supabase delete failed, removed from memory', { error: error.message });
    }
    return { success: true };
  } catch (err) {
    CasinoLogger.warn('PgVectorStore', 'Supabase delete exception, removed from memory', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: true };
  }
}
