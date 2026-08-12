import { Metadata } from 'next';
import BrandShowcaseClient from './BrandShowcaseClient';

export const metadata: Metadata = {
  title: 'Brand Design System & Living Component Hub | Casino Royale',
  description:
    'Zentrales, lebendiges Design System & Komponenten-Hub für Casino Royale. Vordefinierte Top-Steuerelemente für Entwickler und LLM-Agenten.',
};

export default function BrandShowcasePage() {
  return <BrandShowcaseClient />;
}
