import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  isAdminEmail: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from, rpc: mocks.rpc })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: vi.fn(async () => ({ success: true, limit: 30, remaining: 29, reset: 0 })),
  getClientIdentifier: vi.fn(() => 'user:admin-id'),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { GET } from '@/app/api/admin/analytics/route';

function tableResult(data: unknown) {
  return { select: vi.fn(async () => ({ data, error: null })) };
}

function snapshotResult(data: unknown, error: unknown = null) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(async () => ({ data, error })),
      })),
    })),
  };
}

describe('admin analytics route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({
      data: {
        status: 'ready',
        asOf: '2026-08-12T12:00:00.000Z',
        last24h: {
          requests: 0,
          uniqueActors: 0,
          successRate: null,
          errorRate: null,
          outcomes: {
            success: 0,
            configuration: 0,
            quota: 0,
            upstream: 0,
            invalid_response: 0,
            rate_limited: 0,
          },
          averageLatencyMs: null,
          p95LatencyMs: null,
          tokens: { input: null, cachedInput: null, output: null, reasoning: null, total: null },
          estimatedCostMicrousd: null,
        },
        last7d: {
          requests: 0,
          uniqueActors: 0,
          successRate: null,
          errorRate: null,
          outcomes: {
            success: 0,
            configuration: 0,
            quota: 0,
            upstream: 0,
            invalid_response: 0,
            rate_limited: 0,
          },
          averageLatencyMs: null,
          p95LatencyMs: null,
          tokens: { input: null, cachedInput: null, output: null, reasoning: null, total: null },
          estimatedCostMicrousd: null,
        },
        pricingVersions: [],
      },
      error: null,
    });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return tableResult([{ id: 'player', created_at: '2026-07-01T00:00:00.000Z', xp: 0 }]);
      }
      if (table === 'wallet_transactions') return tableResult([]);
      if (table === 'game_rounds') return tableResult([]);
      if (table === 'vip_tiers') return tableResult([{ name: 'BRONZE', min_xp: 0 }]);
      if (table === 'admin_analytics_snapshots') return snapshotResult(null);
      throw new Error(`Unexpected table ${table}`);
    });
  });

  it('returns 401 instead of analytics data when no authenticated session exists', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    });
  });

  it('returns 403 instead of analytics data for an authenticated non-admin', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'guest-id', email: 'guest@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(false);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: { code: 'FORBIDDEN', message: 'Forbidden' },
    });
  });

  it('returns a private live analytics contract for an allowlisted admin', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toMatchObject({
      data: {
        cohorts: { registration: [{ users: 1 }], firstWager: [] },
        summary: { registeredUsers: 1, wager: 0, ggr: 0 },
        deposits: { available: false },
        guide: { status: 'ready', last24h: { requests: 0 } },
      },
    });
  });

  it('keeps existing BI available when the optional guide RPC is unavailable', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockResolvedValue({ data: null, error: new Error('relation does not exist') });

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { guide: { status: 'unavailable' } },
    });
  });

  it('accepts Supabase UTC-offset timestamps instead of returning 503', async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return tableResult([
          { id: 'player', created_at: '2026-08-08T18:03:01.938107+00:00', xp: 0 },
        ]);
      }
      if (table === 'wallet_transactions' || table === 'game_rounds') return tableResult([]);
      if (table === 'vip_tiers')
        return tableResult([{ name: 'BRONZE', min_xp: 0, is_active: true }]);
      if (table === 'admin_analytics_snapshots') return snapshotResult(null);
      throw new Error(`Unexpected table ${table}`);
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { summary: { registeredUsers: 1 } },
    });
  });

  it('ignores historical non-analytics payloads instead of returning 503', async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return tableResult([
          { id: 'player', created_at: '2026-08-08T18:03:01.938107+00:00', xp: 0 },
        ]);
      }
      if (table === 'wallet_transactions') {
        return tableResult([
          {
            user_id: 'player',
            type: 'round_started',
            created_at: '2026-08-08T19:00:00+00:00',
            metadata: {},
          },
          {
            user_id: 'player',
            type: 'bet_settled',
            created_at: '2026-08-08T20:00:00+00:00',
            metadata: { response: { result: { amount: 25, payout: 0 } } },
          },
        ]);
      }
      if (table === 'game_rounds') {
        return tableResult([
          {
            user_id: 'player',
            status: 'ACTIVE',
            bet_amount: 10,
            updated_at: '2026-08-08T19:00:00+00:00',
            state: null,
          },
          {
            user_id: 'player',
            status: 'SETTLED',
            bet_amount: 10,
            updated_at: '2026-08-08T20:00:00+00:00',
            state: { result: 'legacy' },
          },
        ]);
      }
      if (table === 'vip_tiers')
        return tableResult([{ name: 'BRONZE', min_xp: 0, is_active: true }]);
      if (table === 'admin_analytics_snapshots') return snapshotResult(null);
      throw new Error(`Unexpected table ${table}`);
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { summary: { wager: 25, payout: 0 } },
    });
  });

  it('returns the stored snapshot directly without querying live tables when a valid snapshot exists', async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === 'admin_analytics_snapshots') {
        return snapshotResult({
          generated_at: '2026-08-20T06:00:00.000Z',
          payload: {
            generatedAt: '2026-08-20T06:00:00.000Z',
            cohorts: { registration: [], firstWager: [] },
            summary: {
              registeredUsers: 42,
              activatedUsers: 10,
              activeUsers7d: 5,
              churnRiskUsers: 0,
              wager: 1000,
              payout: 900,
              ggr: 100,
            },
            funnel: [],
            vipDistribution: [],
            deposits: { available: false, count: 0, amount: 0 },
            operational: {
              activeUsers24h: 3,
              settledBets24h: 7,
              wager24h: 200,
              ggr24h: 20,
              signals: [],
            },
          },
        });
      }
      throw new Error(`Unexpected table ${table} — snapshot fast-path must not query live tables`);
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        summary: { registeredUsers: 42, wager: 1000, ggr: 100 },
        guide: { status: 'ready', last24h: { requests: 0 } },
      },
    });
  });

  it('falls back to live aggregation when the stored snapshot payload fails schema validation', async () => {
    mocks.from.mockImplementation((table: string) => {
      if (table === 'admin_analytics_snapshots') {
        return snapshotResult({
          generated_at: '2026-08-20T06:00:00.000Z',
          payload: { malformed: true },
        });
      }
      if (table === 'users') {
        return tableResult([{ id: 'player', created_at: '2026-07-01T00:00:00.000Z', xp: 0 }]);
      }
      if (table === 'wallet_transactions') return tableResult([]);
      if (table === 'game_rounds') return tableResult([]);
      if (table === 'vip_tiers') return tableResult([{ name: 'BRONZE', min_xp: 0 }]);
      throw new Error(`Unexpected table ${table}`);
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(true);

    const response = await GET(new Request('https://casino.test/api/admin/analytics'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { summary: { registeredUsers: 1 } },
    });
  });
});
