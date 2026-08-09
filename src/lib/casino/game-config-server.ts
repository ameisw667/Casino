import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { DEFAULT_GAME_CONFIG, type GameConfig } from './game-config';

let cachedConfig: GameConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function getObject(value: unknown, fallback: Record<string, unknown>): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return fallback;
}

function pickCategory(rows: Record<string, unknown>[], category: string): Record<string, unknown> {
  const row = rows.find((r) => r.category === category && r.config_key === category);
  return getObject(row?.value, {});
}

/**
 * Normalize raw Supabase rows into a GameConfig object.
 * Each active category is stored as a single JSONB blob under config_key = category.
 */
function normalizeGameConfig(rows: Record<string, unknown>[]): GameConfig {
  const limits = pickCategory(rows, 'limits');
  const crash = pickCategory(rows, 'crash');
  const roulette = pickCategory(rows, 'roulette');
  const blackjack = pickCategory(rows, 'blackjack');
  const slots = pickCategory(rows, 'slots');
  const xp = pickCategory(rows, 'xp');
  const slotsPaytable = getObject(slots.paytable, {});
  const rouletteMultipliers = getObject(roulette.multipliers, {});

  return {
    limits: {
      betMin: getNumber(limits.bet_min, DEFAULT_GAME_CONFIG.limits.betMin),
      betMax: getNumber(limits.bet_max, DEFAULT_GAME_CONFIG.limits.betMax),
      maxBetHardcap: getNumber(limits.max_bet_hardcap, DEFAULT_GAME_CONFIG.limits.maxBetHardcap),
    },
    crash: {
      houseEdge: getNumber(crash.house_edge, DEFAULT_GAME_CONFIG.crash.houseEdge),
    },
    roulette: {
      multipliers:
        (rouletteMultipliers as Record<string, number>) ?? DEFAULT_GAME_CONFIG.roulette.multipliers,
    },
    blackjack: {
      maxPayoutFactor: getNumber(
        blackjack.max_payout_factor,
        DEFAULT_GAME_CONFIG.blackjack.maxPayoutFactor,
      ),
    },
    slots: {
      paytable: {
        match5Base: getNumber(
          slotsPaytable.match_5_base,
          DEFAULT_GAME_CONFIG.slots.paytable.match5Base,
        ),
        match4Base: getNumber(
          slotsPaytable.match_4_base,
          DEFAULT_GAME_CONFIG.slots.paytable.match4Base,
        ),
        match3Base: getNumber(
          slotsPaytable.match_3_base,
          DEFAULT_GAME_CONFIG.slots.paytable.match3Base,
        ),
        symbolWeight: getNumber(
          slotsPaytable.symbol_weight,
          DEFAULT_GAME_CONFIG.slots.paytable.symbolWeight,
        ),
      },
    },
    xp: {
      maxXpPerBet: getNumber(xp.max_xp_per_bet, DEFAULT_GAME_CONFIG.xp.maxXpPerBet),
      maxLevel: getNumber(xp.max_level, DEFAULT_GAME_CONFIG.xp.maxLevel),
      baseMultiplier: getNumber(xp.base_multiplier, DEFAULT_GAME_CONFIG.xp.baseMultiplier),
      levelFormulaSqrtDivisor: getNumber(
        xp.level_formula_sqrt_divisor,
        DEFAULT_GAME_CONFIG.xp.levelFormulaSqrtDivisor,
      ),
      levelMultiplierStep: getNumber(
        xp.level_multiplier_step,
        DEFAULT_GAME_CONFIG.xp.levelMultiplierStep,
      ),
      levelMultiplierMax: getNumber(
        xp.level_multiplier_max,
        DEFAULT_GAME_CONFIG.xp.levelMultiplierMax,
      ),
    },
  };
}

/**
 * Load game configuration from Supabase.
 * Falls back to embedded defaults if Supabase is unreachable or unconfigured.
 * This function is server-only because it uses the admin Supabase client.
 */
export async function loadGameConfig(): Promise<GameConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('game_configs').select('*').eq('is_active', true);

    if (error) {
      throw new Error(`Supabase game config error: ${error.message}`);
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      throw new Error('Empty game configuration returned from Supabase');
    }

    cachedConfig = normalizeGameConfig(rows);
    cacheTimestamp = now;

    CasinoLogger.info('GAME_CONFIG', `Loaded ${rows.length} config categories`);
    return cachedConfig;
  } catch (error) {
    CasinoLogger.warn('GAME_CONFIG', 'Failed to load config from Supabase, using defaults', error);
    return DEFAULT_GAME_CONFIG;
  }
}

/**
 * Clear the in-memory config cache. Useful after admin changes.
 */
export function clearGameConfigCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}
