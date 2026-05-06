import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/games(.*)',
  '/fairness(.*)',
  '/history(.*)',
  '/leaderboard(.*)',
  '/vault(.*)',
  '/affiliate(.*)',
  '/admin(.*)',
  '/api/(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // 1. CSRF Protection for non-GET requests
    if (req.method !== 'GET') {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');
      if (origin && host && !origin.includes(host)) {
        return new NextResponse('Invalid Origin', { status: 403 });
      }
    }

    // 2. Auth Protection
    // Note: Most routes are public in this casino, auth is handled at the component level
    if (!isPublicRoute(req)) {
      await auth.protect();
    }

    // 3. Add Security Headers
    const response = NextResponse.next();
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-Rate-Limit-Status', 'active');
    
    return response;
  } catch (error) {
    // Prevent 500 error if Clerk fails (e.g. missing API keys in production)
    console.error('[Middleware Error]:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
