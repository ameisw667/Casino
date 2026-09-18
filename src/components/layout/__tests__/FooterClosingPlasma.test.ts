import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FooterClosingPlasma } from '../FooterClosingPlasma';

describe('FooterClosingPlasma', () => {
  it('renders correctly server-side without crashing', () => {
    const html = renderToString(React.createElement(FooterClosingPlasma));
    expect(html).toContain('footer-closing-plasma');
    expect(html).toContain('High-Roller Club');
    expect(html).toContain('VIP Vault betreten');
    expect(html).toContain('High-Roller Telegram');
  });
});
