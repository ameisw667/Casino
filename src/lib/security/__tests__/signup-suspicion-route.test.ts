import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RiskEventInput } from '@/lib/casino/risk-signals';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  recordRiskEventBestEffort: vi.fn<(input: RiskEventInput) => Promise<boolean>>(async () => true),
  getUser: vi.fn(),
}));

vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'ip:203.0.113.9'),
  rateLimitHeaders: vi.fn(() => ({ 'Retry-After': '37' })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import { POST } from '@/app/api/auth/signup-suspicion/route';

function request(body: unknown): Request {
  return new Request('http://localhost/api/auth/signup-suspicion', {
    method: 'POST',
    headers: {
      origin: 'http://localhost',
      'content-type': 'application/json',
      // Simulates the freshly created Supabase session cookie after a successful signup.
      cookie: 'sb-test-ref-auth-token=base64-session',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/signup-suspicion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'new-user-1' } },
    });
  });

  it('rate-limits by IP with its own scope (receiver is public and pre-session)', async () => {
    await POST(request({ reason: 'honeypot' }));
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      'ip:203.0.113.9',
      'signup-suspicion',
      10,
      60,
    );
  });

  it('records a bot_signal_honeypot event for the signed-up user', async () => {
    const response = await POST(request({ reason: 'honeypot' }));
    expect(response.status).toBe(200);
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    const input = mocks.recordRiskEventBestEffort.mock.calls[0][0];
    expect(input.subjectUserId).toBe('new-user-1');
    expect(input.signalType).toBe('bot_signal_honeypot');
    expect(input.severity).toBe('low');
    expect(input.evidence).toEqual({ reason: 'honeypot' });
  });

  it('records a bot_signal_timing event for a sub-two-second submission', async () => {
    await POST(request({ reason: 'timing' }));
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    expect(mocks.recordRiskEventBestEffort.mock.calls[0][0].signalType).toBe('bot_signal_timing');
  });

  it('keeps the fingerprint dedup-stable per UTC day across repeated reports', async () => {
    await POST(request({ reason: 'timing' }));
    await POST(request({ reason: 'timing' }));
    const calls = mocks.recordRiskEventBestEffort.mock.calls;
    expect(calls[0][0].windowStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(calls[0][0].windowStart).toBe(calls[1][0].windowStart);
  });

  it('fails open without a signal when no session exists (pre-signup FK limit)', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(request({ reason: 'honeypot' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(false);
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('skips the Supabase round trip entirely when no auth cookie is present', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/signup-suspicion', {
        method: 'POST',
        headers: { origin: 'http://localhost', 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'timing' }),
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('never fails the completed signup flow on an unexpected server error', async () => {
    mocks.getUser.mockRejectedValue(new Error('auth down'));
    const response = await POST(request({ reason: 'timing' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(false);
  });

  it('returns 429 when the report budget is exhausted', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request({ reason: 'timing' }));
    expect(response.status).toBe(429);
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('fails closed with 503 when the rate limiter is unavailable', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request({ reason: 'timing' }));
    expect(response.status).toBe(503);
  });

  it('rejects unknown reasons and malformed bodies', async () => {
    const badReason = await POST(request({ reason: 'clickbait' }));
    expect(badReason.status).toBe(400);
    const garbage = await POST(
      new Request('http://localhost/api/auth/signup-suspicion', {
        method: 'POST',
        headers: { origin: 'http://localhost' },
      }),
    );
    expect(garbage.status).toBe(400);
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });

  it('does not leak the client identifier in the response body', async () => {
    const response = await POST(request({ reason: 'honeypot' }));
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain('203.0.113.9');
  });
});
