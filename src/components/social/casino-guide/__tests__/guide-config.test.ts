import { describe, expect, it } from 'vitest';
import { resolveGuideActionRoute } from '../guide-config';

describe('resolveGuideActionRoute', () => {
  it('maps each non-game action type to its fixed route', () => {
    expect(resolveGuideActionRoute({ type: 'open_vault' })).toBe('/vault');
    expect(resolveGuideActionRoute({ type: 'open_settings' })).toBe('/vault');
    expect(resolveGuideActionRoute({ type: 'open_rank_benefits' })).toBe('/vault');
    expect(resolveGuideActionRoute({ type: 'open_history' })).toBe('/history');
    expect(resolveGuideActionRoute({ type: 'open_leaderboard' })).toBe('/leaderboard');
  });

  it('routes navigate_game to /games/<slug> for each of the 5 real games', () => {
    for (const game of ['blackjack', 'crash', 'dice', 'roulette', 'slots']) {
      expect(resolveGuideActionRoute({ type: 'navigate_game', target: game })).toBe(
        `/games/${game}`,
      );
    }
  });

  it('sanitizes a mixed-case or punctuated game target before building the route', () => {
    expect(resolveGuideActionRoute({ type: 'navigate_game', target: 'Black-Jack!' })).toBe(
      '/games/blackjack',
    );
  });

  it('never routes to a dead-end /games/<slug> for a non-game target on navigate_game (regression: the server allowlist permits vault/settings/history/leaderboard targets on every action type, not just their own)', () => {
    expect(resolveGuideActionRoute({ type: 'navigate_game', target: 'vault' })).toBeNull();
    expect(resolveGuideActionRoute({ type: 'navigate_game', target: 'settings' })).toBeNull();
    expect(resolveGuideActionRoute({ type: 'navigate_game', target: 'javascript:alert(1)' })).toBeNull();
  });

  it('is a no-op for navigate_game without a target and for an unknown action type', () => {
    expect(resolveGuideActionRoute({ type: 'navigate_game' })).toBeNull();
    expect(resolveGuideActionRoute({ type: 'delete_account' })).toBeNull();
  });
});
