/**
 * Regression tests: DICE payout must always be derived server-side from
 * target/condition + config.dice.houseEdge. A client-supplied multiplier
 * previously had no relation to the actual win probability and could be
 * used to drain the wallet on any bet with a high win chance.
 */

import { describe, it, expect } from 'vitest';
import { CasinoCore } from '../casino-core';
import { getDiceMultiplierWithConfig, DEFAULT_GAME_CONFIG } from '../game-config';

describe('getDiceMultiplierWithConfig', () => {
  it('matches the known fair formula for a 50% win chance (target=50, OVER)', () => {
    // winChance = 100 - 50 = 50 -> (0.99 * 100) / 50 = 1.98
    const multiplier = getDiceMultiplierWithConfig(50, 'OVER', DEFAULT_GAME_CONFIG);
    expect(multiplier).toBeCloseTo(1.98, 4);
  });

  it('matches the known fair formula for a 50% win chance (target=50, UNDER)', () => {
    const multiplier = getDiceMultiplierWithConfig(50, 'UNDER', DEFAULT_GAME_CONFIG);
    expect(multiplier).toBeCloseTo(1.98, 4);
  });

  it('produces a higher multiplier for a lower win chance', () => {
    const highChance = getDiceMultiplierWithConfig(90, 'UNDER', DEFAULT_GAME_CONFIG);
    const lowChance = getDiceMultiplierWithConfig(10, 'UNDER', DEFAULT_GAME_CONFIG);
    expect(lowChance).toBeGreaterThan(highChance);
  });

  it('keeps expected value at (1 - houseEdge) regardless of target', () => {
    for (const target of [1, 25, 50, 75, 99]) {
      const winChance = target / 100;
      const multiplier = getDiceMultiplierWithConfig(target, 'UNDER', DEFAULT_GAME_CONFIG);
      expect(winChance * multiplier).toBeCloseTo(1 - DEFAULT_GAME_CONFIG.dice.houseEdge, 2);
    }
  });

  it('throws for target below the valid range', () => {
    expect(() => getDiceMultiplierWithConfig(0, 'UNDER', DEFAULT_GAME_CONFIG)).toThrow(RangeError);
  });

  it('throws for target above the valid range', () => {
    expect(() => getDiceMultiplierWithConfig(100, 'OVER', DEFAULT_GAME_CONFIG)).toThrow(
      RangeError,
    );
  });

  it('throws for a non-finite target', () => {
    expect(() => getDiceMultiplierWithConfig(NaN, 'OVER', DEFAULT_GAME_CONFIG)).toThrow(
      RangeError,
    );
  });
});

describe('CasinoCore.placeBet — DICE ignores a malicious client multiplier', () => {
  const seeds = {
    serverSeed: 'fixed-server-seed-for-dice-security-test',
    clientSeed: 'fixed-client-seed',
    serverSeedHash: 'irrelevant-for-this-test',
    nonce: 1,
  };

  it('never pays out using the client-supplied multiplier on a win', async () => {
    const amount = 100;
    const target = 99.98; // ~99.98% win chance — deterministic seed above wins reliably
    const maliciousMultiplier = 999_999;

    const result = await CasinoCore.placeBet({
      gameType: 'DICE',
      amount,
      target,
      condition: 'UNDER',
      multiplier: maliciousMultiplier,
      ...seeds,
    });

    const fairMultiplier = getDiceMultiplierWithConfig(target, 'UNDER', DEFAULT_GAME_CONFIG);
    expect(result.payout).not.toBe(amount * maliciousMultiplier);
    if (result.win) {
      expect(result.payout).toBeCloseTo(amount * fairMultiplier, 2);
    } else {
      expect(result.payout).toBe(0);
    }
  });

  it('produces the same payout with or without a client-supplied multiplier', async () => {
    const amount = 250;
    const target = 99.98;

    const withoutClientMultiplier = await CasinoCore.placeBet({
      gameType: 'DICE',
      amount,
      target,
      condition: 'UNDER',
      ...seeds,
    });
    const withMaliciousMultiplier = await CasinoCore.placeBet({
      gameType: 'DICE',
      amount,
      target,
      condition: 'UNDER',
      multiplier: 5_000_000,
      ...seeds,
    });

    expect(withMaliciousMultiplier.payout).toBe(withoutClientMultiplier.payout);
  });
});
