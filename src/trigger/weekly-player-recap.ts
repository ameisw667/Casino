import { logger, schedules } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { sendPlayerRecap } from './send-player-recap';

const telegramLinkRowSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    chat_id: z.coerce.number().int(),
  }),
);

export const weeklyPlayerRecap = schedules.task({
  id: 'weekly-player-recap',
  maxDuration: 300,
  cron: {
    pattern: '0 9 * * 1',
    timezone: 'Europe/Berlin',
    environments: ['PRODUCTION'],
  },
  run: async () => {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('telegram_links')
      .select('user_id, chat_id')
      .eq('notifications_enabled', true);

    if (error) {
      throw new Error(`Weekly player recap: Failed to read opted-in players: ${error.message}`);
    }

    const optedInPlayers = telegramLinkRowSchema.parse(data ?? []);

    if (optedInPlayers.length === 0) {
      logger.log('Weekly player recap: No opted-in users found');
      return { totalOptedIn: 0, triggeredCount: 0 };
    }

    const items = optedInPlayers.map((player) => ({
      payload: {
        userId: player.user_id,
        chatId: player.chat_id,
      },
    }));

    await sendPlayerRecap.batchTrigger(items);

    logger.log('Weekly player recap: Batch dispatched', {
      totalOptedIn: optedInPlayers.length,
    });

    return {
      totalOptedIn: optedInPlayers.length,
      triggeredCount: items.length,
    };
  },
});
