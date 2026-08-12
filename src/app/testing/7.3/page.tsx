import { Metadata } from 'next';
import GameActionButtonTestingClient from './GameActionButtonTestingClient';

export const metadata: Metadata = {
  title: '7.3 — GameActionButton Harmonization Evaluation | Casino Royale',
  description:
    'Evaluierung und Vergleich von 3 Next-Gen 2026 Optionen für den primären CTA-Wettbutton <GameActionButton />. Status Quo Analyse und Produktions-Code-Export.',
};

export default function GameActionButtonTestingPage() {
  return <GameActionButtonTestingClient />;
}
