import { logger, schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { isBigWin } from '../lib/casino/big-win';
import { sendTelegramMessage } from '../lib/casino/telegram-api';
import { setTelegramNotificationsEnabled } from '../lib/casino/telegram-link';

const TELEGRAM_FORBIDDEN_STATUS = 403;

export const bigWinNotifyPayloadSchema = z.object({
  userId: z.string().min(1),
  game: z.string().min(1),
  payout: z.number().nonnegative(),
  multiplier: z.number().nonnegative(),
  win: z.boolean(),
  replayed: z.boolean().optional(),
});

export type BigWinNotifyPayload = z.infer<typeof bigWinNotifyPayloadSchema>;

export function formatBigWinMessage(game: string, payout: number, multiplier: number): string {
  return `🎉 Big Win! ${game} — $${payout.toFixed(2)} at ${multiplier.toFixed(2)}x`;
}

export const bigWinNotify = schemaTask({
  id: 'big-win-notify',
  schema: bigWinNotifyPayloadSchema,
  maxDuration: 60,
  queue: {
    name: 'big-win-queue',
    concurrencyLimit: 5,
  },
  run: async (payload) => {
    if (payload.replayed || !payload.win) {
      logger.log('Big win notification skipped (replayed or loss)', { userId: payload.userId });
      return { sent: false, reason: 'skipped_loss_or_replay' };
    }

    if (!isBigWin({ payout: payload.payout, multiplier: payload.multiplier })) {
      logger.log('Big win notification skipped (below threshold)', {
        userId: payload.userId,
        payout: payload.payout,
        multiplier: payload.multiplier,
      });
      return { sent: false, reason: 'below_threshold' };
    }

    const admin = createAdminClient();
    const { data: link, error } = await admin
      .from('telegram_links')
      .select('chat_id, notifications_enabled')
      .eq('user_id', payload.userId)
      .maybeSingle();

    if (error || !link || !link.notifications_enabled) {
      logger.log('Big win notification skipped (no link or notifications disabled)', {
        userId: payload.userId,
      });
      return { sent: false, reason: 'no_link_or_disabled' };
    }

    const message = formatBigWinMessage(payload.game, payload.payout, payload.multiplier);
    const result = await sendTelegramMessage(Number(link.chat_id), message);

    if (!result.ok) {
      if (result.status === TELEGRAM_FORBIDDEN_STATUS) {
        logger.log('User blocked bot, disabling notifications', { userId: payload.userId });
        await setTelegramNotificationsEnabled(payload.userId, false);
        return { sent: false, reason: 'blocked_and_disabled' };
      }
      throw new Error(`Big win notification: Telegram delivery failed (status ${result.status})`);
    }

    logger.log('Big win notification delivered', {
      userId: payload.userId,
      game: payload.game,
      payout: payload.payout,
    });

    return { sent: true, userId: payload.userId };
  },
});
