import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { useUser } from '../contexts/UserContext'
import ApiKeysEdit from '../pages/ApiKeys/Edit'
import ApiKeysList from '../pages/ApiKeys/List'
import ApiKeysView from '../pages/ApiKeys/View'
import AppVersionsList from '../pages/AppVersions/List'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import FactsList from '../pages/Facts/List'
import InvoicesList from '../pages/Invoices/List'
import MediaList from '../pages/Media/List'
import MemberNotificationsList from '../pages/MemberNotifications/List'
import MemberPointsList from '../pages/MemberPoints/List'
import MemberRedemptionsList from '../pages/MemberRedemptions/List'
import MembersList from '../pages/Members/List'
import MemberTiersList from '../pages/MemberTiers/List'
import NotificationsList from '../pages/Notifications/List'
import OrdersList from '../pages/Orders/List'
import ProductBrandsList from '../pages/ProductBrands/List'
import ProductCategoriesList from '../pages/ProductCategories/List'
import ProductReviewsList from '../pages/ProductReviews/List'
import ProductsList from '../pages/Products/List'
import RolesList from '../pages/Roles/List'
import TiersList from '../pages/Tiers/List'
import UsersList from '../pages/Users/List'
import { Login } from '../pages/Users/Login'

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

  return user ? <Navigate to="/dashboard" replace /> : children
}

export function AppRoutes() {
  const location = useLocation()
  console.log('Current path:', location.pathname)

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="members" element={<MembersList />} />
        <Route path="member-tiers" element={<MemberTiersList />} />
        <Route path="member-points" element={<MemberPointsList />} />
        <Route path="member-redemptions" element={<MemberRedemptionsList />} />
        <Route path="member-notifications" element={<MemberNotificationsList />} />
        <Route path="products" element={<ProductsList />} />
        <Route path="product-brands" element={<ProductBrandsList />} />
        <Route path="product-categories" element={<ProductCategoriesList />} />
        <Route path="product-reviews" element={<ProductReviewsList />} />
        <Route path="roles" element={<RolesList />} />
        <Route path="tiers" element={<TiersList />} />
        <Route path="media" element={<MediaList />} />
        <Route path="facts" element={<FactsList />} />
        <Route path="app-versions" element={<AppVersionsList />} />
        <Route path="notifications" element={<NotificationsList />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="invoices" element={<InvoicesList />} />
        <Route path="api-keys" element={<ApiKeysList />} />
        <Route path="api-keys/:id" element={<ApiKeysView />} />
        <Route path="api-keys/:id/edit" element={<ApiKeysEdit />} />
      </Route>
    </Routes>
  )
}
