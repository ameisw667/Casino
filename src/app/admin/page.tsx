import { Metadata } from 'next';
import AdminOverviewLoader from './AdminOverviewLoader';

export const metadata: Metadata = {
  title: 'Admin Overview | Casino Royale',
  description: 'Admin dashboard overview for Casino Royale — key metrics and platform health.',
};

export const dynamic = 'force-dynamic';

export default function AdminOverview() {
  return <AdminOverviewLoader />;
}
