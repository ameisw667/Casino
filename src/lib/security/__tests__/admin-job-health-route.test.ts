import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  isAdminEmail: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: vi.fn(async () => ({ success: true, limit: 60, remaining: 59, reset: 0 })),
  getClientIdentifier: vi.fn(() => 'user:admin-id'),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), warn: vi.fn() },
}));

import { GET } from '@/app/api/admin/job-health/route';

function snapshotQueryResult(row: { generated_at: string } | null, error: unknown = null) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(async () => ({ data: row, error })),
      })),
    })),
  };
}

function deadLetterQueryResult(rows: Array<{ event_type: string }>, error: unknown = null) {
  return {
    select: vi.fn(() => ({
      is: vi.fn(() => ({
        gte: vi.fn(async () => ({ data: rows, error })),
      })),
    })),
  };
}

function mockTables(
  snapshot: { generated_at: string } | null,
  deadLetterRows: Array<{ event_type: string }> = [],
  errors: { snapshot?: unknown; deadLetters?: unknown } = {},
) {
  mocks.from.mockImplementation((table: string) => {
    if (table === 'admin_analytics_snapshots') {
      return snapshotQueryResult(snapshot, errors.snapshot ?? null);
    }
    if (table === 'wallet_events') {
      return deadLetterQueryResult(deadLetterRows, errors.deadLetters ?? null);
    }
    throw new Error(`Unexpected table ${table}`);
  });
}

function asAdmin() {
  mocks.getUser.mockResolvedValue({
    data: { user: { id: 'admin-id', email: 'operator@casino.test' } },
  });
  mocks.isAdminEmail.mockReturnValue(true);
}

describe('admin job-health route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTables(null);
  });

  it('returns 401 instead of job-health data when no authenticated session exists', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    });
  });

  it('returns 403 instead of job-health data for an authenticated non-admin', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'guest-id', email: 'guest@casino.test' } },
    });
    mocks.isAdminEmail.mockReturnValue(false);

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: { code: 'FORBIDDEN', message: 'Forbidden' },
    });
  });

  it('treats a missing snapshot as stale with zero dead-letters', async () => {
    asAdmin();
    mockTables(null, []);

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        snapshot: { generatedAt: null, ageHours: null, isStale: true },
        deadLetters: { xpGain: 0, bigWinNotify: 0 },
      },
    });
  });

  it('reports a snapshot generated 1 hour ago as not stale', async () => {
    asAdmin();
    const generatedAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    mockTables({ generated_at: generatedAt }, []);

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.snapshot.generatedAt).toBe(generatedAt);
    expect(body.data.snapshot.isStale).toBe(false);
    expect(body.data.snapshot.ageHours).toBeCloseTo(1, 1);
  });

  it('reports a snapshot generated 30 hours ago as stale', async () => {
    asAdmin();
    const generatedAt = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    mockTables({ generated_at: generatedAt }, []);

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.snapshot.isStale).toBe(true);
  });

  it('groups dead-letter wallet_events rows by event_type', async () => {
    asAdmin();
    mockTables(null, [
      { event_type: 'xp_gain' },
      { event_type: 'xp_gain' },
      { event_type: 'big_win_notify' },
    ]);

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.deadLetters).toEqual({ xpGain: 2, bigWinNotify: 1 });
  });

  it('returns 503 when the snapshot lookup fails', async () => {
    asAdmin();
    mockTables(null, [], { snapshot: new Error('db down') });

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: { code: 'JOB_HEALTH_UNAVAILABLE', message: 'Job health data unavailable' },
    });
  });

  it('returns 503 when the dead-letter lookup fails', async () => {
    asAdmin();
    mockTables(null, [], { deadLetters: new Error('db down') });

    const response = await GET(new Request('https://casino.test/api/admin/job-health'));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: { code: 'JOB_HEALTH_UNAVAILABLE', message: 'Job health data unavailable' },
    });
  });
});
