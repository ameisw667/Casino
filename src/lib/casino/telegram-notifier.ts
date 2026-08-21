import 'server-only';

import { tasks } from '@trigger.dev/sdk';
import { CasinoLogger } from '@/lib/casino/logger';
import { isBigWin } from '@/lib/casino/big-win';

export interface BigWinNotificationInput {
  userId: string;
  game: string;
  payout: number;
  multiplier: number;
  win: boolean;
  replayed: boolean;
}

export type BigWinNotificationOutcome = 'sent' | 'skipped';

// Never blocks or fails the settlement response: fast local filter + async Trigger.dev dispatch.
export async function notifyBigWinIfEligible(
  input: BigWinNotificationInput,
): Promise<BigWinNotificationOutcome> {
  if (input.replayed || !input.win) return 'skipped';
  if (!isBigWin({ payout: input.payout, multiplier: input.multiplier })) return 'skipped';

  try {
    await tasks.trigger('big-win-notify', {
      userId: input.userId,
      game: input.game,
      payout: input.payout,
      multiplier: input.multiplier,
      win: input.win,
      replayed: input.replayed,
    });
    return 'sent';
  } catch (error) {
    CasinoLogger.error('TelegramNotifier', `Failed to trigger big-win-notify task: ${String(error)}`);
    return 'skipped';
  }
}
