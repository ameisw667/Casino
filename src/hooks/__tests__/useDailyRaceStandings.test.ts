import { describe, expect, it } from 'vitest';
import { formatCountdown } from '../useDailyRaceStandings';

describe('formatCountdown', () => {
  it('formats zero as 00h 00m 00s', () => {
    expect(formatCountdown(0)).toBe('00h 00m 00s');
  });

  it('formats a mixed duration with zero-padding', () => {
    // 4h 22m 10s = 4*3600 + 22*60 + 10 = 15730
    expect(formatCountdown(15_730)).toBe('04h 22m 10s');
  });

  it('formats a full day', () => {
    expect(formatCountdown(86_400)).toBe('24h 00m 00s');
  });

  it('formats single-digit minutes and seconds with padding', () => {
    // 1h 1m 1s = 3661
    expect(formatCountdown(3_661)).toBe('01h 01m 01s');
  });
});
