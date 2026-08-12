import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  error: vi.fn(),
  setTelegramNotificationsEnabled: vi.fn(async () => true),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.from })),
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: mocks.error },
}));
vi.mock('@/lib/casino/telegram-link', () => ({
  setTelegramNotificationsEnabled: mocks.setTelegramNotificationsEnabled,
}));

import { notifyBigWinIfEligible } from '../telegram-notifier';

function chain(result: { data?: unknown; error?: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => result),
  };
  return builder;
}

const baseInput = {
  userId: 'user-1',
  game: 'DICE',
  payout: 1000,
  multiplier: 25,
  win: true,
  replayed: false,
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
});

describe('notifyBigWinIfEligible', () => {
  it('skips replayed settlements without touching the database', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, replayed: true });
    expect(result).toBe('skipped');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('skips losses', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, win: false });
    expect(result).toBe('skipped');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('skips wins below both thresholds', async () => {
    const result = await notifyBigWinIfEligible({ ...baseInput, payout: 10, multiplier: 2 });
    expect(result).toBe('skipped');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('skips when the user has no telegram link', async () => {
    mocks.from.mockReturnValueOnce(chain({ data: null, error: null }));
    const result = await notifyBigWinIfEligible(baseInput);
    expect(result).toBe('skipped');
  });

  it('skips when notifications are muted', async () => {
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: false }, error: null }),
    );
    const result = await notifyBigWinIfEligible(baseInput);
    expect(result).toBe('skipped');
  });

  it('sends a message and returns sent on success', async () => {
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: true }, error: null }),
    );
    const fetchSpy = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);

    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('sent');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({ method: 'POST' }),
    );
    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      chat_id: 42,
      text: expect.stringContaining('DICE'),
    });
  });

  it('mutes the user and skips when telegram reports 403 (bot blocked)', async () => {
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: true }, error: null }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 403 })),
    );

    const result = await notifyBigWinIfEligible(baseInput);

    expect(result).toBe('skipped');
    expect(mocks.setTelegramNotificationsEnabled).toHaveBeenCalledWith('user-1', false);
  });

  it('skips without throwing when the telegram call rejects', async () => {
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: true }, error: null }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    await expect(notifyBigWinIfEligible(baseInput)).resolves.toBe('skipped');
  });

  it('skips when the bot token is missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: true }, error: null }),
    );

    const result = await notifyBigWinIfEligible(baseInput);
    expect(result).toBe('skipped');
  });

  it('times out and skips instead of hanging the caller', async () => {
    vi.useFakeTimers();
    mocks.from.mockReturnValueOnce(
      chain({ data: { chat_id: 42, notifications_enabled: true }, error: null }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => undefined)),
    );

    const pending = notifyBigWinIfEligible(baseInput);
    await vi.advanceTimersByTimeAsync(1300);

    await expect(pending).resolves.toBe('skipped');
    vi.useRealTimers();
  });
});
