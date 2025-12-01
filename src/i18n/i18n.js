import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en/translation.json';
import ar from '../locales/ar/translation.json';

// Get device language synchronously for initial setup
const getDeviceLanguage = () => {
  try {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    return deviceLanguage === 'ar' ? 'ar' : 'en';
  } catch (error) {
    return 'en';
  }
};

// Initialize i18next synchronously
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language preference asynchronously after initialization
AsyncStorage.getItem('userLanguage').then((savedLanguage) => {
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
    i18n.changeLanguage(savedLanguage);
  }
}).catch(() => {
  // Ignore errors
});

export default i18n;

