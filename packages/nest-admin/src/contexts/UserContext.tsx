import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import {
  getAccessToken,
  removeTokens,
  setAccessToken,
  setRefreshToken,
} from '../hooks/useAuthToken'
import { authenticationService } from '../services/authentication.service'

export interface Permission {
  group: boolean
  title: string
  context: string
  subjects: Array<{
    title: string
    context: string
    subject: string
    isVisible: boolean
    actions: string[]
  }>
}

export interface UserProfile {
  id: number
  email: string
  phone: string | null
  name: string | null
  address: string | null
  avatar: string | null
  loginDate: string
  createdAt: string
  roleId: number
  roleLv: number
  permissions: Permission[]
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  hasPermission: (subject: string, action: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      const profile = await authenticationService.me()
      setUser(profile)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Failed to fetch profile')
      removeTokens()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Login and get tokens
      const loginResult = await authenticationService.login({ email, password })

      // Store tokens
      if (loginResult.accessToken) {
        setAccessToken(loginResult.accessToken)
      }
      if (loginResult.refreshToken) {
        setRefreshToken(loginResult.refreshToken)
      }

      // Fetch profile with new token
      await refreshProfile()
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeTokens()
    setUser(null)
    setError(null)
  }

  const hasPermission = (subject: string, action: string): boolean => {
    if (!user?.permissions) return false

    return user.permissions.some((permission) =>
      permission.subjects.some(
        (subjectItem) => subjectItem.subject === subject && subjectItem.actions.includes(action),
      ),
    )
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshProfile,
        hasPermission,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
