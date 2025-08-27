import { Transform } from 'class-transformer'
import { IAuthUserTransformer } from '../interfaces'
import { AuthAbilityHelper } from '../utils'

export function ToAuthUserRoles(): (target: any, key: string) => void {
  return Transform(({ obj: user }: IAuthUserTransformer): number[] => {
    // console.log({ ToAuthUserRoles: user })
    return AuthAbilityHelper.toUserRoleIds(user)
  })
}
