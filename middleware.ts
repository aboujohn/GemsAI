import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and runtime environment verification
 * Handles route protection and environment checks
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;

  // Demo routes that should always be accessible
  const demoRoutes = [
    '/voice-demo',
    '/text-input-demo',
    '/transcription-demo',
    '/story-submission-demo',
    '/database-demo',
    '/formatting-demo',
    '/rtl-demo',
    '/auth-test',
  ];

  // Check if current path is a demo route
  const isDemoRoute = demoRoutes.some(route => pathname.startsWith(route));

  // Allow demo routes to bypass authentication
  if (isDemoRoute) {
    console.log(`Demo route accessed: ${pathname}`);
    return response;
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, allow access but log warning
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured - running in demo mode');

    // For auth routes, redirect to demo
    if (pathname.startsWith('/auth')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/story-submission-demo';
      redirectUrl.searchParams.set('message', 'demo-mode');
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  // Only import and use Supabase when it's properly configured
  try {
    const { createMiddlewareClient } = await import('@supabase/auth-helpers-nextjs');

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Define protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/story', '/profile', '/settings'];

    // Define routes that require specific roles
    const roleBasedRoutes = {
      '/dashboard/admin': ['admin'],
      '/dashboard/jeweler': ['jeweler', 'admin'],
    };

    // Define public routes that authenticated users should be redirected away from
    const publicOnlyRoutes = ['/auth', '/auth/login', '/auth/signup', '/auth/reset-password'];

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Check if current path requires specific role
    const requiredRoles = Object.entries(roleBasedRoutes).find(([route]) =>
      pathname.startsWith(route)
    )?.[1];

    // Check if current path is public-only
    const isPublicOnlyRoute = publicOnlyRoutes.some(
      route => pathname === route || pathname.startsWith(route)
    );

    // Handle authentication logic
    if (isProtectedRoute || requiredRoles) {
      if (!session) {
        // Redirect to auth page with return URL
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check role-based access
      if (requiredRoles) {
        const userRole = session.user?.user_metadata?.role || 'user';

        if (!requiredRoles.includes(userRole)) {
          // Redirect to dashboard if user lacks required role
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    // Redirect authenticated users away from public-only routes
    if (isPublicOnlyRoute && session) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Add development headers if needed
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Environment', 'development');

      // Add auth debug headers in development
      if (session) {
        response.headers.set('X-User-ID', session.user.id);
        response.headers.set('X-User-Role', session.user?.user_metadata?.role || 'user');
      }
    }

    // Return the response
    return response;
  } catch (error) {
    console.warn('Middleware error (fallback to demo mode):', error);
    return response;
  }
}

// Only run middleware on these paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};
