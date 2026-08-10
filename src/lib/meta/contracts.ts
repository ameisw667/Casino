import { z } from 'zod';

export const PageLimitSchema = z.number().int().min(1).max(100);
export const CanonicalUserIdSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/);
export const GameSchema = z.enum(['dice', 'slots', 'roulette', 'crash', 'blackjack']);
export const OutcomeSchema = z.enum(['win', 'loss', 'push']);
export const LeaderboardPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'all-time']);
export const LeaderboardMetricSchema = z.enum(['wagered', 'biggest-win', 'highest-multiplier']);

const unsignedMoneyPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const signedMoneyPattern = /^-?(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
const unsignedDecimalPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,4})?$/;

export const MoneyDecimalSchema = z.string().regex(unsignedMoneyPattern);
export const SignedMoneyDecimalSchema = z.string().regex(signedMoneyPattern);
export const MetricDecimalSchema = z.string().regex(unsignedDecimalPattern);
export const MetaRpcNames = {
  leaderboardPage: 'meta_leaderboard_page',
  adminOverview: 'meta_admin_overview',
  adminGames: 'meta_admin_games',
} as const;

export const LeaderboardRpcParamsSchema = z.object({
  p_period_start: z.string().datetime({ offset: true }).nullable(),
  p_as_of: z.string().datetime({ offset: true }),
  p_metric: LeaderboardMetricSchema,
  p_limit: z.number().int().min(2).max(101),
  p_cursor_value: MetricDecimalSchema.nullable(),
  p_cursor_player_key: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
});

export const AdminAggregateRpcParamsSchema = z.object({
  p_as_of: z.string().datetime({ offset: true }),
});

function decimalToCentsBigInt(value: string): bigint {
  if (!signedMoneyPattern.test(value)) throw new Error('Money must use at most two decimal places');
  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ''] = unsigned.split('.');
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0'));
  return negative ? -cents : cents;
}

export function decimalToSafeCents(value: string): number {
  const cents = decimalToCentsBigInt(value);
  if (cents > BigInt(Number.MAX_SAFE_INTEGER) || cents < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error('Money exceeds safe cents range');
  }
  return Number(cents);
}

