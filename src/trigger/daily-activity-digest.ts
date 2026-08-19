import { logger, schedules } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { sendTelegramMessage } from '../lib/casino/telegram-api';

const DAY_MS = 24 * 60 * 60 * 1000;

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
    user_id: z.string().min(1),
    game: z.string().nullable(),
    metadata: z.unknown(),
  }),
);
const gameRoundRowSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    game: z.string().nullable(),
    bet_amount: z.coerce.number().nonnegative(),
    state: z.unknown(),
  }),
);

interface DailyBet {
  userId: string;
  game: string;
  wager: number;
  payout: number;
}

interface UtcDayRange {
  start: string;
  end: string;
  label: string;
}

function previousUtcDayRange(reference: Date): UtcDayRange {
  const todayUtcStart = Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    reference.getUTCDate(),
  );
  const start = new Date(todayUtcStart - DAY_MS);
  const end = new Date(todayUtcStart);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: start.toISOString().slice(0, 10),
  };
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function buildMessage(label: string, bets: DailyBet[]): string {
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

export const dailyActivityDigest = schedules.task({
  id: 'daily-activity-digest',
  maxDuration: 120,
  cron: {
    pattern: '0 8 * * *',
    timezone: 'Europe/Berlin',
    environments: ['PRODUCTION'],
  },
  run: async (payload) => {
    const { start, end, label } = previousUtcDayRange(payload.timestamp ?? new Date());
    const admin = createAdminClient();

    const [walletResult, roundsResult] = await Promise.all([
      admin
        .from('wallet_transactions')
        .select('user_id, game, created_at, metadata')
        .eq('type', 'bet_settled')
        .gte('created_at', start)
        .lt('created_at', end),
      admin
        .from('game_rounds')
        .select('user_id, game, bet_amount, updated_at, state')
        .eq('status', 'SETTLED')
        .gte('updated_at', start)
        .lt('updated_at', end),
    ]);

    if (walletResult.error || roundsResult.error) {
      throw new Error('Daily digest: Supabase read failed');
    }

    const walletRows = walletBetRowSchema.parse(walletResult.data ?? []);
    const roundRows = gameRoundRowSchema.parse(roundsResult.data ?? []);

    const walletBets: DailyBet[] = walletRows.flatMap((row) => {
      const parsed = settledWalletResultSchema.safeParse(row.metadata);
      if (!parsed.success) return [];
      return [
        {
          userId: row.user_id,
          game: (row.game ?? 'unknown').toLowerCase(),
          wager: parsed.data.response.result.amount,
          payout: parsed.data.response.result.payout,
        },
      ];
    });

    const roundBets: DailyBet[] = roundRows.flatMap((row) => {
      const parsed = settledRoundResultSchema.safeParse(row.state);
      if (!parsed.success) return [];
      return [
        {
          userId: row.user_id,
          game: (row.game ?? 'unknown').toLowerCase(),
          wager: row.bet_amount,
          payout: parsed.data.result.payout,
        },
      ];
    });

    const bets = [...walletBets, ...roundBets];
    const message = buildMessage(label, bets);
    logger.log('Daily activity digest computed', { label, betCount: bets.length });

    const chatIdRaw = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!chatIdRaw) throw new Error('Daily digest: TELEGRAM_ADMIN_CHAT_ID missing');
    const chatId = Number(chatIdRaw);
    if (!Number.isFinite(chatId)) throw new Error('Daily digest: TELEGRAM_ADMIN_CHAT_ID invalid');

    const delivery = await sendTelegramMessage(chatId, message);
    if (!delivery.ok) {
      throw new Error(`Daily digest: Telegram delivery failed (status ${delivery.status})`);
    }

    return { label, betCount: bets.length, sent: true };
  },
});
