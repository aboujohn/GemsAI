module.exports = {
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: {
    default: ['en'],
    he: ['en'],
  },
  ns: ['common', 'auth', 'stories', 'story', 'dashboard', 'jewelry', 'validation', 'checkout'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  localePath:
    typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  keySeparator: '.',
  nsSeparator: ':',
};
