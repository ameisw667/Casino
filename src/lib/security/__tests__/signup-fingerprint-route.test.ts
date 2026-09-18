import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  validateMutationOrigin: vi.fn(),
  recordFingerprint: vi.fn(),
  checkCluster: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'ip:203.0.113.9'),
  rateLimitHeaders: vi.fn(() => ({ 'Retry-After': '37' })),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/lib/casino/network-fingerprint', () => ({
  recordBetNetworkFingerprintBestEffort: mocks.recordFingerprint,
}));
vi.mock('@/lib/casino/fraud-detection', () => ({
  checkKnownClusterBeforeGrant: mocks.checkCluster,
}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import { POST } from '@/app/api/auth/signup-fingerprint/route';

function request(withCookie: boolean = true): Request {
  return new Request('http://localhost/api/auth/signup-fingerprint', {
    method: 'POST',
    headers: {
      origin: 'http://localhost',
      // Simulates the freshly created Supabase session cookie after a successful signup.
      ...(withCookie ? { cookie: 'sb-test-ref-auth-token=base64-session' } : {}),
    },
  });
}

describe('POST /api/auth/signup-fingerprint (06_3 L0/L1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
    });
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'new-user-1' } } });
    mocks.recordFingerprint.mockResolvedValue(undefined);
    mocks.checkCluster.mockResolvedValue({ detected: false, clusterSize: null });
  });

  it('rate-limits by IP with its own scope', async () => {
    await POST(request());
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      'ip:203.0.113.9',
      'signup-fingerprint',
      10,
      60,
    );
  });

  it('rejects cross-origin mutations before anything else', async () => {
    mocks.validateMutationOrigin.mockReturnValue({ status: 403 });
    const response = await POST(request());
    expect(response.status).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.recordFingerprint).not.toHaveBeenCalled();
  });

  it('records the fingerprint and runs the pre-grant cluster check for the session user', async () => {
    mocks.checkCluster.mockResolvedValue({ detected: true, clusterSize: 3 });
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(true);
    expect(mocks.recordFingerprint).toHaveBeenCalledTimes(1);
    expect(mocks.recordFingerprint.mock.calls[0][0]).toBe('new-user-1');
    expect(mocks.checkCluster).toHaveBeenCalledTimes(1);
    expect(mocks.checkCluster).toHaveBeenCalledWith('new-user-1');
  });

  it('fails open without any recording when no session exists (pre-session FK limit)', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(false);
    expect(mocks.recordFingerprint).not.toHaveBeenCalled();
    expect(mocks.checkCluster).not.toHaveBeenCalled();
  });

  it('skips the Supabase round trip entirely when no auth cookie is present', async () => {
    const response = await POST(request(false));
    expect(response.status).toBe(200);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.recordFingerprint).not.toHaveBeenCalled();
  });

  it('never fails the completed signup flow on an unexpected server error', async () => {
    mocks.getUser.mockRejectedValue(new Error('auth down'));
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(false);
  });

  it('still records the fingerprint when only the cluster check throws (independent fail-open steps)', async () => {
    mocks.checkCluster.mockRejectedValue(new Error('boom'));
    const response = await POST(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.recorded).toBe(false);
    expect(mocks.recordFingerprint).toHaveBeenCalledTimes(1);
  });

  it('returns 429 when the fingerprint budget is exhausted', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(mocks.recordFingerprint).not.toHaveBeenCalled();
  });

  it('fails closed with 503 when the rate limiter is unavailable', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      unavailable: true,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await POST(request());
    expect(response.status).toBe(503);
  });

  it('does not leak the client identifier in the response body', async () => {
    const response = await POST(request());
    const raw = JSON.stringify(await response.json());
    expect(raw).not.toContain('203.0.113.9');
  });
});