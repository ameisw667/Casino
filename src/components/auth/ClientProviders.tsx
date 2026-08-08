import type { ReactNode } from 'react';
import { SupabaseSessionProvider } from '@/components/auth/SupabaseSessionProvider';

export function ClientProviders({ children }: { children: ReactNode }) {
  return <SupabaseSessionProvider>{children}</SupabaseSessionProvider>;
}
