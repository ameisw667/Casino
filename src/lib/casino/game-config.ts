import { type RouletteBetType } from './casino-core';

export interface GameLimitsConfig {
  betMin: number;
  betMax: number;
  maxBetHardcap: number;
}

export interface CrashConfig {
  houseEdge: number;
  /** Multiplayer round clock (worldmap/05_multiplayercrash.md §4.4). */
  bettingWindowMs: number;
  postCrashPauseMs: number;
}

export interface DiceConfig {
  houseEdge: number;
}

export interface RouletteConfig {
  multipliers: Record<string, number>;
}

export interface BlackjackConfig {
  maxPayoutFactor: number;
}

export interface SlotsConfig {
  paytable: {
    match5Base: number;
    match4Base: number;
    match3Base: number;
    symbolWeight: number;
  };
}

export interface XpConfig {
  maxXpPerBet: number;
  maxLevel: number;
  baseMultiplier: number;
  levelFormulaSqrtDivisor: number;
  levelMultiplierStep: number;
  levelMultiplierMax: number;
}

export interface GameConfig {
  limits: GameLimitsConfig;
  crash: CrashConfig;
  dice: DiceConfig;
  roulette: RouletteConfig;
  blackjack: BlackjackConfig;
  slots: SlotsConfig;
  xp: XpConfig;
}

/**
 * Embedded default configuration. Mirrors the values previously hardcoded
 * across casino-core.ts, provably-fair.ts, bet-validator.ts and useCasinoStore.ts.
 * Used when Supabase is unreachable or unconfigured.
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  limits: {
    betMin: 0.1,
    betMax: 10000.0,
    maxBetHardcap: 100_000_000,
  },
  crash: {
    houseEdge: 0.01,
    bettingWindowMs: 8_000,
    postCrashPauseMs: 3_000,
  },
  dice: {
    houseEdge: 0.01,
  },
  roulette: {
    multipliers: {
      STRAIGHT: 35,
      COLOR: 2,
      EVEN_ODD: 2,
      RANGE: 2,
      DOZEN: 2,
      COLUMN: 2,
      VOISINS: 36 / 17,
      TIERS: 36 / 12,
      ORPHELINS: 36 / 8,
    },
  },
  blackjack: {
    maxPayoutFactor: 2.5,
  },
  slots: {
    paytable: {
      match5Base: 50,
      match4Base: 10,
      match3Base: 2,
      symbolWeight: 0.5,
    },
  },
  xp: {
    maxXpPerBet: 10_000,
    maxLevel: 100,
    baseMultiplier: 10,
    levelFormulaSqrtDivisor: 100,
    levelMultiplierStep: 100,
    levelMultiplierMax: 5,
  },
};

/**
 * Resolve bet limits from the loaded config.
 */
export function getBetLimits(config: GameConfig): GameLimitsConfig {
  return config.limits;
}

/**
 * Validate a bet amount against configured limits and balance.
 * Returns an error message or null if valid.
 */
export function validateBetWithConfig(
  betAmount: number,
  balance: number,
  config: GameConfig,
): string | null {
  const { betMin, betMax } = config.limits;
  if (betAmount < betMin || betAmount > betMax) {
    return `Bet amount must be between $${betMin.toFixed(2)} and $${betMax.toFixed(2)}!`;
  }
  if (betAmount > balance) {
    return 'Insufficient balance!';
  }
  return null;
}

/**
 * Resolve the roulette multiplier for a bet type from config.
 */
export function getRouletteMultiplierWithConfig(
  betType: RouletteBetType,
  config: GameConfig,
): number {
  if (betType.type === 'FRENCH') {
    return config.roulette.multipliers[betType.value as string] ?? 0;
  }
  const key = betType.value === 'EVEN' || betType.value === 'ODD' ? 'EVEN_ODD' : betType.type;
  return config.roulette.multipliers[key] ?? 0;
}

/**
 * Calculate slots payout from symbols using configured paytable.
 */
export function calculateSlotsPayoutWithConfig(symbols: number[], config: GameConfig): number {
  const counts: Record<number, number> = {};
  symbols.forEach((s) => {
    counts[s] = (counts[s] || 0) + 1;
  });

  let maxMatch = 0;
  let matchingSymbol = -1;
  for (const [symbol, count] of Object.entries(counts)) {
    if (count > maxMatch) {
      maxMatch = count;
      matchingSymbol = Number(symbol);
    }
  }

  const { paytable } = config.slots;
  if (maxMatch === 5) return paytable.match5Base + matchingSymbol;
  if (maxMatch === 4) return paytable.match4Base + matchingSymbol;
  if (maxMatch === 3) return paytable.match3Base + matchingSymbol * paytable.symbolWeight;
  return 0;
}

/**
 * Resolve the maximum allowed payout factor for blackjack.
 */
export function getBlackjackMaxPayoutFactor(config: GameConfig): number {
  return config.blackjack.maxPayoutFactor;
}

/**
 * Resolve crash house edge from config.
 */
export function getCrashHouseEdge(config: GameConfig): number {
  return config.crash.houseEdge;
}

/**
 * Derive the authoritative Dice payout multiplier from target/condition + house edge.
 * The server must always compute this itself for settlement — a client-supplied
 * multiplier is never trusted, since it is not otherwise tied to the win probability
 * implied by target/condition.
 */
export function getDiceMultiplierWithConfig(
  target: number,
  condition: 'OVER' | 'UNDER',
  config: GameConfig,
): number {
  if (!Number.isFinite(target) || target < 0.01 || target > 99.99) {
    throw new RangeError('Dice target must be between 0.01 and 99.99');
  }
  const winChance = condition === 'OVER' ? 100 - target : target;
  const multiplier = ((1 - config.dice.houseEdge) * 100) / winChance;
  return Math.round(multiplier * 10000) / 10000;
}

/**
 * Calculate XP earned from a single bet using configured formula.
 *
 * Formula: floor(wager * baseMultiplier * levelMultiplier), capped at maxXpPerBet.
 * Level multiplier = 1 + floor(level / step), hard-capped at levelMultiplierMax.
 *
 * Safe invariants (guaranteed regardless of input):
 *   - Result is always a non-negative finite integer
 *   - Result never exceeds maxXpPerBet
 *   - Non-positive or non-finite wager returns 0 XP
 */
export function calculateXpGainWithConfig(
  wager: number,
  level: number = 1,
  config: GameConfig,
): number {
  if (!Number.isFinite(wager) || wager <= 0) return 0;

  const safeLevel = Math.max(1, Math.floor(level));
  const levelMultiplier = Math.min(
    config.xp.levelMultiplierMax,
    1 + Math.floor(safeLevel / config.xp.levelMultiplierStep),
  );

  const raw = Math.floor(wager * config.xp.baseMultiplier * levelMultiplier);
  return Math.min(raw, config.xp.maxXpPerBet);
}

/**
 * Calculate player level from total XP using configured formula.
 */
export function calculateLevelWithConfig(totalXp: number, config: GameConfig): number {
  return Math.min(
    config.xp.maxLevel,
    Math.floor(Math.sqrt(totalXp / config.xp.levelFormulaSqrtDivisor)) + 1,
  );
}
