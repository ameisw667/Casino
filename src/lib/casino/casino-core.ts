import { ProvablyFairEngine } from './provably-fair';
import { CasinoLogger } from './logger';
import {
  type GameConfig,
  DEFAULT_GAME_CONFIG,
  getRouletteMultiplierWithConfig,
  calculateSlotsPayoutWithConfig,
  calculateXpGainWithConfig,
  calculateLevelWithConfig,
} from './game-config';

export const MAX_BET = DEFAULT_GAME_CONFIG.limits.maxBetHardcap;

export function calculateDicePayout(
  bet: number,
  multiplier: number,
  win: boolean,
  config: GameConfig = DEFAULT_GAME_CONFIG
): number {
  if (bet < 0 || multiplier < 0) throw new RangeError('Bet and multiplier must be non-negative');
  if (bet > config.limits.maxBetHardcap) {
    throw new RangeError(`Bet ${bet} exceeds maximum allowed bet of ${config.limits.maxBetHardcap}`);
  }
  if (!win || bet === 0 || multiplier === 0) return 0;
  const payout = Math.round(bet * multiplier * 100) / 100;
  return payout;
}

export interface BetResult {
  id: string;
  roll: number;
  win: boolean;
  payout: number;
  serverSeedHash: string;
  nonce: number;
  symbols?: number[];
}

export type GameType = 'CRASH' | 'DICE' | 'ROULETTE' | 'SLOTS' | 'BLACKJACK';

export interface RouletteBetType {
  type: 'STRAIGHT' | 'COLOR' | 'EVEN_ODD' | 'RANGE' | 'DOZEN' | 'COLUMN' | 'FRENCH';
  value: number | string;
}

export interface RouletteBet {
  type: RouletteBetType;
  amount: number;
}

export class CasinoCore {
  /**
   * Centralized logic for placing a bet.
   */
  static async placeBet(
    params: {
      gameType: GameType;
      amount: number;
      multiplier?: number;
      target?: number;
      condition?: 'OVER' | 'UNDER';
      bets?: RouletteBet[]; // For Roulette
      payout?: number; // For Blackjack (direct settlement from client)
      win?: boolean; // For Blackjack (direct settlement from client)
      clientSeed: string;
      currentNonce: number;
    },
    config: GameConfig = DEFAULT_GAME_CONFIG
  ): Promise<BetResult> {
    try {
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      const nonce = params.currentNonce + 1;

      let roll = 0;
      let win = false;
      let payout = 0;

      switch (params.gameType) {
        case 'DICE':
          if (params.target === undefined || params.condition === undefined) throw new Error('Dice requires target and condition');
          roll = await ProvablyFairEngine.getDiceRoll(seed, params.clientSeed, nonce);
          win = params.condition === 'OVER' ? roll > params.target : roll < params.target;
          payout = win ? params.amount * (params.multiplier || 0) : 0;
          break;

        case 'ROULETTE':
          if (!params.bets) throw new Error('Roulette requires bets');
          roll = await ProvablyFairEngine.getRouletteNumber(seed, params.clientSeed, nonce);
          const rouletteResult = this.calculateRoulettePayout(roll, params.bets, config);
          win = rouletteResult > 0;
          payout = rouletteResult;
          break;

        case 'CRASH':
          if (params.multiplier === undefined) throw new Error('Crash requires multiplier');
          roll = await ProvablyFairEngine.getCrashMultiplier(seed, params.clientSeed, nonce, config.crash.houseEdge);
          win = roll >= params.multiplier;
          payout = win ? params.amount * params.multiplier : 0;
          break;

        case 'SLOTS': {
          const symbols = await ProvablyFairEngine.getSlotsResult(seed, params.clientSeed, nonce, 5, 8);
          const payoutMultiplier = calculateSlotsPayoutWithConfig(symbols, config);
          return {
            id: crypto.randomUUID(),
            roll: 0,
            win: payoutMultiplier > 0,
            payout: params.amount * payoutMultiplier,
            serverSeedHash: hash,
            nonce: nonce + 5,
            symbols
          };
        }

        default:
          throw new Error(`Unsupported game type: ${params.gameType}`);
      }

      CasinoLogger.bet(params.gameType, params.amount, win, payout);

      return {
        id: crypto.randomUUID(),
        roll,
        win,
        payout,
        serverSeedHash: hash,
        nonce
      };
    } catch (error) {
      CasinoLogger.error('CasinoCore', `Failed to place bet for ${params.gameType}`, error);
      throw error;
    }
  }

