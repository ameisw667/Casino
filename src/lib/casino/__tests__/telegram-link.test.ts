import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  error: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.error },
}));

import {
  consumeTelegramLinkToken,
  getTelegramLinkStatus,
  issueTelegramLinkToken,
  isTelegramConfigured,
  setTelegramNotificationsEnabled,
  unlinkTelegram,
} from '../telegram-link';

const originalEnvironment = { ...process.env };

function chain(result: { data?: unknown; error?: unknown } = { data: null, error: null }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    single: vi.fn(async () => result),
    maybeSingle: vi.fn(async () => result),
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  return builder;
}

function configureTelegramEnv() {
  process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = 'CasinoRoyaleBot';
}

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.clearAllMocks();
});

describe('isTelegramConfigured', () => {
  it('is false unless both the bot token and public username are set', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    expect(isTelegramConfigured()).toBe(false);

    process.env.TELEGRAM_BOT_TOKEN = 'token';
    expect(isTelegramConfigured()).toBe(false);

    configureTelegramEnv();
    expect(isTelegramConfigured()).toBe(true);
  });
});

describe('issueTelegramLinkToken', () => {
  it('returns null when telegram is not configured, without touching the database', () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    return issueTelegramLinkToken('user-1').then((result) => {
      expect(result).toBeNull();
      expect(mocks.from).not.toHaveBeenCalled();
    });
  });

  it('replaces any pending token and returns a deep link with the issued token', async () => {
    configureTelegramEnv();
    const deleteChain = chain({ data: null, error: null });
    const insertChain = chain({
      data: { token: 'abc-123', expires_at: '2026-01-01T00:10:00.000Z' },
      error: null,
    });
    mocks.from.mockReturnValueOnce(deleteChain).mockReturnValueOnce(insertChain);

    const result = await issueTelegramLinkToken('user-1');

    expect(result).toEqual({
      token: 'abc-123',
      deepLink: 'https://t.me/CasinoRoyaleBot?start=abc-123',
      expiresAt: '2026-01-01T00:10:00.000Z',
    });
  });

  it('returns null when the insert fails', async () => {
    configureTelegramEnv();
    mocks.from
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: new Error('db down') }));

    const result = await issueTelegramLinkToken('user-1');
    expect(result).toBeNull();
  });
});

describe('consumeTelegramLinkToken', () => {
  it('rejects an unknown, expired or already-consumed token', async () => {
    mocks.from.mockReturnValueOnce(chain({ data: null, error: null }));

    const result = await consumeTelegramLinkToken({
      token: 'missing',
      chatId: 42,
      telegramUsername: 'jan',
    });

    expect(result).toEqual({ ok: false, reason: 'invalid_token' });
  });

  it('links successfully when the chat id is not yet linked to another account', async () => {
    mocks.from
      .mockReturnValueOnce(chain({ data: { user_id: 'user-1' }, error: null })) // consume token
      .mockReturnValueOnce(chain({ data: null, error: null })) // conflict check
      .mockReturnValueOnce(chain({ data: null, error: null })); // upsert

    const result = await consumeTelegramLinkToken({
      token: 'valid',
      chatId: 42,
      telegramUsername: 'jan',
    });

    expect(result).toEqual({ ok: true });
  });

  it('rejects when the chat id already belongs to a different account', async () => {
    mocks.from
      .mockReturnValueOnce(chain({ data: { user_id: 'user-1' }, error: null }))
      .mockReturnValueOnce(chain({ data: { user_id: 'user-2' }, error: null }));

    const result = await consumeTelegramLinkToken({
      token: 'valid',
      chatId: 42,
      telegramUsername: 'jan',
    });

    expect(result).toEqual({ ok: false, reason: 'chat_already_linked' });
  });

  it('treats a unique-constraint race on chat_id as chat_already_linked', async () => {
    mocks.from
      .mockReturnValueOnce(chain({ data: { user_id: 'user-1' }, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: null }))
      .mockReturnValueOnce(chain({ data: null, error: { code: '23505' } }));

    const result = await consumeTelegramLinkToken({
      token: 'valid',
      chatId: 42,
      telegramUsername: 'jan',
    });

    expect(result).toEqual({ ok: false, reason: 'chat_already_linked' });
  });
});

describe('unlinkTelegram / setTelegramNotificationsEnabled', () => {
  it('reports success and failure for unlink', async () => {
    mocks.from.mockReturnValueOnce(chain({ error: null }));
    await expect(unlinkTelegram('user-1')).resolves.toBe(true);

    mocks.from.mockReturnValueOnce(chain({ error: new Error('db down') }));
    await expect(unlinkTelegram('user-1')).resolves.toBe(false);
  });

  it('reports success and failure for the notification toggle', async () => {
    mocks.from.mockReturnValueOnce(chain({ error: null }));
    await expect(setTelegramNotificationsEnabled('user-1', false)).resolves.toBe(true);

    mocks.from.mockReturnValueOnce(chain({ error: new Error('db down') }));
    await expect(setTelegramNotificationsEnabled('user-1', true)).resolves.toBe(false);
  });
});

describe('getTelegramLinkStatus', () => {
  it('reports not configured without querying the database', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const result = await getTelegramLinkStatus('user-1');
    expect(result).toEqual({
      configured: false,
      linked: false,
      username: null,
      notificationsEnabled: false,
    });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('reports not linked when configured but no row exists', async () => {
    configureTelegramEnv();
    mocks.from.mockReturnValueOnce(chain({ data: null, error: null }));

    const result = await getTelegramLinkStatus('user-1');
    expect(result).toEqual({
      configured: true,
      linked: false,
      username: null,
      notificationsEnabled: false,
    });
  });

  it('reports the linked status and mute preference', async () => {
    configureTelegramEnv();
    mocks.from.mockReturnValueOnce(
      chain({ data: { telegram_username: 'jan', notifications_enabled: false }, error: null }),
    );

    const result = await getTelegramLinkStatus('user-1');
    expect(result).toEqual({
      configured: true,
      linked: true,
      username: 'jan',
      notificationsEnabled: false,
    });
  });
});
