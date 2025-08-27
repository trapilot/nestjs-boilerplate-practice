import { Transform } from 'class-transformer'
import { IAuthJwtPermission, IAuthUserTransformer } from '../interfaces'
import { AuthAbilityHelper } from '../utils'

export function ToAuthUserPermissions(): (target: any, key: string) => void {
  return Transform(({ obj: user }: IAuthUserTransformer): IAuthJwtPermission => {
    // console.log({ ToAuthUserPermissions: user })
    const subjects: string[] = AuthAbilityHelper.getSubjects()
    const userRoles = AuthAbilityHelper.toUserRoles(user)
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
