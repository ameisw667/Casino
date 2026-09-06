import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { MainSidebar, type MenuItem } from '../MainSidebar';

const setBoolean = (() => undefined) as React.Dispatch<React.SetStateAction<boolean>>;

function renderSidebar(pathname: string) {
  const menuItems = [
    {
      label: 'Lobby',
      path: '/',
      imageSrc: '/images/2026-09-06_sidebar-icon-lobby_v001.png',
    },
    { label: 'Games', path: '/games' },
    { label: 'My Bets', path: '/history' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Vault', path: '/vault' },
    { label: 'Stats', path: '/stats' },
    { label: 'Settings', path: '#', onClick: () => undefined },
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
  it('renders all primary navigation entries as persistent text-only buttons', () => {
    const markup = renderSidebar('/games');
    const items = markup.match(/<button[^>]*data-sidebar-nav-item[^>]*>[\s\S]*?<\/button>/g) ?? [];

    expect(items).toHaveLength(7);
    expect(items.every((item) => !item.includes('<svg'))).toBe(true);
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('width:240px');
    expect(markup).not.toContain('Collapse sidebar');
    expect(markup).not.toContain('Expand sidebar');
  });

  it('renders only the approved lobby pilot image alongside its text label', () => {
    const markup = renderSidebar('/');

    expect(markup).toContain('data-sidebar-nav-image');
    expect(markup).toContain('2026-09-06_sidebar-icon-lobby_v001.png');
    expect(markup.match(/data-sidebar-nav-image/g) ?? []).toHaveLength(1);
  });
});
