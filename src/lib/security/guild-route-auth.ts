import { createClient } from '@/utils/supabase/server';
import { resolveDevFallbackUserId } from '@/lib/security/request-security';

/**
 * Resolves authenticated user ID from Supabase session, or dev fallback in development.
 */
export async function resolveGuildRouteUser(request?: Request): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser?.id) {
    return authUser.id;
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const isExplicitSignedOut = cookieHeader.includes('casino_signed_out=1');
    const devUserId = resolveDevFallbackUserId(request, isExplicitSignedOut);
    if (devUserId) {
      return devUserId;
    }
  }

  return null;
}
