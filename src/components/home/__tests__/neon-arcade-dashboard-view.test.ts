import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NeonArcadeDashboardView } from '../NeonArcadeDashboardView';
import { DASHBOARD_GAMES, type DashboardMetrics } from '../neon-arcade-dashboard-model';

const metrics: DashboardMetrics = {
  totalWagered: 175,
  totalPayout: 350,
  winRate: 67,
  bestMultiplier: 4,
  recentWins: [
    {
      id: 'win-1',
      user: 'Player',
      game: 'CRASH',
      amount: 100,
      multiplier: 2.5,
      payout: 250,
      time: 'now',
      isWin: true,
    },
  ],
  activityBars: [22, 35, 48, 64, 53, 78, 91],
};

const renderDashboard = (overrides: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    createElement(NeonArcadeDashboardView, {
      games: DASHBOARD_GAMES,
      activeCategory: 'all',
      onCategoryChange: () => undefined,
      activeGameId: 'crash',
      onGameSelect: () => undefined,
      menuOpen: false,
      onMenuToggle: () => undefined,
      onMenuClose: () => undefined,
      hideBalance: false,
      onToggleBalance: () => undefined,
      balance: 9896.58,
      rank: 'SILVER',
      level: 15,
      xpProgress: 62,
      displayName: 'Player',
      metrics,
      communityProgress: 74,
      communityWagered: 18500,
      communityGoal: 25000,
      ...overrides,
    }),
  );

describe('NeonArcadeDashboardView', () => {
  it('renders the accessible root dashboard with real game destinations', () => {
    const html = renderDashboard();

    expect(html).toContain('data-dashboard="neon-arcade"');
    expect(html).toContain('<h1');
    expect(html).toContain('Pick your pace.');
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain('href="/games/crash"');
    expect(html).toContain('href="/games/roulette"');
    expect(html).toContain('href="/games/blackjack"');
    expect(html).toContain('href="/games/dice"');
    expect(html).toContain('href="/games/slots"');
    expect(html).toContain('$9,896.58');
    expect(html).toContain('SILVER');
  });

  it('exposes mobile navigation state and masked balance without changing data', () => {
    const html = renderDashboard({ menuOpen: true, hideBalance: true });

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-menu-open="true"');
    expect(html).toContain('••••••');
    expect(html).not.toContain('$9,896.58');
  });

  it('filters the rendered floor to table games', () => {
    const html = renderDashboard({ activeCategory: 'table' });

    expect(html).toContain('Royale Roulette');
    expect(html).toContain('Velvet Blackjack');
    expect(html).not.toContain('Crash Atelier');
    expect(html).not.toContain('Dice Studio');
  });

  it('renders a single interactive game runway with the selected roulette table', () => {
    const html = renderDashboard({ activeCategory: 'table', activeGameId: 'roulette' });

    expect(html).toContain('data-layout="game-runway"');
    expect(html).toContain('data-active-game="roulette"');
    expect(html).toContain('aria-label="Select Royale Roulette"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-game-visual="roulette-table-v2"');
    expect(html).toContain('European single zero');
    expect(html).toContain('Inside bets');
    expect(html).toContain('href="/games/roulette"');
  });

  it('renders the private blackjack table as a real dealer and player scene', () => {
    const html = renderDashboard({ activeCategory: 'table', activeGameId: 'blackjack' });

    expect(html).toContain('data-active-game="blackjack"');
    expect(html).toContain('data-game-visual="blackjack-table-v2"');
    expect(html).toContain('Dealer');
    expect(html).toContain('Player');
    expect(html).toContain('>21<');
    expect(html).toContain('href="/games/blackjack"');
  });
});
