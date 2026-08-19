import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ProvablyFairEngine } from '../provably-fair';
import { WalletService } from '../wallet';
import { publicState } from '@/app/api/casino/blackjack/route';
import type { BlackjackGameState, Card } from '@/lib/games/blackjack';

// blackjack/route.ts and wallet.ts transitively import several server-only
// guarded modules (Supabase admin client, telegram, fraud detection, ...).
// None of that is reachable from the two pure functions under test here
// (publicState, computeRoundJackpotRoll), so it is stubbed out purely to
// make the import graph resolve in the Vitest environment — same pattern
// as src/lib/security/__tests__/form-error-route-contracts.test.ts. vi.mock
// calls are hoisted above these imports by Vitest regardless of position.
vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }));

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

/**
 * worldmap/01_LiveProgressiveJackpot.md, L3.
 *
 * Added after a security review (2026-08-18) flagged two gaps: (1) a
 * pre-existing leak where Blackjack action responses echoed the raw,
 * shared active serverSeed via publicState() not stripping it, made worse
 * by this feature also storing clientSeed in round state; (2) settle_game_round
 * persisting the unstripped jackpotRoll into game_rounds.state. Both are
 * fixed in code; these tests pin the fix so it can't silently regress.
 */
describe('ProvablyFairEngine.getJackpotRoll', () => {
  it('is deterministic for identical (serverSeed, clientSeed, nonce)', async () => {
    const first = await ProvablyFairEngine.getJackpotRoll('seed-a', 'client-a', 5);
    const second = await ProvablyFairEngine.getJackpotRoll('seed-a', 'client-a', 5);
    expect(first).toBe(second);
  });

  it('returns a value in [0, 1)', async () => {
    const roll = await ProvablyFairEngine.getJackpotRoll('seed-b', 'client-b', 1);
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
  });

  it('is domain-separated from the game outcome roll for the same seed triple', async () => {
    const jackpotRoll = await ProvablyFairEngine.getJackpotRoll('seed-c', 'client-c', 9);
    const { result: gameRoll } = await ProvablyFairEngine.calculateOutcome('seed-c', 'client-c', 9);
    expect(jackpotRoll).not.toBe(gameRoll);
  });

  it('changes output when only the client seed changes (no fixed-point collisions for adjacent seeds)', async () => {
    const a = await ProvablyFairEngine.getJackpotRoll('seed-d', 'client-1', 3);
    const b = await ProvablyFairEngine.getJackpotRoll('seed-d', 'client-2', 3);
    expect(a).not.toBe(b);
  });
});

describe('WalletService.computeRoundJackpotRoll', () => {
  it('returns undefined when clientSeed is missing from round state (pre-feature round)', async () => {
    const roll = await WalletService.computeRoundJackpotRoll({ serverSeed: 'x' }, 1);
    expect(roll).toBeUndefined();
  });

  it('returns undefined when serverSeed is missing from round state', async () => {
    const roll = await WalletService.computeRoundJackpotRoll({ clientSeed: 'x' }, 1);
    expect(roll).toBeUndefined();
  });

  it('matches ProvablyFairEngine.getJackpotRoll directly when both seeds are present', async () => {
    const viaWallet = await WalletService.computeRoundJackpotRoll(
      { serverSeed: 'round-seed', clientSeed: 'round-client' },
      11,
    );
    const direct = await ProvablyFairEngine.getJackpotRoll('round-seed', 'round-client', 11);
    expect(viaWallet).toBe(direct);
  });
});

describe('publicState never leaks provably-fair seed material', () => {
  function fixtureState(extra: Record<string, unknown>): BlackjackGameState {
    const card: Card = { suit: 'spades', value: '10', numericValue: 10, faceDown: false };
    const hiddenCard: Card = { ...card, faceDown: true };
    return {
      phase: 'PLAYER_TURN',
      deck: [card],
      playerHand: {
        cards: [card, card],
        score: 20,
        isBust: false,
        isBlackjack: false,
        isSoft: false,
      },
      dealerHand: {
        cards: [card, hiddenCard],
        score: 10,
        isBust: false,
        isBlackjack: false,
        isSoft: false,
      },
      activeHandIndex: 0,
      canDouble: true,
      canSplit: false,
      payout: 0,
      payoutMultiplier: 0,
      ...extra,
    } as unknown as BlackjackGameState;
  }

  it('strips serverSeed and clientSeed from the returned state', () => {
    const state = fixtureState({
      serverSeed: 'super-secret-active-chain-seed',
      clientSeed: 'player-chosen-seed',
      serverSeedHash: 'safe-hash',
      nonce: 4,
    });

    const result = publicState(state) as unknown as Record<string, unknown>;

    expect(result).not.toHaveProperty('serverSeed');
    expect(result).not.toHaveProperty('clientSeed');
    // Non-secret fields survive — only the secret-adjacent ones are stripped.
    expect(result.serverSeedHash).toBe('safe-hash');
    expect(result.nonce).toBe(4);
  });

  it('never lets the raw serverSeed appear anywhere in the JSON-serialized response', () => {
    const state = fixtureState({ serverSeed: 'must-never-leak-12345', clientSeed: 'ok-to-know' });
    const result = publicState(state);
    expect(JSON.stringify(result)).not.toContain('must-never-leak-12345');
  });
});

describe('progressive jackpot migration strips jackpotRoll before persisting/echoing (static)', () => {
  const migration = read('supabase/migrations/034_progressive_jackpot_trigger.sql');

  it('strips jackpotRoll from the response echoed to the client in all three settlement RPCs', () => {
    const occurrences = migration.match(/'result',\s*\(p_result - 'jackpotRoll'\)/g) ?? [];
    // settle_game_bet (10-arg) + advance_blackjack_round response, plus
    // settle_game_round's response AND its separate game_rounds.state merge
    // (that one has its own dedicated assertion below) = 4 occurrences.
    expect(occurrences.length).toBe(4);
  });

  it('strips jackpotRoll before merging the result into persisted game_rounds.state (Crash)', () => {
    const settleRoundFn = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION settle_game_round'),
    );
    expect(settleRoundFn).toContain(
      "state = state || jsonb_build_object('result', (p_result - 'jackpotRoll'))",
    );
  });

  it('never assigns the raw, unstripped p_result into game_rounds.state', () => {
    expect(migration).not.toContain("jsonb_build_object('result', p_result)");
  });
});
