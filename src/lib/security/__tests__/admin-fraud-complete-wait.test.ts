import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  completeToken: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: vi.fn(async () => ({ success: true })),
  getClientIdentifier: vi.fn(() => 'user:admin-1'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@trigger.dev/sdk', () => ({
  wait: { completeToken: mocks.completeToken },
  logger: { log: vi.fn(), error: vi.fn() },
}));

import { POST } from '@/app/api/admin/fraud/complete-wait/route';

function createPostRequest(body: unknown): Request {
  return new Request('https://casino.example/api/admin/fraud/complete-wait', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/fraud/complete-wait', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('No user') });
    const res = await POST(
      createPostRequest({ tokenId: 'tok_1', status: 'reviewed', reason: 'ok' }),
    );
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@example.com' } },
      error: null,
    });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await POST(
      createPostRequest({ tokenId: 'tok_1', status: 'reviewed', reason: 'ok' }),
    );
    expect(res.status).toBe(403);
  });

  it('completes waitpoint token on authorized admin request', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin_1', email: 'admin@example.com' } },
      error: null,
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.completeToken.mockResolvedValue(undefined);

    const res = await POST(
      createPostRequest({
        tokenId: 'token_wait_123',
        status: 'reviewed',
        reason: 'Manual inspection cleared player',
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.success).toBe(true);
    expect(mocks.completeToken).toHaveBeenCalledWith('token_wait_123', {
      status: 'reviewed',
      reason: 'Manual inspection cleared player',
      reviewerId: 'admin_1',
    });
  });
});
