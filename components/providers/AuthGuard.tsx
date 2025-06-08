'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'jeweler' | 'admin';
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/auth',
  fallback,
}: AuthGuardProps) {
  const { user, loading, initialized, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (!initialized) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('AuthGuard: Redirecting unauthenticated user to:', redirectTo);
      router.push(redirectTo);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && (!user || !hasRole(requiredRole))) {
      console.log('AuthGuard: User lacks required role:', requiredRole);
      // Redirect to appropriate page based on user's role
      if (user) {
        // User is authenticated but lacks permission
        router.push('/dashboard'); // or a "no permission" page
      } else {
        router.push(redirectTo);
      }
      return;
    }
  }, [initialized, isAuthenticated, user, requireAuth, requiredRole, redirectTo, router, hasRole]);

  // Show loading state while auth is initializing
  if (!initialized || loading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If specific role is required but user doesn't have it, don't render children
  if (requiredRole && (!user || !hasRole(requiredRole))) {
    return null;
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Convenience components for specific roles
export function UserGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="user" {...props}>
      {children}
    </AuthGuard>
  );
}

export function JewelerGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="jeweler" {...props}>
      {children}
    </AuthGuard>
  );
}

export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="admin" {...props}>
      {children}
    </AuthGuard>
  );
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
} 