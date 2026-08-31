import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  enforceRateLimit: vi.fn(),
  rpc: vi.fn(),
  getGuideFeedbackSummary: vi.fn(),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn((_req: Request, userId?: string) => `user:${userId}`),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/casino/guide-feedback', () => ({
  getGuideFeedbackSummary: mocks.getGuideFeedbackSummary,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.casinoLoggerError },
}));

import { GET } from '../route';

function request() {
  return new Request('https://casino.example/api/admin/evals');
}

describe('GET /api/admin/evals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@example.com' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: 0 });
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    mocks.getGuideFeedbackSummary.mockResolvedValue({
      totalRatings: 0,
      positiveRatings: 0,
      negativeRatings: 0,
      satisfactionRate: 100,
      recentFeedback: [],
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(request());
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'nobody@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await GET(request());
    expect(res.status).toBe(403);
  });

  it('is rate-limited like every other admin GET endpoint (regression: previously had no rate limit at all)', async () => {
    mocks.enforceRateLimit.mockResolvedValue({ success: false, limit: 30, remaining: 0, reset: 0 });
    const res = await GET(request());
    expect(res.status).toBe(429);
    expect(mocks.getGuideFeedbackSummary).not.toHaveBeenCalled();
  });

  it('returns 200 with telemetry and feedback for an admin within the rate limit', async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { success: boolean } };
    expect(json.data.success).toBe(true);
  });

  it('never leaks a thrown exception message to the client', async () => {
    mocks.getGuideFeedbackSummary.mockRejectedValue(new Error('secret internal detail'));
    const res = await GET(request());

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain('secret internal detail');
  });
});
