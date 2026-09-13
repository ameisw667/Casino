import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  redeemPromoCode: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
  recordPromoGuessFailure: vi.fn(),
  checkWellbeingGuard: vi.fn(),
  wellbeingApiError: vi.fn(),
  recordBetNetworkFingerprintBestEffort: vi.fn(),
  checkKnownClusterBeforeGrant: vi.fn(),
  loggerInfo: vi.fn(),
  afterCallbacks: [] as Array<() => unknown>,
}));

// The route defers the 06_3 fingerprint recording via after() — collect the callbacks so
// the tests can invoke them like the Next.js request lifecycle would.
vi.mock('next/server', () => ({
  after: (callback: () => unknown) => {
    mocks.afterCallbacks.push(callback);
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/casino/wallet', () => ({
  WalletService: { redeemPromoCode: mocks.redeemPromoCode },
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('@/lib/security/promo-guess-guard', () => ({
  recordPromoGuessFailure: mocks.recordPromoGuessFailure,
}));
vi.mock('@/lib/casino/responsible-gambling', () => ({
  checkWellbeingGuard: mocks.checkWellbeingGuard,
  wellbeingApiError: mocks.wellbeingApiError,
}));
// 06_3 L0/L1: fingerprint + pre-grant cluster check — mocked so the route contract tests
// stay independent of the underlying RPC behavior.
vi.mock('@/lib/casino/network-fingerprint', () => ({
  recordBetNetworkFingerprintBestEffort: mocks.recordBetNetworkFingerprintBestEffort,
}));
vi.mock('@/lib/casino/fraud-detection', () => ({
  checkKnownClusterBeforeGrant: mocks.checkKnownClusterBeforeGrant,
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn(() => 'user:u1'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: mocks.loggerInfo, warn: vi.fn() },
}));

import { POST } from '@/app/api/casino/redeem-code/route';

function jsonRequest(code: string, idempotencyKey = '11111111-1111-4111-8111-111111111111'): Request {
  return new Request('https://casino.example/api/casino/redeem-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ code }),
  });
}

const OK_OUTCOME = {
  ok: true as const,
  amount: 100,
  snapshot: {
    balance: 1100,
    xp: 0,
    level: 1,
    rank: 'BRONZE',
    transactionId: '22222222-2222-4222-8222-222222222222',
  },
};

describe('POST /api/casino/redeem-code (06_10 L4 redemption rejections)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.afterCallbacks.length = 0;
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mocks.enforceRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60_000,
    });
    mocks.checkWellbeingGuard.mockResolvedValue({ allowed: true });
    mocks.wellbeingApiError.mockReturnValue(null);
    mocks.recordRiskEventBestEffort.mockResolvedValue(true);
    mocks.recordPromoGuessFailure.mockResolvedValue(undefined);
    mocks.recordBetNetworkFingerprintBestEffort.mockResolvedValue(undefined);
    mocks.checkKnownClusterBeforeGrant.mockResolvedValue({ detected: false, clusterSize: null });
  });

  it('runs the 06_3 L1 pre-grant cluster check before the promo grant', async () => {
    mocks.redeemPromoCode.mockResolvedValue(OK_OUTCOME);
    await POST(jsonRequest('SUMMER2024'));
    expect(mocks.checkKnownClusterBeforeGrant).toHaveBeenCalledTimes(1);
    expect(mocks.checkKnownClusterBeforeGrant).toHaveBeenCalledWith('u1');
    // Fingerprint recording is wired before the grant path (after()-deferred, never blocking).
    expect(mocks.afterCallbacks).toHaveLength(1);
    await mocks.afterCallbacks[0]();
    expect(mocks.recordBetNetworkFingerprintBestEffort).toHaveBeenCalledTimes(1);
  });

  it('rejects an exhausted code with 400 and feeds the guess counter', async () => {
    mocks.redeemPromoCode.mockResolvedValue({ ok: false, code: 'PROMO_EXHAUSTED' });

    const res = await POST(jsonRequest('SUMMER2024'));

    expect(res.status).toBe(400);
    expect(mocks.recordPromoGuessFailure).toHaveBeenCalledWith('u1', 'SUMMER2024');
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({ signalType: 'voucher_velocity', severity: 'low' }),
    );
  });

  it('rejects an expired code with 400 — the reactive RPC expiry check stays intact alongside the L1 cron job', async () => {
    mocks.redeemPromoCode.mockResolvedValue({ ok: false, code: 'PROMO_EXPIRED' });

    const res = await POST(jsonRequest('OLDPROMO1'));

    expect(res.status).toBe(400);
    expect(mocks.recordPromoGuessFailure).toHaveBeenCalledWith('u1', 'OLDPROMO1');
  });

  it('rejects an already-redeemed code with 400', async () => {
    mocks.redeemPromoCode.mockResolvedValue({ ok: false, code: 'PROMO_ALREADY_REDEEMED' });

    const res = await POST(jsonRequest('VIPPRO'));

    expect(res.status).toBe(400);
    expect(mocks.recordRiskEventBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({ signalType: 'voucher_velocity' }),
    );
  });

  it('serializes a concurrent redemption race: first request wins, the parallel retry on the same code is rejected', async () => {
    mocks.redeemPromoCode
      .mockResolvedValueOnce(OK_OUTCOME)
      .mockResolvedValueOnce({ ok: false, code: 'PROMO_ALREADY_REDEEMED' });

    const [first, second] = await Promise.all([
      POST(jsonRequest('RACECODE1')),
      POST(jsonRequest('RACECODE1', '33333333-3333-4333-8333-333333333333')),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 400]);
    expect(mocks.redeemPromoCode).toHaveBeenCalledTimes(2);
  });

  it('logs a successful redemption with the code masked to its last 4 characters (06_10 L3)', async () => {
    mocks.redeemPromoCode.mockResolvedValue(OK_OUTCOME);

    const res = await POST(jsonRequest('SUMMER2024'));

    expect(res.status).toBe(200);
    expect(mocks.loggerInfo).toHaveBeenCalledWith(
      'API/RedeemCode',
      expect.stringContaining('****2024'),
      expect.objectContaining({ userId: 'u1' }),
    );
    expect(mocks.loggerInfo).toHaveBeenCalledWith(
      'API/RedeemCode',
      expect.not.stringContaining('SUMMER2024'),
      expect.anything(),
    );
  });
});