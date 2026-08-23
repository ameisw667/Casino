import { describe, expect, it } from 'vitest';
import { parseSettledBets } from '../analytics-source';

describe('parseSettledBets', () => {
  it('maps settled wallet_transactions rows into SettledBet entries', () => {
    const bets = parseSettledBets(
      [
        {
          user_id: 'user-1',
          type: 'bet_settled',
          created_at: '2026-08-10T12:00:00.000Z',
          metadata: { response: { result: { amount: 10, payout: 25 } } },
        },
      ],
      [],
    );

    expect(bets).toEqual([
      { userId: 'user-1', occurredAt: '2026-08-10T12:00:00.000Z', wager: 10, payout: 25 },
    ]);
  });

  it('ignores wallet_transactions rows that are not bet_settled or have unparseable metadata', () => {
    const bets = parseSettledBets(
      [
        {
          user_id: 'user-1',
          type: 'deposit',
          created_at: '2026-08-10T12:00:00.000Z',
          metadata: { response: { result: { amount: 10, payout: 25 } } },
        },
        {
          user_id: 'user-2',
          type: 'bet_settled',
          created_at: '2026-08-10T12:00:00.000Z',
          metadata: { malformed: true },
        },
      ],
      [],
    );

    expect(bets).toEqual([]);
  });

  it('maps SETTLED game_rounds rows into SettledBet entries', () => {
    const bets = parseSettledBets(
      [],
      [
        {
          user_id: 'user-3',
          status: 'SETTLED',
          bet_amount: 5,
          updated_at: '2026-08-11T09:00:00.000Z',
          state: { result: { payout: 12 } },
        },
      ],
    );

    expect(bets).toEqual([
      { userId: 'user-3', occurredAt: '2026-08-11T09:00:00.000Z', wager: 5, payout: 12 },
    ]);
  });

  it('ignores game_rounds rows that are not SETTLED or have unparseable state', () => {
    const bets = parseSettledBets(
      [],
      [
        {
          user_id: 'user-3',
          status: 'IN_PROGRESS',
          bet_amount: 5,
          updated_at: '2026-08-11T09:00:00.000Z',
          state: { result: { payout: 12 } },
        },
        {
          user_id: 'user-4',
          status: 'SETTLED',
          bet_amount: 5,
          updated_at: '2026-08-11T09:00:00.000Z',
          state: {},
        },
      ],
    );

    expect(bets).toEqual([]);
  });

  it('combines wallet and round bets in order', () => {
    const bets = parseSettledBets(
      [
        {
          user_id: 'user-1',
          type: 'bet_settled',
          created_at: '2026-08-10T12:00:00.000Z',
          metadata: { response: { result: { amount: 10, payout: 25 } } },
        },
      ],
      [
        {
          user_id: 'user-3',
          status: 'SETTLED',
          bet_amount: 5,
          updated_at: '2026-08-11T09:00:00.000Z',
          state: { result: { payout: 12 } },
        },
      ],
    );

    expect(bets).toEqual([
      { userId: 'user-1', occurredAt: '2026-08-10T12:00:00.000Z', wager: 10, payout: 25 },
      { userId: 'user-3', occurredAt: '2026-08-11T09:00:00.000Z', wager: 5, payout: 12 },
    ]);
  });
});
