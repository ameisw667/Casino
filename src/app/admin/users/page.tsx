import { Metadata } from 'next';
import UsersPageLoader from './UsersPageLoader';

export const metadata: Metadata = {
  title: 'User Management | Casino Royale Admin',
  description: 'Manage Casino Royale users, balances, and account status.',
};

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return <UsersPageLoader />;
}
