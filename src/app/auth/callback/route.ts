import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const destination = new URL(next?.startsWith('/') ? next : '/backend', requestUrl.origin);
  let response = NextResponse.redirect(destination);

  if (!code) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ?.split(';')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => {
              const [name, ...parts] = entry.split('=');
              return { name, value: parts.join('=') };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          response = NextResponse.redirect(destination);
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}