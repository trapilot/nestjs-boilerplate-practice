import { Transform } from 'class-transformer'
import { LocaleUtil } from 'lib/nest-core'
import { UserAbilityUtil } from 'shared/helpers'
import { IRoleResponseTransform, TRole } from '../interfaces'

export function ToRolePermissions(): (target: object, key: string) => void {
  return Transform(({ obj: role }: { obj: TRole }): IRoleResponseTransform[] => {
    // console.log({ ToRolePermissions: role })
    if (role?.fullPermissions !== undefined) {
      const mappedPermissions: Record<string, IRoleResponseTransform> = {}
      const rolesPermissions = role?.pivotPermissions ?? []
      const fullPermissions = role?.fullPermissions ?? []
      for (const perm of fullPermissions) {
        const rolePerm = rolesPermissions.find(p => p.permissionId === perm.id)
        const roleBit = rolePerm?.bitwise ?? 0
        if (perm.isActive && perm.context) {
          const { context, subject, title, bitwise } = perm
          if (!(subject in mappedPermissions)) {
            mappedPermissions[subject] = {
              title: LocaleUtil.parseValue(title),
              context,
              subject,
              actions: [],
            }
          }

          const actions = UserAbilityUtil.toActions(bitwise)
          for (const action of actions) {
            mappedPermissions[subject].actions.push({
              [action]: (roleBit & UserAbilityUtil.toBitwise([action])) > 0,
            })
          }
        }
      }
      return Object.values(mappedPermissions)
    }
  })
}
