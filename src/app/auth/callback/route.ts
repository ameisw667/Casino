import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { recordLoginAuditEntry, type AuthMethod } from '@/lib/security/login-audit';
import { CasinoLogger } from '@/lib/casino/logger';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const targetPath = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  let origin = requestUrl.origin;
  if (forwardedHost) {
    const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : 'https';
    origin = `${proto}://${forwardedHost.split(',')[0].trim()}`;
  }

  const redirectUrl = `${origin}${targetPath}`;

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, { ...options, path: '/' });
                });
              } catch {
                // Ignore if response headers already sent
              }
            },
          },
        },
      );

      const { data } = await supabase.auth.exchangeCodeForSession(code);
      if (data?.user) {
        const provider = data.user.app_metadata?.provider;
        const authMethod: AuthMethod = provider === 'google' ? 'google' : 'otp_magic_link';
        const userAgent = request.headers.get('user-agent');
        const forwardedFor = request.headers.get('x-forwarded-for');
        const rawIp = forwardedFor
          ? forwardedFor.split(',')[0].trim()
          : request.headers.get('x-real-ip');

        await recordLoginAuditEntry({
          userId: data.user.id,
          authMethod,
          userAgent,
          rawIp,
          status: 'success',
        });
      }
    } catch (err) {
      CasinoLogger.error('API/Auth/Callback', 'Code exchange failed', err);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
