import { describe, it, expect, beforeEach, vi } from 'vitest';

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
  recordGuideFeedback,
  getGuideFeedbackSummary,
} from '../guide-feedback';

describe('Guide Feedback & Evals Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
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
