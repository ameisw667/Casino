import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GAME_CONFIG,
  getBetLimits,
  validateBetWithConfig,
  getRouletteMultiplierWithConfig,
  calculateSlotsPayoutWithConfig,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
  getBlackjackMaxPayoutFactor,
  getCrashHouseEdge,
} from '../game-config';
import { type RouletteBetType } from '../casino-core';

describe('DEFAULT_GAME_CONFIG', () => {
  it('contains all required categories', () => {
    expect(DEFAULT_GAME_CONFIG.limits).toBeDefined();
    expect(DEFAULT_GAME_CONFIG.crash).toBeDefined();
    expect(DEFAULT_GAME_CONFIG.roulette).toBeDefined();
    expect(DEFAULT_GAME_CONFIG.blackjack).toBeDefined();
    expect(DEFAULT_GAME_CONFIG.slots).toBeDefined();
    expect(DEFAULT_GAME_CONFIG.xp).toBeDefined();
  });

  it('has sensible default limits', () => {
    expect(DEFAULT_GAME_CONFIG.limits.betMin).toBe(0.1);
    expect(DEFAULT_GAME_CONFIG.limits.betMax).toBe(10000);
    expect(DEFAULT_GAME_CONFIG.limits.maxBetHardcap).toBe(100_000_000);
  });
});

describe('getBetLimits', () => {
  it('returns configured limits', () => {
    const limits = getBetLimits(DEFAULT_GAME_CONFIG);
    expect(limits.betMin).toBe(0.1);
    expect(limits.betMax).toBe(10000);
  });
});

describe('validateBetWithConfig', () => {
  it('returns null for a valid bet', () => {
    expect(validateBetWithConfig(10, 1000, DEFAULT_GAME_CONFIG)).toBeNull();
  });

  it('rejects bets below minimum', () => {
    expect(validateBetWithConfig(0.05, 1000, DEFAULT_GAME_CONFIG)).toMatch(/between/);
  });

  it('rejects bets above maximum', () => {
    expect(validateBetWithConfig(10001, 1000, DEFAULT_GAME_CONFIG)).toMatch(/between/);
  });

  it('rejects bets above balance', () => {
    expect(validateBetWithConfig(100, 50, DEFAULT_GAME_CONFIG)).toMatch(/Insufficient/);
  });
});

describe('getRouletteMultiplierWithConfig', () => {
  it.each<[RouletteBetType, number]>([
    [{ type: 'STRAIGHT', value: 17 }, 35],
    [{ type: 'COLOR', value: 'RED' }, 2],
    [{ type: 'EVEN_ODD', value: 'EVEN' }, 2],
    [{ type: 'RANGE', value: '1-18' }, 2],
    [{ type: 'DOZEN', value: 1 }, 2],
    [{ type: 'COLUMN', value: 1 }, 2],
    [{ type: 'FRENCH', value: 'VOISINS' }, 36 / 17],
    [{ type: 'FRENCH', value: 'TIERS' }, 3],
    [{ type: 'FRENCH', value: 'ORPHELINS' }, 36 / 8],
  ])('returns correct multiplier for %o', (betType, expected) => {
    expect(getRouletteMultiplierWithConfig(betType, DEFAULT_GAME_CONFIG)).toBe(expected);
  });
});

describe('calculateSlotsPayoutWithConfig', () => {
  it('returns 0 when no match', () => {
    expect(calculateSlotsPayoutWithConfig([0, 1, 2, 3, 4], DEFAULT_GAME_CONFIG)).toBe(0);
  });

  it('pays for 3 matches using configured paytable', () => {
    const result = calculateSlotsPayoutWithConfig([7, 7, 7, 1, 2], DEFAULT_GAME_CONFIG);
    expect(result).toBeGreaterThan(0);
  });

  it('pays more for 4 matches than 3 matches', () => {
    const three = calculateSlotsPayoutWithConfig([7, 7, 7, 1, 2], DEFAULT_GAME_CONFIG);
    const four = calculateSlotsPayoutWithConfig([7, 7, 7, 7, 2], DEFAULT_GAME_CONFIG);
    expect(four).toBeGreaterThan(three);
  });

  it('pays most for 5 matches', () => {
    const four = calculateSlotsPayoutWithConfig([7, 7, 7, 7, 2], DEFAULT_GAME_CONFIG);
    const five = calculateSlotsPayoutWithConfig([7, 7, 7, 7, 7], DEFAULT_GAME_CONFIG);
    expect(five).toBeGreaterThan(four);
  });
});

describe('calculateXpGainWithConfig', () => {
  it('returns 0 for non-positive wager', () => {
    expect(calculateXpGainWithConfig(0, 1, DEFAULT_GAME_CONFIG)).toBe(0);
    expect(calculateXpGainWithConfig(-100, 1, DEFAULT_GAME_CONFIG)).toBe(0);
  });

  it('caps XP at maxXpPerBet', () => {
    const xp = calculateXpGainWithConfig(1e20, 1, DEFAULT_GAME_CONFIG);
    expect(xp).toBeLessThanOrEqual(DEFAULT_GAME_CONFIG.xp.maxXpPerBet);
  });

  it('scales with level multiplier', () => {
    const low = calculateXpGainWithConfig(100, 1, DEFAULT_GAME_CONFIG);
    const high = calculateXpGainWithConfig(100, 250, DEFAULT_GAME_CONFIG);
    expect(high).toBeGreaterThanOrEqual(low);
  });
});

describe('calculateLevelWithConfig', () => {
  it('returns level 1 for 0 XP', () => {
    expect(calculateLevelWithConfig(0, DEFAULT_GAME_CONFIG)).toBe(1);
  });

  it('never exceeds maxLevel', () => {
    expect(calculateLevelWithConfig(Number.MAX_SAFE_INTEGER, DEFAULT_GAME_CONFIG)).toBe(
      DEFAULT_GAME_CONFIG.xp.maxLevel,
    );
  });
});

describe('getBlackjackMaxPayoutFactor', () => {
  it('returns configured factor', () => {
    expect(getBlackjackMaxPayoutFactor(DEFAULT_GAME_CONFIG)).toBe(2.5);
  });
});

describe('getCrashHouseEdge', () => {
  it('returns configured house edge', () => {
    expect(getCrashHouseEdge(DEFAULT_GAME_CONFIG)).toBe(0.01);
  });
});