export function sumMoneyDecimals(values: string[]): string {
  const cents = values.reduce((sum, value) => sum + decimalToCentsBigInt(value), BigInt(0));
  const negative = cents < BigInt(0);
  const absolute = negative ? -cents : cents;
  const whole = absolute / BigInt(100);
  const fraction = (absolute % BigInt(100)).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

export const HistoryResultRowSchema = z.object({
  id: z.string().uuid(),
  game: GameSchema,
  wager_amount: MoneyDecimalSchema,
  payout_amount: MoneyDecimalSchema,
  net_amount: SignedMoneyDecimalSchema,
  multiplier: MetricDecimalSchema,
  outcome: OutcomeSchema,
  server_seed_hash: z
    .string()
    .regex(/^[a-f0-9]{64}$/i)
    .nullable(),
  settled_at: z.string().datetime({ offset: true }),
});

export const HistoryPageDataSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      game: GameSchema,
      wagerAmount: MoneyDecimalSchema,
      payoutAmount: MoneyDecimalSchema,
      netAmount: SignedMoneyDecimalSchema,
      multiplier: MetricDecimalSchema,
      outcome: OutcomeSchema,
      settledAt: z.string().datetime({ offset: true }),
      verification: z.discriminatedUnion('status', [
        z.object({
          status: z.literal('hash-available'),
          serverSeedHash: z.string().regex(/^[a-f0-9]{64}$/i),
        }),
        z.object({ status: z.literal('unavailable'), serverSeedHash: z.null() }),
      ]),
    }),
  ),
  pageSummary: z.object({
    totalWagered: MoneyDecimalSchema,
    totalPayout: MoneyDecimalSchema,
    netAmount: SignedMoneyDecimalSchema,
    wins: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export type HistoryPageData = z.infer<typeof HistoryPageDataSchema>;

export const LeaderboardAggregateRowSchema = z.object({
  rank: z.coerce.number().int().positive(),
  public_name: z.string().trim().min(1).max(64),
  avatar_url: z.string().url().nullable(),
  metric_value: MetricDecimalSchema,
  wagered_amount: MoneyDecimalSchema,
  biggest_win_amount: MoneyDecimalSchema,
  highest_multiplier: MetricDecimalSchema,
  player_key: z.string().regex(/^[a-f0-9]{64}$/),
});

export const LeaderboardPageDataSchema = z.object({
  entries: z.array(
    z.object({
      rank: z.number().int().positive(),
      publicName: z.string().min(1).max(64),
      avatarUrl: z.string().url().nullable(),
      metricValue: MetricDecimalSchema,
      wageredAmount: MoneyDecimalSchema,
      biggestWinAmount: MoneyDecimalSchema,
      highestMultiplier: MetricDecimalSchema,
    }),
  ),
  period: LeaderboardPeriodSchema,
  metric: LeaderboardMetricSchema,
  asOf: z.string().datetime({ offset: true }),
  periodStart: z.string().datetime({ offset: true }).nullable(),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export type LeaderboardPageData = z.infer<typeof LeaderboardPageDataSchema>;

export const AdminOverviewRowSchema = z.object({
  total_wagered: MoneyDecimalSchema,
  total_payout: MoneyDecimalSchema,
  net_amount: SignedMoneyDecimalSchema,
  total_results: z.coerce.number().int().nonnegative(),
  active_players: z.coerce.number().int().nonnegative(),
});
export const AdminOverviewDataSchema = z.object({
  totalWagered: MoneyDecimalSchema,
  totalPayout: MoneyDecimalSchema,
  netAmount: SignedMoneyDecimalSchema,
  totalResults: z.number().int().nonnegative(),
  activePlayers: z.number().int().nonnegative(),
  asOf: z.string().datetime({ offset: true }),
});
export type AdminOverviewData = z.infer<typeof AdminOverviewDataSchema>;

export const AdminGameRowSchema = z.object({
  game: GameSchema,
  total_wagered: MoneyDecimalSchema,
  total_payout: MoneyDecimalSchema,
  net_amount: SignedMoneyDecimalSchema,
  total_results: z.coerce.number().int().nonnegative(),
  wins: z.coerce.number().int().nonnegative(),
  biggest_win: MoneyDecimalSchema,
  rtp: MetricDecimalSchema,
  win_rate: MetricDecimalSchema,
});
export const AdminGamesDataSchema = z.object({
  games: z.array(
    z.object({
      game: GameSchema,
      totalWagered: MoneyDecimalSchema,
      totalPayout: MoneyDecimalSchema,
      netAmount: SignedMoneyDecimalSchema,
      totalResults: z.number().int().nonnegative(),
      wins: z.number().int().nonnegative(),
      biggestWin: MoneyDecimalSchema,
      rtp: MetricDecimalSchema,
      winRate: MetricDecimalSchema,
    }),
  ),
  asOf: z.string().datetime({ offset: true }),
});
export type AdminGamesData = z.infer<typeof AdminGamesDataSchema>;

export const AdminUserRowSchema = z
  .object({
    id: CanonicalUserIdSchema,
    username: z.string().nullable(),
    email: z.string().email().nullable(),
    balance: MoneyDecimalSchema,
    xp: z.coerce.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    level: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    rank: z.string().min(1).max(64),
    status: z.enum(['active', 'banned']),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .transform((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    balanceAmount: row.balance,
    xp: row.xp,
    level: row.level,
    rank: row.rank,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
export const AdminUsersDataSchema = z.object({
  users: z.array(
    z.object({
      id: CanonicalUserIdSchema,
      username: z.string().nullable(),
      email: z.string().email().nullable(),
      balanceAmount: MoneyDecimalSchema,
      xp: z.number().int().nonnegative(),
      level: z.number().int().positive(),
      rank: z.string(),
      status: z.enum(['active', 'banned']),
      createdAt: z.string().datetime({ offset: true }),
      updatedAt: z.string().datetime({ offset: true }),
    }),
  ),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export type AdminUsersData = z.infer<typeof AdminUsersDataSchema>;
