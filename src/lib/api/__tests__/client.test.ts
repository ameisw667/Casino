import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiFetchError, apiFetch, apiClient } from '@/lib/api/client';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiFetch & apiClient Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('apiFetch core functionality', () => {
    it('unwraps the data envelope on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ data: { balance: 100 } }, 200)),
      );

      const result = await apiFetch<{ balance: number }>('/api/user/balance');
      expect(result).toEqual({ balance: 100 });
    });

    it('passes the request init through to fetch unchanged', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }, 200));
      vi.stubGlobal('fetch', fetchMock);

      await apiFetch('/api/casino/redeem-code', {
        method: 'POST',
        body: JSON.stringify({ code: 'JAN100' }),
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/casino/redeem-code',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ code: 'JAN100' }) }),
      );
    });

    it('throws a typed ApiFetchError for the structured error contract', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValue(
            jsonResponse(
              { error: { code: 'INSUFFICIENT_BALANCE', message: 'Guthaben reicht nicht aus.' } },
              400,
            ),
          ),
      );

      await expect(apiFetch('/api/casino/bet')).rejects.toMatchObject({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Guthaben reicht nicht aus.',
        status: 400,
      });
      await expect(apiFetch('/api/casino/bet')).rejects.toBeInstanceOf(ApiFetchError);
    });

    it('fails closed with NETWORK_ERROR when fetch itself rejects', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(apiFetch('/api/leaderboard')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
    });
  });

  describe('apiClient namespaced methods', () => {
    it('apiClient.health calls /api/health', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ data: { status: 'healthy', timestamp: '2026-08-29' } }, 200),
        );
      vi.stubGlobal('fetch', fetchMock);

      const res = await apiClient.health();
      expect(res.status).toBe('healthy');
      expect(fetchMock).toHaveBeenCalledWith('/api/health', undefined);
    });

    it('apiClient.casino.bet sends body and Idempotency-Key header', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse({ data: { id: 'round-1', win: true, payout: 200 } }, 200));
      vi.stubGlobal('fetch', fetchMock);

      const res = await apiClient.casino.bet({ amount: 100, gameType: 'DICE' }, 'test-idemp-123');
      expect(res).toEqual({ id: 'round-1', win: true, payout: 200 });
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/casino/bet',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Idempotency-Key': 'test-idemp-123' }),
        }),
      );
    });

    it('apiClient.user.balance calls /api/user/balance', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ data: { balance: 500, xp: 120, level: 2, rank: 'Bronze' } }, 200),
        );
      vi.stubGlobal('fetch', fetchMock);

      const wallet = await apiClient.user.balance();
      expect(wallet).toEqual({ balance: 500, xp: 120, level: 2, rank: 'Bronze' });
      expect(fetchMock).toHaveBeenCalledWith('/api/user/balance', undefined);
    });
  });
});
