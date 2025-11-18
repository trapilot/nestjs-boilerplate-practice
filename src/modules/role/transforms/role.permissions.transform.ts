import { Transform } from 'class-transformer'
import { AuthAbilityHelper } from 'lib/nest-auth'
import { AppHelper } from 'lib/nest-core'
import { TRole } from '../interfaces'

export function ToRolePermissions(): (target: any, key: string) => void {
  return Transform(({ obj: role, value }: { obj: TRole; value: any }) => {
    // console.log({ ToRolePermissions: role })
    if (role?.fullPermissions !== undefined) {
      const mappedPermissions = {}
      const rolesPermissions = role?.pivotPermissions ?? []
      const fullPermissions = role?.fullPermissions ?? []
      for (const perm of fullPermissions) {
        const rolePerm = rolesPermissions.find((p) => p.permissionId === perm.id)
        const roleBit = rolePerm?.bitwise ?? 0
        if (perm.isActive && perm.context) {
          const { context, subject, title, bitwise } = perm
          if (!(subject in mappedPermissions)) {
            mappedPermissions[subject] = {
              title: AppHelper.toLocaleValue(title),
              context,
              subject,
              actions: [],
            }
          }

          const actions = AuthAbilityHelper.toActions(bitwise)
          for (const action of actions) {
            mappedPermissions[subject].actions.push({
              [action]: (roleBit & AuthAbilityHelper.toBitwise([action])) > 0,
            })
          }
        }
      }
      return Object.values(mappedPermissions)
    }
    return value
  })
}
