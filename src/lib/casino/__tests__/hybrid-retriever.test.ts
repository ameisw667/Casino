import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chunkAllKnowledgeDocs, chunkKnowledgeDoc } from '../guide-knowledge/chunker';
import { retrieveKnowledgeDocs } from '../guide-knowledge/hybrid-retriever';
import { getKnowledgeDocById, GUIDE_KNOWLEDGE_SOURCES } from '../guide-knowledge/registry';
import {
  generateLocalEmbedding,
  resetVectorStoreCache,
  searchVectorChunks,
} from '../guide-knowledge/vector-store';

describe('Knowledge Chunker', () => {
  it('splits single document into structured semantic chunks', () => {
    const blackjackDoc = getKnowledgeDocById('guide-blackjack')!;
    const chunks = chunkKnowledgeDoc(blackjackDoc);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.docId).toBe('guide-blackjack');
    expect(chunks[0]?.title).toBe('Blackjack Rules and Actions');
    expect(chunks[0]?.searchableText).toContain('Blackjack Rules and Actions');
  });

  it('chunks all 10 registered knowledge documents', () => {
    const allChunks = chunkAllKnowledgeDocs(GUIDE_KNOWLEDGE_SOURCES);
    expect(allChunks.length).toBeGreaterThanOrEqual(15);
    expect(new Set(allChunks.map((c) => c.docId)).size).toBe(10);
  });
});

describe('Vector Store & Cosine Search', () => {
  beforeEach(() => {
    resetVectorStoreCache();
  });

  it('generates normalized local embeddings', () => {
    const emb = generateLocalEmbedding('European Roulette Rules and Bets');
    expect(emb.length).toBe(256);
  });

  it('finds top matching chunks with cosine similarity', () => {
    const queryEmb = generateLocalEmbedding('Blackjack Hit Stand Split Double');
    const matches = searchVectorChunks(queryEmb, { topK: 3 });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.chunk.docId).toBe('guide-blackjack');
    expect(matches[0]?.similarity).toBeGreaterThan(0.2);
  });
});

describe('Hybrid RAG Cascade (retrieveKnowledgeDocs)', () => {
  beforeEach(() => {
    resetVectorStoreCache();
  });

  it('executes Stage 1 (Fast Keyword Path) for high-confidence queries', async () => {
    const result = await retrieveKnowledgeDocs('How do I split cards in Blackjack?');

    expect(result.strategy).toBe('keyword-fast-path');
    expect(result.docs[0]?.id).toBe('guide-blackjack');
    expect(result.topScore).toBeGreaterThanOrEqual(10);
  });

  it('executes Stage 2 (Semantic Vector Fallback) for complex / conversational queries', async () => {
    // A question without the exact keyword 'blackjack' or 'cards' that scores below 10 in keyword matcher
    const result = await retrieveKnowledgeDocs('Can I duplicate my wager when holding 11 against dealer?');

    expect(['vector-semantic', 'keyword-fast-path']).toContain(result.strategy);
    expect(result.docs.length).toBeGreaterThan(0);
  });

  it('executes Stage 3 (Platform Fallback) for empty or unrecognizable queries', async () => {
    const result = await retrieveKnowledgeDocs('');

    expect(result.strategy).toBe('platform-fallback');
    expect(result.docs.map((d) => d.id)).toEqual(['guide-navigation', 'guide-commands']);
  });

  it('handles OpenAI API fetch errors gracefully by using local vector fallback', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const result = await retrieveKnowledgeDocs('How does the crash curve increase?', {
      apiKey: 'sk-fake-key-for-test',
      fetchFn: mockFetch as unknown as typeof fetch,
      keywordFastPathThreshold: 999, // Force Stage 2
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result.docs.length).toBeGreaterThan(0);
    expect(result.strategy).toBe('vector-semantic');
    expect(result.docs[0]?.id).toBe('guide-crash');
  });
});
