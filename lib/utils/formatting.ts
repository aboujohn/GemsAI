/**
 * Language-specific formatting utilities for Hebrew and English locales
 */

export type SupportedLocale = 'he-IL' | 'en-US';
export type Currency = 'ILS' | 'USD' | 'EUR';
export type DateStyle = 'full' | 'long' | 'medium' | 'short';
export type TimeStyle = 'full' | 'long' | 'medium' | 'short';

/**
 * Locale configuration mapping
 */
export const LOCALE_CONFIG = {
  'he-IL': {
    language: 'he',
    country: 'IL',
    currency: 'ILS' as Currency,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberDecimalSeparator: '.',
    numberGroupingSeparator: ',',
    currencySymbol: '₪',
    currencyPosition: 'after' as 'before' | 'after',
    rtl: true,
  },
  'en-US': {
    language: 'en',
    country: 'US',
    currency: 'USD' as Currency,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    numberDecimalSeparator: '.',
    numberGroupingSeparator: ',',
    currencySymbol: '$',
    currencyPosition: 'before' as 'before' | 'after',
    rtl: false,
  },
} as const;

/**
 * Get locale from language code
 */
export function getLocaleFromLanguage(language: string): SupportedLocale {
  return language === 'he' ? 'he-IL' : 'en-US';
}

/**
 * Date formatting utilities
 */
export class DateFormatter {
  private locale: SupportedLocale;
  private config: (typeof LOCALE_CONFIG)[SupportedLocale];

  constructor(locale: SupportedLocale) {
    this.locale = locale;
    this.config = LOCALE_CONFIG[locale];
  }

  /**
   * Format date with various styles
   */
  formatDate(date: Date, style: DateStyle = 'medium'): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: style,
    }).format(date);
  }

  /**
   * Format time with various styles
   */
  formatTime(date: Date, style: TimeStyle = 'short'): string {
    return new Intl.DateTimeFormat(this.locale, {
      timeStyle: style,
    }).format(date);
  }

  /**
   * Format date and time together
   */
  formatDateTime(
    date: Date,
    dateStyle: DateStyle = 'medium',
    timeStyle: TimeStyle = 'short'
  ): string {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle,
      timeStyle,
    }).format(date);
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  formatRelativeTime(date: Date, baseDate: Date = new Date()): string {
    const diffMs = date.getTime() - baseDate.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(diffSeconds, 'second');
    } else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else {
      return rtf.format(diffDays, 'day');
    }
  }

  /**
   * Format Hebrew calendar dates (for Hebrew locale)
   */
  formatHebrewDate(date: Date): string {
    if (this.locale !== 'he-IL') {
      return this.formatDate(date);
    }

    try {
      // Hebrew calendar formatting using Intl with Hebrew calendar
      return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      // Fallback to regular formatting if Hebrew calendar is not supported
      return this.formatDate(date);
    }
  }

  /**
   * Get day of week name
   */
  getDayName(date: Date, style: 'long' | 'short' | 'narrow' = 'long'): string {
    return new Intl.DateTimeFormat(this.locale, {
      weekday: style,
    }).format(date);
  }

  /**
   * Get month name
   */
  getMonthName(date: Date, style: 'long' | 'short' | 'narrow' = 'long'): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: style,
    }).format(date);
  }
}

/**
 * Number formatting utilities
 */
export class NumberFormatter {
  private locale: SupportedLocale;
  private config: (typeof LOCALE_CONFIG)[SupportedLocale];

  constructor(locale: SupportedLocale) {
    this.locale = locale;
    this.config = LOCALE_CONFIG[locale];
  }

