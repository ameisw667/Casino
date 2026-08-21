import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  buildPlayerRecapMessage,
  playerRecapPayloadSchema,
  previousSevenDaysUtcRange,
} from '../../../trigger/send-player-recap';

describe('Player Weekly Recap logic and formatters', () => {
  it('calculates 7-day UTC date range correctly', () => {
    const ref = new Date('2026-08-21T12:00:00.000Z');
    const range = previousSevenDaysUtcRange(ref);
    expect(range.start).toBe('2026-08-14T12:00:00.000Z');
    expect(range.end).toBe('2026-08-21T12:00:00.000Z');
    expect(range.label).toBe('08.14 - 08.21');
  });

  it('builds positive profit recap message with trend indicator', () => {
    const bets = [
      { game: 'slots', wager: 50, payout: 120 },
      { game: 'slots', wager: 20, payout: 0 },
    ];
    const msg = buildPlayerRecapMessage('08.14 - 08.21', bets);
    expect(msg).toContain('🎰 Dein Casino-Wochenrückblick (08.14 - 08.21)');
    expect(msg).toContain('Bets: 2');
    expect(msg).toContain('Einsatz: $70.00');
    expect(msg).toContain('Auszahlung: $120.00');
    expect(msg).toContain('Ergebnis: +$50.00 📈');
    expect(msg).toContain('Lieblingsspiel: slots');
  });

  it('builds loss recap message with trend indicator', () => {
    const bets = [
      { game: 'roulette', wager: 100, payout: 0 },
      { game: 'blackjack', wager: 30, payout: 30 },
    ];
    const msg = buildPlayerRecapMessage('08.14 - 08.21', bets);
    expect(msg).toContain('🎰 Dein Casino-Wochenrückblick (08.14 - 08.21)');
    expect(msg).toContain('Bets: 2');
    expect(msg).toContain('Einsatz: $130.00');
    expect(msg).toContain('Auszahlung: $30.00');
    expect(msg).toContain('Ergebnis: -$100.00 📉');
    expect(msg).toContain('Lieblingsspiel: roulette');
  });

  it('validates playerRecapPayloadSchema accurately', () => {
    const valid = { userId: 'usr_123', chatId: 987654321 };
    expect(playerRecapPayloadSchema.safeParse(valid).success).toBe(true);

    const invalid = { userId: '', chatId: 'not-a-number' };
    expect(playerRecapPayloadSchema.safeParse(invalid).success).toBe(false);
  });
});
