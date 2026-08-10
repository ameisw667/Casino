import { describe, expect, it } from 'vitest';

import { decodeLeaderboardCursor, encodeLeaderboardCursor } from '../cursor';
import { decimalToSafeCents } from '../contracts';
import { createMetaRepository } from '../repository';

type RpcResponse = { data: Record<string, unknown>[] | null; error: { message: string } | null };

class RpcClientStub {
  readonly calls: Array<{ name: string; params: Record<string, unknown> }> = [];

  constructor(private readonly responses: Record<string, RpcResponse[]>) {}

  from(table: string): never {
    throw new Error(`Unbounded table access forbidden: ${table}`);
  }

  rpc(name: string, params: Record<string, unknown>): PromiseLike<RpcResponse> {
    this.calls.push({ name, params });
    const response = this.responses[name]?.shift();
    if (!response) throw new Error(`No RPC response configured for ${name}`);
    return Promise.resolve(response);
  }
}

const playerKey = 'a'.repeat(64);
const asOf = '2026-08-06T12:00:00.000Z';
const periodStart = '2026-07-30T12:00:00.000Z';

describe('review fixes', () => {
  it('binds leaderboard cursors to period, metric, and a fixed snapshot', () => {
    const cursor = encodeLeaderboardCursor({
      period: 'weekly',
      metric: 'wagered',
      asOf,
      periodStart,
      value: '10.00',
      playerKey,
    });

    expect(decodeLeaderboardCursor(cursor, { period: 'weekly', metric: 'wagered' })).toEqual({
      period: 'weekly',
      metric: 'wagered',
      asOf,
      periodStart,
      value: '10.00',
      playerKey,
    });
    expect(() => decodeLeaderboardCursor(cursor, { period: 'daily', metric: 'wagered' })).toThrow(
      'Invalid cursor',
    );
    expect(() =>
      decodeLeaderboardCursor(cursor, { period: 'weekly', metric: 'biggest-win' }),
    ).toThrow('Invalid cursor');
  });

  it('rejects cursor snapshots with a period-inconsistent or inverted time range', () => {
    expect(() =>
      encodeLeaderboardCursor({
        period: 'weekly',
        metric: 'wagered',
        asOf,
        periodStart: null,
        value: '10.00',
        playerKey,
      }),
    ).toThrow();
    expect(() =>
      encodeLeaderboardCursor({
        period: 'all-time',
        metric: 'wagered',
        asOf,
        periodStart,
        value: '10.00',
        playerKey,
      }),
    ).toThrow();
    expect(() =>
      encodeLeaderboardCursor({
        period: 'weekly',
        metric: 'wagered',
        asOf,
        periodStart: '2026-08-07T12:00:00.000Z',
        value: '10.00',
        playerKey,
      }),
    ).toThrow();
  });
  it('uses a bounded DB aggregate RPC and reuses the cursor snapshot as time rolls forward', async () => {
    const firstClient = new RpcClientStub({
      meta_leaderboard_page: [
        {
          data: [
            {
              rank: 1,
              public_name: 'One',
              avatar_url: null,
              metric_value: '20.00',
              wagered_amount: '20.00',
              biggest_win_amount: '20.00',
              highest_multiplier: '2.0000',
              player_key: playerKey,
            },
            {
              rank: 2,
              public_name: 'Two',
              avatar_url: null,
              metric_value: '10.00',
              wagered_amount: '10.00',
              biggest_win_amount: '10.00',
              highest_multiplier: '1.0000',
              player_key: 'b'.repeat(64),
            },
          ],
          error: null,
        },
      ],
    });
    const first = await createMetaRepository(firstClient, () => new Date(asOf)).getLeaderboard({
      period: 'weekly',
      metric: 'wagered',
      limit: 1,
    });
    const secondClient = new RpcClientStub({ meta_leaderboard_page: [{ data: [], error: null }] });

    await createMetaRepository(
      secondClient,
      () => new Date('2026-08-07T12:00:00.000Z'),
    ).getLeaderboard({
      period: 'weekly',
      metric: 'wagered',
      limit: 1,
      cursor: first.nextCursor!,
    });

    expect(firstClient.calls).toEqual([
      {
        name: 'meta_leaderboard_page',
        params: {
          p_period_start: periodStart,
          p_as_of: asOf,
          p_metric: 'wagered',
          p_limit: 2,
          p_cursor_value: null,
          p_cursor_player_key: null,
        },
      },
    ]);
    expect(secondClient.calls[0].params).toMatchObject({
      p_period_start: periodStart,
      p_as_of: asOf,
    });
  });

  it('uses DB-side RPC contracts for admin aggregates', async () => {
    const client = new RpcClientStub({
      meta_admin_overview: [
        {
          data: [
            {
              total_wagered: '10.00',
              total_payout: '12.00',
              net_amount: '2.00',
              total_results: 2,
              active_players: 1,
            },
          ],
          error: null,
        },
      ],
      meta_admin_games: [
        {
          data: [
            {
              game: 'dice',
              total_wagered: '10.00',
              total_payout: '12.00',
              net_amount: '2.00',
              total_results: 2,
              wins: 1,
              biggest_win: '12.00',
              rtp: '120.0000',
              win_rate: '50.0000',
            },
          ],
          error: null,
        },
      ],
    });
    const repository = createMetaRepository(client, () => new Date(asOf));

    await repository.getAdminOverview();
    await repository.getAdminGames();

    expect(client.calls.map((call) => call.name)).toEqual([
      'meta_admin_overview',
      'meta_admin_games',
    ]);
    expect(client.calls.every((call) => call.params.p_as_of === asOf)).toBe(true);
  });

  it('describes hash presence without claiming cryptographic verification', async () => {
    const resultId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const userId = 'user_legacy_123';
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      limit: () => query,
      then: (resolve: (value: RpcResponse) => unknown) =>
        Promise.resolve(
          resolve({
            data: [
              {
                id: resultId,
                game: 'dice',
                wager_amount: '0.10',
                payout_amount: '0.20',
                net_amount: '0.10',
                multiplier: '2.0000',
                outcome: 'win',
                server_seed_hash: 'f'.repeat(64),
                settled_at: asOf,
              },
            ],
            error: null,
          }),
        ),
    };
    const client = { from: () => query };

    const page = await createMetaRepository(client).getHistory({ userId, limit: 25 });

    expect(page.items[0].verification).toEqual({
      status: 'hash-available',
      serverSeedHash: 'f'.repeat(64),
    });
    expect(page).toHaveProperty('pageSummary');
    expect(page).not.toHaveProperty('summary');
  });

  it('keeps decimal money exact and converts only safe two-decimal values to cents', () => {
    expect(decimalToSafeCents('0.10')).toBe(10);
    expect(decimalToSafeCents('90071992547409.91')).toBe(9_007_199_254_740_991);
    expect(() => decimalToSafeCents('90071992547409.92')).toThrow('safe cents');
    expect(() => decimalToSafeCents('1.001')).toThrow('two decimal places');
  });
});
