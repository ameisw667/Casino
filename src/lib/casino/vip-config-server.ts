import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { DEFAULT_VIP_CONFIG, type VipConfig, type VipTier, type Rank } from './vip-config';

let cachedConfig: VipConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function normalizeVipTier(row: Record<string, unknown>): VipTier {
  return {
    id: Number(row.id),
    name: String(row.name),
    minXp: Number(row.min_xp),
    rakeback: Number(row.rakeback),
    color: String(row.color),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  };
}

function normalizeRank(row: Record<string, unknown>): Rank {
  return {
    id: Number(row.id),
    name: String(row.name),
    minLevel: Number(row.min_level),
    color: String(row.color),
    rakeback: Number(row.rakeback),
    perks: Array.isArray(row.perks) ? row.perks.map(String) : [],
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
  };
}

/**
 * Load VIP tier and rank configuration from Supabase.
 * Falls back to embedded defaults if Supabase is unreachable or unconfigured.
 * This function is server-only because it uses the admin Supabase client.
 */
export async function loadVipConfig(): Promise<VipConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const supabase = createAdminClient();

    const [vipResult, ranksResult] = await Promise.all([
      supabase
        .from('vip_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('ranks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (vipResult.error || ranksResult.error) {
      throw new Error(
        `Supabase config error: ${vipResult.error?.message ?? ranksResult.error?.message}`,
      );
    }

    const vipTiers = (vipResult.data ?? []).map(normalizeVipTier);
    const ranks = (ranksResult.data ?? []).map(normalizeRank);

    if (vipTiers.length === 0 || ranks.length === 0) {
      throw new Error('Empty VIP/Rank configuration returned from Supabase');
    }

    cachedConfig = { vipTiers, ranks };
    cacheTimestamp = now;

    CasinoLogger.info('VIP_CONFIG', `Loaded ${vipTiers.length} tiers and ${ranks.length} ranks`);
    return cachedConfig;
  } catch (error) {
    CasinoLogger.warn('VIP_CONFIG', 'Failed to load config from Supabase, using defaults', error);
    return DEFAULT_VIP_CONFIG;
  }
}

/**
 * Clear the in-memory config cache. Useful after admin changes.
 */
export function clearVipConfigCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}
