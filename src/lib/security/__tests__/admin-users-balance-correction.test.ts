import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
  afterCallbacks: [] as Array<() => unknown>,
}));

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({
  after: (callback: () => unknown) => {
    mocks.afterCallbacks.push(callback);
  },
}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'admin-1', email: 'admin@casino.dev' } } }) },
  })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('@/lib/security/admin', () => ({
  isAdminEmail: vi.fn(() => true),
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: vi.fn(async () => ({ success: true, limit: 10, remaining: 9, reset: 0 })),
  getClientIdentifier: vi.fn(() => 'user:admin-1'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: vi.fn(() => null),
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { PATCH } from '@/app/api/admin/users/route';

const IDEMPOTENCY_KEY = '123e4567-e89b-42d3-a456-426614174000';

function patchRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/admin/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': IDEMPOTENCY_KEY,
      Origin: 'http://localhost',
    },
    body: JSON.stringify(body),
  });
}

const RPC_RESULT = {
  user: {
    id: 'user-42',
    username: 'player42',
    email: 'player42@casino.dev',
    balance: 1500,
    xp: 10,
    level: 2,
    rank: 'bronze',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  transactionId: 'tx-123',
  replayed: false,
};

describe('admin user update balance_correction signal (06_9 L1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.afterCallbacks.length = 0;
    mocks.rpc.mockResolvedValue({ data: RPC_RESULT, error: null });
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);
  });

  it('records a balance_correction risk event when the balance is changed', async () => {
    const response = await PATCH(patchRequest({ targetUserId: 'user-42', reason: 'Korrektur', balance: 1500 }));
    expect(response.status).toBe(200);

    expect(mocks.afterCallbacks).toHaveLength(1);
    await Promise.all(mocks.afterCallbacks.map((cb) => Promise.resolve(cb())));

    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledTimes(1);
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectUserId: 'user-42',
        signalType: 'balance_correction',
        severity: 'low',
      }),
    );
    const evidence = mocks.recordRiskEventBestEffort.mock.calls[0][0].evidence;
    expect(evidence).toEqual({ changedFields: ['balance'], transactionId: 'tx-123', replayed: false });
  });

  it('does not record a balance_correction event for non-balance updates', async () => {
    await PATCH(patchRequest({ targetUserId: 'user-42', reason: 'Rang-Fix', xp: 25 }));

    expect(mocks.afterCallbacks).toHaveLength(0);
    expect(mocks.recordRiskEventBestEffort).not.toHaveBeenCalled();
  });
});