import { Metadata } from 'next';
import SimulationPageLoader from './SimulationPageLoader';

export const metadata: Metadata = {
  title: 'Bet Simulation | Casino Royale Admin',
  description: 'Run and analyze bet simulations for Casino Royale game balancing.',
};

export const dynamic = 'force-dynamic';

export default function SimulationPage() {
  return <SimulationPageLoader />;
}
