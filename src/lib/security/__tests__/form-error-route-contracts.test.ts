import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(() => 'user:test-user'),
  rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '10' })),
  redeemPromoCode: vi.fn(),
  recordRiskEventBestEffort: vi.fn(),
  loggerError: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/wallet', () => ({
  WalletService: { redeemPromoCode: mocks.redeemPromoCode },
}));
vi.mock('@/lib/casino/risk-event-store', () => ({
  recordRiskEventBestEffort: mocks.recordRiskEventBestEffort,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.loggerError, info: vi.fn() },
}));

import { PATCH as updateAdminUser } from '@/app/api/admin/users/route';
import { POST as createAdminPromo } from '@/app/api/admin/promo-codes/route';
import { POST as redeemCode } from '@/app/api/casino/redeem-code/route';
import { POST as bet } from '@/app/api/casino/bet/route';
import { POST as blackjack } from '@/app/api/casino/blackjack/route';

function authClient(user: { id: string; email?: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
}

function request(
  path: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request(`https://casino.test${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      origin: 'https://casino.test',
      'content-type': 'application/json',
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function errorBody(response: Response) {
  return response.json() as Promise<{ error: { code: string; message: string } }>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.createClient.mockResolvedValue(authClient({ id: 'test-user' }));
  mocks.enforceRateLimit.mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60_000,
  });
});

describe('selected Error Contract Core endpoints', () => {
  it('standardizes admin authentication and authorization failures', async () => {
    mocks.createClient.mockResolvedValue(authClient(null));
    const unauthenticated = await updateAdminUser(
      request(
        '/api/admin/users',
        { targetUserId: 'target', reason: 'test', balance: 1 },
        {
          'Idempotency-Key': '00000000-0000-4000-8000-000000000001',
        },
      ),
    );
    expect(unauthenticated.status).toBe(401);
    await expect(errorBody(unauthenticated)).resolves.toMatchObject({
      error: { code: 'AUTHENTICATION_REQUIRED' },
    });

    mocks.createClient.mockResolvedValue(authClient({ id: 'test-user', email: 'not-admin@test' }));
    const forbidden = await updateAdminUser(
      request(
        '/api/admin/users',
        { targetUserId: 'target', reason: 'test', balance: 1 },
        {
          'Idempotency-Key': '00000000-0000-4000-8000-000000000001',
        },
      ),
    );
    expect(forbidden.status).toBe(403);
    await expect(errorBody(forbidden)).resolves.toMatchObject({
      error: { code: 'PERMISSION_DENIED' },
    });

    mocks.createClient.mockResolvedValue(authClient(null));
    const promoResponse = await createAdminPromo(
      request('/api/admin/promo-codes', { code: 'WELCOME', amount: 10, maxUses: 1 }),
    );
    expect(promoResponse.status).toBe(401);
    await expect(errorBody(promoResponse)).resolves.toMatchObject({
      error: { code: 'AUTHENTICATION_REQUIRED' },
    });
  });

  it('standardizes promo domain errors without changing the status semantics', async () => {
    mocks.redeemPromoCode.mockResolvedValue({ ok: false, code: 'PROMO_NOT_FOUND' });
    const response = await redeemCode(
      request(
        '/api/casino/redeem-code',
        { code: 'WELCOME' },
        {
          'Idempotency-Key': '00000000-0000-4000-8000-000000000001',
        },
      ),
    );

    expect(response.status).toBe(400);
    await expect(errorBody(response)).resolves.toEqual({
      error: {
        code: 'PROMO_NOT_FOUND',
        message: 'Invalid or unknown promo code',
        requestId: '00000000-0000-4000-8000-000000000001',
      },
    });
  });

  it('redacts unknown internal errors from the redeem endpoint', async () => {
    mocks.redeemPromoCode.mockRejectedValue(new Error('SELECT secret_password FROM users'));
    const response = await redeemCode(
      request(
        '/api/casino/redeem-code',
        { code: 'WELCOME' },
        {
          'Idempotency-Key': '00000000-0000-4000-8000-000000000001',
        },
      ),
    );
    const body = await errorBody(response);

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).not.toContain('SELECT');
    expect(JSON.stringify(body)).not.toContain('secret_password');
  });

  it('standardizes wallet authentication failures for bet and blackjack', async () => {
    mocks.createClient.mockResolvedValue(authClient(null));
    const betResponse = await bet(request('/api/casino/bet', {}));
    const blackjackResponse = await blackjack(request('/api/casino/blackjack', {}));

    expect(betResponse.status).toBe(401);
    expect(blackjackResponse.status).toBe(401);
    await expect(errorBody(betResponse)).resolves.toMatchObject({
      error: { code: 'AUTHENTICATION_REQUIRED' },
    });
    await expect(errorBody(blackjackResponse)).resolves.toMatchObject({
      error: { code: 'AUTHENTICATION_REQUIRED' },
    });
  });
});
