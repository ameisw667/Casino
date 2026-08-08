'use client';
import dynamic from 'next/dynamic';

const UsersPageClient = dynamic(() => import('./UsersPageClient'), { ssr: false });

export default function UsersPageLoader() {
  return <UsersPageClient />;
}
