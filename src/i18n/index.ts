import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import commonEn from './locales/en/common.json';
import commonFr from './locales/fr/common.json';
import assessmentEn from './locales/en/assessment.json';
import assessmentFr from './locales/fr/assessment.json';
import authEn from './locales/en/auth.json';
import authFr from './locales/fr/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardFr from './locales/fr/dashboard.json';
import navigationEn from './locales/en/navigation.json';
import navigationFr from './locales/fr/navigation.json';

const resources = {
  en: {
    common: commonEn,
    assessment: assessmentEn,
    auth: authEn,
    dashboard: dashboardEn,
    navigation: navigationEn,
  },
  fr: {
    common: commonFr,
    assessment: assessmentFr,
    auth: authFr,
    dashboard: dashboardFr,
    navigation: navigationFr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default fallback
    lng: 'fr', // Force French as initial language
    debug: false,

    // Language detection options - prioritize French
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    defaultNS: 'common',
    ns: ['common', 'assessment', 'auth', 'dashboard', 'navigation'],
  });

export default i18n;
