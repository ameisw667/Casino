// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCasinoStore } from '../useCasinoStore';
import {
  DEFAULT_GAME_CONFIG,
  getBetLimits,
  validateBetWithConfig,
  getRouletteMultiplierWithConfig,
  calculateSlotsPayoutWithConfig,
  getBlackjackMaxPayoutFactor,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
  type GameConfig,
} from '@/lib/casino/game-config';
import { getVipTierByXp, getRankByLevel } from '@/lib/casino/vip-config';
import type { WalletSnapshot } from '@/lib/casino/wallet-contract';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    play: vi.fn(),
    toggle: vi.fn(),
    setVolume: vi.fn(),
  },
}));

import { soundManager } from '@/lib/casino/sound-manager';

const INITIAL_STATE = useCasinoStore.getState();
const SAMPLE_TRANSACTION_ID = '11111111-1111-4111-8111-111111111111';

let errorSpy: ReturnType<typeof vi.spyOn>;
let resultIdSequenceBase = 0;

function resultId(sequence: number): string {
  return `00000000-0000-4000-8000-${(resultIdSequenceBase + sequence).toString().padStart(12, '0')}`;
}

function makeSnapshot(overrides: Partial<WalletSnapshot> = {}): WalletSnapshot {
  return {
    balance: 100,
    xp: 5,
    level: 2,
    rank: 'Bronze',
    transactionId: SAMPLE_TRANSACTION_ID,
    ...overrides,
  };
}

beforeEach(() => {
  resultIdSequenceBase += 1000;
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  useCasinoStore.setState(INITIAL_STATE, true);
  localStorage.clear();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  errorSpy.mockRestore();
  vi.clearAllMocks();
});

describe('initial state', () => {
  it('starts with a zero wallet and default rank', () => {
    const state = useCasinoStore.getState();
    expect(state.balance).toBe(0);
    expect(state.level).toBe(1);
    expect(state.rank).toBe('Bronze');
    expect(state.bets).toEqual([]);
    expect(state.allBets).toEqual([]);
  });
});

describe('applyServerWalletSnapshot', () => {
  it('adopts balance/xp/level/rank from a valid server snapshot', () => {
    useCasinoStore
      .getState()
      .applyServerWalletSnapshot(makeSnapshot({ balance: 250.5, xp: 40, level: 3, rank: 'Gold' }));

    const state = useCasinoStore.getState();
    expect(state.balance).toBe(250.5);
    expect(state.xp).toBe(40);
    expect(state.level).toBe(3);
    expect(state.rank).toBe('Gold');
  });

  it('throws on an invalid snapshot instead of silently applying it', () => {
    expect(() =>
      useCasinoStore.getState().applyServerWalletSnapshot(makeSnapshot({ balance: -5 })),
    ).toThrow();

    expect(useCasinoStore.getState().balance).toBe(0);
  });
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
    expect(errorSpy).toHaveBeenCalled();
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
    expect(soundManager.play).toHaveBeenCalledWith('dice-win');
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
    expect(soundManager.play).toHaveBeenCalledWith('dice-loss');
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
    expect(state.communityWagered).toBe(8430.5);
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
    expect(errorSpy).toHaveBeenCalled();
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

describe('Fail-closed lokale Finanz-/Progressions-Aktionen (Regressionsschutz)', () => {
  it('addBalance never changes balance', () => {
    useCasinoStore.getState().addBalance(1000);
    expect(useCasinoStore.getState().balance).toBe(0);
  });

  it('removeBalance returns false and never changes balance', () => {
    useCasinoStore.setState({ balance: 50 });
    const result = useCasinoStore.getState().removeBalance(10);
    expect(result).toBe(false);
    expect(useCasinoStore.getState().balance).toBe(50);
  });

  it('redeemCode handles promo code redemption response', async () => {
    const result = await useCasinoStore.getState().redeemCode('FREEBIE');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });
});

describe('anonyme Session-Migration (Regressionsschutz — bewusst deaktiviert)', () => {
  it('syncAnonymousSession is a no-op', async () => {
    const before = useCasinoStore.getState();
    await useCasinoStore.getState().syncAnonymousSession();
    expect(useCasinoStore.getState()).toEqual(before);
  });

  it('migrateAnonymousSession always returns false without mutating state', async () => {
    const before = useCasinoStore.getState();
    const result = await useCasinoStore.getState().migrateAnonymousSession();
    expect(result).toBe(false);
    expect(useCasinoStore.getState()).toEqual(before);
  });
});

describe('initialize', () => {
  it('applies the server wallet snapshot on success', async () => {
    const snapshot = makeSnapshot({ balance: 42, xp: 7, level: 2, rank: 'Silver' });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => snapshot,
    } as unknown as Response);

    await useCasinoStore.getState().initialize();

    expect(useCasinoStore.getState().balance).toBe(42);
    expect(useCasinoStore.getState().rank).toBe('Silver');
  });

  it('fails closed on a non-ok response without throwing or resetting balance', async () => {
    useCasinoStore.setState({ balance: 15 });
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as unknown as Response);

    await expect(useCasinoStore.getState().initialize()).resolves.toBeUndefined();
    expect(useCasinoStore.getState().balance).toBe(15);
  });

  it('fails closed on a network error without throwing', async () => {
    useCasinoStore.setState({ balance: 15 });
    vi.mocked(fetch).mockRejectedValue(new Error('network down'));

    await expect(useCasinoStore.getState().initialize()).resolves.toBeUndefined();
    expect(useCasinoStore.getState().balance).toBe(15);
  });
});

