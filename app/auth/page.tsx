'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoginForm } from '@/components/forms/LoginForm';
import { SignUpForm } from '@/components/forms/SignUpForm';
import { PasswordResetForm } from '@/components/forms/PasswordResetForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { isDemoMode } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Get auth state without automatic redirect
  const { isAuthenticated, loading, initialized } = useAuth();

  // Handle demo mode redirect
  useEffect(() => {
    if (isDemoMode && !searchParams.get('force')) {
      console.log('Demo mode detected, redirecting to demo page');
      router.replace('/story-submission-demo');
    }
  }, [router, searchParams]);

  // Handle redirect for authenticated users
  useEffect(() => {
    console.log('Auth page effect:', { initialized, isAuthenticated, isDemoMode });

    if (initialized && isAuthenticated && !isDemoMode) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      console.log('User authenticated, redirecting to:', redirectTo);
      router.replace(redirectTo);
    }
  }, [initialized, isAuthenticated, searchParams, router]);

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
    // Let the useEffect above handle the redirect
    console.log('Auth success - redirect will be handled by useEffect');
  };

  // Show loading while checking authentication status
  if (!initialized || loading) {
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

  // If user is authenticated and not in demo mode, show redirecting message
  if (isAuthenticated && !isDemoMode) {
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">{t('auth:redirecting', 'Redirecting...')}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              <p>Debug: Authenticated and redirecting to {redirectTo}</p>
              <p>Auth State: {JSON.stringify({ initialized, isAuthenticated, loading })}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render auth forms for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
