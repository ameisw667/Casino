import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roulette | Casino Royale',
  description: 'Spin the wheel of fortune. Classic European Roulette with a modern neon-gold aesthetic and Provably Fair transparency.',
  openGraph: {
    title: 'Roulette | Casino Royale',
    description: 'Premium European Roulette experience.',
    images: ['/images/games/roulette-preview.png'],
  },
};

export default function RouletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
