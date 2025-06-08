// SystemText Component - Display system translations with automatic fallback
// Provides type-safe access to database system translations

'use client';

import { useSystemTranslation } from '@/lib/hooks/useI18nDatabase';
import { cn } from '@/lib/utils';

interface SystemTextProps {
  translationKey: string;
  fallback?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SystemText({ translationKey, fallback, className, children }: SystemTextProps) {
  const { translation, loading } = useSystemTranslation(translationKey, fallback);

  if (loading) {
    return (
      <span className={cn('animate-pulse bg-gray-200 rounded', className)}>
        {fallback || translationKey}
      </span>
    );
  }

  return (
    <span className={className}>
      {translation}
      {children}
    </span>
  );
}