describe('Config-Delegations-Wrapper', () => {
  it('getBetLimits forwards the current gameConfig', () => {
    const customConfig: GameConfig = {
      ...DEFAULT_GAME_CONFIG,
      limits: { betMin: 1, betMax: 50, maxBetHardcap: 1000 },
    };
    useCasinoStore.setState({ gameConfig: customConfig });

    expect(useCasinoStore.getState().getBetLimits()).toEqual(getBetLimits(customConfig));
  });

  it('validateBet forwards gameConfig and balance', () => {
    expect(useCasinoStore.getState().validateBet(5, 10)).toEqual(
      validateBetWithConfig(5, 10, useCasinoStore.getState().gameConfig),
    );
  });

  it('getRouletteMultiplier forwards gameConfig', () => {
    const betType = { type: 'COLOR', value: 'RED' };
    expect(useCasinoStore.getState().getRouletteMultiplier(betType)).toEqual(
      getRouletteMultiplierWithConfig(betType as never, useCasinoStore.getState().gameConfig),
    );
  });

  it('getSlotsPayout forwards gameConfig', () => {
    expect(useCasinoStore.getState().getSlotsPayout([1, 1, 1])).toEqual(
      calculateSlotsPayoutWithConfig([1, 1, 1], useCasinoStore.getState().gameConfig),
    );
  });

  it('getBlackjackMaxPayoutFactor forwards gameConfig', () => {
    expect(useCasinoStore.getState().getBlackjackMaxPayoutFactor()).toBe(
      getBlackjackMaxPayoutFactor(useCasinoStore.getState().gameConfig),
    );
  });

  it('getXpGain forwards gameConfig and the current level by default', () => {
    useCasinoStore.setState({ level: 5 });
    expect(useCasinoStore.getState().getXpGain(100)).toBe(
      calculateXpGainWithConfig(100, 5, useCasinoStore.getState().gameConfig),
    );
  });

  it('calculateLevel forwards gameConfig', () => {
    expect(useCasinoStore.getState().calculateLevel(5000)).toBe(
      calculateLevelWithConfig(5000, useCasinoStore.getState().gameConfig),
    );
  });

  it('getVipTierByXp forwards the current vipTiers and xp', () => {
    useCasinoStore.setState({ xp: 300 });
    expect(useCasinoStore.getState().getVipTierByXp()).toEqual(
      getVipTierByXp(useCasinoStore.getState().vipTiers, 300),
    );
  });

  it('getRankByLevel forwards the current ranks and level', () => {
    useCasinoStore.setState({ level: 12 });
    expect(useCasinoStore.getState().getRankByLevel()).toEqual(
      getRankByLevel(useCasinoStore.getState().ranks, 12),
    );
  });
});

