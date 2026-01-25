import { UserAbilityUtil } from 'app/helpers'
import { Transform } from 'class-transformer'
import { TPermission } from '../interfaces'

export function ToPermissionActions(): (target: object, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return UserAbilityUtil.map2Actions(obj.bitwise)
  })
}
