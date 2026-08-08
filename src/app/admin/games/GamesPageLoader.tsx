'use client';
import dynamic from 'next/dynamic';

const GamesPageClient = dynamic(() => import('./GamesPageClient'), { ssr: false });

export default function GamesPageLoader() {
  return <GamesPageClient />;
}
