import { Metadata } from 'next';
import GameStatsPanelTestingClient from './GameStatsPanelTestingClient';

export const metadata: Metadata = {
  title: '7.6 — GameStatsPanel Harmonization Evaluation | Casino Royale',
  description:
    'Evaluierung und Vergleich des universellen Session-Statistik-Panels <GameStatsPanel />. Status Quo Analyse und Produktions-Code-Export.',
};

export default function GameStatsPanelTestingPage() {
  return <GameStatsPanelTestingClient />;
}
