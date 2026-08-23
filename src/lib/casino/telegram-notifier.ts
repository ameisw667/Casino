import 'server-only';

import { CasinoLogger } from '@/lib/casino/logger';
import { isBigWin } from '@/lib/casino/big-win';
import { WalletService } from '@/lib/casino/wallet';

export interface BigWinNotificationInput {
  userId: string;
  requestId: string;
  game: string;
  payout: number;
  multiplier: number;
  win: boolean;
  replayed: boolean;
}

export type BigWinNotificationOutcome = 'sent' | 'skipped';

/**
 * Never blocks or fails the settlement response: fast local filter, then a durable outbox insert
 * (4.3, worldmap/12_EVENT_BUS_BIG_WIN_CONSUMER.md) instead of calling tasks.trigger() directly.
 * The outbox's own trigger/route/pg_cron-backstop chain retries delivery to the unchanged
 * big-win-notify Trigger.dev task if the initial dispatch fails — the previous direct-call
 * version had no retry, so a transient Trigger.dev failure silently dropped the notification.
 */
export async function notifyBigWinIfEligible(
  input: BigWinNotificationInput,
): Promise<BigWinNotificationOutcome> {
  if (input.replayed || !input.win) return 'skipped';
  if (!isBigWin({ payout: input.payout, multiplier: input.multiplier })) return 'skipped';

  try {
    await WalletService.emitBigWinNotifyEvent({
      userId: input.userId,
      requestId: input.requestId,
      game: input.game,
      payout: input.payout,
      multiplier: input.multiplier,
    });
    return 'sent';
  } catch (error) {
    CasinoLogger.error('TelegramNotifier', `Failed to emit big-win notify event: ${String(error)}`);
    return 'skipped';
  }
}
