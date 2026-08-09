export interface V2GameTab {
  id: string;
  label: string;
  href: string;
}

export const V2_GAME_TABS: V2GameTab[] = [
  { id: 'all', label: 'All Games', href: '/games' },
  { id: 'blackjack', label: 'Blackjack', href: '/games/blackjack' },
  { id: 'crash', label: 'Crash', href: '/games/crash' },
  { id: 'dice', label: 'Dice', href: '/games/dice' },
  { id: 'roulette', label: 'Roulette', href: '/games/roulette' },
  { id: 'slots', label: 'Slots', href: '/games/slots' },
];

export interface V2Promo {
  id: string;
  tone: 'navy' | 'violet' | 'forest';
  title: string;
  cta: string;
  artColor: string;
}

export const V2_PROMOS: V2Promo[] = [
  {
    id: 'king',
    tone: 'navy',
    title: 'Become King of the Table — win $100,000',
    cta: 'Enter Now',
    artColor: 'linear-gradient(155deg, hsl(43 88% 60%), hsl(30 90% 45%))',
  },
  {
    id: 'rakeback',
    tone: 'violet',
    title: 'Get up to 62.5% rakeback on every bet',
    cta: 'Play Now',
    artColor: 'linear-gradient(155deg, hsl(268 70% 68%), hsl(280 60% 40%))',
  },
  {
    id: 'rewards',
    tone: 'forest',
    title: 'Unmatched rebate rewards, paid weekly',
    cta: 'Claim Now',
    artColor: 'linear-gradient(155deg, hsl(120 72% 52%), hsl(120 60% 28%))',
  },
];

export interface V2Race {
  id: string;
  label: string;
  daysLeft: number;
}

export const V2_RACES: V2Race[] = [
  { id: 'monthly', label: 'Monthly Race', daysLeft: 28 },
  { id: 'weekly', label: 'Weekly Race', daysLeft: 6 },
];

// Fixed offsets (not Math.random()) so server- and client-render match.
export interface V2FloatingChip {
  top: string;
  left: string;
  delay: string;
}

export const V2_FLOATING_CHIPS: V2FloatingChip[] = [
  { top: '4%', left: '82%', delay: '0s' },
  { top: '18%', left: '2%', delay: '1.2s' },
  { top: '72%', left: '90%', delay: '2.1s' },
  { top: '86%', left: '10%', delay: '0.6s' },
];

export interface V2Kpi {
  value: string;
  label: string;
}

export const V2_KPIS: V2Kpi[] = [
  { value: '$84.20', label: 'Received so far' },
  { value: '$12.20', label: 'Estimated this week' },
];
