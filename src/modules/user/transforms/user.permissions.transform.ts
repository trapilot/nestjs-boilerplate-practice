import { Transform } from 'class-transformer'
import { AuthAbilityHelper, IAuthUserPermission, IAuthUserTransformer } from 'lib/nest-auth'
import { NestHelper } from 'lib/nest-core'
import { IContextUserPermission, IUserPermission } from '../interfaces'

export function ToUserPermissions(): (target: any, key: string) => void {
  return Transform(({ obj: user, value }: IAuthUserTransformer): IUserPermission[] => {
    // console.log({ ToUserPermissions: user })
    if (user?.pivotRoles !== undefined) {
      const grpContextPermission: IContextUserPermission = {}
      const userPermissions: IAuthUserPermission[] = []
      const userRoles = AuthAbilityHelper.toUserRoles(user)

      for (const userRole of userRoles) {
        const userRolePermissions = userRole?.pivotPermissions ?? []
        for (const userRolePermission of userRolePermissions) {
          const rolePerm = userRolePermission?.permission
          const roleBitwise = userRolePermission?.bitwise ?? 0

          if (roleBitwise && rolePerm && rolePerm.isActive && rolePerm.context) {
            const { context, isActive, isVisible, title, subject, sorting, bitwise } = rolePerm
            userPermissions.push({
              context,
              isActive,
              isVisible,
              sorting,
              subject,
              title: NestHelper.toLocaleValue(title),
              bitwise: roleBitwise & bitwise,
            })
          }
        }
      }

      // sorted
      userPermissions.sort((a, b) => a.sorting - b.sorting)

      // grouped
      for (const userPermission of userPermissions) {
        const { context, isVisible, title, subject, bitwise } = userPermission
        if (!(context in grpContextPermission)) {
          grpContextPermission[context] = {
            group: AuthAbilityHelper.isGroup(context),
            title: NestHelper.toLocaleValue(AuthAbilityHelper.toContext(context)),
            context,
            subjects: [],
          }
        }

        const exist = grpContextPermission[context].subjects.find(
          (data) => data.subject === subject,
        )
        if (exist) {
          exist.actions = NestHelper.toUnique([
            ...exist.actions,
            ...AuthAbilityHelper.toActions(bitwise),
          ])
        } else {
          grpContextPermission[context].subjects.push({
            title,
            context,
            subject,
            isVisible,
            actions: AuthAbilityHelper.toActions(bitwise),
          })
        }
      }
      return Object.values(grpContextPermission)
    }
    return value
  })
}
