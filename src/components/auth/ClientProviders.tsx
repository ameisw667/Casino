import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { SupabaseSessionProvider } from '@/components/auth/SupabaseSessionProvider';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { AnalyticsIdentityBootstrap } from '@/components/analytics/AnalyticsIdentityBootstrap';

export function ClientProviders({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  return (
    <SupabaseSessionProvider initialUser={initialUser}>
      {children}
      <ConsentBanner />
      <AnalyticsIdentityBootstrap />
    </SupabaseSessionProvider>
  );
}
