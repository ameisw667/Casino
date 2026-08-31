import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}));

vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn() },
}));

import { POST } from '@/app/api/internal/wallet-events/route';

const originalEnvironment = { ...process.env };
const EVENT_ID = '123e4567-e89b-12d3-a456-426614174000';

function walletEventRequest(body: unknown, secret: string | undefined = 'wallet-secret') {
  return new Request('https://casino.test/api/internal/wallet-events', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret !== undefined ? { 'x-wallet-event-secret': secret } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.WALLET_EVENT_SECRET = 'wallet-secret';
});

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('POST /api/internal/wallet-events', () => {
  it('rejects a missing or mismatched secret header before touching the RPC', async () => {
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }, 'wrong'));
    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rejects when the server secret is not configured', async () => {
    delete process.env.WALLET_EVENT_SECRET;
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(401);
  });

  it('rejects an invalid payload before touching the RPC', async () => {
    const response = await POST(walletEventRequest({ eventId: 'not-a-uuid' }));
    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('applies a fresh event and acknowledges', async () => {
    mocks.rpc.mockResolvedValue({ data: { success: true, alreadyProcessed: false }, error: null });
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { ok: true } });
    expect(mocks.rpc).toHaveBeenCalledWith('apply_xp_gain', { p_event_id: EVENT_ID });
  });

  it('acknowledges an already-processed event without reapplying XP', async () => {
    mocks.rpc.mockResolvedValue({ data: { success: true, alreadyProcessed: true }, error: null });
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(200);
  });

  it('returns 500 when the RPC call itself errors, so the pg_cron backstop retries', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'connection lost' } });
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(500);
  });

  it('returns 500 when the RPC reports a logical failure', async () => {
    mocks.rpc.mockResolvedValue({ data: { success: false, error: 'unknown_event' }, error: null });
    const response = await POST(walletEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(500);
  });
});
