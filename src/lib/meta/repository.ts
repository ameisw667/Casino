import { z } from 'zod';

import {
  AdminAggregateRpcParamsSchema,
  AdminGameRowSchema,
  AdminGamesDataSchema,
  AdminOverviewDataSchema,
  AdminOverviewRowSchema,
  AdminUserRowSchema,
  AdminUsersDataSchema,
  CanonicalUserIdSchema,
  GameSchema,
  HistoryPageDataSchema,
  HistoryResultRowSchema,
  LeaderboardAggregateRowSchema,
  LeaderboardRpcParamsSchema,
  LeaderboardMetricSchema,
  LeaderboardPageDataSchema,
  LeaderboardPeriodSchema,
  OutcomeSchema,
  PageLimitSchema,
  MetaRpcNames,
  sumMoneyDecimals,
  type AdminGamesData,
  type AdminOverviewData,
  type AdminUsersData,
  type HistoryPageData,
  type LeaderboardPageData,
} from './contracts';
import {
  decodeAdminUsersCursor,
  decodeHistoryCursor,
  decodeLeaderboardCursor,
  encodeAdminUsersCursor,
  encodeHistoryCursor,
  encodeLeaderboardCursor,
} from './cursor';

const HISTORY_SELECT =
  'id,game,wager_amount,payout_amount,net_amount,multiplier,outcome,server_seed_hash,settled_at';
const ADMIN_USER_SELECT = 'id,username,email,balance,xp,level,rank,status,created_at,updated_at';

type DbResponse = { data: Record<string, unknown>[] | null; error: { message: string } | null };
type QueryResult = PromiseLike<DbResponse>;
type Query = QueryResult & {
  eq(column: string, value: unknown): Query;
  or(value: string): Query;
  order(column: string, options: { ascending: boolean }): Query;
  limit(value: number): Query;
};
type FromQuery = { select(columns: string): Query };

export interface MetaQueryClient {
  from?: (table: string) => unknown;
  rpc?: (name: string, params: Record<string, unknown>) => unknown;
}

export class MetaRepositoryError extends Error {
  constructor(
    readonly code: 'META_DB_ERROR' | 'META_DATA_INVALID',
    message: string,
  ) {
    super(message);
    this.name = 'MetaRepositoryError';
  }
}

function dataError(): MetaRepositoryError {
  return new MetaRepositoryError('META_DATA_INVALID', 'Meta data failed validation');
}

function from(client: MetaQueryClient, table: string): FromQuery {
  const query = client.from?.(table);
  if (!query || typeof (query as { select?: unknown }).select !== 'function') throw dataError();
  return query as FromQuery;
}

async function rows(query: unknown): Promise<Record<string, unknown>[]> {
  if (!query || typeof (query as { then?: unknown }).then !== 'function') throw dataError();
  const response = await (query as QueryResult);
  if (response.error || !response.data)
    throw new MetaRepositoryError('META_DB_ERROR', 'Meta data is unavailable');
  return response.data;
}

async function rpcRows(
  client: MetaQueryClient,
  name: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  if (!client.rpc) throw dataError();
  return rows(client.rpc(name, params));
}

function parseRows<T>(schema: z.ZodType<T>, data: Record<string, unknown>[]): T[] {
  const parsed = z.array(schema).safeParse(data);
  if (!parsed.success) throw dataError();
  return parsed.data;
}

function periodStart(period: z.infer<typeof LeaderboardPeriodSchema>, asOf: Date): string | null {
  if (period === 'all-time') return null;
  const start = new Date(asOf);
  if (period === 'daily') start.setUTCDate(start.getUTCDate() - 1);
  if (period === 'weekly') start.setUTCDate(start.getUTCDate() - 7);
  if (period === 'monthly') start.setUTCMonth(start.getUTCMonth() - 1);
  return start.toISOString();
}

