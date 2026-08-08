import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blackjack | Casino Royale',
  description: 'Play Provably Fair Blackjack against the dealer. Hit, stand, double down, and chase the perfect 21.',
  openGraph: {
    title: 'Blackjack | Casino Royale',
    description: 'Provably Fair Blackjack with classic casino rules.',
    images: ['/images/games/blackjack-preview.png'],
  },
};

export default function BlackjackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