  /**
   * Format numbers with proper grouping and decimal separators
   */
  formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  /**
   * Format currency amounts
   */
  formatCurrency(value: number, currency: Currency = this.config.currency): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format percentages
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format file sizes (bytes, KB, MB, etc.)
   */
  formatFileSize(bytes: number): string {
    const units =
      this.locale === 'he-IL'
        ? ['בייט', 'ק"ב', 'מ"ב', 'ג"ב', 'ט"ב']
        : ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) return `0 ${units[0]}`;

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return `${this.formatNumber(value, { maximumFractionDigits: 1 })} ${units[i]}`;
  }

  /**
   * Format ordinal numbers (1st, 2nd, 3rd, etc.)
   */
  formatOrdinal(value: number): string {
    if (this.locale === 'he-IL') {
      // Hebrew ordinals are complex, using simple suffix for now
      return `${value}-${value === 1 ? 'ה' : 'ים'}`;
    }

    const pr = new Intl.PluralRules(this.locale, { type: 'ordinal' });
    const suffixes = new Map([
      ['one', 'st'],
      ['two', 'nd'],
      ['few', 'rd'],
      ['other', 'th'],
    ]);

    const rule = pr.select(value);
    const suffix = suffixes.get(rule) || 'th';
    return `${value}${suffix}`;
  }

  /**
   * Format compact numbers (1K, 1M, etc.)
   */
  formatCompact(value: number, notation: 'standard' | 'compact' = 'compact'): string {
    return new Intl.NumberFormat(this.locale, {
      notation,
      compactDisplay: 'short',
    }).format(value);
  }
}

/**
 * Pluralization utilities
 */
export class PluralFormatter {
  private locale: SupportedLocale;

  constructor(locale: SupportedLocale) {
    this.locale = locale;
  }

  /**
   * Get plural rule for a number
   */
  getPluralRule(count: number): Intl.LDMLPluralRule {
    const pr = new Intl.PluralRules(this.locale);
    return pr.select(count);
  }

  /**
   * Format plural forms
   */
  formatPlural(
    count: number,
    forms: {
      zero?: string;
      one: string;
      two?: string;
      few?: string;
      many?: string;
      other: string;
    }
  ): string {
    const rule = this.getPluralRule(count);

    // Handle special case for zero
    if (count === 0 && forms.zero) {
      return forms.zero;
    }

    const form = forms[rule] || forms.other;
    return form.replace('{{count}}', count.toString());
  }

  /**
   * Hebrew-specific pluralization
   */
  formatHebrewPlural(count: number, singular: string, plural: string, dual?: string): string {
    if (this.locale !== 'he-IL') {
      return count === 1 ? singular : plural;
    }

    if (count === 0) return plural;
    if (count === 1) return singular;
    if (count === 2 && dual) return dual;
    return plural;
  }
}

/**
 * List formatting utilities
 */
export class ListFormatter {
  private locale: SupportedLocale;

  constructor(locale: SupportedLocale) {
    this.locale = locale;
  }

  /**
   * Format lists with proper conjunctions
   */
  formatList(
    items: string[],
    type: 'conjunction' | 'disjunction' = 'conjunction',
    style: 'long' | 'short' | 'narrow' = 'long'
  ): string {
    return new Intl.ListFormat(this.locale, {
      style,
      type,
    }).format(items);
  }

  /**
   * Format lists with custom separators
   */
  formatListCustom(items: string[], separator: string = ', ', lastSeparator?: string): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) {
      const finalSep = lastSeparator || (this.locale === 'he-IL' ? ' ו' : ' and ');
      return items.join(finalSep);
    }

    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];
    const finalSep = lastSeparator || (this.locale === 'he-IL' ? ', ו' : ', and ');

    return allButLast.join(separator) + finalSep + last;
  }
}

/**
 * Validation utilities for locale-specific formats
 */
export class LocaleValidator {
  private locale: SupportedLocale;
  private config: (typeof LOCALE_CONFIG)[SupportedLocale];

  constructor(locale: SupportedLocale) {
    this.locale = locale;
    this.config = LOCALE_CONFIG[locale];
  }

  /**
   * Validate phone numbers
   */
  validatePhoneNumber(phone: string): boolean {
    if (this.locale === 'he-IL') {
      // Israeli phone number patterns
      const patterns = [
        /^0[2-9]\d{7,8}$/, // Landline
        /^05[0-9]\d{7}$/, // Mobile
        /^\+972[2-9]\d{7,8}$/, // International landline
        /^\+97250[0-9]\d{6}$/, // International mobile
      ];
      return patterns.some(pattern => pattern.test(phone.replace(/[-\s]/g, '')));
    } else {
      // US phone number pattern
      const cleaned = phone.replace(/[-\s()]/g, '');
      return /^(\+1)?[2-9]\d{9}$/.test(cleaned);
    }
  }

