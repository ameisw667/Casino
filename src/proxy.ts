import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminEmail } from '@/lib/security/admin';

const PUBLIC_ROUTES = [
  '/',
  '/robots.txt',
  '/sitemap.xml',
  '/v2',
  '/v3',
  '/v4',
  '/v5',
  // Eigenständige Lobby-Testseite (Three.js+GSAP Prototype im iframe, siehe 02_FRONTEND_REDESIGN.md §10)
  '/refactoring(.*)',
  '/testing(.*)',
  // Retired route must reach Next.js so it returns a real 404 instead of an auth redirect.
  '/fairness',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/games(.*)',
  '/history(.*)',
  '/leaderboard(.*)',
  '/vault(.*)',
  '/stats(.*)',
  '/affiliate(.*)',
  '/auth/callback(.*)',
  '/api/public/(.*)',
  // These handlers perform their own Supabase auth and return API-shaped 401/503 responses.
  '/api/casino/(.*)',
  '/api/chat/bot-response',
  '/api/community',
  '/api/leaderboard',
  '/api/tournaments/(.*)',
  '/api/user/(.*)',
  '/api/analytics/(.*)',
  '/api/admin/users',
  '/api/webhooks/clerk(.*)',
  '/api/telegram/(.*)',
  '/api/internal/cron-alert',
  '/api/internal/wallet-events',
  '/sounds/(.*)',
  '/images/(.*)',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => {
    if (pattern.endsWith('(.*)')) {
      const prefix = pattern.slice(0, -4).replace(/\/$/, '');
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    }
    return pathname === pattern;
  });
}

function hasValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const expectedHost = forwardedHost || req.headers.get('host');
    return Boolean(expectedHost && new URL(origin).host === expectedHost);
  } catch {
    return false;
  }
}

// Copies the refreshed session cookies from the Supabase pass-through response onto a
// terminal response (redirect/403). Skipping this silently drops rotated tokens — the
// next request then fails to refresh, logging the user out. Known @supabase/ssr pitfall.
function withRefreshedCookies(from: NextResponse, terminal: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => terminal.cookies.set(cookie));
  return terminal;
}

export default async function proxy(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    // Liveness probe for external uptime monitoring (05_1.13): must never depend on
    // Supabase reachability, so it is bypassed here, before the client below is even
    // created — a misconfigured/unreachable Supabase project on staging must not make
    // this route report the app as "down" for an unrelated reason. This is the single
    // source of truth for the route's public/no-auth status (deliberately not also
    // listed in PUBLIC_ROUTES, to avoid the two declarations drifting apart).
    if (pathname === '/api/health') {
      return NextResponse.next({ request: req });
    }

    const isWebhook =
      pathname.startsWith('/api/webhooks/clerk') ||
      pathname.startsWith('/api/telegram/webhook') ||
      pathname.startsWith('/api/internal/cron-alert') ||
      pathname.startsWith('/api/internal/wallet-events');

    // Webhooks use their signature as authenticity proof and do not send browser Origin headers.
    if (!isWebhook && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !hasValidOrigin(req)) {
      return new NextResponse('Invalid Origin', { status: 403 });
    }

    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname.startsWith('/admin')) {
      if (!user)
        return withRefreshedCookies(response, NextResponse.redirect(new URL('/sign-in', req.url)));
      if (!isAdminEmail(user.email))
        return withRefreshedCookies(response, new NextResponse('Forbidden', { status: 403 }));
    } else if (!isPublicRoute(pathname) && !user) {
      return withRefreshedCookies(response, NextResponse.redirect(new URL('/sign-in', req.url)));
    }

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
      'Content-Security-Policy',
      // Sentry ingest host is the exact host from this project's DSN (o4511899214020608.ingest.de.sentry.io),
      // not a *.ingest.de.sentry.io wildcard — a wildcard would also permit exfiltration to any other
      // Sentry customer's project on the same region (docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md, M7 security review finding #1).
      // PostHog ingest host (us.i.posthog.com) is likewise the exact host, not a wildcarded
      // subdomain pattern (docs/archive/05_2.9_PostHog_Analytics.md §3.6). posthog-js is an npm
      // import, not a CDN <script>, so script-src needs no change.
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://o4511899214020608.ingest.de.sentry.io https://us.i.posthog.com; frame-ancestors 'none';",
    );
    return response;
  } catch (error) {
    console.error('[Proxy Error]:', error);
    return new NextResponse('Security boundary unavailable', { status: 500 });
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)',
    '/(api|trpc)(.*)',
  ],
};
