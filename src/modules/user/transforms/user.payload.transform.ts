import { Transform } from 'class-transformer'
import { AuthContext, IAuthPayloadPermission } from 'lib/nest-auth'
import { UserUtil } from '../helpers'
import { IUserTransformOptions } from '../interfaces'

export function ToUserPayloadRoles(): (target: object, key: string) => void {
  return Transform(({ obj: user }: IUserTransformOptions): number[] => {
    // console.log({ ToAuthUserRoles: user })
    return UserUtil.parseRoleIds(user)
  })
}

export function ToUserPayloadPermissions(): (target: object, key: string) => void {
  return Transform(({ obj: user }: IUserTransformOptions): IAuthPayloadPermission => {
    // console.log({ ToAuthUserPermissions: user })
    const { subjects } = AuthContext.getConfig()
    const userRoles = UserUtil.parseRoles(user)
    const userPermissions = {}

    for (const userRole of userRoles) {
      const rolePermissions = userRole?.pivotPermissions ?? []
      for (const rolePermission of rolePermissions) {
        const rolePerm = rolePermission?.permission
        const roleBit = rolePermission?.bitwise ?? 0
        const permBit = rolePerm?.bitwise ?? 0

        if (roleBit && permBit && rolePerm.isActive && subjects.includes(rolePerm.subject)) {
          const subjectIndex = subjects.findIndex(subject => subject === rolePerm.subject)
          userPermissions[subjectIndex] |= roleBit & permBit
        }
      }
    }
    return userPermissions
  })
}
