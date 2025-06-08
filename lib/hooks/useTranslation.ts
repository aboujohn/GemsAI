'use client';

import { useTranslation as useI18n, UseTranslationOptions } from 'react-i18next';
import { useLanguage } from '@/components/providers/LanguageProvider';

export type TranslationNamespace = 'common' | 'auth' | 'dashboard' | 'stories' | 'jewelry' | 'validation';

/**
 * Enhanced useTranslation hook that provides additional functionality
 * beyond the standard react-i18next hook
 */
export function useTranslation(
  namespace: TranslationNamespace | TranslationNamespace[] = 'common',
  options?: UseTranslationOptions
) {
  const { t, i18n, ready } = useI18n(namespace, options);
  const { language, direction, isRTL, changeLanguage } = useLanguage();

  /**
   * Enhanced translation function with type safety and formatting
   */
  const translate = (key: string, options?: any) => {
    return t(key, options);
  };

  /**
   * Format numbers according to the current locale
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', options).format(number);
  };

  /**
   * Format currency according to the current locale
   */
  const formatCurrency = (amount: number, currency: string = 'ILS') => {
    return new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: language === 'he' ? 'ILS' : currency,
    }).format(amount);
  };

  /**
   * Format dates according to the current locale
   */
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      calendar: language === 'he' ? 'hebrew' : 'gregory',
      ...options,
    }).format(dateObj);
  };

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('time.now');
    if (diffMins < 60) return `${diffMins} ${t('time.minutesAgo', { count: diffMins })}`;
    if (diffHours < 24) return `${diffHours} ${t('time.hoursAgo', { count: diffHours })}`;
    if (diffDays === 1) return t('time.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('time.daysAgo', { count: diffDays })}`;
    
    return formatDate(dateObj, { dateStyle: 'medium' });
  };

  /**
   * Get direction-aware CSS classes
   */
  const getDirectionalClass = (ltrClass: string, rtlClass?: string) => {
    if (isRTL) {
      return rtlClass || ltrClass.replace(/-(left|right|l|r)(-|$)/, (match, dir, suffix) => {
        const opposite = dir === 'left' || dir === 'l' ? (dir === 'l' ? 'r' : 'right') : (dir === 'r' ? 'l' : 'left');
        return `-${opposite}${suffix}`;
      });
    }
    return ltrClass;
  };

  /**
   * Check if a translation key exists
   */
  const hasTranslation = (key: string, namespace?: TranslationNamespace) => {
    return i18n.exists(key, { ns: namespace });
  };

  return {
    // Original react-i18next exports
    t: translate,
    i18n,
    ready,
    
    // Language context
    language,
    direction,
    isRTL,
    changeLanguage,
    
    // Enhanced utilities
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    getDirectionalClass,
    hasTranslation,
  };
} 