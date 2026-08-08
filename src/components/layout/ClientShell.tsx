'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';
import AdminLayout from './AdminLayout';
import OnboardingFlow from './OnboardingFlow';

const emptySubscribe = () => () => {};

// Client-mount detection without an effect + setState (avoids the extra
// render pass and hydration flash that useState+useEffect(() => setMounted(true)) causes).
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isBackend = pathname?.startsWith('/backend');
  const mounted = useMounted();

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // /backend: functionality-only test page, no premium shell (no sidebar/nav/modals)
  if (isBackend) {
    return <>{children}</>;
  }

  return (
    <div suppressHydrationWarning>
      <MainLayout>{children}</MainLayout>
      {mounted && <OnboardingFlow />}
    </div>
  );
}
