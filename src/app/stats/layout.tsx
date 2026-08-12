import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stats | Casino Royale',
  description:
    'Deine persönliche Performance — Profit-Verlauf, Lieblingsspiel und Spielgewohnheiten.',
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
