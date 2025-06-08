'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';
import type { TranslationNamespace } from '@/lib/translation-management';

/**
 * Helper hook for common translation patterns
 */
export function useTranslationHelpers(namespace: TranslationNamespace = 'common') {
  const { t, language, isRTL } = useTranslation(namespace);

  /**
   * Get status text with appropriate styling class
   */
  const getStatusText = (status: string, statusNamespace: string = 'status') => {
    const statusKey = `${statusNamespace}.${status}`;
    return {
      text: t(statusKey),
      className: getStatusClassName(status)
    };
  };

  /**
   * Get CSS class for status indicators
   */
  const getStatusClassName = (status: string): string => {
    const statusClasses: Record<string, string> = {
      // General statuses
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      success: 'text-green-600 bg-green-50 border-green-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-orange-600 bg-orange-50 border-orange-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200',
      
      // Story statuses
      draft: 'text-gray-600 bg-gray-50 border-gray-200',
      analyzing: 'text-blue-600 bg-blue-50 border-blue-200',
      ready: 'text-green-600 bg-green-50 border-green-200',
      
      // Order statuses
      approved: 'text-green-600 bg-green-50 border-green-200',
      manufacturing: 'text-purple-600 bg-purple-50 border-purple-200',
      shipping: 'text-blue-600 bg-blue-50 border-blue-200',
      delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };

    return statusClasses[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  /**
   * Format validation error messages
   */
  const getValidationError = (field: string, type: string, options?: any) => {
    const errorKey = `validation.${type}`;
    return t(errorKey, { field: t(`forms.labels.${field}`), ...options });
  };

  /**
   * Get action button text with appropriate icon direction
   */
  const getActionText = (action: string) => {
    return {
      text: t(`actions.${action}`),
      iconPosition: isRTL ? 'right' : 'left'
    };
  };

  /**
   * Format interpolated text with proper pluralization
   */
  const getPluralText = (key: string, count: number, options?: any) => {
    return t(key, { 
      count, 
      ...options,
      postProcess: 'interval',
      interpolation: { format: (value, format) => {
        if (format === 'hebrew-count' && language === 'he') {
          // Hebrew pluralization rules
          if (count === 1) return 'אחד';
          if (count === 2) return 'שניים';
          return count.toString();
        }
        return value;
      }}
    });
  };

  /**
   * Get navigation item with proper RTL handling
   */
  const getNavItem = (key: string) => {
    return {
      text: t(`navigation.${key}`),
      className: isRTL ? 'text-right' : 'text-left'
    };
  };

  /**
   * Format currency with locale awareness
   */
  const formatLocaleCurrency = (amount: number, currency?: string) => {
    const defaultCurrency = language === 'he' ? 'ILS' : 'USD';
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency || defaultCurrency,
    }).format(amount);
  };

  /**
   * Format date with cultural preferences
   */
  const formatLocaleDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      calendar: language === 'he' ? 'hebrew' : 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return new Intl.DateTimeFormat(
      language === 'he' ? 'he-IL' : 'en-US',
      defaultOptions
    ).format(dateObj);
  };

  /**
   * Get form field configuration with translations
   */
  const getFieldConfig = (fieldName: string) => {
    return {
      label: t(`forms.labels.${fieldName}`),
      placeholder: t(`forms.placeholders.${fieldName}`),
      validation: {
        required: t(`forms.validation.required`, { field: t(`forms.labels.${fieldName}`) }),
        invalid: t(`forms.validation.${fieldName}Invalid`),
      }
    };
  };

  /**
   * Get loading states text
   */
  const getLoadingText = (action?: string) => {
    if (action) {
      return t(`status.loading.${action}`, { defaultValue: t('status.loading') });
    }
    return t('status.loading');
  };

  /**
   * Get empty state messages
   */
  const getEmptyState = (context: string) => {
    return {
      title: t(`${context}.empty`),
      description: t(`${context}.emptyDescription`, { 
        defaultValue: t('status.noResults') 
      }),
      action: t(`${context}.createNew`, { 
        defaultValue: t('actions.create') 
      })
    };
  };

  return {
    // Status helpers
    getStatusText,
    getStatusClassName,
    
    // Form helpers
    getValidationError,
    getFieldConfig,
    
    // Action helpers
    getActionText,
    
    // Text formatting
    getPluralText,
    getLoadingText,
    getEmptyState,
    
    // Navigation
    getNavItem,
    
    // Locale formatting
    formatLocaleCurrency,
    formatLocaleDate,
    
    // Language info
    language,
    isRTL,
  };
} 