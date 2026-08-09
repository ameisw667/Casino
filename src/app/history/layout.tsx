import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bet History | Casino Royale',
  description:
    'Review your full betting history with Provably Fair verification details for every round.',
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
