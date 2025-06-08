import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly for SSR
import commonHe from '@/public/locales/he/common.json';
import commonEn from '@/public/locales/en/common.json';
import authHe from '@/public/locales/he/auth.json';
import authEn from '@/public/locales/en/auth.json';
import storiesHe from '@/public/locales/he/stories.json';
import storiesEn from '@/public/locales/en/stories.json';
import dashboardHe from '@/public/locales/he/dashboard.json';
import dashboardEn from '@/public/locales/en/dashboard.json';

const resources = {
  he: {
    common: commonHe,
    auth: authHe,
    stories: storiesHe,
    dashboard: dashboardHe,
  },
  en: {
    common: commonEn,
    auth: authEn,
    stories: storiesEn,
    dashboard: dashboardEn,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    ns: ['common', 'auth', 'stories', 'dashboard', 'jewelry', 'validation'],
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

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
