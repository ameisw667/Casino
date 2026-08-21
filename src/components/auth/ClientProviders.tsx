import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { SupabaseSessionProvider } from '@/components/auth/SupabaseSessionProvider';
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
      <AnalyticsIdentityBootstrap />
    </SupabaseSessionProvider>
  );
}
