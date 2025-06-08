'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-react';
import { useAuth, useAuthForm } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

// Validation schema
const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must be less than 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['user', 'jeweler'], {
      required_error: 'Please select your role',
    }),
    languagePreference: z.enum(['he', 'en'], {
      required_error: 'Please select your language preference',
    }),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSignIn?: () => void;
  className?: string;
  showCard?: boolean;
}

export function SignUpForm({
  onSuccess,
  onSignIn,
  className = '',
  showCard = true,
}: SignUpFormProps) {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { isLoading, error, success, handleAuthAction, clearMessages } = useAuthForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      languagePreference: 'he',
      role: 'user',
      agreeToTerms: false,
    },
  });

  const watchedRole = watch('role');
  const watchedLanguage = watch('languagePreference');

  const onSubmit = async (data: SignUpFormData) => {
    await handleAuthAction(
      async () => {
        await signUp(data.email, data.password, {
          full_name: data.fullName,
          role: data.role,
          language_preference: data.languagePreference,
        });
        setEmailSent(true);
        reset();
        onSuccess?.();
      },
      t(
        'auth.signup.success',
        'Account created successfully! Please check your email for verification.'
      )
    );
  };

  const FormContent = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('auth.signup.title', 'Create your account')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('auth.signup.subtitle', 'Join GemsAI to start creating meaningful jewelry')}
        </p>
      </div>

      {/* Email Verification Success */}
      {emailSent && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-600">
            {t(
              'auth.signup.emailSent',
              'Verification email sent! Please check your inbox and click the verification link.'
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

      {success && !emailSent && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            {t('auth.fields.fullName', 'Full Name')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder={t('auth.placeholders.fullName', 'Enter your full name')}
              className="pl-10"
              {...register('fullName')}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
        </div>

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

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            {t('auth.fields.role', 'I am a')}
          </Label>
          <Select
            value={watchedRole}
            onValueChange={value => setValue('role', value as 'user' | 'jeweler')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('auth.placeholders.role', 'Select your role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                {t('auth.roles.user', 'Customer - I want to create jewelry')}
              </SelectItem>
              <SelectItem value="jeweler">
                {t('auth.roles.jeweler', 'Jeweler - I want to fulfill orders')}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>

        {/* Language Preference */}
        <div className="space-y-2">
          <Label htmlFor="languagePreference" className="text-sm font-medium">
            {t('auth.fields.language', 'Preferred Language')}
          </Label>
          <Select
            value={watchedLanguage}
            onValueChange={value => setValue('languagePreference', value as 'he' | 'en')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('auth.placeholders.language', 'Select language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he">עברית (Hebrew)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          {errors.languagePreference && (
            <p className="text-sm text-destructive">{errors.languagePreference.message}</p>
          )}
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
              autoComplete="new-password"
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
          <p className="text-xs text-muted-foreground">
            {t(
              'auth.passwordRequirements',
              'Password must contain at least one uppercase letter, lowercase letter, and number'
            )}
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            {t('auth.fields.confirmPassword', 'Confirm Password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.placeholders.confirmPassword', 'Confirm your password')}
              className="pl-10 pr-10"
              {...register('confirmPassword')}
              disabled={isLoading}
              autoComplete="new-password"
              dir="ltr" // Force LTR for password input
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center space-x-2">
          <Checkbox id="agreeToTerms" {...register('agreeToTerms')} disabled={isLoading} />
          <Label htmlFor="agreeToTerms" className="text-sm">
            {t('auth.signup.agreeToTerms', 'I agree to the')}{' '}
            <a href="/terms" className="text-primary hover:underline" target="_blank">
              {t('auth.signup.termsOfService', 'Terms of Service')}
            </a>{' '}
            {t('common.and', 'and')}{' '}
            <a href="/privacy" className="text-primary hover:underline" target="_blank">
              {t('auth.signup.privacyPolicy', 'Privacy Policy')}
            </a>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.signup.creatingAccount', 'Creating account...')}
            </>
          ) : (
            t('auth.signup.createAccount', 'Create Account')
          )}
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.signup.haveAccount', 'Already have an account?')}{' '}
          <button
            type="button"
            onClick={onSignIn}
            className="text-primary hover:underline font-medium"
            disabled={isLoading}
          >
            {t('auth.signup.signIn', 'Sign in')}
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
            {t('auth.signup.welcome', 'Join GemsAI')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.signup.cardDescription', 'Create your account to start your jewelry journey')}
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

export default SignUpForm;
