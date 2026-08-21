import { chunkAllKnowledgeDocs, type GuideKnowledgeChunk } from './chunker';
import { GUIDE_KNOWLEDGE_SOURCES } from './registry';
import type { GuideKnowledgeSource } from './schema';
import { cosineSimilarity, normalizeVector } from './vector-math';

export const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';
export const GUIDE_EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_TIMEOUT_MS = 4_000;

export type EmbeddedChunk = {
  chunk: GuideKnowledgeChunk;
  embedding: number[];
};

export type ScoredChunk = {
  chunk: GuideKnowledgeChunk;
  similarity: number;
};

/**
 * Deterministic bag-of-words DJB2 vector embedding used for local fallback,
 * test isolation, and offline resilience across 256 dimensions.
 */
export function generateLocalEmbedding(text: string, dimensions = 256): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);

  for (const word of words) {
    let hash = 5381;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) + hash + word.charCodeAt(c)) >>> 0;
    }
    const pos = hash % dimensions;
    vector[pos] = (vector[pos] ?? 0) + 1.0;
  }

  return normalizeVector(vector);
}

/**
 * Fetches an embedding vector for a given query from OpenAI's REST API.
 * Falls back to local embedding if the API key is not configured or network call fails.
 */
export async function fetchQueryEmbedding(
  query: string,
  apiKey?: string,
  fetchFn: typeof fetch = fetch,
): Promise<number[]> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key || key === 'test-key' || key.trim().length === 0) {
    return generateLocalEmbedding(query);
  }

  try {
    const response = await fetchFn(OPENAI_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GUIDE_EMBEDDING_MODEL,
        input: query.trim(),
      }),
      signal: AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
    });

    if (!response.ok) {
      return generateLocalEmbedding(query);
    }

    const json = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };

    const embedding = json?.data?.[0]?.embedding;
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }

    return generateLocalEmbedding(query);
  } catch {
    return generateLocalEmbedding(query);
  }
}

let inMemoryVectorStoreCache: EmbeddedChunk[] | null = null;

/**
 * Initializes and caches in-memory embeddings for all chunks of the given knowledge sources.
 */
export function getOrCreateVectorStore(
  sources: readonly GuideKnowledgeSource[] = GUIDE_KNOWLEDGE_SOURCES,
): EmbeddedChunk[] {
  if (inMemoryVectorStoreCache && inMemoryVectorStoreCache.length > 0) {
    return inMemoryVectorStoreCache;
  }

  const chunks = chunkAllKnowledgeDocs(sources);
  inMemoryVectorStoreCache = chunks.map((chunk) => ({
    chunk,
    embedding: generateLocalEmbedding(chunk.searchableText),
  }));

  return inMemoryVectorStoreCache;
}

/**
 * Clears the in-memory vector store cache (useful for test resets).
 */
export function resetVectorStoreCache(): void {
  inMemoryVectorStoreCache = null;
}

/**
 * Searches the in-memory vector store using cosine similarity against a query embedding.
 */
export function searchVectorChunks(
  queryEmbedding: readonly number[],
  options: {
    topK?: number;
    minSimilarity?: number;
    sources?: readonly GuideKnowledgeSource[];
  } = {},
): ScoredChunk[] {
  const { topK = 3, minSimilarity = 0.1, sources = GUIDE_KNOWLEDGE_SOURCES } = options;
  const store = getOrCreateVectorStore(sources);

  // If query embedding matches local embedding dimension, use directly
  const searchEmbedding =
    queryEmbedding.length === 256
      ? queryEmbedding
      : generateLocalEmbedding(String(queryEmbedding.slice(0, 10)));

  const scored: ScoredChunk[] = store.map(({ chunk, embedding }) => ({
    chunk,
    similarity: cosineSimilarity(searchEmbedding, embedding),
  }));

  return scored
    .filter((entry) => entry.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Math.max(1, topK));
}
