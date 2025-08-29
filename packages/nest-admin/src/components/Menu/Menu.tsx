import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SUBJECT_TO_PATH } from '../../constants/permissions'
import { useUser } from '../../contexts/UserContext'

interface MenuItem {
  key: string
  title: string
  path: string
  group: boolean
  children?: MenuItem[]
}

export function Menu() {
  const { user } = useUser()
  const location = useLocation()
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  const getPathForSubject = (subject: string): string => {
    return SUBJECT_TO_PATH[subject as keyof typeof SUBJECT_TO_PATH] || ''
  }

  const isActive = (path: string): boolean => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!user?.permissions) return []

    const items: MenuItem[] = []

    user.permissions.forEach((permission) => {
      const key = `${permission.context}::${permission.title}`
      const visibleSubjects = (permission.subjects || []).filter((s) => s.isVisible)
      if (visibleSubjects.length === 0) return

      const children: MenuItem[] = []
      visibleSubjects.forEach((subject) => {
        const path = getPathForSubject(subject.subject)
        if (path) {
          children.push({
            key: `${key}::${subject.subject}`,
            title: subject.title,
            path,
            group: false,
          })
        }
      })

      if (permission.group) {
        if (children.length > 0) {
          items.push({ key, title: permission.title, path: '', group: true, children })
        }
      } else {
        const first = children[0]
        if (first) {
          items.push({ key, title: permission.title, path: first.path, group: false })
        }
      }
    })

    return items
  }, [user])

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (menuItems.length === 0) {
    return <div>No menu items available</div>
  }

  return (
    <nav style={{ padding: '1rem' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {menuItems.map((item) => {
          if (!item.group) {
            return (
              <li key={item.key} style={{ marginBottom: '0.5rem' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    color: isActive(item.path) ? '#007bff' : '#666',
                    background: 'transparent',
                    backgroundColor: isActive(item.path) ? '#f1f3f5' : 'transparent',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </Link>
              </li>
            )
          }

          const hasActiveChild = (item.children || []).some((c) => isActive(c.path))
          const isOpen = openMap[item.key] ?? hasActiveChild

          return (
            <li key={item.key} style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                }}
              >
                <span>{item.title}</span>
                <span style={{ fontSize: '0.9rem' }}>{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && item.children && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginLeft: '0.5rem' }}>
                  {item.children.map((child) => (
                    <li key={child.key} style={{ marginBottom: '0.25rem' }}>
                      <Link
                        to={child.path}
                        style={{
                          display: 'block',
                          padding: '0.5rem 0.75rem',
                          textDecoration: 'none',
                          color: isActive(child.path) ? '#007bff' : '#333',
                          backgroundColor: isActive(child.path) ? '#f8f9fa' : 'transparent',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                        }}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
