import { useTranslation } from 'react-i18next'
import { useAuthGuard } from '../../hooks/useAuthGuard'

export function Dashboard() {
  useAuthGuard() // Protect this route
  const { t } = useTranslation('common')
  return (
    <>
      <h2>{t('dashboard')}</h2>
      <p>This is a protected page.</p>
    </>
  )
}
