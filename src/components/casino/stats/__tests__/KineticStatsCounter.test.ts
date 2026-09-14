import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { KineticStatsCounter } from '../KineticStatsCounter';

describe('KineticStatsCounter', () => {
  it('renders loading dots when loading is true', () => {
    const markup = renderToStaticMarkup(
      React.createElement(KineticStatsCounter, {
        value: '$1,250.00',
        loading: true,
      }),
    );
    expect(markup).toContain('aria-label="Lade Statistik..."');
  });

  it('renders formatted digits and currency symbol with tabular nums', () => {
    const markup = renderToStaticMarkup(
      React.createElement(KineticStatsCounter, {
        value: '$25,995.00',
        color: '#D4AF37',
        loading: false,
      }),
    );
    expect(markup).toContain('aria-label="$25,995.00"');
    expect(markup).toContain('$');
    expect(markup).toContain('25,995.00');
  });

  it('renders percentage and profit sign properly', () => {
    const markup = renderToStaticMarkup(
      React.createElement(KineticStatsCounter, {
        value: '+54.2%',
        color: '#10b981',
        loading: false,
      }),
    );
    expect(markup).toContain('aria-label="+54.2%"');
    expect(markup).toContain('+');
    expect(markup).toContain('%');
  });
});
