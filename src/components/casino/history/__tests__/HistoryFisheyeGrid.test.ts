import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HistoryFisheyeGrid } from '../HistoryFisheyeGrid';
import type { HistoryRow } from '@/components/history/HistoryTableStream';

const mockRows: HistoryRow[] = [
  {
    id: 'bet-1',
    game: 'Dice',
    type: 'game_win',
    amount: 145.5,
    balance_after: 1145.5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'bet-2',
    game: 'Blackjack',
    type: 'game_loss',
    amount: -50.0,
    balance_after: 1095.5,
    created_at: new Date().toISOString(),
  },
];

describe('HistoryFisheyeGrid', () => {
  it('renders cards with game badges and amounts', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HistoryFisheyeGrid, {
        rows: mockRows,
        isMobile: false,
      }),
    );
    expect(markup).toContain('Dice');
    expect(markup).toContain('Blackjack');
    expect(markup).toContain('+$145.50');
    expect(markup).toContain('-$50.00');
    expect(markup).toContain('FAIR');
  });

  it('renders null if empty rows provided', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HistoryFisheyeGrid, {
        rows: [],
      }),
    );
    expect(markup).toBe('');
  });
});
