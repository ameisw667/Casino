import { Metadata } from 'next';
import VibeSliderTestingClient from './VibeSliderTestingClient';

export const metadata: Metadata = {
  title: '7.4 — VibeSlider Harmonization Evaluation | Casino Royale',
  description:
    'Evaluierung und Vergleich von 3 Next-Gen 2026 Optionen für den universellen Marken-Slider <VibeSlider />. Status Quo Analyse und Produktions-Code-Export.',
};

export default function VibeSliderTestingPage() {
  return <VibeSliderTestingClient />;
}
