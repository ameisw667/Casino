import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

import { recordGuideFeedback, getGuideFeedbackSummary } from '../guide-feedback';

describe('Guide Feedback & Evals Service', () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  afterEach(() => {
    process.env = originalEnvironment;
  });

  it('records a positive user feedback rating', async () => {
    const res = await recordGuideFeedback({
      rating: 1,
      messageId: 'turn-123',
      userId: 'anon-user-1',
      category: 'helpful',
      comment: 'Sehr präzise Erklärung der Blackjack-Regeln!',
    });

    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();
  });

  it('pseudonymizes the actor id with the same HMAC convention as guide telemetry, never storing the raw id', async () => {
    process.env.GUIDE_TELEMETRY_HMAC_SECRET = '0123456789abcdef0123456789abcdef';
    process.env.GUIDE_TELEMETRY_HMAC_VERSION = '1';
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await recordGuideFeedback({ rating: 1, userId: 'player-42' });

    const insertedRow = mockInsert.mock.calls[0]?.[0] as { user_id: string | null };
    expect(insertedRow.user_id).toMatch(/^[a-f0-9]{64}$/);
    expect(insertedRow.user_id).not.toContain('player-42');
  });

  it('stores no actor id at all (fail closed) instead of a raw id when the HMAC secret is unconfigured', async () => {
    delete process.env.GUIDE_TELEMETRY_HMAC_SECRET;
    delete process.env.GUIDE_TELEMETRY_HMAC_VERSION;
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await recordGuideFeedback({ rating: 1, userId: 'player-42' });

    const insertedRow = mockInsert.mock.calls[0]?.[0] as { user_id: string | null };
    expect(insertedRow.user_id).toBeNull();
  });

  it('reports failure instead of a false success when the Supabase insert actually fails', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'db unreachable' } }),
    });

    const res = await recordGuideFeedback({ rating: 1, userId: 'player-1' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('db unreachable');
  });

  it('records a negative user feedback rating', async () => {
    const res = await recordGuideFeedback({
      rating: -1,
      messageId: 'turn-456',
      userId: 'anon-user-2',
      category: 'slow',
      comment: 'Antwort hat zu lange gedauert.',
    });

    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();
  });

  it('calculates the satisfaction summary correctly', async () => {
    mockRpc.mockResolvedValueOnce({
      data: {
        totalRatings: 10,
        positiveRatings: 9,
        negativeRatings: 1,
        satisfactionRate: 90.0,
        recentFeedback: [
          {
            id: 'fb-1',
            createdAt: '2026-08-21T20:00:00Z',
            rating: 1,
            category: 'helpful',
            comment: 'Super!',
          },
        ],
      },
      error: null,
    });

    const summary = await getGuideFeedbackSummary();

    expect(summary.totalRatings).toBe(10);
    expect(summary.positiveRatings).toBe(9);
    expect(summary.negativeRatings).toBe(1);
    expect(summary.satisfactionRate).toBe(90.0);
    expect(Array.isArray(summary.recentFeedback)).toBe(true);
    expect(summary.recentFeedback.length).toBe(1);
  });
});
