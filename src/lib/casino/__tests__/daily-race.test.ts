import { describe, expect, it } from 'vitest';
import { dailyRaceStandingSchema, secondsUntilNextUtcMidnight } from '../daily-race';

describe('secondsUntilNextUtcMidnight', () => {
  it('returns the exact remaining seconds mid-day', () => {
    const ref = new Date('2026-08-21T12:00:00Z');
    // 12h remaining = 43200s
    expect(secondsUntilNextUtcMidnight(ref)).toBe(43_200);
  });

  it('returns a full day at exact UTC midnight', () => {
    const ref = new Date('2026-08-21T00:00:00Z');
    expect(secondsUntilNextUtcMidnight(ref)).toBe(86_400);
  });

  it('returns a small positive value just before UTC midnight', () => {
    const ref = new Date('2026-08-21T23:59:59Z');
    expect(secondsUntilNextUtcMidnight(ref)).toBe(1);
  });

  it('never returns a negative value', () => {
    const ref = new Date('2026-08-21T23:59:59.999Z');
    expect(secondsUntilNextUtcMidnight(ref)).toBeGreaterThanOrEqual(0);
  });
});

describe('dailyRaceStandingSchema', () => {
  it('accepts a valid standing row', () => {
    const parsed = dailyRaceStandingSchema.safeParse({
      rank: 1,
      username: 'VibeGod_99',
      wagered: 1250.5,
      prize: 5000,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a rank outside 1-3', () => {
    const parsed = dailyRaceStandingSchema.safeParse({
      rank: 4,
      username: 'X',
      wagered: 10,
      prize: 5000,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a negative wagered amount', () => {
    const parsed = dailyRaceStandingSchema.safeParse({
      rank: 1,
      username: 'X',
      wagered: -1,
      prize: 5000,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an empty username', () => {
    const parsed = dailyRaceStandingSchema.safeParse({
      rank: 1,
      username: '',
      wagered: 10,
      prize: 5000,
    });
    expect(parsed.success).toBe(false);
  });
});
