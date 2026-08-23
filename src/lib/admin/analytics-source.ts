import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { buildAdminAnalytics, type SettledBet } from './analytics';

const timestampSchema = z.string().datetime({ offset: true });

export const usersRowSchema = z.array(
  z.object({ id: z.string().min(1), created_at: timestampSchema, xp: z.coerce.number().finite() }),
);
export const walletTransactionsRowSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    type: z.string(),
    created_at: timestampSchema,
    metadata: z.unknown(),
  }),
);
export const gameRoundsRowSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    status: z.string(),
    bet_amount: z.coerce.number().positive(),
    updated_at: timestampSchema,
    state: z.unknown(),
  }),
);
export const vipTiersRowSchema = z.array(
  z.object({
    name: z.string().min(1),
    min_xp: z.coerce.number().finite(),
    is_active: z.boolean().nullable().optional(),
  }),
);

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

export type UsersRow = z.infer<typeof usersRowSchema>[number];
export type WalletTransactionsRow = z.infer<typeof walletTransactionsRowSchema>[number];
export type GameRoundsRow = z.infer<typeof gameRoundsRowSchema>[number];

export function parseSettledBets(
  walletRows: WalletTransactionsRow[],
  gameRoundsRows: GameRoundsRow[],
): SettledBet[] {
  const walletBets = walletRows.flatMap((transaction) => {
    if (transaction.type !== 'bet_settled') return [];
    const parsedMetadata = settledWalletResultSchema.safeParse(transaction.metadata);
    if (!parsedMetadata.success) return [];
    const result = parsedMetadata.data.response.result;
    return [
      {
        userId: transaction.user_id,
        occurredAt: transaction.created_at,
        wager: result.amount,
        payout: result.payout,
      },
    ];
  });
  const roundBets = gameRoundsRows.flatMap((round) => {
    if (round.status !== 'SETTLED') return [];
    const parsedState = settledRoundResultSchema.safeParse(round.state);
    if (!parsedState.success) return [];
    return [
      {
        userId: round.user_id,
        occurredAt: round.updated_at,
        wager: round.bet_amount,
        payout: parsedState.data.result.payout,
      },
    ];
  });
  return [...walletBets, ...roundBets];
}

export class AdminAnalyticsSourceError extends Error {}

/**
 * Live-Fetch der Rohdaten + Aggregation. Wird sowohl vom nächtlichen Snapshot-Task
 * (src/trigger/admin-analytics-snapshot.ts) als auch als Route-Fallback verwendet, solange
 * noch kein Snapshot existiert oder dessen Payload nicht dem erwarteten Schema entspricht.
 */
export async function computeAdminAnalyticsFromDb(admin: SupabaseClient) {
  const [usersResult, walletResult, roundsResult, vipResult] = await Promise.all([
    admin.from('users').select('id, created_at, xp'),
    admin.from('wallet_transactions').select('user_id, type, created_at, metadata'),
    admin.from('game_rounds').select('user_id, status, bet_amount, updated_at, state'),
    admin.from('vip_tiers').select('name, min_xp, is_active'),
  ]);

  if (usersResult.error || walletResult.error || roundsResult.error || vipResult.error) {
    throw new AdminAnalyticsSourceError('Admin analytics source data load failed');
  }

  const users = usersRowSchema.parse(usersResult.data ?? []);
  const walletRows = walletTransactionsRowSchema.parse(walletResult.data ?? []);
  const gameRoundsRows = gameRoundsRowSchema.parse(roundsResult.data ?? []);
  const vipTiers = vipTiersRowSchema
    .parse(vipResult.data ?? [])
    .filter((tier) => tier.is_active !== false);

  return buildAdminAnalytics({
    users: users.map((entry) => ({ id: entry.id, createdAt: entry.created_at, xp: entry.xp })),
    bets: parseSettledBets(walletRows, gameRoundsRows),
    vipTiers: vipTiers.map((entry) => ({ name: entry.name, minXp: entry.min_xp })),
  });
}

const retentionValueSchema = z.object({
  eligible: z.number(),
  retained: z.number(),
  rate: z.number().nullable(),
});
const cohortRowSchema = z.object({
  cohort: z.string(),
  users: z.number(),
  d1: retentionValueSchema,
  d7: retentionValueSchema,
  d30: retentionValueSchema,
});

export const adminAnalyticsSnapshotPayloadSchema = z.object({
  generatedAt: z.string(),
  cohorts: z.object({
    registration: z.array(cohortRowSchema),
    firstWager: z.array(cohortRowSchema),
  }),
  summary: z.object({
    registeredUsers: z.number(),
    activatedUsers: z.number(),
    activeUsers7d: z.number(),
    churnRiskUsers: z.number(),
    wager: z.number(),
    payout: z.number(),
    ggr: z.number(),
  }),
  funnel: z.array(
    z.object({ key: z.string(), label: z.string(), users: z.number(), rate: z.number() }),
  ),
  vipDistribution: z.array(z.object({ tier: z.string(), users: z.number() })),
  deposits: z.object({ available: z.boolean(), count: z.number(), amount: z.number() }),
  operational: z.object({
    activeUsers24h: z.number(),
    settledBets24h: z.number(),
    wager24h: z.number(),
    ggr24h: z.number(),
    signals: z.array(z.object({ level: z.literal('warning'), message: z.string() })),
  }),
});

export type AdminAnalyticsSnapshotPayload = z.infer<typeof adminAnalyticsSnapshotPayloadSchema>;
