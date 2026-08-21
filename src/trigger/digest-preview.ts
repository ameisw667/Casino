import { logger, metadata, task } from '@trigger.dev/sdk';
import { z } from 'zod';
import { createAdminClient } from '../utils/supabase/admin';
import { deliverDigest, type DailyBet } from './deliver-digest';
import { previousUtcDayRange } from './daily-activity-digest';

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

export const digestPreview = task({
  id: 'digest-preview',
  maxDuration: 60,
  run: async () => {
    metadata.set('step', 'querying_db');
    metadata.set('progress', 20);

    const { start, end, label } = previousUtcDayRange(new Date());
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
      metadata.set('step', 'error');
      throw new Error('Digest preview: Supabase read failed');
    }

    metadata.set('step', 'aggregating');
    metadata.set('progress', 50);

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

    metadata.set('step', 'formatting_message');
    metadata.set('progress', 80);

    // Hard requirement: preview runs MUST ALWAYS set dryRun: true to prevent any real Telegram message
    const deliveryResult = await deliverDigest.triggerAndWait({
      label,
      bets,
      dryRun: true,
    });

    if (!deliveryResult.ok) {
      metadata.set('step', 'error');
      logger.error('Digest preview delivery task failed', { error: deliveryResult.error });
      throw new Error(`Digest preview failed: ${String(deliveryResult.error)}`);
    }

    metadata.set('step', 'completed');
    metadata.set('progress', 100);

    return {
      label,
      betCount: bets.length,
      sent: false,
      dryRun: true,
      previewRunId: deliveryResult.id,
      message: deliveryResult.output.message ?? '',
    };
  },
});
