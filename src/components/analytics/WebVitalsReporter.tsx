'use client';

import { useEffect } from 'react';
import { subscribeToConsentChanges } from '@/lib/analytics/consent';
import { startWebVitalsReporting } from '@/lib/analytics/web-vitals';

/** Isolated client boundary for consent-gated Core Web Vitals field measurement. */
export function WebVitalsReporter() {
  useEffect(() => {
    const start = () => {
      void startWebVitalsReporting();
    };

    start();
    return subscribeToConsentChanges(start);
  }, []);

  return null;
}
