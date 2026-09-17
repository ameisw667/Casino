// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    play: vi.fn(),
    playWinTier: vi.fn(),
    toggle: vi.fn(),
    setVolume: vi.fn(),
  },
}));
vi.mock('@/lib/analytics/events', () => ({
  trackAllowedEvent: vi.fn(),
}));

import { useCasinoStore } from '../useCasinoStore';
import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { getErrorSpy, resultId, setupTestEnv, teardownTestEnv } from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  teardownTestEnv();
});
describe('processGameResult — Validierung', () => {
  it('ignores a negative bet amount and never mutates history', () => {
    const before = useCasinoStore.getState().bets;

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: -10,
      multiplier: 2,
      payout: 0,
      win: false,
      resultId: resultId(1),
    });

    expect(useCasinoStore.getState().bets).toBe(before);
    expect(getErrorSpy()).toHaveBeenCalled();
  });

  it('ignores a bet above the configured max', () => {
    const before = useCasinoStore.getState().bets;
    const maxBet = useCasinoStore.getState().gameConfig.limits.betMax;

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: maxBet + 1,
      multiplier: 2,
      payout: 0,
      win: false,
      resultId: resultId(1),
    });

    expect(useCasinoStore.getState().bets).toBe(before);
  });

  it('ignores an invalid (negative) payout', () => {
    const before = useCasinoStore.getState().bets;

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: -1,
      win: false,
      resultId: resultId(1),
    });

    expect(useCasinoStore.getState().bets).toBe(before);
  });
});

describe('processGameResult — Happy Path', () => {
  it('records a winning bet, updates gameStats and plays the win sound', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(2),
    });

    const state = useCasinoStore.getState();
    expect(state.bets[0]).toMatchObject({ game: 'DICE', amount: 10, payout: 20, win: true });
    expect(state.gameStats.DICE).toEqual({ totalBets: 1, wins: 1, losses: 0, profit: 10 });
    expect(soundManager.playWinTier).toHaveBeenCalledWith('dice-win', 2);
  });

  it('records a losing bet, updates gameStats and plays the loss sound', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 0,
      payout: 0,
      win: false,
      resultId: resultId(3),
    });

    expect(useCasinoStore.getState().gameStats.DICE).toEqual({
      totalBets: 1,
      wins: 0,
      losses: 1,
      profit: -10,
    });
    expect(soundManager.playWinTier).toHaveBeenCalledWith('dice-loss', 0);
  });

  it('caps the bets history at 50 entries, newest first', () => {
    const filler = Array.from({ length: 50 }, (_, i) => ({
      id: `filler-${i}`,
      time: '00:00',
      game: 'DICE',
      user: 'You',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
    }));
    useCasinoStore.setState({ bets: filler });

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 5,
      multiplier: 2,
      payout: 10,
      win: true,
      resultId: resultId(4),
    });

    const { bets } = useCasinoStore.getState();
    expect(bets).toHaveLength(50);
    expect(bets[0].id).toBe(resultId(4));
  });

  it('only updates crashHistory for CRASH results with a defined crashMultiplier', () => {
    const before = useCasinoStore.getState().crashHistory;

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 5,
      multiplier: 2,
      payout: 10,
      win: true,
      resultId: resultId(5),
    });
    expect(useCasinoStore.getState().crashHistory).toBe(before);

    useCasinoStore.getState().processGameResult({
      game: 'CRASH',
      amount: 5,
      multiplier: 3,
      payout: 15,
      win: true,
      resultId: resultId(6),
      crashMultiplier: 3.2,
    });
    expect(useCasinoStore.getState().crashHistory[0]).toBe(3.2);
  });

  it('records multiplayer crash multipliers separately from the standard crash history', () => {
    useCasinoStore.setState({
      crashHistory: [1.5],
      multiplayerCrashHistory: [2.5],
    });

    useCasinoStore.getState().processGameResult({
      game: 'CRASH_MULTIPLAYER',
      amount: 5,
      multiplier: 2,
      payout: 10,
      win: true,
      resultId: resultId(23),
      crashMultiplier: 11.25,
    });

    expect(useCasinoStore.getState().multiplayerCrashHistory).toEqual([11.25, 2.5]);
    expect(useCasinoStore.getState().crashHistory).toEqual([1.5]);
  });

  it('flips communityGoalReached exactly once when the threshold is crossed and dispatches the event', () => {
    useCasinoStore.setState({
      communityWagered: 24995,
      communityGoal: 25000,
      communityGoalReached: false,
    });
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 0,
      win: false,
      resultId: resultId(7),
    });

    expect(useCasinoStore.getState().communityGoalReached).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'community-goal-reached' }),
    );

    dispatchSpy.mockClear();
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 0,
      win: false,
      resultId: resultId(8),
    });
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

