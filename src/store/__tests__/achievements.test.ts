// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import './helpers/mocks';
import { useCasinoStore } from '../useCasinoStore';
import { resultId, setupTestEnv, teardownTestEnv } from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  teardownTestEnv();
});
describe('processGameResult — Achievements', () => {
  it('unlocks first_bet on the very first processed bet', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(2),
    });
    expect(useCasinoStore.getState().achievements.find((a) => a.id === 'first_bet')!.unlocked).toBe(
      true,
    );
  });

  it('unlocks high_roller only at amount >= 1000', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 999,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(2),
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!.unlocked,
    ).toBe(false);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1000,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(3),
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!.unlocked,
    ).toBe(true);
  });

  it('unlocks big_win only at payout >= 500', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 50,
      payout: 500,
      win: true,
      resultId: resultId(2),
    });
    expect(useCasinoStore.getState().achievements.find((a) => a.id === 'big_win')!.unlocked).toBe(
      true,
    );
  });

  it('unlocks crash_master only for CRASH at multiplier >= 10', () => {
    useCasinoStore.getState().processGameResult({
      game: 'ROULETTE',
      amount: 10,
      multiplier: 15,
      payout: 150,
      win: true,
      resultId: resultId(2),
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'crash_master')!.unlocked,
    ).toBe(false);

    useCasinoStore.getState().processGameResult({
      game: 'CRASH',
      amount: 10,
      multiplier: 10,
      payout: 100,
      win: true,
      resultId: resultId(3),
      crashMultiplier: 10,
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'crash_master')!.unlocked,
    ).toBe(true);
  });

  it('unlocks moon_shot only at CRASH multiplier >= 100, independent of crash_master', () => {
    useCasinoStore.getState().processGameResult({
      game: 'CRASH',
      amount: 10,
      multiplier: 15,
      payout: 150,
      win: true,
      resultId: resultId(2),
      crashMultiplier: 15,
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'crash_master')!.unlocked,
    ).toBe(true);
    expect(useCasinoStore.getState().achievements.find((a) => a.id === 'moon_shot')!.unlocked).toBe(
      false,
    );

    useCasinoStore.getState().processGameResult({
      game: 'CRASH',
      amount: 10,
      multiplier: 100,
      payout: 1000,
      win: true,
      resultId: resultId(3),
      crashMultiplier: 100,
    });
    expect(useCasinoStore.getState().achievements.find((a) => a.id === 'moon_shot')!.unlocked).toBe(
      true,
    );
  });

  it('unlocks lucky_streak after 5 consecutive wins and resets the streak on a loss', () => {
    for (let i = 0; i < 4; i++) {
      useCasinoStore.getState().processGameResult({
        game: 'DICE',
        amount: 1,
        multiplier: 2,
        payout: 2,
        win: true,
        resultId: resultId(10 + i),
      });
    }
    expect(useCasinoStore.getState().currentWinStreak).toBe(4);
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'lucky_streak')!.unlocked,
    ).toBe(false);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 2,
      payout: 2,
      win: true,
      resultId: resultId(20),
    });
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'lucky_streak')!.unlocked,
    ).toBe(true);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(21),
    });
    expect(useCasinoStore.getState().currentWinStreak).toBe(0);
  });

  it('unlocks first_bet exactly once and does not re-fire on every subsequent bet', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(30),
    });
    const first = useCasinoStore.getState().achievements.find((a) => a.id === 'first_bet')!;
    expect(first.unlocked).toBe(true);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(31),
    });
    const second = useCasinoStore.getState().achievements.find((a) => a.id === 'first_bet')!;
    expect(second).toBe(first);
  });

  it('never re-mutates an already unlocked achievement', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1000,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(2),
    });
    const first = useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!;

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(3),
    });
    const second = useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!;
    expect(second).toEqual(first);
  });
});
