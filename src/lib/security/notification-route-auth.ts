import { createClient } from '@/utils/supabase/server';

/** Inbox routes never accept a development fallback identity. */
export async function resolveNotificationRouteUser(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  return authUser?.id ?? null;
}