describe('processGameResult — first_game_started analytics (2.9 M18)', () => {
  it('fires first_game_started with the game type when isFirstBet is true', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(50),
      isFirstBet: true,
    });

    expect(trackAllowedEvent).toHaveBeenCalledWith({
      name: 'first_game_started',
      props: { game: 'DICE' },
    });
  });

  it('does not fire first_game_started when isFirstBet is false', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(51),
      isFirstBet: false,
    });

    expect(trackAllowedEvent).not.toHaveBeenCalled();
  });

  it('does not fire first_game_started when isFirstBet is omitted (existing call sites unaffected)', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(52),
    });

    expect(trackAllowedEvent).not.toHaveBeenCalled();
  });

  it('never fires twice for a replayed resultId, even if isFirstBet is true both times', () => {
    const params = {
      game: 'DICE' as const,
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(53),
      isFirstBet: true,
    };
    useCasinoStore.getState().processGameResult(params);
    useCasinoStore.getState().processGameResult(params);

    expect(trackAllowedEvent).toHaveBeenCalledTimes(1);
  });
});

describe('processGameResult — Replay safety', () => {
  it('processes each canonical result UUID exactly once', () => {
    const params = {
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(21),
    };

    useCasinoStore.getState().processGameResult(params);
    useCasinoStore.getState().processGameResult(params);

    const state = useCasinoStore.getState();
    expect(state.bets).toHaveLength(1);
    expect(state.allBets).toHaveLength(1);
    expect(state.gameStats.DICE).toEqual({ totalBets: 1, wins: 1, losses: 0, profit: 10 });
    expect(state.communityWagered).toBe(10);
  });

  it('ignores a result without a canonical UUID', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: '',
    });

    const state = useCasinoStore.getState();
    expect(state.bets).toEqual([]);
    expect(state.allBets).toEqual([]);
    expect(state.gameStats.DICE).toEqual({ totalBets: 0, wins: 0, losses: 0, profit: 0 });
    expect(getErrorSpy()).toHaveBeenCalled();
  });

  it('accepts a canonical UUID without requiring version 4', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: '018f0c7a-8b6d-7def-8123-456789abcdef',
    });

    expect(useCasinoStore.getState().bets).toHaveLength(1);
  });

  it('keeps 256 result IDs and evicts the oldest ID first', () => {
    const firstResultId = resultId(100);
    const secondResultId = resultId(101);

    for (let index = 0; index < 257; index += 1) {
      useCasinoStore.getState().processGameResult({
        game: 'DICE',
        amount: 1,
        multiplier: 0,
        payout: 0,
        win: false,
        resultId: resultId(100 + index),
      });
    }

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 0,
      payout: 0,
      win: false,
      resultId: secondResultId,
    });
    expect(useCasinoStore.getState().gameStats.DICE.totalBets).toBe(257);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 0,
      payout: 0,
      win: false,
      resultId: firstResultId,
    });
    expect(useCasinoStore.getState().gameStats.DICE.totalBets).toBe(258);
  });

  it('returns a replay without scheduling a development-state sync', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.mocked(fetch).mockResolvedValue({ ok: true } as unknown as Response);
    const params = {
      game: 'DICE',
      amount: 1,
      multiplier: 0,
      payout: 0,
      win: false,
      resultId: resultId(500),
    };

    useCasinoStore.getState().processGameResult(params);
    vi.advanceTimersByTime(500);
    vi.mocked(fetch).mockClear();

    useCasinoStore.getState().processGameResult(params);
    vi.advanceTimersByTime(500);

    expect(fetch).not.toHaveBeenCalled();
  });
});
