'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.auth.getSession();
      results.push({
        test: 'Get Session',
        success: !error,
        data: data ? 'Session data received' : 'No session',
        error: error?.message || null,
      });
    } catch (err) {
      results.push({
        test: 'Get Session',
        success: false,
        error: (err as Error).message,
      });
    }

    // Test 2: Auth state listener
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        results.push({
          test: 'Auth State Change Listener',
          success: true,
          data: `Event: ${event}`,
          session: session ? 'Has session' : 'No session',
        });
      });

      setTimeout(() => {
        subscription.unsubscribe();
      }, 1000);

      results.push({
        test: 'Auth State Change Setup',
        success: true,
        data: 'Listener registered successfully',
      });
    } catch (err) {
      results.push({
        test: 'Auth State Change Setup',
        success: false,
        error: (err as Error).message,
      });
    }

    // Test 3: Simple database query (should fail gracefully if no access)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1);

      results.push({
        test: 'Database Query',
        success: !error,
        data: data ? 'Query executed' : 'No data',
        error: error?.message || null,
      });
    } catch (err) {
      results.push({
        test: 'Database Query',
        success: false,
        error: (err as Error).message,
      });
    }

    // Test 4: Test user creation (will fail if user exists)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test-' + Date.now() + '@example.com',
        password: 'testpassword123',
      });

      results.push({
        test: 'User Creation Test',
        success: !error,
        data: data.user ? 'User created' : 'No user created',
        error: error?.message || null,
      });
    } catch (err) {
      results.push({
        test: 'User Creation Test',
        success: false,
        error: (err as Error).message,
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      
      <div>
        <button 
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Supabase Tests'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Test Results</h2>
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
            >
              <h3 className="font-medium">{result.test}</h3>
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                Status: {result.success ? 'PASS' : 'FAIL'}
              </p>
              {result.data && (
                <p className="text-sm text-gray-600">Data: {result.data}</p>
              )}
              {result.error && (
                <p className="text-sm text-red-600">Error: {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Environment Info</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify({
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
            supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
            nodeEnv: process.env.NODE_ENV,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}