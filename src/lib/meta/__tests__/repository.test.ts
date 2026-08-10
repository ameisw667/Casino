import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { decodeHistoryCursor, encodeHistoryCursor, encodeLeaderboardCursor } from '../cursor';
import { createMetaRepository, MetaRepositoryError, type MetaQueryClient } from '../repository';

function acceptsSupabaseClient(client: SupabaseClient) {
  const compatible: MetaQueryClient = client;
  return createMetaRepository(compatible);
}
void acceptsSupabaseClient;

type Row = Record<string, unknown>;
type Response = { data: Row[] | null; error: { message: string } | null };

class QueryStub implements PromiseLike<Response> {
  readonly calls: Array<[string, ...unknown[]]> = [];
  constructor(private readonly response: Response) {}
  select(columns: string) {
    this.calls.push(['select', columns]);
    return this;
  }
  eq(column: string, value: unknown) {
    this.calls.push(['eq', column, value]);
    return this;
  }
  or(value: string) {
    this.calls.push(['or', value]);
    return this;
  }
  order(column: string, options: unknown) {
    this.calls.push(['order', column, options]);
    return this;
  }
  limit(value: number) {
    this.calls.push(['limit', value]);
    return this;
  }
  then<TResult1 = Response, TResult2 = never>(
    onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

class ClientStub {
  readonly queries = new Map<string, QueryStub[]>();
  readonly rpcCalls: Array<{ name: string; params: Record<string, unknown> }> = [];
  constructor(
    private readonly tableResponses: Record<string, Response[]> = {},
    private readonly rpcResponses: Record<string, Response[]> = {},
  ) {}
  from(table: string) {
    const response = this.tableResponses[table]?.shift();
    if (!response) throw new Error(`No table response configured for ${table}`);
    const query = new QueryStub(response);
    this.queries.set(table, [...(this.queries.get(table) ?? []), query]);
    return query;
  }
  rpc(name: string, params: Record<string, unknown>): PromiseLike<Response> {
    this.rpcCalls.push({ name, params });
    const response = this.rpcResponses[name]?.shift();
    if (!response) throw new Error(`No RPC response configured for ${name}`);
    return Promise.resolve(response);
  }
}

const ids = {
  user: 'user_legacy_123',
  resultA: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  resultB: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
};

function historyRow(overrides: Partial<Row> = {}): Row {
  return {
    id: ids.resultA,
    game: 'dice',
    wager_amount: '0.10',
    payout_amount: '0.20',
    net_amount: '0.10',
    multiplier: '2.0000',
    outcome: 'win',
    server_seed_hash: null,
    settled_at: '2026-08-06T12:00:00.000Z',
    ...overrides,
  };
}

describe('history cursors', () => {
  it('retains the UUID tie-breaker for identical timestamps', () => {
    const cursor = encodeHistoryCursor({ settledAt: '2026-08-06T12:00:00.000Z', id: ids.resultA });
    expect(decodeHistoryCursor(cursor)).toEqual({
      settledAt: '2026-08-06T12:00:00.000Z',
      id: ids.resultA,
    });
    expect(cursor).not.toContain('2026-08-06');
  });

  it('rejects malformed and cross-kind cursors', () => {
    const leaderboard = encodeLeaderboardCursor({
      period: 'all-time',
      metric: 'wagered',
      asOf: '2026-08-06T12:00:00.000Z',
      periodStart: null,
      value: '10.00',
      playerKey: 'a'.repeat(64),
    });
    expect(() => decodeHistoryCursor('not-base64')).toThrow('Invalid cursor');
    expect(() => decodeHistoryCursor(leaderboard)).toThrow('Invalid cursor');
  });
});

describe('meta repository', () => {
  it('enforces the 1..100 boundary before issuing a query', async () => {
    const client = new ClientStub();
    const repository = createMetaRepository(client);
    await expect(repository.getHistory({ userId: ids.user, limit: 0 })).rejects.toThrow();
    await expect(repository.getHistory({ userId: ids.user, limit: 101 })).rejects.toThrow();
    expect(client.queries.size).toBe(0);
  });

  it('uses a bounded history allowlist and exact page-only decimal summary', async () => {
    const client = new ClientStub({
      game_results: [
        {
          data: [
            historyRow(),
            historyRow({
              id: ids.resultB,
              wager_amount: '0.20',
              payout_amount: '0.10',
              net_amount: '-0.10',
              outcome: 'loss',
            }),
          ],
          error: null,
        },
      ],
    });

    const page = await createMetaRepository(client).getHistory({ userId: ids.user, limit: 2 });

    expect(page.pageSummary).toEqual({
      totalWagered: '0.30',
      totalPayout: '0.30',
      netAmount: '0.00',
      wins: 1,
      total: 2,
    });
    expect(page.items[0]).toMatchObject({
      wagerAmount: '0.10',
      verification: { status: 'unavailable' },
    });
    expect(client.queries.get('game_results')![0].calls).toContainEqual([
      'select',
      'id,game,wager_amount,payout_amount,net_amount,multiplier,outcome,server_seed_hash,settled_at',
    ]);
    expect(JSON.stringify(page)).not.toMatch(/user_id|email|balance/i);
  });

  it('returns a truthful empty history page', async () => {
    const client = new ClientStub({ game_results: [{ data: [], error: null }] });
    await expect(
      createMetaRepository(client).getHistory({ userId: ids.user, limit: 25 }),
    ).resolves.toEqual({
      items: [],
      pageSummary: {
        totalWagered: '0.00',
        totalPayout: '0.00',
        netAmount: '0.00',
        wins: 0,
        total: 0,
      },
      nextCursor: null,
      hasMore: false,
    });
  });

  it('fails closed for database errors and malformed decimal rows', async () => {
    const dbError = new ClientStub({
      game_results: [{ data: null, error: { message: 'secret detail' } }],
    });
    const malformed = new ClientStub({
      game_results: [{ data: [historyRow({ payout_amount: 'NaN' })], error: null }],
    });
    await expect(
      createMetaRepository(dbError).getHistory({ userId: ids.user, limit: 25 }),
    ).rejects.toMatchObject({ code: 'META_DB_ERROR' });
    await expect(
      createMetaRepository(malformed).getHistory({ userId: ids.user, limit: 25 }),
    ).rejects.toBeInstanceOf(MetaRepositoryError);
  });

  it('maps only the public allowlist returned by the opt-in leaderboard RPC', async () => {
    const client = new ClientStub(
      {},
      {
        meta_leaderboard_page: [
          {
            data: [
              {
                rank: '1',
                public_name: 'Public',
                avatar_url: null,
                metric_value: '90071992547409.91',
                wagered_amount: '90071992547409.91',
                biggest_win_amount: '10.00',
                highest_multiplier: '2.0000',
                player_key: 'a'.repeat(64),
                user_id: ids.user,
                email: 'private@example.com',
                balance: '999.00',
              },
            ],
            error: null,
          },
        ],
      },
    );

    const page = await createMetaRepository(
      client,
      () => new Date('2026-08-06T12:00:00.000Z'),
    ).getLeaderboard({ period: 'all-time', metric: 'wagered', limit: 25 });
    const serialized = JSON.stringify(page);

    expect(page.entries).toEqual([
      {
        rank: 1,
        publicName: 'Public',
        avatarUrl: null,
        metricValue: '90071992547409.91',
        wageredAmount: '90071992547409.91',
        biggestWinAmount: '10.00',
        highestMultiplier: '2.0000',
      },
    ]);
    expect(serialized).not.toMatch(/user_id|email|balance/i);
    expect(client.queries.size).toBe(0);
    expect(client.rpcCalls[0]).toMatchObject({
      name: 'meta_leaderboard_page',
      params: { p_limit: 26 },
    });
  });

  it('uses an explicit bounded admin-user allowlist', async () => {
    const user = (id: string, updatedAt: string): Row => ({
      id,
      username: 'Player',
      email: 'player@example.com',
      balance: '125.50',
      xp: '100',
      level: 2,
      rank: 'Bronze',
      status: 'active',
      created_at: '2026-08-01T12:00:00.000Z',
      updated_at: updatedAt,
      password_hash: 'excluded',
    });
    const client = new ClientStub({
      users: [
        {
          data: [
            user(ids.user, '2026-08-06T12:00:00.000Z'),
            user('user_second', '2026-08-05T12:00:00.000Z'),
          ],
          error: null,
        },
      ],
    });

    const data = await createMetaRepository(client).getAdminUsers({ limit: 1 });

    expect(data.users[0]).toMatchObject({ id: ids.user, balanceAmount: '125.50', xp: 100 });
    expect(JSON.stringify(data)).not.toContain('password_hash');
    expect(data.nextCursor).toBeTypeOf('string');
    expect(client.queries.get('users')![0].calls).toContainEqual([
      'select',
      'id,username,email,balance,xp,level,rank,status,created_at,updated_at',
    ]);
    expect(client.queries.get('users')![0].calls).toContainEqual(['limit', 2]);
  });
});
