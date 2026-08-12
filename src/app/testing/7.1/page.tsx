import { Metadata } from 'next';
import BetModeTabsTestingClient from './BetModeTabsTestingClient';

export const metadata: Metadata = {
  title: '7.1 — BetModeTabs Harmonization Evaluation | Casino Royale',
  description:
    'Interaktive Evaluierungsumgebung für die BetModeTabs-Komponente (Status Quo vs. 2026 Next-Gen Empfehlungen).',
};

export default function BetModeTabsTestingPage() {
  return <BetModeTabsTestingClient />;
}
