// GemsAI Supabase Client Configuration
// Production-ready client with TypeScript support and comprehensive error handling

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create mock client for demo mode
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    signUp: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    signOut: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    resetPasswordForEmail: () =>
      Promise.reject(new Error('Demo mode: Authentication not available')),
    updateUser: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    refreshSession: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.reject(new Error('Demo mode: Database not available')),
    update: () => Promise.reject(new Error('Demo mode: Database not available')),
    delete: () => Promise.reject(new Error('Demo mode: Database not available')),
  }),
  rpc: () => Promise.reject(new Error('Demo mode: Database not available')),
});

// Create real Supabase client
const createRealClient = (url: string, key: string) => {
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'GemsAI',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      channels: {},
      url: url.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime/v1',
    },
  });
};

// TEMPORARY: Allow demo mode without Supabase
let supabaseClient: any;
let isDemo = false;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Running in demo mode. Authentication features will not work.'
  );
  supabaseClient = createMockClient();
  isDemo = true;
} else {
  supabaseClient = createRealClient(supabaseUrl, supabaseAnonKey);
}

// Export the client
export const supabase = supabaseClient;

// Enhanced client with session management for i18n context
export const createI18nClient = (languageId: string = 'he') => {
  if (isDemo) {
    return createMockClient();
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'GemsAI',
        'x-language-context': languageId,
      },
    },
    db: {
      schema: 'public',
    },
  });

  // Set language context for database session
  client
    .from('languages')
    .select('id')
    .limit(1)
    .then(() => {
      // Set the language context using PostgreSQL session variables
      client
        .rpc('set_config', {
          setting_name: 'app.current_language',
          new_value: languageId,
          is_local: false,
        })
        .catch(() => {
          // Fallback: we'll handle language context in the application layer
          console.warn('Could not set database language context, using application fallback');
        });
    })
    .catch(() => {
      // Database not ready, will handle gracefully
    });

  return client;
};

// Type-safe error handling utilities
export class SupabaseError extends Error {
  public readonly code: string;
  public readonly details: any;
  public readonly hint?: string;

  constructor(error: any) {
    super(error.message || 'An unknown database error occurred');
    this.name = 'SupabaseError';
    this.code = error.code || 'UNKNOWN_ERROR';
    this.details = error.details || null;
    this.hint = error.hint;
  }

  public isAuthError(): boolean {
    return this.code.startsWith('AUTH_');
  }

  public isConnectionError(): boolean {
    return ['NETWORK_ERROR', 'CONNECTION_ERROR', 'TIMEOUT_ERROR'].includes(this.code);
  }

  public isPermissionError(): boolean {
    return ['INSUFFICIENT_PRIVILEGE', 'ROW_LEVEL_SECURITY_VIOLATION'].includes(this.code);
  }
}

// Wrapper function for handling Supabase responses
export async function handleSupabaseResponse<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await promise;

    if (error) {
      throw new SupabaseError(error);
    }

    if (data === null) {
      throw new Error('No data returned from query');
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }

    // Handle network errors, timeouts, etc.
    throw new SupabaseError({
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'NETWORK_ERROR',
    });
  }
}

// Database health check utility
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('languages').select('id').limit(1);

    return !error && Array.isArray(data);
  } catch {
    return false;
  }
}

// Language context management
export async function setLanguageContext(languageId: string): Promise<void> {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_language',
      new_value: languageId,
      is_local: false,
    });
  } catch (error) {
    console.warn('Could not set language context:', error);
    // Non-critical error, application can handle fallback
  }
}

// Session management utilities
export const auth = {
  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw new SupabaseError(error);
    return user;
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw new SupabaseError(error);
    return session;
  },

  // Sign in with email/password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new SupabaseError(error);
    return data;
  },

  // Sign up with email/password
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw new SupabaseError(error);
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new SupabaseError(error);
  },

  // Password reset
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw new SupabaseError(error);
  },
};

// Real-time subscription utilities
export const realtime = {
  // Subscribe to table changes
  subscribeToTable<T>(table: string, callback: (payload: any) => void, filter?: string) {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to translation changes for a specific language
  subscribeToTranslations(languageId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`translations:${languageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_translations',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enum_translations',
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// Export types for external use
export type { Database } from '@/lib/types/database';
export type SupabaseClient = typeof supabase;
