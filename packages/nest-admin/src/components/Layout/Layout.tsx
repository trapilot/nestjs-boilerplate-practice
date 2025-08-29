import { Outlet } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { Menu } from '../Menu/Menu'
import { LangSwitcher } from '../Switchers/LangSwitcher'

export function Layout() {
  const { logout, user } = useUser()

  const handleLogout = () => {
    logout()
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginLeft: '1rem',
  }

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
  }

  const sidebarStyle: React.CSSProperties = {
    flex: '0 0 250px',
    width: '250px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #dee2e6',
    overflowY: 'auto',
  }

  const mainContentStyle: React.CSSProperties = {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0, // critical so the sidebar doesn't get pushed off-screen
    overflow: 'hidden',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #dee2e6',
    backgroundColor: 'white',
    flex: '0 0 auto',
  }

  const contentStyle: React.CSSProperties = {
    flex: '1 1 auto',
    padding: '2rem',
    overflow: 'auto', // allow tables to scroll inside main
    minWidth: 0,
  }

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>Nest Admin</h2>
        </div>
        <Menu />
      </aside>
      <div style={mainContentStyle}>
        <header style={headerStyle}>
          <div>
            <span>Welcome, {user?.name || user?.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LangSwitcher />
            <button onClick={handleLogout} style={buttonStyle}>
              Logout
            </button>
          </div>
        </header>
        <main style={contentStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
