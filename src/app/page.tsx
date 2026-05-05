'use client';

import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('@/components/home/HomeClient').then(mod => mod.HomeClient), {
  ssr: false,
  loading: () => (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontFamily: 'sans-serif' }}>
      LOADING CASINO LOBBY...
    </div>
  )
});

export default function Home() {
  return <HomeClient />;
}
