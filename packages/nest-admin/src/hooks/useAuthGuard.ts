import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from './useAuthToken'

export function useAuthGuard() {
  const navigate = useNavigate()
  const token = getAccessToken()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate, token])
}

/**
 * Authorization guard by role. Example usage:
 * const hasAccess = useAuthorizationGuard(['admin','manager'])
 */
export function useAuthorizationGuard(allowedRoles?: string[]) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!allowedRoles || allowedRoles.length === 0) return
    try {
      const token = getAccessToken()
      if (!token) return
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      const roles: string[] = payload?.roles || payload?.role ? [payload.role] : []
      const ok = roles.some((r) => allowedRoles.includes(r))
      if (!ok) navigate('/dashboard', { replace: true })
    } catch (e) {
      // If parsing fails, be conservative: redirect
      navigate('/dashboard', { replace: true })
    }
  }, [allowedRoles, navigate])
}
