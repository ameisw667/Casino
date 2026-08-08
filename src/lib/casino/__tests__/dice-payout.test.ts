/**
 * TDD tests for Bug #47: Dice Max Bet Overflow (Math.pow Precision)
 *
 * RED phase: these tests are written BEFORE the fix.
 * They must FAIL against the original implementation and
 * PASS after the BigInt-guarded implementation is in place.
 *
 * Scenarios tested:
 *  1. Normal bet (1_000) — baseline correctness
 *  2. Large bet (10_000_000) — was producing NaN / precision loss
 *  3. Extreme bet (999_999_999) — must be capped or produce a valid number
 *  4. Max-bet guard — bets above MAX_BET must throw / be rejected
 *  5. Zero bet — edge case: payout stays 0
 *  6. Multiplier = 0 — win with zero multiplier still pays 0
 *  7. Loss scenario — payout is always 0 on a loss
 */

import { describe, it, expect } from 'vitest';
import {
  MAX_BET,
  calculateDicePayout,
} from '../casino-core';
import { DEFAULT_GAME_CONFIG } from '../game-config';

// ─── 1. Baseline: normal bet ───────────────────────────────────────────────

describe('calculateDicePayout — normal bets', () => {
  it('returns correct payout for bet=1000, multiplier=2 on a win', () => {
    // Arrange
    const bet = 1_000;
    const multiplier = 2;

    // Act
    const payout = calculateDicePayout(bet, multiplier, true);

    // Assert
    expect(payout).toBe(2_000);
    expect(Number.isFinite(payout)).toBe(true);
    expect(payout).toBeGreaterThan(0);
  });

  it('returns 0 payout on a loss regardless of bet size', () => {
    const payout = calculateDicePayout(1_000, 2, false);
    expect(payout).toBe(0);
  });
});

// ─── 2. Large bet — the core bug ───────────────────────────────────────────

describe('calculateDicePayout — large bets (Bug #47)', () => {
  it('returns a positive finite number for bet=10_000_000 with high multiplier', () => {
    // This was producing NaN or imprecise results due to IEEE 754 limits
    // when the old code did: amount * multiplier where both were large floats.
    const bet = 10_000_000;
    const multiplier = 9.9; // near-max dice multiplier

    const payout = calculateDicePayout(bet, multiplier, true);

    expect(Number.isFinite(payout)).toBe(true);
    expect(Number.isNaN(payout)).toBe(false);
    expect(payout).toBeGreaterThan(0);
  });

  it('result for bet=10_000_000, multiplier=2 equals exactly 20_000_000', () => {
    // BigInt arithmetic must produce exact integer results for whole-number multipliers
    const payout = calculateDicePayout(10_000_000, 2, true);
    expect(payout).toBe(20_000_000);
  });

  it('payout is rounded to 2 decimal places (no floating noise)', () => {
    // 1_500_000 * 1.5 = 2_250_000.00 — must not have floating debris
    const payout = calculateDicePayout(1_500_000, 1.5, true);
    expect(payout).toBe(2_250_000);
    // Verify no floating point residue
    const asString = payout.toString();
    const decimals = asString.includes('.') ? asString.split('.')[1].length : 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});

// ─── 3. Extreme bets ───────────────────────────────────────────────────────

describe('calculateDicePayout — extreme bets', () => {
  it('throws RangeError when bet exceeds MAX_BET', () => {
    // Bets above 100_000_000 must be rejected to prevent overflow vectors
    const overLimitBet = MAX_BET + 1;

    expect(() => calculateDicePayout(overLimitBet, 2, true)).toThrow(RangeError);
  });

  it('throws RangeError with a descriptive message when bet exceeds MAX_BET', () => {
    expect(() => calculateDicePayout(MAX_BET + 1, 2, true)).toThrow(
      /exceeds maximum allowed bet/i
    );
  });

  it('accepts bet exactly at MAX_BET without throwing', () => {
    const payout = calculateDicePayout(MAX_BET, 2, true);
    expect(Number.isFinite(payout)).toBe(true);
    expect(payout).toBeGreaterThan(0);
  });

  it('returns a finite number for bet=999_999_999 when MAX_BET >= 999_999_999', () => {
    // Only runs if MAX_BET is set above 999_999_999; otherwise this bet
    // is expected to throw — both outcomes are valid, but NaN is never valid.
    if (MAX_BET >= 999_999_999) {
      const payout = calculateDicePayout(999_999_999, 2, true);
      expect(Number.isFinite(payout)).toBe(true);
      expect(Number.isNaN(payout)).toBe(false);
    } else {
      expect(() => calculateDicePayout(999_999_999, 2, true)).toThrow(RangeError);
    }
  });
});

// ─── 4. Max-bet constant ────────────────────────────────────────────────────

describe('MAX_BET constant', () => {
  it('is exported and matches the default game config hardcap', () => {
    expect(MAX_BET).toBe(DEFAULT_GAME_CONFIG.limits.maxBetHardcap);
  });

  it('is a safe integer', () => {
    expect(Number.isSafeInteger(MAX_BET)).toBe(true);
  });
});

// ─── 5. Edge cases ─────────────────────────────────────────────────────────

describe('calculateDicePayout — edge cases', () => {
  it('returns 0 for bet=0 even on a win', () => {
    const payout = calculateDicePayout(0, 2, true);
    expect(payout).toBe(0);
  });

  it('returns 0 for multiplier=0 even on a win', () => {
    const payout = calculateDicePayout(1_000, 0, true);
    expect(payout).toBe(0);
  });

  it('throws when bet is negative', () => {
    expect(() => calculateDicePayout(-1, 2, true)).toThrow(RangeError);
  });

  it('throws when multiplier is negative', () => {
    expect(() => calculateDicePayout(1_000, -1, true)).toThrow(RangeError);
  });

  it('handles fractional multiplier 9.9 precisely for large bet', () => {
    // 5_000_000 * 9.9 = 49_500_000 — must not drift
    const payout = calculateDicePayout(5_000_000, 9.9, true);
    expect(payout).toBe(49_500_000);
  });
});
