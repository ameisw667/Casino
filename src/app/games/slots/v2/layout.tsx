import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Slots V2 (Vegas Cabinet) | Casino Royale',
  description: 'Visual preview variant of the Slots game — Vegas Cabinet 3D styling.',
};

export default function SlotsV2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
