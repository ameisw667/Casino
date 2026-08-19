import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { supabaseState } = vi.hoisted(() => ({
  supabaseState: {
    data: null as unknown,
    error: null as { message: string } | null,
    rpcCallCount: 0,
  },
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    rpc: vi.fn(() => {
      supabaseState.rpcCallCount += 1;
      return {
        abortSignal: vi.fn(() =>
          Promise.resolve({ data: supabaseState.data, error: supabaseState.error }),
        ),
      };
    }),
  })),
}));

import {
  loadGuideLeaderboardSnippet,
  resetGuideLeaderboardCacheForTests,
} from '../guide-live-leaderboard';

function row(overrides: Record<string, unknown> = {}) {
  return {
    username: 'PlayerOne',
    level: 12,
    rank: 'GOLD',
    total_wagered: 1234.5,
    ...overrides,
  };
}

beforeEach(() => {
  resetGuideLeaderboardCacheForTests();
  supabaseState.data = null;
  supabaseState.error = null;
  supabaseState.rpcCallCount = 0;
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-08-18T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadGuideLeaderboardSnippet', () => {
  it('returns only username/level/rank/totalWagered, dropping every other RPC field', async () => {
    supabaseState.data = [
      row({ email: 'leak@example.com', user_id: 'u-1', balance: 999, biggest_win: 500 }),
    ];

    const snippet = await loadGuideLeaderboardSnippet();

    expect(snippet).toEqual({
      asOf: '2026-08-18T12:00:00.000Z',
      rows: [{ username: 'PlayerOne', level: 12, rank: 'GOLD', totalWagered: 1234.5 }],
    });
  });

  it('caps at 5 rows even when the RPC returns more', async () => {
    supabaseState.data = Array.from({ length: 50 }, (_, i) => row({ username: `Player${i}` }));

    const snippet = await loadGuideLeaderboardSnippet();

    expect(snippet?.rows).toHaveLength(5);
    expect(snippet?.rows[0]?.username).toBe('Player0');
  });

  it('truncates usernames to 20 characters, matching the public leaderboard route', async () => {
    supabaseState.data = [row({ username: 'A'.repeat(40) })];

    const snippet = await loadGuideLeaderboardSnippet();

    expect(snippet?.rows[0]?.username).toBe('A'.repeat(20));
  });

  it('drops malformed rows instead of inventing safe-looking defaults', async () => {
    supabaseState.data = [
      row({ level: 'not-a-number' }),
      row({ rank: null }),
      row({ total_wagered: -5 }),
      { username: 'OnlyUsername' },
    ];

    const snippet = await loadGuideLeaderboardSnippet();

    expect(snippet).toBeNull();
  });

  it('returns null on an RPC error without throwing', async () => {
    supabaseState.error = { message: 'relation does not exist' };

    await expect(loadGuideLeaderboardSnippet()).resolves.toBeNull();
  });

  it('returns null when the admin client itself throws', async () => {
    const { createAdminClient } = await import('@/utils/supabase/admin');
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('missing service role key');
    });

    await expect(loadGuideLeaderboardSnippet()).resolves.toBeNull();
  });

  it('serves the cached snippet within the 5-minute TTL without a second RPC call', async () => {
    supabaseState.data = [row()];
    const first = await loadGuideLeaderboardSnippet();

    supabaseState.data = [row({ username: 'ShouldNotBeSeen' })];
    vi.setSystemTime(new Date('2026-08-18T12:04:59.000Z'));
    const second = await loadGuideLeaderboardSnippet();

    expect(second).toEqual(first);
  });

  it('refetches once the 5-minute TTL has elapsed', async () => {
    supabaseState.data = [row({ username: 'Fresh' })];
    await loadGuideLeaderboardSnippet();

    supabaseState.data = [row({ username: 'Refetched' })];
    vi.setSystemTime(new Date('2026-08-18T12:05:00.001Z'));
    const refreshed = await loadGuideLeaderboardSnippet();

    expect(refreshed?.rows[0]?.username).toBe('Refetched');
    expect(refreshed?.asOf).toBe('2026-08-18T12:05:00.001Z');
  });

  it('falls back to the last good snippet, correctly re-labelled, when a stale refetch fails', async () => {
    supabaseState.data = [row({ username: 'LastGood' })];
    const first = await loadGuideLeaderboardSnippet();

    supabaseState.error = { message: 'temporary outage' };
    vi.setSystemTime(new Date('2026-08-18T12:05:00.001Z'));
    const duringOutage = await loadGuideLeaderboardSnippet();

    expect(duringOutage).toEqual(first);
  });

  it('never had a good snippet: stays null through a persistent outage', async () => {
    supabaseState.error = { message: 'relation does not exist' };

    await loadGuideLeaderboardSnippet();
    vi.setSystemTime(new Date('2026-08-18T12:10:00.000Z'));

    await expect(loadGuideLeaderboardSnippet()).resolves.toBeNull();
  });

  it('backs off for 30s after a failure instead of retrying the RPC on every request', async () => {
    supabaseState.error = { message: 'temporary outage' };
    await loadGuideLeaderboardSnippet();
    expect(supabaseState.rpcCallCount).toBe(1);

    vi.setSystemTime(new Date('2026-08-18T12:00:15.000Z'));
    await loadGuideLeaderboardSnippet();
    expect(supabaseState.rpcCallCount).toBe(1);

    vi.setSystemTime(new Date('2026-08-18T12:00:31.000Z'));
    await loadGuideLeaderboardSnippet();
    expect(supabaseState.rpcCallCount).toBe(2);
  });
});
