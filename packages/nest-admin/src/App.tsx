import { AppRoutes } from './config/routes'
import { UserProvider } from './contexts/UserContext'

export function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}
