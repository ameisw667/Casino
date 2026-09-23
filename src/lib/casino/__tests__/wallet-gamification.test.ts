import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletGamification } from '../wallet-gamification';
import { WalletService } from '../wallet';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSupabaseMock, type SupabaseMock } from './helpers/supabase-mock';

// 03c-W3 L4: Modul-Smoke-Netz für die ausgelagerte Gamification-Domäne
// (vorher: syncAchievement 1 Aufruf im Bestand, getJackpotPool/getDailyRaceStandings 0).

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

const USER_ID = 'user_123';
const REQUEST_ID = '22222222-2222-4222-8222-222222222222';

let mock: SupabaseMock;

beforeEach(() => {
  mock = createSupabaseMock();
  vi.mocked(createAdminClient).mockReturnValue(
    mock.client as unknown as ReturnType<typeof createAdminClient>,
  );
});

describe('WalletGamification.getUserStats', () => {
  it('passes the RPC payload through and defaults a missing perGame', async () => {
    mock.state.rpcResult = {
      data: {
        totalBets: 5,
        totalWins: 2,
        totalWagered: 50,
        totalPayout: 60,
        totalProfit: 10,
        winRate: 0.4,
        achievements: [{ id: 'a1', unlocked: true, progress: 1 }],
      },
      error: null,
    };

    const stats = await WalletGamification.getUserStats(USER_ID);

    expect(stats.totalBets).toBe(5);
    expect(stats.perGame).toEqual([]);
    expect(mock.client.rpc).toHaveBeenCalledWith('get_user_stats', { p_user_id: USER_ID });
  });

  it('returns the documented zero defaults when the RPC fails', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    const stats = await WalletGamification.getUserStats(USER_ID);

    expect(stats).toEqual({
      totalBets: 0,
      totalWins: 0,
      totalWagered: 0,
      totalPayout: 0,
      totalProfit: 0,
      winRate: 0,
      achievements: [],
      perGame: [],
    });
  });
});

describe('WalletGamification.syncAchievement', () => {
  it('forwards the achievement payload to sync_user_achievement', async () => {
    mock.state.rpcResult = { data: null, error: null };

    await WalletGamification.syncAchievement({
      userId: USER_ID,
      achievementId: 'a1',
      progress: 1,
      unlocked: true,
    });

    expect(mock.client.rpc).toHaveBeenCalledWith('sync_user_achievement', {
      p_user_id: USER_ID,
      p_achievement_id: 'a1',
      p_progress: 1,
      p_unlocked: true,
    });
  });

  it('swallows RPC errors (achievements are never money-critical)', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletGamification.syncAchievement({
        userId: USER_ID,
        achievementId: 'a1',
        progress: 1,
        unlocked: true,
      }),
    ).resolves.toBeUndefined();
  });
});

describe('WalletGamification.getJackpotPool', () => {
  it('reads get_jackpot_pool_public', async () => {
    mock.state.rpcResult = {
      data: { currentAmount: 1234.5, lastWonAt: '2026-09-01T00:00:00.000Z' },
      error: null,
    };

    await expect(WalletGamification.getJackpotPool()).resolves.toEqual({
      currentAmount: 1234.5,
      lastWonAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('falls back to a safe zero instead of a fabricated amount', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(WalletGamification.getJackpotPool()).resolves.toEqual({
      currentAmount: 0,
      lastWonAt: null,
    });
  });
});

describe('WalletGamification.getDailyRaceStandings', () => {
  it('returns parsed standings plus the UTC countdown', async () => {
    mock.state.rpcResult = {
      data: [{ rank: 1, username: 'a', wagered: 10, prize: 20 }],
      error: null,
    };

    const snapshot = await WalletGamification.getDailyRaceStandings();

    expect(snapshot.standings).toEqual([{ rank: 1, username: 'a', wagered: 10, prize: 20 }]);
    expect(snapshot.secondsUntilResetUtc).toBeGreaterThanOrEqual(0);
    expect(snapshot.secondsUntilResetUtc).toBeLessThanOrEqual(86_400);
  });

  it('returns an empty ranking on any shape error, never a guessed one', async () => {
    mock.state.rpcResult = { data: [{ nonsense: true }], error: null };

    const snapshot = await WalletGamification.getDailyRaceStandings();

    expect(snapshot.standings).toEqual([]);
  });
});

describe('WalletGamification.emitBigWinNotifyEvent', () => {
  it('emits the outbox event with the caller requestId', async () => {
    mock.state.rpcResult = { data: null, error: null };

    await WalletGamification.emitBigWinNotifyEvent({
      userId: USER_ID,
      requestId: REQUEST_ID,
      game: 'CRASH',
      payout: 500,
      multiplier: 10,
    });

    expect(mock.client.rpc).toHaveBeenCalledWith('emit_big_win_notify_event', {
      p_user_id: USER_ID,
      p_request_id: REQUEST_ID,
      p_game: 'CRASH',
      p_payout: 500,
      p_multiplier: 10,
    });
  });

  it('throws when the outbox RPC fails', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    await expect(
      WalletGamification.emitBigWinNotifyEvent({
        userId: USER_ID,
        requestId: REQUEST_ID,
        game: 'CRASH',
        payout: 500,
        multiplier: 10,
      }),
    ).rejects.toThrow('Failed to emit big-win notify event');
  });
});

describe('WalletService façade', () => {
  it('delegates the gamification methods to the module', async () => {
    mock.state.rpcResult = { data: null, error: { message: 'boom' } };

    const delegates = [
      vi.spyOn(WalletGamification, 'getUserStats'),
      vi.spyOn(WalletGamification, 'syncAchievement'),
      vi.spyOn(WalletGamification, 'getDailyRaceStandings'),
    ];

    await WalletService.getJackpotPool();
    // Gamification ist nie geldkritisch und wirft auf Fehlerpfaden nicht (Default-Objekte);
    // der Fehler-Mock genügt, die Delegation belegen die Spies.
    await WalletService.getUserStats(USER_ID);
    await WalletService.syncAchievement({
      userId: USER_ID,
      achievementId: 'a1',
      progress: 1,
      unlocked: true,
    });
    await WalletService.getDailyRaceStandings();

    expect(mock.client.rpc).toHaveBeenCalledWith('get_jackpot_pool_public');
    for (const delegate of delegates) expect(delegate).toHaveBeenCalledTimes(1);
  });
});
