import { createClient } from '@/utils/supabase/server';

/** Guild routes never accept a development fallback identity. */
export async function resolveGuildRouteUser(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  return authUser?.id ?? null;
}
