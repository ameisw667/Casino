import 'server-only';

export interface TelegramSendResult {
  ok: boolean;
  status: number;
}

// Never log the constructed URL or a raw fetch error here or at any call site —
// both can embed or otherwise leak the bot token (see worldmap/05_2.2_telegram.md §3).
export async function sendTelegramMessage(
  chatId: number,
  text: string,
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, status: 0 };

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return { ok: response.ok, status: response.status };
}
