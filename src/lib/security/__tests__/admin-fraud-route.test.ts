import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  runFraudSignalScan: vi.fn(),
  listResult: { data: [] as unknown[], error: null as unknown },
}));

function chainableList() {
  const chain = {
    select: () => chain,
    order: () => chain,
    limit: () => chain,
    eq: () => chain,
    then: (resolve: (value: unknown) => void) => resolve(mocks.listResult),
  };
  return chain;
}

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: () => chainableList(), rpc: mocks.rpc })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: vi.fn(async () => ({ success: true, limit: 30, remaining: 29, reset: 0 })),
  getClientIdentifier: vi.fn(() => 'user:admin-id'),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/lib/casino/fraud-detection', () => ({
  runFraudSignalScan: mocks.runFraudSignalScan,
}));

import { GET, PATCH } from '@/app/api/admin/fraud/route';
import { POST as scanPOST } from '@/app/api/admin/fraud/scan/route';

function jsonRequest(body: unknown, method = 'PATCH'): Request {
  return new Request('https://casino.example/api/admin/fraud', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/admin/fraud', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.listResult = { data: [{ id: 'evt_1' }], error: null };
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(new Request('https://casino.example/api/admin/fraud'));
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'nobody@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await GET(new Request('https://casino.example/api/admin/fraud'));
    expect(res.status).toBe(403);
  });

  it('returns 200 with events for an admin', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    const res = await GET(new Request('https://casino.example/api/admin/fraud?status=open'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { events: unknown[] };
    expect(json.events).toEqual([{ id: 'evt_1' }]);
  });
});

describe('PATCH /api/admin/fraud', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
  });

  it('rejects a cross-origin request before checking auth', async () => {
    mocks.validateMutationOrigin.mockReturnValue(
      new Response('Cross-site mutation rejected', { status: 403 }),
    );
    const res = await PATCH(
      jsonRequest({ eventId: crypto.randomUUID(), status: 'closed', reason: 'x' }),
    );
    expect(res.status).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await PATCH(
      jsonRequest({ eventId: crypto.randomUUID(), status: 'closed', reason: 'x' }),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'nobody@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await PATCH(
      jsonRequest({ eventId: crypto.randomUUID(), status: 'closed', reason: 'x' }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 for an invalid payload', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    const res = await PATCH(jsonRequest({ eventId: 'not-a-uuid', status: 'closed', reason: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 and the updated event on success', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockResolvedValue({ data: { id: 'evt_1', status: 'closed' }, error: null });
    const res = await PATCH(
      jsonRequest({
        eventId: crypto.randomUUID(),
        status: 'closed',
        reason: 'confirmed legitimate',
      }),
    );
    expect(res.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith(
      'review_risk_event',
      expect.objectContaining({ p_status: 'closed', p_reviewer_id: 'u1' }),
    );
  });

  it('maps a "not found" RPC error to 404', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'Risk event not found' } });
    const res = await PATCH(
      jsonRequest({ eventId: crypto.randomUUID(), status: 'closed', reason: 'x' }),
    );
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/fraud/scan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
  });

  it('rejects a cross-origin request before checking auth', async () => {
    mocks.validateMutationOrigin.mockReturnValue(
      new Response('Cross-site mutation rejected', { status: 403 }),
    );
    const res = await scanPOST(jsonRequest({}, 'POST'));
    expect(res.status).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it('returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await scanPOST(jsonRequest({}, 'POST'));
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'nobody@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await scanPOST(jsonRequest({}, 'POST'));
    expect(res.status).toBe(403);
  });

  it('returns 409 when a scan is already running', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    const res = await scanPOST(jsonRequest({}, 'POST'));
    expect(res.status).toBe(409);
    expect(mocks.runFraudSignalScan).not.toHaveBeenCalled();
  });

  it('acquires the lock, runs the scan, and releases the lock', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockImplementation(async (fn: string) => {
      if (fn === 'try_acquire_fraud_scan_lock') return { data: true, error: null };
      if (fn === 'release_fraud_scan_lock') return { data: null, error: null };
      return { data: null, error: null };
    });
    mocks.runFraudSignalScan.mockResolvedValue({
      createdOrUpdated: 3,
      partialFailures: 0,
      bySignalType: { bet_velocity: 3 },
    });

    const res = await scanPOST(jsonRequest({}, 'POST'));

    expect(res.status).toBe(200);
    const json = (await res.json()) as { createdOrUpdated: number };
    expect(json.createdOrUpdated).toBe(3);
    expect(mocks.rpc).toHaveBeenCalledWith('release_fraud_scan_lock');
  });

  it('releases the lock even when the scan throws', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.rpc.mockImplementation(async (fn: string) => {
      if (fn === 'try_acquire_fraud_scan_lock') return { data: true, error: null };
      return { data: null, error: null };
    });
    mocks.runFraudSignalScan.mockRejectedValue(new Error('scan boom'));

    const res = await scanPOST(jsonRequest({}, 'POST'));

    expect(res.status).toBe(503);
    expect(mocks.rpc).toHaveBeenCalledWith('release_fraud_scan_lock');
  });
});
