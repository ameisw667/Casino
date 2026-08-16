import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  enforceRateLimit: vi.fn(),
  createAnalyticsDistinctId: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:test-user'),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/analytics/identity-hmac', () => ({
  createAnalyticsDistinctId: mocks.createAnalyticsDistinctId,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn() },
}));

import { GET } from '@/app/api/analytics/identity/route';

function request(): Request {
  return new Request('http://localhost/api/analytics/identity', { headers: {} });
}

describe('GET /api/analytics/identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 });
  });

  it('returns a real JSON 401 (not a redirect) when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/json');
    const body = await response.json();
    expect(body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('returns the pseudonymized distinctId for an authenticated user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mocks.createAnalyticsDistinctId.mockReturnValue('a'.repeat(64));
    const response = await GET(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ distinctId: 'a'.repeat(64), version: 1 });
    expect(mocks.createAnalyticsDistinctId).toHaveBeenCalledWith('user-123');
  });

  it('never leaks the raw user id in the response body', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mocks.createAnalyticsDistinctId.mockReturnValue('a'.repeat(64));
    const response = await GET(request());
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain('user-123');
  });

  it('returns 429 when rate limited', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 1000,
    });
    const response = await GET(request());
    expect(response.status).toBe(429);
  });

  it('returns 503 when the rate limiter itself is unavailable', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 1000,
    });
    const response = await GET(request());
    expect(response.status).toBe(503);
  });

  it('fails closed with 503 when the HMAC secret is unconfigured', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mocks.createAnalyticsDistinctId.mockReturnValue(null);
    const response = await GET(request());
    expect(response.status).toBe(503);
  });

  it('fails closed with 503 on an unexpected error', async () => {
    mocks.getUser.mockRejectedValue(new Error('supabase down'));
    const response = await GET(request());
    expect(response.status).toBe(503);
  });
});
