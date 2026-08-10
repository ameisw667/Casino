import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ACHIEVEMENT_CONFIGS,
  evaluateAchievementConditions,
  getAchievementProgress,
  mergeAchievementsWithConfig,
  applyAchievementProgress,
  type AchievementStatSnapshot,
  type Achievement,
} from '../achievements-config';

function makeStats(overrides: Partial<AchievementStatSnapshot> = {}): AchievementStatSnapshot {
  return {
    game: 'DICE',
    betAmount: 1,
    payout: 0,
    win: false,
    multiplier: 1,
    level: 1,
    totalBetsCount: 0,
    winStreak: 0,
    ...overrides,
  };
}

describe('DEFAULT_ACHIEVEMENT_CONFIGS', () => {
  it('has exactly 9 active, uniquely-identified achievements', () => {
    expect(DEFAULT_ACHIEVEMENT_CONFIGS).toHaveLength(9);
    const ids = DEFAULT_ACHIEVEMENT_CONFIGS.map((c) => c.id);
    expect(new Set(ids).size).toBe(9);
    expect(DEFAULT_ACHIEVEMENT_CONFIGS.every((c) => c.isActive)).toBe(true);
  });

  it('every achievement has at least one condition and a positive total', () => {
    for (const config of DEFAULT_ACHIEVEMENT_CONFIGS) {
      expect(config.conditions.length).toBeGreaterThan(0);
      expect(config.total).toBeGreaterThan(0);
    }
  });
});

describe('evaluateAchievementConditions', () => {
  it('returns false for an empty condition list (fail-closed, never auto-unlocks)', () => {
    expect(evaluateAchievementConditions([], makeStats())).toBe(false);
  });

  it('requires all conditions to hold (implicit AND)', () => {
    const conditions = [
      { stat: 'multiplier' as const, op: 'gte' as const, value: 10, game: 'CRASH' },
    ];
    expect(
      evaluateAchievementConditions(conditions, makeStats({ game: 'ROULETTE', multiplier: 15 })),
    ).toBe(false);
    expect(
      evaluateAchievementConditions(conditions, makeStats({ game: 'CRASH', multiplier: 9.99 })),
    ).toBe(false);
    expect(
      evaluateAchievementConditions(conditions, makeStats({ game: 'CRASH', multiplier: 10 })),
    ).toBe(true);
  });

  it('fails closed on an unrecognized stat key instead of throwing', () => {
    const conditions = [{ stat: 'unknownStat' as never, op: 'gte' as const, value: 1 }];
    expect(() => evaluateAchievementConditions(conditions, makeStats())).not.toThrow();
    expect(evaluateAchievementConditions(conditions, makeStats())).toBe(false);
  });

  describe.each(DEFAULT_ACHIEVEMENT_CONFIGS.map((c) => [c.id, c] as const))(
    'achievement "%s"',
    (_id, config) => {
      it('is unlockable when its condition is met', () => {
        const boundary = config.conditions.reduce<Partial<AchievementStatSnapshot>>(
          (acc, condition) => ({
            ...acc,
            [condition.stat]: condition.value,
            ...(condition.game ? { game: condition.game } : {}),
          }),
          {},
        );
        expect(evaluateAchievementConditions(config.conditions, makeStats(boundary))).toBe(true);
      });
    },
  );
});

describe('getAchievementProgress', () => {
  it('clamps progress between 0 and total', () => {
    const config = DEFAULT_ACHIEVEMENT_CONFIGS.find((c) => c.id === 'high_roller')!;
    expect(getAchievementProgress(config, makeStats({ betAmount: -5 }))).toBe(0);
    expect(getAchievementProgress(config, makeStats({ betAmount: 400 }))).toBe(400);
    expect(getAchievementProgress(config, makeStats({ betAmount: 5000 }))).toBe(1000);
  });
});

