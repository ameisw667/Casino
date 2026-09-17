// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './helpers/mocks';
import { useCasinoStore } from '../useCasinoStore';
import {
  DEFAULT_GAME_CONFIG,
  calculateLevelWithConfig,
  calculateSlotsPayoutWithConfig,
  calculateXpGainWithConfig,
  getBetLimits,
  getBlackjackMaxPayoutFactor,
  getRouletteMultiplierWithConfig,
  validateBetWithConfig,
  type GameConfig,
} from '@/lib/casino/game-config';
import { getVipTierByXp, getRankByLevel } from '@/lib/casino/vip-config';
import { resultId, setupTestEnv, teardownTestEnv } from './helpers/store-fixture';

beforeEach(() => {
  setupTestEnv();
});

afterEach(() => {
  teardownTestEnv();
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
