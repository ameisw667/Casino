import type { Card } from '@/lib/games/blackjack';

export interface ChipDef {
  amount: number;
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
}

export interface BlackjackSessionStats {
  rounds: number;
  wins: number;
  profit: number;
}

export interface BlackjackHistoryItem {
  result: string;
  amount: number;
  isWin: boolean;
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

// Hi-Lo Card Value Evaluator (2-6: +1, 7-9: 0, 10-A: -1)
export function getHiLoDelta(card: Card): number {
  if (card.faceDown) return 0;
  const num = card.numericValue;
  if (num >= 2 && num <= 6) return 1;
  if (num >= 10 || card.value === 'A') return -1;
  return 0;
}
