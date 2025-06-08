'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth, useAuthForm } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  className?: string;
  showCard?: boolean;
}

export function LoginForm({
  onSuccess,
  onForgotPassword,
  onSignUp,
  className = '',
  showCard = true,
}: LoginFormProps) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { isLoading, error, success, handleAuthAction, clearMessages } = useAuthForm();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    await handleAuthAction(
      async () => {
        await signIn(data.email, data.password);
        reset();
        onSuccess?.();
      },
      t('auth.login.success', 'Login successful!')
    );
  };

  const FormContent = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('auth.login.title', 'Sign in to your account')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('auth.login.subtitle', 'Enter your email and password to access your account')}
        </p>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('auth.fields.email', 'Email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('auth.placeholders.email', 'Enter your email')}
              className="pl-10"
              {...register('email')}
              disabled={isLoading}
              autoComplete="email"
              dir="ltr" // Force LTR for email input
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            {t('auth.fields.password', 'Password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.placeholders.password', 'Enter your password')}
              className="pl-10 pr-10"
              {...register('password')}
              disabled={isLoading}
              autoComplete="current-password"
              dir="ltr" // Force LTR for password input
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:underline"
            disabled={isLoading}
          >
            {t('auth.login.forgotPassword', 'Forgot your password?')}
          </button>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.login.signingIn', 'Signing in...')}
            </>
          ) : (
            t('auth.login.signIn', 'Sign In')
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.login.noAccount', "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={onSignUp}
            className="text-primary hover:underline font-medium"
            disabled={isLoading}
          >
            {t('auth.login.signUp', 'Sign up')}
          </button>
        </p>
      </div>

      {/* Clear Messages Button */}
      {(error || success) && (
        <div className="text-center">
          <button
            type="button"
            onClick={clearMessages}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('common.clearMessages', 'Clear messages')}
          </button>
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t('auth.login.welcome', 'Welcome back')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.login.cardDescription', 'Sign in to continue to GemsAI')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    );
  }

  return <FormContent />;
}

export default LoginForm;
