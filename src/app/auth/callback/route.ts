import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const targetPath = next.startsWith('/') ? next : '/';

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || requestUrl.host;
  const protocol = request.headers.get('x-forwarded-proto') || requestUrl.protocol || 'https:';
  const redirectUrl = `${protocol}//${host}${targetPath}`;

  if (code) {
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
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(redirectUrl);
}