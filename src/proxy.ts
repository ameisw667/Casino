import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/games(.*)',
  '/landing',
  '/fairness(.*)',
  '/history(.*)',
  '/leaderboard(.*)',
  '/vault(.*)',
  '/affiliate(.*)',
  '/admin(.*)',
  '/api/public/(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/casino/(.*)',
  '/api/user/(.*)',
  '/sounds/(.*)',
  '/images/(.*)'
]);

// Clerk middleware — only used for protected routes
const clerkProtect = clerkMiddleware(async (auth) => {
  await auth.protect();
  return NextResponse.next();
});

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-Rate-Limit-Status', 'active');
  return response;
}

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  // CSRF protection (non-GET requests from foreign origins)
  if (req.method !== 'GET' && !req.nextUrl.pathname.startsWith('/api/public')) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    const isAllowedOrigin = !origin || origin.includes(host ?? '') ||
      origin.includes('localhost') || origin.includes('127.0.0.1');
    if (!isAllowedOrigin) {
      console.warn(`[Middleware] CSRF Blocked: origin=${origin}, host=${host}`);
      return new NextResponse('Invalid Origin', { status: 403 });
    }
  }

  // Public routes: skip Clerk entirely — avoids JWK fetch hangs when
  // Clerk's API is unreachable (offline dev, E2E tests, etc.)
  if (isPublicRoute(req)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Protected routes: delegate to Clerk, then add security headers
  const clerkResponse = await clerkProtect(req, evt);
  if (clerkResponse instanceof NextResponse) {
    return addSecurityHeaders(clerkResponse);
  }
  return clerkResponse ?? addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)',
    '/(api|trpc)(.*)',
  ],
};
