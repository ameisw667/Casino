export type DashboardCategory = 'featured' | 'fast' | 'table' | 'all';
export type DashboardVisual =
  'crash-curve' | 'roulette-wheel' | 'card-fan' | 'dice-distribution' | 'slot-reels';
export type DashboardTone = 'terracotta' | 'teal' | 'aubergine' | 'slate' | 'moss';

export interface DashboardGame {
  id: 'crash' | 'roulette' | 'blackjack' | 'dice' | 'slots';
  name: string;
  eyebrow: string;
  description: string;
  path: string;
  maxPayout: string;
  volatility: 'Low' | 'Medium' | 'High';
  categories: Exclude<DashboardCategory, 'all'>[];
  visual: DashboardVisual;
  tone: DashboardTone;
}

export interface DashboardBet {
  id: string;
  user: string;
  game: string;
  amount: number;
  multiplier: number;
  payout: number;
  time: string;
  isWin: boolean;
}

export interface DashboardMetrics {
  totalWagered: number;
  totalPayout: number;
  winRate: number;
  bestMultiplier: number;
  recentWins: DashboardBet[];
  activityBars: number[];
}

export const DASHBOARD_GAMES: readonly DashboardGame[] = [
  {
    id: 'crash',
    name: 'Crash Atelier',
    eyebrow: 'Live original',
    description: 'Read the curve, choose your exit, and keep every round deliberate.',
    path: '/games/crash',
    maxPayout: '10,000x',
    volatility: 'High',
    categories: ['featured', 'fast'],
    visual: 'crash-curve',
    tone: 'terracotta',
  },
  {
    id: 'roulette',
    name: 'Royale Roulette',
    eyebrow: 'European table',
    description: 'A measured table rhythm with straight, split, and outside bets.',
    path: '/games/roulette',
    maxPayout: '36x',
    volatility: 'Medium',
    categories: ['featured', 'table'],
    visual: 'roulette-wheel',
    tone: 'teal',
  },
  {
    id: 'blackjack',
    name: 'Velvet Blackjack',
    eyebrow: 'Private table',
    description: 'Classic 21 with split and double-down decisions kept in full view.',
    path: '/games/blackjack',
    maxPayout: '2.5x',
    volatility: 'Medium',
    categories: ['featured', 'table'],
    visual: 'card-fan',
    tone: 'aubergine',
  },
  {
    id: 'dice',
    name: 'Dice Studio',
    eyebrow: 'Fast round',
    description: 'Tune the probability, inspect the payout, and roll on your terms.',
    path: '/games/dice',
    maxPayout: '990x',
    volatility: 'Low',
    categories: ['fast'],
    visual: 'dice-distribution',
    tone: 'slate',
  },
  {
    id: 'slots',
    name: 'Afterglow 777',
    eyebrow: 'Progressive reels',
    description: 'Three clean reels, transparent lines, and a progressive top prize.',
    path: '/games/slots',
    maxPayout: '5,000x',
    volatility: 'High',
    categories: ['fast'],
    visual: 'slot-reels',
    tone: 'moss',
  },
] as const;

export function filterDashboardGames(
  games: readonly DashboardGame[],
  category: DashboardCategory,
): readonly DashboardGame[] {
  if (category === 'all') return games;
  return games.filter((game) => game.categories.includes(category));
}

export function resolveDashboardGame(
  games: readonly DashboardGame[],
  activeGameId: string | null,
): DashboardGame | null {
  if (games.length === 0) return null;
  return games.find((game) => game.id === activeGameId) ?? games[0] ?? null;
}

const finitePositive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export function deriveDashboardMetrics(bets: readonly DashboardBet[]): DashboardMetrics {
  if (bets.length === 0) {
    return {
      totalWagered: 0,
      totalPayout: 0,
      winRate: 0,
      bestMultiplier: 0,
      recentWins: [],
      activityBars: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  const totalWagered = bets.reduce((sum, entry) => sum + finitePositive(entry.amount), 0);
  const totalPayout = bets.reduce((sum, entry) => sum + finitePositive(entry.payout), 0);
  const wins = bets.filter((entry) => entry.isWin);
  const winRate = Math.round((wins.length / bets.length) * 100);
  const bestMultiplier = wins.reduce(
    (best, entry) => Math.max(best, finitePositive(entry.multiplier)),
    0,
  );
  const recentWins = wins.filter((entry) => finitePositive(entry.payout) > 0).slice(0, 4);

  const activityValues = bets
    .slice(0, 7)
    .reverse()
    .map((entry) => finitePositive(entry.amount));
  const paddedActivity = [
    ...Array(Math.max(0, 7 - activityValues.length)).fill(0),
    ...activityValues,
  ];
  const maxActivity = Math.max(...paddedActivity, 0);
  const activityBars = paddedActivity.map((value) =>
    maxActivity === 0 ? 0 : Math.round((value / maxActivity) * 100),
  );

  return {
    totalWagered,
    totalPayout,
    winRate,
    bestMultiplier,
    recentWins,
    activityBars,
  };
}

export function formatDashboardMoney(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `$${safeValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