export function createMetaRepository(
  client: MetaQueryClient,
  clock: () => Date = () => new Date(),
) {
  return {
    async getHistory(input: {
      userId: string;
      limit: number;
      cursor?: string;
      game?: z.infer<typeof GameSchema>;
      outcome?: z.infer<typeof OutcomeSchema>;
    }): Promise<HistoryPageData> {
      const userId = CanonicalUserIdSchema.parse(input.userId);
      const limit = PageLimitSchema.parse(input.limit);
      const game = input.game === undefined ? undefined : GameSchema.parse(input.game);
      const outcome = input.outcome === undefined ? undefined : OutcomeSchema.parse(input.outcome);
      const cursor = input.cursor ? decodeHistoryCursor(input.cursor) : null;

      let query = from(client, 'game_results')
        .select(HISTORY_SELECT)
        .eq('user_id', userId)
        .order('settled_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);
      if (game) query = query.eq('game', game);
      if (outcome) query = query.eq('outcome', outcome);
      if (cursor)
        query = query.or(
          `settled_at.lt.${cursor.settledAt},and(settled_at.eq.${cursor.settledAt},id.lt.${cursor.id})`,
        );

      const parsed = parseRows(HistoryResultRowSchema, await rows(query));
      if (parsed.length > limit + 1) throw dataError();
      const hasMore = parsed.length > limit;
      const visible = parsed.slice(0, limit);
      const items = visible.map((row) => ({
        id: row.id,
        game: row.game,
        wagerAmount: row.wager_amount,
        payoutAmount: row.payout_amount,
        netAmount: row.net_amount,
        multiplier: row.multiplier,
        outcome: row.outcome,
        settledAt: row.settled_at,
        verification: row.server_seed_hash
          ? { status: 'hash-available' as const, serverSeedHash: row.server_seed_hash }
          : { status: 'unavailable' as const, serverSeedHash: null },
      }));
      const last = visible.at(-1);

      return HistoryPageDataSchema.parse({
        items,
        pageSummary: {
          totalWagered: sumMoneyDecimals(items.map((item) => item.wagerAmount)),
          totalPayout: sumMoneyDecimals(items.map((item) => item.payoutAmount)),
          netAmount: sumMoneyDecimals(items.map((item) => item.netAmount)),
          wins: items.filter((item) => item.outcome === 'win').length,
          total: items.length,
        },
        nextCursor:
          hasMore && last ? encodeHistoryCursor({ settledAt: last.settled_at, id: last.id }) : null,
        hasMore,
      });
    },

    async getLeaderboard(input: {
      period: z.infer<typeof LeaderboardPeriodSchema>;
      metric: z.infer<typeof LeaderboardMetricSchema>;
      limit: number;
      cursor?: string;
    }): Promise<LeaderboardPageData> {
      const period = LeaderboardPeriodSchema.parse(input.period);
      const metric = LeaderboardMetricSchema.parse(input.metric);
      const limit = PageLimitSchema.parse(input.limit);
      const cursor = input.cursor
        ? decodeLeaderboardCursor(input.cursor, { period, metric })
        : null;
      const asOf = cursor?.asOf ?? clock().toISOString();
      const start = cursor?.periodStart ?? periodStart(period, new Date(asOf));
      const rpcParams = LeaderboardRpcParamsSchema.parse({
        p_period_start: start,
        p_as_of: asOf,
        p_metric: metric,
        p_limit: limit + 1,
        p_cursor_value: cursor?.value ?? null,
        p_cursor_player_key: cursor?.playerKey ?? null,
      });
      const aggregateRows = parseRows(
        LeaderboardAggregateRowSchema,
        await rpcRows(client, MetaRpcNames.leaderboardPage, rpcParams),
      );
      if (aggregateRows.length > limit + 1) throw dataError();
      const hasMore = aggregateRows.length > limit;
      const visible = aggregateRows.slice(0, limit);
      const last = visible.at(-1);

      return LeaderboardPageDataSchema.parse({
        entries: visible.map((row) => ({
          rank: row.rank,
          publicName: row.public_name,
          avatarUrl: row.avatar_url,
          metricValue: row.metric_value,
          wageredAmount: row.wagered_amount,
          biggestWinAmount: row.biggest_win_amount,
          highestMultiplier: row.highest_multiplier,
        })),
        period,
        metric,
        asOf,
        periodStart: start,
        nextCursor:
          hasMore && last
            ? encodeLeaderboardCursor({
                period,
                metric,
                asOf,
                periodStart: start,
                value: last.metric_value,
                playerKey: last.player_key,
              })
            : null,
        hasMore,
      });
    },

    async getAdminOverview(): Promise<AdminOverviewData> {
      const asOf = clock().toISOString();
      const parsed = parseRows(
        AdminOverviewRowSchema,
        await rpcRows(
          client,
          MetaRpcNames.adminOverview,
          AdminAggregateRpcParamsSchema.parse({ p_as_of: asOf }),
        ),
      );
      if (parsed.length !== 1) throw dataError();
      const row = parsed[0];
      return AdminOverviewDataSchema.parse({
        totalWagered: row.total_wagered,
        totalPayout: row.total_payout,
        netAmount: row.net_amount,
        totalResults: row.total_results,
        activePlayers: row.active_players,
        asOf,
      });
    },

    async getAdminGames(): Promise<AdminGamesData> {
      const asOf = clock().toISOString();
      const parsed = parseRows(
        AdminGameRowSchema,
        await rpcRows(
          client,
          MetaRpcNames.adminGames,
          AdminAggregateRpcParamsSchema.parse({ p_as_of: asOf }),
        ),
      );
      return AdminGamesDataSchema.parse({
        games: parsed.map((row) => ({
          game: row.game,
          totalWagered: row.total_wagered,
          totalPayout: row.total_payout,
          netAmount: row.net_amount,
          totalResults: row.total_results,
          wins: row.wins,
          biggestWin: row.biggest_win,
          rtp: row.rtp,
          winRate: row.win_rate,
        })),
        asOf,
      });
    },

    async getAdminUsers(input: { limit: number; cursor?: string }): Promise<AdminUsersData> {
      const limit = PageLimitSchema.parse(input.limit);
      const cursor = input.cursor ? decodeAdminUsersCursor(input.cursor) : null;
      let query = from(client, 'users')
        .select(ADMIN_USER_SELECT)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);
      if (cursor)
        query = query.or(
          `updated_at.lt.${cursor.updatedAt},and(updated_at.eq.${cursor.updatedAt},id.lt.${cursor.id})`,
        );
      const parsed = parseRows(AdminUserRowSchema, await rows(query));
      if (parsed.length > limit + 1) throw dataError();
      const hasMore = parsed.length > limit;
      const users = parsed.slice(0, limit);
      const last = users.at(-1);
      return AdminUsersDataSchema.parse({
        users,
        nextCursor:
          hasMore && last
            ? encodeAdminUsersCursor({ updatedAt: last.updatedAt, id: last.id })
            : null,
        hasMore,
      });
    },
  };
}