describe('mergeAchievementsWithConfig', () => {
  it('builds fresh achievements (unlocked:false, progress:0) when no prior state exists', () => {
    const merged = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);
    expect(merged).toHaveLength(9);
    expect(merged.every((a) => !a.unlocked && a.progress === 0)).toBe(true);
    expect(merged.map((a) => a.id)).toEqual(DEFAULT_ACHIEVEMENT_CONFIGS.map((c) => c.id));
  });

  it('preserves unlocked/progress by id while refreshing title/description/icon from config', () => {
    const existing: Achievement[] = [
      {
        id: 'daily_grinder',
        title: 'stale title',
        description: 'stale description',
        icon: '📅',
        unlocked: true,
        progress: 50,
        total: 50,
      },
    ];
    const merged = mergeAchievementsWithConfig(existing, DEFAULT_ACHIEVEMENT_CONFIGS);
    const grinder = merged.find((a) => a.id === 'daily_grinder')!;
    expect(grinder.unlocked).toBe(true);
    expect(grinder.progress).toBe(50);
    expect(grinder.title).toBe('The Grinder');
    expect(grinder.icon).toBe('🔥');
  });

  it('drops inactive configs and sorts by sortOrder', () => {
    const configs = [
      { ...DEFAULT_ACHIEVEMENT_CONFIGS[0], sortOrder: 2 },
      { ...DEFAULT_ACHIEVEMENT_CONFIGS[1], sortOrder: 1 },
      { ...DEFAULT_ACHIEVEMENT_CONFIGS[2], isActive: false },
    ];
    const merged = mergeAchievementsWithConfig([], configs);
    expect(merged.map((a) => a.id)).toEqual([configs[1].id, configs[0].id]);
  });
});

describe('applyAchievementProgress', () => {
  it('unlocks first_bet on the first processed bet', () => {
    const achievements = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);
    const result = applyAchievementProgress(
      achievements,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ totalBetsCount: 1 }),
    );
    expect(result.find((a) => a.id === 'first_bet')!.unlocked).toBe(true);
  });

  it('never re-mutates an already-unlocked achievement', () => {
    const achievements = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);
    const afterUnlock = applyAchievementProgress(
      achievements,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ betAmount: 1000 }),
    );
    const unlocked = afterUnlock.find((a) => a.id === 'high_roller')!;
    expect(unlocked.unlocked).toBe(true);

    const afterSmallerBet = applyAchievementProgress(
      afterUnlock,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ betAmount: 1 }),
    );
    const stillUnlocked = afterSmallerBet.find((a) => a.id === 'high_roller')!;
    expect(stillUnlocked).toBe(unlocked); // same reference: no-op, not just same values
  });

  it('unlocks crash_master and moon_shot at their correct, independent thresholds', () => {
    const achievements = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);
    const at10x = applyAchievementProgress(
      achievements,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ game: 'CRASH', multiplier: 10 }),
    );
    expect(at10x.find((a) => a.id === 'crash_master')!.unlocked).toBe(true);
    expect(at10x.find((a) => a.id === 'moon_shot')!.unlocked).toBe(false);

    const at100x = applyAchievementProgress(
      at10x,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ game: 'CRASH', multiplier: 100 }),
    );
    expect(at100x.find((a) => a.id === 'moon_shot')!.unlocked).toBe(true);
  });

  it('unlocks lucky_streak only once winStreak reaches 5', () => {
    let achievements = mergeAchievementsWithConfig([], DEFAULT_ACHIEVEMENT_CONFIGS);
    for (let streak = 1; streak <= 4; streak++) {
      achievements = applyAchievementProgress(
        achievements,
        DEFAULT_ACHIEVEMENT_CONFIGS,
        makeStats({ win: true, winStreak: streak }),
      );
      expect(achievements.find((a) => a.id === 'lucky_streak')!.unlocked).toBe(false);
    }
    achievements = applyAchievementProgress(
      achievements,
      DEFAULT_ACHIEVEMENT_CONFIGS,
      makeStats({ win: true, winStreak: 5 }),
    );
    expect(achievements.find((a) => a.id === 'lucky_streak')!.unlocked).toBe(true);
  });

  it('ignores an achievement instance whose id has no matching config', () => {
    const achievements: Achievement[] = [
      {
        id: 'orphaned_id',
        title: 'x',
        description: 'x',
        icon: 'x',
        unlocked: false,
        progress: 0,
        total: 1,
      },
    ];
    const result = applyAchievementProgress(achievements, DEFAULT_ACHIEVEMENT_CONFIGS, makeStats());
    expect(result[0]).toBe(achievements[0]);
  });
});
