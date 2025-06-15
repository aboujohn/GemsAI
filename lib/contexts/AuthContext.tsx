'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, auth, SupabaseError, isDemoMode } from '@/lib/supabase/client';

// Types for our authentication context
export interface AuthUser extends User {
  role?: 'user' | 'jeweler' | 'admin';
  profile?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    language_preference?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthContextType extends AuthState {
  // Authentication methods
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any
  ) => Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;

  // Utility methods
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshSession: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple counter to ensure we can track renders
let renderCount = 0;

export function AuthProvider({ children }: { children: ReactNode }) {
  renderCount++;
  const currentRender = renderCount;

  console.log(`🔥 AUTH PROVIDER RENDER #${currentRender}`);

  // Simple state - no complex initialization
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  console.log(`🔥 Current auth state (render #${currentRender}):`, authState);

  // Simple useEffect that WILL execute
  useEffect(() => {
    console.log(`🔥 🔥 🔥 USEEFFECT EXECUTING (render #${currentRender}) 🔥 🔥 🔥`);

    let mounted = true;

    async function initializeAuth() {
      try {
        console.log(`🔥 Getting initial session (render #${currentRender})`);

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) {
          console.log(`🔥 Component unmounted, skipping session update (render #${currentRender})`);
          return;
        }

        console.log(`🔥 Initial session result (render #${currentRender}):`, {
          session: !!session,
          error,
        });

        if (error) {
          console.error('🔥 Error getting session:', error);
        }

        // Update state with session
        setAuthState({
          user: (session?.user as AuthUser) || null,
          session,
          loading: false,
          initialized: true,
        });

        console.log(`🔥 Auth state updated (render #${currentRender}):`, {
          hasUser: !!session?.user,
          hasSession: !!session,
          loading: false,
          initialized: true,
        });
      } catch (error) {
        console.error(`🔥 Error in initializeAuth (render #${currentRender}):`, error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    }

    // Set up auth state change listener
    console.log(`🔥 Setting up auth listener (render #${currentRender})`);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔥 Auth state changed (render #${currentRender}):`, event, !!session);

      if (!mounted) {
        console.log(`🔥 Component unmounted, ignoring auth change (render #${currentRender})`);
        return;
      }

      setAuthState({
        user: (session?.user as AuthUser) || null,
        session,
        loading: false,
        initialized: true,
      });
    });

    // Initialize
    initializeAuth();

    // Cleanup
    return () => {
      console.log(`🔥 Cleaning up auth provider (render #${currentRender})`);
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - run once per mount

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    console.log('🔥 SignIn attempt');
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { user: null, error };
      }

      return { user: data.user as AuthUser, error: null };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { user: null, error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('🔥 SignUp attempt');
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { user: null, error };
      }

      return { user: data.user as AuthUser, error: null };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('🔥 SignOut attempt');
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Utility methods
  const isAuthenticated = !!authState.user && !!authState.session;

  const hasRole = (role: string) => {
    return authState.user?.role === role || authState.user?.role === 'admin';
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
    isAuthenticated,
    hasRole,
  };

  console.log(`🔥 Providing context (render #${currentRender}):`, {
    initialized: authState.initialized,
    loading: authState.loading,
    isAuthenticated,
  });

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser(): AuthUser | null {
  return useAuth().user;
}

export function useSession(): Session | null {
  return useAuth().session;
}

export function useAuthLoading(): boolean {
  return useAuth().loading;
}

export function useIsAuthenticated(): boolean {
  return useAuth().isAuthenticated;
}

// Export the context for advanced usage
export { AuthContext };
