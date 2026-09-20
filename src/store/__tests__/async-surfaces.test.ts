// @vitest-environment jsdom
//
// Covers the store's async surfaces that the slice tests never reach: the XP poller started by
// processGameResult (scheduleXpSync's interval/then/catch arrows), the achievement-sync fetch
// rejection path, persist rehydration via the public persist API (skipHydration means
// onRehydrateStorage otherwise never runs in tests), and the memoized selector hooks.

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './helpers/mocks';
import { soundManager } from '@/lib/casino/sound-manager';
import {
  useCasinoStore,
  useSoundSettings,
  useVipRankInfo,
  useWalletBalance,
} from '../useCasinoStore';
import { makeSnapshot, resultId, setupTestEnv, teardownTestEnv } from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  cleanup();
  teardownTestEnv();
});

// The achievement sync POSTs /api/user/stats once per changed achievement (12 on the first
// processed bet), so the mock dispatches by URL instead of relying on call order.
function statsOk(): Promise<{ ok: boolean; json: () => Promise<unknown> }> {
  return Promise.resolve({ ok: true, json: async () => ({}) });
}

function startPollerWith(
  balanceHandler: (call: number) => Promise<unknown>,
): ReturnType<typeof vi.fn> {
  let balanceCalls = 0;
  const fetchMock = vi.fn((url: string) => {
    if (url === '/api/user/stats') return statsOk();
    if (url === '/api/user/balance') {
      balanceCalls += 1;
      return balanceHandler(balanceCalls);
    }
    return Promise.resolve({ ok: false });
  });
  vi.stubGlobal('fetch', fetchMock);
  useCasinoStore.getState().processGameResult({
    game: 'DICE',
    amount: 1,
    multiplier: 1,
    payout: 0,
    win: false,
    resultId: resultId(1),
  });
  return fetchMock;
}

describe('XP poller (scheduleXpSync via processGameResult)', () => {
  it('polls /api/user/balance, applies the snapshot, and stops after 5 attempts', async () => {
    const fetchMock = startPollerWith(() =>
      Promise.resolve({ ok: true, json: async () => ({ data: makeSnapshot({ balance: 777 }) }) }),
    );

    await vi.advanceTimersByTimeAsync(1200);
    expect(fetchMock).toHaveBeenCalledWith('/api/user/balance', { cache: 'no-store' });
    expect(useCasinoStore.getState().balance).toBe(777);

    await vi.advanceTimersByTimeAsync(1200 * 4);
    const balanceCalls = fetchMock.mock.calls.filter((c) => c[0] === '/api/user/balance');
    expect(balanceCalls).toHaveLength(5);

    await vi.advanceTimersByTimeAsync(12000);
    expect(fetchMock.mock.calls.filter((c) => c[0] === '/api/user/balance')).toHaveLength(5);
  });

  it('ignores a non-ok response, survives a rejected fetch, applies on recovery', async () => {
    startPollerWith((call) => {
      if (call === 1) return Promise.resolve({ ok: false, json: async () => null });
      if (call === 2) return Promise.reject(new Error('network down'));
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: makeSnapshot({ balance: 42 }) }),
      });
    });

    await vi.advanceTimersByTimeAsync(1200);
    expect(useCasinoStore.getState().balance).toBe(0);

    await vi.advanceTimersByTimeAsync(1200);
    expect(useCasinoStore.getState().balance).toBe(0);

    await vi.advanceTimersByTimeAsync(1200);
    expect(useCasinoStore.getState().balance).toBe(42);
  });
});

describe('achievement sync fetch failure', () => {
  it('still unlocks and swallows the rejected /api/user/stats POST', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('stats sync offline'));
    vi.stubGlobal('fetch', fetchMock);

    useCasinoStore.getState().processGameResult({
      game: 'DICE',
      amount: 1,
      multiplier: 1,
      payout: 0,
      win: false,
      resultId: resultId(2),
    });

    await vi.advanceTimersByTimeAsync(1200);

    const firstBet = useCasinoStore.getState().achievements.find((a) => a.id === 'first_bet')!;
    expect(firstBet.unlocked).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/user/stats',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('persist rehydration (onRehydrateStorage)', () => {
  it('applies persisted sound settings and mirrors them to soundManager', async () => {
    localStorage.setItem(
      'casino-storage',
      JSON.stringify({ state: { soundEnabled: false, soundVolume: 0.5 }, version: 4 }),
    );

    await useCasinoStore.persist.rehydrate();

    const state = useCasinoStore.getState();
    expect(state.soundEnabled).toBe(false);
    expect(state.soundVolume).toBe(0.5);
    expect(soundManager.toggle).toHaveBeenCalledWith(false);
    expect(soundManager.setVolume).toHaveBeenCalledWith(0.5);
  });
});

describe('memoized selector hooks', () => {
  it('useWalletBalance tracks balance and hideBalance', () => {
    const wallet = renderHook(() => useWalletBalance());
    expect(wallet.result.current.balance).toBe(0);
    act(() => useCasinoStore.setState({ balance: 123, hideBalance: true }));
    expect(wallet.result.current).toEqual({ balance: 123, hideBalance: true });
  });

  it('useVipRankInfo tracks level, xp, rank and vipTiers', () => {
    const vip = renderHook(() => useVipRankInfo());
    act(() => useCasinoStore.setState({ level: 5, xp: 250, rank: 'Gold' }));
    expect(vip.result.current).toMatchObject({ level: 5, xp: 250, rank: 'Gold' });
  });

  it('useSoundSettings tracks toggleSound side effects', () => {
    const sound = renderHook(() => useSoundSettings());
    act(() => useCasinoStore.getState().toggleSound());
    expect(sound.result.current.soundEnabled).toBe(false);
  });
});
