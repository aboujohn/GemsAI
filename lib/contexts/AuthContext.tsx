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
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser['profile']>) => Promise<void>;

  // Utility methods
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function initializeAuth() {
      try {
        console.log('Initializing auth context...');
        console.log('Supabase client configured:', {
          url: !!supabase,
          hasAuth: !!supabase?.auth,
          isClient: typeof window !== 'undefined'
        });

        // Check if we're in demo mode
        if (isDemoMode) {
          console.log('Running in demo mode - setting initialized state immediately');
          if (mounted) {
            setState(prev => ({
              ...prev,
              user: null,
              session: null,
              loading: false,
              initialized: true,
            }));
          }
          return;
        }
        
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log('getSession result:', { 
          hasSession: !!session, 
          hasError: !!error,
          errorMessage: error?.message 
        });

        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (mounted) {
          // Handle user enrichment separately
          let enrichedUser = null;
          if (session?.user) {
            console.log('Enriching user data for:', session.user.email);
            enrichedUser = await enrichUserData(session.user);
          }
          
          console.log('Setting auth state:', {
            hasSession: !!session,
            hasUser: !!enrichedUser,
            initialized: true,
            loading: false
          });
          
          setState(prev => ({
            ...prev,
            session,
            user: enrichedUser,
            loading: false,
            initialized: true,
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          console.log('Setting error state - no auth available');
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            loading: false,
            initialized: true,
          }));
        }
      }
    }

    // Set a timeout to force initialization after 2 seconds
    timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - forcing initialized state');
      if (mounted && !state.initialized) {
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          loading: false,
          initialized: true,
        }));
      }
    }, 2000);

    initializeAuth();

    // Listen for auth changes (skip in demo mode)
    let unsubscribe: (() => void) | undefined;
    
    if (!isDemoMode) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (mounted) {
          // Handle user enrichment separately
          let enrichedUser = null;
          if (session?.user) {
            enrichedUser = await enrichUserData(session.user);
          }
          
          setState(prev => ({
            ...prev,
            session,
            user: enrichedUser,
            loading: false,
            initialized: true,
          }));
        }

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            // Force a small delay to ensure state is fully updated
            setTimeout(() => {
              console.log('Auth state fully updated after sign in');
              // Trigger a custom event for components that need to respond to auth changes
              window.dispatchEvent(new CustomEvent('auth-state-changed', {
                detail: { authenticated: true, user: session?.user }
              }));
            }, 100);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            // Clear any cached auth state
            localStorage.removeItem('auth_state');
            // Trigger a custom event for sign out
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
              detail: { authenticated: false, user: null }
            }));
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
        }
      });
      
      unsubscribe = () => subscription.unsubscribe();
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, []);

  // Enrich user data with profile information and role
  async function enrichUserData(user: User): Promise<AuthUser> {
    try {
      // Get user profile data (this would come from your users table)
      // For now, we'll extract role from user metadata
      const role = user.user_metadata?.role || 'user';

      const enrichedUser: AuthUser = {
        ...user,
        role: role as 'user' | 'jeweler' | 'admin',
        profile: {
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          phone: user.user_metadata?.phone,
          language_preference: user.user_metadata?.language_preference || 'he',
          bio: user.user_metadata?.bio,
          location: user.user_metadata?.location,
          website: user.user_metadata?.website,
        },
      };

      return enrichedUser;
    } catch (error) {
      console.error('Error enriching user data:', error);
      return user as AuthUser;
    }
  }

  // Authentication methods
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || email.split('@')[0],
            role: metadata?.role || 'user',
            language_preference: metadata?.language_preference || 'he',
            ...metadata,
          },
        },
      });

      if (error) throw new SupabaseError(error);

      // Note: User will be set via the auth state change listener
      console.log('Sign up successful:', data);
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log detailed error information for debugging
        console.error('Supabase auth error details:', {
          message: error.message,
          code: error.status,
          details: error,
        });
        throw new SupabaseError(error);
      }

      console.log('Sign in successful:', data);
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signOut();

      if (error) throw new SupabaseError(error);

      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw new SupabaseError(error);

      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw new SupabaseError(error);

      console.log('Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser['profile']>) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw new SupabaseError(error);

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw new SupabaseError(error);

      console.log('Session refreshed');
      return data;
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  };

  // Utility methods
  const isAuthenticated = !!state.user && !!state.session;

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const contextValue: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Additional convenience hooks
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export function useSession(): Session | null {
  const { session } = useAuth();
  return session;
}

export function useAuthLoading(): boolean {
  const { loading } = useAuth();
  return loading;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
