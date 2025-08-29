import { useTranslation } from 'react-i18next'

export function LangSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    try {
      localStorage.setItem('language', lng)
    } catch {}
    i18n.changeLanguage(lng)
  }

  return (
    <div>
      <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
        EN
      </button>
      <button onClick={() => changeLanguage('vi')} disabled={i18n.language === 'vi'}>
        VI
      </button>
    </div>
  )
}