  /**
   * Validate postal codes
   */
  validatePostalCode(code: string): boolean {
    if (this.locale === 'he-IL') {
      // Israeli postal code: 5 or 7 digits
      return /^\d{5}$|^\d{7}$/.test(code);
    } else {
      // US ZIP code: 5 digits or ZIP+4
      return /^\d{5}$|^\d{5}-\d{4}$/.test(code);
    }
  }

  /**
   * Validate ID numbers
   */
  validateIdNumber(id: string): boolean {
    if (this.locale === 'he-IL') {
      // Israeli ID number validation using Luhn algorithm
      if (!/^\d{9}$/.test(id)) return false;

      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let digit = parseInt(id[i]) * ((i % 2) + 1);
        if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
        sum += digit;
      }
      return sum % 10 === 0;
    } else {
      // US SSN pattern (basic validation)
      return /^\d{3}-\d{2}-\d{4}$/.test(id);
    }
  }
}

/**
 * Sorting utilities for locale-specific content
 */
export class LocaleSorter {
  private locale: SupportedLocale;
  private collator: Intl.Collator;

  constructor(locale: SupportedLocale) {
    this.locale = locale;
    this.collator = new Intl.Collator(locale, {
      sensitivity: 'base',
      numeric: true,
    });
  }

  /**
   * Sort strings using locale-specific rules
   */
  sortStrings(strings: string[]): string[] {
    return [...strings].sort(this.collator.compare);
  }

  /**
   * Sort objects by a string property
   */
  sortByProperty<T>(items: T[], property: keyof T): T[] {
    return [...items].sort((a, b) => {
      const aVal = String(a[property]);
      const bVal = String(b[property]);
      return this.collator.compare(aVal, bVal);
    });
  }

  /**
   * Search and sort by relevance
   */
  searchAndSort(items: string[], query: string): string[] {
    const filtered = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));

    return filtered.sort((a, b) => {
      const aIndex = a.toLowerCase().indexOf(query.toLowerCase());
      const bIndex = b.toLowerCase().indexOf(query.toLowerCase());

      if (aIndex === bIndex) {
        return this.collator.compare(a, b);
      }
      return aIndex - bIndex;
    });
  }
}

/**
 * Main formatting utility class that combines all formatters
 */
export class LocaleFormatter {
  public readonly locale: SupportedLocale;
  public readonly config: (typeof LOCALE_CONFIG)[SupportedLocale];
  public readonly date: DateFormatter;
  public readonly number: NumberFormatter;
  public readonly plural: PluralFormatter;
  public readonly list: ListFormatter;
  public readonly validator: LocaleValidator;
  public readonly sorter: LocaleSorter;

  constructor(locale: SupportedLocale) {
    this.locale = locale;
    this.config = LOCALE_CONFIG[locale];
    this.date = new DateFormatter(locale);
    this.number = new NumberFormatter(locale);
    this.plural = new PluralFormatter(locale);
    this.list = new ListFormatter(locale);
    this.validator = new LocaleValidator(locale);
    this.sorter = new LocaleSorter(locale);
  }

  /**
   * Create formatter from language code
   */
  static fromLanguage(language: string): LocaleFormatter {
    const locale = getLocaleFromLanguage(language);
    return new LocaleFormatter(locale);
  }

  /**
   * Format display names for countries, languages, etc.
   */
  formatDisplayName(code: string, type: 'region' | 'language' | 'currency' = 'region'): string {
    return new Intl.DisplayNames(this.locale, { type }).of(code) || code;
  }

  /**
   * Check if current locale is RTL
   */
  isRTL(): boolean {
    return this.config.rtl;
  }

  /**
   * Get language direction
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.config.rtl ? 'rtl' : 'ltr';
  }
}
