import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and runtime environment verification
 * Handles route protection and environment checks
 */

// Define the paths that should be handled by middleware
const PROTECTED_PATHS = ['/dashboard', '/story', '/profile', '/settings'];
const ROLE_BASED_PATHS = {
  '/dashboard/admin': ['admin'],
  '/dashboard/jeweler': ['jeweler', 'admin'],
};
const PUBLIC_ONLY_PATHS = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔧 MIDDLEWARE:', pathname);

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Skip middleware for demo routes
  if (pathname.startsWith('/story-submission-demo')) {
    return NextResponse.next();
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });

    // Get the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log('🔧 MIDDLEWARE SESSION ERROR:', error.message);
    }

    console.log('🔧 MIDDLEWARE SESSION:', session ? 'Has session' : 'No session');

    // TEMPORARILY DISABLE ALL REDIRECTS TO FIX AUTH LOOP
    console.log('🔧 MIDDLEWARE: All redirects temporarily disabled');
    return NextResponse.next();

    // The following code is commented out to prevent redirects during auth fix
    /*
    // Handle public-only paths (like /auth)
    if (PUBLIC_ONLY_PATHS.some(path => pathname.startsWith(path))) {
      if (session) {
        console.log('🔧 MIDDLEWARE: Redirecting authenticated user from auth page');
        const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
      return NextResponse.next();
    }

    // Handle protected paths
    if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
      if (!session) {
        console.log('🔧 MIDDLEWARE: Redirecting unauthenticated user to auth');
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check role-based access
      const userRole = session.user?.user_metadata?.role || 'user';
      
      for (const [path, allowedRoles] of Object.entries(ROLE_BASED_PATHS)) {
        if (pathname.startsWith(path) && !allowedRoles.includes(userRole)) {
          console.log('🔧 MIDDLEWARE: Insufficient role for path');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    return NextResponse.next();
    */
  } catch (error) {
    console.error('🔧 MIDDLEWARE ERROR:', error);
    return NextResponse.next();
  }
}

// Only run middleware on these paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
