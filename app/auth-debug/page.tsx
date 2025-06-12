'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSearchParams } from 'next/navigation';

export default function AuthDebugPage() {
  const { user, session, loading, initialized, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Auth Debug Information</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify({
              supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
              supabaseKey: supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'NOT SET',
              nodeEnv: process.env.NODE_ENV,
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Auth State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify({
              loading,
              initialized,
              isAuthenticated,
              hasUser: !!user,
              hasSession: !!session,
              userId: user?.id || 'null',
              userEmail: user?.email || 'null',
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">URL Parameters</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify({
              redirectTo: searchParams.get('redirectTo'),
              mode: searchParams.get('mode'),
              allParams: Object.fromEntries(searchParams.entries()),
            }, null, 2)}
          </pre>
        </div>

        {user && (
          <div>
            <h2 className="text-lg font-semibold">User Details</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {session && (
          <div>
            <h2 className="text-lg font-semibold">Session Details</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify({
                access_token: session.access_token ? 'SET (length: ' + session.access_token.length + ')' : 'NOT SET',
                expires_at: session.expires_at,
                token_type: session.token_type,
                user_id: session.user?.id,
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}