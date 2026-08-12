import { Metadata } from 'next';
import BetInputGroupTestingClient from './BetInputGroupTestingClient';

export const metadata: Metadata = {
  title: '7.2 — BetInputGroup Harmonization Evaluation | Casino Royale',
  description:
    'Evaluierung und Vergleich von 3 Next-Gen 2026 Optionen für das universelle Wetteingabefeld <BetInputGroup />. Status Quo Analyse und Produktions-Code-Export.',
};

export default function BetInputGroupTestingPage() {
  return <BetInputGroupTestingClient />;
}
