import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiveWinsFlippingSwap } from '../LiveWinsFlippingSwap';

describe('LiveWinsFlippingSwap', () => {
  it('renders word and secondaryWord correctly', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LiveWinsFlippingSwap, {
        word: '89.00x',
        secondaryWord: 'Neon Slots',
        highlight: true,
        colorScheme: 'gold',
      }),
    );
    expect(markup).toContain('89.00x');
    expect(markup).toContain('Neon Slots');
  });

  it('applies emerald colorScheme', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LiveWinsFlippingSwap, {
        word: '+$4,250.00',
        colorScheme: 'emerald',
      }),
    );
    expect(markup).toContain('+$4,250.00');
  });
});
