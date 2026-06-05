import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { STORAGE_KEYS } from '../../shared/constants/storage-key';
import { translationResources } from './translations';

const storedLanguage =
  typeof window !== 'undefined'
    ? window.localStorage.getItem(STORAGE_KEYS.LANGUAGE)
    : null;

const resolvedLanguage =
  storedLanguage === 'en' || storedLanguage === 'zh-CN' ? storedLanguage : 'en';

void i18n.use(initReactI18next).init({
  resources: translationResources,
  lng: resolvedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }
});

export { i18n };
