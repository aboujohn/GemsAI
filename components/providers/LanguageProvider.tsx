'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

type Language = 'he' | 'en';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  changeLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('he');
  const [direction, setDirection] = useState<Direction>('rtl');

  const getDirection = (lang: Language): Direction => {
    return lang === 'he' ? 'rtl' : 'ltr';
  };

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      const newDirection = getDirection(lang);
      setDirection(newDirection);

      // Update HTML attributes
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', newDirection);

      // Store in localStorage
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  useEffect(() => {
    // Initialize language from localStorage or default
    const savedLanguage = localStorage.getItem('language') as Language;
    const initialLanguage = savedLanguage || 'he';

    if (initialLanguage !== language) {
      changeLanguage(initialLanguage);
    } else {
      // Set initial HTML attributes
      const initialDirection = getDirection(initialLanguage);
      document.documentElement.setAttribute('lang', initialLanguage);
      document.documentElement.setAttribute('dir', initialDirection);
    }
  }, []);

  useEffect(() => {
    // Listen for i18n language changes
    const handleLanguageChange = (lng: string) => {
      const newLang = lng as Language;
      setLanguage(newLang);
      setDirection(getDirection(newLang));
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const isRTL = direction === 'rtl';

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        changeLanguage,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
