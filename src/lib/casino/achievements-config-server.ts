import 'server-only';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import {
  DEFAULT_ACHIEVEMENT_CONFIGS,
  type AchievementConfig,
  type AchievementConditionOp,
  type AchievementStatKey,
  type AchievementVisibility,
  normalizeAchievementVisibility,
} from './achievements-config';

let cachedConfigs: AchievementConfig[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const STAT_KEYS: readonly AchievementStatKey[] = [
  'totalBetsCount',
  'betAmount',
  'payout',
  'level',
  'multiplier',
  'winStreak',
];
const CONDITION_OPS: readonly AchievementConditionOp[] = ['gte', 'gt', 'lte', 'lt', 'eq'];
const ACHIEVEMENT_VISIBILITIES: readonly AchievementVisibility[] = ['visible', 'secret'];

const conditionSchema = z.object({
  stat: z.enum(STAT_KEYS as [AchievementStatKey, ...AchievementStatKey[]]),
  op: z.enum(CONDITION_OPS as [AchievementConditionOp, ...AchievementConditionOp[]]),
  value: z.number().finite(),
  game: z.string().min(1).max(32).optional(),
});

const conditionsSchema = z.array(conditionSchema).min(1);

/**
 * A DB-editable icon must stay a local public-folder asset (single leading
 * slash) or a short emoji/text marker — never a protocol-relative or
 * absolute URL, which `next/image` would otherwise happily fetch.
 */
const LOCAL_ICON_PATH = /^\/[a-zA-Z0-9/_.-]+$/;
const FALLBACK_ICON = '🏆';

function normalizeIcon(id: string, rawIcon: string): string {
  if (rawIcon.startsWith('//') || rawIcon.startsWith('http://') || rawIcon.startsWith('https://')) {
    CasinoLogger.warn('ACHIEVEMENTS_CONFIG', `Rejected unsafe icon URL for "${id}"`, { rawIcon });
    return FALLBACK_ICON;
  }
  if (rawIcon.startsWith('/')) {
    return LOCAL_ICON_PATH.test(rawIcon) ? rawIcon : FALLBACK_ICON;
  }
  return rawIcon;
}

function normalizeAchievementConfig(row: Record<string, unknown>): AchievementConfig | null {
  const id = String(row.id ?? '');
  const conditionsParsed = conditionsSchema.safeParse(row.conditions);
  const progressStatParsed = z
    .enum(STAT_KEYS as [AchievementStatKey, ...AchievementStatKey[]])
    .safeParse(row.progress_stat);

  if (!id || !conditionsParsed.success || !progressStatParsed.success) {
    CasinoLogger.warn('ACHIEVEMENTS_CONFIG', `Skipping invalid achievement_configs row`, {
      id,
      conditionsError: conditionsParsed.success ? undefined : conditionsParsed.error.message,
      progressStatError: progressStatParsed.success ? undefined : progressStatParsed.error.message,
    });
    return null;
  }

  const visibilityParsed = z
    .enum(ACHIEVEMENT_VISIBILITIES as [AchievementVisibility, ...AchievementVisibility[]])
    .safeParse(row.visibility ?? 'visible');
  const visibility = normalizeAchievementVisibility(row.visibility);
  if (!visibilityParsed.success) {
    CasinoLogger.warn('ACHIEVEMENTS_CONFIG', `Invalid visibility for "${id}", using visible`, {
      visibility: row.visibility,
    });
  }

  const total = Number(row.total);
  if (!Number.isFinite(total) || total <= 0) {
    CasinoLogger.warn(
      'ACHIEVEMENTS_CONFIG',
      `Skipping achievement_configs row with invalid total`,
      {
        id,
      },
    );
    return null;
  }

  return {
    id,
    title: String(row.title ?? id),
    description: String(row.description ?? ''),
    icon: normalizeIcon(id, String(row.icon ?? FALLBACK_ICON)),
    total,
    progressStat: progressStatParsed.data,
    conditions: conditionsParsed.data,
    sortOrder: Number(row.sort_order ?? 0),
    isActive: Boolean(row.is_active ?? true),
    visibility,
  };
}

/**
 * Loads achievement definitions from Supabase. Falls back to embedded
 * defaults if Supabase is unreachable, the table is empty, or every row
 * fails validation. This function is server-only (admin client).
 */
export async function loadAchievementConfig(): Promise<AchievementConfig[]> {
  const now = Date.now();
  if (cachedConfigs && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfigs;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('achievement_configs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Supabase achievement_configs error: ${error.message}`);
    }

    const configs = (data ?? [])
      .map((row) => normalizeAchievementConfig(row as Record<string, unknown>))
      .filter((config): config is AchievementConfig => config !== null);

    if (configs.length === 0) {
      throw new Error('Empty or fully-invalid achievement configuration returned from Supabase');
    }

    cachedConfigs = configs;
    cacheTimestamp = now;

    CasinoLogger.info('ACHIEVEMENTS_CONFIG', `Loaded ${configs.length} achievement configs`);
    return cachedConfigs;
  } catch (error) {
    CasinoLogger.warn(
      'ACHIEVEMENTS_CONFIG',
      'Failed to load achievement config from Supabase, using defaults',
      error,
    );
    return DEFAULT_ACHIEVEMENT_CONFIGS;
  }
}

/** Clears the in-memory config cache. Useful after admin changes. */
export function clearAchievementConfigCache(): void {
  cachedConfigs = null;
  cacheTimestamp = 0;
}
