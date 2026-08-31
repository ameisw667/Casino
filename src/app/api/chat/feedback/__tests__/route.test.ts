import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  recordGuideFeedback: vi.fn(),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:player-1'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/guide-feedback', () => ({
  recordGuideFeedback: mocks.recordGuideFeedback,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.casinoLoggerError },
}));

import { POST } from '../route';

function request(body: unknown) {
  return new Request('https://casino.example/api/chat/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'https://casino.example' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'player-1' } } });
    mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 20, remaining: 19, reset: 0 });
    mocks.recordGuideFeedback.mockResolvedValue({ success: true, id: 'fb-1' });
  });

  it('returns 200 on a successful insert', async () => {
    const res = await POST(request({ rating: 1, category: 'helpful' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { success: true, id: 'fb-1' } });
  });

  it('surfaces a 500 without leaking the raw DB error message when the insert actually fails', async () => {
    mocks.recordGuideFeedback.mockResolvedValue({
      success: false,
      error: 'relation guide_feedback does not exist',
    });
    const res = await POST(request({ rating: 1 }));

    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: { code: string; message: string } };
    expect(json.error.message).toBe('Failed to record feedback');
    expect(JSON.stringify(json)).not.toContain('relation guide_feedback');
  });

  it('never leaks a thrown exception message to the client', async () => {
    mocks.recordGuideFeedback.mockRejectedValue(new Error('secret internal detail'));
    const res = await POST(request({ rating: 1 }));

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain('secret internal detail');
  });

  it('rejects an invalid rating before touching the feedback service', async () => {
    const res = await POST(request({ rating: 5 }));
    expect(res.status).toBe(400);
    expect(mocks.recordGuideFeedback).not.toHaveBeenCalled();
  });
});
