import { describe, expect, it } from 'vitest';
import { getShellVariant } from '../shell-routing';

describe('getShellVariant', () => {
  it.each(['/v2', '/v2/', '/refactoring', '/testing/7.6', '/testing/neon-arcade-dashboard'])(
    'renders %s as a standalone surface',
    (pathname) => {
      expect(getShellVariant(pathname)).toBe('standalone');
    },
  );

  it.each(['/', '/games', '/games/crash', '/history', '/leaderboard', '/vault', '/stats'])(
    'keeps %s inside the main casino shell',
    (pathname) => {
      expect(getShellVariant(pathname)).toBe('main');
    },
  );

  it.each(['/admin', '/admin/games', '/admin/users'])(
    'keeps %s inside the admin shell',
    (pathname) => {
      expect(getShellVariant(pathname)).toBe('admin');
    },
  );
});
