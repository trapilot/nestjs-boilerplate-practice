import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enCommon from './locales/en/common.json'
import viCommon from './locales/vi/common.json'
import enModule from './locales/en/module.json'
import viModule from './locales/vi/module.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        common: enCommon,
        module: enModule,
      },
      vi: {
        common: viCommon,
        module: viModule,
      },
    },
  })

export default i18n
