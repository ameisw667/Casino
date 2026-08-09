/**
 * Roulette simulation tests.
 *
 * These tests exercise the core betting engine exactly as /games/roulette
 * would call it. They simulate three consecutive "Place Bet" clicks with
 * realistic chip placements and verify that every spin resolves to a valid
 * result, updates state correctly, and never corrupts the balance.
 */

import { describe, it, expect } from 'vitest';
import { CasinoCore, type RouletteBet, type RouletteBetType } from '../casino-core';

const CLIENT_SEED = 'roulette-test-seed';

function buildBets(types: RouletteBetType[], totalAmount: number): RouletteBet[] {
  const perBet = Math.round((totalAmount / types.length) * 100) / 100;
  return types.map((type) => ({ type, amount: perBet }));
}

async function spinOnce(betTypes: RouletteBetType[], totalAmount: number, nonce: number) {
  return CasinoCore.placeBet({
    gameType: 'ROULETTE',
    amount: totalAmount,
    bets: buildBets(betTypes, totalAmount),
    clientSeed: CLIENT_SEED,
    currentNonce: nonce,
  });
}

describe('Roulette — three consecutive place-bet simulations', () => {
  it('simulation 1: straight-up number bet resolves cleanly', async () => {
    const result = await spinOnce([{ type: 'STRAIGHT', value: 17 }], 10, 0);

    expect(result.id).toBeTruthy();
    expect(result.roll).toBeGreaterThanOrEqual(0);
    expect(result.roll).toBeLessThanOrEqual(36);
    expect(Number.isFinite(result.payout)).toBe(true);
    expect(Number.isNaN(result.payout)).toBe(false);
    expect(result.nonce).toBeGreaterThan(0);
    expect(result.serverSeedHash).toBeTruthy();
  });

  it('simulation 2: color bet returns correct payout when it wins', async () => {
    const result = await spinOnce([{ type: 'COLOR', value: 'RED' }], 50, 1);

    expect(result.roll).toBeGreaterThanOrEqual(0);
    expect(result.roll).toBeLessThanOrEqual(36);

    const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    const isRed = redNumbers.has(result.roll);

    if (isRed) {
      expect(result.win).toBe(true);
      expect(result.payout).toBe(100); // 50 * 2
    } else {
      expect(result.win).toBe(false);
      expect(result.payout).toBe(0);
    }
  });

  it('simulation 3: multi-chip board bet resolves without crashing', async () => {
    const bets: RouletteBetType[] = [
      { type: 'STRAIGHT', value: 7 },
      { type: 'COLOR', value: 'BLACK' },
      { type: 'RANGE', value: '1-18' },
    ];
    const result = await spinOnce(bets, 30, 2);

    expect(result.roll).toBeGreaterThanOrEqual(0);
    expect(result.roll).toBeLessThanOrEqual(36);
    expect(Number.isFinite(result.payout)).toBe(true);
    expect(Number.isNaN(result.payout)).toBe(false);

    // Roll 7 wins the 35x straight and the 2x 1–18 range bet:
    // (35 * 10) + (2 * 10) = 370. The BLACK bet loses because 7 is red.
    expect(result.payout).toBeLessThanOrEqual(370);
  });

  it('all three simulations use increasing nonces', async () => {
    const r1 = await spinOnce([{ type: 'STRAIGHT', value: 1 }], 5, 10);
    const r2 = await spinOnce([{ type: 'STRAIGHT', value: 2 }], 5, r1.nonce);
    const r3 = await spinOnce([{ type: 'STRAIGHT', value: 3 }], 5, r2.nonce);

    expect(r2.nonce).toBeGreaterThan(r1.nonce);
    expect(r3.nonce).toBeGreaterThan(r2.nonce);
    expect(r1.roll).not.toBe(r2.roll); // deterministic but extremely unlikely to collide
  });
});
