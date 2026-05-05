'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { usePathname } from 'next/navigation';

const MainLayout = dynamic(() => import("./MainLayout"), {
  ssr: false,
  loading: () => (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontFamily: 'sans-serif' }}>
      INITIALIZING CASINO SHELL...
    </div>
  )
});

const AdminLayout = dynamic(() => import("./AdminLayout"), {
  ssr: false,
  loading: () => (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontFamily: 'sans-serif' }}>
      ACCESSING ADMIN TERMINAL...
    </div>
  )
});

const OnboardingFlow = dynamic(() => import("./OnboardingFlow"), {
  ssr: false
});

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <>
      <MainLayout>{children}</MainLayout>
      <OnboardingFlow />
    </>
  );
}
