import { useMemo } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  LocaleFormatter,
  getLocaleFromLanguage,
  type SupportedLocale,
} from '@/lib/utils/formatting';

/**
 * Hook that provides all formatting utilities based on current language
 */
export function useFormatting() {
  const { language } = useLanguage();

  const formatter = useMemo(() => {
    return LocaleFormatter.fromLanguage(language);
  }, [language]);

  return formatter;
}

/**
 * Hook for date formatting utilities
 */
export function useDateFormatting() {
  const formatter = useFormatting();
  return formatter.date;
}

/**
 * Hook for number formatting utilities
 */
export function useNumberFormatting() {
  const formatter = useFormatting();
  return formatter.number;
}

/**
 * Hook for pluralization utilities
 */
export function usePluralFormatting() {
  const formatter = useFormatting();
  return formatter.plural;
}

/**
 * Hook for list formatting utilities
 */
export function useListFormatting() {
  const formatter = useFormatting();
  return formatter.list;
}

/**
 * Hook for validation utilities
 */
export function useValidation() {
  const formatter = useFormatting();
  return formatter.validator;
}

/**
 * Hook for sorting utilities
 */
export function useSorting() {
  const formatter = useFormatting();
  return formatter.sorter;
}

/**
 * Hook for currency formatting with specific currency support
 */
export function useCurrencyFormatting() {
  const numberFormatter = useNumberFormatting();
  const { language } = useLanguage();

  const formatters = useMemo(
    () => ({
      // Format with default currency for locale
      formatDefault: (amount: number) => numberFormatter.formatCurrency(amount),

      // Format with specific currency
      formatCurrency: (amount: number, currency: 'ILS' | 'USD' | 'EUR') =>
        numberFormatter.formatCurrency(amount, currency),

      // Format with currency symbol
      formatWithSymbol: (amount: number, currency: 'ILS' | 'USD' | 'EUR') => {
        const symbols = { ILS: '₪', USD: '$', EUR: '€' };
        const formatted = numberFormatter.formatNumber(amount, { minimumFractionDigits: 2 });

        if (language === 'he' && currency === 'ILS') {
          return `${formatted} ${symbols[currency]}`;
        }
        return `${symbols[currency]}${formatted}`;
      },
    }),
    [numberFormatter, language]
  );

  return formatters;
}

/**
 * Hook for comprehensive date/time formatting
 */
export function useDateTimeFormatting() {
  const dateFormatter = useDateFormatting();
  const { language } = useLanguage();

  const formatters = useMemo(
    () => ({
      // Standard formats
      formatDate: dateFormatter.formatDate.bind(dateFormatter),
      formatTime: dateFormatter.formatTime.bind(dateFormatter),
      formatDateTime: dateFormatter.formatDateTime.bind(dateFormatter),
      formatRelativeTime: dateFormatter.formatRelativeTime.bind(dateFormatter),

      // Hebrew calendar (if applicable)
      formatHebrewDate: dateFormatter.formatHebrewDate.bind(dateFormatter),

      // Utility methods
      getDayName: dateFormatter.getDayName.bind(dateFormatter),
      getMonthName: dateFormatter.getMonthName.bind(dateFormatter),

      // Common presets
      formatShortDate: (date: Date) => dateFormatter.formatDate(date, 'short'),
      formatLongDate: (date: Date) => dateFormatter.formatDate(date, 'long'),
      formatShortTime: (date: Date) => dateFormatter.formatTime(date, 'short'),
      formatLongTime: (date: Date) => dateFormatter.formatTime(date, 'long'),

      // Localized patterns
      formatDatePattern: (date: Date) => {
        const config = dateFormatter['config'];
        return language === 'he'
          ? date.toLocaleDateString('he-IL')
          : date.toLocaleDateString('en-US');
      },
    }),
    [dateFormatter, language]
  );

  return formatters;
}

/**
 * Hook for form validation with locale-specific rules
 */
export function useFormValidation() {
  const validator = useValidation();
  const { language } = useLanguage();

  const validators = useMemo(
    () => ({
      validatePhoneNumber: validator.validatePhoneNumber.bind(validator),
      validatePostalCode: validator.validatePostalCode.bind(validator),
      validateIdNumber: validator.validateIdNumber.bind(validator),

      // Email validation (universal)
      validateEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },

      // URL validation (universal)
      validateUrl: (url: string): boolean => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },

      // Hebrew text validation
      validateHebrewText: (text: string): boolean => {
        if (language !== 'he') return true;
        // Check if text contains Hebrew characters
        const hebrewRegex = /[\u0590-\u05FF]/;
        return hebrewRegex.test(text);
      },

      // English text validation
      validateEnglishText: (text: string): boolean => {
        if (language !== 'en') return true;
        // Check if text contains primarily Latin characters
        const latinRegex = /[a-zA-Z]/;
        return latinRegex.test(text);
      },
    }),
    [validator, language]
  );

  return validators;
}

/**
 * Hook for smart text formatting based on content type
 */
export function useSmartFormatting() {
  const formatter = useFormatting();
  const dateFormatters = useDateTimeFormatting();
  const numberFormatters = useNumberFormatting();
  const listFormatters = useListFormatting();

  const smartFormatters = useMemo(
    () => ({
      // Auto-detect and format different data types
      formatValue: (value: any): string => {
        if (value == null) return '';

        if (value instanceof Date) {
          return dateFormatters.formatDateTime(value);
        }

        if (typeof value === 'number') {
          return numberFormatters.formatNumber(value);
        }

        if (Array.isArray(value)) {
          return listFormatters.formatList(value.map(String));
        }

        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No'; // Should be localized
        }

        return String(value);
      },

      // Format file sizes
      formatFileSize: numberFormatters.formatFileSize.bind(numberFormatters),

      // Format percentages
      formatPercentage: numberFormatters.formatPercentage.bind(numberFormatters),

      // Format compact numbers
      formatCompact: numberFormatters.formatCompact.bind(numberFormatters),

      // Format ordinals
      formatOrdinal: numberFormatters.formatOrdinal.bind(numberFormatters),

      // Format display names
      formatDisplayName: formatter.formatDisplayName.bind(formatter),
    }),
    [formatter, dateFormatters, numberFormatters, listFormatters]
  );

  return smartFormatters;
}

/**
 * Hook for locale-specific sorting and searching
 */
export function useLocaleSorting() {
  const sorter = useSorting();
  const { language } = useLanguage();

  const sortingUtils = useMemo(
    () => ({
      sortStrings: sorter.sortStrings.bind(sorter),
      sortByProperty: sorter.sortByProperty.bind(sorter),
      searchAndSort: sorter.searchAndSort.bind(sorter),

      // Specialized sorting for mixed content
      sortMixedContent: (items: string[]) => {
        // For Hebrew locale, prioritize Hebrew content
        if (language === 'he') {
          return [...items].sort((a, b) => {
            const aHasHebrew = /[\u0590-\u05FF]/.test(a);
            const bHasHebrew = /[\u0590-\u05FF]/.test(b);

            if (aHasHebrew && !bHasHebrew) return -1;
            if (!aHasHebrew && bHasHebrew) return 1;

            return sorter.sortStrings([a, b]).indexOf(a) - sorter.sortStrings([a, b]).indexOf(b);
          });
        }

        return sorter.sortStrings(items);
      },
    }),
    [sorter, language]
  );

  return sortingUtils;
}
