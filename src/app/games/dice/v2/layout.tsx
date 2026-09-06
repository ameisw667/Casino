import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dice V2 3D Arcade | Casino Royale',
  description:
    'Experience the next level of Provably Fair 3D Dice: A physical 3D polyhedron, dynamic win/loss spotlight cone, and physical casino acoustics.',
};

export default function DiceV2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
