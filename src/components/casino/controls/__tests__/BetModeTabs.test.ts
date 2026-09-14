import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BetModeTabs } from '../BetModeTabs';

describe('BetModeTabs', () => {
  it('renders tablist and both modes correctly', () => {
    const fn = vi.fn();
    const html = renderToString(
      React.createElement(BetModeTabs, { mode: 'manual', onModeChange: fn }),
    );
    expect(html).toContain('tablist');
    expect(html).toContain('Manual');
    expect(html).toContain('Auto Pilot');
    expect(html).toContain('aria-selected="true"');
  });

  it('renders auto mode selected state', () => {
    const fn = vi.fn();
    const html = renderToString(
      React.createElement(BetModeTabs, { mode: 'auto', onModeChange: fn }),
    );
    expect(html).toContain('Auto Pilot');
  });
});
