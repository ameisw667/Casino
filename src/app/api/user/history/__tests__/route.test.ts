import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  enforceRateLimit: vi.fn(),
  rpc: vi.fn(),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mocks.rpc })),
}));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn((_req: Request, userId?: string) => `user:${userId}`),
  rateLimitHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.casinoLoggerError },
}));

import { GET } from '../route';

const USER_ID = '11111111-1111-4111-8111-111111111111';

function makeRow(index: number) {
  return {
    id: `22222222-2222-4222-8222-${String(index).padStart(12, '0')}`,
    game: 'dice',
    type: 'bet_settled',
    amount: -1.5,
    balance_after: 100,
    created_at: `2026-09-04T10:00:${String(index % 60).padStart(2, '0')}.000Z`,
  };
}

function encodeCursorPayload(createdAt: string, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt, id })).toString('base64url');
}

function request(query = '') {
  return new Request(`https://casino.example/api/user/history${query}`);
}

describe('GET /api/user/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER_ID, email: 'user@example.com' } },
    });
    mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 20, remaining: 19, reset: 0 });
    mocks.rpc.mockResolvedValue({ data: [], error: null });
  });

  it('calls the RPC without a cursor and returns up to 100 rows when no query params are given', async () => {
    const rows = Array.from({ length: 100 }, (_, i) => makeRow(i));
    mocks.rpc.mockResolvedValue({ data: rows, error: null });

    const res = await GET(request());

    expect(res.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('get_user_history_page', {
      p_user_id: USER_ID,
      p_cursor_created_at: null,
      p_cursor_id: null,
      p_limit: 101,
    });
    const json = (await res.json()) as {
      data: { rows: unknown[]; hasMore: boolean; nextCursor: string | null };
    };
    expect(json.data.rows).toHaveLength(100);
    expect(json.data.hasMore).toBe(false);
    expect(json.data.nextCursor).toBeNull();
  });

  it('passes the decoded cursor values to the RPC when a valid cursor is given', async () => {
    const cursor = encodeCursorPayload(
      '2026-09-04T10:00:00.000Z',
      '22222222-2222-4222-8222-000000000000',
    );

    const res = await GET(request(`?cursor=${cursor}`));

    expect(res.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('get_user_history_page', {
      p_user_id: USER_ID,
      p_cursor_created_at: '2026-09-04T10:00:00.000Z',
      p_cursor_id: '22222222-2222-4222-8222-000000000000',
      p_limit: 21,
    });
  });

  it('returns 400 INVALID_CURSOR and never calls the RPC for a garbage cursor', async () => {
    const res = await GET(request('?cursor=garbage'));

    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('INVALID_CURSOR');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('accepts a cursor whose createdAt uses the PostgREST +00:00 timestamp format', async () => {
    const cursor = encodeCursorPayload(
      '2026-09-04T10:00:00.123456+00:00',
      '22222222-2222-4222-8222-000000000000',
    );

    const res = await GET(request(`?cursor=${cursor}`));

    expect(res.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('get_user_history_page', {
      p_user_id: USER_ID,
      p_cursor_created_at: '2026-09-04T10:00:00.123456+00:00',
      p_cursor_id: '22222222-2222-4222-8222-000000000000',
      p_limit: 21,
    });
  });

  it('returns hasMore=true with exactly limit rows when the RPC returns limit+1 rows', async () => {
    const rows = Array.from({ length: 6 }, (_, i) => makeRow(i));
    mocks.rpc.mockResolvedValue({ data: rows, error: null });

    const res = await GET(request('?limit=5'));

    expect(mocks.rpc).toHaveBeenCalledWith(
      'get_user_history_page',
      expect.objectContaining({ p_limit: 6 }),
    );
    const json = (await res.json()) as {
      data: { rows: unknown[]; hasMore: boolean; nextCursor: string | null };
    };
    expect(json.data.rows).toHaveLength(5);
    expect(json.data.hasMore).toBe(true);
    expect(json.data.nextCursor).not.toBeNull();

    const decoded = JSON.parse(
      Buffer.from(json.data.nextCursor as string, 'base64url').toString('utf8'),
    ) as { createdAt: string; id: string };
    expect(decoded).toEqual({ createdAt: rows[4].created_at, id: rows[4].id });
  });

  it('returns hasMore=false and nextCursor=null for an empty result', async () => {
    const res = await GET(request());

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: { rows: unknown[]; hasMore: boolean; nextCursor: string | null };
    };
    expect(json.data.rows).toEqual([]);
    expect(json.data.hasMore).toBe(false);
    expect(json.data.nextCursor).toBeNull();
  });

  it('returns 400 for an invalid limit parameter', async () => {
    const res = await GET(request('?limit=101'));

    expect(res.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('returns 503 without leaking the error when the RPC fails', async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: 'function get_user_history_page does not exist' },
    });

    const res = await GET(request());

    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toContain('does not exist');
  });
});
