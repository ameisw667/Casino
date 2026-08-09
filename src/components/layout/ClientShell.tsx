'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import AdminLayout from './AdminLayout';
import OnboardingFlow from './OnboardingFlow';
import { useMounted } from '@/hooks/useMounted';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isSandboxV2 = pathname === '/v2' || pathname?.startsWith('/v2/');
  const isRefactoring = pathname === '/refactoring' || pathname?.startsWith('/refactoring/');
  const mounted = useMounted();

  // Standalone design-sandbox routes: render their own header/sidebar/hero,
  // must never inherit the live app's MainLayout nav.
  if (isSandboxV2 || isRefactoring) {
    return <>{children}</>;
  }

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <div suppressHydrationWarning>
      <MainLayout>{children}</MainLayout>
      {mounted && <OnboardingFlow />}
    </div>
  );
}
