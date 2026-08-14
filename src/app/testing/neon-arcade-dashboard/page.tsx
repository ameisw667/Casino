import type { Metadata } from 'next';
import { NeonArcadeDashboard } from '@/components/home/NeonArcadeDashboard';

export const metadata: Metadata = {
  title: 'Neon Arcade Dashboard — Design Test',
  description:
    'Isolated classy-playful dashboard concept based on the selected Neon Arcade direction.',
};

export default function NeonArcadeDashboardTestingPage() {
  return <NeonArcadeDashboard />;
}
