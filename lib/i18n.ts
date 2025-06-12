import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly for SSR
import commonHe from '@/public/locales/he/common.json';
import commonEn from '@/public/locales/en/common.json';
import authHe from '@/public/locales/he/auth.json';
import authEn from '@/public/locales/en/auth.json';
import storiesHe from '@/public/locales/he/stories.json';
import storiesEn from '@/public/locales/en/stories.json';
import storyHe from '@/public/locales/he/story.json';
import storyEn from '@/public/locales/en/story.json';
import dashboardHe from '@/public/locales/he/dashboard.json';
import dashboardEn from '@/public/locales/en/dashboard.json';
import jewelryHe from '@/public/locales/he/jewelry.json';
import jewelryEn from '@/public/locales/en/jewelry.json';
import validationHe from '@/public/locales/he/validation.json';
import validationEn from '@/public/locales/en/validation.json';
import checkoutHe from '@/public/locales/he/checkout.json';
import checkoutEn from '@/public/locales/en/checkout.json';

const resources = {
  he: {
    common: commonHe,
    auth: authHe,
    stories: storiesHe,
    story: storyHe,
    dashboard: dashboardHe,
    jewelry: jewelryHe,
    validation: validationHe,
    checkout: checkoutHe,
  },
  en: {
    common: commonEn,
    auth: authEn,
    stories: storiesEn,
    story: storyEn,
    dashboard: dashboardEn,
    jewelry: jewelryEn,
    validation: validationEn,
    checkout: checkoutEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    ns: ['common', 'auth', 'stories', 'story', 'dashboard', 'jewelry', 'validation', 'checkout'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
