import type { StateCreator } from 'zustand';
import {
  DEFAULT_ACHIEVEMENT_CONFIGS,
  mergeAchievementsWithConfig,
} from '@/lib/casino/achievements-config';
import type { CasinoState, AchievementsSlice } from './types';

const INITIAL_ACHIEVEMENTS = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);

export const createAchievementsSlice: StateCreator<CasinoState, [], [], AchievementsSlice> = (
  set,
) => ({
  achievements: INITIAL_ACHIEVEMENTS,
  achievementConfigs: DEFAULT_ACHIEVEMENT_CONFIGS,
  currentWinStreak: 0,

  unlockAchievement: (id) =>
    set((state) => ({
      achievements: state.achievements.map((ach) =>
        ach.id === id ? { ...ach, unlocked: true, progress: ach.total } : ach,
      ),
    })),

  mergeServerAchievements: (serverAchievements) => {
    if (!Array.isArray(serverAchievements) || serverAchievements.length === 0) return;
    const map = new Map(serverAchievements.map((a) => [a.id, a]));
    set((state) => ({
      achievements: state.achievements.map((ach) => {
        const serverVal = map.get(ach.id);
        if (!serverVal) return ach;
        return {
          ...ach,
          unlocked: ach.unlocked || Boolean(serverVal.unlocked),
          progress: Math.max(ach.progress, Number(serverVal.progress) || 0),
        };
      }),
    }));
  },
});
