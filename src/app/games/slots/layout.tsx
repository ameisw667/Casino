import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slots | Casino Royale',
  description: 'Hit the jackpot on our premium slot machine. Dynamic multipliers, high-fidelity animations, and guaranteed Provably Fair outcomes.',
  openGraph: {
    title: 'Slots | Casino Royale',
    description: 'High-fidelity Slot machine with huge potential.',
    images: ['/images/games/slots-preview.png'],
  },
};

export default function SlotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
