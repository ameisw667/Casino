import 'server-only';
import { Redis } from '@upstash/redis';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from './logger';
import { DEFAULT_GAME_CONFIG, type GameConfig } from './game-config';

let cachedConfig: GameConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const REDIS_KEY = 'casino:game-config:v1';
const REDIS_TTL_SECONDS = CACHE_TTL_MS / 1000;

interface CachedConfigPayload {
  rows: Record<string, unknown>[];
  fetchedAt: number;
}

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

// No client-instance caching here (unlike request-security.ts's remoteLimiters
// Map): L1 already caps calls to once per CACHE_TTL_MS per process, so the
// per-request perf pressure that justifies caching Ratelimit instances doesn't
// apply to a cache that's read at most once every 5 minutes.
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function isValidPayload(value: unknown): value is CachedConfigPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as CachedConfigPayload).rows) &&
    typeof (value as CachedConfigPayload).fetchedAt === 'number'
  );
}

/**
 * Read-through L2. Returns null on any miss/error/malformed-shape so the
 * caller always has a safe, uniform "fall through to Supabase" path (fail-open).
 */
async function readFromRedis(): Promise<CachedConfigPayload | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const payload = await redis.get<CachedConfigPayload>(REDIS_KEY);
    if (!isValidPayload(payload)) return null;
    if (Date.now() - payload.fetchedAt >= CACHE_TTL_MS) return null;
    return payload;
  } catch (error) {
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 read failed, falling back to Supabase', error);
    return null;
  }
}

async function writeToRedis(rows: Record<string, unknown>[], fetchedAt: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const payload: CachedConfigPayload = { rows, fetchedAt };
    await redis.set(REDIS_KEY, payload, { ex: REDIS_TTL_SECONDS });
  } catch (error) {
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 write failed, continuing without cache', error);
  }
}

async function fetchRowsFromSupabase(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('game_configs').select('*').eq('is_active', true);

  if (error) {
    throw new Error(`Supabase game config error: ${error.message}`);
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    throw new Error('Empty game configuration returned from Supabase');
  }
  return rows;
}

/**
 * Load game configuration. Cache-aside across three stages:
 * L1 in-memory (process-local) -> L2 Upstash Redis (shared, optional) -> L3
 * Supabase (source of truth) -> DEFAULT_GAME_CONFIG as last resort.
 * L1's cacheTimestamp is synced to the L2 payload's fetchedAt (not now()) so
 * staleness never exceeds CACHE_TTL_MS from the original Supabase read, even
 * across a chain of L2 hits on different instances.
 * Server-only: uses the admin Supabase client and (optionally) Upstash REST.
 */
export async function loadGameConfig(): Promise<GameConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const redisPayload = await readFromRedis();
  if (redisPayload) {
    try {
      cachedConfig = normalizeGameConfig(redisPayload.rows);
      cacheTimestamp = redisPayload.fetchedAt;
      return cachedConfig;
    } catch (error) {
      CasinoLogger.warn(
        'GAME_CONFIG',
        'Redis L2 payload failed normalization, falling back to Supabase',
        error,
      );
    }
  }

  try {
    const rows = await fetchRowsFromSupabase();
    const fetchedAt = Date.now();
    cachedConfig = normalizeGameConfig(rows);
    cacheTimestamp = fetchedAt;

    CasinoLogger.info('GAME_CONFIG', `Loaded ${rows.length} config categories`);
    await writeToRedis(rows, fetchedAt);
    return cachedConfig;
  } catch (error) {
    CasinoLogger.warn('GAME_CONFIG', 'Failed to load config from Supabase, using defaults', error);
    return DEFAULT_GAME_CONFIG;
  }
}

/**
 * Clear the in-memory (L1) and Redis (L2) config cache. Useful after admin changes.
 */
export async function clearGameConfigCache(): Promise<void> {
  cachedConfig = null;
  cacheTimestamp = 0;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(REDIS_KEY);
  } catch (error) {
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 delete failed', error);
  }
}

/** Resets only the L1 in-memory cache, mirroring resetLocalRateLimitsForTests in request-security.ts. */
export function resetGameConfigCacheForTests(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}
