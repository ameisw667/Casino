import type { StateCreator } from 'zustand';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  type VipTier,
  type Rank,
  DEFAULT_VIP_CONFIG,
  getVipTierByXp,
  getRankByLevel,
} from '@/lib/casino/vip-config';
import { type GameConfig } from '@/lib/casino/game-config';
import {
  type AchievementConfig,
  DEFAULT_ACHIEVEMENT_CONFIGS,
  mergeAchievementsWithConfig,
} from '@/lib/casino/achievements-config';
import {
  DEFAULT_GAME_CONFIG,
  getBetLimits,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
  getRouletteMultiplierWithConfig,
  calculateSlotsPayoutWithConfig,
  getBlackjackMaxPayoutFactor,
  validateBetWithConfig,
} from '@/lib/casino/game-config';
import type { CasinoState, WalletSnapshotSlice } from './types';

export const createWalletSnapshotSlice: StateCreator<CasinoState, [], [], WalletSnapshotSlice> = (
  set,
  get,
) => ({
  balance: 0,
  xp: 0,
  level: 1,
  rank: 'Bronze',
  vipTiers: DEFAULT_VIP_CONFIG.vipTiers,
  ranks: DEFAULT_VIP_CONFIG.ranks,
  gameConfig: DEFAULT_GAME_CONFIG,
  sessionId: null,

  loadVipConfig: async () => {
    try {
      const response = await fetch('/api/casino/config');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (response.headers?.get?.('content-type')?.includes('text/html')) {
        throw new Error('Received HTML response instead of JSON configuration');
      }
      const config = (await response.json()) as {
        vipTiers: VipTier[];
        ranks: Rank[];
        gameConfig: GameConfig;
        achievementConfigs?: AchievementConfig[];
      };
      const achievementConfigs = config.achievementConfigs ?? DEFAULT_ACHIEVEMENT_CONFIGS;
      set((state) => ({
        vipTiers: config.vipTiers,
        ranks: config.ranks,
        gameConfig: config.gameConfig ?? DEFAULT_GAME_CONFIG,
        achievementConfigs,
        achievements: mergeAchievementsWithConfig(state.achievements, achievementConfigs),
      }));
    } catch (error) {
      CasinoLogger.error('STORE', 'Failed to load VIP/game config, keeping defaults', error);
    }
  },

  loadGameConfig: async () => {
    try {
      const response = await fetch('/api/casino/config');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (response.headers?.get?.('content-type')?.includes('text/html')) {
        throw new Error('Received HTML response instead of JSON configuration');
      }
      const config = (await response.json()) as { gameConfig: GameConfig };
      set({ gameConfig: config.gameConfig ?? DEFAULT_GAME_CONFIG });
    } catch (error) {
      CasinoLogger.error('STORE', 'Failed to load game config, keeping defaults', error);
    }
  },

  getBetLimits: () => getBetLimits(get().gameConfig),

  getRouletteMultiplier: (betType) =>
    getRouletteMultiplierWithConfig(betType as never, get().gameConfig),

  getSlotsPayout: (symbols) => calculateSlotsPayoutWithConfig(symbols, get().gameConfig),

  getBlackjackMaxPayoutFactor: () => getBlackjackMaxPayoutFactor(get().gameConfig),

  validateBet: (betAmount, balance) => validateBetWithConfig(betAmount, balance, get().gameConfig),

  getXpGain: (wager, level = get().level) =>
    calculateXpGainWithConfig(wager, level, get().gameConfig),

  calculateLevel: (totalXp) => calculateLevelWithConfig(totalXp, get().gameConfig),

  getVipTierByXp: (xp = get().xp) => getVipTierByXp(get().vipTiers, xp),

  getRankByLevel: (level = get().level) => getRankByLevel(get().ranks, level),

  setSessionId: (sessionId) => set({ sessionId }),

  syncAnonymousSession: async () => {
    // Anonymous clients cannot submit authoritative XP or wallet state.
  },
  migrateAnonymousSession: async () => {
    // Server wallet provisioning replaces client-supplied session migration.
    return false;
  },

  addBalance: (_amount) => {
    get().addToast('Client-side wallet credits are disabled.', 'error');
  },
  removeBalance: (_amount) => false,
  calculateXp: (_wager) => {
    get().addToast('XP is updated only from a server wallet snapshot.', 'info');
  },
});
