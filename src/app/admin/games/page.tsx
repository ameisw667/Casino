import { Metadata } from 'next';
import GamesPageLoader from './GamesPageLoader';

export const metadata: Metadata = {
  title: 'Game Management | Casino Royale Admin',
  description: 'Manage and monitor casino games, statistics, and controls.',
};

export const dynamic = 'force-dynamic';

export default function GamesPage() {
  return <GamesPageLoader />;
}
