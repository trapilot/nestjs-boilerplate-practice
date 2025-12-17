import { Transform } from 'class-transformer'
import { AuthAbilityContext, IAuthPayloadPermission } from 'lib/nest-auth'
import { IUserTransformOptions } from '../interfaces'
import { UserTransformUtil } from '../helpers'

export function ToUserPayloadRoles(): (target: any, key: string) => void {
  return Transform(({ obj: user }: IUserTransformOptions): number[] => {
    // console.log({ ToAuthUserRoles: user })
    return UserTransformUtil.toValidUserRoleIds(user)
  })
}

export function ToUserPayloadPermissions(): (target: any, key: string) => void {
  return Transform(({ obj: user }: IUserTransformOptions): IAuthPayloadPermission => {
    // console.log({ ToAuthUserPermissions: user })
    const { subjects } = AuthAbilityContext.getConfig()
    const userRoles = UserTransformUtil.toValidUserRoles(user)
    const userPermissions = {}

    for (const userRole of userRoles) {
      const rolePermissions = userRole?.pivotPermissions ?? []
      for (const rolePermission of rolePermissions) {
        const rolePerm = rolePermission?.permission
        const roleBit = rolePermission?.bitwise ?? 0
        const permBit = rolePerm?.bitwise ?? 0

        if (roleBit && permBit && rolePerm.isActive && subjects.includes(rolePerm.subject)) {
          const subjectIndex = subjects.findIndex((subject) => subject === rolePerm.subject)
          userPermissions[subjectIndex] |= roleBit & permBit
        }
      }
    }
    return userPermissions
  })
}
