import type { Metadata } from 'next';
import AnalyticsPageLoader from './AnalyticsPageLoader';

export const metadata: Metadata = {
  title: 'BI Analytics | Casino Royale Admin',
  description: 'Admin-only cohort, retention, revenue and operations analytics for Casino Royale.',
};

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return <AnalyticsPageLoader />;
}
