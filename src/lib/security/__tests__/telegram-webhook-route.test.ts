import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  consumeTelegramLinkToken: vi.fn(),
  unlinkTelegramByChatId: vi.fn(),
  sendTelegramMessage: vi.fn(async () => ({ ok: true, status: 200 })),
  casinoLoggerError: vi.fn(),
}));

vi.mock('@/lib/casino/telegram-link', () => ({
  consumeTelegramLinkToken: mocks.consumeTelegramLinkToken,
  unlinkTelegramByChatId: mocks.unlinkTelegramByChatId,
}));
vi.mock('@/lib/casino/telegram-api', () => ({
  sendTelegramMessage: mocks.sendTelegramMessage,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.casinoLoggerError } }));

import { POST } from '@/app/api/telegram/webhook/route';

const originalEnvironment = { ...process.env };

function webhookRequest(body: unknown, secret = 'webhook-secret') {
  return new Request('https://casino.test/api/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret !== undefined ? { 'x-telegram-bot-api-secret-token': secret } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TELEGRAM_WEBHOOK_SECRET = 'webhook-secret';
});

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe('POST /api/telegram/webhook', () => {
  it('rejects a missing or mismatched secret header before touching the database', async () => {
    const response = await POST(
      webhookRequest({ message: { chat: { id: 1 }, text: '/start x' } }, 'wrong'),
    );
    expect(response.status).toBe(401);
    expect(mocks.consumeTelegramLinkToken).not.toHaveBeenCalled();
  });

  it('rejects when the server secret is not configured', async () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    const response = await POST(webhookRequest({ message: { chat: { id: 1 }, text: '/start x' } }));
    expect(response.status).toBe(401);
  });

  it('acknowledges updates without a message body', async () => {
    const response = await POST(webhookRequest({ update_id: 1 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.consumeTelegramLinkToken).not.toHaveBeenCalled();
  });

  it('links the account on a valid /start <token> and replies with confirmation', async () => {
    mocks.consumeTelegramLinkToken.mockResolvedValue({ ok: true });
    const response = await POST(
      webhookRequest({
        message: { chat: { id: 42 }, text: '/start abc-123', from: { username: 'jan' } },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.consumeTelegramLinkToken).toHaveBeenCalledWith({
      token: 'abc-123',
      chatId: 42,
      telegramUsername: 'jan',
    });
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(
      42,
      expect.stringContaining('Connected'),
    );
  });

  it('replies with a rejection message when the chat is already linked elsewhere', async () => {
    mocks.consumeTelegramLinkToken.mockResolvedValue({ ok: false, reason: 'chat_already_linked' });
    await POST(webhookRequest({ message: { chat: { id: 42 }, text: '/start abc-123' } }));

    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(
      42,
      expect.stringContaining('already linked'),
    );
  });

  it('replies with a help message for /start without a token', async () => {
    await POST(webhookRequest({ message: { chat: { id: 42 }, text: '/start' } }));
    expect(mocks.consumeTelegramLinkToken).not.toHaveBeenCalled();
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(42, expect.stringContaining('big-win'));
  });

  it('unlinks on /stop', async () => {
    await POST(webhookRequest({ message: { chat: { id: 42 }, text: '/stop' } }));
    expect(mocks.unlinkTelegramByChatId).toHaveBeenCalledWith(42);
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(
      42,
      expect.stringContaining('Disconnected'),
    );
  });

  it('replies with a static help message for unrecognized text', async () => {
    await POST(webhookRequest({ message: { chat: { id: 42 }, text: 'hello there' } }));
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(42, expect.stringContaining('big-win'));
  });

  it('never throws and always returns 200 on an internal error', async () => {
    mocks.consumeTelegramLinkToken.mockRejectedValue(new Error('db down'));
    const response = await POST(
      webhookRequest({ message: { chat: { id: 42 }, text: '/start abc' } }),
    );
    expect(response.status).toBe(200);
  });
});
