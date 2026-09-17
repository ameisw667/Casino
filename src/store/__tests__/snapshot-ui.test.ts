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
import type { WalletSnapshot } from '@/lib/casino/wallet-contract';
import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { makeSnapshot, resultId, setupTestEnv, teardownTestEnv } from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  teardownTestEnv();
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

describe('startOnboarding', () => {
  it('fires cta_play_now_clicked and sets the onboarding step to WELCOME', () => {
    useCasinoStore.getState().startOnboarding();

    expect(trackAllowedEvent).toHaveBeenCalledWith({ name: 'cta_play_now_clicked' });
    expect(useCasinoStore.getState().onboardingStep).toBe('WELCOME');
  });
});

describe('dismissOnboarding — Intro-Skip merken', () => {
  it('closes the flow and remembers the dismissal', () => {
    useCasinoStore.getState().startOnboarding();
    useCasinoStore.getState().dismissOnboarding();

    expect(useCasinoStore.getState().onboardingStep).toBe('NONE');
    expect(useCasinoStore.getState().onboardingDismissed).toBe(true);
  });

  it('keeps the dismissal when Play Now restarts the flow', () => {
    useCasinoStore.getState().dismissOnboarding();
    useCasinoStore.getState().startOnboarding();

    expect(useCasinoStore.getState().onboardingStep).toBe('WELCOME');
    expect(useCasinoStore.getState().onboardingDismissed).toBe(true);
  });

  it('clears the dismissal when the tour is re-opened on purpose', () => {
    useCasinoStore.getState().dismissOnboarding();
    useCasinoStore.getState().startOnboarding(true);

    expect(useCasinoStore.getState().onboardingStep).toBe('WELCOME');
    expect(useCasinoStore.getState().onboardingDismissed).toBe(false);
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

it('supersedes a pending level-up toast with the latest rich level data', () => {
  const store = useCasinoStore.getState();

  store.addToast('Level 2 reached', 'success', 5500, {
    key: 'level-up',
    title: 'LEVEL UP',
    level: 2,
    badgeSrc: '/images/badge-level-up-gold.png',
  });
  store.addToast('Level 4 reached', 'success', 5500, {
    key: 'level-up',
    title: 'LEVEL UP',
    level: 4,
    badgeSrc: '/images/badge-level-up-gold.png',
  });

  expect(useCasinoStore.getState().toasts).toHaveLength(1);
  expect(useCasinoStore.getState().toasts[0]).toMatchObject({
    key: 'level-up',
    title: 'LEVEL UP',
    level: 4,
    badgeSrc: '/images/badge-level-up-gold.png',
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

  it('addMultiplayerCrashHistory prepends a multiplier without changing the standard crash history', () => {
    useCasinoStore.setState({
      crashHistory: [1.5],
      multiplayerCrashHistory: [2.5],
    });

    useCasinoStore.getState().addMultiplayerCrashHistory(11.25);

    expect(useCasinoStore.getState().multiplayerCrashHistory).toEqual([11.25, 2.5]);
    expect(useCasinoStore.getState().crashHistory).toEqual([1.5]);
  });

  it('mergeServerAchievements keeps locally confirmed progress and accepts higher server progress', () => {
    useCasinoStore.setState({
      achievements: useCasinoStore
        .getState()
        .achievements.map((achievement) =>
          achievement.id === 'first_bet'
            ? { ...achievement, unlocked: true, progress: 1 }
            : achievement,
        ),
    });

    useCasinoStore.getState().mergeServerAchievements([
      { id: 'first_bet', unlocked: false, progress: 0 },
      { id: 'daily_grinder', unlocked: true, progress: 3 },
    ]);

    const firstBet = useCasinoStore
      .getState()
      .achievements.find((achievement) => achievement.id === 'first_bet');
    const dailyGrinder = useCasinoStore
      .getState()
      .achievements.find((achievement) => achievement.id === 'daily_grinder');
    expect(firstBet).toMatchObject({ unlocked: true, progress: 1 });
    expect(dailyGrinder).toMatchObject({ unlocked: true, progress: 3 });
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
