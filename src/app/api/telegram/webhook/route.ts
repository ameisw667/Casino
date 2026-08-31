import { apiSuccessResponse, apiErrorResponse } from '@/lib/api/response';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { consumeTelegramLinkToken, unlinkTelegramByChatId } from '@/lib/casino/telegram-link';
import { sendTelegramMessage } from '@/lib/casino/telegram-api';
import { CasinoLogger } from '@/lib/casino/logger';

const updateSchema = z.object({
  message: z
    .object({
      text: z.string().max(4096).optional(),
      chat: z.object({ id: z.number().int() }),
      from: z.object({ username: z.string().optional() }).optional(),
    })
    .optional(),
});

const HELP_TEXT =
  'This bot only sends Casino Royale big-win notifications. Use the connect link from Settings to link your account.';

// Telegram authenticates itself via a secret we chose at setWebhook time, echoed back on
// every call in this header — not a browser Origin, so this replaces validateMutationOrigin
// (same exemption pattern as /api/webhooks/clerk in src/proxy.ts).
function hasValidWebhookSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const provided = request.headers.get('x-telegram-bot-api-secret-token');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

async function handleStart(chatId: number, token: string | undefined, username: string | null) {
  if (!token) {
    await sendTelegramMessage(chatId, HELP_TEXT).catch(() => undefined);
    return;
  }

  const result = await consumeTelegramLinkToken({ token, chatId, telegramUsername: username });
  const reply = result.ok
    ? 'Connected! You will now receive big-win notifications here.'
    : result.reason === 'chat_already_linked'
      ? 'This Telegram account is already linked to a different Casino Royale account. Unlink it there first.'
      : 'This link has expired or was already used. Generate a new one from Settings.';
  await sendTelegramMessage(chatId, reply).catch(() => undefined);
}

export async function POST(request: Request) {
  if (!hasValidWebhookSecret(request)) {
    return apiErrorResponse('UNAUTHORIZED', 'Unauthorized', 401);
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    const message = parsed.success ? parsed.data.message : undefined;
    if (!message) return apiSuccessResponse({ ok: true });

    const chatId = message.chat.id;
    const text = message.text?.trim() ?? '';

    if (text.startsWith('/start')) {
      await handleStart(chatId, text.split(/\s+/)[1], message.from?.username ?? null);
      return apiSuccessResponse({ ok: true });
    }

    if (text === '/stop') {
      await unlinkTelegramByChatId(chatId);
      await sendTelegramMessage(
        chatId,
        'Disconnected. You will no longer receive notifications here.',
      ).catch(() => undefined);
      return apiSuccessResponse({ ok: true });
    }

    await sendTelegramMessage(chatId, HELP_TEXT).catch(() => undefined);
    return apiSuccessResponse({ ok: true });
  } catch {
    CasinoLogger.error('API/Telegram/Webhook', 'Failed to process telegram update');
    // Always 200: an internal error here must not make Telegram retry-storm the webhook.
    return apiSuccessResponse({ ok: true });
  }
}
