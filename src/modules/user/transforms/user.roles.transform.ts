import { plainToInstance, Transform } from 'class-transformer'
import { RoleResponseBelongDto } from 'modules/role/dtos'
import { IUserRoleTransformOptions, IUserTransformOptions } from '../interfaces'
import { UserUtil } from '../utils'

export function ToUserRoles(
  options?: IUserRoleTransformOptions,
): (target: any, key: string) => void {
  return Transform(({ obj: user, value }: IUserTransformOptions) => {
    // console.log({ ToUserRoles: user })
    if (user?.pivotRoles !== undefined) {
      const userRoles = UserUtil.parseRoles(user)

      if (options?.key) {
        const userRoleIds = userRoles.map((role) => role.id)
        return options?.flat ? userRoleIds[0] : userRoleIds
      }
      if (options?.level) {
        const userRoleCodes = userRoles.map((role) => role.level)
        return options?.flat ? userRoleCodes[0] : userRoleCodes
      }

      return plainToInstance(RoleResponseBelongDto, options?.flat ? userRoles?.[0] : userRoles, {
        excludeExtraneousValues: true,
      })
    }
    return value
  })
}
