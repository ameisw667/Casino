export type Color = 'RED' | 'BLACK' | 'GREEN';
export type Parity = 'EVEN' | 'ODD';
export type Range = '1-18' | '19-36';
export type Dozen = '1st 12' | '2nd 12' | '3rd 12';
export type Column = '1st Column' | '2nd Column' | '3rd Column';
export type FrenchBet = 'VOISINS' | 'TIERS' | 'ORPHELINS';

export interface RouletteNumber {
  n: number;
  c: Color;
}

export type BetType = 
  | { type: 'STRAIGHT', value: number }
  | { type: 'COLOR', value: Color }
  | { type: 'EVEN_ODD', value: Parity }
  | { type: 'RANGE', value: Range }
  | { type: 'DOZEN', value: Dozen }
  | { type: 'COLUMN', value: Column }
  | { type: 'FRENCH', value: FrenchBet };

export interface BetPlacement {
  id: string;
  type: BetType;
  amount: number;
}

export const CHIPS = [1, 5, 10, 50, 100, 500, 1000];

export const ROULETTE_NUMBERS: RouletteNumber[] = [
  { n: 0, c: 'GREEN' },
  { n: 1, c: 'RED' }, { n: 2, c: 'BLACK' }, { n: 3, c: 'RED' },
  { n: 4, c: 'BLACK' }, { n: 5, c: 'RED' }, { n: 6, c: 'BLACK' },
  { n: 7, c: 'RED' }, { n: 8, c: 'BLACK' }, { n: 9, c: 'RED' },
  { n: 10, c: 'BLACK' }, { n: 11, c: 'BLACK' }, { n: 12, c: 'RED' },
  { n: 13, c: 'BLACK' }, { n: 14, c: 'RED' }, { n: 15, c: 'BLACK' },
  { n: 16, c: 'RED' }, { n: 17, c: 'BLACK' }, { n: 18, c: 'RED' },
  { n: 19, c: 'RED' }, { n: 20, c: 'BLACK' }, { n: 21, c: 'RED' },
  { n: 22, c: 'BLACK' }, { n: 23, c: 'RED' }, { n: 24, c: 'BLACK' },
  { n: 25, c: 'RED' }, { n: 26, c: 'BLACK' }, { n: 27, c: 'RED' },
  { n: 28, c: 'BLACK' }, { n: 29, c: 'BLACK' }, { n: 30, c: 'RED' },
  { n: 31, c: 'BLACK' }, { n: 32, c: 'RED' }, { n: 33, c: 'BLACK' },
  { n: 34, c: 'RED' }, { n: 35, c: 'BLACK' }, { n: 36, c: 'RED' }
];

export const WHEEL_ORDER: RouletteNumber[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
].map(n => ROULETTE_NUMBERS.find(rn => rn.n === n)!);

export const FRENCH_BETS_MAP = {
  VOISINS: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
  TIERS: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
  ORPHELINS: [1, 20, 14, 31, 9, 17, 34, 6]
};
