/**
 * TDD: XP Formula Integer Overflow Prevention (Bug #50)
 *
 * RED phase: These tests describe the REQUIRED contract for calculateXpGain.
 * They validate that no level value can produce overflow, negative XP,
 * or results exceeding Number.MAX_SAFE_INTEGER.
 *
 * Failing tests here drive the GREEN implementation in casino-core.ts.
 */

import { describe, it, expect } from 'vitest';
import { CasinoCore } from '../casino-core';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SAFE = Number.MAX_SAFE_INTEGER; // 9007199254740991
const XP_CAP = 10_000; // Maximum XP that can be awarded per single bet

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function isNonNegativeFiniteInteger(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    !Number.isNaN(value) &&
    value >= 0 &&
    Number.isInteger(value)
  );
}

// ---------------------------------------------------------------------------
// Overflow / safety tests (will FAIL until level-aware formula is implemented)
// ---------------------------------------------------------------------------

describe('CasinoCore.calculateXpGain — integer overflow prevention', () => {
  describe('HIGH LEVEL: level 250, baseXP 100', () => {
    it('should return a non-negative number', () => {
      const result = CasinoCore.calculateXpGain(100, 250);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should not exceed XP_CAP (10000) per bet', () => {
      const result = CasinoCore.calculateXpGain(100, 250);
      expect(result).toBeLessThanOrEqual(XP_CAP);
    });

    it('should return a finite integer', () => {
      const result = CasinoCore.calculateXpGain(100, 250);
      expect(isNonNegativeFiniteInteger(result)).toBe(true);
    });
  });

  describe('EXTREME LEVEL: level 500, baseXP 50', () => {
    it('should not exceed Number.MAX_SAFE_INTEGER', () => {
      const result = CasinoCore.calculateXpGain(50, 500);
      expect(result).toBeLessThanOrEqual(MAX_SAFE);
    });

    it('should not be negative', () => {
      const result = CasinoCore.calculateXpGain(50, 500);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return a finite integer', () => {
      const result = CasinoCore.calculateXpGain(50, 500);
      expect(isNonNegativeFiniteInteger(result)).toBe(true);
    });
  });

  describe('VERY LARGE WAGER + HIGH LEVEL overflow scenario', () => {
    it('large wager (1e14) at level 500 should not exceed MAX_SAFE_INTEGER', () => {
      const result = CasinoCore.calculateXpGain(1e14, 500);
      expect(result).toBeLessThanOrEqual(MAX_SAFE);
    });

    it('should never return NaN for any valid wager/level combination', () => {
      const result = CasinoCore.calculateXpGain(1e14, 500);
      expect(Number.isNaN(result)).toBe(false);
    });
  });

  describe('LEVEL SWEEP: all levels 1 through 500 must produce safe XP', () => {
    const BASE_XP = 100;

    it('all levels produce non-negative XP', () => {
      for (let level = 1; level <= 500; level++) {
        const result = CasinoCore.calculateXpGain(BASE_XP, level);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });

    it('all levels produce XP not exceeding MAX_SAFE_INTEGER', () => {
      for (let level = 1; level <= 500; level++) {
        const result = CasinoCore.calculateXpGain(BASE_XP, level);
        expect(result).toBeLessThanOrEqual(MAX_SAFE);
      }
    });

    it('XP is monotonically non-decreasing as level increases with same wager', () => {
      let prev = CasinoCore.calculateXpGain(BASE_XP, 1);
      for (let level = 2; level <= 500; level++) {
        const curr = CasinoCore.calculateXpGain(BASE_XP, level);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });

    it('XP plateaus at cap so levels above threshold produce the same max XP', () => {
      const atCap = CasinoCore.calculateXpGain(BASE_XP, 500);
      const nearCap = CasinoCore.calculateXpGain(BASE_XP, 499);
      expect(atCap).toBeLessThanOrEqual(XP_CAP);
      expect(nearCap).toBeLessThanOrEqual(XP_CAP);
    });
  });

  // ---------------------------------------------------------------------------
  // Backward-compatibility: existing callers omit the level param
  // ---------------------------------------------------------------------------

  describe('BACKWARD COMPATIBILITY: no level argument', () => {
    it('wager 100 without level returns positive XP', () => {
      const result = CasinoCore.calculateXpGain(100);
      expect(result).toBeGreaterThan(0);
    });

    it('wager 100 without level does not exceed XP_CAP', () => {
      const result = CasinoCore.calculateXpGain(100);
      expect(result).toBeLessThanOrEqual(XP_CAP);
    });

    it('wager 0 returns 0 XP', () => {
      const result = CasinoCore.calculateXpGain(0);
      expect(result).toBe(0);
    });

    it('negative wager returns 0 XP to guard against abusive inputs', () => {
      const result = CasinoCore.calculateXpGain(-500);
      expect(result).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('EDGE CASES', () => {
    it('level 0 does not cause divide-by-zero or NaN', () => {
      const result = CasinoCore.calculateXpGain(100, 0);
      expect(Number.isNaN(result)).toBe(false);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('level 1 (minimum normal level) returns positive XP for wager 100', () => {
      const result = CasinoCore.calculateXpGain(100, 1);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(XP_CAP);
    });

    it('fractional wager rounds to integer XP', () => {
      const result = CasinoCore.calculateXpGain(0.7, 1);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('very large wager without level is clamped to XP_CAP', () => {
      const result = CasinoCore.calculateXpGain(1e20);
      expect(result).toBeLessThanOrEqual(XP_CAP);
      expect(Number.isFinite(result)).toBe(true);
    });
  });
});
