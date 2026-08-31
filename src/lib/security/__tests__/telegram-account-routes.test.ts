import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(() => 'user:player-1'),
  rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '5' })),
  issueTelegramLinkToken: vi.fn(),
  isTelegramConfigured: vi.fn(() => true),
  getTelegramLinkStatus: vi.fn(),
  unlinkTelegram: vi.fn(),
  setTelegramNotificationsEnabled: vi.fn(),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/telegram-link', () => ({
  issueTelegramLinkToken: mocks.issueTelegramLinkToken,
  isTelegramConfigured: mocks.isTelegramConfigured,
  getTelegramLinkStatus: mocks.getTelegramLinkStatus,
  unlinkTelegram: mocks.unlinkTelegram,
  setTelegramNotificationsEnabled: mocks.setTelegramNotificationsEnabled,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.casinoLoggerError } }));

import { POST as link } from '@/app/api/telegram/link/route';
import { GET as status } from '@/app/api/telegram/status/route';
import { POST as unlink } from '@/app/api/telegram/unlink/route';
import { POST as toggle } from '@/app/api/telegram/toggle/route';

function authClient(user: { id: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
}

function request(path: string, body?: Record<string, unknown>) {
  return new Request(`https://casino.test${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { origin: 'https://casino.test', 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.createClient.mockResolvedValue(authClient({ id: 'player-1' }));
  mocks.enforceRateLimit.mockResolvedValue({
    success: true,
    limit: 5,
    remaining: 4,
    reset: Date.now() + 60_000,
  });
  mocks.isTelegramConfigured.mockReturnValue(true);
});

describe('POST /api/telegram/link', () => {
  it('rejects an invalid origin before authentication', async () => {
    mocks.validateMutationOrigin.mockReturnValue(new Response('rejected', { status: 403 }));
    const response = await link(request('/api/telegram/link', {}));
    expect(response.status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests', async () => {
    mocks.createClient.mockResolvedValue(authClient(null));
    const response = await link(request('/api/telegram/link', {}));
    expect(response.status).toBe(401);
  });

  it('returns 503 when telegram is not configured', async () => {
    mocks.isTelegramConfigured.mockReturnValue(false);
    const response = await link(request('/api/telegram/link', {}));
    expect(response.status).toBe(503);
    expect(mocks.issueTelegramLinkToken).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    mocks.enforceRateLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const response = await link(request('/api/telegram/link', {}));
    expect(response.status).toBe(429);
  });

  it('returns the issued token and deep link on success', async () => {
    mocks.issueTelegramLinkToken.mockResolvedValue({
      token: 'abc',
      deepLink: 'https://t.me/CasinoRoyaleBot?start=abc',
      expiresAt: '2026-01-01T00:10:00.000Z',
    });
    const response = await link(request('/api/telegram/link', {}));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        token: 'abc',
        deepLink: 'https://t.me/CasinoRoyaleBot?start=abc',
        expiresAt: '2026-01-01T00:10:00.000Z',
      },
    });
  });
});

describe('GET /api/telegram/status', () => {
  it('rejects unauthenticated requests', async () => {
    mocks.createClient.mockResolvedValue(authClient(null));
    const response = await status(request('/api/telegram/status'));
    expect(response.status).toBe(401);
  });

  it('returns the current link status', async () => {
    mocks.getTelegramLinkStatus.mockResolvedValue({
      configured: true,
      linked: true,
      username: 'jan',
      notificationsEnabled: true,
    });
    const response = await status(request('/api/telegram/status'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        configured: true,
        linked: true,
        username: 'jan',
        notificationsEnabled: true,
      },
    });
  });
});

describe('POST /api/telegram/unlink', () => {
  it('rejects an invalid origin before authentication', async () => {
    mocks.validateMutationOrigin.mockReturnValue(new Response('rejected', { status: 403 }));
    const response = await unlink(request('/api/telegram/unlink', {}));
    expect(response.status).toBe(403);
  });

  it('disconnects on success', async () => {
    mocks.unlinkTelegram.mockResolvedValue(true);
    const response = await unlink(request('/api/telegram/unlink', {}));
    expect(response.status).toBe(200);
    expect(mocks.unlinkTelegram).toHaveBeenCalledWith('player-1');
  });
});

describe('POST /api/telegram/toggle', () => {
  it('rejects an invalid origin before authentication', async () => {
    mocks.validateMutationOrigin.mockReturnValue(new Response('rejected', { status: 403 }));
    const response = await toggle(request('/api/telegram/toggle', { enabled: false }));
    expect(response.status).toBe(403);
  });

  it('rejects an invalid body', async () => {
    const response = await toggle(request('/api/telegram/toggle', { enabled: 'nope' }));
    expect(response.status).toBe(400);
  });

  it('updates the preference on success', async () => {
    mocks.setTelegramNotificationsEnabled.mockResolvedValue(true);
    const response = await toggle(request('/api/telegram/toggle', { enabled: false }));
    expect(response.status).toBe(200);
    expect(mocks.setTelegramNotificationsEnabled).toHaveBeenCalledWith('player-1', false);
  });
});
