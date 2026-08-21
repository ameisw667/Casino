import { scoreDocument, tokenizeQuery } from './matcher';
import { getKnowledgeDocById, GUIDE_KNOWLEDGE_SOURCES } from './registry';
import type { GuideKnowledgeSource } from './schema';
import { fetchQueryEmbedding, searchVectorChunks } from './vector-store';

export type RetrievalStrategy = 'keyword-fast-path' | 'vector-semantic' | 'platform-fallback';

export type HybridRetrievalResult = {
  docs: GuideKnowledgeSource[];
  strategy: RetrievalStrategy;
  topScore: number;
};

export type HybridRetrieverOptions = {
  maxDocs?: number;
  sources?: readonly GuideKnowledgeSource[];
  keywordFastPathThreshold?: number;
  apiKey?: string;
  fetchFn?: typeof fetch;
  fallbackDocIds?: readonly string[];
};

const DEFAULT_KEYWORD_FAST_PATH_THRESHOLD = 10;
const DEFAULT_FALLBACK_DOC_IDS = ['guide-navigation', 'guide-commands'] as const;

/**
 * Executes the 3-stage Hybrid RAG retrieval cascade:
 * 1. Stage 1: Fast Keyword Matcher (Score >= 10 -> 0 ms, 0 API calls)
 * 2. Stage 2: In-Memory Vector Embedding Search with text-embedding-3-small (Score < 10)
 * 3. Stage 3: Deterministic Platform Fallback (when no semantic matches found)
 */
export async function retrieveKnowledgeDocs(
  query: string,
  options: HybridRetrieverOptions = {},
): Promise<HybridRetrievalResult> {
  const {
    maxDocs = 2,
    sources = GUIDE_KNOWLEDGE_SOURCES,
    keywordFastPathThreshold = DEFAULT_KEYWORD_FAST_PATH_THRESHOLD,
    apiKey,
    fetchFn,
    fallbackDocIds = DEFAULT_FALLBACK_DOC_IDS,
  } = options;

  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return {
      docs: getFallbackDocs(fallbackDocIds, sources),
      strategy: 'platform-fallback',
      topScore: 0,
    };
  }

  // --- Stage 1: Fast Keyword Matcher (0 ms) ---
  const tokens = tokenizeQuery(normalizedQuery);
  if (tokens.length === 0) {
    return {
      docs: getFallbackDocs(fallbackDocIds, sources),
      strategy: 'platform-fallback',
      topScore: 0,
    };
  }

  const scoredDocs = sources
    .map((doc) => scoreDocument(doc, tokens))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const topMatch = scoredDocs[0];
  if (topMatch && topMatch.score >= keywordFastPathThreshold) {
    const selected = scoredDocs.slice(0, Math.max(1, maxDocs)).map((entry) => entry.doc);
    return {
      docs: selected,
      strategy: 'keyword-fast-path',
      topScore: topMatch.score,
    };
  }

  // --- Stage 2: In-Memory Vector Search (Semantic Fallback) ---
  try {
    const queryEmbedding = await fetchQueryEmbedding(normalizedQuery, apiKey, fetchFn);
    const chunkMatches = searchVectorChunks(queryEmbedding, {
      topK: 4,
      sources,
    });

    if (chunkMatches.length > 0) {
      const seenDocIds = new Set<string>();
      const semanticDocs: GuideKnowledgeSource[] = [];

      for (const match of chunkMatches) {
        const docId = match.chunk.docId;
        if (!seenDocIds.has(docId)) {
          seenDocIds.add(docId);
          const doc = sources.find((s) => s.id === docId) ?? getKnowledgeDocById(docId);
          if (doc) semanticDocs.push(doc);
        }
        if (semanticDocs.length >= maxDocs) break;
      }

      if (semanticDocs.length > 0) {
        return {
          docs: semanticDocs,
          strategy: 'vector-semantic',
          topScore: chunkMatches[0]?.similarity ?? 0.5,
        };
      }
    }
  } catch {
    // Stage 2 failure proceeds directly to Stage 3
  }

  // --- Stage 3: Deterministic Platform Fallback ---
  return {
    docs: getFallbackDocs(fallbackDocIds, sources),
    strategy: 'platform-fallback',
    topScore: 0,
  };
}

function getFallbackDocs(
  fallbackDocIds: readonly string[],
  sources: readonly GuideKnowledgeSource[],
): GuideKnowledgeSource[] {
  const fallback = fallbackDocIds
    .map((id) => sources.find((s) => s.id === id) ?? getKnowledgeDocById(id))
    .filter((doc): doc is GuideKnowledgeSource => doc !== undefined);

  if (fallback.length > 0) return fallback;
  return sources.slice(0, 2);
}
