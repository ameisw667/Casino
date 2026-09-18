// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/store/useCasinoStore', () => ({
  useCasinoStore: () => ({ gameConfig: { limits: { betMax: 10000 } } }),
}));

// SimulationResultsPanel pulls in recharts, whose cold import takes ~20s under jsdom on this
// machine and blows the 5s per-test timeout before the component ever mounts. This suite only
// asserts placeholder/verdict text, never chart output — stub the chart primitives instead.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  ReferenceLine: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

// SimulationConfigPanel's ResponsiveContainer chart needs real layout dimensions;
// jsdom reports 0 for both without this, which recharts warns about but still renders.
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 300,
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SimulationPageClient', () => {
  it('mounts and shows the empty-results placeholder before running a simulation', async () => {
    const { default: SimulationPageClient } = await import('../SimulationPageClient');
    render(<SimulationPageClient />);

    expect(screen.getByText('RTP Validator')).toBeTruthy();
    expect(
      screen.getByText('Configure parameters and run the simulation to validate RTP'),
    ).toBeTruthy();
  });

  it('shows an RTP result after clicking Run Simulation', async () => {
    vi.useFakeTimers();
    const { default: SimulationPageClient } = await import('../SimulationPageClient');
    render(<SimulationPageClient />);

    fireEvent.click(screen.getByText('Run Simulation'));
    await vi.advanceTimersByTimeAsync(100);
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/RTP (✓ Validated|⚠ Out of Bounds)/)).toBeTruthy();
    });
  });
});
