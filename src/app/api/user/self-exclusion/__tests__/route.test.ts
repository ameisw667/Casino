import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  resolveDevFallbackUserId: vi.fn(),
  checkWellbeingGuard: vi.fn(),
  setSelfExclusion: vi.fn(),
  setDailyLossLimit: vi.fn(),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:player-1'),
  rateLimitHeaders: vi.fn(() => ({ 'x-ratelimit-limit': '5' })),
  resolveDevFallbackUserId: mocks.resolveDevFallbackUserId,
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/responsible-gambling', () => ({
  checkWellbeingGuard: mocks.checkWellbeingGuard,
  setSelfExclusion: mocks.setSelfExclusion,
  setDailyLossLimit: mocks.setDailyLossLimit,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.casinoLoggerError },
}));

import { GET, POST, PUT } from '../route';

function request(body: unknown, method: 'POST' | 'GET' | 'PUT' = 'POST') {
  return new Request('https://casino.example/api/user/self-exclusion', {
    method,
    headers: { 'Content-Type': 'application/json', origin: 'https://casino.example' },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'player-1' } } });
  mocks.resolveDevFallbackUserId.mockReturnValue(null);
  mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 0 });
  mocks.checkWellbeingGuard.mockResolvedValue({
    state: 'allowed',
    dailyLossLimitCents: null,
    dailyNetLossCents: 0,
  });
});

describe('POST /api/user/self-exclusion', () => {
  it('activates the exclusion and returns the ISO timestamp', async () => {
    mocks.setSelfExclusion.mockResolvedValue('2099-01-01T00:00:00.000Z');

    const res = await POST(request({ durationDays: 30 }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { selfExcludedUntil: '2099-01-01T00:00:00.000Z' } });
    expect(mocks.setSelfExclusion).toHaveBeenCalledWith('player-1', 30);
  });

  it('validates the duration with strict bounds', async () => {
    for (const durationDays of [0, -3, 0.5, 366, '30']) {
      const res = await POST(request({ durationDays }));
      expect(res.status).toBe(400);
    }
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });

  it('rejects malformed request bodies', async () => {
    const res = await POST(request('not-an-object'));
    expect(res.status).toBe(400);
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });

  it('returns 401 without a resolved user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(request({ durationDays: 7 }));
    expect(res.status).toBe(401);
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });

  it('fails closed with 503 when the rate-limit backend is unavailable', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 1000,
    });
    const res = await POST(request({ durationDays: 7 }));
    expect(res.status).toBe(503);
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });

  it('returns 429 on rate limit and never calls the service', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 1000,
    });
    const res = await POST(request({ durationDays: 7 }));
    expect(res.status).toBe(429);
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });

  it('maps a service failure to 503 without leaking the raw error', async () => {
    mocks.setSelfExclusion.mockRejectedValue(
      new Error('relation user_wellbeing_limits does not exist'),
    );
    const res = await POST(request({ durationDays: 7 }));

    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toContain('relation user_wellbeing_limits');
  });

  it('rejects cross-origin mutations', async () => {
    mocks.validateMutationOrigin.mockReturnValue({ status: 403 });
    const res = await POST(request({ durationDays: 7 }));
    expect(res.status).toBe(403);
    expect(mocks.setSelfExclusion).not.toHaveBeenCalled();
  });
});

describe('GET /api/user/self-exclusion', () => {
  it('reports an active exclusion with its end timestamp', async () => {
    mocks.checkWellbeingGuard.mockResolvedValue({
      state: 'self-excluded',
      until: '2099-01-01T00:00:00.000Z',
    });

    const res = await GET(request(null, 'GET'));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: {
        selfExcluded: true,
        selfExcludedUntil: '2099-01-01T00:00:00.000Z',
        dailyLossLimitCents: null,
        dailyNetLossCents: null,
      },
    });
  });

  it('reports no exclusion for an allowed user', async () => {
    const res = await GET(request(null, 'GET'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: { selfExcluded: false, dailyLossLimitCents: null, dailyNetLossCents: 0 },
    });
  });

  it('surfaces the daily loss limit and today net loss for the settings UI', async () => {
    mocks.checkWellbeingGuard.mockResolvedValue({
      state: 'allowed',
      dailyLossLimitCents: 5000,
      dailyNetLossCents: 1234,
    });
    const res = await GET(request(null, 'GET'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: { selfExcluded: false, dailyLossLimitCents: 5000, dailyNetLossCents: 1234 },
    });
  });

  it('fails closed with 503 when the guard is unavailable', async () => {
    mocks.checkWellbeingGuard.mockResolvedValue({ state: 'unavailable' });
    const res = await GET(request(null, 'GET'));
    expect(res.status).toBe(503);
  });

  it('returns 401 without a resolved user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(request(null, 'GET'));
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/user/self-exclusion (daily loss limit, 06_2 L3)', () => {
  it('sets the limit in cents', async () => {
    const res = await PUT(request({ dailyLossLimitCents: 5000 }, 'PUT'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { dailyLossLimitCents: 5000 } });
    expect(mocks.setDailyLossLimit).toHaveBeenCalledWith('player-1', 5000);
  });

  it('clears the limit with null', async () => {
    const res = await PUT(request({ dailyLossLimitCents: null }, 'PUT'));
    expect(res.status).toBe(200);
    expect(mocks.setDailyLossLimit).toHaveBeenCalledWith('player-1', null);
  });

  it('validates the limit bounds strictly', async () => {
    for (const dailyLossLimitCents of [0, -5, 0.5, 1_000_001, '5000', {}]) {
      const res = await PUT(request({ dailyLossLimitCents }, 'PUT'));
      expect(res.status).toBe(400);
    }
    expect(mocks.setDailyLossLimit).not.toHaveBeenCalled();
  });

  it('returns 401 without a resolved user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await PUT(request({ dailyLossLimitCents: 5000 }, 'PUT'));
    expect(res.status).toBe(401);
    expect(mocks.setDailyLossLimit).not.toHaveBeenCalled();
  });

  it('rejects cross-origin mutations', async () => {
    mocks.validateMutationOrigin.mockReturnValue({ status: 403 });
    const res = await PUT(request({ dailyLossLimitCents: 5000 }, 'PUT'));
    expect(res.status).toBe(403);
    expect(mocks.setDailyLossLimit).not.toHaveBeenCalled();
  });

  it('maps a service failure to 503 without leaking the raw error', async () => {
    mocks.setDailyLossLimit.mockRejectedValue(
      new Error('relation user_wellbeing_limits does not exist'),
    );
    const res = await PUT(request({ dailyLossLimitCents: 5000 }, 'PUT'));
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('relation user_wellbeing_limits');
  });
});
