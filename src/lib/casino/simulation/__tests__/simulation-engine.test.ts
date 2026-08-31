import { describe, expect, it } from 'vitest';
import { mulberry32, seedFromText, nextRngStream } from '../rng';
import {
  rollCrashMultiplier,
  rollDiceOutcome,
  rollRouletteNumber,
  rollSlotsSymbols,
} from '../game-roll';
import { DEFAULT_GAME_CONFIG, calculateSlotsPayoutWithConfig } from '../../game-config';
import { runRounds, type PlayerSpec } from '../engine';
import { computeEdge, wilsonInterval } from '../statistics';

const RNG_STREAM_SAMPLES = 4;

describe('rng', () => {
  it('produces the identical stream for the same seed', () => {
    const a = nextRngStream(1337);
    const b = nextRngStream(1337);
    expect(a(RNG_STREAM_SAMPLES)).toEqual(b(RNG_STREAM_SAMPLES));
  });

  it('maps seed text deterministically via seedFromText', () => {
    expect(seedFromText('to09-baseline')).toBe(seedFromText('to09-baseline'));
    expect(seedFromText('to09-baseline')).not.toBe(seedFromText('to09-other'));
  });

  it('keeps mulberry32 float output in [0,1)', () => {
    const rng = mulberry32(seedFromText('range'));
    for (let i = 0; i < 1000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('game-roll', () => {
  it('cross-checks dice, crash, roulette and slots against the real ProvablyFairEngine', async () => {
    const { ProvablyFairEngine } = await import('../../provably-fair');
    const serverSeed = 'to09-cross-check-server-seed';
    const clientSeed = 'to09-cross-check-client-seed';
    for (let nonce = 1; nonce <= 50; nonce += 1) {
      const { result: u } = await ProvablyFairEngine.calculateOutcome(
        serverSeed,
        clientSeed,
        nonce,
      );
      expect(rollDiceOutcome(u)).toBe(
        await ProvablyFairEngine.getDiceRoll(serverSeed, clientSeed, nonce),
      );
      expect(rollCrashMultiplier(u, DEFAULT_GAME_CONFIG.crash.houseEdge)).toBe(
        await ProvablyFairEngine.getCrashMultiplier(
          serverSeed,
          clientSeed,
          nonce,
          DEFAULT_GAME_CONFIG.crash.houseEdge,
        ),
      );
      expect(rollRouletteNumber(u)).toBe(
        await ProvablyFairEngine.getRouletteNumber(serverSeed, clientSeed, nonce),
      );
      expect(rollSlotsSymbols([u, ...Array(4).fill(0.5)])).toEqual([
        (await ProvablyFairEngine.getSlotsResult(serverSeed, clientSeed, nonce, 5, 8))[0],
        Math.floor(0.5 * 8),
        Math.floor(0.5 * 8),
        Math.floor(0.5 * 8),
        Math.floor(0.5 * 8),
      ]);
    }
  });

  it('mirrors the provably-fair dice transformation exactly', () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.737, 0.99321, 0.99999999];
    for (const u of samples) {
      expect(rollDiceOutcome(u)).toBe(Math.floor(u * 10001) / 100);
    }
    expect(rollDiceOutcome(0.9999999999999999)).toBe(100);
  });

  it('mirrors the provably-fair crash formula, including instant-crash band', () => {
    expect(rollCrashMultiplier(0.005, 0.01)).toBe(1.0);
    const u = 0.2;
    expect(rollCrashMultiplier(u, 0.01)).toBe(
      Math.max(1.0, Math.floor(((1 - 0.01) / (1 - u)) * 100) / 100),
    );
    expect(rollCrashMultiplier(0.9999, 0.01)).toBeGreaterThanOrEqual(1);
  });

  it('mirrors the provably-fair roulette and slots transformations', () => {
    expect(rollRouletteNumber(0.5)).toBe(Math.floor(0.5 * 37));
    const u = [0.1, 0.2, 0.3, 0.4, 0.5];
    expect(rollSlotsSymbols(u)).toEqual(u.map((value) => Math.floor(value * 8)));
  });
});

describe('statistics', () => {
  it('computes the empirical edge with a confidence interval around it', () => {
    const returns = new Array(1000)
      .fill(0.97)
      .map((value, index) => (index % 2 === 0 ? value : 0.96));
    const result = computeEdge({
      rounds: 1000,
      wager: 1000 * 100,
      payout: 1000 * 97,
      sumReturn: returns.reduce((a, b) => a + b, 0),
      sumSqReturn: returns.reduce((a, b) => a + b * b, 0),
    });
    expect(result.empiricalEdge).toBeCloseTo(0.03, 10);
    expect(result.ci95[0]).toBeLessThan(result.empiricalEdge);
    expect(result.ci95[1]).toBeGreaterThan(result.empiricalEdge);
  });

  it('keeps the Wilson interval inside [0,1] at extreme win rates', () => {
    const [lo, hi] = wilsonInterval(0, 100);
    expect(lo).toBe(0);
    expect(hi).toBeGreaterThan(0);
    expect(hi).toBeLessThan(0.05);
  });
});

describe('engine', () => {
  const flatSpec: PlayerSpec = {
    id: 'p0',
    game: 'DICE',
    strategy: 'flat',
    startBankroll: 1000,
    baseBet: 1,
    diceTarget: 50,
    diceCondition: 'UNDER',
  };

  it('is fully deterministic for the same seed and spec', () => {
    expect(runRounds(flatSpec, 200, 'determinism-seed', DEFAULT_GAME_CONFIG)).toEqual(
      runRounds(flatSpec, 200, 'determinism-seed', DEFAULT_GAME_CONFIG),
    );
  });

  it('moves dice RTP into a sensible band around the 1% house edge', () => {
    const result = runRounds(flatSpec, 200_000, 'dice-edge', DEFAULT_GAME_CONFIG);
    const edge = computeEdge(result);
    expect(edge.wager).toBeGreaterThan(0);
    expect(edge.empiricalEdge).toBeGreaterThan(-0.02);
    expect(edge.empiricalEdge).toBeLessThan(0.05);
  });

  it('caps XP at the configured maxXpPerBet for large wagers', () => {
    const result = runRounds(
      {
        id: 'xp',
        game: 'DICE',
        strategy: 'max-bet-grind',
        startBankroll: 1e9,
        maxBetGrindWager: 10_000,
        diceTarget: 50,
        diceCondition: 'UNDER',
      },
      10,
      'xp-seed',
      DEFAULT_GAME_CONFIG,
    );
    expect(result.wagerTotal).toBe(100_000);
    expect(result.xpTotal).toBe(10 * DEFAULT_GAME_CONFIG.xp.maxXpPerBet);
  });

  it('never lets the martingale wager exceed the configured betMax or the bankroll', () => {
    const result = runRounds(
      {
        id: 'mart',
        game: 'DICE',
        strategy: 'martingale',
        startBankroll: 500,
        baseBet: 8,
        diceTarget: 50,
        diceCondition: 'UNDER',
      },
      5_000,
      'martingale-seed',
      DEFAULT_GAME_CONFIG,
    );
    expect(result.troughBankroll).toBeGreaterThanOrEqual(0);
    expect(result.maxWager).toBeLessThanOrEqual(DEFAULT_GAME_CONFIG.limits.betMax);
    expect(result.roundsPlayed).toBeGreaterThan(0);
  });

  it('pays roulette via the shared production payout calculation', () => {
    const result = runRounds(
      {
        id: 'roul',
        game: 'ROULETTE',
        strategy: 'flat',
        startBankroll: 1e9,
        rouletteBets: [{ type: { type: 'COLOR', value: 'RED' }, amount: 1 }],
      },
      50_000,
      'roulette-edge',
      DEFAULT_GAME_CONFIG,
    );
    const edge = computeEdge(result);
    expect(edge.wager).toBeGreaterThan(0);
    expect(edge.empiricalEdge).toBeGreaterThan(0);
    expect(edge.empiricalEdge).toBeLessThan(0.1);
  });

  it('pays slots via the shared paytable function', () => {
    expect(calculateSlotsPayoutWithConfig([3, 3, 3, 3, 3], DEFAULT_GAME_CONFIG)).toBeGreaterThan(0);
  });

  it('produces identical level milestones from the same XP stream', () => {
    const spec: PlayerSpec = {
      id: 'prog',
      game: 'SLOTS',
      strategy: 'flat',
      startBankroll: 1e9,
      baseBet: 5,
    };
    const first = runRounds(spec, 3_000, 'progression-seed', DEFAULT_GAME_CONFIG);
    const second = runRounds(spec, 3_000, 'progression-seed', DEFAULT_GAME_CONFIG);
    expect(first.levelTimeline).toEqual(second.levelTimeline);
    expect(first.maxLevelReached).toBeGreaterThan(1);
  });
});
