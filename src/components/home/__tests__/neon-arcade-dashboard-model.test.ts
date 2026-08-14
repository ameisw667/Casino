import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_GAMES,
  deriveDashboardMetrics,
  filterDashboardGames,
  formatDashboardMoney,
  resolveDashboardGame,
  type DashboardBet,
} from '../neon-arcade-dashboard-model';

const bet = (overrides: Partial<DashboardBet> = {}): DashboardBet => ({
  id: 'bet-1',
  user: 'Player',
  game: 'CRASH',
  amount: 100,
  multiplier: 2.5,
  payout: 250,
  time: 'now',
  isWin: true,
  ...overrides,
});

describe('Neon Arcade dashboard model', () => {
  it('defines five unique games with real routes and distinct visualizations', () => {
    expect(DASHBOARD_GAMES.map((game) => game.id)).toEqual([
      'crash',
      'roulette',
      'blackjack',
      'dice',
      'slots',
    ]);
    expect(DASHBOARD_GAMES.every((game) => game.path.startsWith('/games/'))).toBe(true);
    expect(DASHBOARD_GAMES.map((game) => game.visual)).toEqual([
      'crash-curve',
      'roulette-wheel',
      'card-fan',
      'dice-distribution',
      'slot-reels',
    ]);
  });

  it('returns stable zero metrics for an empty floor', () => {
    expect(deriveDashboardMetrics([])).toEqual({
      totalWagered: 0,
      totalPayout: 0,
      winRate: 0,
      bestMultiplier: 0,
      recentWins: [],
      activityBars: [0, 0, 0, 0, 0, 0, 0],
    });
  });

  it('derives session metrics from real bet outcomes', () => {
    const metrics = deriveDashboardMetrics([
      bet({ id: 'newest', amount: 100, payout: 250, multiplier: 2.5, isWin: true }),
      bet({ id: 'loss', amount: 50, payout: 0, multiplier: 0, isWin: false }),
      bet({ id: 'best', amount: 25, payout: 100, multiplier: 4, isWin: true }),
    ]);

    expect(metrics.totalWagered).toBe(175);
    expect(metrics.totalPayout).toBe(350);
    expect(metrics.winRate).toBe(67);
    expect(metrics.bestMultiplier).toBe(4);
    expect(metrics.recentWins.map((entry) => entry.id)).toEqual(['newest', 'best']);
    expect(metrics.activityBars).toHaveLength(7);
    expect(metrics.activityBars.every((value) => value >= 0 && value <= 100)).toBe(true);
  });

  it('ignores non-finite financial values instead of poisoning dashboard totals', () => {
    const metrics = deriveDashboardMetrics([
      bet({ amount: Number.NaN, payout: Number.POSITIVE_INFINITY, multiplier: Number.NaN }),
    ]);

    expect(metrics.totalWagered).toBe(0);
    expect(metrics.totalPayout).toBe(0);
    expect(metrics.bestMultiplier).toBe(0);
  });

  it('formats money deterministically and falls back safely', () => {
    expect(formatDashboardMoney(1234.5)).toBe('$1,234.50');
    expect(formatDashboardMoney(Number.NaN)).toBe('$0.00');
  });

  it('filters the room index without mutating the configured game order', () => {
    const originalIds = DASHBOARD_GAMES.map((game) => game.id);
    const tableGames = filterDashboardGames(DASHBOARD_GAMES, 'table');

    expect(tableGames.map((game) => game.id)).toEqual(['roulette', 'blackjack']);
    expect(DASHBOARD_GAMES.map((game) => game.id)).toEqual(originalIds);
  });

  it('resolves an invalid active room to the first visible room and handles an empty floor', () => {
    const tableGames = filterDashboardGames(DASHBOARD_GAMES, 'table');

    expect(resolveDashboardGame(tableGames, 'missing')?.id).toBe('roulette');
    expect(resolveDashboardGame(tableGames, 'blackjack')?.id).toBe('blackjack');
    expect(resolveDashboardGame([], 'roulette')).toBeNull();
  });
});
