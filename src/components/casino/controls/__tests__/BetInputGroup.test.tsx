// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BetInputGroup } from '../BetInputGroup';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    play: vi.fn(),
  },
}));

describe('BetInputGroup - ARIA / native min-max attributes', () => {
  it('applies minBet and maxBet as native HTML min/max attributes on the input', () => {
    render(<BetInputGroup value={5} onChange={vi.fn()} balance={100} minBet={1} maxBet={250} />);

    const input = screen.getByLabelText('Wetteinsatz in Dollar');
    expect(input.getAttribute('min')).toBe('1');
    expect(input.getAttribute('max')).toBe('250');
  });

  it('does not render the redundant aria-valuemin / aria-valuemax attributes', () => {
    render(<BetInputGroup value={5} onChange={vi.fn()} balance={100} minBet={1} maxBet={250} />);

    const input = screen.getByLabelText('Wetteinsatz in Dollar');
    expect(input.hasAttribute('aria-valuemin')).toBe(false);
    expect(input.hasAttribute('aria-valuemax')).toBe(false);
  });

  it('falls back to the default minBet/maxBet props when none are provided', () => {
    render(<BetInputGroup value={1} onChange={vi.fn()} balance={100} />);

    const input = screen.getByLabelText('Wetteinsatz in Dollar');
    expect(input.getAttribute('min')).toBe('0.1');
    expect(input.getAttribute('max')).toBe('10000');
  });
});
