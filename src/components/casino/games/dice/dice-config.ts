import type { CasinoState } from '@/store/useCasinoStore';

export interface DiceHistoryItem {
  roll: number;
  win: boolean;
  multiplier: number;
  id: string;
}

export interface SessionStats {
  rounds: number;
  wins: number;
  profit: number;
  biggestMultiplier: number;
}

// DRY: alias the canonical store shape instead of duplicating the field list.
export type DiceAutoBetSettings = CasinoState['autoBetSettings']['dice'];

export const QUICK_BET_AMOUNTS = [1, 5, 10, 50, 100] as const;

export const MULTIPLIER_PRESETS = [2.0, 5.0, 10.0, 50.0, 100.0] as const;
