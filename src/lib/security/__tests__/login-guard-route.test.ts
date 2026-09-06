import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'ip:203.0.113.9'),
  rateLimitHeaders: vi.fn(() => ({ 'Retry-After': '37' })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn() },
}));

import { POST } from '@/app/api/auth/login-guard/route';

function request(): Request {
  return new Request('http://localhost/api/auth/login-guard', {
    method: 'POST',
    headers: { origin: 'http://localhost' },
  });
}

describe('POST /api/auth/login-guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: 0,
    });
  });

  it('rate-limits by IP before authentication (no user identity can exist yet)', async () => {
    await POST(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith('ip:203.0.113.9', 'login-attempt', 5, 60);
  });

  it('allows the first five attempts within the window', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.allowed).toBe(true);
  });

  it('returns 429 on the sixth attempt from the same IP, independent of client storage', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request());
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('fails closed with 503 when the rate limiter is unavailable', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error.code).toBe('RATE_LIMIT_UNAVAILABLE');
  });

  it('fails closed with 503 on an unexpected error', async () => {
    mocks.enforceRateLimit.mockRejectedValue(new Error('redis down'));
    const response = await POST(request());
    expect(response.status).toBe(503);
  });

  it('does not leak the client identifier in the response body', async () => {
    const response = await POST(request());
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain('203.0.113.9');
  });
});
