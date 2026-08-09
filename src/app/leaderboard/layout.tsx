import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | Casino Royale',
  description:
    'See the top players, biggest wins, and highest wagers on the Casino Royale global leaderboard.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
