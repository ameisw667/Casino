import { describe, it, expect, beforeAll } from 'vitest';
import {
  buildProfitSeries,
  buildDailyActivity,
  getFavoriteGame,
  type HistoryRow,
  type PerGameStat,
} from '../stats-derivation';

// buildDailyActivity groups by the local calendar day (intentional — a session
// spanning 11pm-1am should read as "today" to the user, not split at UTC
// midnight). Pin the test process to UTC so day-boundary assertions below are
// deterministic regardless of the machine running the suite.
beforeAll(() => {
  process.env.TZ = 'UTC';
});

function makeRow(overrides: Partial<HistoryRow> = {}): HistoryRow {
  return {
    id: 'row-1',
    game: 'dice',
    type: 'bet_settled',
    amount: 0,
    balance_after: 1000,
    created_at: '2026-08-10T12:00:00.000Z',
    ...overrides,
  };
}

describe('buildProfitSeries', () => {
  it('returns an empty series for no rows', () => {
    expect(buildProfitSeries([])).toEqual([]);
  });

  it('cumulates net amount in chronological order from newest-first input', () => {
    // /api/user/history returns newest-first (DESC created_at)
    const rows: HistoryRow[] = [
      makeRow({ id: '3', amount: 50, created_at: '2026-08-10T12:00:00.000Z' }),
      makeRow({ id: '2', amount: -20, created_at: '2026-08-10T11:00:00.000Z' }),
      makeRow({ id: '1', amount: 100, created_at: '2026-08-10T10:00:00.000Z' }),
    ];
    const series = buildProfitSeries(rows);
    expect(series.map((p) => p.cumulativeProfit)).toEqual([100, 80, 130]);
    expect(series.map((p) => p.time)).toEqual([
      '2026-08-10T10:00:00.000Z',
      '2026-08-10T11:00:00.000Z',
      '2026-08-10T12:00:00.000Z',
    ]);
  });

  it('nets a CRASH round split across round_started debit and round_settled credit', () => {
    // Mirrors migration 007/014: start_game_round writes -bet, settle_game_round writes +payout.
    const rows: HistoryRow[] = [
      makeRow({
        id: '2',
        type: 'round_settled',
        amount: 25,
        created_at: '2026-08-10T09:01:00.000Z',
      }),
      makeRow({
        id: '1',
        type: 'round_started',
        amount: -10,
        created_at: '2026-08-10T09:00:00.000Z',
      }),
    ];
    const series = buildProfitSeries(rows);
    expect(series.at(-1)?.cumulativeProfit).toBe(15);
  });

  it('rounds to 2 decimals to avoid floating point drift', () => {
    const rows: HistoryRow[] = [makeRow({ amount: 0.1 }), makeRow({ amount: 0.2 })];
    expect(buildProfitSeries(rows).at(-1)?.cumulativeProfit).toBe(0.3);
  });
});

describe('buildDailyActivity', () => {
  it('returns an empty list for no rows', () => {
    expect(buildDailyActivity([])).toEqual([]);
  });

  it('groups rows by calendar day and computes the first-to-last bet span', () => {
    const rows: HistoryRow[] = [
      makeRow({ created_at: '2026-08-10T10:00:00.000Z' }),
      makeRow({ created_at: '2026-08-10T10:30:00.000Z' }),
      makeRow({ created_at: '2026-08-09T20:00:00.000Z' }),
    ];
    const activity = buildDailyActivity(rows);
    expect(activity).toHaveLength(2);
    const day10 = activity.find((a) => a.date === '2026-08-10');
    expect(day10?.spanMinutes).toBe(30);
    expect(day10?.betCount).toBe(2);
  });

  it('reports a 0-minute span for a single isolated bet in a day', () => {
    const activity = buildDailyActivity([makeRow({ created_at: '2026-08-10T10:00:00.000Z' })]);
    expect(activity[0]?.spanMinutes).toBe(0);
  });

  it('caps the span so an idle tab left open overnight does not look like a real session', () => {
    const rows: HistoryRow[] = [
      makeRow({ created_at: '2026-08-10T00:01:00.000Z' }),
      makeRow({ created_at: '2026-08-10T23:59:00.000Z' }),
    ];
    const activity = buildDailyActivity(rows, 240);
    expect(activity[0]?.spanMinutes).toBe(240);
  });

  it('excludes bonus/purchase rows (game === null) from activity grouping', () => {
    const rows: HistoryRow[] = [
      makeRow({ game: null, type: 'bonus', amount: 100, created_at: '2026-08-10T10:00:00.000Z' }),
    ];
    expect(buildDailyActivity(rows)).toEqual([]);
  });
});

describe('getFavoriteGame', () => {
  const stat = (overrides: Partial<PerGameStat> = {}): PerGameStat => ({
    game: 'crash',
    bets: 10,
    wins: 5,
    wagered: 100,
    payout: 90,
    profit: -10,
    winRate: 50,
    ...overrides,
  });

  it('returns null when perGame is empty', () => {
    expect(getFavoriteGame([])).toBeNull();
  });

  it('returns the first entry, trusting the RPC-provided wagered DESC order', () => {
    const perGame = [stat({ game: 'crash', wagered: 500 }), stat({ game: 'dice', wagered: 100 })];
    expect(getFavoriteGame(perGame)?.game).toBe('crash');
  });
});
