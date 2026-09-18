import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BlackjackLiquidBackdrop } from '../BlackjackLiquidBackdrop';

describe('BlackjackLiquidBackdrop', () => {
  it('renders canvas node without throwing', () => {
    const markup = renderToStaticMarkup(
      React.createElement(BlackjackLiquidBackdrop, {
        theme: 'emerald',
        opacity: 0.5,
      }),
    );
    expect(markup).toContain('<canvas');
    expect(markup).toContain('mix-blend-mode:screen');
  });

  it('supports custom theme without errors', () => {
    const markup = renderToStaticMarkup(
      React.createElement(BlackjackLiquidBackdrop, {
        theme: 'obsidian',
        opacity: 0.3,
      }),
    );
    expect(markup).toContain('<canvas');
  });
});
