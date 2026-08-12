import { describe, expect, it } from 'vitest';
import { CasinoCore } from '../casino-core';
import { ProvablyFairEngine } from '../provably-fair';

/**
 * worldmap/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md
 *
 * CasinoCore no longer generates its own server seed per bet — the seed
 * chain (generation, rotation, nonce increment) lives entirely in
 * consume_active_seed()/rotate_user_seed() (migration 019). These tests
 * cover the contract CasinoCore is still responsible for: given an
 * externally supplied seed/hash/nonce, it must compute deterministically
 * and echo the nonce back untouched (it must not increment it itself —
 * that would desynchronize from the DB-owned counter).
 */
describe('CasinoCore consumes an externally supplied seed instead of generating one', () => {
  it('echoes back the exact nonce and hash it was given (DICE)', async () => {
    const result = await CasinoCore.placeBet({
      gameType: 'DICE',
      amount: 10,
      target: 50,
      condition: 'OVER',
      multiplier: 2,
      clientSeed: 'chain-test-client-seed',
      serverSeed: 'chain-test-server-seed',
      serverSeedHash: 'chain-test-hash',
      nonce: 42,
    });

    expect(result.nonce).toBe(42);
    expect(result.serverSeedHash).toBe('chain-test-hash');
  });

  it('produces identical outcomes for identical (serverSeed, clientSeed, nonce) across two calls', async () => {
    const params = {
      gameType: 'DICE' as const,
      amount: 10,
      target: 50,
      condition: 'OVER' as const,
      multiplier: 2,
      clientSeed: 'determinism-check',
      serverSeed: 'fixed-seed-for-determinism',
      serverSeedHash: 'fixed-hash',
      nonce: 7,
    };

    const first = await CasinoCore.placeBet(params);
    const second = await CasinoCore.placeBet(params);

    expect(first.roll).toBe(second.roll);
    expect(first.win).toBe(second.win);
    expect(first.payout).toBe(second.payout);
  });

  it('startCrashRound echoes the supplied seed/hash/nonce instead of generating its own', async () => {
    const crash = await CasinoCore.startCrashRound(
      'crash-client-seed',
      'crash-server-seed-fixed',
      'crash-hash-fixed',
      3,
    );

    expect(crash.seed).toBe('crash-server-seed-fixed');
    expect(crash.hash).toBe('crash-hash-fixed');
    expect(crash.nonce).toBe(3);
  });

  it('a revealed seed hashes back to the hash that was committed before rotation', async () => {
    // Mirrors what rotate_user_seed() must guarantee server-side: the
    // revealedSeed returned on rotation is the exact preimage of the
    // server_seed_hash that was public before the rotation happened.
    const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
    const verified = await ProvablyFairEngine.verifyHash(seed, hash);
    expect(verified).toBe(true);

    const tamperedVerification = await ProvablyFairEngine.verifyHash('wrong-seed', hash);
    expect(tamperedVerification).toBe(false);
  });
});
