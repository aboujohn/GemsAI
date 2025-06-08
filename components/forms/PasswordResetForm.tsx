'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth, useAuthForm } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';

// Validation schema
const passwordResetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
  showCard?: boolean;
}

export function PasswordResetForm({
  onSuccess,
  onBackToLogin,
  className = '',
  showCard = true,
}: PasswordResetFormProps) {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const { isLoading, error, success, handleAuthAction, clearMessages } = useAuthForm();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    getValues,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    await handleAuthAction(
      async () => {
        await resetPassword(data.email);
        setEmailSent(true);
        onSuccess?.();
      },
      t('auth.passwordReset.success', 'Password reset email sent! Please check your inbox.')
    );
  };

  const handleSendAgain = async () => {
    const email = getValues('email');
    if (email) {
      await handleAuthAction(
        async () => {
          await resetPassword(email);
        },
        t('auth.passwordReset.sentAgain', 'Password reset email sent again!')
      );
    }
  };

  const FormContent = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {emailSent
            ? t('auth.passwordReset.checkEmail', 'Check your email')
            : t('auth.passwordReset.title', 'Reset your password')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {emailSent
            ? t(
                'auth.passwordReset.emailSentDescription',
                'We sent a password reset link to your email address'
              )
            : t(
                'auth.passwordReset.subtitle',
                "Enter your email address and we'll send you a link to reset your password"
              )}
        </p>
      </div>

      {/* Email Sent Success */}
      {emailSent && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-600">
            {t(
              'auth.passwordReset.emailSent',
              'Password reset email sent! Please check your inbox and spam folder.'
            )}
          </AlertDescription>
        </Alert>
      )}

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

      {!emailSent ? (
        /* Reset Form */
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
                autoFocus
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.passwordReset.sending', 'Sending reset email...')}
              </>
            ) : (
              t('auth.passwordReset.sendEmail', 'Send Reset Email')
            )}
          </Button>
        </form>
      ) : (
        /* Post-Send Actions */
        <div className="space-y-4">
          {/* Resend Button */}
          <Button
            onClick={handleSendAgain}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.passwordReset.resending', 'Resending...')}
              </>
            ) : (
              t('auth.passwordReset.resendEmail', 'Resend Email')
            )}
          </Button>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              {t(
                'auth.passwordReset.instructions',
                'Click the link in the email to reset your password.'
              )}
            </p>
            <p>
              {t(
                'auth.passwordReset.checkSpam',
                "If you don't see the email, check your spam folder."
              )}
            </p>
            <p>{t('auth.passwordReset.linkExpiry', 'The reset link will expire in 1 hour.')}</p>
          </div>
        </div>
      )}

      {/* Back to Login Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center text-sm text-primary hover:underline"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          {t('auth.passwordReset.backToLogin', 'Back to login')}
        </button>
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
            {t('auth.passwordReset.cardTitle', 'Password Reset')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.passwordReset.cardDescription', 'Reset your GemsAI account password')}
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

export default PasswordResetForm;
