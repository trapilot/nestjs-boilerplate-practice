import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const LANGUAGES = ['en', 'vi']
const NAMESPACES = ['common', 'module']

const MODULES = import.meta.glob('./locales/*/*.json', { eager: true })
function loadResources() {
  const resources: Record<string, any> = {}

  Object.entries(MODULES).forEach(([path, module]) => {
    const [, lang, file] = path.match(/\.\/locales\/(.*?)\/(.*?).json/)!
    const ns = file.replace('.json', '')

    resources[lang] ??= {}
    resources[lang][ns] = (module as any).default
  })

  return resources
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: LANGUAGES[0],
    supportedLngs: LANGUAGES,
    ns: NAMESPACES,
    defaultNS: NAMESPACES[0],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator'],
      caches: [],
    },
    load: 'all',
    resources: loadResources(),
  })

export default i18n
