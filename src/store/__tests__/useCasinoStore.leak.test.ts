// @vitest-environment jsdom
//
// B-I4: Guards the central partialize boundary after the L14 slice split. Each slice now lives in
// its own file, so a future edit to a slice could silently introduce a field that partialize() in
// the composite forgets to strip — re-persisting wallet/financial/transient state. These tests
// write wallet + per-slice fields directly via setState and assert the ACTUAL persisted JSON in
// localStorage never contains the forbidden keys (a live round-trip, not just a partialize() call).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCasinoStore } from '../useCasinoStore';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    play: vi.fn(),
    toggle: vi.fn(),
    setVolume: vi.fn(),
  },
}));
vi.mock('@/lib/analytics/events', () => ({
  trackAllowedEvent: vi.fn(),
}));

const INITIAL_STATE = useCasinoStore.getState();

const FORBIDDEN_KEYS = [
  'balance',
  'xp',
  'level',
  'rank',
  'bets',
  'allBets',
  'toasts',
  'isProcessing',
  'isMobile',
  '_hasHydrated',
  'sessionId',
  'gameConfig',
  'vipTiers',
  'ranks',
  'achievementConfigs',
] as const;

function readPersisted(): Record<string, unknown> {
  const raw = localStorage.getItem('casino-storage');
  if (!raw) return {};
  const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
  return parsed.state ?? {};
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  useCasinoStore.setState(INITIAL_STATE, true);
  localStorage.clear();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('partialize leak guards (B-I4)', () => {
  it('does not persist wallet fields when set directly via setState', () => {
    useCasinoStore.setState({
      balance: 999,
      xp: 5,
      level: 9,
      rank: 'Diamond',
    });

    const persisted = readPersisted();

    for (const key of ['balance', 'xp', 'level', 'rank'] as const) {
      expect(persisted).not.toHaveProperty(key);
    }
  });

  it('does not persist transient UI slice fields', () => {
    useCasinoStore.setState({
      toasts: [{ id: 'leak-1', type: 'info', message: 'x' }],
      isProcessing: true,
      isMobile: true,
      _hasHydrated: true,
    });

    const persisted = readPersisted();

    expect(persisted).not.toHaveProperty('toasts');
    expect(persisted).not.toHaveProperty('isProcessing');
    expect(persisted).not.toHaveProperty('isMobile');
    expect(persisted).not.toHaveProperty('_hasHydrated');
  });

  it('does not persist history slice bet/crash records', () => {
    useCasinoStore.setState({
      bets: [
        {
          id: 'leak-bet',
          time: 'now',
          game: 'DICE',
          user: 'You',
          amount: 1,
          multiplier: 2,
          payout: 2,
          win: true,
        },
      ],
      allBets: [
        {
          id: 'leak-live',
          user: 'You',
          game: 'DICE',
          amount: 1,
          multiplier: 2,
          payout: 2,
          time: 'now',
          isWin: true,
        },
      ],
      crashHistory: [1.5],
      multiplayerCrashHistory: [1.5],
    });

    const persisted = readPersisted();

    expect(persisted).not.toHaveProperty('bets');
    expect(persisted).not.toHaveProperty('allBets');
  });

  it('does not persist walletSnapshot slice config/singletons', () => {
    useCasinoStore.setState({
      sessionId: 'session-leak',
      gameConfig: { limits: { betMin: 0, betMax: 1 } } as never,
      vipTiers: [],
      ranks: [],
      achievementConfigs: [],
    });

    const persisted = readPersisted();

    expect(persisted).not.toHaveProperty('sessionId');
    expect(persisted).not.toHaveProperty('gameConfig');
    expect(persisted).not.toHaveProperty('vipTiers');
    expect(persisted).not.toHaveProperty('ranks');
    expect(persisted).not.toHaveProperty('achievementConfigs');
  });

  it('still persists allowed settings slice fields after the split', () => {
    useCasinoStore.setState({
      soundEnabled: false,
      soundVolume: 0.25,
      hideBalance: true,
      anonymousBetting: true,
      language: 'de',
      oddsFormat: 'american',
      affiliateRef: 'AFF-123',
      onboardingStep: 'COMPLETED',
    });

    const persisted = readPersisted();

    expect(persisted).toHaveProperty('soundEnabled', false);
    expect(persisted).toHaveProperty('soundVolume', 0.25);
    expect(persisted).toHaveProperty('hideBalance', true);
    expect(persisted).toHaveProperty('anonymousBetting', true);
    expect(persisted).toHaveProperty('language', 'de');
    expect(persisted).toHaveProperty('affiliateRef', 'AFF-123');
    expect(persisted).toHaveProperty('onboardingStep', 'COMPLETED');
  });

  it('does not persist any forbidden key after a broad state write', () => {
    const broadWrite: Record<string, unknown> = {};
    for (const key of FORBIDDEN_KEYS) {
      broadWrite[key] = 'leak';
    }
    useCasinoStore.setState(broadWrite as never);

    const persisted = readPersisted();

    for (const key of FORBIDDEN_KEYS) {
      expect(persisted).not.toHaveProperty(key);
    }
  });
});
