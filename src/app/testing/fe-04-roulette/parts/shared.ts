import type { BetType } from '@/components/casino/games/roulette/types';

export type SpinPhase = 'idle' | 'ball_launched' | 'no_more_bets' | 'drop' | 'resolved';

export const STRATEGY_PRESETS = [
  { label: 'ROT DECKUNG', key: 'RED_BLACK_HEDGE' as const },
  { label: 'VOISINS DU ZÉRO', key: 'VOISINS' as const },
  { label: 'TIERS DU CYLINDRE', key: 'TIERS' as const },
  { label: 'ORPHELINS', key: 'ORPHELINS' as const },
  { label: 'ZERO HEDGE', key: 'ZERO_HEDGE' as const },
];

export type StrategyPreset = (typeof STRATEGY_PRESETS)[number]['key'];

interface OutsideBetDefinition {
  label: string;
  type: BetType;
  bg: string;
}

export const OUTSIDE_BETS: OutsideBetDefinition[] = [
  {
    label: 'MANQUE (1-18)',
    type: { type: 'RANGE' as const, value: '1-18' as const },
    bg: '',
  },
  {
    label: 'PAIR',
    type: { type: 'EVEN_ODD' as const, value: 'EVEN' as const },
    bg: '',
  },
  {
    label: 'RED',
    type: { type: 'COLOR' as const, value: 'RED' as const },
    bg: 'linear-gradient(180deg, #A81B1B 0%, #7F1414 100%)',
  },
  {
    label: 'BLACK',
    type: { type: 'COLOR' as const, value: 'BLACK' as const },
    bg: 'linear-gradient(180deg, #1A1C24 0%, #0F1016 100%)',
  },
  {
    label: 'IMPAIR',
    type: { type: 'EVEN_ODD' as const, value: 'ODD' as const },
    bg: '',
  },
  {
    label: 'PASSE (19-36)',
    type: { type: 'RANGE' as const, value: '19-36' as const },
    bg: '',
  },
];
