import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  reversePromoCode: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
  afterCallbacks: [] as Array<() => Promise<void> | void>,
}));

vi.mock('next/server', () => ({
  after: vi.fn((callback: () => Promise<void> | void) => {
    mocks.afterCallbacks.push(callback);
  }),
}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/casino/wallet', () => ({
  WalletService: { reversePromoCode: mocks.reversePromoCode },
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:admin-id'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from '@/app/api/admin/promo-codes/[code]/reverse/route';

const OK_OUTCOME = {
  ok: true as const,
  amount: 500,
  shortfall: 0,
  replayed: false,
  snapshot: {
    balance: 600,
    xp: 0,
    level: 1,
    rank: 'BRONZE',
    transactionId: '44444444-4444-4444-8444-444444444444',
    result: undefined,
    replayed: false,
  },
};

function jsonRequest(
  code: string,
  body: unknown,
  idempotencyKey = '55555555-5555-4555-8555-555555555555',
): Request {
  return new Request(`https://casino.example/api/admin/promo-codes/${code}/reverse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/promo-codes/[code]/reverse (06_10 L0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.afterCallbacks.length = 0;
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'admin@example.com' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60_000,
    });
    mocks.reversePromoCode.mockResolvedValue(OK_OUTCOME);
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);
  });

  it('rejects a non-admin with 403 without touching the wallet', async () => {
    mocks.isAdminEmail.mockReturnValue(false);

    const res = await POST(
      jsonRequest('VIPPRO', { userId: 'u1', reason: 'Fraud' }),
      { params: Promise.resolve({ code: 'VIPPRO' }) },
    );

    expect(res.status).toBe(403);
    expect(mocks.reversePromoCode).not.toHaveBeenCalled();
  });

  it('rejects a missing Idempotency-Key with 400', async () => {
    const res = await POST(jsonRequest('VIPPRO', { userId: 'u1', reason: 'Fraud' }, 'not-a-uuid'), {
      params: Promise.resolve({ code: 'VIPPRO' }),
    });

    expect(res.status).toBe(400);
    expect(mocks.reversePromoCode).not.toHaveBeenCalled();
  });

  it('reverses the redemption and emits a medium-severity balance_correction risk event with masked code', async () => {
    const res = await POST(
      jsonRequest('VIPPRO', { userId: 'u1', reason: 'Multi-Account-Cluster bestätigt' }),
      { params: Promise.resolve({ code: 'VIPPRO' }) },
    );

    expect(res.status).toBe(200);
    expect(mocks.reversePromoCode).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-id',
        userId: 'u1',
        code: 'VIPPRO',
        requestId: '55555555-5555-4555-8555-555555555555',
        reason: 'Multi-Account-Cluster bestätigt',
      }),
    );

    expect(mocks.afterCallbacks).toHaveLength(1);
    await mocks.afterCallbacks[0]();
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectUserId: 'u1',
        signalType: 'balance_correction',
        severity: 'medium',
        evidence: expect.objectContaining({
          scope: 'promo-reversal',
          code: '****PPRO',
          amount: 500,
          shortfall: 0,
        }),
      }),
    );
  });

  it('maps REVERSAL_NOT_FOUND to 404 and skips the risk event', async () => {
    mocks.reversePromoCode.mockResolvedValue({ ok: false, code: 'REVERSAL_NOT_FOUND' });

    const res = await POST(jsonRequest('VIPPRO', { userId: 'u1', reason: 'Fraud' }), {
      params: Promise.resolve({ code: 'VIPPRO' }),
    });

    expect(res.status).toBe(404);
    expect(mocks.afterCallbacks).toHaveLength(0);
  });

  it('maps REVERSAL_ALREADY_DONE to 409', async () => {
    mocks.reversePromoCode.mockResolvedValue({ ok: false, code: 'REVERSAL_ALREADY_DONE' });

    const res = await POST(jsonRequest('VIPPRO', { userId: 'u1', reason: 'Fraud' }), {
      params: Promise.resolve({ code: 'VIPPRO' }),
    });

    expect(res.status).toBe(409);
  });

  it('rejects an empty reason with 400', async () => {
    const res = await POST(jsonRequest('VIPPRO', { userId: 'u1', reason: '  ' }), {
      params: Promise.resolve({ code: 'VIPPRO' }),
    });

    expect(res.status).toBe(400);
    expect(mocks.reversePromoCode).not.toHaveBeenCalled();
  });
});