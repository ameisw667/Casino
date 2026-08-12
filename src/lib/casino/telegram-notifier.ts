import 'server-only';

import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import { isBigWin } from '@/lib/casino/big-win';
import { setTelegramNotificationsEnabled } from '@/lib/casino/telegram-link';
import { sendTelegramMessage } from '@/lib/casino/telegram-api';

// External API latency budget, deliberately larger than the 250ms used for the internal
// DB-write in guide-telemetry.ts. Big wins are rare (high threshold), so the occasional
// extra tail latency on the bet response never affects the normal betting cadence.
const NOTIFY_TIMEOUT_MS = 1200;
const TELEGRAM_FORBIDDEN_STATUS = 403;

export interface BigWinNotificationInput {
  userId: string;
  game: string;
  payout: number;
  multiplier: number;
  win: boolean;
  replayed: boolean;
}

export type BigWinNotificationOutcome = 'sent' | 'skipped';

function formatBigWinMessage(game: string, payout: number, multiplier: number): string {
  return `🎉 Big Win! ${game} — $${payout.toFixed(2)} at ${multiplier.toFixed(2)}x`;
}

async function dispatch(input: BigWinNotificationInput): Promise<BigWinNotificationOutcome> {
  const admin = createAdminClient();
  const { data: link } = await admin
    .from('telegram_links')
    .select('chat_id, notifications_enabled')
    .eq('user_id', input.userId)
    .maybeSingle();

  if (!link || !link.notifications_enabled) return 'skipped';

  const message = formatBigWinMessage(input.game, input.payout, input.multiplier);
  const result = await sendTelegramMessage(link.chat_id as number, message);

  if (!result.ok) {
    if (result.status === TELEGRAM_FORBIDDEN_STATUS) {
      await setTelegramNotificationsEnabled(input.userId, false);
    }
    CasinoLogger.error('TelegramNotifier', 'Big win notification delivery failed');
    return 'skipped';
  }

  return 'sent';
}

// Never blocks or fails the settlement response: every error path is swallowed here,
// and the whole operation (DB lookup + Telegram call) is bounded by NOTIFY_TIMEOUT_MS.
export async function notifyBigWinIfEligible(
  input: BigWinNotificationInput,
): Promise<BigWinNotificationOutcome> {
  if (input.replayed || !input.win) return 'skipped';
  if (!isBigWin({ payout: input.payout, multiplier: input.multiplier })) return 'skipped';

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      dispatch(input),
      new Promise<BigWinNotificationOutcome>((resolve) => {
        timeoutId = setTimeout(() => resolve('skipped'), NOTIFY_TIMEOUT_MS);
      }),
    ]);
  } catch {
    CasinoLogger.error('TelegramNotifier', 'Big win notification threw unexpectedly');
    return 'skipped';
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
