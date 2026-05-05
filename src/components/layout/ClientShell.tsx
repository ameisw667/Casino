'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const MainLayout = dynamic(() => import("./MainLayout"), {
  ssr: false,
  loading: () => (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontFamily: 'sans-serif' }}>
      INITIALIZING CASINO SHELL...
    </div>
  )
});

const OnboardingFlow = dynamic(() => import("./OnboardingFlow"), {
  ssr: false
});

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainLayout>{children}</MainLayout>
      <OnboardingFlow />
    </>
  );
}
