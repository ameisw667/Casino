import { Metadata } from 'next';
import AutoBetDrawerTestingClient from './AutoBetDrawerTestingClient';

export const metadata: Metadata = {
  title: '7.5 — AutoBetDrawer Harmonization Evaluation | Casino Royale',
  description:
    'Evaluierung und Vergleich des universellen Auto-Wett-Konfigurations-Drawers <AutoBetDrawer />. Status Quo Analyse und Produktions-Code-Export.',
};

export default function AutoBetDrawerTestingPage() {
  return <AutoBetDrawerTestingClient />;
}