  /**
   * Helper for Roulette payout calculation
   */
  static calculateRoulettePayout(
    roll: number,
    bets: RouletteBet[],
    config: GameConfig = DEFAULT_GAME_CONFIG
  ): number {
    let totalPayout = 0;
    bets.forEach(bet => {
      if (this.isRouletteWin(bet.type, roll)) {
        totalPayout += bet.amount * getRouletteMultiplierWithConfig(bet.type, config);
      }
    });
    return Math.round(totalPayout * 100) / 100;
  }

  static isRouletteWin(betType: RouletteBetType, roll: number): boolean {
    if (betType.type === 'STRAIGHT') return roll === betType.value;
    if (betType.type === 'COLOR') {
      const red = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const color = roll === 0 ? 'GREEN' : (red.includes(roll) ? 'RED' : 'BLACK');
      return color === betType.value;
    }
    if (betType.type === 'EVEN_ODD') return roll !== 0 && (betType.value === 'EVEN' ? roll % 2 === 0 : roll % 2 !== 0);
    if (betType.type === 'RANGE') return roll !== 0 && (betType.value === '1-18' ? (roll >= 1 && roll <= 18) : (roll >= 19 && roll <= 36));
    if (betType.type === 'DOZEN') return roll !== 0 && Math.ceil(roll / 12) === betType.value;
    if (betType.type === 'COLUMN') return roll !== 0 && ((roll - 1) % 3) + 1 === betType.value;
    if (betType.type === 'FRENCH') {
      const maps: Record<string, number[]> = {
        VOISINS: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
        TIERS: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
        ORPHELINS: [1, 20, 14, 31, 9, 17, 34, 6]
      };
      const numbers = maps[betType.value as string];
      return numbers ? numbers.includes(roll) : false;
    }
    return false;
  }

  static getRouletteMultiplier(
    betType: RouletteBetType,
    config: GameConfig = DEFAULT_GAME_CONFIG
  ): number {
    return getRouletteMultiplierWithConfig(betType, config);
  }

  static async startCrashRound(
    clientSeed: string,
    currentNonce: number,
    config: GameConfig = DEFAULT_GAME_CONFIG
  ): Promise<{ crashPoint: number, hash: string, seed: string, nonce: number }> {
    try {
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      const nonce = currentNonce + 1;
      const crashPoint = await ProvablyFairEngine.getCrashMultiplier(seed, clientSeed, nonce, config.crash.houseEdge);
      return { crashPoint, hash, seed, nonce };
    } catch (error) {
      CasinoLogger.error('CasinoCore', 'Failed to start Crash round', error);
      throw error;
    }
  }

  /**
   * Maximum XP that can be awarded per single bet.
   * Kept as static alias for backward compatibility; actual value lives in GameConfig.
   */
  static readonly MAX_XP_PER_BET = DEFAULT_GAME_CONFIG.xp.maxXpPerBet;

  /**
   * Calculate XP earned from a single bet.
   *
   * @param wager - Bet amount (negative values return 0)
   * @param level - Current player level (optional, defaults to 1)
   * @param config - GameConfig (defaults to embedded defaults)
   */
  static calculateXpGain(
    wager: number,
    level: number = 1,
    config: GameConfig = DEFAULT_GAME_CONFIG
  ): number {
    return calculateXpGainWithConfig(wager, level, config);
  }

  /**
   * Maximum player level.
   * Kept as static alias for backward compatibility; actual value lives in GameConfig.
   */
  static readonly MAX_LEVEL = DEFAULT_GAME_CONFIG.xp.maxLevel;

  static calculateLevel(totalXp: number, config: GameConfig = DEFAULT_GAME_CONFIG): number {
    return calculateLevelWithConfig(totalXp, config);
  }

  /**
   * Calculate slots payout.
   * Kept as static wrapper; actual logic uses configured paytable.
   */
  static calculateSlotsPayout(symbols: number[], config: GameConfig = DEFAULT_GAME_CONFIG): number {
    return calculateSlotsPayoutWithConfig(symbols, config);
  }
}
