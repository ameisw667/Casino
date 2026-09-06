import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { LeaderboardPodium } from '../LeaderboardPodium';

const rows = [
  { username: 'Champion', level: 35, rank: 'Gold', total_wagered: 1000, biggest_win: 400 },
  { username: 'Second', level: 22, rank: 'Silver', total_wagered: 800, biggest_win: 200 },
  { username: 'Third', level: 23, rank: 'Silver', total_wagered: 600, biggest_win: 100 },
];

describe('LeaderboardPodium', () => {
  it('uses more legible local player portraits for champion and side ranks', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LeaderboardPodium, { topThree: rows, isMobile: false }),
    );

    expect(markup).toContain('width:72px');
    expect(markup).toContain('width:60px');
    expect(markup).toContain('sizes="72px"');
    expect(markup).toContain('sizes="60px"');
  });

  it('keeps the larger portraits in the single-column mobile layout', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LeaderboardPodium, { topThree: rows, isMobile: true }),
    );

    expect(markup).toContain('grid-template-columns:1fr');
    expect(markup).toContain('width:72px');
    expect(markup).toContain('width:60px');
  });
});
