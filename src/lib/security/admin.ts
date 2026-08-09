import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export interface AdminApiContext {
  userId: string;
  canonicalUserId: string;
  supabase: SupabaseClient;
}
// Fail-closed: fehlt die ENV-Variable, ist niemand Admin.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const allowlist = (process.env.SUPABASE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

export async function requireAdminApi(): Promise<AdminApiContext | Response> {
  let user: User | null;
  try {
    const authClient = await createServerClient();
    const { data, error } = await authClient.auth.getUser();
    if (error) return jsonError('Authentication unavailable', 503);
    user = data.user;
  } catch {
    return jsonError('Authentication unavailable', 503);
  }

  if (!user) return jsonError('Unauthorized', 401);
  if (!isAdminEmail(user.email)) return jsonError('Forbidden', 403);

  // Service-role access is created after the authenticated user passes the admin allowlist.
  try {
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const supabase = createAdminClient();
    const { data: identity, error: identityError } = await supabase
      .from('user_identities')
      .select('user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', user.id)
      .maybeSingle();

    if (!identityError && identity) {
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', identity.user_id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminRole) {
        return {
          userId: user.id,
          canonicalUserId: identity.user_id,
          supabase,
        };
      }
    }

    // Fallback: If Migration 009 tables are missing or not populated, allowlist check above is authoritative.
    return {
      userId: user.id,
      canonicalUserId: user.id,
      supabase,
    };
  } catch {
    return jsonError('Admin authorization unavailable', 503);
  }
}
