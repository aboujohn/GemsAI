'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth as useAuthContext, AuthUser } from '@/lib/contexts/AuthContext';
import { SupabaseError } from '@/lib/supabase/client';

// Re-export the main auth hook
export {
  useAuth,
  useUser,
  useSession,
  useAuthLoading,
  useIsAuthenticated,
} from '@/lib/contexts/AuthContext';

// Hook for handling authentication redirects
export function useAuthRedirect() {
  const { isAuthenticated, initialized } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized) return;

    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    if (isAuthenticated) {
      console.log('User authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, initialized, router, searchParams]);

  return { isAuthenticated, initialized };
}

// Hook for role-based access control
export function useRequireRole(requiredRole: 'user' | 'jeweler' | 'admin') {
  const { user, hasRole, isAuthenticated, initialized } = useAuthContext();
  const router = useRouter();

  const hasRequiredRole = isAuthenticated && hasRole(requiredRole);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!hasRequiredRole) {
      console.log(`User lacks required role: ${requiredRole}`);
      router.push('/dashboard'); // or unauthorized page
      return;
    }
  }, [isAuthenticated, hasRequiredRole, initialized, requiredRole, router]);

  return {
    hasRequiredRole,
    user,
    isAuthenticated,
    initialized,
  };
}

// Hook for managing authentication form state
export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuthAction = useCallback(
    async (action: () => Promise<void>, successMessage?: string) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        await action();

        if (successMessage) {
          setSuccess(successMessage);
        }
      } catch (err) {
        console.error('Auth action error:', err);

        if (err instanceof SupabaseError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    handleAuthAction,
    clearMessages,
  };
}

// Hook for session management with auto-refresh
export function useSessionManager() {
  const { session, refreshSession } = useAuthContext();
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.expires_at) {
      setSessionExpiry(new Date(session.expires_at * 1000));
    }
  }, [session]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!sessionExpiry) return;

    const now = new Date();
    const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // 5 minutes before expiry

    if (refreshTime > 0) {
      const timeout = setTimeout(async () => {
        try {
          console.log('Auto-refreshing session');
          await refreshSession();
        } catch (error) {
          console.error('Failed to auto-refresh session:', error);
        }
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [sessionExpiry, refreshSession]);

  const isSessionExpiringSoon = useCallback(() => {
    if (!sessionExpiry) return false;
    const now = new Date();
    const timeUntilExpiry = sessionExpiry.getTime() - now.getTime();
    return timeUntilExpiry < 10 * 60 * 1000; // 10 minutes
  }, [sessionExpiry]);

  return {
    session,
    sessionExpiry,
    isSessionExpiringSoon,
    refreshSession,
  };
}

// Hook for user profile management
export function useUserProfile() {
  const { user, updateProfile } = useAuthContext();
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateUserProfile = useCallback(
    async (updates: Partial<AuthUser['profile']>) => {
      try {
        setUpdating(true);
        setUpdateError(null);

        await updateProfile(updates);

        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Profile update error:', error);

        if (error instanceof SupabaseError) {
          setUpdateError(error.message);
        } else if (error instanceof Error) {
          setUpdateError(error.message);
        } else {
          setUpdateError('Failed to update profile');
        }

        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [updateProfile]
  );

  const clearUpdateError = useCallback(() => {
    setUpdateError(null);
  }, []);

  return {
    user,
    updating,
    updateError,
    updateUserProfile,
    clearUpdateError,
  };
}

// Hook for authentication status with persistence
export function useAuthStatus() {
  const { isAuthenticated, user, loading, initialized } = useAuthContext();
  const [persistedAuthState, setPersistedAuthState] = useState<boolean | null>(null);

  // Persist auth state to localStorage for faster initial renders
  useEffect(() => {
    if (initialized) {
      const authState = isAuthenticated;
      localStorage.setItem('auth_state', JSON.stringify(authState));
      setPersistedAuthState(authState);
    }
  }, [isAuthenticated, initialized]);

  // Load persisted auth state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_state');
      if (stored) {
        setPersistedAuthState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load persisted auth state:', error);
    }
  }, []);

  return {
    isAuthenticated: initialized ? isAuthenticated : persistedAuthState,
    user,
    loading: loading || !initialized,
    initialized,
  };
}

// Hook for handling authentication errors with user-friendly messages
export function useAuthErrorHandler() {
  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof SupabaseError) {
      // Map Supabase errors to user-friendly messages
      switch (error.originalError?.message) {
        case 'Invalid login credentials':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'Email not confirmed':
          return 'Please check your email and click the confirmation link before signing in.';
        case 'User already registered':
          return 'An account with this email already exists. Please sign in instead.';
        case 'Password should be at least 6 characters':
          return 'Password must be at least 6 characters long.';
        case 'Unable to validate email address: invalid format':
          return 'Please enter a valid email address.';
        case 'Signup is disabled':
          return 'New account registration is currently disabled.';
        case 'Email rate limit exceeded':
          return 'Too many emails sent. Please wait before requesting another.';
        default:
          return error.message || 'An authentication error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }, []);

  return { getErrorMessage };
}
