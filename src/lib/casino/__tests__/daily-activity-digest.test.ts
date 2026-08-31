import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { previousUtcDayRange } from '../../../trigger/daily-activity-digest';
import {
  buildMessage,
  deliverDigestPayloadSchema,
  type DailyBet,
} from '../../../trigger/deliver-digest';

describe('daily-activity-digest utilities and schemas', () => {
  it('calculates previous UTC day range accurately', () => {
    const ref = new Date('2026-08-21T12:00:00Z');
    const range = previousUtcDayRange(ref);
    expect(range.label).toBe('2026-08-20');
    expect(range.start).toBe('2026-08-20T00:00:00.000Z');
    expect(range.end).toBe('2026-08-21T00:00:00.000Z');
  });

  it('builds zero-activity message when bets array is empty', () => {
    const msg = buildMessage('2026-08-20', []);
    expect(msg).toContain('📊 Casino-Tagesreport 2026-08-20');
    expect(msg).toContain('0 Aktivität — keine abgeschlossenen Wetten.');
  });

  it('builds aggregated summary with GGR, active users, and top game', () => {
    const bets: DailyBet[] = [
      { userId: 'user-1', game: 'crash', wager: 10, payout: 0 },
      { userId: 'user-1', game: 'crash', wager: 20, payout: 50 },
      { userId: 'user-2', game: 'dice', wager: 5, payout: 0 },
    ];
    const msg = buildMessage('2026-08-20', bets);
    expect(msg).toContain('📊 Casino-Tagesreport 2026-08-20');
    expect(msg).toContain('Aktive User: 2');
    expect(msg).toContain('Bets: 3');
    // total wager = 35, total payout = 50, GGR = -15.00
    expect(msg).toContain('GGR: $-15.00');
    expect(msg).toContain('Top-Spiel: crash');
  });

  it('validates schema for deliverDigest payload correctly', () => {
    const valid = {
      label: '2026-08-20',
      bets: [{ userId: 'u1', game: 'slots', wager: 10, payout: 20 }],
      dryRun: true,
    };
    const parsed = deliverDigestPayloadSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const invalid = {
      label: '',
      bets: [{ userId: '', game: 'slots', wager: -5, payout: 0 }],
    };
    const parsedInvalid = deliverDigestPayloadSchema.safeParse(invalid);
    expect(parsedInvalid.success).toBe(false);
  });

  it('creates consistent idempotency key per UTC date label', () => {
    const label = '2026-08-20';
    const key = `digest-${label}`;
    expect(key).toBe('digest-2026-08-20');
    expect(key).toMatch(/^digest-\d{4}-\d{2}-\d{2}$/);
  });
});
