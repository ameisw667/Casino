'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import AdminLayout from './AdminLayout';
import OnboardingFlow from './OnboardingFlow';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
