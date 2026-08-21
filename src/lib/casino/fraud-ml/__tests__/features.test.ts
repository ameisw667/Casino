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
          total_wagered: 1000,
          avg_bet_size: 23.8,
          bet_size_cv: 0.4,
          rtp: 0.97,
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
        totalWagered: 1000,
        avgBetSize: 23.8,
        betSizeCv: 0.4,
        rtp: 0.97,
        interBetSecondsCv: 0.1,
        uniqueGames: 3,
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
      totalWagered: 2,
      avgBetSize: 3,
      betSizeCv: 4,
      rtp: 5,
      interBetSecondsCv: 6,
      uniqueGames: 7,
    };

    expect(toFeatureVector(row)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(FEATURE_ORDER).toHaveLength(7);
  });
});
