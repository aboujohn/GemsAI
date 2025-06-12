// GemsAI Supabase Server Client Configuration
// Server-side client for API routes and server components

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create mock client for demo mode
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    admin: {
      getUserById: () => Promise.resolve({ data: { user: null }, error: null }),
      createUser: () => Promise.reject(new Error('Demo mode: Authentication not available')),
      deleteUser: () => Promise.reject(new Error('Demo mode: Authentication not available')),
    },
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.reject(new Error('Demo mode: Database not available')),
    update: () => Promise.reject(new Error('Demo mode: Database not available')),
    delete: () => Promise.reject(new Error('Demo mode: Database not available')),
    eq: function() { return this; },
    single: function() { return this; },
    order: function() { return this; },
    range: function() { return this; },
    or: function() { return this; },
    limit: function() { return this; },
  }),
  rpc: () => Promise.reject(new Error('Demo mode: Database not available')),
});

// Create server client with service role (for admin operations)
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      'Missing Supabase server environment variables. Running in demo mode.'
    );
    return createMockClient();
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'GemsAI-Server',
      },
    },
  });
}

// Create client for API routes with user session (synchronous)
export function createClient(cookieStore?: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing Supabase environment variables. Running in demo mode.'
    );
    return createMockClient();
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: cookieStore ? {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    } : undefined,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'GemsAI-API',
      },
    },
  });
}

// Create async client for server components that need cookies
export async function createAsyncClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing Supabase environment variables. Running in demo mode.'
    );
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'GemsAI-API',
      },
    },
  });
}

// Default export for convenience
export { createClient as default }; 