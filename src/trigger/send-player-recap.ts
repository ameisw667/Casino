import { logger, schemaTask } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { sendTelegramMessage } from '../lib/casino/telegram-api';
import { setTelegramNotificationsEnabled } from '../lib/casino/telegram-link';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const settledWalletResultSchema = z.object({
  response: z.object({
    result: z.object({
      amount: z.coerce.number().positive(),
      payout: z.coerce.number().nonnegative(),
    }),
  }),
});
const settledRoundResultSchema = z.object({
  result: z.object({ payout: z.coerce.number().nonnegative() }),
});

const walletBetRowSchema = z.array(
  z.object({
    game: z.string().nullable(),
    metadata: z.unknown(),
  }),
);
const gameRoundRowSchema = z.array(
  z.object({
    game: z.string().nullable(),
    bet_amount: z.coerce.number().nonnegative(),
    state: z.unknown(),
  }),
);

export const playerRecapPayloadSchema = z.object({
  userId: z.string().min(1),
  chatId: z.number().int(),
  referenceDate: z.string().optional(),
});

export type PlayerRecapPayload = z.infer<typeof playerRecapPayloadSchema>;

interface PlayerBet {
  game: string;
  wager: number;
  payout: number;
}

export function previousSevenDaysUtcRange(reference: Date): {
  start: string;
  end: string;
  label: string;
} {
  const end = new Date(reference.getTime());
  const start = new Date(reference.getTime() - WEEK_MS);
  const startStr = start.toISOString().slice(5, 10).replace('-', '.');
  const endStr = end.toISOString().slice(5, 10).replace('-', '.');
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: `${startStr} - ${endStr}`,
  };
}

function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `-$${Math.abs(amount).toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function buildPlayerRecapMessage(label: string, bets: PlayerBet[]): string {
  const totalWager = bets.reduce((sum, b) => sum + b.wager, 0);
  const totalPayout = bets.reduce((sum, b) => sum + b.payout, 0);
  const netProfit = totalPayout - totalWager;
  const isProfit = netProfit >= 0;

  const wagerByGame = new Map<string, number>();
  for (const bet of bets) {
    wagerByGame.set(bet.game, (wagerByGame.get(bet.game) ?? 0) + bet.wager);
  }
  const topGame =
    [...wagerByGame.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? '—';

  return [
    `🎰 Dein Casino-Wochenrückblick (${label})`,
    '',
    `Bets: ${bets.length}`,
    `Einsatz: ${formatCurrency(totalWager)}`,
    `Auszahlung: ${formatCurrency(totalPayout)}`,
    `Ergebnis: ${isProfit && netProfit > 0 ? '+' : ''}${formatCurrency(netProfit)} ${isProfit ? '📈' : '📉'}`,
    `Lieblingsspiel: ${topGame}`,
  ].join('\n');
}

export const sendPlayerRecap = schemaTask({
  id: 'send-player-recap',
  schema: playerRecapPayloadSchema,
  maxDuration: 60,
  queue: {
    name: 'player-recap-queue',
    concurrencyLimit: 5,
  },
  run: async (payload) => {
    const ref = payload.referenceDate ? new Date(payload.referenceDate) : new Date();
    const { start, end, label } = previousSevenDaysUtcRange(ref);
    const admin = createAdminClient();

    const [walletResult, roundsResult] = await Promise.all([
      admin
        .from('wallet_transactions')
        .select('game, created_at, metadata')
        .eq('user_id', payload.userId)
        .eq('type', 'bet_settled')
        .gte('created_at', start)
        .lt('created_at', end),
      admin
        .from('game_rounds')
        .select('game, bet_amount, updated_at, state')
        .eq('user_id', payload.userId)
        .eq('status', 'SETTLED')
        .gte('updated_at', start)
        .lt('updated_at', end),
    ]);

    if (walletResult.error || roundsResult.error) {
      throw new Error(`Player recap: Supabase read failed for user ${payload.userId}`);
    }

    const walletRows = walletBetRowSchema.parse(walletResult.data ?? []);
    const roundRows = gameRoundRowSchema.parse(roundsResult.data ?? []);

    const walletBets: PlayerBet[] = walletRows.flatMap((row) => {
      const parsed = settledWalletResultSchema.safeParse(row.metadata);
      if (!parsed.success) return [];
      return [
        {
          game: (row.game ?? 'unknown').toLowerCase(),
          wager: parsed.data.response.result.amount,
          payout: parsed.data.response.result.payout,
        },
      ];
    });

    const roundBets: PlayerBet[] = roundRows.flatMap((row) => {
      const parsed = settledRoundResultSchema.safeParse(row.state);
      if (!parsed.success) return [];
      return [
        {
          game: (row.game ?? 'unknown').toLowerCase(),
          wager: row.bet_amount,
          payout: parsed.data.result.payout,
        },
      ];
    });

    const bets = [...walletBets, ...roundBets];

    // Inactive user check: do not spam users with 0 bets in the last 7 days
    if (bets.length === 0) {
      logger.log('Skipping weekly recap for inactive player', { userId: payload.userId });
      return { sent: false, reason: 'inactive', userId: payload.userId };
    }

    const message = buildPlayerRecapMessage(label, bets);
    const delivery = await sendTelegramMessage(payload.chatId, message);

    if (delivery.status === 403) {
      logger.log('User blocked bot, disabling notifications', { userId: payload.userId });
      await setTelegramNotificationsEnabled(payload.userId, false);
      return { sent: false, reason: 'blocked', userId: payload.userId };
    }

    if (!delivery.ok) {
      throw new Error(`Player recap: Telegram send failed (status ${delivery.status})`);
    }

    logger.log('Player weekly recap sent', { userId: payload.userId, betCount: bets.length });
    return { sent: true, userId: payload.userId, betCount: bets.length };
  },
});
