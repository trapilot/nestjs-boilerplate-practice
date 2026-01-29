import { useTranslation } from 'react-i18next'

export function LangSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = async (lng: string) => {
    try {
      localStorage.setItem('language', lng)
      await i18n.changeLanguage(lng)
      window.location.reload()
    } catch (err) {
      console.error('Failed to change language', err)
    }
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
