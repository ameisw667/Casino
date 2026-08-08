import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Games | Casino Royale',
  description: 'Browse all Provably Fair games at Casino Royale — Dice, Crash, Roulette, Slots, and Blackjack.',
  openGraph: {
    title: 'Games | Casino Royale',
    description: 'Browse all Provably Fair games at Casino Royale.',
    images: ['/images/hero-banner-new.png'],
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
