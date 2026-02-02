import { UserAbilityUtil } from 'app/helpers/user.ability.util'
import { Transform } from 'class-transformer'
import { TPermission } from '../interfaces/permission.interface'

export function ToPermissionActions(): (target: object, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return UserAbilityUtil.map2Actions(obj.bitwise)
  })
}
