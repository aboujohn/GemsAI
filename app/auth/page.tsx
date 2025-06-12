'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isDemoMode } from '@/lib/supabase/client';
import LoginForm from '@/components/forms/LoginForm';
import SignUpForm from '@/components/forms/SignUpForm';
import PasswordResetForm from '@/components/forms/PasswordResetForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const redirectingRef = useRef(false);

  // Get auth state without automatic redirect
  const { isAuthenticated, loading, initialized } = useAuth();

  // Handle demo mode redirect
  useEffect(() => {
    if (isDemoMode && !searchParams.get('force') && !redirectingRef.current) {
      console.log('Demo mode detected, redirecting to demo page');
      redirectingRef.current = true;
      router.replace('/story-submission-demo');
    }
  }, []); // Remove dependencies to run only once

  // Handle redirect for authenticated users
  useEffect(() => {
    console.log('Auth page effect triggered:', { initialized, isAuthenticated, isRedirecting: redirectingRef.current, isDemoMode });
    
    if (initialized && isAuthenticated && !redirectingRef.current && !isDemoMode) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      console.log('User already authenticated, redirecting to:', redirectTo);
      redirectingRef.current = true;
      
      // Direct redirect without delay
      router.replace(redirectTo);
    }
  }, [initialized, isAuthenticated]); // Simplified dependencies

  useEffect(() => {
    // Check URL parameters for initial mode
    const mode = searchParams.get('mode') as AuthMode;
    if (mode && ['login', 'signup', 'reset'].includes(mode)) {
      setAuthMode(mode);
    }
  }, [searchParams]);

  // Update URL when mode changes
  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    window.history.replaceState({}, '', url.toString());
  };

  const handleAuthSuccess = () => {
    // Redirect to dashboard or intended destination
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    console.log('Auth success, redirecting to:', redirectTo);
    
    // Direct redirect
    router.replace(redirectTo);
  };

  // Show loading while checking authentication status
  if (!initialized) {
    console.log('Auth page showing loading state:', { initialized, loading, isAuthenticated });
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('auth:loading', 'Loading...')}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>Debug: initialized={initialized.toString()}</p>
              <p>Debug: loading={loading.toString()}</p>
              <p>Debug: isAuthenticated={isAuthenticated.toString()}</p>
              <p>Debug: Supabase URL={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't render auth forms if user is already authenticated (except in demo mode)
  if (isAuthenticated && !isDemoMode) {
    // Set redirecting state if not already set
    if (!redirectingRef.current) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      console.log('Setting redirect state for authenticated user to:', redirectTo);
      redirectingRef.current = true;
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        router.replace(redirectTo);
      }, 0);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('auth:redirecting', 'Redirecting...')}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              <p>Debug: Authenticated and redirecting...</p>
              <p>Redirect URL: {searchParams.get('redirectTo') || '/dashboard'}</p>
              <p>Is Redirecting: {redirectingRef.current.toString()}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {authMode === 'reset' ? (
          /* Password Reset Form */
          <PasswordResetForm
            onSuccess={handleAuthSuccess}
            onBackToLogin={() => handleModeChange('login')}
            showCard={true}
          />
        ) : (
          /* Login/Signup Tabs */
          <Card className="w-full">
            <CardContent className="p-0">
              <Tabs value={authMode} onValueChange={value => handleModeChange(value as AuthMode)}>
                <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-lg">
                  <TabsTrigger value="login" className="rounded-none rounded-tl-lg">
                    {t('auth.tabs.login', 'Sign In')}
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-none rounded-tr-lg">
                    {t('auth.tabs.signup', 'Sign Up')}
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="login" className="mt-0">
                    <LoginForm
                      onSuccess={handleAuthSuccess}
                      onForgotPassword={() => handleModeChange('reset')}
                      onSignUp={() => handleModeChange('signup')}
                      showCard={false}
                    />
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <SignUpForm
                      onSuccess={handleAuthSuccess}
                      onSignIn={() => handleModeChange('login')}
                      showCard={false}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {t('auth.footer.byUsing', 'By using GemsAI, you agree to our')}{' '}
            <a href="/terms" className="text-primary hover:underline" target="_blank">
              {t('auth.footer.terms', 'Terms of Service')}
            </a>{' '}
            {t('common.and', 'and')}{' '}
            <a href="/privacy" className="text-primary hover:underline" target="_blank">
              {t('auth.footer.privacy', 'Privacy Policy')}
            </a>
          </p>
          <p className="mt-2">© 2024 GemsAI. {t('auth.footer.rights', 'All rights reserved.')}</p>
        </div>
      </div>
    </div>
  );
}
