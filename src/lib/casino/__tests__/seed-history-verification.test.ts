import { describe, expect, it } from 'vitest';
import { ProvablyFairEngine } from '../provably-fair';
import { verifySeedHistoryEntry } from '../seed-history-verification';

describe('verifySeedHistoryEntry', () => {
  it('accepts an untampered revealed seed and reproduces its Dice result', async () => {
    const serverSeed = 'revealed-server-seed';
    const serverSeedHash = (await ProvablyFairEngine.generateServerSeed()).hash;
    const matchingHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(serverSeed),
    );
    const exactHash = Array.from(new Uint8Array(matchingHash))
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('');

    const result = await verifySeedHistoryEntry({
      game: 'dice',
      serverSeed,
      serverSeedHash: exactHash,
      clientSeed: 'player-seed',
      nonce: 4,
    });

    expect(serverSeedHash).toHaveLength(64);
    expect(result.hashVerified).toBe(true);
    expect(result.computedOutcome).toMatch(/^Dice Roll: /);
  });

  it('refuses to compute a game result when the revealed seed does not match the committed hash', async () => {
    const result = await verifySeedHistoryEntry({
      game: 'crash',
      serverSeed: 'tampered-seed',
      serverSeedHash: '0'.repeat(64),
      clientSeed: 'player-seed',
      nonce: 0,
    });

    expect(result).toEqual({
      hashVerified: false,
      hmac: null,
      computedOutcome: null,
    });
  });
});