describe('setAutoBetSettings', () => {
  it('merges into one game without touching the sibling game config', () => {
    useCasinoStore.getState().setAutoBetSettings('dice', { amount: 25 });

    const state = useCasinoStore.getState();
    expect(state.autoBetSettings.dice.amount).toBe(25);
    expect(state.autoBetSettings.crash.amount).toBe(1);
  });
});

describe('addToast', () => {
  it('auto-removes the toast after its duration', () => {
    useCasinoStore.getState().addToast('Test', 'info', 1000);
    expect(useCasinoStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(1000);

    expect(useCasinoStore.getState().toasts).toHaveLength(0);
  });
});

describe('einfache UI-/Settings-Aktionen', () => {
  it('setIsMobile/setIsProcessing/setIsChatOpen/setIsLoading/setHasHydrated toggle their own flag only', () => {
    useCasinoStore.getState().setIsMobile(true);
    useCasinoStore.getState().setIsProcessing(true);
    useCasinoStore.getState().setIsChatOpen(true);
    useCasinoStore.getState().setIsLoading(true);
    useCasinoStore.getState().setHasHydrated(true);

    const state = useCasinoStore.getState();
    expect(state.isMobile).toBe(true);
    expect(state.isProcessing).toBe(true);
    expect(state.isChatOpen).toBe(true);
    expect(state.isLoading).toBe(true);
    expect(state._hasHydrated).toBe(true);
  });

  it('setSessionId/setAffiliateRef store the given value', () => {
    useCasinoStore.getState().setSessionId('sess-1');
    useCasinoStore.getState().setAffiliateRef('ref-1');

    expect(useCasinoStore.getState().sessionId).toBe('sess-1');
    expect(useCasinoStore.getState().affiliateRef).toBe('ref-1');
  });

  it('updateSettings merges partial settings and forwards volume/toggle to soundManager', () => {
    useCasinoStore
      .getState()
      .updateSettings({ soundVolume: 0.2, soundEnabled: false, language: 'de' });

    expect(soundManager.setVolume).toHaveBeenCalledWith(0.2);
    expect(soundManager.toggle).toHaveBeenCalledWith(false);
    expect(useCasinoStore.getState().language).toBe('de');
  });

  it('toggleSound flips soundEnabled and forwards the new value', () => {
    const before = useCasinoStore.getState().soundEnabled;
    useCasinoStore.getState().toggleSound();

    expect(useCasinoStore.getState().soundEnabled).toBe(!before);
    expect(soundManager.toggle).toHaveBeenCalledWith(!before);
  });

  it('resetGameStats resets a single game when given, all games otherwise', () => {
    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 10,
      multiplier: 2,
      payout: 20,
      win: true,
      resultId: resultId(2),
    });
    useCasinoStore.getState().resetGameStats('DICE');
    expect(useCasinoStore.getState().gameStats.DICE).toEqual({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
    });

    useCasinoStore.getState().processGameResult({
      game: 'ROULETTE',
      amount: 10,
      multiplier: 2,
      payout: 0,
      win: false,
      resultId: resultId(3),
    });
    useCasinoStore.getState().resetGameStats();
    expect(useCasinoStore.getState().gameStats.ROULETTE).toEqual({
      totalBets: 0,
      wins: 0,
      losses: 0,
      profit: 0,
    });
  });

  it('addChatMessage appends a message and caps history at 50', () => {
    useCasinoStore.getState().addChatMessage({ user: 'Jan', rank: 'VIP', message: 'gg' });
    const messages = useCasinoStore.getState().chatMessages;
    expect(messages[messages.length - 1]).toMatchObject({ user: 'Jan', message: 'gg' });
  });

  it('addLiveBet prepends a bet and caps allBets at 30', () => {
    useCasinoStore.getState().addLiveBet({
      user: 'Jan',
      game: 'DICE',
      amount: 5,
      multiplier: 2,
      payout: 10,
      isWin: true,
    });
    expect(useCasinoStore.getState().allBets[0]).toMatchObject({ user: 'Jan', isWin: true });
  });

  it('startOnboarding/setOnboardingStep set the onboarding step', () => {
    useCasinoStore.getState().startOnboarding();
    expect(useCasinoStore.getState().onboardingStep).toBe('WELCOME');

    useCasinoStore.getState().setOnboardingStep('COMPLETED');
    expect(useCasinoStore.getState().onboardingStep).toBe('COMPLETED');
  });

  it('calculateXp is a disabled no-op that only shows an info toast', () => {
    useCasinoStore.getState().calculateXp(100);
    expect(useCasinoStore.getState().xp).toBe(0);
    expect(useCasinoStore.getState().toasts).toHaveLength(1);
  });

  it('addCrashHistory only prepends the multiplier (achievement evaluation lives in processGameResult)', () => {
    useCasinoStore.getState().addCrashHistory(15);
    expect(useCasinoStore.getState().crashHistory[0]).toBe(15);
    expect(useCasinoStore.getState().achievements.find((a) => a.id === 'moon_shot')!.unlocked).toBe(
      false,
    );
  });

  it('setProvablyFairSettings merges partial settings', () => {
    useCasinoStore.getState().setProvablyFairSettings({ nonce: 7 });
    expect(useCasinoStore.getState().provablyFairSettings.nonce).toBe(7);
    expect(useCasinoStore.getState().provablyFairSettings.clientSeed).toBe('vibe-coder-default');
  });

  it('unlockAchievement force-unlocks a specific achievement', () => {
    useCasinoStore.getState().unlockAchievement('daily_grinder');
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'daily_grinder')!.unlocked,
    ).toBe(true);
  });

  it('removeToast removes a toast by id independent of its timer', () => {
    useCasinoStore.getState().addToast('A', 'info', 5000);
    const id = useCasinoStore.getState().toasts[0].id;

    useCasinoStore.getState().removeToast(id);

    expect(useCasinoStore.getState().toasts).toHaveLength(0);
  });

  it('clearToasts empties the toast list', () => {
    useCasinoStore.getState().addToast('A');
    useCasinoStore.getState().addToast('B');
    useCasinoStore.getState().clearToasts();

    expect(useCasinoStore.getState().toasts).toHaveLength(0);
  });

  it('dismissMartingaleWarning clears the flag when responsibleGaming is set', () => {
    useCasinoStore.setState({
      responsibleGaming: { sessionDuration: 0, sessionLoss: 0, martingaleDetected: true },
    });

    useCasinoStore.getState().dismissMartingaleWarning();

    expect(useCasinoStore.getState().responsibleGaming?.martingaleDetected).toBe(false);
  });
});

