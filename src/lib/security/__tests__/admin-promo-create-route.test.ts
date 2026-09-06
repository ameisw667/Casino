import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  insert: vi.fn(),
}));

function chainableInsert(result: { data: unknown; error: unknown }) {
  const chain = {
    insert: (values: unknown) => {
      mocks.insert(values);
      return chain;
    },
    select: () => chain,
    single: () => Promise.resolve(result),
  };
  return chain;
}

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => chainableInsert({ data: { code: 'TESTCODE1' }, error: null }),
  })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:admin-id'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn() },
}));

import { POST } from '@/app/api/admin/promo-codes/route';

function jsonRequest(body: unknown): Request {
  return new Request('https://casino.example/api/admin/promo-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/promo-codes (06_1 L4 entropy gate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@example.com' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
    });
  });

  it('rejects a new code shorter than 8 characters with 400', async () => {
    const res = await POST(jsonRequest({ code: 'SHORT7', amount: 10, maxUses: 1 }));
    expect(res.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('rejects an empty code with 400', async () => {
    const res = await POST(jsonRequest({ code: '', amount: 10, maxUses: 1 }));
    expect(res.status).toBe(400);
  });

  it('accepts an 8-character code and inserts it uppercased', async () => {
    const res = await POST(jsonRequest({ code: 'testcode1', amount: 10, maxUses: 1 }));
    expect(res.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ code: 'TESTCODE1' }));
  });
});
