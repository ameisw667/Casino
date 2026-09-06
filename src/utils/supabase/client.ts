import { createBrowserClient } from '@supabase/ssr';
import { CasinoLogger } from '@/lib/casino/logger';
import type { Database } from '@/types/database.types';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Only reachable in local dev — a missing anon key breaks auth immediately and
    // visibly in production, so this guard intentionally never fires there.
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      CasinoLogger.warn(
        'SupabaseClient',
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.',
      );
    }
  }

  return createBrowserClient<Database>(url || '', anonKey || '', {
    auth: {
      experimental: {
        passkey: true,
      },
    },
  });
}
