import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

import {
  deleteAdminGuideDocument,
  generateOpenAiEmbedding1536,
  listAdminGuideDocuments,
  searchDatabaseDocuments,
  upsertAdminGuideDocument,
} from '../guide-knowledge/pgvector-store';

describe('pgvector Guide Knowledge Store', () => {
  it('maps Supabase RPC results to GuideKnowledgeSource format', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [
        {
          id: 'guide-blackjack',
          slug: 'games-blackjack',
          topic: 'blackjack',
          title: 'Blackjack Rules',
          content: 'Deal, hit, stand rules.',
          tags: ['blackjack', 'rules'],
          version: '2026-08-21',
          similarity: 0.88,
        },
      ],
      error: null,
    });

    const results = await searchDatabaseDocuments([0.1, 0.2, 0.3], 0.35, 2);
    expect(results).not.toBeNull();
    expect(results).toHaveLength(1);
    expect(results![0]?.id).toBe('guide-blackjack');
    expect(results![0]?.topic).toBe('games');
    expect(results![0]?.status).toBe('active');
  });

  it('returns null on database error to allow graceful in-memory fallback', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation "guide_documents" does not exist' },
    });

    const results = await searchDatabaseDocuments([0.1, 0.2, 0.3]);
    expect(results).toBeNull();
  });

  it('lists admin guide documents ordered from Supabase', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({
          data: [
            {
              id: 'doc-1',
              slug: 'doc-1-slug',
              topic: 'crash',
              title: 'Crash Game',
              content: 'Curve info',
              tags: ['crash'],
              version: '2026-08-21',
              embedding: null,
              is_active: true,
              created_at: '2026-08-21T00:00:00Z',
              updated_at: '2026-08-21T00:00:00Z',
            },
          ],
          error: null,
        }),
      }),
    });

    const docs = await listAdminGuideDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toBe('Crash Game');
  });

  it('upserts admin guide document into Supabase', async () => {
    const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    });

    const result = await upsertAdminGuideDocument({
      slug: 'test-slug',
      topic: 'dice',
      title: 'Dice Guide',
      content: 'Dice rules and payout',
      tags: ['dice'],
      isActive: true,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('guide-test-slug');
    expect(mockUpsert).toHaveBeenCalled();
  });

  it('deletes admin guide document by ID', async () => {
    const mockEq = vi.fn().mockResolvedValueOnce({ error: null });
    const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq });
    mockFrom.mockReturnValueOnce({
      delete: mockDelete,
    });

    const result = await deleteAdminGuideDocument('guide-test-slug');
    expect(result.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith('id', 'guide-test-slug');
  });

  it('reports failure instead of a false success when the Supabase upsert actually fails', async () => {
    const mockUpsert = vi.fn().mockResolvedValueOnce({ error: { message: 'db unreachable' } });
    mockFrom.mockReturnValueOnce({
      upsert: mockUpsert,
    });

    const result = await upsertAdminGuideDocument({
      slug: 'test-slug',
      topic: 'dice',
      title: 'Dice Guide',
      content: 'Dice rules and payout',
      tags: ['dice'],
      isActive: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('db unreachable');
  });

  it('reports failure instead of a false success when the Supabase delete actually fails', async () => {
    const mockEq = vi.fn().mockResolvedValueOnce({ error: { message: 'db unreachable' } });
    const mockDelete = vi.fn().mockReturnValueOnce({ eq: mockEq });
    mockFrom.mockReturnValueOnce({
      delete: mockDelete,
    });

    const result = await deleteAdminGuideDocument('guide-test-slug');
    expect(result.success).toBe(false);
    expect(result.error).toBe('db unreachable');
  });

  it('generates null embedding when API key is unconfigured or test key', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const embedding = await generateOpenAiEmbedding1536('Test content');
    expect(embedding).toBeNull();
  });
});
