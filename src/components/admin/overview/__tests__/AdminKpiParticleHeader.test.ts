import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AdminKpiParticleHeader } from '../AdminKpiParticleHeader';

describe('AdminKpiParticleHeader', () => {
  it('renders correctly with default monetary KPIs', () => {
    const html = renderToString(
      React.createElement(AdminKpiParticleHeader, {
        totalWagered: '$1,248,500',
        netProfit: '+$384,120',
        activePlayers: '1,482',
        systemHealth: '99.98%',
      }),
    );

    expect(html).toContain('Executive Command');
    expect(html).toContain('GROSS TOTAL WAGERED');
    expect(html).toContain('Active Players');
    expect(html).toContain('Uptime Health');
  });

  it('supports custom currency prefixes and metric labels', () => {
    const html = renderToString(
      React.createElement(AdminKpiParticleHeader, {
        totalWagered: '2,500,000',
        currencyPrefix: '€',
      }),
    );

    expect(html).toContain('Executive Command');
  });
});
