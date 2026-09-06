export type AchievementStatKey =
  'totalBetsCount' | 'betAmount' | 'payout' | 'level' | 'multiplier' | 'winStreak';

export type AchievementConditionOp = 'gte' | 'gt' | 'lte' | 'lt' | 'eq';
export type AchievementVisibility = 'visible' | 'secret';

/** Fails closed so malformed public configuration never becomes hidden UI content. */
export function normalizeAchievementVisibility(value: unknown): AchievementVisibility {
  return value === 'secret' ? 'secret' : 'visible';
}

export interface AchievementCondition {
  stat: AchievementStatKey;
  op: AchievementConditionOp;
  value: number;
  /** Optional scope: condition only applies when stats.game matches (case-sensitive). */
  game?: string;
}

export interface AchievementConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  total: number;
  progressStat: AchievementStatKey;
  conditions: AchievementCondition[];
  sortOrder: number;
  isActive: boolean;
  visibility: AchievementVisibility;
}

export interface AchievementStatSnapshot {
  game: string;
  betAmount: number;
  payout: number;
  win: boolean;
  multiplier: number;
  level: number;
  totalBetsCount: number;
  winStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
  visibility: AchievementVisibility;
}

export const DEFAULT_ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  {
    id: 'first_bet',
    title: 'First Steps',
    description: 'Place your first bet',
    icon: '/images/ach-target-3d.png',
    total: 1,
    progressStat: 'totalBetsCount',
    conditions: [{ stat: 'totalBetsCount', op: 'gte', value: 1 }],
    sortOrder: 1,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'high_roller',
    title: 'The Whale',
    description: 'Wager $1,000 in a single bet',
    icon: '/images/ach-whale-3d.png',
    total: 1000,
    progressStat: 'betAmount',
    conditions: [{ stat: 'betAmount', op: 'gte', value: 1000 }],
    sortOrder: 2,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'lucky_streak',
    title: 'Emerald Luck',
    description: 'Win 5 times in a row',
    icon: '/images/ach-clover-3d.png',
    total: 5,
    progressStat: 'winStreak',
    conditions: [{ stat: 'winStreak', op: 'gte', value: 5 }],
    sortOrder: 3,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'big_win',
    title: 'Jackpot Hunter',
    description: 'Win over $500 in a single bet',
    icon: '/images/ach-jackpot-chest-3d.png',
    total: 500,
    progressStat: 'payout',
    conditions: [{ stat: 'payout', op: 'gte', value: 500 }],
    sortOrder: 4,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'level_10',
    title: 'Rising Star',
    description: 'Reach Level 10',
    icon: '/images/ach-star-3d.png',
    total: 10,
    progressStat: 'level',
    conditions: [{ stat: 'level', op: 'gte', value: 10 }],
    sortOrder: 5,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'level_50',
    title: 'Casino Elite',
    description: 'Reach Level 50',
    icon: '/images/ach-crown-3d.png',
    total: 50,
    progressStat: 'level',
    conditions: [{ stat: 'level', op: 'gte', value: 50 }],
    sortOrder: 6,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'crash_master',
    title: 'Crash Master',
    description: 'Hit a 10x multiplier in Crash',
    icon: '/images/ach-rocket-3d.png',
    total: 10,
    progressStat: 'multiplier',
    conditions: [{ stat: 'multiplier', op: 'gte', value: 10, game: 'CRASH' }],
    sortOrder: 7,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'daily_grinder',
    title: 'The Grinder',
    description: 'Place 50 bets',
    icon: '/images/ach-flame-3d.png',
    total: 50,
    progressStat: 'totalBetsCount',
    conditions: [{ stat: 'totalBetsCount', op: 'gte', value: 50 }],
    sortOrder: 8,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'moon_shot',
    title: 'Moon Shot',
    description: 'Hit a 100x multiplier in Crash',
    icon: '/images/ach-rocket-3d.png',
    total: 100,
    progressStat: 'multiplier',
    conditions: [{ stat: 'multiplier', op: 'gte', value: 100, game: 'CRASH' }],
    sortOrder: 9,
    isActive: true,
    visibility: 'visible',
  },
  {
    id: 'lucky_seven',
    title: 'Lucky Seven',
    description: 'Hit a 7x multiplier in Dice',
    icon: '/images/ach-dice-seven-3d.png',
    total: 7,
    progressStat: 'multiplier',
    conditions: [{ stat: 'multiplier', op: 'gte', value: 7, game: 'DICE' }],
    sortOrder: 10,
    isActive: true,
    visibility: 'secret',
  },
];

function compare(op: AchievementConditionOp, actual: number, expected: number): boolean {
  switch (op) {
    case 'gte':
      return actual >= expected;
    case 'gt':
      return actual > expected;
    case 'lte':
      return actual <= expected;
    case 'lt':
      return actual < expected;
    case 'eq':
      return actual === expected;
    default:
      return false;
  }
}

/**
 * Fails closed: an unrecognized stat key (e.g. a stale/corrupt config row) never
 * satisfies a condition instead of throwing and blocking every other achievement.
 */
function readStat(stats: AchievementStatSnapshot, key: AchievementStatKey): number | undefined {
  return stats[key];
}

export function evaluateAchievementConditions(
  conditions: AchievementCondition[],
  stats: AchievementStatSnapshot,
): boolean {
  if (conditions.length === 0) return false;
  return conditions.every((condition) => {
    if (condition.game !== undefined && condition.game !== stats.game) return false;
    const actual = readStat(stats, condition.stat);
    if (actual === undefined) return false;
    return compare(condition.op, actual, condition.value);
  });
}

export function getAchievementProgress(
  config: AchievementConfig,
  stats: AchievementStatSnapshot,
): number {
  const raw = readStat(stats, config.progressStat) ?? 0;
  return Math.min(Math.max(raw, 0), config.total);
}

/**
 * Merges fresh config metadata (title/description/icon/total) into existing
 * achievement instances, preserving already-known unlocked/progress state by id.
 * Used both for cold-start (existing = []) and for refreshing after a config fetch.
 */
export function mergeAchievementsWithConfig(
  existing: Achievement[],
  configs: AchievementConfig[],
): Achievement[] {
  const existingById = new Map(existing.map((ach) => [ach.id, ach]));
  return configs
    .filter((config) => config.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((config) => {
      const prev = existingById.get(config.id);
      return {
        id: config.id,
        title: config.title,
        description: config.description,
        icon: config.icon,
        total: config.total,
        visibility: config.visibility,
        unlocked: prev?.unlocked ?? false,
        progress: prev?.progress ?? 0,
      };
    });
}

/**
 * Pure evaluation step for a single game result: for each not-yet-unlocked
 * achievement, checks its declarative conditions against the current stat
 * snapshot and advances progress. Already-unlocked achievements are never
 * re-mutated.
 */
export function applyAchievementProgress(
  achievements: Achievement[],
  configs: AchievementConfig[],
  stats: AchievementStatSnapshot,
): Achievement[] {
  const configById = new Map(configs.map((config) => [config.id, config]));
  return achievements.map((ach) => {
    if (ach.unlocked) return ach;
    const config = configById.get(ach.id);
    if (!config || !config.isActive) return ach;

    const progress = Math.max(ach.progress, getAchievementProgress(config, stats));
    const unlocked = evaluateAchievementConditions(config.conditions, stats);
    if (!unlocked && progress === ach.progress) return ach;
    return { ...ach, unlocked, progress };
  });
}
