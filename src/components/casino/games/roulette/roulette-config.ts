import type { BetType } from './types';

// ---------------------------------------------------------------------------
// 1. DEEP-TONE HIGH-CONTRAST VIP CASINO JETONS (4x2 Grid)
// ---------------------------------------------------------------------------

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

export function getChipDef(amount: number): ChipDef {
  return (
    VIP_CHIPS.find((c) => c.amount === amount) ||
    (amount >= 5000
      ? VIP_CHIPS[6]
      : amount >= 1000
        ? VIP_CHIPS[5]
        : amount >= 500
          ? VIP_CHIPS[4]
          : amount >= 100
            ? VIP_CHIPS[3]
            : amount >= 25
              ? VIP_CHIPS[2]
              : amount >= 5
                ? VIP_CHIPS[1]
                : VIP_CHIPS[0])
  );
}

export const FRENCH_SECTORS: { label: string; numbers: number[] }[] = [
  { label: 'Jeu Zéro', numbers: [12, 35, 3, 26, 0, 32, 15] },
  { label: 'Voisins', numbers: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25] },
  { label: 'Orphelins', numbers: [1, 20, 14, 31, 9, 17, 34, 6] },
  { label: 'Tiers', numbers: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33] },
];

export const OUTSIDE_BETS: { label: string; type: BetType; bg?: string }[] = [
  { label: '1-18', type: { type: 'RANGE', value: '1-18' } },
  { label: 'EVEN', type: { type: 'EVEN_ODD', value: 'EVEN' } },
  {
    label: 'RED',
    type: { type: 'COLOR', value: 'RED' },
    bg: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
  },
  {
    label: 'BLACK',
    type: { type: 'COLOR', value: 'BLACK' },
    bg: 'linear-gradient(135deg, #1e1e2d 0%, #121218 100%)',
  },
  { label: 'ODD', type: { type: 'EVEN_ODD', value: 'ODD' } },
  { label: '19-36', type: { type: 'RANGE', value: '19-36' } },
];

export function betTypeKey(type: BetType): string {
  return `${type.type}:${type.value}`;
}
