import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { BarChart3, Gamepad2, History, Home, Settings, Target, Trophy } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { MainSidebar, type MenuItem } from '../MainSidebar';

const setBoolean = (() => undefined) as React.Dispatch<React.SetStateAction<boolean>>;

function renderSidebar(pathname: string) {
  const menuItems = [
    {
      label: 'Lobby',
      path: '/',
      icon: React.createElement(Home, { size: 18 }),
    },
    { label: 'Games', path: '/games', icon: React.createElement(Gamepad2, { size: 18 }) },
    { label: 'My Bets', path: '/history', icon: React.createElement(History, { size: 18 }) },
    { label: 'Leaderboard', path: '/leaderboard', icon: React.createElement(Trophy, { size: 18 }) },
    { label: 'Vault', path: '/vault', icon: React.createElement(Target, { size: 18 }) },
    { label: 'Stats', path: '/stats', icon: React.createElement(BarChart3, { size: 18 }) },
    {
      label: 'Settings',
      path: '#',
      icon: React.createElement(Settings, { size: 18 }),
      onClick: () => undefined,
    },
  ] as unknown as MenuItem[];

  return renderToStaticMarkup(
    React.createElement(MainSidebar, {
      isMobile: false,
      mobileSidebarOpen: false,
      menuItems,
      pathname,
      showSettings: false,
      navigate: () => undefined,
      setMobileSidebarOpen: setBoolean,
      setShowSettings: setBoolean,
      setShowProvablyFair: setBoolean,
      setShowSettingsModal: setBoolean,
    }),
  );
}

describe('MainSidebar', () => {
  it('renders all primary navigation entries with classical icons and preserves the active route treatment', () => {
    const markup = renderSidebar('/games');
    const items = markup.match(/<button[^>]*data-sidebar-nav-item[^>]*>[\s\S]*?<\/button>/g) ?? [];

    expect(items).toHaveLength(7);
    expect(items.every((item) => item.includes('data-sidebar-nav-icon'))).toBe(true);
    expect(items.every((item) => item.includes('<svg'))).toBe(true);
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('width:240px');
    expect(markup).not.toContain('Collapse sidebar');
    expect(markup).not.toContain('Expand sidebar');
  });
});
