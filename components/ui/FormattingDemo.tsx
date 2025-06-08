'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { DirectionalContainer } from './DirectionalContainer';
import { DirectionalFlex } from './DirectionalFlex';
import { DirectionalInput } from './DirectionalInput';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  useFormatting,
  useDateTimeFormatting,
  useCurrencyFormatting,
  useNumberFormatting,
  usePluralFormatting,
  useListFormatting,
  useFormValidation,
  useSmartFormatting,
  useLocaleSorting,
} from '@/lib/hooks/useFormatting';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useLanguage } from '@/components/providers/LanguageProvider';

/**
 * Comprehensive demonstration of language-specific formatting capabilities
 */
export function FormattingDemo() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const formatter = useFormatting();
  
  // Formatting hooks
  const dateFormatting = useDateTimeFormatting();
  const currencyFormatting = useCurrencyFormatting();
  const numberFormatting = useNumberFormatting();
  const pluralFormatting = usePluralFormatting();
  const listFormatting = useListFormatting();
  const validation = useFormValidation();
  const smartFormatting = useSmartFormatting();
  const sorting = useLocaleSorting();

  // Demo data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentDate = new Date();
  const testDate = new Date('2024-06-15T14:30:00');
  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  
  const testNumbers = [1234.56, 0.75, 1500000, 5, 100];
  const testItems = language === 'he' 
    ? ['תכשיטים', 'טבעות', 'שרשראות', 'עגילים', 'צמידים']
    : ['jewelry', 'rings', 'necklaces', 'earrings', 'bracelets'];
  
  const mixedItems = [
    'Diamond Ring',
    'טבעת יהלום',
    'Gold Necklace', 
    'שרשרת זהב',
    'Silver Bracelet',
    'צמיד כסף'
  ];

  return (
    <div className="space-y-8 p-6">
      <DirectionalContainer className="space-y-4" alignText>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {t('formatting.demo_title', 'Language-Specific Formatting Demo')}
          </h1>
          <LanguageSwitcher />
        </div>

        <p className="text-muted-foreground">
          {t(
            'formatting.demo_description',
            'This demo showcases comprehensive formatting utilities for dates, numbers, currencies, and locale-specific validation.'
          )}
        </p>

        <div className="bg-secondary p-3 rounded-md">
          <strong>Current Locale:</strong> {formatter.locale} | 
          <strong> Direction:</strong> {formatter.getDirection().toUpperCase()} |
          <strong> Currency:</strong> {formatter.config.currency}
        </div>
      </DirectionalContainer>

      {/* Date & Time Formatting */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.date_time_formatting', 'Date & Time Formatting')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Standard Formats</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Short Date:</strong> {dateFormatting.formatShortDate(testDate)}</li>
              <li><strong>Medium Date:</strong> {dateFormatting.formatDate(testDate, 'medium')}</li>
              <li><strong>Long Date:</strong> {dateFormatting.formatLongDate(testDate)}</li>
              <li><strong>Full Date:</strong> {dateFormatting.formatDate(testDate, 'full')}</li>
              <li><strong>Time:</strong> {dateFormatting.formatShortTime(testDate)}</li>
              <li><strong>Date & Time:</strong> {dateFormatting.formatDateTime(testDate)}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Special Formats</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Relative Time:</strong> {dateFormatting.formatRelativeTime(futureDate)}</li>
              <li><strong>Day Name:</strong> {dateFormatting.getDayName(testDate)}</li>
              <li><strong>Month Name:</strong> {dateFormatting.getMonthName(testDate)}</li>
              {language === 'he' && (
                <li><strong>Hebrew Calendar:</strong> {dateFormatting.formatHebrewDate(testDate)}</li>
              )}
              <li><strong>Locale Pattern:</strong> {dateFormatting.formatDatePattern(testDate)}</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Number & Currency Formatting */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.number_currency_formatting', 'Number & Currency Formatting')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Number Formats</h3>
            <ul className="space-y-1 text-sm">
              {testNumbers.map((num, index) => (
                <li key={index}>
                  <strong>{num}:</strong> {numberFormatting.formatNumber(num)}
                </li>
              ))}
              <li><strong>Percentage:</strong> {numberFormatting.formatPercentage(0.75)}</li>
              <li><strong>Compact:</strong> {numberFormatting.formatCompact(1500000)}</li>
              <li><strong>Ordinal (5th):</strong> {numberFormatting.formatOrdinal(5)}</li>
              <li><strong>File Size:</strong> {smartFormatting.formatFileSize(1024 * 1024 * 1.5)}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Currency Formats</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Default Currency:</strong> {currencyFormatting.formatDefault(1234.56)}</li>
              <li><strong>USD:</strong> {currencyFormatting.formatCurrency(1234.56, 'USD')}</li>
              <li><strong>EUR:</strong> {currencyFormatting.formatCurrency(1234.56, 'EUR')}</li>
              <li><strong>ILS:</strong> {currencyFormatting.formatCurrency(1234.56, 'ILS')}</li>
              <li><strong>Symbol Format:</strong> {currencyFormatting.formatWithSymbol(1234.56, 'ILS')}</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Pluralization Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.pluralization_demo', 'Pluralization Demo')}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Standard Pluralization</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[0, 1, 2, 5].map(count => (
                <div key={count} className="bg-secondary p-2 rounded">
                  <strong>{count} items:</strong><br />
                  {pluralFormatting.formatPlural(count, {
                    zero: 'No items',
                    one: '{{count}} item',
                    other: '{{count}} items'
                  })}
                </div>
              ))}
            </div>
          </div>

          {language === 'he' && (
            <div>
              <h3 className="font-medium mb-2">Hebrew Pluralization</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {[0, 1, 2, 5].map(count => (
                  <div key={count} className="bg-secondary p-2 rounded">
                    <strong>{count}:</strong><br />
                    {pluralFormatting.formatHebrewPlural(count, 'פריט', 'פריטים', 'שני פריטים')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* List Formatting */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.list_formatting', 'List Formatting')}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Standard Lists</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Conjunction:</strong> {listFormatting.formatList(testItems, 'conjunction')}</li>
              <li><strong>Disjunction:</strong> {listFormatting.formatList(testItems, 'disjunction')}</li>
              <li><strong>Short Style:</strong> {listFormatting.formatList(testItems, 'conjunction', 'short')}</li>
              <li><strong>Custom Format:</strong> {listFormatting.formatListCustom(testItems)}</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Validation Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.validation_demo', 'Locale-Specific Validation')}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('formatting.phone_number', 'Phone Number')}
              </label>
              <DirectionalInput
                inputType="tel"
                placeholder={language === 'he' ? '050-1234567' : '(555) 123-4567'}
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className={`text-xs mt-1 ${validation.validatePhoneNumber(phoneNumber) ? 'text-green-600' : 'text-red-600'}`}>
                {validation.validatePhoneNumber(phoneNumber) ? '✓ Valid' : '✗ Invalid'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('formatting.postal_code', 'Postal Code')}
              </label>
              <DirectionalInput
                inputType="text"
                placeholder={language === 'he' ? '12345' : '12345'}
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full"
              />
              <p className={`text-xs mt-1 ${validation.validatePostalCode(postalCode) ? 'text-green-600' : 'text-red-600'}`}>
                {validation.validatePostalCode(postalCode) ? '✓ Valid' : '✗ Invalid'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('formatting.id_number', 'ID Number')}
              </label>
              <DirectionalInput
                inputType="text"
                placeholder={language === 'he' ? '123456789' : '123-45-6789'}
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                className="w-full"
              />
              <p className={`text-xs mt-1 ${validation.validateIdNumber(idNumber) ? 'text-green-600' : 'text-red-600'}`}>
                {validation.validateIdNumber(idNumber) ? '✓ Valid' : '✗ Invalid'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sorting & Searching Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.sorting_searching', 'Sorting & Searching')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('formatting.search_items', 'Search Items')}
            </label>
            <DirectionalInput
              inputType="search"
              placeholder={t('formatting.search_placeholder', 'Type to search...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Original Order</h3>
              <ul className="text-sm space-y-1">
                {mixedItems.map((item, index) => (
                  <li key={index} className="bg-secondary p-1 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Sorted</h3>
              <ul className="text-sm space-y-1">
                {sorting.sortMixedContent(mixedItems).map((item, index) => (
                  <li key={index} className="bg-secondary p-1 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Search Results</h3>
              <ul className="text-sm space-y-1">
                {searchQuery ? (
                  sorting.searchAndSort(mixedItems, searchQuery).map((item, index) => (
                    <li key={index} className="bg-secondary p-1 rounded">
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">Type to search...</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Smart Formatting Demo */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {t('formatting.smart_formatting', 'Smart Auto-Formatting')}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Auto-Detected Types</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Date:</strong> {smartFormatting.formatValue(testDate)}</li>
                <li><strong>Number:</strong> {smartFormatting.formatValue(1234.56)}</li>
                <li><strong>Array:</strong> {smartFormatting.formatValue(['item1', 'item2', 'item3'])}</li>
                <li><strong>Boolean:</strong> {smartFormatting.formatValue(true)}</li>
                <li><strong>String:</strong> {smartFormatting.formatValue('Hello World')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Display Names</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Country (IL):</strong> {smartFormatting.formatDisplayName('IL', 'region')}</li>
                <li><strong>Language (he):</strong> {smartFormatting.formatDisplayName('he', 'language')}</li>
                <li><strong>Currency (ILS):</strong> {smartFormatting.formatDisplayName('ILS', 'currency')}</li>
                <li><strong>Country (US):</strong> {smartFormatting.formatDisplayName('US', 'region')}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 