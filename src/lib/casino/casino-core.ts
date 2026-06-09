import { ProvablyFairEngine } from './provably-fair';
import { CasinoLogger } from './logger';

export const MAX_BET = 100_000_000;

export function calculateDicePayout(bet: number, multiplier: number, win: boolean): number {
  if (bet < 0 || multiplier < 0) throw new RangeError('Bet and multiplier must be non-negative');
  if (bet > MAX_BET) throw new RangeError(`Bet ${bet} exceeds maximum allowed bet of ${MAX_BET}`);
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
  static async placeBet(params: {
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
  }): Promise<BetResult> {
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
          const rouletteResult = this.calculateRoulettePayout(roll, params.bets);
          win = rouletteResult > 0;
          payout = rouletteResult;
          break;

        case 'CRASH':
          if (params.multiplier === undefined) throw new Error('Crash requires multiplier');
          roll = await ProvablyFairEngine.getCrashMultiplier(seed, params.clientSeed, nonce);
          win = roll >= params.multiplier;
          payout = win ? params.amount * params.multiplier : 0;
          break;

        case 'SLOTS': {
          const symbols = await ProvablyFairEngine.getSlotsResult(seed, params.clientSeed, nonce, 5, 8);
          const payoutMultiplier = this.calculateSlotsPayout(symbols);
          return {
            id: Math.random().toString(36).substring(2, 11),
            roll: 0,
            win: payoutMultiplier > 0,
            payout: params.amount * payoutMultiplier,
            serverSeedHash: hash,
            nonce: nonce + 5,
            symbols
          };
        }

        case 'BLACKJACK': {
          // Blackjack settlement from client (all logic runs client-side)
          // This case just validates and registers the result
          if (params.payout === undefined || params.win === undefined) {
            throw new Error('Blackjack requires payout and win parameters');
          }
          // Anti-cheat: payout must not exceed 2.5x bet (max blackjack multiplier)
          if (params.payout > params.amount * 2.5) {
            throw new Error('Invalid payout: exceeds maximum multiplier');
          }
          roll = 0;
          win = params.win;
          payout = params.payout;
          // Blackjack uses 312 nonces per round (6-deck shuffle)
          return {
            id: Math.random().toString(36).substring(2, 11),
            roll: 0,
            win,
            payout,
            serverSeedHash: hash,
            nonce: nonce + 312
          };
        }

        default:
          throw new Error(`Unsupported game type: ${params.gameType}`);
      }

      CasinoLogger.bet(params.gameType, params.amount, win, payout);

      return {
        id: Math.random().toString(36).substring(2, 11),
        roll,
        win,
        payout,
        serverSeedHash: hash,
        nonce
      };
    } catch (error) {
      console.error(`[CasinoCore] Failed to place bet for ${params.gameType}:`, error);
      throw error;
    }
  }

  /**
   * Helper for Roulette payout calculation
   */
  static calculateRoulettePayout(roll: number, bets: RouletteBet[]): number {
    let totalPayout = 0;
    bets.forEach(bet => {
      if (this.isRouletteWin(bet.type, roll)) {
        totalPayout += bet.amount * this.getRouletteMultiplier(bet.type);
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

  static getRouletteMultiplier(betType: RouletteBetType): number {
    switch (betType.type) {
      case 'STRAIGHT': return 35;
      case 'COLOR': return 2;
      case 'EVEN_ODD': return 2;
      case 'RANGE': return 2;
      case 'DOZEN': return 2;
      case 'COLUMN': return 2;
      case 'FRENCH':
        if (betType.value === 'VOISINS') return 36 / 17; 
        if (betType.value === 'TIERS') return 36 / 12;     
        if (betType.value === 'ORPHELINS') return 36 / 8; 
        return 0;
      default: return 0;
    }
  }

  static async startCrashRound(clientSeed: string, currentNonce: number): Promise<{ crashPoint: number, hash: string, nonce: number }> {
    try {
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      const nonce = currentNonce + 1;
      const crashPoint = await ProvablyFairEngine.getCrashMultiplier(seed, clientSeed, nonce);
      return { crashPoint, hash, nonce };
    } catch (error) {
      console.error(`[CasinoCore] Failed to start Crash round:`, error);
      throw error;
    }
  }

  /**
   * Maximum XP that can be awarded per single bet.
   * This cap prevents integer overflow when wager or level values are extreme.
   */
  static readonly MAX_XP_PER_BET = 10_000;

  /**
   * Calculate XP earned from a single bet.
   *
   * Formula: floor(wager * 10 * levelMultiplier), capped at MAX_XP_PER_BET.
   * Level multiplier = 1 + floor(level / 100), hard-capped at 5x.
   *
   * Safe invariants (guaranteed regardless of input):
   *   - Result is always a non-negative finite integer
   *   - Result never exceeds MAX_XP_PER_BET (10 000)
   *   - Non-positive or non-finite wager returns 0 XP
   *
   * @param wager - Bet amount (negative values return 0)
   * @param level - Current player level (optional, defaults to 1)
   */
  static calculateXpGain(wager: number, level: number = 1): number {
    if (!Number.isFinite(wager) || wager <= 0) return 0;

    const safeLevel = Math.max(1, Math.floor(level));
    // Multiplier grows by 1 per 100 levels, hard-capped at 5x to prevent overflow.
    const levelMultiplier = Math.min(5, 1 + Math.floor(safeLevel / 100));

    const raw = Math.floor(wager * 10 * levelMultiplier);
    return Math.min(raw, CasinoCore.MAX_XP_PER_BET);
  }

  static readonly MAX_LEVEL = 100;

  static calculateLevel(totalXp: number): number {
    return Math.min(CasinoCore.MAX_LEVEL, Math.floor(Math.sqrt(totalXp / 100)) + 1);
  }

  static calculateSlotsPayout(symbols: number[]): number {
    const counts: Record<number, number> = {};
    symbols.forEach(s => counts[s] = (counts[s] || 0) + 1);
    
    let maxMatch = 0;
    let matchingSymbol = -1;
    for (const [symbol, count] of Object.entries(counts)) {
      if (count > maxMatch) {
        maxMatch = count;
        matchingSymbol = Number(symbol);
      }
    }

    if (maxMatch === 5) return 50 + matchingSymbol;
    if (maxMatch === 4) return 10 + matchingSymbol;
    if (maxMatch === 3) return 2 + matchingSymbol * 0.5;
    return 0;
  }
}
