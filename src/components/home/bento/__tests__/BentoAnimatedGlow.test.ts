import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BentoAnimatedGlow } from '../BentoAnimatedGlow';

describe('BentoAnimatedGlow', () => {
  it('renders correctly server-side without crashing', () => {
    const html = renderToString(
      React.createElement(BentoAnimatedGlow, { intensity: 'high', variant: 'gold' }),
    );
    expect(html).toContain('bento-animated-glow');
  });

  it('supports emerald and bronze variants', () => {
    const htmlEmerald = renderToString(
      React.createElement(BentoAnimatedGlow, { variant: 'emerald' }),
    );
    expect(htmlEmerald).toContain('bento-animated-glow');

    const htmlBronze = renderToString(
      React.createElement(BentoAnimatedGlow, { variant: 'bronze' }),
    );
    expect(htmlBronze).toContain('bento-animated-glow');
  });
});
