import { describe, expect, it } from 'vitest';
import { getTimeUntilNextReset } from '../LeaderboardWeeklyBanner';

describe('LeaderboardWeeklyBanner - Countdown Calculation', () => {
  it('calculates remaining time until next Sunday 23:59:59 UTC correctly on Monday', () => {
    // 2026-08-24 is a Monday (UTCDay 1) 12:00:00 UTC
    const monday = new Date('2026-08-24T12:00:00.000Z');
    const result = getTimeUntilNextReset(monday);

    // Days until Sunday: 6 days (from Monday 12:00 to Sunday 23:59:59 is 6 days, 11 hours, 59 mins, 59 secs)
    expect(result.days).toBe(6);
    expect(result.hours).toBe(11);
    expect(result.minutes).toBe(59);
    expect(result.seconds).toBe(59);
    expect(result.totalSeconds).toBeGreaterThan(0);
  });

  it('calculates remaining time until Sunday 23:59:59 UTC when currently on Sunday morning', () => {
    // 2026-08-30 is Sunday (UTCDay 0) 10:00:00 UTC
    const sundayMorning = new Date('2026-08-30T10:00:00.000Z');
    const result = getTimeUntilNextReset(sundayMorning);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(13);
    expect(result.minutes).toBe(59);
    expect(result.seconds).toBe(59);
  });

  it('returns positive totalSeconds for any valid timestamp', () => {
    const now = new Date();
    const result = getTimeUntilNextReset(now);
    expect(result.totalSeconds).toBeGreaterThanOrEqual(0);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.days).toBeLessThanOrEqual(7);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeLessThan(24);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeLessThan(60);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
    expect(result.seconds).toBeLessThan(60);
  });
});
