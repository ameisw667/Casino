import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAdminEmail } from '@/lib/security/admin';
import { hasValidOrigin } from '@/lib/security/origin-guard';

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
  '/api/internal/big-win-events',
  // Browser-generated CSP violation reports (M6) — unauthenticated by design, see route file.
  '/api/internal/csp-report',
  '/sounds/(.*)',
  '/images/(.*)',
  // RFC 9116 security.txt (M10) — must be reachable by unauthenticated researchers/scanners;
  // '.txt' isn't in the middleware matcher's static-extension exclusion list, so without this the
  // auth gate below would redirect every fetch of it to /sign-in instead of serving the file.
  '/.well-known/(.*)',
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
      pathname.startsWith('/api/internal/wallet-events') ||
      pathname.startsWith('/api/internal/big-win-events');

    // The browser's own CSP engine sends violation reports (M6) — not page JavaScript — so
    // they carry no reliable Origin/Sec-Fetch-Site metadata, same as webhook signatures.
    const isBrowserReport = pathname.startsWith('/api/internal/csp-report');

    // Webhooks use their signature as authenticity proof and do not send browser Origin headers.
    if (
      !isWebhook &&
      !isBrowserReport &&
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      !hasValidOrigin(req)
    ) {
      return new NextResponse('Invalid Origin', { status: 403 });
    }

    // Per-request nonce for script-src (worldmap/00-04-SecurityHardening.md, M1). Next.js parses
    // the CSP header on the *request* headers to auto-apply this nonce to every framework-injected
    // script (hydration, page bundles) — see node_modules/next/dist/docs/01-app/02-guides/
    // content-security-policy.md. 'unsafe-eval' stays dev-only: React needs it there to reconstruct
    // server error stacks in the browser; neither React nor Next.js eval in production.
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const isDev = process.env.NODE_ENV === 'development';
    const cspHeader =
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}; ` +
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
      `font-src 'self' https://fonts.gstatic.com data:; ` +
      `img-src 'self' data: blob: https:; ` +
      // Sentry ingest host is the exact host from this project's DSN (o4511899214020608.ingest.de.sentry.io),
      // not a *.ingest.de.sentry.io wildcard — a wildcard would also permit exfiltration to any other
      // Sentry customer's project on the same region (docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md, M7 security review finding #1).
      // PostHog ingest host (us.i.posthog.com) is likewise the exact host, not a wildcarded
      // subdomain pattern (docs/archive/05_2.9_PostHog_Analytics.md §3.6). posthog-js is an npm
      // import, not a CDN <script>, so script-src needs no host allowlist for it either.
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://o4511899214020608.ingest.de.sentry.io https://us.i.posthog.com; ` +
      `frame-ancestors 'none'; ` +
      // M6: both directives point at the same sink for broad browser support — `report-uri` is
      // deprecated but still the only one Firefox honors for CSP; `report-to` is the current
      // Reporting API, resolved via the `Reporting-Endpoints` response header set below.
      `report-uri /api/internal/csp-report; report-to csp-endpoint;`;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    let response = NextResponse.next({ request: { headers: requestHeaders } });
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
            response = NextResponse.next({ request: { headers: requestHeaders } });
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
    // M5 (worldmap/00-04-SecurityHardening.md): COOP isolates this site's browsing context from
    // cross-origin popups/tabs (window.opener). Safe here — Google sign-in
    // (src/components/auth/AuthForm.tsx) uses a full-page `redirectTo` flow, not a popup, so there
    // is no cross-origin window.opener relationship to preserve. CORP stops other origins from
    // embedding this site's responses via no-cors requests (e.g. <img>/<script> tags on a foreign
    // page reading our authenticated API responses).
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    // M6: pairs with the CSP's `report-to csp-endpoint` directive above — the current Reporting
    // API's way of naming an endpoint group (Report-To, the older header for this, is deprecated).
    response.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/internal/csp-report"');
    // Explicit allow only for features this app actually uses (grep-verified 2026-08-28):
    // microphone (Guide voice input, src/lib/casino/voice-audio.ts), clipboard-write (referral
    // codes, deposit address, MFA secret, bet receipts — copy-to-clipboard across ~7 components),
    // publickey-credentials-get/-create (WebAuthn Passkeys via Supabase's `experimental.passkey`,
    // docs/auth/01_passkeys_webauthn.md). Everything else this app has no code path for is denied.
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), fullscreen=(), gamepad=(), hid=(), serial=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=(), display-capture=(), screen-wake-lock=(), xr-spatial-tracking=(), interest-cohort=(), browsing-topics=(), clipboard-write=(self), publickey-credentials-get=(self), publickey-credentials-create=(self)',
    );
    response.headers.set('Content-Security-Policy', cspHeader);
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
