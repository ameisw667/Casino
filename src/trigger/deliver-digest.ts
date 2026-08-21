import { logger, schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';
import { sendTelegramMessage } from '../lib/casino/telegram-api';

export const dailyBetSchema = z.object({
  userId: z.string().min(1),
  game: z.string(),
  wager: z.number().nonnegative(),
  payout: z.number().nonnegative(),
});

export type DailyBet = z.infer<typeof dailyBetSchema>;

export const deliverDigestPayloadSchema = z.object({
  label: z.string().min(1),
  bets: z.array(dailyBetSchema),
  dryRun: z.boolean().optional(),
});

export type DeliverDigestPayload = z.infer<typeof deliverDigestPayloadSchema>;

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function buildMessage(label: string, bets: DailyBet[]): string {
  if (bets.length === 0) {
    return `📊 Casino-Tagesreport ${label}\n\n0 Aktivität — keine abgeschlossenen Wetten.`;
  }

  const activeUsers = new Set(bets.map((bet) => bet.userId)).size;
  const totalWager = bets.reduce((sum, bet) => sum + bet.wager, 0);
  const totalPayout = bets.reduce((sum, bet) => sum + bet.payout, 0);
  const ggr = totalWager - totalPayout;

  const wagerByGame = new Map<string, number>();
  for (const bet of bets) {
    wagerByGame.set(bet.game, (wagerByGame.get(bet.game) ?? 0) + bet.wager);
  }
  const topGame = [...wagerByGame.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];

  return [
    `📊 Casino-Tagesreport ${label}`,
    '',
    `Aktive User: ${activeUsers}`,
    `Bets: ${bets.length}`,
    `GGR: ${formatCurrency(ggr)}`,
    `Top-Spiel: ${topGame ?? '—'}`,
  ].join('\n');
}

export const deliverDigest = schemaTask({
  id: 'deliver-digest',
  schema: deliverDigestPayloadSchema,
  maxDuration: 60,
  run: async (payload) => {
    const message = buildMessage(payload.label, payload.bets);

    if (payload.dryRun) {
      logger.log('Deliver digest dry-run completed (no Telegram dispatch)', {
        label: payload.label,
        betCount: payload.bets.length,
      });
      return {
        label: payload.label,
        betCount: payload.bets.length,
        sent: false,
        dryRun: true,
        message,
      };
    }

    const chatIdRaw = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!chatIdRaw) throw new Error('Daily digest: TELEGRAM_ADMIN_CHAT_ID missing');
    const chatId = Number(chatIdRaw);
    if (!Number.isFinite(chatId)) throw new Error('Daily digest: TELEGRAM_ADMIN_CHAT_ID invalid');

    const delivery = await sendTelegramMessage(chatId, message);
    if (!delivery.ok) {
      throw new Error(`Daily digest: Telegram delivery failed (status ${delivery.status})`);
    }

    logger.log('Daily digest delivered to Telegram', {
      label: payload.label,
      betCount: payload.bets.length,
      chatId,
    });

    return {
      label: payload.label,
      betCount: payload.bets.length,
      sent: true,
      dryRun: false,
    };
  },
});