describe('loadVipConfig / loadGameConfig', () => {
  it('loadVipConfig adopts vipTiers/ranks/gameConfig from the API on success', async () => {
    const customConfig = {
      ...DEFAULT_GAME_CONFIG,
      limits: { betMin: 2, betMax: 20, maxBetHardcap: 1000 },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ vipTiers: [], ranks: [], gameConfig: customConfig }),
    } as unknown as Response);

    await useCasinoStore.getState().loadVipConfig();

    expect(useCasinoStore.getState().gameConfig).toEqual(customConfig);
  });

  it('loadVipConfig keeps defaults on a failed fetch', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as unknown as Response);

    await useCasinoStore.getState().loadVipConfig();

    expect(useCasinoStore.getState().gameConfig).toEqual(DEFAULT_GAME_CONFIG);
  });

  it('loadVipConfig merges fresh achievementConfigs into achievements, preserving unlocked/progress', async () => {
    useCasinoStore.getState().unlockAchievement('high_roller');
    expect(
      useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!.unlocked,
    ).toBe(true);

    const customAchievementConfigs = [
      {
        id: 'high_roller',
        title: 'Renamed Whale',
        description: 'updated description',
        icon: '🐋',
        total: 1000,
        progressStat: 'betAmount' as const,
        conditions: [{ stat: 'betAmount' as const, op: 'gte' as const, value: 1000 }],
        sortOrder: 1,
        isActive: true,
      },
    ];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        vipTiers: [],
        ranks: [],
        gameConfig: DEFAULT_GAME_CONFIG,
        achievementConfigs: customAchievementConfigs,
      }),
    } as unknown as Response);

    await useCasinoStore.getState().loadVipConfig();

    const merged = useCasinoStore.getState().achievements.find((a) => a.id === 'high_roller')!;
    expect(merged.title).toBe('Renamed Whale');
    expect(merged.unlocked).toBe(true); // preserved across the config refresh
  });

  it('loadGameConfig adopts gameConfig from the API on success', async () => {
    const customConfig = {
      ...DEFAULT_GAME_CONFIG,
      limits: { betMin: 3, betMax: 30, maxBetHardcap: 1000 },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ gameConfig: customConfig }),
    } as unknown as Response);

    await useCasinoStore.getState().loadGameConfig();

    expect(useCasinoStore.getState().gameConfig).toEqual(customConfig);
  });

  it('loadGameConfig keeps defaults on a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));

    await useCasinoStore.getState().loadGameConfig();

    expect(useCasinoStore.getState().gameConfig).toEqual(DEFAULT_GAME_CONFIG);
  });
});

