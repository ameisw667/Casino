import { describe, expect, it } from 'vitest';
import type { HistoryRow } from '../HistoryTableStream';
import { flattenSessionGroups, groupRowsIntoSessions } from '../useHistorySessionGroups';

function row(overrides: Partial<HistoryRow>): HistoryRow {
  return {
    id: 'row-1',
    game: 'dice',
    type: 'bet',
    amount: 10,
    balance_after: 100,
    created_at: '2026-09-14T10:00:00.000Z',
    ...overrides,
  };
}

describe('groupRowsIntoSessions', () => {
  it('returns an empty array for an empty list', () => {
    expect(groupRowsIntoSessions([])).toEqual([]);
  });

  it('puts a single row into a single session with correct aggregates', () => {
    const rows = [row({ id: 'a', amount: 25 })];

    const groups = groupRowsIntoSessions(rows);

    expect(groups).toHaveLength(1);
    expect(groups[0].rows).toHaveLength(1);
    expect(groups[0].totalBets).toBe(1);
    expect(groups[0].netProfit).toBe(25);
  });

  it('keeps rows within 25 minutes in the same session', () => {
    const rows = [
      row({ id: 'a', amount: 10, created_at: '2026-09-14T10:00:00.000Z' }),
      row({ id: 'b', amount: -5, created_at: '2026-09-14T10:20:00.000Z' }),
    ];

    const groups = groupRowsIntoSessions(rows);

    expect(groups).toHaveLength(1);
    expect(groups[0].rows.map((r) => r.id)).toEqual(['a', 'b']);
    expect(groups[0].totalBets).toBe(2);
    expect(groups[0].netProfit).toBe(5);
  });

  it('splits into a new session when the gap exceeds 25 minutes', () => {
    const rows = [
      row({ id: 'a', amount: 10, created_at: '2026-09-14T10:00:00.000Z' }),
      row({ id: 'b', amount: 20, created_at: '2026-09-14T10:26:00.000Z' }),
    ];

    const groups = groupRowsIntoSessions(rows);

    expect(groups).toHaveLength(2);
    expect(groups[0].rows.map((r) => r.id)).toEqual(['a']);
    expect(groups[1].rows.map((r) => r.id)).toEqual(['b']);
  });

  it('aggregates totalBets and netProfit across mixed wins and losses', () => {
    const rows = [
      row({ id: 'a', amount: 50, created_at: '2026-09-14T10:00:00.000Z' }),
      row({ id: 'b', amount: -20, created_at: '2026-09-14T10:05:00.000Z' }),
      row({ id: 'c', amount: -10, created_at: '2026-09-14T10:10:00.000Z' }),
    ];

    const groups = groupRowsIntoSessions(rows);

    expect(groups).toHaveLength(1);
    expect(groups[0].totalBets).toBe(3);
    expect(groups[0].netProfit).toBe(20);
  });
});

describe('flattenSessionGroups', () => {
  it('returns an empty list for no groups', () => {
    expect(flattenSessionGroups([])).toEqual([]);
  });

  it('produces one header item followed by one row item per row, in order', () => {
    const rows = [
      row({ id: 'a', created_at: '2026-09-14T10:00:00.000Z' }),
      row({ id: 'b', created_at: '2026-09-14T10:05:00.000Z' }),
    ];
    const groups = groupRowsIntoSessions(rows);

    const items = flattenSessionGroups(groups);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ type: 'header', group: groups[0] });
    expect(items[1]).toMatchObject({ type: 'row', row: rows[0] });
    expect(items[2]).toMatchObject({ type: 'row', row: rows[1] });
  });

  it('emits a header for each session group when there are multiple sessions', () => {
    const rows = [
      row({ id: 'a', created_at: '2026-09-14T10:00:00.000Z' }),
      row({ id: 'b', created_at: '2026-09-14T10:30:00.000Z' }),
    ];
    const groups = groupRowsIntoSessions(rows);

    const items = flattenSessionGroups(groups);

    expect(items.filter((i) => i.type === 'header')).toHaveLength(2);
    expect(items.filter((i) => i.type === 'row')).toHaveLength(2);
  });
});
