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
  '/api/public/(.*)',
  '/api/webhooks/clerk(.*)',
  '/sounds/(.*)',
  '/images/(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // 1. CSRF Protection
    if (req.method !== 'GET' && !req.nextUrl.pathname.startsWith('/api/public')) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');
      const isAllowedOrigin = origin && (
        origin.includes(host || '') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1')
      );
      if (origin && !isAllowedOrigin) {
        console.warn(`[Middleware] CSRF Blocked: origin=${origin}, host=${host}`);
        return new NextResponse('Invalid Origin', { status: 403 });
      }
    }
    
    const isPublic = isPublicRoute(req);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Request: ${req.method} ${req.nextUrl.pathname}, Public: ${isPublic}`);
    }
    
    // 2. Auth Protection
    if (!isPublic) {
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
    console.error('[Middleware Error]:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