describe('syncToFile', () => {
  it('does nothing outside development', () => {
    vi.stubEnv('NODE_ENV', 'test');
    useCasinoStore.getState().syncToFile();
    vi.advanceTimersByTime(1000);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('is a no-op and does not send requests to deprecated local endpoints', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.mocked(fetch).mockResolvedValue({ ok: true } as unknown as Response);

    useCasinoStore.getState().syncToFile();
    vi.advanceTimersByTime(500);

    expect(fetch).not.toHaveBeenCalledWith('/api/local/state', expect.anything());
  });
});

describe('persist configuration', () => {
  it('migrate() strips all wallet fields from persisted state', () => {
    const options = useCasinoStore.persist.getOptions();
    const migrate = options.migrate as unknown as (
      state: unknown,
      version: number,
    ) => Record<string, unknown>;

    const legacy = {
      balance: 999,
      xp: 999,
      level: 99,
      rank: 'Diamond',
      soundEnabled: true,
    };

    const migrated = migrate(legacy, 1);

    expect(migrated.balance).toBeUndefined();
    expect(migrated.xp).toBeUndefined();
    expect(migrated.level).toBeUndefined();
    expect(migrated.rank).toBeUndefined();
    expect(migrated.soundEnabled).toBe(true);
  });

  it('removes legacy persisted bet histories during migration', () => {
    const options = useCasinoStore.persist.getOptions();
    const migrate = options.migrate as unknown as (
      state: unknown,
      version: number,
    ) => Record<string, unknown>;

    const migrated = migrate(
      {
        bets: [{ id: resultId(22), game: 'DICE', amount: 10 }],
        allBets: [{ id: resultId(22), game: 'DICE', amount: 10 }],
        soundEnabled: true,
      },
      2,
    );

    expect(migrated.bets).toBeUndefined();
    expect(migrated.allBets).toBeUndefined();
    expect(migrated.soundEnabled).toBe(true);
  });
  it('partialize() excludes wallet + transient UI fields from persistence', () => {
    const options = useCasinoStore.persist.getOptions();
    const partialize = options.partialize as unknown as (
      state: ReturnType<typeof useCasinoStore.getState>,
    ) => Record<string, unknown>;

    const persisted = partialize(useCasinoStore.getState());

    for (const key of [
      'balance',
      'xp',
      'level',
      'rank',
      'toasts',
      'isProcessing',
      'isMobile',
      '_hasHydrated',
      'sessionId',
      'gameConfig',
      'vipTiers',
      'ranks',
      'bets',
      'allBets',
      'processedResultIds',
    ]) {
      expect(persisted).not.toHaveProperty(key);
    }
    expect(persisted).toHaveProperty('soundEnabled');
  });
});
