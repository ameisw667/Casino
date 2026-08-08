'use client';
import dynamic from 'next/dynamic';

const SimulationPageClient = dynamic(() => import('./SimulationPageClient'), { ssr: false });

export default function SimulationPageLoader() {
  return <SimulationPageClient />;
}
