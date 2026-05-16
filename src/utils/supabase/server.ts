import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, or Server Actions.
 * It automatically injects the Clerk JWT token (if available) for Row Level Security.
 */
export async function createServerSupabase() {
  const { getToken } = await auth();
  
  // Get the custom Supabase JWT from Clerk
  const token = await getToken({ template: 'supabase' });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    }
  );
}
