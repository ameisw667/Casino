'use client';

import dynamic from 'next/dynamic';

const AnalyticsPageClient = dynamic(() => import('./AnalyticsPageClient'), { ssr: false });

export default function AnalyticsPageLoader() {
  return <AnalyticsPageClient />;
}
