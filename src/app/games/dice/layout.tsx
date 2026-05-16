import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dice | Casino Royale',
  description: 'Roll the dice and test your luck. Customize your win probability and multiplier in our high-fidelity Provably Fair Dice game.',
  openGraph: {
    title: 'Dice | Casino Royale',
    description: 'Provably Fair Dice game with customizable odds.',
    images: ['/images/games/dice-preview.png'],
  },
};

export default function DiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
