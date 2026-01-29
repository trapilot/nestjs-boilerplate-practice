import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useUser } from '../contexts/UserContext'
import { MODULE_ROUTES } from '../mixins/routes'

/**
 * A component to protect routes that require authentication.
 * If the user is not authenticated, they are redirected to the /login page.
 */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useUser()

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

/**
 * A component for public routes that redirects authenticated users.
 */
function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useUser()

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? <Navigate to={MODULE_ROUTES[0].path} replace /> : children
}

export function AppRoutes() {
  const location = useLocation()
  console.log('Current path:', location.pathname)

  return (
    <Routes>
      {/* Public route */}
      <Route
        path={MODULE_ROUTES[1].path}
        element={
          <PublicRoute>
            {MODULE_ROUTES[1].element}
          </PublicRoute>
        }
      />

      {/* Private routes wrapped in the main layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to={MODULE_ROUTES[0].path} replace />} />

        {MODULE_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>
    </Routes>
  )
}
