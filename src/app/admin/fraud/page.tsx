import { Metadata } from 'next';
import FraudPageLoader from './FraudPageLoader';

export const metadata: Metadata = {
  title: 'Anti-Fraud Review | Casino Royale Admin',
  description: 'Review bet-behavior fraud signals and voucher-abuse signals.',
};

export const dynamic = 'force-dynamic';

export default function FraudPage() {
  return <FraudPageLoader />;
}
