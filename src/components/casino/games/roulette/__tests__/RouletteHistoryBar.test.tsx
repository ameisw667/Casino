// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouletteHistoryBar } from '../RouletteHistoryBar';
import type { RouletteNumber } from '../types';

describe('RouletteHistoryBar - aria-live result announcement', () => {
  it('renders an aria-live="polite" region announcing the newest winning number', () => {
    const history: RouletteNumber[] = [
      { n: 17, c: 'BLACK' },
      { n: 5, c: 'RED' },
    ];

    render(<RouletteHistoryBar history={history} hideHotCold />);

    const liveRegion = screen.getByRole('status');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.textContent).toBe('Ergebnis: 17, Schwarz');
  });

  it('updates the announced text when the leading history entry changes', () => {
    const initialHistory: RouletteNumber[] = [{ n: 5, c: 'RED' }];

    const { rerender } = render(<RouletteHistoryBar history={initialHistory} hideHotCold />);

    expect(screen.getByRole('status').textContent).toBe('Ergebnis: 5, Rot');

    const updatedHistory: RouletteNumber[] = [{ n: 0, c: 'GREEN' }, ...initialHistory];
    rerender(<RouletteHistoryBar history={updatedHistory} hideHotCold />);

    expect(screen.getByRole('status').textContent).toBe('Ergebnis: 0, Grün');
  });

  it('renders an empty live region when there is no history yet', () => {
    render(<RouletteHistoryBar history={[]} hideHotCold />);

    expect(screen.getByRole('status').textContent).toBe('');
  });
});
