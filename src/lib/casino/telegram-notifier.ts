import 'server-only';

import { CasinoLogger } from '@/lib/casino/logger';
import { isBigWin } from '@/lib/casino/big-win';
import { WalletService } from '@/lib/casino/wallet';
import { createNotificationBestEffort } from '@/lib/casino/notifications';

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
 * Never blocks or fails the settlement response: a local eligibility filter
 * queues the existing Telegram outbox event and independently creates the
 * durable in-app inbox entry. Both paths are idempotent and best-effort.
 */
export async function notifyBigWinIfEligible(
  input: BigWinNotificationInput,
): Promise<BigWinNotificationOutcome> {
  if (input.replayed || !input.win) return 'skipped';
  if (!isBigWin({ payout: input.payout, multiplier: input.multiplier })) return 'skipped';

  createNotificationBestEffort({
    userId: input.userId,
    kind: 'big_win',
    title: 'Big Win!',
    body: `${input.game} paid ${input.multiplier.toFixed(2)}x ($${input.payout.toFixed(2)}).`,
    metadata: { game: input.game, payout: input.payout, multiplier: input.multiplier },
    sourceKey: `big_win:${input.requestId}`,
  });

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
