import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  trigger: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}));

vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn() },
}));

vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: mocks.trigger },
}));

import { POST } from '@/app/api/internal/big-win-events/route';

const originalEnvironment = { ...process.env };
const EVENT_ID = '123e4567-e89b-12d3-a456-426614174000';

function bigWinEventRequest(body: unknown, secret: string | undefined = 'big-win-secret') {
  return new Request('https://casino.test/api/internal/big-win-events', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret !== undefined ? { 'x-big-win-event-secret': secret } : {}),
    },
    body: JSON.stringify(body),
  });
}

const claimSuccess = {
  success: true,
  alreadyProcessed: false,
  userId: 'user-1',
  payload: { game: 'DICE', payout: 1000, multiplier: 25 },
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.BIG_WIN_EVENT_SECRET = 'big-win-secret';
});

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('POST /api/internal/big-win-events', () => {
  it('rejects a missing or mismatched secret header before touching the RPC — isolated from WALLET_EVENT_SECRET (4.1)', async () => {
    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }, 'wrong'));
    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rejects when the server secret is not configured', async () => {
    delete process.env.BIG_WIN_EVENT_SECRET;
    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(401);
  });

  it('rejects an invalid payload before touching the RPC', async () => {
    const response = await POST(bigWinEventRequest({ eventId: 'not-a-uuid' }));
    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('claims, dispatches to Trigger.dev, and acknowledges on success', async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: claimSuccess, error: null })
      .mockResolvedValueOnce({ data: { success: true }, error: null });
    mocks.trigger.mockResolvedValueOnce({ id: 'run_1' });

    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));

    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, 'claim_big_win_notify_event', {
      p_event_id: EVENT_ID,
    });
    expect(mocks.trigger).toHaveBeenCalledWith('big-win-notify', {
      userId: 'user-1',
      game: 'DICE',
      payout: 1000,
      multiplier: 25,
      win: true,
      replayed: false,
    });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, 'ack_big_win_notify_event', {
      p_event_id: EVENT_ID,
    });
  });

  it('acknowledges an already-processed event without re-dispatching', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: { success: true, alreadyProcessed: true },
      error: null,
    });
    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(200);
    expect(mocks.trigger).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('does not ack when the Trigger.dev dispatch fails, so the pg_cron backstop retries', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: claimSuccess, error: null });
    mocks.trigger.mockRejectedValueOnce(new Error('Trigger.dev unavailable'));

    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));

    expect(response.status).toBe(500);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalledWith('ack_big_win_notify_event', expect.anything());
  });

  it('returns 500 when the claim RPC call itself errors', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: 'connection lost' } });
    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(500);
    expect(mocks.trigger).not.toHaveBeenCalled();
  });

  it('returns 500 when the claim RPC reports a logical failure', async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: { success: false, error: 'unknown_event' },
      error: null,
    });
    const response = await POST(bigWinEventRequest({ eventId: EVENT_ID }));
    expect(response.status).toBe(500);
  });
});
