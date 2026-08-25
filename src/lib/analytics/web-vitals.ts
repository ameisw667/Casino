import type { Metric } from 'web-vitals';
import { hasAnalyticsConsent } from './consent';
import { trackAllowedEvent } from './events';

let reportingStarted = false;

type CoreWebVital = Pick<Metric, 'name' | 'rating' | 'value'>;

function reportWebVital(metric: CoreWebVital): void {
  if (!hasAnalyticsConsent()) return;
  if (metric.name !== 'LCP' && metric.name !== 'CLS' && metric.name !== 'INP') return;
  if (!Number.isFinite(metric.value) || metric.value < 0) return;
  if (metric.rating !== 'good' && metric.rating !== 'needs-improvement' && metric.rating !== 'poor') {
    return;
  }

  void trackAllowedEvent({
    name: 'web_vital_measured',
    props: {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    },
  });
}

/** Starts the consent-bound Core Web Vitals observers once for the current page lifetime. */
export async function startWebVitalsReporting(): Promise<void> {
  if (reportingStarted || !hasAnalyticsConsent()) return;
  reportingStarted = true;

  try {
    const { onCLS, onINP, onLCP } = await import('web-vitals');
    if (!hasAnalyticsConsent()) {
      reportingStarted = false;
      return;
    }
    onCLS(reportWebVital);
    onINP(reportWebVital);
    onLCP(reportWebVital);
  } catch {
    reportingStarted = false;
  }
}