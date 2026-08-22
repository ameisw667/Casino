import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FEATURE_ORDER, fetchFraudMlFeatures, toFeatureVector } from '../features';

function makeClient(rpcResult: { data: unknown; error: unknown }): SupabaseClient {
  return { rpc: vi.fn().mockResolvedValue(rpcResult) } as unknown as SupabaseClient;
}

describe('fetchFraudMlFeatures', () => {
  it('maps snake_case RPC rows to camelCase feature rows', async () => {
    const client = makeClient({
      data: [
        {
          user_id: 'user_a',
          bet_count: 42,
          net_result: 150.5,
          avg_abs_amount: 23.8,
          amount_cv: 0.4,
          win_rate: 0.55,
          inter_bet_seconds_cv: 0.1,
          unique_games: 3,
        },
      ],
      error: null,
    });

    const rows = await fetchFraudMlFeatures(client);

    expect(rows).toEqual([
      {
        userId: 'user_a',
        betCount: 42,
        netResult: 150.5,
        avgAbsAmount: 23.8,
        amountCv: 0.4,
        winRate: 0.55,
        interBetSecondsCv: 0.1,
        uniqueGames: 3,
      },
    ]);
  });

  it('coerces PostgREST NUMERIC-as-string values and falls back to 0 for non-finite input', async () => {
    const client = makeClient({
      data: [
        {
          user_id: 'user_b',
          bet_count: 25,
          net_result: '-42.50',
          avg_abs_amount: '10.00',
          amount_cv: null,
          win_rate: '0.40',
          inter_bet_seconds_cv: undefined,
          unique_games: 2,
        },
      ],
      error: null,
    });

    const rows = await fetchFraudMlFeatures(client);

    expect(rows).toEqual([
      {
        userId: 'user_b',
        betCount: 25,
        netResult: -42.5,
        avgAbsAmount: 10,
        amountCv: 0,
        winRate: 0.4,
        interBetSecondsCv: 0,
        uniqueGames: 2,
      },
    ]);
  });

  it('returns an empty array and does not throw when the RPC errors', async () => {
    const client = makeClient({ data: null, error: { message: 'boom' } });
    const rows = await fetchFraudMlFeatures(client);
    expect(rows).toEqual([]);
  });

  it('returns an empty array when the RPC yields no rows', async () => {
    const client = makeClient({ data: [], error: null });
    const rows = await fetchFraudMlFeatures(client);
    expect(rows).toEqual([]);
  });
});

describe('toFeatureVector', () => {
  it('builds the vector in the fixed FEATURE_ORDER', () => {
    const row = {
      userId: 'user_a',
      betCount: 1,
      netResult: 2,
      avgAbsAmount: 3,
      amountCv: 4,
      winRate: 5,
      interBetSecondsCv: 6,
      uniqueGames: 7,
    };

    expect(toFeatureVector(row)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(FEATURE_ORDER).toHaveLength(7);
  });
});
