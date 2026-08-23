import { GAME_SYMBOLS } from '@/app/games/slots/symbols';
import type { SymbolType } from '@/components/casino/SlotSymbol';

export const REEL_COUNT = 5;

export type ReelSymbols = [SymbolType, SymbolType, SymbolType];
export type WinningRows = [boolean, boolean, boolean];

const POOL_SIZE = GAME_SYMBOLS.length;

export function buildReel(idx: number): ReelSymbols {
  return [
    GAME_SYMBOLS[(idx + POOL_SIZE - 1) % POOL_SIZE],
    GAME_SYMBOLS[idx % POOL_SIZE],
    GAME_SYMBOLS[(idx + 1) % POOL_SIZE],
  ];
}

export const DEFAULT_REELS: ReelSymbols[] = Array(REEL_COUNT)
  .fill(null)
  .map((_, i) => buildReel(i % POOL_SIZE));

export const NO_WIN: WinningRows = [false, false, false];

export interface PaytableEntry {
  symbolKey: SymbolType;
  name: string;
  tier: string;
  mult3: number;
  mult4: number;
  mult5: number;
  color: string;
}

export const PAYTABLE: PaytableEntry[] = [
  {
    symbolKey: 'zeus',
    name: 'ZEUS',
    tier: 'LEG',
    mult3: 10,
    mult4: 25,
    mult5: 75,
    color: '#FFD700',
  },
  {
    symbolKey: 'crown',
    name: 'CROWN',
    tier: 'EPIC',
    mult3: 5,
    mult4: 12,
    mult5: 35,
    color: '#FFD700',
  },
  {
    symbolKey: 'chalice',
    name: 'CHALICE',
    tier: 'RARE',
    mult3: 4,
    mult4: 8,
    mult5: 20,
    color: '#FF8C00',
  },
  {
    symbolKey: 'card_ace',
    name: 'ACE',
    tier: 'HIGH',
    mult3: 3,
    mult4: 6,
    mult5: 15,
    color: '#DC2626',
  },
  {
    symbolKey: 'card_king',
    name: 'KING',
    tier: 'MID',
    mult3: 2.5,
    mult4: 5,
    mult5: 12,
    color: '#EA580C',
  },
  {
    symbolKey: 'card_queen',
    name: 'QUEEN',
    tier: 'MID',
    mult3: 2,
    mult4: 4,
    mult5: 10,
    color: '#2563EB',
  },
  {
    symbolKey: 'card_jack',
    name: 'JACK',
    tier: 'LOW',
    mult3: 1.5,
    mult4: 3,
    mult5: 8,
    color: '#059669',
  },
  {
    symbolKey: 'card_ten',
    name: 'TEN',
    tier: 'LOW',
    mult3: 1,
    mult4: 2,
    mult5: 5,
    color: '#64748B',
  },
];

export interface ChipDef {
  amount: number;
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
}

export const VIP_CHIPS: ChipDef[] = [
  {
    amount: 1,
    label: '1',
    baseColor: '#64748B',
    stripeColor: '#FFFFFF',
    coreBg: 'radial-gradient(circle at 35% 35%, #334155 0%, #0F172A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5,
    label: '5',
    baseColor: '#DC2626',
    stripeColor: '#FCA5A5',
    coreBg: 'radial-gradient(circle at 35% 35%, #991B1B 0%, #450A0A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 25,
    label: '25',
    baseColor: '#059669',
    stripeColor: '#6EE7B7',
    coreBg: 'radial-gradient(circle at 35% 35%, #065F46 0%, #022C22 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 100,
    label: '100',
    baseColor: '#2563EB',
    stripeColor: '#93C5FD',
    coreBg: 'radial-gradient(circle at 35% 35%, #1E40AF 0%, #172554 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 500,
    label: '500',
    baseColor: '#9333EA',
    stripeColor: '#E9D5FF',
    coreBg: 'radial-gradient(circle at 35% 35%, #6B21A8 0%, #3B0764 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 1000,
    label: '1k',
    baseColor: '#D97706',
    stripeColor: '#FDE68A',
    coreBg: 'radial-gradient(circle at 35% 35%, #92400E 0%, #451A03 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5000,
    label: '5k',
    baseColor: '#AA820A',
    stripeColor: '#FFD700',
    coreBg: 'radial-gradient(circle at 35% 35%, #2A2000 0%, #0A0A0F 100%)',
    textColor: '#FFD700',
  },
];

export interface AutoBetSettings {
  numberOfBets: number;
  stopOnProfit: number;
  stopOnLoss: number;
}

export interface SessionStats {
  rounds: number;
  wins: number;
  profit: number;
}

export interface LastResult {
  type: 'win' | 'loss' | 'idle';
  amount: number;
  multiplier?: number;
}

export interface HistoryEntry {
  multiplier: number;
  amount: number;
  win: boolean;
}
