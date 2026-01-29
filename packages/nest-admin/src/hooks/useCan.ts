import { useUser } from '../contexts/UserContext'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from '../types/enums'

export function useCan() {
  const { user } = useUser()

  return (subject: EnumAuthAbilitySubject | string, action: EnumAuthAbilityAction): boolean => {
    if (!user?.permissions) return false

    return user.permissions.some((group) =>
      group.subjects?.some(
        (s) =>
          s.subject === subject &&
          s.actions?.includes(action)
      )
    )
  }
}
