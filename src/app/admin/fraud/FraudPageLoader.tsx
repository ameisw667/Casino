'use client';
import dynamic from 'next/dynamic';

const FraudPageClient = dynamic(() => import('./FraudPageClient'), { ssr: false });

export default function FraudPageLoader() {
  return <FraudPageClient />;
}
