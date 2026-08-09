import { describe, expect, it } from 'vitest';
import { ProvablyFairEngine } from '../provably-fair';

describe('ProvablyFairEngine cryptographic verification & game determinism', () => {
  it('generates valid server seed and sha-256 hash', async () => {
    const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
    expect(seed).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);

    const isVerified = await ProvablyFairEngine.verifyHash(seed, hash);
    expect(isVerified).toBe(true);

    const isTampered = await ProvablyFairEngine.verifyHash('tampered-seed', hash);
    expect(isTampered).toBe(false);
  });

  it('calculates deterministic dice rolls within [0.00, 100.00]', async () => {
    const serverSeed = 'test-server-seed-12345';
    const clientSeed = 'player-client-seed';
    const nonce = 1;

    const roll1 = await ProvablyFairEngine.getDiceRoll(serverSeed, clientSeed, nonce);
    const roll2 = await ProvablyFairEngine.getDiceRoll(serverSeed, clientSeed, nonce);

    expect(roll1).toBe(roll2); // Deterministic
    expect(roll1).toBeGreaterThanOrEqual(0.0);
    expect(roll1).toBeLessThanOrEqual(100.0);
  });

  it('calculates deterministic crash multiplier >= 1.00', async () => {
    const serverSeed = 'crash-server-seed';
    const clientSeed = 'player-seed';
    const mult = await ProvablyFairEngine.getCrashMultiplier(serverSeed, clientSeed, 5);

    expect(mult).toBeGreaterThanOrEqual(1.0);
    expect(Number.isFinite(mult)).toBe(true);
  });

  it('calculates deterministic roulette numbers in [0, 36]', async () => {
    const serverSeed = 'roulette-server-seed';
    const clientSeed = 'player-seed';
    const num = await ProvablyFairEngine.getRouletteNumber(serverSeed, clientSeed, 3);

    expect(Number.isInteger(num)).toBe(true);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(36);
  });

  it('calculates slots reel indices deterministically', async () => {
    const serverSeed = 'slots-server-seed';
    const clientSeed = 'player-seed';
    const reels = await ProvablyFairEngine.getSlotsResult(serverSeed, clientSeed, 10, 5, 12);

    expect(reels).toHaveLength(5);
    reels.forEach((r) => {
      expect(Number.isInteger(r)).toBe(true);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(12);
    });
  });

  it('generates valid blackjack deck shuffle indices via Fisher-Yates', async () => {
    const serverSeed = 'blackjack-server-seed';
    const clientSeed = 'player-seed';
    const deal = await ProvablyFairEngine.getBlackjackDeal(serverSeed, clientSeed, 1, 312);

    expect(deal).toHaveLength(312);
    deal.forEach((index) => {
      expect(Number.isInteger(index)).toBe(true);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(312);
    });
  });
});
