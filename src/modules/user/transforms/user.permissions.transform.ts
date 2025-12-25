import { Transform } from 'class-transformer'
import { AppHelper } from 'lib/nest-core'
import { UserAbilityUtil } from 'shared/helpers'
import { UserTransformUtil } from '../helpers'
import {
  IContextUserPermission,
  IUserDataPermission,
  IUserProfilePermission,
  IUserTransformOptions,
} from '../interfaces'

export function ToUserPermissions(): (target: any, key: string) => void {
  return Transform(({ obj: user, value }: IUserTransformOptions): IUserProfilePermission[] => {
    // console.log({ ToUserPermissions: user })
    if (user?.pivotRoles !== undefined) {
      const grpContextPermission: IContextUserPermission = {}
      const userPermissions: IUserDataPermission[] = []
      const userRoles = UserTransformUtil.toValidUserRoles(user)

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
              title: AppHelper.toLocaleValue(title),
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
            group: false,
            title: UserAbilityUtil.toContext(context),
            context,
            subjects: [],
          }
        }

        const exist = grpContextPermission[context].subjects.find(
          (data) => data.subject === subject,
        )
        if (exist) {
          exist.actions = AppHelper.toUnique([
            ...exist.actions,
            ...UserAbilityUtil.toActions(bitwise),
          ])
        } else {
          grpContextPermission[context].subjects.push({
            title,
            context,
            subject,
            isVisible,
            actions: UserAbilityUtil.toActions(bitwise),
          })
          if (!grpContextPermission[context].group) {
            const activeSubjects = grpContextPermission[context].subjects.filter(
              (subject) => subject.isVisible,
            )
            grpContextPermission[context].group = activeSubjects.length > 1
          }
        }
      }
      return Object.values(grpContextPermission)
    }
    return value
  })
}
