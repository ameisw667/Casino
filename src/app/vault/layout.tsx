import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vault | Casino Royale',
  description: 'Manage your Casino Royale vault — deposit, withdraw, and track your locked savings.',
};

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
