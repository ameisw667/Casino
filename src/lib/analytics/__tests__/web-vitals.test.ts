import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onCLS, onINP, onLCP } from 'web-vitals';

type VitalCallback = (metric: { name: string; value: number; rating: string }) => void;

const mocks = vi.hoisted(() => ({
  hasAnalyticsConsent: vi.fn(),
  trackAllowedEvent: vi.fn(),
  callbacks: {} as Record<string, VitalCallback | undefined>,
}));

vi.mock('../consent', () => ({
  hasAnalyticsConsent: mocks.hasAnalyticsConsent,
}));

vi.mock('../events', () => ({
  trackAllowedEvent: mocks.trackAllowedEvent,
}));

vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback: VitalCallback) => {
    mocks.callbacks.CLS = callback;
  }),
  onINP: vi.fn((callback: VitalCallback) => {
    mocks.callbacks.INP = callback;
  }),
  onLCP: vi.fn((callback: VitalCallback) => {
    mocks.callbacks.LCP = callback;
  }),
}));

describe('startWebVitalsReporting', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.callbacks.CLS = undefined;
    mocks.callbacks.INP = undefined;
    mocks.callbacks.LCP = undefined;
    mocks.trackAllowedEvent.mockResolvedValue(undefined);
  });

  it('does not load or report metrics without analytics consent', async () => {
    mocks.hasAnalyticsConsent.mockReturnValue(false);
    const { startWebVitalsReporting } = await import('../web-vitals');

    await startWebVitalsReporting();

    expect(mocks.callbacks.LCP).toBeUndefined();
    expect(mocks.callbacks.CLS).toBeUndefined();
    expect(mocks.callbacks.INP).toBeUndefined();
    expect(mocks.trackAllowedEvent).not.toHaveBeenCalled();
    expect(onCLS).not.toHaveBeenCalled();
    expect(onINP).not.toHaveBeenCalled();
    expect(onLCP).not.toHaveBeenCalled();
  });

  it('does not register observers when consent is revoked while the library is loading', async () => {
    mocks.hasAnalyticsConsent.mockReturnValueOnce(true).mockReturnValue(false);
    const { startWebVitalsReporting } = await import('../web-vitals');

    await startWebVitalsReporting();

    expect(onCLS).not.toHaveBeenCalled();
    expect(onINP).not.toHaveBeenCalled();
    expect(onLCP).not.toHaveBeenCalled();
  });

  it('registers all core-vital observers after consent and sends only the allowlisted payload', async () => {
    mocks.hasAnalyticsConsent.mockReturnValue(true);
    const { startWebVitalsReporting } = await import('../web-vitals');

    await Promise.all([startWebVitalsReporting(), startWebVitalsReporting()]);
    mocks.callbacks.LCP?.({ name: 'LCP', value: 2450.5, rating: 'good' });

    expect(onCLS).toHaveBeenCalledTimes(1);
    expect(onINP).toHaveBeenCalledTimes(1);
    expect(onLCP).toHaveBeenCalledTimes(1);
    expect(mocks.callbacks.CLS).toBeTypeOf('function');
    expect(mocks.callbacks.INP).toBeTypeOf('function');
    expect(mocks.trackAllowedEvent).toHaveBeenCalledWith({
      name: 'web_vital_measured',
      props: { metric: 'LCP', value: 2450.5, rating: 'good' },
    });

    mocks.trackAllowedEvent.mockClear();
    mocks.hasAnalyticsConsent.mockReturnValue(false);
    mocks.callbacks.LCP?.({ name: 'LCP', value: 3100, rating: 'needs-improvement' });

    expect(mocks.trackAllowedEvent).not.toHaveBeenCalled();
  });

  it('drops malformed metric payloads before they reach the event channel', async () => {
    mocks.hasAnalyticsConsent.mockReturnValue(true);
    const { startWebVitalsReporting } = await import('../web-vitals');

    await startWebVitalsReporting();
    mocks.callbacks.LCP?.({ name: 'LCP', value: -1, rating: 'good' });
    mocks.callbacks.LCP?.({ name: 'LCP', value: Number.NaN, rating: 'good' });
    mocks.callbacks.LCP?.({ name: 'LCP', value: Number.POSITIVE_INFINITY, rating: 'good' });
    mocks.callbacks.LCP?.({ name: 'TTFB', value: 12, rating: 'good' });
    mocks.callbacks.LCP?.({ name: 'LCP', value: 12, rating: 'unexpected' });

    expect(mocks.trackAllowedEvent).not.toHaveBeenCalled();
  });
});
