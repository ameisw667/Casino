import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crash | Casino Royale',
  description:
    'Experience the thrill of the rising multiplier. Cash out before the crash in our premium Provably Fair Crash game.',
  openGraph: {
    title: 'Crash | Casino Royale',
    description: 'High-stakes Crash game with real-time multiplayer action.',
    images: ['/images/games/crash-preview.png'],
  },
};

export default function CrashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
