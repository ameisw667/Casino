import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiFetchError, apiFetch } from '@/lib/api/client';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
      vi.fn().mockResolvedValue(
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

  it('throws a typed ApiFetchError for the legacy plain-string error shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'Wallet unavailable' }, 503)),
    );

    await expect(apiFetch('/api/user/balance')).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'Wallet unavailable',
      status: 503,
    });
  });

  it('fails closed with NETWORK_ERROR when fetch itself rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiFetch('/api/leaderboard')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  it('fails closed with INVALID_RESPONSE on unparsable JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('not json', { status: 200, headers: { 'content-type': 'application/json' } }),
      ),
    );

    await expect(apiFetch('/api/leaderboard')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });
});
