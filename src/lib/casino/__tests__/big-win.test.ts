import { describe, expect, it } from 'vitest';
import { isBigWin, BIG_WIN_MULTIPLIER_THRESHOLD, BIG_WIN_PAYOUT_THRESHOLD } from '../big-win';

describe('isBigWin', () => {
  it('returns false below both thresholds', () => {
    expect(isBigWin({ payout: 10, multiplier: 2 })).toBe(false);
  });

  it('returns true at the multiplier threshold regardless of payout', () => {
    expect(isBigWin({ payout: 1, multiplier: BIG_WIN_MULTIPLIER_THRESHOLD })).toBe(true);
  });

  it('returns true above the multiplier threshold', () => {
    expect(isBigWin({ payout: 1, multiplier: BIG_WIN_MULTIPLIER_THRESHOLD + 5 })).toBe(true);
  });

  it('returns true at the payout threshold regardless of multiplier', () => {
    expect(isBigWin({ payout: BIG_WIN_PAYOUT_THRESHOLD, multiplier: 1 })).toBe(true);
  });

  it('returns true above the payout threshold', () => {
    expect(isBigWin({ payout: BIG_WIN_PAYOUT_THRESHOLD + 1, multiplier: 1 })).toBe(true);
  });

  it('returns false just below both thresholds', () => {
    expect(
      isBigWin({
        payout: BIG_WIN_PAYOUT_THRESHOLD - 1,
        multiplier: BIG_WIN_MULTIPLIER_THRESHOLD - 1,
      }),
    ).toBe(false);
  });
});
