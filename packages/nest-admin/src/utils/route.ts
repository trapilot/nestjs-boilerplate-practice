import { components } from '../types/api'

export type UserProfile = components['schemas']['UserProfileResponseDto']

export interface MenuItem {
  key: string
  title: string
  path: string
  group: boolean
  children?: MenuItem[]
}

export function generateMenuItems(
  permissions: UserProfile['permissions']
): MenuItem[] {
  if (!permissions) return []

  const items: MenuItem[] = []

  permissions.forEach((permission) => {
    const key = `${permission.context}::${permission.title}`

    const visibleSubjects = (permission.subjects || []).filter(
      (s) =>
        s.isVisible &&
        Array.isArray(s.actions) &&
        s.actions.includes('read') &&
        s.path
    )

    if (visibleSubjects.length === 0) return
    const children: MenuItem[] = visibleSubjects.map((s) => ({
      key: `${key}::${s.subject}`,
      title: s.title,
      path: '/' + s.path.replace(/^\/+/, '') + (s.subject === 'DASHBOARD' ? '' : '/list'),
      group: false,
    }))

    if (permission.group) {
      items.push({
        key,
        title: permission.title,
        path: '',
        group: true,
        children,
      })
    } else {
      items.push({
        key,
        title: permission.title,
        path: children[0].path,
        group: false,
      })
    }
  })

  return items
}
